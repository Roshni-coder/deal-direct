import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Home,
  Building2,
  Eye,
  Heart,
  Phone,
  MessageSquare,
  TrendingUp,
  Calendar,
  MapPin,
  IndianRupee,
  Edit3,
  Trash2,
  Plus,
  MoreVertical,
  Filter,
  Search,
  ChevronDown,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Users,
  Layers,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE;

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Active" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Pending" },
    sold: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Sold" },
    rented: { bg: "bg-purple-100", text: "text-purple-700", icon: CheckCircle, label: "Rented" },
    inactive: { bg: "bg-gray-100", text: "text-gray-700", icon: XCircle, label: "Inactive" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

// Stats Card component
const StatsCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-xs font-medium flex items-center gap-1 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
          <TrendingUp className={`w-3.5 h-3.5 ${trend < 0 ? "rotate-180" : ""}`} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

// Property Card component
const PropertyCard = ({ property, onEdit, onDelete, onViewDetails }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatPrice = (price) => {
    if (!price) return "Price on Request";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lac`;
    return `₹${price.toLocaleString()}`;
  };

  const getMainImage = () => {
    // Check categorized images first (residential or commercial)
    if (property.categorizedImages) {
      // Check residential categories
      if (property.categorizedImages.residential) {
        const residentialCategories = ['exterior', 'livingRoom', 'bedroom', 'hall', 'balcony', 'kitchen'];
        for (const cat of residentialCategories) {
          if (property.categorizedImages.residential[cat]?.length > 0) {
            return property.categorizedImages.residential[cat][0];
          }
        }
      }
      // Check commercial categories
      if (property.categorizedImages.commercial) {
        const commercialCategories = ['facade', 'reception', 'workArea', 'cabin', 'shopFloor'];
        for (const cat of commercialCategories) {
          if (property.categorizedImages.commercial[cat]?.length > 0) {
            return property.categorizedImages.commercial[cat][0];
          }
        }
      }
    }
    // Fallback to legacy images
    if (property.images?.length > 0) {
      return property.images[0];
    }
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getMainImage()}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={property.status || "active"} />
        </div>
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition shadow-sm"
            >
              <MoreVertical className="w-4 h-4 text-gray-700" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10"
                >
                  <button
                    onClick={() => { onViewDetails(property); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> View Details
                  </button>
                  <button
                    onClick={() => { onEdit(property); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Property
                  </button>
                  <button
                    onClick={() => { onDelete(property); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between">
          <span className="px-2.5 py-1 bg-black/70 backdrop-blur text-white text-xs font-medium rounded-lg">
            {property.listingType || "Rent"}
          </span>
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-gray-800 text-xs font-medium rounded-lg">
            {typeof property.propertyType === 'object' ? property.propertyType?.name : property.propertyType || property.propertyTypeName || "Property"}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 mb-1">
          {property.title}
        </h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {property.locality || property.address?.locality || property.address?.area || "N/A"}, {property.city || property.address?.city || "N/A"}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xl font-bold text-gray-900">{formatPrice(property.expectedPrice)}</p>
            {property.listingType === "Rent" && (
              <p className="text-xs text-gray-500">per month</p>
            )}
          </div>
          <div className="text-right">
            {property.builtUpArea && (
              <p className="text-sm font-medium text-gray-700">{property.builtUpArea} sq.ft</p>
            )}
            {property.bhkType && (
              <p className="text-xs text-gray-500">{property.bhkType}</p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{property.views || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">{property.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{property.interested || property.likes || 0}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {new Date(property.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function MyProperties() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, pending, sold, rented
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Auth check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      toast.error("Please login to view your properties");
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Check if user is owner
    if (parsedUser.role !== "owner" && parsedUser.role !== "agent") {
      toast.error("Only property owners can access this page");
      navigate("/");
      return;
    }

    fetchProperties();
  }, [navigate]);

  const fetchProperties = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/properties/my-properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setProperties(res.data.data || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchProperties(true);
  };

  // Calculate stats
  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "active" || !p.status).length,
    totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0),
    totalInterested: properties.reduce((sum, p) => sum + (p.likes || 0), 0),
  };

  // Filter and sort properties
  const filteredProperties = properties
    .filter((p) => {
      if (filter === "all") return true;
      return (p.status || "active") === filter;
    })
    .filter((p) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const locality = p.locality || p.address?.locality || p.address?.area || "";
      const city = p.city || p.address?.city || "";
      return (
        p.title?.toLowerCase().includes(query) ||
        locality.toLowerCase().includes(query) ||
        city.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-high":
          return (b.expectedPrice || 0) - (a.expectedPrice || 0);
        case "price-low":
          return (a.expectedPrice || 0) - (b.expectedPrice || 0);
        case "views":
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

  const handleEdit = (property) => {
    // Navigate to edit page (you can create this later)
    toast.info("Edit functionality coming soon!");
  };

  const handleDelete = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/properties/${propertyToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Property deleted successfully");
      setProperties(properties.filter((p) => p._id !== propertyToDelete._id));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (err) {
      toast.error("Failed to delete property");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = (property) => {
    navigate(`/properties/${property._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
              <p className="text-gray-500 mt-1">Manage and track your property listings</p>
              {lastUpdated && (
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link
                to="/add-property"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition shadow-md"
              >
                <Plus className="w-5 h-5" />
                Add New Property
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={Layers}
            label="Total Properties"
            value={stats.total}
            color="bg-blue-600"
          />
          <StatsCard
            icon={CheckCircle}
            label="Active Listings"
            value={stats.active}
            color="bg-green-600"
          />
          <StatsCard
            icon={Eye}
            label="Total Views"
            value={stats.totalViews}
            color="bg-purple-600"
          />
          <StatsCard
            icon={Heart}
            label="Total Interested"
            value={stats.totalInterested}
            color="bg-pink-600"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, locality, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "pending", label: "Pending" },
                { key: "sold", label: "Sold" },
                { key: "rented", label: "Rented" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    filter === tab.key
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filter !== "all" ? "No properties found" : "No properties yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by listing your first property on DealDirect"}
            </p>
            {!searchQuery && filter === "all" && (
              <Link
                to="/add-property"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
              >
                <Plus className="w-5 h-5" />
                List Your First Property
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Property?
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
