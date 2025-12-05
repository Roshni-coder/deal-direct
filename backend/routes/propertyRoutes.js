import express from "express";
import {
  addProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getAllPropertiesList,
  approveProperty,
  disapproveProperty,
  searchProperties,
  filterProperties,
  getMyProperties,
  deleteMyProperty,
  updateMyProperty,
  markInterested,
  checkInterested,
  getSavedProperties,
  removeSavedProperty,
  getSuggestions,
} from "../controllers/propertyController.js";
import { protectAdmin } from "../middleware/authAdmin.js";
import { authMiddleware } from "../middleware/authUser.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// ✅ Routes - Using Cloudinary upload middleware
// Handle both legacy images and categorized images
router.post("/add", authMiddleware, upload.fields([
  { name: "images", maxCount: 15 },
  { name: "categorizedImages", maxCount: 50 }
]), addProperty);

// Public listing routes
router.get("/list", getProperties);
router.get("/property-list", getAllPropertiesList); // 🟢 For frontend home page

// Public search & filter (MUST be before /:id)
router.get("/search", searchProperties);
router.get("/suggestions", getSuggestions); // Fast autocomplete
router.get("/filter", filterProperties);

// 🔒 Protected Routes - User's Own Properties (MUST be before /:id)
router.get("/my-properties", authMiddleware, getMyProperties);
router.put("/my-properties/:id", authMiddleware, upload.fields([
  { name: "images", maxCount: 15 },
  { name: "categorizedImages", maxCount: 50 }
]), updateMyProperty);

// 🔒 Protected: Saved/Interested Properties routes (MUST be before /:id)
router.get("/saved", authMiddleware, getSavedProperties);
router.delete("/saved/:id", authMiddleware, removeSavedProperty);

// Admin routes (with specific paths before /:id)
router.put("/edit/:id", protectAdmin, upload.fields([
  { name: "images", maxCount: 15 },
  { name: "categorizedImages", maxCount: 50 }
]), updateProperty);
router.delete("/delete/:id", protectAdmin, deleteProperty);
router.put("/approve/:id", protectAdmin, approveProperty);
router.put("/disapprove/:id", protectAdmin, disapproveProperty);

// 🔒 Protected: Interest routes (MUST be before /:id)
router.post("/interested/:id", authMiddleware, markInterested);
router.get("/interested/:id/check", authMiddleware, checkInterested);

// Dynamic ID routes (MUST be last)
router.get("/:id", getPropertyById);
router.delete("/:id", authMiddleware, deleteMyProperty);

export default router;