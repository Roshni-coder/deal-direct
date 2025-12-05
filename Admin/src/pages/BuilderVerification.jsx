import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  Mail,
  Phone,
  Home, 
  Search,
  Users,
  RefreshCw,
  XCircle,
  // 1. ✅ IMPORT THE MISSING USER ICON HERE
  User, 
  CheckCircle 
} from "lucide-react";

// Assuming VITE_API_BASE_URL is correctly set in your environment
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to safely format date
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return "Invalid Date";
    }
};

// --- Status Badge Component (Reused/Modified) ---

// Status is determined by isBlocked: true (Blocked/Rejected) or false (Active/Approved)
const StatusBadge = ({ isBlocked }) => {
  let styles, label;
  
  if (isBlocked) {
    styles = "bg-red-100 text-red-700 ring-red-300";
    label = "Blocked";
  } else {
    styles = "bg-emerald-100 text-emerald-700 ring-emerald-300";
    label = "Active";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${styles}`}>
      {label}
    </span>
  );
};

// --- Main Component: AllOwners (named BuilderVerification in this file) ---

export default function BuilderVerification() {
  const [users, setUsers] = useState([]); // Array of owner users
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get the token once on component load
  const token = localStorage.getItem("adminToken");

  /* -----------------------------------------------
    🔥 FETCH OWNERS FROM BACKEND
  ------------------------------------------------- */
  const fetchOwners = async () => {
    if (!token) {
      setLoading(false);
      toast.error("Authentication token missing. Please log in.");
      return;
    }

    try {
      setLoading(true);
      // MODIFICATION: Fetch only users with role='owner'
      const { data } = await axios.get(`${API_URL}/api/users/list?role=owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(
        data.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          alternatePhone: u.alternatePhone,
          address: u.address,
          role: u.role,
          // Map DB status to local state
          isBlocked: u.isBlocked, 
          joinedAt: formatDate(u.createdAt),
          gender: u.gender,
          dateOfBirth: u.dateOfBirth,
          bio: u.bio,
          preferences: u.preferences,
          profileImage: u.profileImage,
        }))
      );

      setLoading(false);
      toast.success(`Owner list synchronized! Total: ${data.users.length}`);

    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 401) {
        toast.error("Session expired or invalid token. Please log in again.");
        localStorage.removeItem("adminToken");
      } else {
        toast.error("Failed to fetch owners: " + (error.response?.data?.message || "Server Error"));
      }
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []); 

  /* -----------------------------------------------
    🔥 BLOCK / UNBLOCK OWNER (Instant UI update)
  ------------------------------------------------- */
  const toggleBlock = async (userId) => {
    if (!token) {
      toast.error("Not authenticated for this action.");
      return;
    }
    
    try {
      // Use the standard block endpoint
      const { data } = await axios.put(
        `${API_URL}/api/users/block/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(data.message);
      
      // Instant Local State Update
      const newIsBlocked = data.isBlocked;

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, isBlocked: newIsBlocked } 
            : u
        )
      );

    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  /* -----------------------------------------------
    🔎 FILTERING + SEARCH
  ------------------------------------------------- */
  const filteredOwners = useMemo(() => {
    return users.filter(user => {
      // Status Filter (using isBlocked bool)
      if (statusFilter === "active" && user.isBlocked) return false;
      if (statusFilter === "blocked" && !user.isBlocked) return false;

      // Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const textToSearch = `${user.name} ${user.email} ${user.phone} ${user.role}`.toLowerCase();
        return textToSearch.includes(query);
      }
      return true;
    });
  }, [users, searchQuery, statusFilter]);

  /* -----------------------------------------------
    🖼 UI RENDER (Styled to match the Builder Panel)
      (NOTE: We are skipping View Drawer logic for brevity and focusing on the table/buttons)
  ------------------------------------------------- */

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex items-center text-purple-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-4 text-xl font-medium">Loading Property Owner Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-2 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Home className="w-8 h-8 text-pink-600"/> Property Owner Panel
            </h2>
            <p className="text-gray-500 mt-1">Manage and moderate accounts registered as property owners.</p>
        </div>

        {/* --- Filters and Search (Matching Image Style) --- */}
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:w-5/12">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                />
            </div>

            {/* Status Filter */}
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-3/12 py-2.5 px-3 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
            >
                <option value="all">All Statuses</option>
                <option value="active">🟢 Active</option>
                <option value="blocked">🔴 Blocked</option>
            </select>

            <button
                onClick={fetchOwners}
                className="w-full md:w-2/12 py-2.5 px-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium"
            >
                <RefreshCw className="w-4 h-4" /> Sync
            </button>


            <span className="text-sm font-semibold text-gray-600 w-full md:w-2/12 md:text-right">
                Total: {filteredOwners.length} / {users.length}
            </span>
        </div>
        
        {/* --- Owners Table Card --- */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-pink-500/10">
          
          {/* Table Header Section - Multi-Color Gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-4 px-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" /> Property Owners
            </h3>
          </div>

          {/* Table Content */}
          <table className="min-w-full text-sm divide-y divide-purple-100">
            <thead className="bg-pink-50">
              <tr>
                <th className="py-4 px-6 text-left font-bold text-pink-800">OWNER NAME</th>
                <th className="py-4 px-6 text-left font-bold text-pink-800">EMAIL</th>
                <th className="py-4 px-6 text-left font-bold text-pink-800">PHONE</th>
                <th className="py-4 px-6 text-left font-bold text-pink-800">STATUS</th>
                <th className="py-4 px-6 text-center font-bold text-pink-800">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredOwners.length > 0 ? (
                filteredOwners.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-all hover:bg-pink-50"
                  >
                    {/* Owner Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center ring-2 ring-red-500/30">
                          <User className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {u.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-fuchsia-500" />
                        <span className="text-xs">{u.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <span className="text-xs">{u.phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <StatusBadge isBlocked={u.isBlocked} />
                    </td>

                    {/* Actions: Block/Unblock */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        
                        {/* Block Button (Active Owner -> Block, styled Red) */}
                        {!u.isBlocked && (
                            <button
                                onClick={() => toggleBlock(u.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-md bg-red-600 hover:bg-red-700 shadow-red-400/50 hover:shadow-lg"
                            >
                                <XCircle className="w-4 h-4" /> Block
                            </button>
                        )}
                        
                        {/* Unblock Button (Blocked Owner -> Unblock, styled Green) */}
                        {u.isBlocked && (
                            <button
                                onClick={() => toggleBlock(u.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-md bg-emerald-600 hover:bg-emerald-700 shadow-emerald-400/50 hover:shadow-lg"
                            >
                                <CheckCircle className="w-4 h-4" /> Unblock
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-lg italic">
                    <XCircle className="w-6 h-6 text-red-400 inline-block mr-2" />
                    No property owners match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}