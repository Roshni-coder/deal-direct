import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Paths that env-agent admins ARE allowed to access
const envAgentAllowedPaths = ["/api/properties/add"];

// Paths that require FULL admin access (not env-agent)
const fullAdminOnlyPaths = [
  "/api/admin/dashboard",
  "/api/admin/leads",
  "/api/users/list"
];

export const protectAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requestedPath = req.originalUrl || "";

    if (decoded.isEnvAgentAdmin) {
      // Check if this is a full-admin-only path
      const isFullAdminOnly = fullAdminOnlyPaths.some((path) =>
        requestedPath.startsWith(path)
      );

      if (isFullAdminOnly) {
        return res.status(403).json({ message: "This action requires full admin access" });
      }

      // Check if agent is allowed for this path
      const canAccess = envAgentAllowedPaths.some((path) =>
        requestedPath.startsWith(path)
      );

      if (!canAccess) {
        return res.status(403).json({ message: "Agent not allowed for this action" });
      }

      req.admin = {
        _id: "env-agent-admin",
        name: process.env.AGENT_NAME || "DealDirect Agent",
        email: process.env.AGENT_EMAIL,
        role: "agent",
        isEnvAgent: true,
      };
      return next();
    }

    // Full admin authentication
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }
    req.admin = { ...admin.toObject(), role: "admin", isEnvAgent: false };
    next();
  } catch (error) {
    console.error("Admin auth error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
