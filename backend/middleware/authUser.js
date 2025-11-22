// server/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.isEnvAgent) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: process.env.AGENT_NAME || "DealDirect Agent",
        email: process.env.AGENT_EMAIL || decoded.email,
        role: "agent",
        isEnvAgent: true,
      };
      return next();
    }

    if (decoded?.isEnvOwner) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: process.env.OWNER_NAME || process.env.DEMO_OWNER_NAME || "Property Owner",
        email: process.env.OWNER_EMAIL || process.env.DEMO_OWNER_EMAIL || decoded.email,
        role: "owner",
        isEnvOwner: true,
      };
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = { ...user.toObject(), role: user.role || decoded.role || "user" }; // attach user to request
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid/Expired token" });
  }
};
