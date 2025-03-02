const Loan = require("../models/loanModel");

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
    res.status(201).json({ message: "Bulk loan requests submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Loan Queries with Pagination
exports.getLoans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const loans = await Loan.find().skip(skip).limit(limit);
    const total = await Loan.countDocuments();

    res.json({ loans, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
