import React, { useEffect, useState } from "react";
import { 
    Trash, 
    CheckCircle, 
    XCircle, 
    MapPin, 
    Loader2, 
    DollarSign, 
    Home as HomeIcon,
    RefreshCw 
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

const AllProperty = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const adminToken = localStorage.getItem("adminToken");

    // Utility to safely extract property list
    const extractList = (resData) => {
        if (!resData) return [];
        if (Array.isArray(resData)) return resData;
        if (Array.isArray(resData.data)) return resData.data;
        if (Array.isArray(resData.properties)) return resData.properties;
        if (Array.isArray(resData?.success?.data)) return resData.success.data;
        if (Array.isArray(resData?.data?.data)) return resData.data.data;
        return [];
    };

    // Utility to construct the full image URL
    const resolveImage = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1560518883-cf3726f1454c?fit=crop&w=600&q=80";
        const s = String(img).toLowerCase();
        if (s.startsWith("data:") || s.startsWith("http")) return img;
        if (img.startsWith("/uploads")) return `${API_URL}${img}`;
        return `${API_URL}/uploads/${img}`;
    };

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/properties/list`);
            setProperties(extractList(res.data));
        } catch (err) {
            toast.error("Failed to fetch properties");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    /* -----------------------------------------------
      🗑️ DELETE HANDLER (Final Rejection)
    ------------------------------------------------- */
    const handleDelete = async (id) => {
        if (!window.confirm("CONFIRM DELETION: Are you sure you want to permanently delete this project? This cannot be undone.")) return;
        try {
            await axios.delete(`${API_URL}/api/properties/delete/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            toast.success("Project Permanently Deleted/Rejected");
            setProperties((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    /* -----------------------------------------------
      ✅ PUBLISH / UNPUBLISH HANDLER
    ------------------------------------------------- */
    const toggleStatus = async (id, status) => {
        try {
            await axios.put(
                `${API_URL}/api/properties/${status}/${id}`,
                {},
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );
            toast.success(status === "approve" ? "Property Published Successfully!" : "Listing pulled down.");
            fetchProperties(); 
        } catch (err) {
            toast.error("Status update failed. Check network or server logs.");
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-indigo-100">
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                    <HomeIcon className="w-8 h-8 text-indigo-600"/> All Property Listings
                </h2>
                <button
                    onClick={fetchProperties}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold shadow-lg transition"
                >
                    <RefreshCw className="w-4 h-4 inline mr-1" /> Reload Data
                </button>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                {/* Loading Skeleton */}
                {loading &&
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white shadow-xl rounded-xl p-6 animate-pulse border border-gray-200">
                            <div className="w-full h-40 bg-gray-200 rounded-lg" />
                            <div className="mt-4 h-5 w-3/4 bg-gray-200 rounded" />
                            <div className="mt-2 h-4 w-1/3 bg-gray-200 rounded" />
                        </div>
                    ))}

                {/* No Properties Message */}
                {!loading && properties.length === 0 && (
                    <p className="text-center col-span-full text-xl font-medium text-gray-500 bg-white p-10 rounded-xl shadow-md">
                        🎉 No properties found in the database.
                    </p>
                )}

                {/* Property Cards */}
                {!loading &&
                    properties.map((item) => {
                        const id = item._id;
                        const isApproved = item.isApproved;
                        
                        // Use purple for pending/red for deletion, green for active
                        const statusColor = isApproved ? "bg-green-600" : "bg-purple-600";
                        const statusLabel = isApproved ? "PUBLISHED" : "PENDING";

                        return (
                            <div
                                key={id}
                                className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative group"
                            >
                                {/* STATUS BANNER */}
                                <div className={`absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white shadow-lg rounded-bl-lg ${statusColor}`}>
                                    {statusLabel}
                                </div>

                                {/* Image */}
                                <img
                                    src={resolveImage(item.images?.[0])}
                                    className="w-full h-48 object-cover group-hover:scale-[1.03] transition duration-300"
                                    alt={item.title || "Property image"}
                                />

                                {/* Content */}
                                <div className="p-5 space-y-3">

                                    {/* Title */}
                                    <h3 className="text-xl font-extrabold text-gray-900 line-clamp-1">
                                        {item.title || 'Untitled Property'}
                                    </h3>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                            <span className="line-clamp-1">
                                                {item.address?.city || "Unknown City"}
                                            </span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <HomeIcon className="w-4 h-4 text-indigo-500" />
                                            {item.propertyType?.name || "N/A Type"}
                                        </p>
                                    </div>
                                    
                                    {/* Price and Date */}
                                    <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                                        <p className="flex items-center gap-1 font-extrabold text-2xl text-green-700">
                                            <DollarSign className="w-5 h-5" /> {item.price || '0'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Posted: {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    

                                    {/* Action Buttons - Simplified Moderation */}
                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        
                                        {/* 1. PRIMARY MODERATION ACTION (PUBLISH/UNPUBLISH) */}
                                        {isApproved ? (
                                            <button
                                                onClick={() => toggleStatus(id, "disapprove")}
                                                className="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-md"
                                            >
                                                <XCircle className="w-4 h-4" /> UNPUBLISH
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => toggleStatus(id, "approve")}
                                                className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-md"
                                            >
                                                <CheckCircle className="w-4 h-4" /> PUBLISH
                                            </button>
                                        )}
                                        
                                        {/* 2. DELETE/REJECT ACTION (Final removal) */}
                                        <button
                                            onClick={() => handleDelete(id)}
                                            className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-md"
                                        >
                                            <Trash className="w-4 h-4" /> DELETE
                                        </button>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default AllProperty;