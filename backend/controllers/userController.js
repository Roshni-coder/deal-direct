import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Ensure these are in your .env
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ Register User (Step 1: Send OTP)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    console.log("Generated OTP for " + email + ":", otp); // For debugging/dev
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role === "agent" ? "agent" : "user";

    if (!user) {
      // Create new unverified user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: normalizedRole,
        otp,
        otpExpires,
        isVerified: false,
      });
    } else {
      // Update existing unverified user
      user.name = name;
      user.password = hashedPassword;
      user.role = normalizedRole;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    }

    // Send OTP Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "DealDirect - Verify Your Email",
      text: `Your OTP for DealDirect registration is: ${otp}. It expires in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        // Don't block response, but log error. In production, might want to handle this better.
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      email: email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Verify OTP (Step 2: Complete Registration)
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified. Please login." });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Verify User
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate Token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Email verified and registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedInputEmail = (email || "").trim().toLowerCase();

    const envAgentEmail = process.env.AGENT_EMAIL;
    const envAgentPassword = process.env.AGENT_PASSWORD;
    const envAgentName = process.env.AGENT_NAME || "DealDirect Agent";
    const normalizedEnvEmail = (envAgentEmail || "").trim().toLowerCase();

    // Check for Agent (Admin)
    if (normalizedEnvEmail && normalizedInputEmail === normalizedEnvEmail) {
      if (!envAgentPassword) {
        return res.status(500).json({ message: "Agent password not configured" });
      }
      if (password !== envAgentPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        {
          id: "env-agent",
          email: envAgentEmail,
          role: "agent",
          isEnvAgent: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: "env-agent",
          name: envAgentName,
          email: envAgentEmail,
          role: "agent",
          createdAt: new Date().toISOString(),
          isEnvAgent: true,
        },
      });
    }

    // Check for Owner (from .env)
    const envOwnerEmail = process.env.OWNER_EMAIL || process.env.DEMO_OWNER_EMAIL;
    const envOwnerPassword = process.env.OWNER_PASSWORD || process.env.DEMO_OWNER_PASSWORD;
    const envOwnerName = process.env.OWNER_NAME || process.env.DEMO_OWNER_NAME || "Property Owner";
    const normalizedEnvOwnerEmail = (envOwnerEmail || "").trim().toLowerCase();

    if (normalizedEnvOwnerEmail && normalizedInputEmail === normalizedEnvOwnerEmail) {
      if (!envOwnerPassword) {
        return res.status(500).json({ message: "Owner password not configured" });
      }
      if (password !== envOwnerPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        {
          id: "env-owner",
          email: envOwnerEmail,
          role: "owner", // Distinct role for owner
          isEnvOwner: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: "env-owner",
          name: envOwnerName,
          email: envOwnerEmail,
          role: "owner",
          createdAt: new Date().toISOString(),
          isEnvOwner: true,
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified. Please register again to verify." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Users (Admin Only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All users fetched successfully",
      count: users.length,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role || "user",
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
};
