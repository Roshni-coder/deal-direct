import Property from "../models/Property.js";
import fs from "fs";
import path from "path";

const isDataUrl = (img = "") => typeof img === "string" && img.trim().toLowerCase().startsWith("data:");

const extensionToMime = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const fileToDataUrl = (filePath) => {
  if (!fs.existsSync(filePath)) return "";
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = extensionToMime[ext] || "image/jpeg";
  const buffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const normalizeImagePath = (img) => {
  if (!img) return "";
  let cleaned = img.replace(/\\/g, "/");
  cleaned = cleaned.replace(/^\/?uploads\//i, "");
  return cleaned;
};

const encodeFilesToDataUrls = (files = []) =>
  files
    .map((file) => {
      try {
        let buffer = file?.buffer;
        let cleanupPath = null;

        if (!buffer) {
          const filePath = file?.path || (file?.filename ? path.join("uploads", file.filename) : null);
          if (!filePath || !fs.existsSync(filePath)) return "";
          buffer = fs.readFileSync(filePath);
          cleanupPath = filePath;
        }

        const base64 = buffer.toString("base64");
        const mime = file?.mimetype || "image/jpeg";
        return `data:${mime};base64,${base64}`;
      } catch (error) {
        console.error("Failed to encode image", error);
        return "";
      } finally {
        // Clean up legacy temp files if any were created
        if (cleanupPath && fs.existsSync(cleanupPath)) {
          fs.unlinkSync(cleanupPath);
        }
      }
    })
    .filter(Boolean);

const extractInlineImages = (payload) => {
  const raw = payload?.inlineImages;
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      return parsed.filter((img) => typeof img === "string" && img.trim().startsWith("data:"));
    }
  } catch (error) {
    console.error("Failed to parse inline images", error.message);
  }
  return [];
};

const buildPublicImageUrl = (req, img) => {
  if (!img) return "";
  const lower = img.toLowerCase();
  if (lower.startsWith("data:")) return img;
  if (lower.startsWith("http://") || lower.startsWith("https://")) return img;
  const normalized = normalizeImagePath(img);
  const filePath = path.join("uploads", normalized);
  const dataUrl = fileToDataUrl(filePath);
  if (dataUrl) return dataUrl;
  return `${req.protocol}://${req.get("host")}/uploads/${normalized}`;
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

    // FIX: Added "features" and "legal" to the list of fields to parse
    ["area", "parking", "address", "flooring", "features", "legal"].forEach((key) => {
      if (data[key]) {
        try {
          // Handle cases where it might already be an object or a double-stringified JSON
          data[key] = typeof data[key] === 'string' ? JSON.parse(data[key]) : data[key];
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });

    // Spread features into top-level data if it exists
    if (data.features && typeof data.features === 'object') {
      data = { ...data, ...data.features };
    }

    const inlineImages = extractInlineImages(data);
    if (inlineImages.length) {
      data.images = inlineImages;
    } else {
      // Safely handle file encoding
      const encodedImages = encodeFilesToDataUrls(req.files || []);
      data.images = encodedImages.length ? encodedImages : [];
    }
    delete data.inlineImages;

    // Explicitly set isApproved to true for all new properties (Auto-publish)
    data.isApproved = true;

    const prop = await Property.create(data);
    res.status(201).json(withPublicImages(req, prop));
  } catch (err) {
    console.error("Add Property Error:", err); // Log error to server console for debugging
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

    // FIX: Added "features" and "legal"
    ["area", "parking", "address", "flooring", "features", "legal"].forEach((key) => {
      if (data[key]) {
        try {
          data[key] = typeof data[key] === 'string' ? JSON.parse(data[key]) : data[key];
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });

    // Spread features
    if (data.features && typeof data.features === 'object') {
      data = { ...data, ...data.features };
    }

    const inlineImages = extractInlineImages(data);
    if (inlineImages.length) {
      data.images = inlineImages;
    } else if (req.files?.length > 0) {
      const encodedImages = encodeFilesToDataUrls(req.files);
      if (encodedImages.length) data.images = encodedImages;
    }
    delete data.inlineImages;

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

    p.images.forEach((img) => {
      if (isDataUrl(img)) return;
      const imgPath = path.join("uploads", normalizeImagePath(img));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    });

    await p.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve
export const approveProperty = async (req, res) => {
  const updated = await Property.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  res.json(updated);
};

// Disapprove
export const disapproveProperty = async (req, res) => {
  const updated = await Property.findByIdAndUpdate(
    req.params.id,
    { isApproved: false },
    { new: true }
  );
  res.json(updated);
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

    // Search in multiple fields
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { "address.city": regex },
        { propertyType: regex },
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