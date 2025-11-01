import express from "express";
import { authMiddleware, adminOnly } from "../middleware/auth.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Admin adds money to user's account
router.post("/add-funds", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { toMobile, amount } = req.body;
    if (!toMobile || !amount) return res.status(400).json({ message: "toMobile and amount required" });
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ message: "Invalid amount" });

    const toUser = await User.findOne({ mobile: toMobile });
    if (!toUser) return res.status(404).json({ message: "Recipient not found" });

    toUser.balance += amt;
    await toUser.save();

    const tx = new Transaction({ from: req.user._id, to: toUser._id, amount: amt, type: "admin_credit" });
    await tx.save();

    res.json({ message: "Funds added", userBalance: toUser.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
