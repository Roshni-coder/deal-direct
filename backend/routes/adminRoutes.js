import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getDashboardStats,
  getAdminLeads,
  updateAdminLeadStatus,
  getAdminReports,
  updateReportStatus,
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authAdmin.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/profile", protectAdmin, getAdminProfile);

// Dashboard & Analytics
router.get("/dashboard/stats", protectAdmin, getDashboardStats);

// Leads Management
router.get("/leads", protectAdmin, getAdminLeads);
router.put("/leads/:id", protectAdmin, updateAdminLeadStatus);

// Reported Messages
router.get("/reports", protectAdmin, getAdminReports);
router.put("/reports/:id", protectAdmin, updateReportStatus);

export default router;
