const express = require("express");
const {
  createLoan,
  getLoans,
  bulkInsertLoans,
} = require("../controllers/loanController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/", createLoan);
router.post("/bulk", bulkInsertLoans);

router.get("/", authMiddleware, getLoans);

module.exports = router;
