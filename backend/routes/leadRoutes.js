import express from "express";
import { authMiddleware } from "../middleware/authUser.js";
import {
  getOwnerLeads,
  getPropertyLeads,
  updateLeadStatus,
  markLeadViewed,
  addContactHistory,
  getLeadAnalytics
} from "../controllers/leadController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all leads for the logged-in property owner
router.get("/", getOwnerLeads);

// Get lead analytics for dashboard
router.get("/analytics", getLeadAnalytics);

// Get leads for a specific property
router.get("/property/:propertyId", getPropertyLeads);

// Update lead status
router.put("/:id/status", updateLeadStatus);

// Mark lead as viewed
router.put("/:id/viewed", markLeadViewed);

// Add contact history entry
router.post("/:id/contact", addContactHistory);

export default router;
