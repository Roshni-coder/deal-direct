import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddSubCategory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subName, setSubName] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories/list-category`);
        setCategories(res.data);
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // 💾 Add Subcategory
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !subName.trim())
      return toast.warn("Please fill all fields");

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const { data } = await axios.post(
        `${API_URL}/api/subcategories/add`,
        { name: subName, category: selectedCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(data.message || "Subcategory added successfully");
      setSelectedCategory("");
      setSubName("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          ➕ Add New Subcategory
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Subcategory Name
            </label>
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="Enter subcategory name"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-medium ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              } transition`}
          >
            {loading ? "Adding..." : "Add Subcategory"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubCategory;