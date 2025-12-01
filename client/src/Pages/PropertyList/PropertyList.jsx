import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaRegHeart
} from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE;

const initialFilters = {
  search: "",
  propertyType: "",
  category: "",
  city: "",
  priceRange: "",
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
    <div className="h-64 bg-slate-200"></div>
    <div className="p-5 space-y-3">
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="flex gap-4 pt-2">
        <div className="h-8 bg-slate-200 rounded w-16"></div>
        <div className="h-8 bg-slate-200 rounded w-16"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
    </div>
  </div>
);

const PropertyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);

  const resolveImageSrc = (img) => {
    if (!img) return "";
    const s = String(img).trim();
    const lower = s.toLowerCase();
    if (lower.startsWith("data:") || lower.startsWith("http")) return s;
    if (s.startsWith("/uploads")) return `${API_BASE}${s}`;
    return `${API_BASE}/uploads/${s}`;
  };

  const FALLBACK_IMG = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800";

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [propsRes, ptRes] = await Promise.all([
          axios.get(`${API_BASE}/api/properties/property-list`),
          axios.get(`${API_BASE}/api/propertyTypes/list-propertytype`),
        ]);

        const propsData = propsRes.data.data || [];
        setProperties(propsData);
        setPropertyTypes(ptRes.data || []);
        const uniqueCities = [...new Set(propsData.map(p => p.address?.city).filter(Boolean))];
        setCities(uniqueCities);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!location.search) return;
    const params = new URLSearchParams(location.search);
    const updates = {};
    ["propertyType", "category", "city", "search"].forEach((key) => {
      const value = params.get(key);
      if (value) updates[key] = value;
    });
    const intent = params.get("intent");
    if (intent && !updates.search) updates.search = intent;

    if (Object.keys(updates).length) setFilters((prev) => ({ ...prev, ...updates }));
  }, [location.search]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const filteredProperties = properties.filter((p) => {
    const query = filters.search.toLowerCase();

    const matchesSearch = query
      ? [p.title, p.address?.city, p.address?.state, p.propertyTypeName, p.propertyType?.name]
        .filter(Boolean).some((f) => f.toLowerCase().includes(query))
      : true;

    const matchType = filters.propertyType
      ? String(p.propertyType?._id || p.propertyType) === String(filters.propertyType)
      : true;

    const matchCity = filters.city
      ? (p.address?.city || "").toLowerCase() === filters.city.toLowerCase()
      : true;

    let matchPrice = true;
    if (filters.priceRange) {
      const price = p.price || 0;
      if (filters.priceRange === "low") matchPrice = price < 5000000;
      if (filters.priceRange === "mid") matchPrice = price >= 5000000 && price <= 15000000;
      if (filters.priceRange === "high") matchPrice = price > 15000000;
    }

    return matchesSearch && matchType && matchCity && matchPrice;
  });

  const viewDetails = (property) =>
    navigate(`/properties/${property._id}`, { state: { property } });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pt-16">

      {/* Filter Bar - Sticky */}
      <div className="sticky top-16 z-30 bg-white shadow-md border-b border-slate-200 py-5 px-6 transition-all">
        <div className="max-w-7xl mx-auto">

          {/* Search Bar with Button */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-4">
            <div className="relative w-full lg:w-2/5 flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search project, locality..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 rounded-xl outline-none transition-all text-sm"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFilterChange("search", filters.search)}
                />
              </div>
              <button
                onClick={() => handleFilterChange("search", filters.search)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <FaSearch className="text-sm" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Dropdowns Group */}
            <div className="flex flex-wrap items-center gap-3">

              {/* City Dropdown */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-slate-200 py-3 pl-4 pr-10 rounded-xl text-sm font-medium hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer shadow-sm transition-all"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FaMapMarkerAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
              </div>

              {/* Type Dropdown */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-slate-200 py-3 pl-4 pr-10 rounded-xl text-sm font-medium hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer shadow-sm transition-all"
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(pt => <option key={pt._id} value={pt._id}>{pt.name}</option>)}
                </select>
                <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
              </div>

              {/* Price Range */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-slate-200 py-3 pl-4 pr-10 rounded-xl text-sm font-medium hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer shadow-sm transition-all"
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                >
                  <option value="">Price Range</option>
                  <option value="low">Under ₹50 Lac</option>
                  <option value="mid">₹50 Lac - ₹1.5 Cr</option>
                  <option value="high">Above ₹1.5 Cr</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">₹</span>
              </div>

              {/* Clear Button */}
              {(filters.search || filters.city || filters.propertyType || filters.priceRange) && (
                <button
                  onClick={() => setFilters(initialFilters)}
                  className="text-red-600 text-sm font-semibold hover:underline px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Real Estate Listings</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? "Searching..." : `Showing ${filteredProperties.length} properties`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏠</div>
            <h3 className="text-xl font-bold text-slate-700">No properties found</h3>
            <button
              onClick={() => setFilters(initialFilters)}
              className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-full text-sm hover:bg-red-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((p) => (
              <div
                key={p._id}
                onClick={() => viewDetails(p)}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1 rounded-md shadow-sm">
                      {p.category?.name || "For Sale"}
                    </span>
                  </div>
                  <button className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-red-500 backdrop-blur-sm rounded-full text-white transition-colors">
                    <FaRegHeart />
                  </button>
                  <img
                    src={resolveImageSrc(p.images?.[0]) || FALLBACK_IMG}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-2xl font-bold drop-shadow-md">
                      ₹{p.price?.toLocaleString()} <span className="text-sm font-normal opacity-90">{p.priceUnit}</span>
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-red-600 transition-colors">
                      {p.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-sm flex items-center gap-1 mb-4 line-clamp-1">
                    <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                    {p.address?.city}, {p.address?.state}
                  </p>
                  <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-slate-600 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <FaBed className="text-slate-400" />
                      <span>3 Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaBath className="text-slate-400" />
                      <span>2 Baths</span>
                    </div>
                    {p.size && (
                      <div className="flex items-center gap-1.5">
                        <FaRulerCombined className="text-slate-400" />
                        <span>{p.size} {p.sizeUnit}</span>
                      </div>
                    )}
                  </div>
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