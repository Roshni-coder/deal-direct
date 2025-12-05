import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

// Assuming VITE_API_BASE_URL is correctly set in your environment
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to safely format date
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        // Use 'en-GB' or similar for a standard date format, or remove argument for locale default
        return new Date(dateString).toLocaleDateString('en-GB'); 
    } catch {
        return "Invalid Date";
    }
};

export default function AllClients() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [selectedUser, setSelectedUser] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    // Get the token once on component load
    // Using useMemo to ensure it's only retrieved once unless dependencies change (which it has none)
    const token = useMemo(() => localStorage.getItem("adminToken"), []); 

    /* -----------------------------------------------
      🔥 FETCH USERS FROM BACKEND (Fetching 'user' role)
    ------------------------------------------------- */
    const fetchUsers = async () => {
        if (!token) {
            setLoading(false);
            toast.error("Authentication token missing. Please log in.");
            return;
        }

        try {
            setLoading(true);
            // CORRECTION: The endpoint list is `/api/users/list?role=user`
            const { data } = await axios.get(`${API_URL}/api/users/list?role=user`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Process and set the user data 
            setUsers(
                data.users.map((u) => ({
                    id: u.id, // Use the already-mapped 'id' field from backend response
                    name: u.name,
                    email: u.email,
                    phone: u.phone,
                    alternatePhone: u.alternatePhone,
                    address: u.address, 
                    role: u.role,
                    // isBlocked flag determines the status
                    status: u.isBlocked ? "Blocked" : "Active", 
                    joinedAt: formatDate(u.createdAt), 

                    // FULL FIELDS
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
                toast.error("Session expired or invalid token. Please log in again.");
                localStorage.removeItem("adminToken");
            } else {
                toast.error("Failed to fetch users: " + (error.response?.data?.message || error.message || "Server Error"));
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []); // Run only once on mount

    /* -----------------------------------------------
      🔥 BLOCK / UNBLOCK USER - FIX APPLIED
    ------------------------------------------------- */
    const toggleBlock = async (userId) => {
        if (!userId) { // CRITICAL GUARD: Prevents the /block/undefined error
             toast.error("User ID is missing. Cannot perform action.");
             return;
        }
        if (!token) {
            toast.error("Not authenticated for this action.");
            return;
        }
        
        try {
            const { data } = await axios.put(
                // The URL is correct: /api/users/block/USER_ID
                `${API_URL}/api/users/block/${userId}`, 
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(data.message);
            
            const newStatus = data.isBlocked ? "Blocked" : "Active";

            // 1. Update the main 'users' list
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === userId 
                        ? { ...u, status: newStatus } 
                        : u
                )
            );

            // 2. Instantly update the selected user's status in the open drawer
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser(prev => ({
                    ...prev,
                    status: newStatus
                }));
            }

        } catch (err) {
             console.error("Block/Unblock API Error:", err.response || err);
            toast.error(err.response?.data?.message || "Action failed. Check console for details.");
        }
    };

    /* -----------------------------------------------
      🔎 FILTERING + SEARCH
    ------------------------------------------------- */
    const filtered = useMemo(() => {
        return users.filter((u) => {
            // search
            const q = search.toLowerCase();
            if (q) {
                const text = `${u.name} ${u.email} ${u.phone} ${u.role}`.toLowerCase();
                if (!text.includes(q)) return false;
            }

            if (statusFilter !== "All" && u.status !== statusFilter) return false;

            return true;
        });
    }, [users, search, statusFilter]);

    /* -----------------------------------------------
      📌 OPEN DRAWER
    ------------------------------------------------- */
    const openDrawer = (user) => {
        setSelectedUser(user);
        setDrawerOpen(true);
        setActiveTab("profile");
    };

    /* -----------------------------------------------
      📌 EXPORT CSV (Updated to export filtered list)
    ------------------------------------------------- */
    const exportCSV = () => {
        // Use 'filtered' list for export
        const rows = [
            ["Name", "Email", "Phone", "Role", "Status", "Joined Date", "Address Line 1", "City", "State", "Pincode"],
            ...filtered.map((u) => [ // Use 'filtered' here
                u.name,
                u.email,
                u.phone || 'N/A',
                u.role,
                u.status,
                u.joinedAt,
                u.address?.line1 || '',
                u.address?.city || '',
                u.address?.state || '',
                u.address?.pincode || '',
            ]),
        ];

        // Basic CSV formatting
        const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"); // Safely handle quotes

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "clients_export.csv"; // Better filename
        a.click();
        URL.revokeObjectURL(url);
        toast.info("Exported user data to CSV.");
    };

    /* -----------------------------------------------
      🖼 UI STARTS HERE
    ------------------------------------------------- */

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Client Management</h1>
                        <p className="text-gray-500 text-sm">
                            Manage Users with role 'user' (Clients/Buyers)
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={fetchUsers}
                            className="px-4 py-2 bg-white shadow rounded-md hover:bg-gray-100 transition-colors flex items-center"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Refresh'}
                        </button>
                        <button
                            onClick={exportCSV}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* FILTERS & SEARCH */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        {/* Search */}
                        <input
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                            placeholder="Search name, email, or phone"
                            className="px-3 py-2 border rounded-md bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 w-full"
                        />

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 w-full"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Blocked">Blocked</option>
                        </select>

                        <button
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("All");
                            }}
                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors w-full"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* USERS TABLE */}
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    {loading ? (
                        <div className="p-6 flex justify-center">
                            <Loader2 className="animate-spin text-indigo-600" size={28} />
                        </div>
                    ) : (
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-indigo-50 border-b border-indigo-200 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((u) => (
                                    // The unique key is already here, as requested by React warning
                                    <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors"> 
                                        <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                        <td className="px-4 py-3 text-gray-600">{u.phone || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-600 capitalize">{u.role}</td>
                                        <td className="px-4 py-3">
                                            {u.status === "Active" ? (
                                                <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                                                    Blocked
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openDrawer(u)}
                                                    className="px-3 py-1 bg-white shadow-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 text-sm transition-colors"
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() => toggleBlock(u.id)}
                                                    className={`px-3 py-1 rounded-md text-white text-sm font-medium transition-colors ${
                                                        u.status === "Active"
                                                            ? "bg-red-600 hover:bg-red-700"
                                                            : "bg-green-600 hover:bg-green-700"
                                                    }`}
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

                    {!loading && filtered.length === 0 && (
                        <p className="p-6 text-center text-gray-500">
                            No users found matching the current filters.
                        </p>
                    )}
                    
                    {/* Show total count */}
                    {!loading && filtered.length > 0 && (
                        <div className="p-3 border-t text-sm text-gray-600">
                            Showing **{filtered.length}** of **{users.length}** total clients.
                        </div>
                    )}
                </div>
            </div>

            {/* DRAWER */}
            {drawerOpen && selectedUser && (
                <div className="fixed inset-0 flex z-50">
                    <div
                        className="flex-1 bg-black/50 transition-opacity duration-300"
                        onClick={() => setDrawerOpen(false)}
                    />

                    <div className="w-full max-w-lg bg-white shadow-2xl p-6 overflow-y-auto transform translate-x-0 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                                <p className="text-indigo-600 font-medium">{selectedUser.email}</p>
                            </div>
                            <button onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                                &times;
                            </button>
                        </div>
                        
                        <div className="flex gap-3 mb-6">
                            <button
                                // CRITICAL FIX: Ensure selectedUser.id is not undefined before calling toggleBlock
                                onClick={() => selectedUser.id && toggleBlock(selectedUser.id)}
                                className={`px-4 py-2 text-white rounded-md text-sm font-semibold transition-colors ${
                                    selectedUser.status === "Active"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {selectedUser.status === "Active" ? "Block User" : "Unblock User"}
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-4">
                            {/* The warning about missing keys could be here if you added more tabs */}
                            {["profile"].map((t) => (
                                <button
                                    key={t} // Added key for good measure, assuming it's needed here.
                                    onClick={() => setActiveTab(t)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                                        activeTab === t
                                            ? "border-indigo-600 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* PROFILE TAB CONTENT (Detailed View) */}
                        {activeTab === "profile" && (
                            <div className="space-y-4 text-gray-700">
                                <div className="p-3 bg-indigo-50 rounded-lg">
                                    <p className="font-semibold text-gray-900">User Role: <span className="text-indigo-700 capitalize">{selectedUser.role}</span></p>
                                    <p className="font-semibold text-gray-900">Status: 
                                        <span className={`ml-2 font-bold ${selectedUser.status === "Active" ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedUser.status}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600"><strong>Joined Date:</strong> {selectedUser.joinedAt}</p>
                                </div>
                                
                                <p><strong>Phone:</strong> {selectedUser.phone || "N/A"}</p>
                                <p><strong>Alternate Phone:</strong> {selectedUser.alternatePhone || "N/A"}</p>

                                <p><strong>Gender:</strong> {selectedUser.gender || "N/A"}</p>
                                <p><strong>Date of Birth:</strong> 
                                    {selectedUser.dateOfBirth 
                                        ? formatDate(selectedUser.dateOfBirth)
                                        : "N/A"}
                                </p>

                                <p><strong>Bio:</strong> {selectedUser.bio || "N/A"}</p>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Address Details:</h4>
                                    {selectedUser.address ? (
                                        <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
                                            <p><strong>Line 1:</strong> {selectedUser.address.line1 || 'N/A'}</p>
                                            <p><strong>Line 2:</strong> {selectedUser.address.line2 || 'N/A'}</p>
                                            <p><strong>City/Town:</strong> {selectedUser.address.city || 'N/A'}</p>
                                            <p><strong>State:</strong> {selectedUser.address.state || 'N/A'}</p>
                                            <p><strong>Pincode:</strong> <span className="font-bold text-indigo-700">{selectedUser.address.pincode || 'N/A'}</span></p>
                                            <p><strong>Country:</strong> {selectedUser.address.country || 'N/A'}</p>
                                        </div>
                                    ) : (
                                        <p className="text-red-500">No address information available.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mt-4 mb-2">Preferences:</h4>
                                    <ul className="ml-4 list-disc list-inside bg-gray-50 p-3 rounded-lg text-sm">
                                        <li>Email Notifications: <span className="font-medium">{selectedUser?.preferences?.emailNotifications ? "Yes" : "No"}</span></li>
                                        <li>SMS Notifications: <span className="font-medium">{selectedUser?.preferences?.smsNotifications ? "Yes" : "No"}</span></li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}