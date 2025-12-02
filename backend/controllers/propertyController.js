import Property from "../models/Property.js";
import { cloudinary } from "../middleware/upload.js";
import mongoose from "mongoose";

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
  
  // Process categorized images as well
  if (plain.categorizedImages) {
    // Process residential categories
    if (plain.categorizedImages.residential) {
      Object.keys(plain.categorizedImages.residential).forEach(key => {
        plain.categorizedImages.residential[key] = (plain.categorizedImages.residential[key] || [])
          .map(img => buildPublicImageUrl(req, img));
      });
    }
    // Process commercial categories
    if (plain.categorizedImages.commercial) {
      Object.keys(plain.categorizedImages.commercial).forEach(key => {
        plain.categorizedImages.commercial[key] = (plain.categorizedImages.commercial[key] || [])
          .map(img => buildPublicImageUrl(req, img));
      });
    }
  }
  
  return plain;
};

// --- CONTROLLERS ---

// Add Property
export const addProperty = async (req, res) => {
  try {
    let data = req.body;

    // Parse JSON fields that might be stringified
    ["area", "parking", "address", "flooring", "features", "legal", "extras", "imageCategoryMap"].forEach((key) => {
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

    // Process legacy images from Cloudinary multer upload
    if (req.files?.images?.length > 0) {
      data.images = extractCloudinaryUrls(req.files.images);
    } else {
      data.images = [];
    }
    
    // Process categorized images
    if (req.files?.categorizedImages?.length > 0 && data.imageCategoryMap) {
      const categorizedUrls = extractCloudinaryUrls(req.files.categorizedImages);
      const categoryMap = data.imageCategoryMap;
      
      // Determine if property is residential or commercial
      const isResidential = data.categoryName === 'Residential' || 
                           (data.category && data.category.name === 'Residential');
      
      // Initialize categorizedImages structure
      data.categorizedImages = {
        residential: {},
        commercial: {}
      };
      
      // Track which URL index we're at
      let urlIndex = 0;
      
      // Map images to their categories
      Object.entries(categoryMap).forEach(([categoryKey, indices]) => {
        const categoryImages = [];
        for (let i = 0; i < indices.length && urlIndex < categorizedUrls.length; i++) {
          categoryImages.push(categorizedUrls[urlIndex]);
          urlIndex++;
        }
        
        // Add to appropriate category (residential or commercial)
        if (isResidential) {
          data.categorizedImages.residential[categoryKey] = categoryImages;
        } else {
          data.categorizedImages.commercial[categoryKey] = categoryImages;
        }
      });
      
      // Also add categorized images to the main images array for backward compatibility
      if (data.images.length === 0) {
        data.images = categorizedUrls;
      }
      
      // Clean up the temporary map
      delete data.imageCategoryMap;
    }

    // Explicitly set isApproved to true for all new properties (Auto-publish)
    data.isApproved = true;
    
    // Set owner from auth token if available
    if (req.user?._id) {
      data.owner = req.user._id;
    }

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
    // Increment view count
    const prop = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("category")
      .populate("subcategory")
      .populate("propertyType")
      .populate("owner", "name email phone profileImage");

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
    ["area", "parking", "address", "flooring", "features", "legal", "extras", "imageCategoryMap"].forEach((key) => {
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

    // Process legacy images from Cloudinary multer upload (only if new files uploaded)
    if (req.files?.images?.length > 0) {
      data.images = extractCloudinaryUrls(req.files.images);
    }
    
    // Process categorized images
    if (req.files?.categorizedImages?.length > 0 && data.imageCategoryMap) {
      const categorizedUrls = extractCloudinaryUrls(req.files.categorizedImages);
      const categoryMap = data.imageCategoryMap;
      
      // Determine if property is residential or commercial
      const isResidential = data.categoryName === 'Residential' || 
                           (data.category && data.category.name === 'Residential');
      
      // Initialize categorizedImages structure
      data.categorizedImages = {
        residential: {},
        commercial: {}
      };
      
      // Track which URL index we're at
      let urlIndex = 0;
      
      // Map images to their categories
      Object.entries(categoryMap).forEach(([categoryKey, indices]) => {
        const categoryImages = [];
        for (let i = 0; i < indices.length && urlIndex < categorizedUrls.length; i++) {
          categoryImages.push(categorizedUrls[urlIndex]);
          urlIndex++;
        }
        
        if (isResidential) {
          data.categorizedImages.residential[categoryKey] = categoryImages;
        } else {
          data.categorizedImages.commercial[categoryKey] = categoryImages;
        }
      });
      
      delete data.imageCategoryMap;
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

// 🔒 Protected: Get User's Own Properties (Owner Dashboard)
export const getMyProperties = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log("Fetching properties for user:", userId);
    
    // Convert to ObjectId if it's a valid string
    let ownerQuery = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      ownerQuery = new mongoose.Types.ObjectId(userId);
    }
    
    const properties = await Property.find({ owner: ownerQuery })
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("propertyType", "name")
      .sort({ createdAt: -1 });

    console.log(`Found ${properties.length} properties for user ${userId}`);

    res.status(200).json({ 
      success: true, 
      data: properties.map((item) => withPublicImages(req, item)),
      count: properties.length
    });
  } catch (error) {
    console.error("Error in getMyProperties:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔒 Protected: Delete User's Own Property
export const deleteMyProperty = async (req, res) => {
  try {
    const userId = req.user._id;
    const propertyId = req.params.id;

    const property = await Property.findOne({ _id: propertyId, owner: userId });
    
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found or you don't have permission to delete it" });
    }

    // Delete images from Cloudinary if they exist
    const allImages = [
      ...(property.images || []),
      ...Object.values(property.categorizedImages?.residential || {}).flat(),
      ...Object.values(property.categorizedImages?.commercial || {}).flat()
    ];

    for (const imageUrl of allImages) {
      if (isCloudinaryUrl(imageUrl)) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = imageUrl.split('/');
          const publicIdWithExtension = urlParts.slice(-2).join('/');
          const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.error("Error deleting image from Cloudinary:", e);
        }
      }
    }

    await Property.findByIdAndDelete(propertyId);

    res.status(200).json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔒 Protected: Mark Interest in a Property (Buyer)
export const markInterested = async (req, res) => {
  try {
    const userId = req.user._id;
    const propertyId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, message: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Check if user is the owner (can't be interested in own property)
    if (property.owner && property.owner.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot express interest in your own property" });
    }

    // Check if user already expressed interest
    const alreadyInterested = property.interestedUsers?.some(
      (item) => item.user && item.user.toString() === userId.toString()
    );

    if (alreadyInterested) {
      return res.status(400).json({ success: false, message: "You have already expressed interest in this property" });
    }

    // Add user to interestedUsers and increment likes count
    await Property.findByIdAndUpdate(propertyId, {
      $push: { interestedUsers: { user: userId, interestedAt: new Date() } },
      $inc: { likes: 1 }
    });

    console.log(`User ${userId} expressed interest in property ${propertyId}`);

    res.status(200).json({ 
      success: true, 
      message: "Interest registered successfully! The owner will be notified." 
    });
  } catch (error) {
    console.error("Error in markInterested:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔒 Protected: Check if user is interested in a property
export const checkInterested = async (req, res) => {
  try {
    const userId = req.user._id;
    const propertyId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, isInterested: false });
    }

    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ success: false, isInterested: false });
    }

    const isInterested = property.interestedUsers?.some(
      (item) => item.user && item.user.toString() === userId.toString()
    );

    res.status(200).json({ success: true, isInterested });
  } catch (error) {
    res.status(500).json({ success: false, isInterested: false, message: error.message });
  }
};

// 🔒 Protected: Get User's Saved/Interested Properties
export const getSavedProperties = async (req, res) => {
  try {
    const userId = req.user._id;

    // Convert to ObjectId if it's a valid string
    let userQuery = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userQuery = new mongoose.Types.ObjectId(userId);
    }

    // Find all properties where user is in interestedUsers
    const properties = await Property.find({
      "interestedUsers.user": userQuery
    })
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("propertyType", "name")
      .sort({ createdAt: -1 });

    // Add the interestedAt date to each property
    const propertiesWithDate = properties.map(prop => {
      const plain = prop.toObject ? prop.toObject() : prop;
      const userInterest = plain.interestedUsers?.find(
        item => item.user && item.user.toString() === userQuery.toString()
      );
      plain.interestedAt = userInterest?.interestedAt;
      // Process images
      plain.images = (plain.images || []).map(img => {
        if (!img) return "";
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        return img;
      });
      return plain;
    });

    res.status(200).json({
      success: true,
      data: propertiesWithDate,
      count: propertiesWithDate.length
    });
  } catch (error) {
    console.error("Error in getSavedProperties:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔒 Protected: Remove from Saved/Interested Properties
export const removeSavedProperty = async (req, res) => {
  try {
    const userId = req.user._id;
    const propertyId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, message: "Invalid property ID" });
    }

    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Check if user is in interestedUsers
    const isInterested = property.interestedUsers?.some(
      (item) => item.user && item.user.toString() === userId.toString()
    );

    if (!isInterested) {
      return res.status(400).json({ success: false, message: "Property not in your saved list" });
    }

    // Remove user from interestedUsers and decrement likes
    await Property.findByIdAndUpdate(propertyId, {
      $pull: { interestedUsers: { user: userId } },
      $inc: { likes: -1 }
    });

    res.status(200).json({ success: true, message: "Property removed from saved" });
  } catch (error) {
    console.error("Error in removeSavedProperty:", error);
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