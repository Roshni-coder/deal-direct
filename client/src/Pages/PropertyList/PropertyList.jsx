import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaRegHeart,
  FaList,
  FaMap
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon for properties
const propertyIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom red marker for highlighted property
const highlightedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const [hoveredProperty, setHoveredProperty] = useState(null);

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

  // Get properties with valid coordinates for map
  const propertiesWithCoords = useMemo(() => {
    return filteredProperties.filter(p => {
      const lat = p.address?.latitude || p.location?.coordinates?.[1];
      const lng = p.address?.longitude || p.location?.coordinates?.[0];
      return lat && lng && !isNaN(lat) && !isNaN(lng);
    }).map(p => ({
      ...p,
      lat: p.address?.latitude || p.location?.coordinates?.[1],
      lng: p.address?.longitude || p.location?.coordinates?.[0]
    }));
  }, [filteredProperties]);

  // Get map center based on properties or default to India center
  const getMapCenter = () => {
    if (propertiesWithCoords.length > 0) {
      const avgLat = propertiesWithCoords.reduce((sum, p) => sum + p.lat, 0) / propertiesWithCoords.length;
      const avgLng = propertiesWithCoords.reduce((sum, p) => sum + p.lng, 0) / propertiesWithCoords.length;
      return [avgLat, avgLng];
    }
    return [20.5937, 78.9629]; // India center
  };

  // Component to fit map bounds to markers
  const MapBoundsUpdater = ({ properties }) => {
    const map = useMap();
    
    useEffect(() => {
      if (properties.length > 0) {
        const bounds = L.latLngBounds(properties.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }, [properties, map]);
    
    return null;
  };

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

              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 ml-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FaList size={14} />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "map"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FaMap size={14} />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <main className={viewMode === "map" ? "h-[calc(100vh-180px)]" : "max-w-7xl mx-auto px-6 py-8"}>
        {viewMode === "list" && (
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Real Estate Listings</h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? "Searching..." : `Showing ${filteredProperties.length} properties`}
              </p>
            </div>
          </div>
        )}

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
        ) : viewMode === "map" ? (
          /* Map View */
          <div className="flex h-full">
            {/* Property List Sidebar */}
            <div className="w-96 h-full overflow-y-auto bg-white border-r border-slate-200 hidden lg:block">
              <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h2 className="font-bold text-slate-800">{filteredProperties.length} Properties</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredProperties.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => viewDetails(p)}
                    onMouseEnter={() => setHoveredProperty(p._id)}
                    onMouseLeave={() => setHoveredProperty(null)}
                    className={`p-4 cursor-pointer transition-colors ${
                      hoveredProperty === p._id ? "bg-red-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={resolveImageSrc(p.images?.[0]) || FALLBACK_IMG}
                        alt={p.title}
                        className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{p.title}</h3>
                        <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                          <FaMapMarkerAlt className="text-red-500" size={10} />
                          {p.address?.city}, {p.address?.state}
                        </p>
                        <p className="text-red-600 font-bold mt-2">
                          ₹{p.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 h-full relative">
              <MapContainer
                center={getMapCenter()}
                zoom={11}
                className="w-full h-full z-0"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBoundsUpdater properties={propertiesWithCoords} />
                {propertiesWithCoords.map((p) => (
                  <Marker
                    key={p._id}
                    position={[p.lat, p.lng]}
                    icon={hoveredProperty === p._id ? highlightedIcon : propertyIcon}
                    eventHandlers={{
                      click: () => viewDetails(p),
                      mouseover: () => setHoveredProperty(p._id),
                      mouseout: () => setHoveredProperty(null)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <img
                          src={resolveImageSrc(p.images?.[0]) || FALLBACK_IMG}
                          alt={p.title}
                          className="w-full h-28 object-cover rounded-lg mb-2"
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                        />
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{p.title}</h3>
                        <p className="text-slate-500 text-xs mt-1">{p.address?.city}</p>
                        <p className="text-red-600 font-bold text-lg mt-1">₹{p.price?.toLocaleString()}</p>
                        <button
                          onClick={() => viewDetails(p)}
                          className="w-full mt-2 bg-red-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                <p className="text-xs text-slate-600 font-medium">
                  📍 {propertiesWithCoords.length} properties on map
                </p>
                {filteredProperties.length - propertiesWithCoords.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    {filteredProperties.length - propertiesWithCoords.length} without location
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
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
                      <span>{p.bedrooms || 3} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaBath className="text-slate-400" />
                      <span>{p.bathrooms || 2} Baths</span>
                    </div>
                    {(p.area?.builtUpSqft || p.size) && (
                      <div className="flex items-center gap-1.5">
                        <FaRulerCombined className="text-slate-400" />
                        <span>{p.area?.builtUpSqft || p.size} {p.sizeUnit || 'sqft'}</span>
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