import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Home, MapPin, IndianRupee, Layers, Image as ImageIcon, Calendar,
    ChevronLeft, Upload, Check, X, Building2, Users, Utensils, Car, Zap,
    Shield, Store, ArrowRight, FileText, Tag, Wifi, LandPlot, Plus
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// API Base URL
const API_BASE = import.meta.env.VITE_API_BASE;

// Steps
const STEPS = [
    { id: 1, label: "Category & Type", icon: <Home size={18} />, description: "Property basics" },
    { id: 2, label: "Location", icon: <MapPin size={18} />, description: "Address details" },
    { id: 3, label: "Pricing & Area", icon: <IndianRupee size={18} />, description: "Value & size" },
    { id: 4, label: "Property Details", icon: <Layers size={18} />, description: "Specific features" },
    { id: 5, label: "Photos & Docs", icon: <ImageIcon size={18} />, description: "Images & documents" },
    { id: 6, label: "Review", icon: <Calendar size={18} />, description: "Final check" },
];

// Categories & types (customized & professional)
const PROPERTY_CATEGORIES = {
    Residential: {
        icon: <Home size={28} />,
        types: [
            "Apartment / Flat",
            "Independent House",
            "Villa",
            "Builder Floor",
            "Row House",
            "Studio Apartment",
            "Penthouse",
            "Farm House"
        ],
        desc: "Homes for living",
        amenities: [
            "Lift", "Gym", "Swimming Pool", "Club House", "Power Backup", "CCTV", "Parking Covered", "Parking Open",
            "Modular Kitchen", "Wardrobes", "Geyser", "AC", "Fans", "Water Purifier", "Intercom", "Garden", "Jogging Track",
            "Kids Play Area", "Community Hall", "RO Water", "Store Room", "Servant Room"
        ]
    },
    Commercial: {
        icon: <Store size={28} />,
        types: [
            "Office Space",
            "Shop / Retail",
            "Showroom",
            "Restaurant / Cafe",
            "Co-Working Space",
            "Warehouse / Godown",
            "Industrial Shed",
            "Commercial Building / Floor"
        ],
        desc: "Business spaces",
        amenities: [
            "Lift", "Power Backup", "CCTV", "Fire Safety", "Reserved Parking", "Visitor Parking", "Internet",
            "Loading Dock", "Goods Lift", "Sprinkler System", "Water Storage", "Security", "Washrooms", "AC"
        ]
    }
};

// Commercial property specific configurations
const COMMERCIAL_CONFIGS = {
    "Office Space": {
        icon: <Building2 size={16} />,
        fields: ["workstations", "conferenceRooms", "cabins", "washrooms", "pantry"],
        label: "Office Configuration"
    },
    "Shop / Retail": {
        icon: <Store size={16} />,
        fields: ["frontage", "washrooms", "storage", "displayWindows"],
        label: "Shop Configuration"
    },
    "Showroom": {
        icon: <Store size={16} />,
        fields: ["frontage", "washrooms", "storage", "displayArea", "parking"],
        label: "Showroom Configuration"
    },
    "Restaurant / Cafe": {
        icon: <Utensils size={16} />,
        fields: ["seatingCapacity", "kitchenArea", "washrooms", "barArea", "outdoorSeating"],
        label: "Restaurant Configuration"
    },
    "Co-Working Space": {
        icon: <Users size={16} />,
        fields: ["workstations", "meetingRooms", "privateCabins", "phoneBooths", "loungeArea"],
        label: "Co-Working Configuration"
    },
    "Warehouse / Godown": {
        icon: <LandPlot size={16} />,
        fields: ["loadingDocks", "ceilingHeight", "floorLoadCapacity", "officeSpace", "washrooms"],
        label: "Warehouse Configuration"
    },
    "Industrial Shed": {
        icon: <Building2 size={16} />,
        fields: ["ceilingHeight", "floorLoadCapacity", "powerConnection", "overheadCrane", "officeSpace"],
        label: "Industrial Shed Configuration"
    },
    "Commercial Building / Floor": {
        icon: <Building2 size={16} />,
        fields: ["washrooms", "pantry", "centralAC", "powerBackup", "parking"],
        label: "Building Configuration"
    }
};

// Amenity mapping for icons
const AMENITY_ICONS = {
    Lift: <Building2 size={16} />,
    Gym: <Zap size={16} />,
    "Swimming Pool": <Zap size={16} />,
    "Power Backup": <Zap size={16} />,
    CCTV: <Shield size={16} />,
    "Parking Covered": <Car size={16} />,
    "Parking Open": <Car size={16} />,
    Internet: <Wifi size={16} />,
    "Modular Kitchen": <Utensils size={16} />,
    Security: <Shield size={16} />,
    "Fire Safety": <Shield size={16} />,
    "Loading Dock": <Car size={16} />
};

