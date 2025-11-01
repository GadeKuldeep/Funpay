import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

await connectDB(MONGO_URI);

// Ensure admin user exists (based on ADMIN_MOBILE, ADMIN_PASSWORD env)
const ensureAdmin = async () => {
  const mobile = process.env.ADMIN_MOBILE;
  const pass = process.env.ADMIN_PASSWORD;
  if (mobile && pass) {
    let admin = await User.findOne({ mobile });
    if (!admin) {
      const hashed = await bcrypt.hash(pass, 10);
      admin = new User({ name: "Admin", mobile, password: hashed, balance: 0, isAdmin: true });
      await admin.save();
      console.log("Admin user created:", mobile);
    } else {
      if (!admin.isAdmin) {
        admin.isAdmin = true;
        await admin.save();
        console.log("Promoted existing user to admin:", mobile);
      }
    }
  } else {
    console.warn("ADMIN_MOBILE or ADMIN_PASSWORD not set; no admin created.");
  }
};
await ensureAdmin();

app.get("/", (req, res) => res.send("Payment clone backend is running"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
