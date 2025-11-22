// src/pages/PropertyPage2.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import MiddelComp from "../../Components/middelComp";

const API_BASE = import.meta.env.VITE_API_BASE;

const initialFilters = {
  search: "",
  propertyType: "",
  category: "",
  subcategory: "",
  city: "",
};

const PropertyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [propertyTypes, setPropertyTypes] = useState([]); // Hierarchical: PT -> Categories -> Subcategories

  // ---- image resolver (same logic as Home) ----
  const resolveImageSrc = (img) => {
    if (!img) return "";
    const s = String(img).trim();
    const lower = s.toLowerCase();
    if (lower.startsWith("data:")) return s;
    if (lower.startsWith("http://") || lower.startsWith("https://")) return s;
    if (s.startsWith("/uploads")) return `${API_BASE}${s}`;
    return `${API_BASE}/uploads/${s}`;
  };

  const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800";

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // Fetch hierarchical filters (PropertyType → Categories → Subcategories)
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);
        const [ptRes, catRes, subRes] = await Promise.all([
          axios.get(`${API_BASE}/api/propertyTypes/list-propertytype`),
          axios.get(`${API_BASE}/api/categories/list-category`),
          axios.get(`${API_BASE}/api/subcategories/list`),
        ]);

        const structuredData = ptRes.data.map((pt) => ({
          ...pt,
          categories: catRes.data
            .filter((c) => c.propertyType?._id === pt._id)
            .map((cat) => ({
              ...cat,
              subcategories: subRes.data.filter(
                (s) => s.category?._id === cat._id
              ),
            })),
        }));

        setPropertyTypes(structuredData);
      } catch (err) {
        console.error("Error fetching filter data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilterData();
  }, []);

  // Fetch all properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/properties/property-list`);
        setProperties(res.data.data || []);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Parse URL search params
  useEffect(() => {
    if (!location.search) return;
    const params = new URLSearchParams(location.search);
    const updates = {};
    ["propertyType", "category", "subcategory", "city", "search"].forEach(
      (key) => {
        const value = params.get(key);
        if (value) updates[key] = value;
      }
    );
    const intent = params.get("intent");
    if (intent && !updates.search) updates.search = intent;
    if (Object.keys(updates).length)
      setFilters((prev) => ({ ...prev, ...updates }));
  }, [location.search]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "propertyType" ? { category: "", subcategory: "" } : {}),
      ...(field === "category" ? { subcategory: "" } : {}),
    }));
  };

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    const query = filters.search.toLowerCase();

    const matchesSearch = query
      ? [
        p.title,
        p.address?.city,
        p.address?.state,
        p.category?.name,
        p.subcategory?.name,
        p.propertyType?.name,
      ]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(query))
      : true;

    const matchPropertyType = filters.propertyType
      ? String(p.propertyType?._id || p.propertyType) ===
      String(filters.propertyType)
      : true;

    const matchCategory = filters.category
      ? String(p.category?._id || p.category) === String(filters.category)
      : true;

    const matchSubcategory = filters.subcategory
      ? String(p.subcategory?._id || p.subcategory) ===
      String(filters.subcategory)
      : true;

    const matchCity = filters.city
      ? (p.address?.city || "")
        .toLowerCase()
        .includes(filters.city.toLowerCase())
      : true;

    return (
      matchesSearch &&
      matchPropertyType &&
      matchCategory &&
      matchSubcategory &&
      matchCity
    );
  });

  const viewDetails = (property) =>
    navigate(`/properties/${property._id}`, { state: { property } });

  return (
    <div className="min-h-screen -mt-3 bg-white flex flex-col">

      {/* Filters */}
      {/* ===========================
    🔍 PREMIUM SEARCH SECTION
   =========================== */}
      <section className="py-10 px-4 sm:px-6 mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Search Box */}
          <div className="bg-white rounded-sm shadow-xl border border-gray-100 p-6 space-y-4">

            {/* 🔍 Search Bar Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">

              {/* Search Input */}
              <div className="flex items-center gap-3 w-full bg-gray-100 px-4 py-3 rounded-xl border border-gray-200">
                <input
                  type="text"
                  placeholder="Search by location, title, category..."
                  className="flex-1 bg-transparent outline-none text-gray-700"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              {/* Search Button */}
              <button
                onClick={() => console.log("Searching...")}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold 
            shadow-lg transition-all duration-300 w-full lg:w-auto"
              >
                Search
              </button>
            </div>

            {/* 🔻 Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">

              {/* Property Type */}
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                className="w-full border border-gray-300 rounded-sm px-3 py-3 text-sm outline-none 
            focus:ring-2 focus:ring-red-500 bg-gray-50"
              >
                <option value="">Property Type</option>
                {propertyTypes.map((pt) => (
                  <option key={pt._id} value={pt._id}>{pt.name}</option>
                ))}
              </select>

              {/* Category */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                disabled={!filters.propertyType}
                className={`w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none 
            focus:ring-2 focus:ring-red-500 
            ${!filters.propertyType ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"}`}
              >
                <option value="">Category</option>
                {filters.propertyType &&
                  propertyTypes
                    .find((pt) => pt._id === filters.propertyType)
                    ?.categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
              </select>

              {/* Subcategory */}
              <select
                value={filters.subcategory}
                onChange={(e) => handleFilterChange("subcategory", e.target.value)}
                disabled={!filters.category}
                className={`w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none 
            focus:ring-2 focus:ring-red-500
            ${!filters.category ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"}`}
              >
                <option value="">Subcategory</option>
                {filters.category &&
                  propertyTypes
                    .find((pt) => pt._id === filters.propertyType)
                    ?.categories.find((cat) => cat._id === filters.category)
                    ?.subcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
              </select>

              {/* City */}
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                placeholder="City (e.g. Mumbai)"
                className="border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none 
            focus:ring-2 focus:ring-red-500 bg-gray-50"
              />
            </div>

            {/* RESET */}
            {(filters.search || filters.propertyType || filters.category || filters.subcategory || filters.city) && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setFilters(initialFilters)}
                  className="text-sm text-red-600 font-semibold hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Property Cards */}
      <main className="flex-1 p-4 sm:p-6 bg-white rounded-xl shadow-sm max-w-6xl mx-auto w-full mt-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
          🏠 Available Properties
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 py-20">
            Loading properties...
          </p>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4 text-base sm:text-lg">
              No properties match your search 😔
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded shadow-lg hover:shadow-2xl transition-transform duration-300 overflow-hidden cursor-pointer"
                onClick={() => viewDetails(p)}
              >
                <div className="relative h-60 sm:h-64 overflow-hidden">
                  <img
                    src={resolveImageSrc(p.images?.[0]) || FALLBACK_IMG}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                </div>

                <div className="p-5 text-left">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {p.title}
                  </h3>

                  <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-red-500" />
                    {p.address?.city}, {p.address?.state}
                  </p>

                  <p className="text-red-600 font-bold text-xl mb-5">
                    ₹{p.price?.toLocaleString()} {p.priceUnit || ""}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewDetails(p);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white py-2.5 rounded-xl font-semibold hover:scale-[1.02] hover:shadow-lg transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PropertyPage;