// Image categories based on property type
const IMAGE_CATEGORIES = {
    Residential: {
        "Apartment / Flat": [
            { key: "exterior", label: "Building Exterior", maxImages: 3, tip: "Show the building facade and entrance" },
            { key: "livingRoom", label: "Living Room", maxImages: 4, tip: "Main living area with natural lighting" },
            { key: "bedroom", label: "Bedroom(s)", maxImages: 4, tip: "All bedrooms - master and other rooms" },
            { key: "bathroom", label: "Bathroom(s)", maxImages: 3, tip: "Attached and common bathrooms" },
            { key: "kitchen", label: "Kitchen", maxImages: 2, tip: "Kitchen with appliances visible" },
            { key: "balcony", label: "Balcony / Terrace", maxImages: 2, tip: "Balcony view and space" },
            { key: "hall", label: "Hall / Lobby", maxImages: 2, tip: "Building lobby or common areas" },
            { key: "parking", label: "Parking Area", maxImages: 2, tip: "Covered or open parking space" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 1, tip: "2D layout if available" },
            { key: "other", label: "Other Areas", maxImages: 5, tip: "Amenities, garden, pool, etc." }
        ],
        "Independent House": [
            { key: "exterior", label: "House Exterior", maxImages: 4, tip: "Front, back and side views" },
            { key: "livingRoom", label: "Living Room", maxImages: 3, tip: "Main living area" },
            { key: "bedroom", label: "Bedroom(s)", maxImages: 5, tip: "All bedrooms" },
            { key: "bathroom", label: "Bathroom(s)", maxImages: 3, tip: "All bathrooms" },
            { key: "kitchen", label: "Kitchen", maxImages: 2, tip: "Kitchen with storage" },
            { key: "diningArea", label: "Dining Area", maxImages: 2, tip: "Dining room or space" },
            { key: "garden", label: "Garden / Lawn", maxImages: 3, tip: "Outdoor garden space" },
            { key: "parking", label: "Garage / Parking", maxImages: 2, tip: "Car parking area" },
            { key: "poojaRoom", label: "Pooja Room", maxImages: 1, tip: "Prayer room if available" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 2, tip: "Each floor layout" },
            { key: "other", label: "Other Areas", maxImages: 5, tip: "Terrace, store room, etc." }
        ],
        "Villa": [
            { key: "exterior", label: "Villa Exterior", maxImages: 5, tip: "All angles of the villa" },
            { key: "livingRoom", label: "Living Room", maxImages: 4, tip: "Main and additional living areas" },
            { key: "bedroom", label: "Bedroom(s)", maxImages: 6, tip: "Master suite and all bedrooms" },
            { key: "bathroom", label: "Bathroom(s)", maxImages: 4, tip: "Attached bathrooms" },
            { key: "kitchen", label: "Kitchen", maxImages: 3, tip: "Modular kitchen with island if any" },
            { key: "diningArea", label: "Dining Room", maxImages: 2, tip: "Formal dining area" },
            { key: "garden", label: "Garden / Lawn", maxImages: 4, tip: "Landscaped garden" },
            { key: "parking", label: "Garage / Driveway", maxImages: 2, tip: "Car parking facilities" },
            { key: "studyRoom", label: "Study / Home Office", maxImages: 2, tip: "Work from home space" },
            { key: "floorPlan", label: "Floor Plans", maxImages: 3, tip: "All floor layouts" },
            { key: "other", label: "Pool / Amenities", maxImages: 5, tip: "Swimming pool, gym, etc." }
        ],
        "Builder Floor": [
            { key: "exterior", label: "Building Exterior", maxImages: 2, tip: "Building front view" },
            { key: "livingRoom", label: "Living Room", maxImages: 3, tip: "Living area" },
            { key: "bedroom", label: "Bedroom(s)", maxImages: 4, tip: "All bedrooms" },
            { key: "bathroom", label: "Bathroom(s)", maxImages: 2, tip: "Bathrooms" },
            { key: "kitchen", label: "Kitchen", maxImages: 2, tip: "Kitchen area" },
            { key: "balcony", label: "Balcony", maxImages: 2, tip: "Balcony views" },
            { key: "parking", label: "Parking", maxImages: 1, tip: "Parking space" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 1, tip: "Layout" },
            { key: "other", label: "Other", maxImages: 3, tip: "Additional photos" }
        ],
        "Studio Apartment": [
            { key: "exterior", label: "Building Exterior", maxImages: 2, tip: "Building facade" },
            { key: "livingRoom", label: "Studio Space", maxImages: 4, tip: "Main living and sleeping area" },
            { key: "bathroom", label: "Bathroom", maxImages: 2, tip: "Attached bathroom" },
            { key: "kitchen", label: "Kitchenette", maxImages: 2, tip: "Kitchen area" },
            { key: "balcony", label: "Balcony", maxImages: 1, tip: "Balcony if available" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 1, tip: "Studio layout" },
            { key: "other", label: "Other", maxImages: 3, tip: "Building amenities" }
        ],
        "Penthouse": [
            { key: "exterior", label: "Building & Terrace View", maxImages: 4, tip: "Building and terrace views" },
            { key: "livingRoom", label: "Living Room", maxImages: 4, tip: "Spacious living areas" },
            { key: "bedroom", label: "Bedroom(s)", maxImages: 5, tip: "All bedrooms" },
            { key: "bathroom", label: "Bathroom(s)", maxImages: 3, tip: "Luxury bathrooms" },
            { key: "kitchen", label: "Kitchen", maxImages: 2, tip: "Modern kitchen" },
            { key: "balcony", label: "Private Terrace", maxImages: 4, tip: "Terrace with skyline view" },
            { key: "diningArea", label: "Dining Area", maxImages: 2, tip: "Dining space" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 2, tip: "Penthouse layout" },
            { key: "other", label: "Private Pool / Amenities", maxImages: 5, tip: "Exclusive amenities" }
        ],
        "Row House": [
            { key: "exterior", label: "House Exterior", maxImages: 3, tip: "Front and side views" },
            { key: "livingRoom", label: "Living Room", maxImages: 3, tip: "Living area" },
            { key: "bedroom", label: "Bedroom(s)", maxImages: 4, tip: "All bedrooms" },
            { key: "bathroom", label: "Bathroom(s)", maxImages: 2, tip: "Bathrooms" },
            { key: "kitchen", label: "Kitchen", maxImages: 2, tip: "Kitchen" },
            { key: "garden", label: "Garden / Backyard", maxImages: 2, tip: "Outdoor space" },
            { key: "parking", label: "Parking", maxImages: 1, tip: "Parking area" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 2, tip: "Each floor layout" },
            { key: "other", label: "Other", maxImages: 3, tip: "Additional areas" }
        ],
        "Farm House": [
            { key: "exterior", label: "Property Exterior", maxImages: 5, tip: "House and land views" },
            { key: "livingRoom", label: "Living Areas", maxImages: 4, tip: "Indoor living spaces" },
            { key: "bedroom", label: "Bedroom(s)", maxImages: 4, tip: "All bedrooms" },
            { key: "bathroom", label: "Bathroom(s)", maxImages: 2, tip: "Bathrooms" },
            { key: "kitchen", label: "Kitchen", maxImages: 2, tip: "Kitchen area" },
            { key: "garden", label: "Garden / Farm Area", maxImages: 5, tip: "Gardens, orchards, farm" },
            { key: "parking", label: "Parking / Garage", maxImages: 2, tip: "Vehicle parking" },
            { key: "other", label: "Pool / Amenities", maxImages: 5, tip: "Pool, guest house, etc." }
        ]
    },
    Commercial: {
        "Office Space": [
            { key: "facade", label: "Building Exterior", maxImages: 3, tip: "Building facade and entrance" },
            { key: "reception", label: "Reception / Entrance", maxImages: 2, tip: "Office entrance area" },
            { key: "workArea", label: "Work Area / Open Space", maxImages: 4, tip: "Main working floor" },
            { key: "cabin", label: "Cabins / Offices", maxImages: 3, tip: "Private office cabins" },
            { key: "conferenceRoom", label: "Conference Room", maxImages: 2, tip: "Meeting rooms" },
            { key: "pantry", label: "Pantry / Cafeteria", maxImages: 2, tip: "Pantry area" },
            { key: "washroom", label: "Washrooms", maxImages: 1, tip: "Restroom facilities" },
            { key: "parking", label: "Parking", maxImages: 2, tip: "Parking facilities" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 1, tip: "Office layout" },
            { key: "other", label: "Other Amenities", maxImages: 3, tip: "Gym, terrace, etc." }
        ],
        "Shop / Retail": [
            { key: "facade", label: "Shop Front", maxImages: 3, tip: "Storefront and signage area" },
            { key: "shopFloor", label: "Shop Floor", maxImages: 4, tip: "Main retail space" },
            { key: "displayArea", label: "Display Area", maxImages: 2, tip: "Product display sections" },
            { key: "storageArea", label: "Storage / Back Room", maxImages: 2, tip: "Storage area" },
            { key: "washroom", label: "Washroom", maxImages: 1, tip: "Restroom if available" },
            { key: "parking", label: "Parking", maxImages: 1, tip: "Customer parking" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 1, tip: "Shop layout" },
            { key: "other", label: "Other", maxImages: 2, tip: "Additional photos" }
        ],
        "Showroom": [
            { key: "facade", label: "Showroom Facade", maxImages: 4, tip: "Exterior with glass frontage" },
            { key: "displayArea", label: "Display Floor", maxImages: 5, tip: "Main display area" },
            { key: "reception", label: "Reception", maxImages: 2, tip: "Customer welcome area" },
            { key: "storageArea", label: "Storage / Warehouse", maxImages: 2, tip: "Back storage" },
            { key: "washroom", label: "Washroom", maxImages: 1, tip: "Customer restroom" },
            { key: "parking", label: "Parking", maxImages: 2, tip: "Customer parking" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 1, tip: "Showroom layout" },
            { key: "other", label: "Other", maxImages: 3, tip: "Loading area, etc." }
        ],
        "Restaurant / Cafe": [
            { key: "facade", label: "Restaurant Exterior", maxImages: 3, tip: "Outside view and signage" },
            { key: "seatingArea", label: "Dining Area", maxImages: 5, tip: "Indoor seating arrangement" },
            { key: "kitchenCommercial", label: "Kitchen", maxImages: 3, tip: "Commercial kitchen" },
            { key: "reception", label: "Counter / Reception", maxImages: 2, tip: "Billing counter area" },
            { key: "washroom", label: "Washrooms", maxImages: 1, tip: "Customer restrooms" },
            { key: "storageArea", label: "Storage / Pantry", maxImages: 2, tip: "Storage rooms" },
            { key: "parking", label: "Parking", maxImages: 1, tip: "Parking area" },
            { key: "other", label: "Outdoor Seating / Bar", maxImages: 4, tip: "Terrace, bar area" }
        ],
        "Co-Working Space": [
            { key: "facade", label: "Building Exterior", maxImages: 2, tip: "Building entrance" },
            { key: "reception", label: "Reception / Lobby", maxImages: 2, tip: "Welcome area" },
            { key: "workArea", label: "Open Desk Area", maxImages: 4, tip: "Hot desks and flex seating" },
            { key: "cabin", label: "Private Cabins", maxImages: 3, tip: "Private office options" },
            { key: "conferenceRoom", label: "Meeting Rooms", maxImages: 2, tip: "Bookable meeting rooms" },
            { key: "pantry", label: "Cafeteria / Pantry", maxImages: 2, tip: "Food and beverage area" },
            { key: "washroom", label: "Washrooms", maxImages: 1, tip: "Restrooms" },
            { key: "other", label: "Breakout / Recreation", maxImages: 3, tip: "Lounge, game room, etc." }
        ],
        "Warehouse / Godown": [
            { key: "facade", label: "Warehouse Exterior", maxImages: 3, tip: "Building exterior" },
            { key: "warehouse", label: "Storage Area", maxImages: 5, tip: "Main warehouse floor" },
            { key: "loadingArea", label: "Loading / Unloading", maxImages: 3, tip: "Loading docks and ramps" },
            { key: "cabin", label: "Office Space", maxImages: 2, tip: "Admin office if available" },
            { key: "washroom", label: "Washrooms", maxImages: 1, tip: "Staff restrooms" },
            { key: "parking", label: "Truck Parking", maxImages: 2, tip: "Vehicle parking area" },
            { key: "floorPlan", label: "Layout Plan", maxImages: 1, tip: "Warehouse layout" },
            { key: "other", label: "Other", maxImages: 2, tip: "Security, power backup, etc." }
        ],
        "Industrial Shed": [
            { key: "facade", label: "Shed Exterior", maxImages: 3, tip: "Industrial shed exterior" },
            { key: "warehouse", label: "Main Floor", maxImages: 5, tip: "Production / storage floor" },
            { key: "loadingArea", label: "Loading Area", maxImages: 2, tip: "Material handling area" },
            { key: "cabin", label: "Office", maxImages: 2, tip: "Office section" },
            { key: "washroom", label: "Washrooms", maxImages: 1, tip: "Staff facilities" },
            { key: "parking", label: "Parking / Yard", maxImages: 2, tip: "Open yard area" },
            { key: "other", label: "Other", maxImages: 3, tip: "Power, water facilities" }
        ],
        "Commercial Building / Floor": [
            { key: "facade", label: "Building Exterior", maxImages: 3, tip: "Building facade" },
            { key: "reception", label: "Lobby / Reception", maxImages: 2, tip: "Building lobby" },
            { key: "workArea", label: "Office Floor", maxImages: 4, tip: "Rentable floor space" },
            { key: "conferenceRoom", label: "Common Facilities", maxImages: 2, tip: "Shared meeting rooms" },
            { key: "pantry", label: "Cafeteria", maxImages: 2, tip: "Food court / canteen" },
            { key: "washroom", label: "Washrooms", maxImages: 1, tip: "Common restrooms" },
            { key: "parking", label: "Parking", maxImages: 2, tip: "Basement / open parking" },
            { key: "floorPlan", label: "Floor Plan", maxImages: 1, tip: "Typical floor layout" },
            { key: "other", label: "Other Amenities", maxImages: 3, tip: "Gym, terrace, etc." }
        ]
    }
};

