const Loan = require("../models/loanModel");
const XLSX = require("xlsx");

// Create Loan Query
exports.createLoan = async (req, res) => {
  try {
    const { fullname, phoneNumber, emailAddress, loanAmount } = req.body;
    const newLoan = new Loan({
      fullname,
      phoneNumber,
      emailAddress,
      loanAmount,
    });
    await newLoan.save();
    res.status(201).json({ message: "Loan request submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Bulk Insert Loans
exports.bulkInsertLoans = async (req, res) => {
  try {
    const loans = req.body.loans;
    await Loan.insertMany(loans);
    res
      .status(201)
      .json({ message: "Bulk loan requests submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Loan Queries with Pagination and Date Filtering
exports.getLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10, from, to } = req.query;

    const query = {};

    if (from && to) {
      query.createdAt = {
        $gte: new Date(from), 
        $lte: new Date(new Date(to).setUTCHours(23, 59, 59, 999)) // Extend to end of day
      };
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
    const { from, to } = req.query;

    const query = {};
     if (from && to) {
      query.createdAt = {
        $gte: new Date(from), 
        $lte: new Date(new Date(to).setUTCHours(23, 59, 59, 999)) // Extend to end of day
      };
    }

    const loans = await Loan.find(query).lean(); // Get all loans (no pagination)

    // Convert loans to Excel
    const formattedLoans = loans.map((loan) => ({
      "Full Name": loan.fullname,
      "Phone Number": loan.phoneNumber,
      "Email Address": loan.emailAddress,
      "Loan Amount": loan.loanAmount,
      "Created At": new Date(loan.createdAt).toLocaleString(),
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
