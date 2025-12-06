import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "agent", "owner"],
      default: "user",
    },
    // Profile fields
    phone: { type: String },
    alternatePhone: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    profileImage: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other", ""] },
    bio: { type: String },
    // Block status
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, default: "" },
    blockedAt: { type: Date },
    // Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
    },
    // OTP fields
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    // Password Reset fields
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
  },
  { timestamps: true } // ✅ This automatically adds createdAt & updatedAt
);

const User = mongoose.model("User", userSchema);
export default User;

