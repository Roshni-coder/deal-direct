import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/userModel.js";
import Property from "../models/Property.js";
import Lead from "../models/Lead.js";
import Report from "../models/Report.js";
import Message from "../models/Message.js";

// ✅ Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedInputEmail = (email || "").trim().toLowerCase();
    const normalizedEnvEmail = (process.env.AGENT_EMAIL || "").trim().toLowerCase();

    if (normalizedEnvEmail && normalizedInputEmail === normalizedEnvEmail) {
      if (!process.env.AGENT_PASSWORD) {
        return res
          .status(500)
          .json({ message: "Agent password not configured on server" });
      }

      if (password !== process.env.AGENT_PASSWORD) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: "env-agent-admin",
          role: "agent",
          isEnvAgentAdmin: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        admin: {
          _id: "env-agent-admin",
          name: process.env.AGENT_NAME || "DealDirect Agent",
          email: process.env.AGENT_EMAIL,
          role: "agent",
          isEnvAgent: true,
          allowedRoutes: ["/add-property"],
        },
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
        isEnvAgent: false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Admin Profile (Protected)
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [totalUsers, totalProperties, totalLeads, approvedProperties, pendingProperties] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Lead.countDocuments(),
      Property.countDocuments({ isApproved: true }),
      Property.countDocuments({ isApproved: false })
    ]);

    // Get properties by listing type
    const [rentCount, saleCount] = await Promise.all([
      Property.countDocuments({ listingType: { $regex: /rent/i } }),
      Property.countDocuments({ listingType: { $regex: /sell|sale|buy/i } })
    ]);

    // Get lead stats
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const leadStats = {
      new: 0,
      contacted: 0,
      interested: 0,
      negotiating: 0,
      converted: 0,
      lost: 0
    };
    leadsByStatus.forEach(item => {
      if (leadStats.hasOwnProperty(item._id)) {
        leadStats[item._id] = item.count;
      }
    });

    // Get monthly data for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyProperties = await Property.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyLeads = await Lead.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format monthly data for charts
    const formatMonthlyData = (data) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return data.map(item => {
        const [year, month] = item._id.split('-');
        return {
          label: months[parseInt(month) - 1],
          value: item.count,
          month: item._id
        };
      });
    };

    // Get recent properties
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("owner", "name email")
      .select("title address.city price listingType isApproved createdAt images");

    // Get top owners by property count
    const topOwners = await Property.aggregate([
      { $group: { _id: "$owner", propertyCount: { $sum: 1 } } },
      { $sort: { propertyCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "ownerInfo"
        }
      },
      { $unwind: "$ownerInfo" },
      {
        $project: {
          name: "$ownerInfo.name",
          email: "$ownerInfo.email",
          propertyCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalProperties,
          totalLeads,
          approvedProperties,
          pendingProperties,
          rentCount,
          saleCount
        },
        leadStats,
        charts: {
          properties: formatMonthlyData(monthlyProperties),
          leads: formatMonthlyData(monthlyLeads),
          users: formatMonthlyData(monthlyUsers)
        },
        recentProperties: recentProperties.map(p => ({
          _id: p._id,
          title: p.title,
          city: p.address?.city || "N/A",
          price: p.price,
          listingType: p.listingType,
          isApproved: p.isApproved,
          createdAt: p.createdAt,
          owner: p.owner?.name || "Unknown",
          image: p.images?.[0] || null
        })),
        topOwners
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Leads (Admin)
export const getAdminLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    // Build filter
    let filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    // Get leads
    let leads = await Lead.find(filter)
      .populate("user", "name email phone profileImage")
      .populate("propertyOwner", "name email phone")
      .populate("property", "title address.city price listingType images")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      leads = leads.filter(lead =>
        lead.userSnapshot?.name?.toLowerCase().includes(searchLower) ||
        lead.userSnapshot?.email?.toLowerCase().includes(searchLower) ||
        lead.propertySnapshot?.title?.toLowerCase().includes(searchLower) ||
        lead.propertySnapshot?.city?.toLowerCase().includes(searchLower)
      );
    }

    const total = await Lead.countDocuments(filter);

    // Get status stats
    const statusStats = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = {
      total: 0,
      new: 0,
      contacted: 0,
      interested: 0,
      negotiating: 0,
      converted: 0,
      lost: 0
    };
    statusStats.forEach(s => {
      if (stats.hasOwnProperty(s._id)) {
        stats[s._id] = s.count;
        stats.total += s.count;
      }
    });

    res.status(200).json({
      success: true,
      data: leads,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Admin leads error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Lead Status (Admin)
export const updateAdminLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (status) lead.status = status;
    if (notes !== undefined) lead.notes = notes;

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Reported Messages (Admin)
export const getAdminReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate("reportedBy", "name email")
      .populate({
        path: "message",
        populate: { path: "sender", select: "name email role" }
      })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    console.log(`Fetched ${reports.length} reports for admin.`);

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Report Status (Admin)
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    // Track who reviewed it and when
    if (status === 'reviewed' || status === 'resolved' || status === 'dismissed') {
      report.reviewedBy = req.admin ? req.admin._id : null;
      report.reviewedAt = new Date();
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: report
    });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
