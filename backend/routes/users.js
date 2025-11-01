import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Get list of all users (for dashboard display)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // exclude password
    const users = await User.find().select("-password").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send money from logged-in user to another user
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const fromUser = req.user;
    const { toMobile, amount } = req.body;

    if (!toMobile || !amount) return res.status(400).json({ message: "toMobile and amount required" });
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ message: "Invalid amount" });

    const toUser = await User.findOne({ mobile: toMobile });
    if (!toUser) return res.status(404).json({ message: "Recipient not found" });

    if (fromUser._id.equals(toUser._id)) return res.status(400).json({ message: "Can't send to yourself" });

    // Refresh sender from DB to get latest balance
    const sender = await User.findById(fromUser._id);
    if (sender.balance < amt) return res.status(400).json({ message: "Insufficient balance" });

    sender.balance -= amt;
    toUser.balance += amt;

    await sender.save();
    await toUser.save();

    const tx = new Transaction({ from: sender._id, to: toUser._id, amount: amt, type: "transfer" });
    await tx.save();

    res.json({ message: "Transfer successful", senderBalance: sender.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
