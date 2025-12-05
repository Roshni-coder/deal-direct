import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Create transporter lazily to ensure env vars are loaded
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    console.log("📧 Initializing SMTP transporter...");
    console.log("   SMTP_USER:", process.env.SMTP_USER ? "✓ Set" : "✗ Missing");
    console.log("   SMTP_PASS:", process.env.SMTP_PASS ? "✓ Set" : "✗ Missing");
    console.log("   SENDER_EMAIL:", process.env.SENDER_EMAIL ? "✓ Set" : "✗ Missing");
    
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ SMTP Connection Error:", error.message);
      } else {
        console.log("✅ SMTP Server is ready to send emails");
      }
    });
  }
  return transporter;
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email helper function
const sendOTPEmail = async (email, otp, name = "User") => {
  const mailOptions = {
    from: `"DealDirect" <${process.env.SENDER_EMAIL || process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "🔐 DealDirect - Verify Your Email",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">DealDirect</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Your Trusted Real Estate Partner</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin: 0 0 20px;">Hello ${name}! 👋</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            Thank you for registering with DealDirect. Please use the following OTP to verify your email address:
          </p>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">Your One-Time Password</p>
            <div style="font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 25px 0 0;">
            ⏰ This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
            If you didn't request this verification, please ignore this email.<br>
            © ${new Date().getFullYear()} DealDirect. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Hello ${name}!\n\nYour OTP for DealDirect registration is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
  };

  return getTransporter().sendMail(mailOptions);
};

// ✅ Register User (Step 1: Send OTP) - For owners who need verification
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
    // Set role - owner if specified, otherwise user
    const normalizedRole = role === "owner" ? "owner" : role === "agent" ? "agent" : "user";

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
    try {
      await sendOTPEmail(email, otp, name);
      console.log("✅ OTP Email sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Error sending OTP email:", emailError.message);
      // Still allow registration but warn about email
      return res.status(200).json({
        message: "Registration initiated. OTP: Check console (email service issue).",
        email: email,
        devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    }

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      email: email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Register User Directly (For Buyers - No OTP Required)
export const registerUserDirect = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "User already exists. Please login." });
      } else {
        // If unverified user exists, they might be trying to re-register
        // Delete the old unverified account
        await User.deleteOne({ _id: existingUser._id });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create verified user directly (buyers don't need OTP)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // Buyers are always "user" role
      isVerified: true, // Auto-verify buyers
    });

    // Generate Token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Buyer registered directly (no OTP):", email);

    res.status(201).json({
      message: "Registration successful! Welcome to DealDirect.",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified. Please login." });
    }

    // Generate new OTP
    const otp = generateOTP();
    console.log("Resent OTP for " + email + ":", otp);
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP Email
    try {
      await sendOTPEmail(email, otp, user.name);
      console.log("✅ OTP resent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Error resending OTP email:", emailError.message);
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    res.status(200).json({
      message: "New OTP sent to your email.",
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
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
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
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
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

// ✅ Get User Profile
export const getProfile = async (req, res) => {
  try {
    // Handle env-based users (agent/owner)
    if (req.user?.isEnvAgent || req.user?.isEnvOwner) {
      return res.status(200).json({
        message: "Profile fetched successfully",
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isEnvUser: true,
        },
      });
    }

    const user = await User.findById(req.user._id).select("-password -otp -otpExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        alternatePhone: user.alternatePhone,
        address: user.address,
        profileImage: user.profileImage,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bio: user.bio,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};

// ✅ Update User Profile
export const updateProfile = async (req, res) => {
  try {
    // Prevent env-based users from updating profile
    if (req.user?.isEnvAgent || req.user?.isEnvOwner) {
      return res.status(403).json({ message: "Cannot update profile for system users" });
    }

    const userId = req.user._id;
    const {
      name,
      phone,
      alternatePhone,
      address,
      dateOfBirth,
      gender,
      bio,
      preferences,
    } = req.body;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (alternatePhone !== undefined) updateData.alternatePhone = alternatePhone;
    
    // Parse address if it's a JSON string (from FormData)
    if (address) {
      updateData.address = typeof address === 'string' ? JSON.parse(address) : address;
    }
    
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    
    // Parse preferences if it's a JSON string (from FormData)
    if (preferences) {
      updateData.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
    }

    // Handle profile image if uploaded via Cloudinary
    if (req.file) {
      // Cloudinary returns path or secure_url depending on storage config
      updateData.profileImage = req.file.path || req.file.secure_url || req.file.url;
      console.log("📸 Profile image uploaded:", updateData.profileImage);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        alternatePhone: updatedUser.alternatePhone,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        bio: updatedUser.bio,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};

// ✅ Change Password
export const changePassword = async (req, res) => {
  try {
    if (req.user?.isEnvAgent || req.user?.isEnvOwner) {
      return res.status(403).json({ message: "Cannot change password for system users" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
};

// ✅ Send Upgrade OTP (For buyers who want to become owners)
export const sendUpgradeOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already an owner
    if (user.role === "owner") {
      return res.status(400).json({ message: "You are already registered as a property owner" });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log("Upgrade OTP for " + email + ":", otp);
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP Email
    try {
      await sendUpgradeOTPEmail(email, otp, user.name);
      console.log("✅ Upgrade OTP sent to:", email);
    } catch (emailError) {
      console.error("❌ Error sending upgrade OTP:", emailError.message);
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    res.status(200).json({
      message: "Verification OTP sent to your email",
      email: email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Verify Upgrade OTP (Upgrade buyer to owner)
export const verifyUpgradeOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "owner") {
      return res.status(400).json({ message: "You are already a property owner" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Upgrade user to owner
    user.role = "owner";
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate new token with updated role
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ User upgraded to owner:", email);

    res.status(200).json({
      message: "Email verified! You can now list properties.",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send Upgrade OTP Email helper function
const sendUpgradeOTPEmail = async (email, otp, name = "User") => {
  const mailOptions = {
    from: `"DealDirect" <${process.env.SENDER_EMAIL || process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "🏠 DealDirect - Verify to List Your Property",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">DealDirect</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Property Owner Verification</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin: 0 0 20px;">Hello ${name}! 🏠</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            You're one step away from listing your property on DealDirect! Please verify your email to become a property owner.
          </p>
          
          <div style="background: #eff6ff; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; border: 1px solid #bfdbfe;">
            <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px; font-weight: 600;">Your Verification Code</p>
            <div style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 25px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>🎉 Benefits of becoming an owner:</strong><br>
              • List unlimited properties for free<br>
              • Connect directly with genuine buyers<br>
              • Access owner dashboard & analytics
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 25px 0 0;">
            ⏰ This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
            If you didn't request this verification, please ignore this email.<br>
            © ${new Date().getFullYear()} DealDirect. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Hello ${name}!\n\nYour verification code to become a property owner on DealDirect is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
  };

  return getTransporter().sendMail(mailOptions);
};

// Send Password Reset OTP Email helper function
const sendPasswordResetOTPEmail = async (email, otp, name = "User") => {
  const mailOptions = {
    from: `"DealDirect" <${process.env.SENDER_EMAIL || process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "🔑 DealDirect - Reset Your Password",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">DealDirect</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Password Reset Request</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin: 0 0 20px;">Hello ${name}! 🔐</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            We received a request to reset your password. Use the following OTP to reset your password:
          </p>
          
          <div style="background: #fef2f2; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; border: 1px solid #fecaca;">
            <p style="color: #991b1b; font-size: 14px; margin: 0 0 10px; font-weight: 600;">Your Reset Code</p>
            <div style="font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 25px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>⚠️ Security Notice:</strong><br>
              • Never share this code with anyone<br>
              • DealDirect staff will never ask for this code<br>
              • If you didn't request this, your account is still secure
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 25px 0 0;">
            ⏰ This OTP is valid for <strong>10 minutes</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
            If you didn't request a password reset, please ignore this email.<br>
            © ${new Date().getFullYear()} DealDirect. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Hello ${name}!\n\nYour password reset OTP for DealDirect is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
  };

  return getTransporter().sendMail(mailOptions);
};

// ✅ Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        message: "If an account exists with this email, you will receive a password reset OTP.",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "This account is not verified. Please complete registration first.",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log("Password Reset OTP for " + email + ":", otp);
    
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP Email
    try {
      await sendPasswordResetOTPEmail(email, otp, user.name);
      console.log("✅ Password reset OTP sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Error sending password reset OTP:", emailError.message);
      return res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
      });
    }

    res.status(200).json({
      message: "Password reset OTP sent to your email.",
      email: email,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ✅ Reset Password - Verify OTP and Update Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({
        message: "No password reset request found. Please request a new OTP.",
      });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetPasswordOtpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    console.log("✅ Password reset successful for:", email);

    res.status(200).json({
      message: "Password reset successful! You can now login with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
