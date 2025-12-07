import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, Search, RefreshCw, FileText, FileSpreadsheet } from "lucide-react"; // Added Icons

// Assuming VITE_API_BASE_URL is correctly set in your environment
const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString('en-GB');
  } catch {
    return "Invalid Date";
  }
};

export default function AllClients() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false); // State for export loading

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Block modal states
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [userToBlock, setUserToBlock] = useState(null);
  const [blockLoading, setBlockLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem("adminToken"), []);

  // Fetch Users
  const fetchUsers = async () => {
    if (!token) {
      setLoading(false);
      toast.error("Authentication token missing. Please log in.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/users/list?role=user`, {
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
          status: u.isBlocked ? "Blocked" : "Active",
          blockReason: u.blockReason || "",
          blockedAt: u.blockedAt,
          joinedAt: formatDate(u.createdAt),
          gender: u.gender,
          dateOfBirth: u.dateOfBirth,
          bio: u.bio,
          preferences: u.preferences,
          profileImage: u.profileImage,
        }))
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("adminToken");
      } else {
        toast.error("Failed to fetch users.");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ GENERIC DOWNLOAD HANDLER
  const handleDownload = async (type) => {
    if (!token) return toast.error("Please login first");
    setDownloading(true);

    try {
      const endpoint = type === 'csv' ? '/api/users/export-csv' : '/api/users/export-pdf';
      const filename = type === 'csv' ? 'clients_list.csv' : 'clients_list.pdf';

      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important: Handle binary data
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Cleanup

      toast.success(`${type.toUpperCase()} downloaded successfully!`);
    } catch (error) {
      console.error("Download Error:", error);
      toast.error(`Failed to download ${type.toUpperCase()}`);
    } finally {
      setDownloading(false);
    }
  };

  /* -----------------------------------------------
     🔥 BLOCK / UNBLOCK LOGIC (UNCHANGED)
  ------------------------------------------------- */
  const handleBlockClick = (user) => {
    if (user.status === "Blocked") {
      confirmBlock(user.id, null);
    } else {
      setUserToBlock(user);
      setBlockReason("");
      setBlockModalOpen(true);
    }
  };

  const confirmBlock = async (userId, reason) => {
    setBlockLoading(true);
    try {
      const { data } = await axios.put(
        `${API_URL}/api/users/block/${userId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message);
      const newStatus = data.isBlocked ? "Blocked" : "Active";
      const newBlockReason = data.blockReason || "";

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus, blockReason: newBlockReason } : u));
      
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: newStatus, blockReason: newBlockReason }));
      }
      setBlockModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleConfirmBlock = () => {
    if (!blockReason.trim()) return toast.error("Reason required.");
    confirmBlock(userToBlock.id, blockReason.trim());
  };

  /* -----------------------------------------------
     🔎 FILTERS
  ------------------------------------------------- */
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      if (q && !`${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== "All" && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, statusFilter]);

  const openDrawer = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  /* -----------------------------------------------
     🖼 UI
  ------------------------------------------------- */
  return (
    <div className="p-3 sm:p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage verified Buyers (Role: User)</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
             {/* ✅ CSV BUTTON */}
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading}
              className="flex-1 sm:flex-none justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {downloading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
              Export CSV
            </button>

             {/* ✅ PDF BUTTON */}
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading}
              className="flex-1 sm:flex-none justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {downloading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
              Export PDF
            </button>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white shadow rounded-lg hover:bg-gray-100 transition-colors flex items-center text-sm font-medium text-gray-700"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
          <div className="relative w-full md:w-5/12">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              placeholder="Search name, email, or phone"
              className="pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 w-full text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-3/12 py-2 sm:py-2.5 px-3 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>
          ) : (
            <table className="w-full md:min-w-[700px]">
              <thead className="bg-indigo-50 border-b border-indigo-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{u.name}</span>
                        <div className="md:hidden flex flex-col text-xs text-gray-500 mt-1">
                          <span className={u.status === "Active" ? "text-green-600" : "text-red-600"}>{u.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.phone || 'N/A'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openDrawer(u)} className="px-3 py-1 border rounded hover:bg-gray-100 text-sm">View</button>
                        <button 
                          onClick={() => handleBlockClick(u)} 
                          className={`w-24 py-1 rounded text-white text-sm font-medium ${u.status === "Active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                        >
                          {u.status === "Active" ? "Block" : "Unblock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && <p className="p-6 text-center text-gray-500">No users found.</p>}
        </div>
      </div>

      {/* Block Modal & Drawer code remains the same as your original file... */}
      {/* ... keeping your existing Modals and Drawer here ... */}
      
      {/* BLOCK MODAL */}
       {blockModalOpen && userToBlock && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold mb-4">Block User</h3>
            <textarea 
              value={blockReason} 
              onChange={(e) => setBlockReason(e.target.value)} 
              placeholder="Reason..." 
              className="w-full border p-2 rounded mb-4" 
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setBlockModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleConfirmBlock} disabled={blockLoading} className="px-4 py-2 bg-red-600 text-white rounded">
                {blockLoading ? "Processing..." : "Confirm Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER */}
      {drawerOpen && selectedUser && (
        <div className="fixed inset-0 flex z-50">
          <div className="flex-1 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-lg bg-white p-6 overflow-y-auto">
            <div className="flex justify-between mb-4">
               <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
               <button onClick={() => setDrawerOpen(false)}>X</button>
            </div>
            {/* ... Your existing drawer content ... */}
            <p>Email: {selectedUser.email}</p>
            <p>Role: {selectedUser.role}</p>
          </div>
        </div>
      )}

    </div>
  );
}