import React, { useEffect, useState } from "react";
import { Edit, Trash } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

const AllProperty = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch All Properties
  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/properties/list`);

      // Handle new paginated response format
      if (res.data.properties && Array.isArray(res.data.properties)) {
        setProperties(res.data.properties);
      } else if (Array.isArray(res.data)) {
        setProperties(res.data);
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Delete Property
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    try {
      const res = await axios.delete(`${API_URL}/api/properties/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });

      if (res.data.message === "Deleted") {
        toast.success("Property deleted successfully");
        setProperties((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error("Failed to delete property");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting property");
    }
  };

  // Approve Property
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `${API_URL}/api/properties/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );

      toast.success("Property approved");
      fetchProperties();
    } catch (error) {
      console.error(error);
      toast.error("Error approving property");
    }
  };

  // Disapprove Property
  const handleDisapprove = async (id) => {
    try {
      await axios.put(
        `${API_URL}/api/properties/disapprove/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );

      toast.info("Property disapproved");
      fetchProperties();
    } catch (error) {
      console.error(error);
      toast.error("Error disapproving property");
    }
  };

  // Image Handler
  const resolveImage = (img) => {
    if (!img) return "https://via.placeholder.com/120x90?text=No+Image";
    const lower = img.toLowerCase();
    if (lower.startsWith("data:")) return img;
    if (lower.startsWith("http://") || lower.startsWith("https://")) return img;
    if (img.startsWith("/uploads")) return `${API_URL}${img}`;
    return `${API_URL}/uploads/${img}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-gray-800">All Properties</h2>
        <button
          onClick={() => navigate("/admin/add-property")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Property
        </button>
      </div>

      <div className="bg-white rounded shadow border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Property Type</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Subcategory</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-center">Actions</th>
              <th className="py-3 px-4 text-center">Approval</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-5 text-gray-500">
                  Loading properties...
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-5 text-gray-500">
                  No properties found
                </td>
              </tr>
            ) : (
              properties.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <img
                      src={resolveImage(item.thumbnail || item.images?.[0])}
                      alt={item.title}
                      className="w-16 h-14 rounded-md object-cover border"
                    />
                  </td>

                  <td className="py-3 px-4 font-medium text-gray-800">{item.title}</td>

                  <td className="py-3 px-4 text-gray-700">
                    {item.propertyType?.name || "-"}
                  </td>

                  <td className="py-3 px-4 text-gray-700">{item.category?.name || "-"}</td>

                  <td className="py-3 px-4 text-gray-700">{item.subcategory?.name || "-"}</td>

                  <td className="py-3 px-4 text-gray-600">
                    {item.address?.city || item.address?.area || "-"}
                  </td>

                  <td className="py-3 px-4 font-semibold text-gray-800">
                    ₹{item.price} {item.priceUnit}
                  </td>

                  <td className="py-3 px-4 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-center space-x-3">
                    <button
                      onClick={() => navigate(`/admin/edit-property/${item._id}`)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Edit className="inline w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="inline w-5 h-5" />
                    </button>
                  </td>

                  {/* Approve/Disapprove */}
                  <td className="py-3 px-4 text-center">
                    {item.isApproved ? (
                      <button
                        onClick={() => handleDisapprove(item._id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                      >
                        Disapprove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(item._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllProperty;
