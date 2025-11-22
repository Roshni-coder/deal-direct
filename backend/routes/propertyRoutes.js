import express from "express";
import multer from "multer";
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

const router = express.Router();

// 🖼️ Multer config (memory storage so nothing persists locally)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 50 * 1024 * 1024, // 50MB for base64 images
    fileSize: 10 * 1024 * 1024,  // 10MB per file
  }
});

// ✅ Routes
router.post("/add", upload.array("images", 10), addProperty);
router.get("/list", getProperties);
router.get("/property-list", getAllPropertiesList); // 🟢 For frontend home page
router.get("/:id", getPropertyById);
router.put("/edit/:id", protectAdmin, upload.array("images", 10), updateProperty);
router.delete("/delete/:id", protectAdmin, deleteProperty);
router.put("/approve/:id", protectAdmin, approveProperty);
router.put("/disapprove/:id", protectAdmin, disapproveProperty);
// Public search endpoint
router.get("/search", searchProperties);
router.get("/filter", filterProperties);
export default router;