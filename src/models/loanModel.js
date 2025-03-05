const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    pincode: { type: Number, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    emailAddress: { type: String, required: true, unique: true },
    loanAmount: { type: Number, required: true },
    loanType: { 
      type: String, 
      required: true,
      enum: ["Credit Card", "Business Loan", "Home Loan", "Gold Loan"] 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
