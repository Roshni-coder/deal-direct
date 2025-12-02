import dotenv from "dotenv";
dotenv.config(); // Ensure env vars are loaded

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Parse CLOUDINARY_URL and configure explicitly
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
  // Format: cloudinary://api_key:api_secret@cloud_name
  const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
  if (match) {
    cloudinary.config({
      cloud_name: match[3],
      api_key: match[1],
      api_secret: match[2],
    });
    console.log("✅ Cloudinary configured for cloud:", match[3]);
  } else {
    console.error("❌ Invalid CLOUDINARY_URL format");
  }
} else {
  console.error("❌ CLOUDINARY_URL not found in environment");
}

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Use different folders for different upload types
    const isProfileImage = file.fieldname === 'profileImage';
    
    return {
      folder: isProfileImage ? "dealdirect/profiles" : "dealdirect/properties",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: isProfileImage 
        ? [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto" }]
        : [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
    };
  },
});

export const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

// Export cloudinary instance for direct uploads (e.g., base64)
export { cloudinary };
