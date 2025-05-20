const XLSX = require("xlsx");
const axios = require("axios");
const https = require("https");
const Loan = require("../models/loanModel");

// Create an HTTPS agent that disables SSL certificate validation
const agent = new https.Agent({
  rejectUnauthorized: false, // ⚠️ Disables SSL cert validation (TEMPORARY ONLY)
});
// Create Loan Query

exports.createLoan = async (req, res) => {
  try {
    const {
      fullname,
      phoneNumber,
      pincode,
      emailAddress,
      loanAmount,
      loanType,
    } = req.body;

    // Fetch City and State from Pincode API
    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { httpsAgent: agent } // Use the custom agent here
    );

    // Check if response is valid
    if (
      response.data &&
      Array.isArray(response.data) &&
      response.data[0].Status === "Success"
    ) {
      const { District: city, State: state } = response.data[0].PostOffice[0];

      // Create new loan request with city and state
      const newLoan = new Loan({
        fullname,
        phoneNumber,
        pincode,
        loanType,
        emailAddress,
        loanAmount,
        city,
        state,
      });

      await newLoan.save();

      res.status(201).json({
        message: "Loan request submitted successfully",
        city,
        state,
      });
    } else {
      res.status(400).json({ message: "Invalid Pincode" });
    }
  } catch (error) {
    console.error("Error fetching city/state:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Bulk Insert Loans
exports.bulkInsertLoans = async (req, res) => {
  try {
    const loans = req.body.loans;

    // Validate that each loan has the required fields
    if (!Array.isArray(loans) || loans.length === 0) {
      return res.status(400).json({ message: "Invalid loan data provided" });
    }

    const validLoanTypes = [
      "Credit Card",
      "Business Loan",
      "Home Loan",
      "Gold Loan",
    ];

    for (const loan of loans) {
      if (
        !loan.fullname ||
        !loan.phoneNumber ||
        !loan.pincode ||
        !loan.state ||
        !loan.city ||
        !loan.emailAddress ||
        !loan.loanAmount ||
        !loan.loanType ||
        !validLoanTypes.includes(loan.loanType)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid loan format in request data" });
      }
    }

    await Loan.insertMany(loans);
    res
      .status(201)
      .json({ message: "Bulk loan requests submitted successfully" });
  } catch (error) {
    console.error("Error in bulkInsertLoans:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Loan Queries with Pagination and Date Filtering
exports.getLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10, from, to, loanType } = req.query;

    const query = {};

    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setUTCHours(23, 59, 59, 999)), // Extend to end of day
      };
    }
    if (loanType) {
      query.loanType = loanType;
    }

    const totalLoans = await Loan.countDocuments(query); // Count total records
    const loans = await Loan.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      loans,
      totalPages: Math.ceil(totalLoans / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Export Loans as Excel
exports.exportLoans = async (req, res) => {
  try {
    const { from, to, loanType } = req.query;

    const query = {};
    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setUTCHours(23, 59, 59, 999)), // Extend to end of day
      };
    }
    if (loanType) {
      query.loanType = loanType;
    }

    const loans = await Loan.find(query).lean(); // Get all loans (no pagination)

    // Convert loans to Excel
    const formattedLoans = loans.map((loan) => ({
      "Full Name": loan.fullname,
      "Phone Number": loan.phoneNumber,
      "Email Address": loan.emailAddress,
      type: loan.loanType,
      Pincode: loan.pincode,
      City: loan.city,
      State: loan.state,
      "Loan Amount": loan.loanAmount,
      "Created Time": new Date(loan.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedLoans);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Queries");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="loan_queries.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
