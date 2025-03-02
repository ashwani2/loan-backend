const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String, required: true, unique: true },
    loanAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
