import Lead from "../models/Lead.js";
import Property from "../models/Property.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// Create a new lead when user expresses interest
export const createLead = async (userId, propertyId, userDetails) => {
  try {
    // Get property details
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    // Check if lead already exists
    const existingLead = await Lead.findOne({ user: userId, property: propertyId });
    if (existingLead) {
      return existingLead;
    }

    // Create lead with snapshots
    const lead = await Lead.create({
      property: propertyId,
      propertyOwner: property.owner,
      user: userId,
      userSnapshot: {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone || "",
        profileImage: userDetails.profileImage || ""
      },
      propertySnapshot: {
        title: property.title,
        price: property.price || property.expectedPrice,
        listingType: property.listingType,
        city: property.city || property.address?.city,
        locality: property.locality || property.address?.area,
        propertyType: property.propertyTypeName || property.propertyType?.name,
        bhk: property.bhk || property.bhkType
      },
      status: "new",
      source: "website"
    });

    return lead;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
};

// Get all leads for a property owner
export const getOwnerLeads = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { status, property, page = 1, limit = 20, sort = "-createdAt" } = req.query;

    // Build query
    const query = { propertyOwner: ownerId };
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (property && mongoose.Types.ObjectId.isValid(property)) {
      query.property = property;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("user", "name email phone profileImage")
        .populate("property", "title price listingType city locality images categorizedImages")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Lead.countDocuments(query)
    ]);

    // Get stats
    const stats = await Lead.aggregate([
      { $match: { propertyOwner: new mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      new: 0,
      contacted: 0,
      interested: 0,
      negotiating: 0,
      converted: 0,
      lost: 0,
      total: 0
    };

    stats.forEach(s => {
      statusStats[s._id] = s.count;
      statusStats.total += s.count;
    });

    res.status(200).json({
      success: true,
      data: leads,
      stats: statusStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leads for a specific property
export const getPropertyLeads = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const propertyId = req.params.propertyId;

    // Verify property belongs to user
    const property = await Property.findById(propertyId);
    if (!property || property.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const leads = await Lead.find({ property: propertyId })
      .populate("user", "name email phone profileImage")
      .sort("-createdAt");

    res.status(200).json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update lead status
export const updateLeadStatus = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const leadId = req.params.id;
    const { status, notes } = req.body;

    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Verify ownership
    if (lead.propertyOwner.toString() !== ownerId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Update lead
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      { $set: updates },
      { new: true }
    ).populate("user", "name email phone profileImage");

    res.status(200).json({ success: true, data: updatedLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark lead as viewed
export const markLeadViewed = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const leadId = req.params.id;

    const lead = await Lead.findById(leadId);
    
    if (!lead || lead.propertyOwner.toString() !== ownerId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Lead.findByIdAndUpdate(leadId, {
      isViewed: true,
      viewedAt: new Date()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add contact history entry
export const addContactHistory = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const leadId = req.params.id;
    const { action, note } = req.body;

    const lead = await Lead.findById(leadId);
    
    if (!lead || lead.propertyOwner.toString() !== ownerId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      {
        $push: {
          contactHistory: { action, note, date: new Date() }
        },
        $set: { status: "contacted" }
      },
      { new: true }
    ).populate("user", "name email phone profileImage");

    res.status(200).json({ success: true, data: updatedLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lead analytics/stats for dashboard
export const getLeadAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get leads by status
    const statusStats = await Lead.aggregate([
      { $match: { propertyOwner: new mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get leads by day for the chart
    const dailyLeads = await Lead.aggregate([
      {
        $match: {
          propertyOwner: new mongoose.Types.ObjectId(ownerId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get leads by property
    const leadsByProperty = await Lead.aggregate([
      { $match: { propertyOwner: new mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: "$property",
          count: { $sum: 1 },
          propertyTitle: { $first: "$propertySnapshot.title" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get conversion rate
    const totalLeads = await Lead.countDocuments({ propertyOwner: ownerId });
    const convertedLeads = await Lead.countDocuments({ propertyOwner: ownerId, status: "converted" });
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // New leads in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newLeadsThisWeek = await Lead.countDocuments({
      propertyOwner: ownerId,
      createdAt: { $gte: weekAgo }
    });

    // Unread leads count
    const unreadLeads = await Lead.countDocuments({
      propertyOwner: ownerId,
      isViewed: false
    });

    res.status(200).json({
      success: true,
      data: {
        statusStats: statusStats.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
        dailyLeads,
        leadsByProperty,
        totalLeads,
        convertedLeads,
        conversionRate: parseFloat(conversionRate),
        newLeadsThisWeek,
        unreadLeads
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
