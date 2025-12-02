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
} from "../controllers/propertyController.js";
import { protectAdmin } from "../middleware/authAdmin.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// ✅ Routes - Using Cloudinary upload middleware
// Handle both legacy images and categorized images
router.post("/add", upload.fields([
  { name: "images", maxCount: 15 },
  { name: "categorizedImages", maxCount: 50 }
]), addProperty);
router.get("/list", getProperties);
router.get("/property-list", getAllPropertiesList); // 🟢 For frontend home page
router.get("/:id", getPropertyById);
router.put("/edit/:id", protectAdmin, upload.fields([
  { name: "images", maxCount: 15 },
  { name: "categorizedImages", maxCount: 50 }
]), updateProperty);
router.delete("/delete/:id", protectAdmin, deleteProperty);
router.put("/approve/:id", protectAdmin, approveProperty);
router.put("/disapprove/:id", protectAdmin, disapproveProperty);
// Public search endpoint
router.get("/search", searchProperties);
router.get("/filter", filterProperties);
export default router;