import Property from "../models/Property.js";
import { cloudinary } from "../middleware/upload.js";

const isCloudinaryUrl = (img = "") => typeof img === "string" && img.includes("cloudinary.com");

// Process uploaded files from multer-cloudinary (they already have URLs)
const extractCloudinaryUrls = (files = []) =>
  files.map((file) => file.path || file.secure_url).filter(Boolean);

// Build public image URL (returns Cloudinary URLs directly)
const buildPublicImageUrl = (req, img) => {
  if (!img) return "";
  // Already a Cloudinary or external URL
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  // Data URL - legacy, return as-is
  if (img.toLowerCase().startsWith("data:")) return img;
  // Legacy local path - return as-is
  return img;
};

const withPublicImages = (req, doc) => {
  if (!doc) return doc;
  const plain = doc.toObject ? doc.toObject() : doc;
  plain.images = (plain.images || []).map((img) => buildPublicImageUrl(req, img));
  return plain;
};

// --- CONTROLLERS ---

// Add Property
export const addProperty = async (req, res) => {
  try {
    let data = req.body;

    // Parse JSON fields that might be stringified
    ["area", "parking", "address", "flooring", "features", "legal", "extras"].forEach((key) => {
      if (data[key]) {
        try {
          data[key] = typeof data[key] === 'string' ? JSON.parse(data[key]) : data[key];
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });

    // Convert string booleans to actual booleans
    if (data.negotiable !== undefined) {
      data.negotiable = data.negotiable === 'true' || data.negotiable === true;
    }

    // Spread features into top-level data if it exists
    if (data.features && typeof data.features === 'object') {
      // Extract parking from features before spreading
      const { parking: featuresParking, extras: featuresExtras, ...restFeatures } = data.features;
      
      // Spread rest of features to top level
      data = { ...data, ...restFeatures };
      
      // Handle parking - merge or set from features
      if (featuresParking) {
        data.parking = {
          covered: String(featuresParking.covered || 0),
          open: String(featuresParking.open || 0)
        };
      }
      
      // Handle extras
      if (featuresExtras) {
        data.extras = featuresExtras;
      }
      
      // Remove the features object after spreading
      delete data.features;
    }

    // Process images from Cloudinary multer upload
    if (req.files?.length > 0) {
      data.images = extractCloudinaryUrls(req.files);
    } else {
      data.images = [];
    }

    // Explicitly set isApproved to true for all new properties (Auto-publish)
    data.isApproved = true;

    console.log("Final data being saved:", JSON.stringify(data, null, 2)); // Debug log

    const prop = await Property.create(data);
    res.status(201).json(withPublicImages(req, prop));
  } catch (err) {
    console.error("Add Property Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get All
export const getProperties = async (req, res) => {
  try {
    const list = await Property.find()
      .populate("category")
      .populate("subcategory")
      .populate("propertyType")
      .sort({ createdAt: -1 });

    res.json(list.map((item) => withPublicImages(req, item)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get by ID
export const getPropertyById = async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id)
      .populate("category")
      .populate("subcategory")
      .populate("propertyType");

    if (!prop) return res.status(404).json({ message: "Not found" });

    res.json(withPublicImages(req, prop));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Property
export const updateProperty = async (req, res) => {
  try {
    let data = req.body;

    // Parse JSON fields that might be stringified
    ["area", "parking", "address", "flooring", "features", "legal", "extras"].forEach((key) => {
      if (data[key]) {
        try {
          data[key] = typeof data[key] === 'string' ? JSON.parse(data[key]) : data[key];
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });

    // Spread features into top-level data if it exists
    if (data.features && typeof data.features === 'object') {
      const { parking: featuresParking, extras: featuresExtras, ...restFeatures } = data.features;
      
      data = { ...data, ...restFeatures };
      
      if (featuresParking) {
        data.parking = {
          covered: String(featuresParking.covered || 0),
          open: String(featuresParking.open || 0)
        };
      }
      
      if (featuresExtras) {
        data.extras = featuresExtras;
      }
      
      delete data.features;
    }

    // Process images from Cloudinary multer upload (only if new files uploaded)
    if (req.files?.length > 0) {
      data.images = extractCloudinaryUrls(req.files);
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, data, { new: true });

    res.json(withPublicImages(req, updated));
  } catch (err) {
    console.error("Update Property Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// Delete
export const deleteProperty = async (req, res) => {
  try {
    const p = await Property.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });

    // Delete images from Cloudinary
    for (const img of p.images || []) {
      if (isCloudinaryUrl(img)) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = img.split("/");
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex !== -1) {
            // Get everything after upload/v{version}/ and remove extension
            const publicIdParts = urlParts.slice(uploadIndex + 2);
            const publicId = publicIdParts.join("/").replace(/\.[^/.]+$/, "");
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (deleteError) {
          console.error("Failed to delete image from Cloudinary:", deleteError);
        }
      }
    }

    await p.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve
export const approveProperty = async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Property not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Disapprove
export const disapproveProperty = async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Property not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🌐 Public: Get All Approved Properties (Home Page)
export const getAllPropertiesList = async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: true })
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("propertyType", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: properties.map((item) => withPublicImages(req, item)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public Search API
export const searchProperties = async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      propertyType,
      buildingType,
      size,
      city,
      priceFrom,
      priceTo,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    const filter = { isApproved: true };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (propertyType) filter.propertyType = propertyType;
    if (buildingType) filter.buildingType = buildingType;
    if (size) filter.size = size;
    if (city && city !== "All") filter["address.city"] = city;

    if (priceFrom || priceTo) {
      filter.price = {};
      if (priceFrom) filter.price.$gte = +priceFrom;
      if (priceTo) filter.price.$lte = +priceTo;
    }

    // Search in multiple fields (excluding ObjectId fields from regex search)
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { "address.city": regex },
        { "address.area": regex },
        { "address.locality": regex },
      ];
    }

    // Build query
    let query = Property.find(filter)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("propertyType", "name");

    // Sorting
    if (sort === "priceAsc") query = query.sort({ price: 1 });
    else if (sort === "priceDesc") query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    // Pagination
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      Property.countDocuments(filter),
      query.skip(skip).limit(Number(limit)),
    ]);

    res.json({
      data: data.map((item) => withPublicImages(req, item)),
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const filterProperties = async (req, res) => {
  try {
    const { search = "", sort = "newest" } = req.query;

    // Base filter: only approved properties
    let filter = { isApproved: true };

    // Search in title or city
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { "address.city": regex }];
    }

    // Fetch properties and populate references
    let properties = await Property.find(filter)
      .populate("propertyType", "name")
      .populate("category", "name")
      .populate("subcategory", "name");

    // Further filter by populated fields (category, subcategory, propertyType)
    if (search.trim()) {
      const lower = search.toLowerCase();
      properties = properties.filter(
        (p) =>
          p.title?.toLowerCase().includes(lower) ||
          p.address?.city?.toLowerCase().includes(lower) ||
          p.category?.name?.toLowerCase().includes(lower) ||
          p.subcategory?.name?.toLowerCase().includes(lower) ||
          p.propertyType?.name?.toLowerCase().includes(lower)
      );
    }

    // Sort
    if (sort === "priceAsc") properties.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") properties.sort((a, b) => b.price - a.price);
    else properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: properties.map((item) => withPublicImages(req, item)) });
  } catch (err) {
    console.error("Error in filterProperties:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};