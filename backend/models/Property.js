import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    propertyType: { type: mongoose.Schema.Types.ObjectId, ref: "PropertyType", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },

    title: { type: String, required: true },
    description: String,

    price: Number,
    priceUnit: { type: String, default: "Lac" },
    negotiable: { type: Boolean, default: false },

    area: {
      totalSqft: Number,
      carpetSqft: Number,
      builtUpSqft: Number,
      pricePerSqft: Number,
    },

    amenities: [String],
    parking: {
      covered: { type: String },
      open: { type: String },
    },

    address: {
      line: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
      latitude: Number,
      longitude: Number,
    },

    images: [String],
    isApproved: { type: Boolean, default: false },

    // New Fields
    listingType: { type: String, enum: ["Rent", "Sell"], default: "Rent" },
    bhk: String,
    furnishing: String,
    bathrooms: Number,
    balconies: Number,
    washrooms: Number,
    maintenance: Number,
    securityDeposit: Number,
    availableFrom: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);