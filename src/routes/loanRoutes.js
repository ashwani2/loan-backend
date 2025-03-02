const express = require("express");
const {
  createLoan,
  getLoans,
  bulkInsertLoans,
  exportLoans
} = require("../controllers/loanController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/", createLoan);
router.post("/bulk", bulkInsertLoans);

router.get("/", authMiddleware, getLoans);
router.get("/export", authMiddleware, exportLoans);


module.exports = router;