// Animation variants
const variants = {
    enter: (direction) => ({
        x: direction > 0 ? 20 : -20,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction < 0 ? 20 : -20,
        opacity: 0,
    }),
};

// Helper to convert file to base64
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export default function AddProperty() {
    const navigate = useNavigate();

    // UI state
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Images
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    
    // Categorized Images - stores images by category
    // Structure: { categoryKey: { files: [], previews: [] } }
    const [categorizedImages, setCategorizedImages] = useState({});
    
    // Track which image categories are expanded (showing upload UI)
    const [expandedCategories, setExpandedCategories] = useState([]);

    // Metadata from backend
    const [metadata, setMetadata] = useState({
        categories: [],
        subcategories: [],
        propertyTypes: []
    });

    // Form data
    const [formData, setFormData] = useState({
        // Basic
        listingType: "Rent", // Rent / Sell
        propertyCategory: "Residential", // Residential / Commercial
        propertyType: "Apartment / Flat",

        // Residential specific
        bhkType: "", // for Residential
        bedrooms: "", bathrooms: 1, balconies: 0,

        // Area
        builtUpArea: "", carpetArea: "", superBuiltUpArea: "", plotArea: "",

        // Pricing
        expectedPrice: "", 
        maintenanceIncluded: true, // NEW: If true, maintenance is included in rent
        maintenance: "", 
        expectedDeposit: "", 
        bookingAmount: "", // NEW: For Sell - token/booking amount
        priceNegotiable: false, 
        gstApplicable: false,

        // Residential specifics
        furnishing: "Unfurnished", floorNo: "", totalFloors: "", propertyAge: "New", facing: "", constructionStatus: "Ready to Move",

        // Commercial specifics
        commercialSubType: "", // bare/warm/fully for office
        washrooms: 1, loadingArea: "", dockAvailable: false, shutters: "", floorHeight: "",

        // Commercial type specific fields
        workstations: "", conferenceRooms: "", cabins: "", pantry: "",
        frontage: "", storage: "", displayWindows: "", displayArea: "",
        seatingCapacity: "", kitchenArea: "", barArea: "", outdoorSeating: "",
        meetingRooms: "", privateCabins: "", phoneBooths: "", loungeArea: "",
        loadingDocks: "", ceilingHeight: "", floorLoadCapacity: "", powerConnection: "", overheadCrane: "",
        centralAC: "", powerBackup: "",

        // Parking
        parkingCovered: 0, parkingOpen: 0,

        // Amenities
        selectedAmenities: [],

        // Rooms extras
        servantRoom: false, poojaRoom: false, studyRoom: false, storeRoom: false,

        // Legal / Documents
        reraId: "", occupancyCertificate: false, tradeLicense: false, fireNoc: false,

        // Availability & misc
        availableFrom: new Date().toISOString().split('T')[0],
        petFriendly: "No",
        allowedFor: "Family", // Family / Bachelor / Company Lease / Any
        ageOfProperty: "", // optional numeric

        // Location
        city: "", locality: "", landmark: "", address: "", nearby: [],

        // Media & description
        description: "",
        videoUrl: "",

        // seller assistance flags (optional)
        showHelpTips: true
    });

    // Fetch metadata from backend
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [cats, subs, types] = await Promise.all([
                    axios.get(`${API_BASE}/api/categories/list-category`),
                    axios.get(`${API_BASE}/api/subcategories/list`),
                    axios.get(`${API_BASE}/api/propertyTypes/list-propertytype`)
                ]);
                setMetadata({
                    categories: Array.isArray(cats.data) ? cats.data : [],
                    subcategories: Array.isArray(subs.data) ? subs.data : [],
                    propertyTypes: Array.isArray(types.data) ? types.data : []
                });
            } catch (error) {
                console.error("Failed to fetch metadata", error);
                toast.error("Failed to load property options. Please refresh the page.");
            }
        };
        fetchMetadata();
    }, []);

    // Convenience checks
    const isResidential = formData.propertyCategory === "Residential";
    const isCommercial = formData.propertyCategory === "Commercial";
    const commercialConfig = isCommercial ? COMMERCIAL_CONFIGS[formData.propertyType] : null;

    // Handle form changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Toggle amenity
    const handleAmenityToggle = (amenity) => {
        setFormData(prev => {
            const list = prev.selectedAmenities || [];
            return {
                ...prev,
                selectedAmenities: list.includes(amenity) ? list.filter(a => a !== amenity) : [...list, amenity]
            };
        });
    };

    // Category change -> set default type & reset category-specific fields
    const handleCategoryChange = (category) => {
        const defaultType = PROPERTY_CATEGORIES[category].types[0];
        setFormData(prev => ({
            ...prev,
            propertyCategory: category,
            propertyType: defaultType,
            // Reset category-specific fields
            bhkType: category === "Residential" ? prev.bhkType : "",
            furnishing: category === "Residential" ? prev.furnishing : "Bare Shell",
            commercialSubType: category === "Commercial" ? prev.commercialSubType : "",
        }));
    };

    // Property type change
    const handlePropertyTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            propertyType: type,
            // If it's Studio apartment, set BHK accordingly
            bhkType: type.includes("Studio") ? "Studio" : prev.bhkType
        }));
    };

    // Images handling (max 15)
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        if (files.length + images.length > 15) return toast.error("Maximum 15 images allowed");
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...files]);
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    // Get image categories based on property type
    const getImageCategories = () => {
        if (isResidential) {
            return IMAGE_CATEGORIES.Residential[formData.propertyType] || IMAGE_CATEGORIES.Residential["Apartment / Flat"];
        } else if (isCommercial) {
            return IMAGE_CATEGORIES.Commercial[formData.propertyType] || IMAGE_CATEGORIES.Commercial["Office Space"];
        }
        return [];
    };

    // Handle categorized image upload
    const handleCategorizedImageUpload = (categoryKey, e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        
        const category = getImageCategories().find(c => c.key === categoryKey);
        const maxImages = category?.maxImages || 5;
        
        const currentImages = categorizedImages[categoryKey]?.files || [];
        if (files.length + currentImages.length > maxImages) {
            return toast.error(`Maximum ${maxImages} images allowed for ${category?.label || categoryKey}`);
        }
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        
        setCategorizedImages(prev => ({
            ...prev,
            [categoryKey]: {
                files: [...(prev[categoryKey]?.files || []), ...files],
                previews: [...(prev[categoryKey]?.previews || []), ...newPreviews]
            }
        }));
    };

    // Remove categorized image
    const removeCategorizedImage = (categoryKey, index) => {
        setCategorizedImages(prev => ({
            ...prev,
            [categoryKey]: {
                files: prev[categoryKey]?.files?.filter((_, i) => i !== index) || [],
                previews: prev[categoryKey]?.previews?.filter((_, i) => i !== index) || []
            }
        }));
    };

    // Get total categorized images count
    const getTotalCategorizedImages = () => {
        return Object.values(categorizedImages).reduce((total, cat) => total + (cat.files?.length || 0), 0);
    };

    // Validation per step
    const validateStep = (step) => {
        const f = formData;
        switch (step) {
            case 1:
                if (!f.propertyCategory) return "Please choose a property category.";
                if (!f.propertyType) return "Please choose a property type.";
                if (isResidential && !f.bhkType && !f.propertyType.toLowerCase().includes("studio"))
                    return "Please choose BHK configuration for residential.";
                break;
            case 2:
                if (!f.city || !f.locality) return "City and Locality are required.";
                break;
            case 3:
                if (!f.expectedPrice) return "Please enter expected price / rent.";
                if (!f.builtUpArea && !(isCommercial && f.propertyType.toLowerCase().includes("warehouse")))
                    return isCommercial ? "Please enter carpet/built-up area for commercial." : "Built-up area is required.";
                break;
            case 4:
                if (isResidential) {
                    if (!f.bedrooms && !f.bhkType.includes("Studio"))
                        return "Please confirm number of bedrooms / BHK.";
                } else if (isCommercial) {
                    if (!f.washrooms) return "Please enter number of washrooms for commercial.";
                }
                break;
            case 5:
                // Images are optional - no validation required
                break;
            default:
                break;
        }
        return null;
    };

    // Navigation helpers
    const handleNext = () => {
        const error = validateStep(currentStep);
        if (error) return toast.error(error);
        setDirection(1);
        setCurrentStep(prev => Math.min(prev + 1, 6));
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // Helper function to find the ObjectId for a category or property type
    const findObjectId = (name, type) => {
        if (!metadata[type] || !metadata[type].length) return null;

        // Try exact match first
        let match = metadata[type].find(item => item.name === name);

        // If no exact match, try case-insensitive match
        if (!match) {
            match = metadata[type].find(item =>
                item.name.toLowerCase() === name.toLowerCase()
            );
        }

        // If still no match, try partial match
        if (!match) {
            match = metadata[type].find(item =>
                item.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(item.name.toLowerCase())
            );
        }

        return match ? match._id : null;
    };

    // Submit function
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Create form data for submission
            const submitData = new FormData();

            // Find the ObjectIds for category and propertyType
            const categoryId = findObjectId(formData.propertyCategory, 'categories');
            const propertyTypeId = findObjectId(formData.propertyType, 'propertyTypes');

            // If we couldn't find the IDs, use the first available as fallback
            const finalCategoryId = categoryId || (metadata.categories.length > 0 ? metadata.categories[0]._id : null);
            const finalPropertyTypeId = propertyTypeId || (metadata.propertyTypes.length > 0 ? metadata.propertyTypes[0]._id : null);

            // Add basic property info
            submitData.append("propertyType", finalPropertyTypeId);
            submitData.append("propertyTypeName", formData.propertyType); // Store exact name like "Apartment / Flat"
            submitData.append("category", finalCategoryId);
            submitData.append("categoryName", formData.propertyCategory); // Store "Residential" or "Commercial"
            submitData.append("title", generateTitle());
            submitData.append("description", formData.description || generateShortDescription());
            submitData.append("price", formData.expectedPrice);
            submitData.append("listingType", formData.listingType);
            submitData.append("priceUnit", formData.listingType === "Rent" ? "Monthly" : "Total");
            submitData.append("negotiable", formData.priceNegotiable ? "true" : "false");
            submitData.append("gstApplicable", formData.gstApplicable ? "Yes" : "No");
            
            // Add top-level location fields for easier querying
            submitData.append("city", formData.city);
            submitData.append("locality", formData.locality);

            // Add area information
            const areaData = {
                builtUpSqft: formData.builtUpArea || "",
                carpetSqft: formData.carpetArea || "",
                superBuiltUpSqft: formData.superBuiltUpArea || "",
                plotSqft: formData.plotArea || ""
            };
            submitData.append("area", JSON.stringify(areaData));

            // Add address information
            const addressData = {
                city: formData.city,
                area: formData.locality,
                state: "",
                pincode: "",
                line: formData.address,
                landmark: formData.landmark,
                nearby: formData.nearby || []
            };
            submitData.append("address", JSON.stringify(addressData));

            // Add features based on property type
            let featuresData = {
                listingType: formData.listingType,
                parking: {
                    covered: Number(formData.parkingCovered || 0),
                    open: Number(formData.parkingOpen || 0)
                },
                amenities: formData.selectedAmenities || [],
                availableFrom: formData.availableFrom,
                deposit: formData.expectedDeposit,
                maintenance: formData.maintenanceIncluded ? "Included" : formData.maintenance,
                maintenanceIncluded: formData.maintenanceIncluded,
            };

            // Add residential specific features
            if (isResidential) {
                featuresData = {
                    ...featuresData,
                    bhk: formData.bhkType,
                    bedrooms: formData.bedrooms || (formData.bhkType || "").split(" ")[0],
                    bathrooms: formData.bathrooms,
                    balconies: formData.balconies,
                    furnishing: formData.furnishing,
                    floorNo: formData.floorNo,
                    totalFloors: formData.totalFloors,
                    facing: formData.facing,
                    constructionStatus: formData.constructionStatus,
                    propertyAge: formData.propertyAge,
                    extras: {
                        servantRoom: formData.servantRoom,
                        poojaRoom: formData.poojaRoom,
                        studyRoom: formData.studyRoom,
                        storeRoom: formData.storeRoom
                    },
                    allowedFor: formData.allowedFor,
                    petFriendly: formData.petFriendly,
                };
            } else {
                // Add commercial specific features
                featuresData = {
                    ...featuresData,
                    commercialSubType: formData.commercialSubType,
                    washrooms: formData.washrooms,
                    loadingArea: formData.loadingArea,
                    dockAvailable: formData.dockAvailable,
                    shutters: formData.shutters,
                    floorHeight: formData.floorHeight,
                    powerLoad: formData.powerLoad,
                };

                // Add commercial type specific fields
                if (commercialConfig) {
                    commercialConfig.fields.forEach(field => {
                        if (formData[field]) {
                            featuresData[field] = formData[field];
                        }
                    });
                }
            }

            submitData.append("features", JSON.stringify(featuresData));

            // Add legal/compliance information
            const legalData = {
                reraId: formData.reraId,
                occupancyCertificate: !!formData.occupancyCertificate,
                tradeLicense: !!formData.tradeLicense,
                fireNoc: !!formData.fireNoc
            };
            submitData.append("legal", JSON.stringify(legalData));

            // Add legacy images as files (backward compatibility)
            images.forEach(file => submitData.append("images", file));
            
            // Add categorized images with category info
            // Format: categoryKey_index for field name, file as value
            const imageCategoryMap = {};
            Object.entries(categorizedImages).forEach(([categoryKey, data]) => {
                if (data.files && data.files.length > 0) {
                    data.files.forEach((file, index) => {
                        submitData.append(`categorizedImages`, file);
                        // Track which category each image belongs to
                        if (!imageCategoryMap[categoryKey]) {
                            imageCategoryMap[categoryKey] = [];
                        }
                        imageCategoryMap[categoryKey].push(index);
                    });
                }
            });
            // Send the category mapping so backend knows which image goes where
            submitData.append("imageCategoryMap", JSON.stringify(imageCategoryMap));

            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE}/api/properties/add`, submitData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: token ? `Bearer ${token}` : ""
                }
            });

            toast.success("Property published successfully!");
            navigate("/");
        } catch (error) {
            console.error("Submission failed", error);
            toast.error(error.response?.data?.message || "Failed to publish property");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to generate listing title
    const generateTitle = () => {
        const parts = [];
        if (isResidential) {
            if (formData.bhkType) parts.push(formData.bhkType);
            parts.push(formData.propertyType);
            parts.push(formData.listingType === "Rent" ? "for Rent" : "for Sale");
            if (formData.locality) parts.push(`in ${formData.locality}`);
        } else {
            parts.push(formData.propertyType);
            parts.push(formData.listingType === "Rent" ? "for Rent" : "for Sale");
            if (formData.locality) parts.push(`in ${formData.locality}`);
        }
        return parts.filter(Boolean).join(" ");
    };

    const generateShortDescription = () => {
        if (formData.description) return formData.description;
        return `${generateTitle()} | ${formData.builtUpArea || formData.carpetArea || "Area not specified"} sq.ft`;
    };

    // Render step parts
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Basics</h2>
                <p className="text-white/70 mt-2">Choose category and type. We'll show only relevant fields next.</p>
            </div>

            <div className="text-sm font-semibold text-white uppercase tracking-wider">Property Category</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(PROPERTY_CATEGORIES).map(([key, value]) => (
                    <div key={key}
                        className={`cursor-pointer rounded-2xl p-4 flex gap-4 items-center transition-all ${formData.propertyCategory === key ? "bg-white text-[#004C99] shadow-lg" : "bg-white/10 border border-white/30 hover:bg-white/20 text-white"}`}
                        onClick={() => handleCategoryChange(key)}
                    >
                        <div className={`p-3 rounded-full ${formData.propertyCategory === key ? "bg-[#004C99]/10" : "bg-white/10"}`}>
                            {value.icon}
                        </div>
                        <div>
                            <div className="font-bold">{key}</div>
                            <div className={`text-xs ${formData.propertyCategory === key ? "text-[#004C99]/70" : "text-white/70"}`}>{value.desc}</div>
                        </div>
                        {formData.propertyCategory === key && <div className="ml-auto"><Check size={18} /></div>}
                    </div>
                ))}
            </div>

            <div>
                <label className="text-sm font-semibold text-white uppercase tracking-wider">Property Type</label>
                <div className="flex flex-wrap gap-3 mt-2">
                    {PROPERTY_CATEGORIES[formData.propertyCategory].types.map(type => (
                        <button key={type} onClick={() => handlePropertyTypeChange(type)}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium ${formData.propertyType === type ? "bg-white text-[#004C99] border-white font-bold" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}`}>
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Residential only: BHK */}
            {isResidential && (
                <div>
                    <label className="text-sm font-semibold text-white uppercase tracking-wider">BHK Configuration</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK", "Studio"].map(bhk => (
                            <button key={bhk} onClick={() => setFormData(p => ({ ...p, bhkType: bhk, bedrooms: bhk === "Studio" ? 0 : (bhk.split(" ")[0]) }))}
                                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${formData.bhkType === bhk ? "bg-white text-[#004C99] border-white font-bold shadow-md" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}`}>
                                {bhk}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-white/60 mt-2">Tip: Select the exact BHK — buyers search using these filters.</p>
                </div>
            )}

            {/* Commercial only: Sub-type */}
            {isCommercial && (
                <div>
                    <label className="text-sm font-semibold text-white uppercase tracking-wider">Commercial Sub-type</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {["Bare Shell", "Warm Shell", "Fully Furnished"].map(subType => (
                            <button key={subType} onClick={() => setFormData(p => ({ ...p, commercialSubType: subType }))}
                                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${formData.commercialSubType === subType ? "bg-white text-[#004C99] border-white font-bold shadow-md" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}`}>
                                {subType}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-white/60 mt-2">Tip: Select the condition of the commercial space.</p>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Location</h2>
                <p className="text-white/70 mt-2">Accurate location increases trust and discoverability.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-white">City</label>
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all" />
                    <div className="text-xs text-white/60 mt-1">Make sure the city is correct — affects buyer reach.</div>
                </div>
                <div>
                    <label className="text-sm font-medium text-white">Locality / Society</label>
                    <input name="locality" value={formData.locality} onChange={handleChange} placeholder="e.g. Bandra West" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all" />
                    <div className="text-xs text-white/60 mt-1">Add society or locality for better results.</div>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-white">Full Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} placeholder="Complete address, building name, street..." className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50"></textarea>
                <div className="text-xs text-white/60 mt-1">Include building name, floor, and flat number if applicable.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-white">Landmark</label>
                    <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Near City Mall" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" />
                </div>
                <div>
                    <label className="text-sm font-medium text-white">Nearby (tags)</label>
                    <input name="nearby" value={(formData.nearby || []).join(", ")} onChange={(e) => setFormData(p => ({ ...p, nearby: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} placeholder="Metro, School, Hospital (comma separated)" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" />
                    <div className="text-xs text-white/60 mt-1">Example: Metro Station, Primary School, Hospital</div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => {
        const isRent = formData.listingType === "Rent";
        const isSell = formData.listingType === "Sell";
        
        return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Pricing & Area</h2>
                <p className="text-white/70 mt-2">Provide accurate area & pricing to attract quality leads.</p>
            </div>

            {/* FIX: Changed bg-white/95 to a consistent dark style bg-white/10 and updated text/border colors */}
            <div className="bg-white/10 p-6 rounded-2xl border border-white/30 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-white">Listing Type</label>
                        <div className="flex gap-2 mt-2">
                            {["Rent", "Sell"].map(t => (
                                <button key={t} onClick={() => setFormData(p => ({ ...p, listingType: t }))} className={`px-4 py-2 rounded-xl text-sm font-medium ${formData.listingType === t ? "bg-white text-[#004C99]" : "bg-white/20 text-white border border-white/30 hover:bg-white/30"}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-white">Expected {isRent ? "Monthly Rent" : "Sale Price"}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/70">₹</div>
                            {/* FIX: Applied dark theme input style */}
                            <input name="expectedPrice" value={formData.expectedPrice} onChange={handleChange} type="number" className="w-full pl-10 px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="0" />
                        </div>
                        <div className="text-xs text-white/60 mt-1">Tip: Add exact amount for better buyer conversion.</div>
                    </div>
                </div>

                {/* Rent-specific fields */}
                {isRent && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="text-sm font-medium text-white">Security Deposit</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/70">₹</div>
                                {/* FIX: Applied dark theme input style */}
                                <input name="expectedDeposit" value={formData.expectedDeposit} onChange={handleChange} type="number" className="w-full pl-10 px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="0" />
                            </div>
                            <div className="text-xs text-white/60 mt-1">Usually 2-3 months rent</div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-white">Monthly Maintenance</label>
                            <div className="flex items-center gap-3 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.maintenanceIncluded} 
                                        onChange={(e) => setFormData(p => ({ ...p, maintenanceIncluded: e.target.checked, maintenance: e.target.checked ? "" : p.maintenance }))}
                                        className="w-4 h-4 rounded border-white/50 bg-white/10 text-white"
                                    />
                                    <span className="text-sm text-white/80">Included in rent</span>
                                </label>
                                {!formData.maintenanceIncluded && (
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/70">₹</div>
                                        {/* FIX: Applied dark theme input style */}
                                        <input 
                                            name="maintenance" 
                                            value={formData.maintenance} 
                                            onChange={handleChange} 
                                            type="number" 
                                            className="w-full pl-8 px-4 py-2 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" 
                                            placeholder="Monthly amount" 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sell-specific fields */}
                {isSell && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="text-sm font-medium text-white">Booking / Token Amount</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/70">₹</div>
                                {/* FIX: Applied dark theme input style */}
                                <input name="bookingAmount" value={formData.bookingAmount} onChange={handleChange} type="number" className="w-full pl-10 px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="0" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-white">Monthly Maintenance</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/70">₹</div>
                                {/* FIX: Applied dark theme input style */}
                                <input name="maintenance" value={formData.maintenance} onChange={handleChange} type="number" className="w-full pl-10 px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="Society maintenance" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-white">GST Applicable?</label>
                            {/* FIX: Applied dark theme select style */}
                            <select name="gstApplicable" value={formData.gstApplicable ? "Yes" : "No"} onChange={(e) => setFormData(p => ({ ...p, gstApplicable: e.target.value === "Yes" }))} className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white">
                                <option className="bg-[#004C99] text-white">No</option>
                                <option className="bg-[#004C99] text-white">Yes</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 mt-4">
                    <label className="text-sm font-medium text-white">Price Negotiable?</label>
                    <div className="flex gap-2">
                        {["No", "Yes"].map(opt => (
                            <button 
                                key={opt} 
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, priceNegotiable: opt === "Yes" }))} 
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.priceNegotiable === (opt === "Yes") ? "bg-white text-[#004C99] shadow-md" : "bg-white/20 text-white border border-white/30 hover:bg-white/30"}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium text-white">{isResidential ? "Built-up Area" : "Built-up / Carpet Area"}</label>
                    <div className="relative">
                        <input name="builtUpArea" value={formData.builtUpArea} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="eg. 1200" />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60">sq.ft</div>
                    </div>
                    <div className="text-xs text-white/60 mt-1">Built-up area is used by buyers to compare listings.</div>
                </div>

                <div>
                    <label className="text-sm font-medium text-white">Carpet Area</label>
                    <div className="relative">
                        <input name="carpetArea" value={formData.carpetArea} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="eg. 900" />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60">sq.ft</div>
                    </div>
                    <div className="text-xs text-white/60 mt-1">Important for end users — be accurate.</div>
                </div>

                <div>
                    <label className="text-sm font-medium text-white">Super Built-up Area (optional)</label>
                    <div className="relative">
                        <input name="superBuiltUpArea" value={formData.superBuiltUpArea} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="eg. 1400" />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60">sq.ft</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {isResidential && (
                    <>
                        <div>
                            <label className="text-sm font-medium text-white">Floor No</label>
                            <input 
                                name="floorNo" 
                                value={formData.floorNo} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Validate floor doesn't exceed total floors
                                    if (formData.totalFloors && Number(val) > Number(formData.totalFloors)) {
                                        toast.error("Floor number cannot exceed total floors");
                                        return;
                                    }
                                    handleChange(e);
                                }} 
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" 
                                placeholder="eg. 3" 
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-white">Total Floors</label>
                            <input name="totalFloors" value={formData.totalFloors} onChange={handleChange} type="number" min="1" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="eg. 10" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-white">Facing</label>
                            {/* FIX: Applied dark theme select style */}
                            <select name="facing" value={formData.facing} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white">
                                <option value="" className="bg-[#004C99] text-white">Select</option>
                                {["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"].map(d => <option key={d} className="bg-[#004C99] text-white">{d}</option>)}
                            </select>
                        </div>
                    </>
                )}
                {isCommercial && (
                    <>
                        <div>
                            <label className="text-sm font-medium text-white">Washrooms</label>
                            <input name="washrooms" value={formData.washrooms} onChange={handleChange} type="number" min="0" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-white">Floor Height (ft)</label>
                            <input name="floorHeight" value={formData.floorHeight} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="eg. 10" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-white">Power Load (kW)</label>
                            <input name="powerLoad" value={formData.powerLoad} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" placeholder="eg. 50" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
    };

    const renderStep4 = () => {
        const isRent = formData.listingType === "Rent";
        const isSell = formData.listingType === "Sell";
        
        return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Property Details</h2>
                <p className="text-white/70 mt-2">Add specific features to make your listing stand out.</p>
            </div>

            {/* Residential specific fields */}
            {isResidential && (
                <>
                    {/* FIX: Changed bg-white/95 to a consistent dark style bg-white/10 and updated text/border colors */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/30 shadow-lg">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                            <Home size={18} />
                            Residential Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-white">Bedrooms</label>
                                {/* FIX: Applied dark theme input style */}
                                <input name="bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" min="0" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white">Bathrooms</label>
                                {/* FIX: Applied dark theme input style */}
                                <input name="bathrooms" value={formData.bathrooms} onChange={handleChange} type="number" min="1" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white">Balconies</label>
                                {/* FIX: Applied dark theme input style */}
                                <input name="balconies" value={formData.balconies} onChange={handleChange} type="number" min="0" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-white">Furnishing</label>
                                {/* FIX: Applied dark theme select style */}
                                <select name="furnishing" value={formData.furnishing} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white">
                                    <option className="bg-[#004C99] text-white">Unfurnished</option>
                                    <option className="bg-[#004C99] text-white">Semi-Furnished</option>
                                    <option className="bg-[#004C99] text-white">Fully Furnished</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white">Property Age</label>
                                {/* FIX: Applied dark theme select style */}
                                <select name="propertyAge" value={formData.propertyAge} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white">
                                    <option className="bg-[#004C99] text-white">New</option>
                                    <option className="bg-[#004C99] text-white">1-5 Years</option>
                                    <option className="bg-[#004C99] text-white">5-10 Years</option>
                                    <option className="bg-[#004C99] text-white">10+ Years</option>
                                </select>
                            </div>
                        </div>

                        {/* Construction Status - More relevant for Sell */}
                        {isSell && (
                            <div className="mt-4">
                                <label className="text-sm font-medium text-white">Construction Status</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {["Ready to Move", "Under Construction", "New Launch"].map(status => (
                                        <button 
                                            key={status} 
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, constructionStatus: status }))} 
                                            className={`px-4 py-2 rounded-xl text-sm transition-all ${formData.constructionStatus === status ? "bg-white text-[#004C99] shadow-md" : "bg-white/20 text-white border border-white/30 hover:bg-white/30"}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-white">
                            <label className="flex items-center gap-2 cursor-pointer">
                                {/* FIX: Ensured checkbox styling is dark-friendly */}
                                <input type="checkbox" name="servantRoom" checked={formData.servantRoom} onChange={handleChange} className="w-4 h-4 rounded border-white/50 bg-white/10" />
                                <span className="text-sm">Servant Room</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="poojaRoom" checked={formData.poojaRoom} onChange={handleChange} className="w-4 h-4 rounded border-white/50 bg-white/10" />
                                <span className="text-sm">Pooja Room</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="studyRoom" checked={formData.studyRoom} onChange={handleChange} className="w-4 h-4 rounded border-white/50 bg-white/10" />
                                <span className="text-sm">Study Room</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="storeRoom" checked={formData.storeRoom} onChange={handleChange} className="w-4 h-4 rounded border-white/50 bg-white/10" />
                                <span className="text-sm">Store Room</span>
                            </label>
                        </div>
                    </div>

                    {/* Rent-specific tenant preferences */}
                    {isRent && (
                        <div className="bg-white/10 rounded-2xl p-4 border border-white/30 shadow-lg">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                                <Users size={18} />
                                Tenant Preferences
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white">Preferred Tenants</label>
                                    {/* FIX: Applied dark theme select style */}
                                    <select name="allowedFor" value={formData.allowedFor} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white mt-2">
                                        <option className="bg-[#004C99] text-white" value="Family">Family</option>
                                        <option className="bg-[#004C99] text-white" value="Bachelor Male">Bachelor Male</option>
                                        <option className="bg-[#004C99] text-white" value="Bachelor Female">Bachelor Female</option>
                                        <option className="bg-[#004C99] text-white" value="Company Lease">Company Lease</option>
                                        <option className="bg-[#004C99] text-white" value="Any">Any</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white">Pet Friendly?</label>
                                    {/* FIX: Applied dark theme select style */}
                                    <select name="petFriendly" value={formData.petFriendly} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white mt-2">
                                        <option className="bg-[#004C99] text-white" value="No">No</option>
                                        <option className="bg-[#004C99] text-white" value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white">Available From</label>
                                    {/* FIX: Applied dark theme input style */}
                                    <input 
                                        type="date" 
                                        name="availableFrom" 
                                        value={formData.availableFrom} 
                                        onChange={handleChange} 
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white mt-2" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Possession Details for Under Construction properties (Sell) */}
                    {isSell && formData.constructionStatus === "Under Construction" && (
                        <div className="bg-white/10 rounded-2xl p-4 border border-white/30">
                            <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
                                <Calendar size={18} />
                                Possession Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white">Expected Possession</label>
                                    {/* FIX: Applied dark theme input style */}
                                    <input 
                                        type="date" 
                                        name="availableFrom" 
                                        value={formData.availableFrom} 
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white mt-2" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white">RERA ID (if available)</label>
                                    {/* FIX: Applied dark theme input style */}
                                    <input 
                                        name="reraId" 
                                        value={formData.reraId} 
                                        onChange={handleChange}
                                        placeholder="e.g. P52000012345"
                                        className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50 mt-2" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Commercial specific fields */}
            {isCommercial && commercialConfig && (
                <div className="bg-white/10 rounded-2xl p-4 border border-white/30 shadow-lg">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                        {commercialConfig.icon}
                        {commercialConfig.label}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {commercialConfig.fields.includes("workstations") && (
                            <div>
                                <label className="text-sm font-medium text-white">Workstations</label>
                                {/* FIX: Applied dark theme input style */}
                                <input name="workstations" value={formData.workstations} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("conferenceRooms") && (
                            <div>
                                <label className="text-sm font-medium text-white">Conference Rooms</label>
                                <input name="conferenceRooms" value={formData.conferenceRooms} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("cabins") && (
                            <div>
                                <label className="text-sm font-medium text-white">Private Cabins</label>
                                <input name="cabins" value={formData.cabins} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("seatingCapacity") && (
                            <div>
                                <label className="text-sm font-medium text-white">Seating Capacity</label>
                                <input name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("kitchenArea") && (
                            <div>
                                <label className="text-sm font-medium text-white">Kitchen Area (sq.ft)</label>
                                <input name="kitchenArea" value={formData.kitchenArea} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("frontage") && (
                            <div>
                                <label className="text-sm font-medium text-white">Frontage (ft)</label>
                                <input name="frontage" value={formData.frontage} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("loadingDocks") && (
                            <div>
                                <label className="text-sm font-medium text-white">Loading Docks</label>
                                <input name="loadingDocks" value={formData.loadingDocks} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("ceilingHeight") && (
                            <div>
                                <label className="text-sm font-medium text-white">Ceiling Height (ft)</label>
                                <input name="ceilingHeight" value={formData.ceilingHeight} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("floorLoadCapacity") && (
                            <div>
                                <label className="text-sm font-medium text-white">Floor Load Capacity (kg/sq.ft)</label>
                                <input name="floorLoadCapacity" value={formData.floorLoadCapacity} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-white/30 bg-white/10 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-white">
                        {commercialConfig.fields.includes("barArea") && (
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="barArea" checked={formData.barArea} onChange={handleChange} className="w-4 h-4 rounded border-white/50 bg-white/10" />
                                Bar Area Available
                            </label>
                        )}

                        {commercialConfig.fields.includes("outdoorSeating") && (
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="outdoorSeating" checked={formData.outdoorSeating} onChange={handleChange} className="w-4 h-4 rounded border-white/50 bg-white/10" />
                                Outdoor Seating Available
                            </label>
                        )}

                        {commercialConfig.fields.includes("overheadCrane") && (
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="overheadCrane" checked={formData.overheadCrane} onChange={handleChange} className="w-4 h-4 rounded border-white/50 bg-white/10" />
                                Overhead Crane Available
                            </label>
                        )}
                    </div>
                </div>
            )}

            {/* Common fields for both property types */}
            <div className="bg-white/10 rounded-2xl p-4 border border-white/30 shadow-lg">
                <h3 className="font-bold mb-4 text-white">Parking & Amenities</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-white">Parking (Covered)</label>
                        <input name="parkingCovered" value={formData.parkingCovered} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white" />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-white">Parking (Open)</label>
                        <input name="parkingOpen" value={formData.parkingOpen} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white" />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-sm font-semibold text-white uppercase tracking-wider">Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                        {PROPERTY_CATEGORIES[formData.propertyCategory].amenities.map(am => (
                            <div key={am} onClick={() => handleAmenityToggle(am)} className={`p-3 rounded-xl border cursor-pointer ${formData.selectedAmenities.includes(am) ? "bg-white border-white text-[#004C99]" : "bg-white/10 border-white/30 hover:border-white text-white"}`}>
                                <div className="flex items-center gap-2">
                                    <div className={formData.selectedAmenities.includes(am) ? "text-[#004C99]" : "text-white/70"}>{AMENITY_ICONS[am] || <Tag size={14} />}</div>
                                    <div className="text-sm">{am}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-white/60 mt-2">Tip: Select all amenities that apply — this helps match filtered searches.</div>
                </div>
            </div>
        </div>
    );
    };

    // Toggle category expansion
    const toggleCategory = (categoryKey) => {
        setExpandedCategories(prev => 
            prev.includes(categoryKey) 
                ? prev.filter(k => k !== categoryKey)
                : [...prev, categoryKey]
        );
    };

    const renderStep5 = () => {
        const categories = getImageCategories();
        const totalImages = getTotalCategorizedImages();
        
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Photos & Documents</h2>
                    <p className="text-white/70 mt-2">Click on any category to add photos. All images are optional.</p>
                </div>

                {/* Summary badge */}
                <div className="flex justify-center">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2">
                        <ImageIcon size={16} />
                        <span>{totalImages} photos uploaded</span>
                        {totalImages >= 5 && <Check size={16} className="text-green-400" />}
                    </div>
                </div>

                {/* Category Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {categories.map((category) => {
                        const catImages = categorizedImages[category.key] || { files: [], previews: [] };
                        const imageCount = catImages.files?.length || 0;
                        const isExpanded = expandedCategories.includes(category.key);
                        const hasImages = imageCount > 0;
                        
                        return (
                            <div 
                                key={category.key} 
                                onClick={() => toggleCategory(category.key)}
                                className={`rounded-xl p-3 border-2 cursor-pointer transition-all ${
                                    isExpanded 
                                        ? 'border-white bg-white/20 shadow-lg' 
                                        : hasImages 
                                            ? 'border-green-400/50 bg-green-400/10 hover:bg-green-400/20' 
                                            : 'border-white/30 bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-medium text-sm truncate">{category.label}</span>
                                    <div className="flex items-center gap-1.5">
                                        {hasImages && (
                                            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                                {imageCount}
                                            </span>
                                        )}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                            isExpanded ? 'bg-white text-[#004C99] rotate-45' : 'bg-white/20 text-white'
                                        }`}>
                                            <Plus size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Expanded Upload Sections */}
                {expandedCategories.length > 0 && (
                    <div className="space-y-4 mt-6">
                        {categories.filter(cat => expandedCategories.includes(cat.key)).map((category) => {
                            const catImages = categorizedImages[category.key] || { files: [], previews: [] };
                            const imageCount = catImages.files?.length || 0;
                            
                            return (
                                <div key={category.key} className="rounded-2xl p-4 border-2 border-white/40 bg-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-semibold">{category.label}</span>
                                            <span className="text-white/50 text-xs">({imageCount}/{category.maxImages})</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleCategory(category.key); }}
                                            className="text-white/60 hover:text-white p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    
                                    {category.tip && (
                                        <p className="text-white/50 text-xs mb-3">{category.tip}</p>
                                    )}
                                    
                                    {/* Upload Area */}
                                    <div className="border-2 border-dashed border-white/40 rounded-xl p-6 text-center relative hover:border-white/60 transition-colors cursor-pointer mb-3">
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            onChange={(e) => handleCategorizedImageUpload(category.key, e)} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={imageCount >= category.maxImages}
                                        />
                                        <Upload size={24} className="mx-auto text-white/60 mb-2" />
                                        <div className="text-white font-medium">
                                            {imageCount >= category.maxImages ? 'Maximum images reached' : 'Click to upload'}
                                        </div>
                                        <div className="text-white/50 text-xs mt-1">
                                            Max {category.maxImages} images
                                        </div>
                                    </div>
                                    
                                    {/* Preview Images */}
                                    {catImages.previews?.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                            {catImages.previews.map((src, idx) => (
                                                <div key={idx} className="relative rounded-lg overflow-hidden aspect-square">
                                                    <img src={src} className="w-full h-full object-cover" alt={`${category.label}-${idx}`} />
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); removeCategorizedImage(category.key, idx); }} 
                                                        className="absolute top-1 right-1 bg-[#E53935] rounded-full p-1 shadow hover:bg-[#c62828] transition-colors"
                                                    >
                                                        <X size={10} className="text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Video and Documents Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div>
                        <label className="text-sm font-medium text-white">Video Walkthrough (optional)</label>
                        <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="YouTube / Google Drive link" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/50" />
                        <div className="text-xs text-white/60 mt-1">Tip: A short 60-90s walkthrough greatly improves engagement.</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-white">Upload Documents (RERA / OC) - optional</label>
                        <input type="file" accept=".pdf" className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white" />
                        <div className="text-xs text-white/60 mt-1">Upload RERA/Occupancy Certificate / Trade License if available.</div>
                    </div>
                </div>
            </div>
        );
    };

    // Get the first preview image from categorized images or legacy images
    const getFirstPreviewImage = () => {
        // Check categorized images first (prefer exterior)
        const categories = getImageCategories();
        for (const cat of categories) {
            if (categorizedImages[cat.key]?.previews?.length > 0) {
                return categorizedImages[cat.key].previews[0];
            }
        }
        // Fallback to legacy images
        return previewImages[0] || null;
    };

    const renderStep6 = () => {
        const firstImage = getFirstPreviewImage();
        const totalImages = getTotalCategorizedImages() + (images?.length || 0);
        
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Review & Publish</h2>
                    <p className="text-white/70 mt-2">Double-check everything — buyers prefer complete listings.</p>
                </div>

                {/* FIX: Changed bg-white/95 to a consistent dark style bg-white/10 and updated text/border/font colors for contrast */}
                <div className="max-w-3xl mx-auto bg-white/10 rounded-2xl shadow-lg p-6 border border-white/20">
                    <div className="h-56 bg-white/5 rounded-2xl overflow-hidden relative mb-4">
                        {firstImage ? <img src={firstImage} className="w-full h-full object-cover" alt="Property Preview" /> : <div className="w-full h-full flex items-center justify-center text-white/40"><ImageIcon size={48} /></div>}
                        <div className="absolute top-4 left-4 bg-[#004C99] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">{formData.listingType}</div>
                        <div className="absolute top-4 right-4 bg-[#E53935] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">{formData.propertyCategory}</div>
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold">{totalImages} photos</div>
                    </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-bold text-xl text-white">{generateTitle()}</h3>
                            <p className="text-sm text-white/70">{formData.locality}, {formData.city}</p>
                        </div>
                        <div className="text-right text-white">
                            <div className="font-bold text-lg">₹ {formData.expectedPrice ? Number(formData.expectedPrice).toLocaleString() : "-"}</div>
                            <div className="text-xs text-white/60">{formData.priceNegotiable ? "Negotiable" : "Fixed Price"}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-white/20 text-white">
                        <div>
                            <div className="text-xs text-white/60">Area</div>
                            <div className="font-semibold">{formData.builtUpArea || formData.carpetArea || "-"} sq.ft</div>
                        </div>
                        <div>
                            <div className="text-xs text-white/60">Furnishing</div>
                            <div className="font-semibold">{formData.furnishing}</div>
                        </div>
                        {isResidential && (
                            <div>
                                <div className="text-xs text-white/60">Bedrooms</div>
                                <div className="font-semibold">{formData.bedrooms || formData.bhkType || "-"}</div>
                            </div>
                        )}
                        {isCommercial && commercialConfig && (
                            <div>
                                <div className="text-xs text-white/60">Key Feature</div>
                                <div className="font-semibold">
                                    {formData.seatingCapacity && `Seating: ${formData.seatingCapacity}`}
                                    {formData.workstations && `Workstations: ${formData.workstations}`}
                                    {formData.frontage && `Frontage: ${formData.frontage} ft`}
                                    {!formData.seatingCapacity && !formData.workstations && !formData.frontage && "-"}
                                </div>
                            </div>
                        )}
                        {/* Rent specific fields */}
                        {formData.listingType === "Rent" && isResidential && (
                            <>
                                <div>
                                    <div className="text-xs text-white/60">Preferred Tenants</div>
                                    <div className="font-semibold">{formData.allowedFor}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-white/60">Pet Friendly</div>
                                    <div className="font-semibold">{formData.petFriendly}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-white/60">Available From</div>
                                    <div className="font-semibold">{formData.availableFrom || "Immediate"}</div>
                                </div>
                            </>
                        )}
                        {/* Sell specific fields */}
                        {formData.listingType === "Sell" && isResidential && (
                            <>
                                <div>
                                    <div className="text-xs text-white/60">Construction Status</div>
                                    <div className="font-semibold">{formData.constructionStatus || "Ready to Move"}</div>
                                </div>
                                {formData.constructionStatus === "Under Construction" && formData.availableFrom && (
                                    <div>
                                        <div className="text-xs text-white/60">Expected Possession</div>
                                        <div className="font-semibold">{formData.availableFrom}</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {formData.selectedAmenities.length > 0 && (
                        <div>
                            <div className="text-xs text-white/60">Amenities</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {/* FIX: Ensure amenity tags contrast well on dark background */}
                                {formData.selectedAmenities.map(a => <span key={a} className="bg-[#E53935]/10 text-[#E53935] border border-[#E53935]/30 px-2 py-1 rounded text-xs">{a}</span>)}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="text-xs text-white/60">Description</div>
                        <div className="mt-2 text-sm text-white/80">{formData.description || generateShortDescription()}</div>
                    </div>

                    <div className="pt-3">
                        <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-[#E53935] hover:bg-[#c62828] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                            {isLoading ? "Publishing..." : <>Confirm & Publish <Check size={18} /></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
    };

    return (
        <div className="min-h-screen bg-[#004C99] flex flex-col md:flex-row font-sans text-white selection:bg-red-100 pt-20">
            <aside className="hidden md:flex flex-col w-80 bg-[#E53935] h-[calc(100vh-5rem)] sticky top-20 p-6 pt-8 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.1)] overflow-y-auto">
                <nav className="space-y-2 flex-1">
                    {STEPS.map(step => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <div key={step.id} className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive ? "bg-white text-[#E53935] shadow-md" : "text-red-100 hover:bg-[#E53935]/30 hover:text-white"}`}>
                                <div className={`relative z-10 transition-colors ${isActive ? "text-[#E53935]" : isCompleted ? "text-green-300" : "text-red-200 group-hover:text-white"}`}>
                                    {isCompleted ? <Check size={18} strokeWidth={3} /> : step.icon}
                                </div>
                                <div className="flex flex-col relative z-10">
                                    <span className={`font-bold text-sm ${isActive ? "text-[#E53935]" : "text-white"}`}>{step.label}</span>
                                    <span className={`text-xs font-medium ${isActive ? "text-[#E53935]/70" : "text-red-100/80"}`}>{step.description}</span>
                                </div>
                                {isActive && <motion.div layoutId="activeStep" className="absolute inset-0 bg-white rounded-2xl" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#E53935] rounded-l-full" />}
                            </div>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-8 border-t border-[#E53935]/30">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-white relative overflow-hidden">
                        <h4 className="font-bold">Seller Assistance</h4>
                        <p className="text-xs text-red-100 mt-2">Need help filling? Toggle tips in the form fields. Provide accurate photos and area details for better leads.</p>
                        <button onClick={() => setFormData(p => ({ ...p, showHelpTips: !p.showHelpTips }))} className="mt-3 w-full bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-xs transition-colors">Toggle Tips</button>
                    </div>
                </div>
            </aside>

            <div className="md:hidden bg-[#E53935] p-4 sticky top-20 z-30 border-b border-[#E53935] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg"><Home className="text-white" size={16} /></div>
                    <span className="font-bold text-white">Step {currentStep}</span>
                </div>
                <div className="flex gap-1.5">
                    {STEPS.map(s => <div key={s.id} className={`h-1.5 w-8 rounded-full ${s.id <= currentStep ? "bg-white" : "bg-red-400/50"}`} />)}
                </div>
            </div>

            <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full flex flex-col h-full">
                <div className="flex-1 bg-white/10 md:bg-transparent rounded-3xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-white/20 p-6 md:p-0 mb-20 md:mb-0 relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div key={currentStep} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="min-h-[520px]">
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                            {currentStep === 4 && renderStep4()}
                            {currentStep === 5 && renderStep5()}
                            {currentStep === 6 && renderStep6()}
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/20">
                        <button onClick={handlePrev} disabled={currentStep === 1} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? "text-white/30 cursor-not-allowed" : "text-white hover:bg-white/20 hover:shadow-md"}`}>
                            <ChevronLeft size={18} /> Back
                        </button>

                        <div className="flex items-center gap-3">
                            {currentStep < 6 ? (
                                <button onClick={handleNext} className="bg-white text-[#004C99] px-10 py-3 rounded-xl font-bold hover:bg-white/90 transition-all shadow-xl flex items-center gap-2">
                                    Next Step <ArrowRight size={18} />
                                </button>
                            ) : null}
                            {currentStep === 6 ? (
                                <button onClick={handleSubmit} disabled={isLoading} className="bg-[#E53935] text-white px-10 py-3 rounded-xl font-bold hover:bg-[#c62828] transition-all shadow-xl flex items-center gap-2">
                                    {isLoading ? "Publishing..." : <>Confirm & Publish <Check size={18} /></>}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}