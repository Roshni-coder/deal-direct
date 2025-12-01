import dotenv from "dotenv";
dotenv.config(); // Load env vars BEFORE other imports

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import propertyTypeRoutes from './routes/propertyTypeRoutes.js'

connectDB();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve images

// Routes
app.use("/api/propertyTypes", propertyTypeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
