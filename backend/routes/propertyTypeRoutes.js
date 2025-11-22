import express from "express";

import { protectAdmin } from "../middleware/authAdmin.js";
import { createPropertyType, getPropertyTypes } from '../controllers/propertyTypeController.js'
const router = express.Router();

router.post("/add-property-type", protectAdmin, createPropertyType);
router.get("/list-propertytype", getPropertyTypes);

export default router;
