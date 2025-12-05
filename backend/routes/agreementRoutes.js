import express from "express";
import { authMiddleware } from "../middleware/authUser.js";
import {
  generateAgreement,
  getAgreementTemplates,
  getIndianStates,
} from "../controllers/agreementController.js";

const router = express.Router();

// Generate agreement (requires user auth)
router.post("/generate", authMiddleware, generateAgreement);

// Get available templates (public)
router.get("/templates", getAgreementTemplates);

// Get Indian states list (public)
router.get("/states", getIndianStates);

export default router;
