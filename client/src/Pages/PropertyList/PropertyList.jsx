import React, { useState, useEffect, useMemo, useRef } from "react";
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
  FaMap,
  FaCrosshairs,
  FaTimes
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker styles
const markerStyles = `
  .custom-property-marker {
    background: transparent !important;
    border: none !important;
  }
  .custom-property-marker > div {
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  .custom-property-marker > div:hover {
    transform: scale(1.1);
    z-index: 1000 !important;
  }
  .leaflet-popup-content-wrapper {
    border-radius: 12px !important;
    padding: 0 !important;
  }
  .leaflet-popup-content {
    margin: 12px !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = markerStyles;
  document.head.appendChild(styleSheet);
}
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

// Custom pin drop marker (green)
const pinDropIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create simple pin marker (default state)
const createSimplePinMarker = (price, isHighlighted = false) => {
  const formattedPrice = price >= 10000000
    ? `₹${(price / 10000000).toFixed(1)}Cr`
    : price >= 100000
      ? `₹${(price / 100000).toFixed(0)}L`
      : `₹${price?.toLocaleString()}`;

  return L.divIcon({
    className: 'custom-property-marker',
    html: `
      <div style="
        background: ${isHighlighted ? '#dc2626' : '#ffffff'};
        color: ${isHighlighted ? '#ffffff' : '#1e293b'};
        padding: 6px 10px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 11px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        border: 2px solid ${isHighlighted ? '#dc2626' : '#e2e8f0'};
        position: relative;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        🏠 ${formattedPrice}
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${isHighlighted ? '#dc2626' : '#ffffff'};
        "></div>
      </div>
    `,
    iconSize: [80, 36],
    iconAnchor: [40, 36],
    popupAnchor: [0, -30]
  });
};

// Create detailed property marker with image (hover state)
const createDetailedPropertyMarker = (property) => {
  const price = property.price;
  const formattedPrice = price >= 10000000
    ? `₹${(price / 10000000).toFixed(1)}Cr`
    : price >= 100000
      ? `₹${(price / 100000).toFixed(0)}L`
      : `₹${price?.toLocaleString()}`;

  // Get first image or fallback
  const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=60&fit=crop';
  const title = property.title?.substring(0, 20) + (property.title?.length > 20 ? '...' : '') || 'Property';
  const location = property.address?.city || property.city || '';

  return L.divIcon({
    className: 'custom-property-marker',
    html: `
      <div style="
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        border: 2px solid #dc2626;
        overflow: hidden;
        width: 160px;
        cursor: pointer;
        z-index: 1000 !important;
      ">
        <div style="
          width: 100%;
          height: 70px;
          background-image: url('${imageUrl}');
          background-size: cover;
          background-position: center;
          position: relative;
        ">
          <div style="
            position: absolute;
            bottom: 4px;
            left: 4px;
            background: #dc2626;
            color: #ffffff;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
          ">${formattedPrice}</div>
        </div>
        <div style="
          padding: 8px 10px;
          background: #ffffff;
        ">
          <div style="
            font-size: 12px;
            font-weight: 600;
            color: #1e293b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${title}</div>
          <div style="
            font-size: 11px;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 3px;
            margin-top: 3px;
          ">
            <span>📍</span>${location}
          </div>
        </div>
        <div style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid #ffffff;
        "></div>
      </div>
    `,
    iconSize: [160, 130],
    iconAnchor: [80, 130],
    popupAnchor: [0, -125]
  });
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const API_BASE = import.meta.env.VITE_API_BASE;

// Simple in-memory cache for suggestions
const suggestionsCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

const initialFilters = {
  search: "",
  propertyType: "",
  category: "",
  city: "",
  priceRange: "",
  availableFor: "", // "Rent" or "Sell"
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

  // Pin drop states
  const [pinDropMode, setPinDropMode] = useState(false);
  const [droppedPin, setDroppedPin] = useState(null); // { lat, lng }
  const [searchRadius, setSearchRadius] = useState(2); // km

  // Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const abortControllerRef = useRef(null);

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

  // Optimized autocomplete with caching and request cancellation
  useEffect(() => {
    const searchTerm = filters.search?.trim() || '';

    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Check cache first
    const cacheKey = searchTerm.toLowerCase();
    const cached = suggestionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setSuggestions(cached.data);
      setShowSuggestions(cached.data.length > 0);
      setSelectedIndex(-1);
      return;
    }

    const fetchSuggestions = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoadingSuggestions(true);
      try {
        const response = await axios.get(
          `${API_BASE}/api/properties/suggestions`,
          {
            params: { q: searchTerm },
            signal: abortControllerRef.current.signal,
            timeout: 3000
          }
        );

        const data = response.data.suggestions || [];

        // Cache the result
        suggestionsCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });

        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // Debounce: 150ms for fast response
    const debounceTimer = setTimeout(fetchSuggestions, 150);
    return () => {
      clearTimeout(debounceTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters.search]);

  // Handle keyboard navigation for suggestions
  const handleSearchKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleFilterChange("search", filters.search);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleFilterChange("search", filters.search);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setFilters(prev => ({ ...prev, search: suggestion.value }));
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!location.search) return;
    const params = new URLSearchParams(location.search);
    const updates = {};
    ["propertyType", "category", "city", "search", "availableFor"].forEach((key) => {
      const value = params.get(key);
      if (value) updates[key] = value;
    });
    const intent = params.get("intent");
    if (intent && !updates.search) updates.search = intent;

    // Check for view mode (map or list)
    const viewParam = params.get("view");
    if (viewParam === "map" || viewParam === "list") {
      setViewMode(viewParam);
    }

    if (Object.keys(updates).length) setFilters((prev) => ({ ...prev, ...updates }));
  }, [location.search]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const filteredProperties = properties.filter((p) => {
    const query = filters.search.toLowerCase();

    const matchesSearch = query
      ? [p.title, p.address?.city, p.address?.state, p.propertyTypeName, p.propertyType?.name, p.bhk]
        .filter(Boolean).some((f) => f.toLowerCase().includes(query))
      : true;

    const matchType = filters.propertyType
      ? String(p.propertyType?._id || p.propertyType) === String(filters.propertyType)
      : true;

    const matchCity = filters.city
      ? (p.address?.city || "").toLowerCase() === filters.city.toLowerCase()
      : true;

    // Filter by listing type (Rent/Sell)
    const matchListingType = filters.availableFor
      ? p.listingType?.toLowerCase() === filters.availableFor.toLowerCase()
      : true;

    let matchPrice = true;
    if (filters.priceRange) {
      const price = p.price || 0;
      if (filters.priceRange === "low") matchPrice = price < 5000000;
      if (filters.priceRange === "mid") matchPrice = price >= 5000000 && price <= 15000000;
      if (filters.priceRange === "high") matchPrice = price > 15000000;
    }

    return matchesSearch && matchType && matchCity && matchPrice && matchListingType;
  });

  // Get properties with valid coordinates for map
  const propertiesWithCoords = useMemo(() => {
    const withCoords = filteredProperties.filter(p => {
      // Check multiple possible locations for lat/lng
      const lat = p.lat || p.address?.latitude || p.location?.coordinates?.[1];
      const lng = p.lng || p.address?.longitude || p.location?.coordinates?.[0];
      return lat && lng && !isNaN(lat) && !isNaN(lng);
    }).map(p => ({
      ...p,
      lat: p.lat || p.address?.latitude || p.location?.coordinates?.[1],
      lng: p.lng || p.address?.longitude || p.location?.coordinates?.[0]
    }));

    // Debug log
    console.log(`Properties: ${filteredProperties.length} total, ${withCoords.length} with coordinates`);
    if (withCoords.length > 0) {
      console.log('Sample property with coords:', withCoords[0]?.title, withCoords[0]?.lat, withCoords[0]?.lng);
    }

    return withCoords;
  }, [filteredProperties]);

  // Filter properties near dropped pin
  const nearbyProperties = useMemo(() => {
    if (!droppedPin) return propertiesWithCoords;
    return propertiesWithCoords.filter(p => {
      const distance = calculateDistance(droppedPin.lat, droppedPin.lng, p.lat, p.lng);
      return distance <= searchRadius;
    }).map(p => ({
      ...p,
      distance: calculateDistance(droppedPin.lat, droppedPin.lng, p.lat, p.lng)
    })).sort((a, b) => a.distance - b.distance);
  }, [propertiesWithCoords, droppedPin, searchRadius]);

  // Get map center based on properties or default to India center
  const getMapCenter = () => {
    if (droppedPin) {
      return [droppedPin.lat, droppedPin.lng];
    }
    if (propertiesWithCoords.length > 0) {
      const avgLat = propertiesWithCoords.reduce((sum, p) => sum + p.lat, 0) / propertiesWithCoords.length;
      const avgLng = propertiesWithCoords.reduce((sum, p) => sum + p.lng, 0) / propertiesWithCoords.length;
      return [avgLat, avgLng];
    }
    return [20.5937, 78.9629]; // India center
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (pinDropMode) {
          setDroppedPin({ lat: e.latlng.lat, lng: e.latlng.lng });
          setPinDropMode(false);
        }
      }
    });
    return null;
  };

  // Component to fit map bounds to markers
  const MapBoundsUpdater = ({ properties }) => {
    const map = useMap();

    useEffect(() => {
      if (droppedPin) {
        map.setView([droppedPin.lat, droppedPin.lng], 14);
      } else if (properties.length > 0) {
        const bounds = L.latLngBounds(properties.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }, [properties, map, droppedPin]);

    return null;
  };

  const viewDetails = (property) =>
    navigate(`/properties/${property._id}`, { state: { property } });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 -mt-10 lg:-mt-8">

      {/* Filter Bar - Sticky */}
      <div className="sticky top-1 lg:top-20 z-30 bg-white shadow-md border-b border-slate-200 py-4 mb-6 px-6 transition-all">
        <div className="max-w-7xl mx-auto">

          {/* Search Bar with Button */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-4">
            <div className="relative w-full lg:w-2/5 flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search project, locality..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 rounded-xl outline-none transition-all text-sm"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => filters.search?.trim().length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                />

                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
                  >
                    {isLoadingSuggestions && (
                      <div className="px-4 py-2 text-sm text-slate-400">Loading...</div>
                    )}
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.type}-${suggestion.value}`}
                        className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${index === selectedIndex ? 'bg-red-50' : 'hover:bg-slate-50'
                          }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        {suggestion.type === 'city' ? (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                            <FaMapMarkerAlt className="text-white text-lg" />
                          </div>
                        ) : suggestion.image ? (
                          <img
                            src={suggestion.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${suggestion.type === 'project' ? 'bg-blue-100 text-blue-600' :
                            'bg-green-100 text-green-600'
                            }`}>
                            {suggestion.type === 'project' ? '🏠' : '📍'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {suggestion.value}
                          </div>
                          {suggestion.subtitle && suggestion.type !== 'city' && (
                            <div className="text-xs text-slate-500 truncate">{suggestion.subtitle}</div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${suggestion.type === 'project' ? 'bg-blue-50 text-blue-600' :
                          suggestion.type === 'locality' ? 'bg-green-50 text-green-600' :
                            'bg-orange-50 text-orange-600'
                          }`}>
                          {suggestion.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  handleFilterChange("search", filters.search);
                  setShowSuggestions(false);
                }}
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
              {(filters.search || filters.city || filters.propertyType || filters.priceRange || filters.availableFor) && (
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "list"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <FaList size={14} />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "map"
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
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaMapMarkerAlt className="text-4xl text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No Properties Listed</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              We couldn't find any properties matching your search criteria. Try adjusting your filters or search for a different location.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setFilters(initialFilters)}
                className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : viewMode === "map" ? (
          /* Map View */
          <div className="flex h-full">
            {/* Property List Sidebar */}
            <div className="w-96 h-full overflow-y-auto bg-white border-r border-slate-200 hidden lg:block">
              <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                {droppedPin ? (
                  <div>
                    <h2 className="font-bold text-green-600">
                      🎯 {nearbyProperties.length} Nearby Properties
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Within {searchRadius} km of pin</p>
                  </div>
                ) : (
                  <h2 className="font-bold text-slate-800">{filteredProperties.length} Properties</h2>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {(droppedPin ? nearbyProperties : filteredProperties).map((p) => (
                  <div
                    key={p._id}
                    onClick={() => viewDetails(p)}
                    onMouseEnter={() => setHoveredProperty(p._id)}
                    onMouseLeave={() => setHoveredProperty(null)}
                    className={`p-4 cursor-pointer transition-colors ${hoveredProperty === p._id ? "bg-red-50" : "hover:bg-slate-50"
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
                        {p.distance !== undefined && (
                          <p className="text-green-600 text-xs font-medium mt-1">
                            📍 {p.distance.toFixed(1)} km away
                          </p>
                        )}
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
              {/* Pin Drop Controls */}
              <div className="absolute top-4 right-4 z-[40] flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (droppedPin) {
                      setDroppedPin(null);
                      setPinDropMode(false);
                    } else {
                      setPinDropMode(!pinDropMode);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg font-medium text-sm transition-all ${pinDropMode
                    ? 'bg-green-600 text-white animate-pulse'
                    : droppedPin
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {droppedPin ? (
                    <>
                      <FaTimes /> Clear Pin
                    </>
                  ) : pinDropMode ? (
                    <>
                      <FaCrosshairs className="animate-ping" /> Click on map...
                    </>
                  ) : (
                    <>
                      <FaCrosshairs /> Drop Pin
                    </>
                  )}
                </button>

                {/* Radius Selector */}
                {droppedPin && (
                  <div className="bg-white rounded-lg shadow-lg p-3">
                    <label className="text-xs text-slate-600 font-medium block mb-2">
                      Search Radius: {searchRadius} km
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>0.5 km</span>
                      <span>10 km</span>
                    </div>
                  </div>
                )}
              </div>

              <MapContainer
                center={getMapCenter()}
                zoom={11}
                className={`w-full h-full z-0 ${pinDropMode ? 'cursor-crosshair' : ''}`}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
                <MapBoundsUpdater properties={droppedPin ? nearbyProperties : propertiesWithCoords} />

                {/* No Properties Message */}
                {propertiesWithCoords.length === 0 && !droppedPin && (
                  <div className="leaflet-control absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[40]">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-sm">
                      <div className="text-4xl mb-3">📍</div>
                      <h3 className="font-bold text-slate-800 mb-2">No Location Data</h3>
                      <p className="text-sm text-slate-500">
                        Properties don't have latitude/longitude coordinates saved in the database.
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Add coordinates when creating properties to see them on the map.
                      </p>
                    </div>
                  </div>
                )}

                {/* Dropped Pin and Search Radius Circle */}
                {droppedPin && (
                  <>
                    <Marker position={[droppedPin.lat, droppedPin.lng]} icon={pinDropIcon}>
                      <Popup>
                        <div className="text-center p-2">
                          <p className="font-bold text-green-600">📍 Your Pin</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {nearbyProperties.length} properties within {searchRadius} km
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={[droppedPin.lat, droppedPin.lng]}
                      radius={searchRadius * 1000}
                      pathOptions={{
                        color: '#22c55e',
                        fillColor: '#22c55e',
                        fillOpacity: 0.1,
                        weight: 2
                      }}
                    />
                  </>
                )}

                {/* Property Markers */}
                {(droppedPin ? nearbyProperties : propertiesWithCoords).map((p) => (
                  <Marker
                    key={p._id}
                    position={[p.lat, p.lng]}
                    icon={hoveredProperty === p._id ? createDetailedPropertyMarker(p) : createSimplePinMarker(p.price, false)}
                    zIndexOffset={hoveredProperty === p._id ? 1000 : 0}
                    eventHandlers={{
                      click: () => viewDetails(p),
                      mouseover: () => setHoveredProperty(p._id),
                      mouseout: () => setHoveredProperty(null)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[220px]">
                        <img
                          src={resolveImageSrc(p.images?.[0]) || FALLBACK_IMG}
                          alt={p.title}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                        />
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{p.title}</h3>
                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                          <span>📍</span> {p.address?.city}, {p.address?.locality || p.address?.state}
                        </p>
                        {p.distance !== undefined && (
                          <p className="text-green-600 text-xs font-medium mt-1">
                            🎯 {p.distance.toFixed(1)} km from your pin
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-red-600 font-bold text-lg">₹{p.price?.toLocaleString()}</p>
                          {p.area?.superBuiltUp && (
                            <p className="text-slate-500 text-xs">{p.area.superBuiltUp} sq.ft</p>
                          )}
                        </div>
                        <button
                          onClick={() => viewDetails(p)}
                          className="w-full mt-3 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[40]">
                {droppedPin ? (
                  <>
                    <p className="text-xs text-green-600 font-medium">
                      🎯 {nearbyProperties.length} properties within {searchRadius} km
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Drag radius slider to adjust
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-600 font-medium">
                      📍 {propertiesWithCoords.length} properties on map
                    </p>
                    {filteredProperties.length - propertiesWithCoords.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        {filteredProperties.length - propertiesWithCoords.length} without location
                      </p>
                    )}
                  </>
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