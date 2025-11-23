import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Home, MapPin, IndianRupee, Layers, Image as ImageIcon, Calendar,
    ChevronLeft, Upload, Check, X, Building2, Users, Utensils, Car, Zap,
    Shield, Store, ArrowRight, FileText, Tag, Wifi, LandPlot
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
        expectedPrice: "", maintenance: "", expectedDeposit: "", priceNegotiable: false, gstApplicable: false,

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
                if (images.length < 1) return "Please upload at least 1 photo (preferably 5+).";
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
            submitData.append("category", finalCategoryId);
            submitData.append("title", generateTitle());
            submitData.append("description", formData.description || generateShortDescription());
            submitData.append("price", formData.expectedPrice);
            submitData.append("listingType", formData.listingType);
            submitData.append("priceUnit", formData.listingType === "Rent" ? "Monthly" : "Total");
            submitData.append("gstApplicable", formData.gstApplicable ? "Yes" : "No");

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
                maintenance: formData.maintenance,
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

            // Add images
            images.forEach(file => submitData.append("images", file));
            if (images.length > 0) {
                const inlineImages = await Promise.all(images.map(fileToBase64));
                submitData.append("inlineImages", JSON.stringify(inlineImages));
            }

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
                <p className="text-slate-500 mt-2">Choose category and type. We'll show only relevant fields next.</p>
            </div>

            <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Property Category</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(PROPERTY_CATEGORIES).map(([key, value]) => (
                    <div key={key}
                        className={`cursor-pointer rounded-2xl p-4 flex gap-4 items-center transition-all ${formData.propertyCategory === key ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 hover:shadow-sm"}`}
                        onClick={() => handleCategoryChange(key)}
                    >
                        <div className="p-3 rounded-full bg-white/10">
                            {value.icon}
                        </div>
                        <div>
                            <div className="font-bold">{key}</div>
                            <div className="text-xs text-slate-200/80">{value.desc}</div>
                        </div>
                        {formData.propertyCategory === key && <div className="ml-auto"><Check size={18} /></div>}
                    </div>
                ))}
            </div>

            <div>
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Property Type</label>
                <div className="flex flex-wrap gap-3 mt-2">
                    {PROPERTY_CATEGORIES[formData.propertyCategory].types.map(type => (
                        <button key={type} onClick={() => handlePropertyTypeChange(type)}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium ${formData.propertyType === type ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Residential only: BHK */}
            {isResidential && (
                <div>
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">BHK Configuration</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK", "Studio"].map(bhk => (
                            <button key={bhk} onClick={() => setFormData(p => ({ ...p, bhkType: bhk, bedrooms: bhk === "Studio" ? 0 : (bhk.split(" ")[0]) }))}
                                className={`px-4 py-2 rounded-xl border text-sm font-medium ${formData.bhkType === bhk ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"}`}>
                                {bhk}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Tip: Select the exact BHK — buyers search using these filters.</p>
                </div>
            )}

            {/* Commercial only: Sub-type */}
            {isCommercial && (
                <div>
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Commercial Sub-type</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {["Bare Shell", "Warm Shell", "Fully Furnished"].map(subType => (
                            <button key={subType} onClick={() => setFormData(p => ({ ...p, commercialSubType: subType }))}
                                className={`px-4 py-2 rounded-xl border text-sm font-medium ${formData.commercialSubType === subType ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"}`}>
                                {subType}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Tip: Select the condition of the commercial space.</p>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Location</h2>
                <p className="text-slate-500 mt-2">Accurate location increases trust and discoverability.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600" />
                    <div className="text-xs text-slate-400 mt-1">Make sure the city is correct — affects buyer reach.</div>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Locality / Society</label>
                    <input name="locality" value={formData.locality} onChange={handleChange} placeholder="e.g. Bandra West" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600" />
                    <div className="text-xs text-slate-400 mt-1">Add society or locality for better results.</div>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">Full Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} placeholder="Complete address, building name, street..." className="w-full px-4 py-3 rounded-xl border border-slate-200"></textarea>
                <div className="text-xs text-slate-400 mt-1">Include building name, floor, and flat number if applicable.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-700">Landmark</label>
                    <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Near City Mall" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Nearby (tags)</label>
                    <input name="nearby" value={(formData.nearby || []).join(", ")} onChange={(e) => setFormData(p => ({ ...p, nearby: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} placeholder="Metro, School, Hospital (comma separated)" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    <div className="text-xs text-slate-400 mt-1">Example: Metro Station, Primary School, Hospital</div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Pricing & Area</h2>
                <p className="text-slate-500 mt-2">Provide accurate area & pricing to attract quality leads.</p>
            </div>

            <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Listing Type</label>
                        <div className="flex gap-2 mt-2">
                            {["Rent", "Sell"].map(t => (
                                <button key={t} onClick={() => setFormData(p => ({ ...p, listingType: t }))} className={`px-4 py-2 rounded-xl text-sm ${formData.listingType === t ? "bg-slate-900 text-white" : "bg-white border border-slate-200"}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Expected {formData.listingType === "Rent" ? "Monthly Rent" : "Total Price"}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">₹</div>
                            <input name="expectedPrice" value={formData.expectedPrice} onChange={handleChange} type="number" className="w-full pl-10 px-4 py-3 rounded-xl border border-slate-200" placeholder="0" />
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Tip: Add exact amount for better buyer conversion.</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Maintenance (Monthly)</label>
                        <input name="maintenance" value={formData.maintenance} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="0" />
                    </div>
                    {formData.listingType === "Rent" && (
                        <div>
                            <label className="text-sm font-medium text-slate-700">Security Deposit</label>
                            <input name="expectedDeposit" value={formData.expectedDeposit} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="0" />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Price Negotiable?</label>
                        <select name="priceNegotiable" value={formData.priceNegotiable ? "Yes" : "No"} onChange={(e) => setFormData(p => ({ ...p, priceNegotiable: e.target.value === "Yes" }))} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                            <option>No</option>
                            <option>Yes</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-700">{isResidential ? "Built-up Area" : "Built-up / Carpet Area"}</label>
                    <div className="relative">
                        <input name="builtUpArea" value={formData.builtUpArea} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="eg. 1200" />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">sq.ft</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Built-up area is used by buyers to compare listings.</div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700">Carpet Area</label>
                    <div className="relative">
                        <input name="carpetArea" value={formData.carpetArea} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="eg. 900" />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">sq.ft</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Important for end users — be accurate.</div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700">Super Built-up Area (optional)</label>
                    <div className="relative">
                        <input name="superBuiltUpArea" value={formData.superBuiltUpArea} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="eg. 1400" />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">sq.ft</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {isResidential && (
                    <>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Floor No</label>
                            <input name="floorNo" value={formData.floorNo} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="eg. 3" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Total Floors</label>
                            <input name="totalFloors" value={formData.totalFloors} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="eg. 10" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Facing</label>
                            <select name="facing" value={formData.facing} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                                <option value="">Select</option>
                                {["East", "West", "North", "South", "NE", "NW", "SE", "SW"].map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </>
                )}
                {isCommercial && (
                    <>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Washrooms</label>
                            <input name="washrooms" value={formData.washrooms} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Floor Height (ft)</label>
                            <input name="floorHeight" value={formData.floorHeight} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Power Load (kW)</label>
                            <input name="powerLoad" value={formData.powerLoad} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Property Details</h2>
                <p className="text-slate-500 mt-2">Add specific features to make your listing stand out.</p>
            </div>

            {/* Residential specific fields */}
            {isResidential && (
                <>
                    <div className="bg-white rounded-2xl p-4 border">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Home size={18} />
                            Residential Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Bedrooms</label>
                                <input name="bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Bathrooms</label>
                                <input name="bathrooms" value={formData.bathrooms} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Balconies</label>
                                <input name="balconies" value={formData.balconies} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Furnishing</label>
                                <select name="furnishing" value={formData.furnishing} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                                    <option>Unfurnished</option>
                                    <option>Semi-Furnished</option>
                                    <option>Fully Furnished</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Property Age</label>
                                <select name="propertyAge" value={formData.propertyAge} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                                    <option>New</option>
                                    <option>1-5 Years</option>
                                    <option>5-10 Years</option>
                                    <option>10+ Years</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="servantRoom" checked={formData.servantRoom} onChange={handleChange} />
                                Servant Room
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="poojaRoom" checked={formData.poojaRoom} onChange={handleChange} />
                                Pooja Room
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="studyRoom" checked={formData.studyRoom} onChange={handleChange} />
                                Study Room
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="storeRoom" checked={formData.storeRoom} onChange={handleChange} />
                                Store Room
                            </label>
                        </div>
                    </div>
                </>
            )}

            {/* Commercial specific fields */}
            {isCommercial && commercialConfig && (
                <div className="bg-white rounded-2xl p-4 border">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        {commercialConfig.icon}
                        {commercialConfig.label}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {commercialConfig.fields.includes("workstations") && (
                            <div>
                                <label className="text-sm font-medium">Workstations</label>
                                <input name="workstations" value={formData.workstations} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("conferenceRooms") && (
                            <div>
                                <label className="text-sm font-medium">Conference Rooms</label>
                                <input name="conferenceRooms" value={formData.conferenceRooms} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("cabins") && (
                            <div>
                                <label className="text-sm font-medium">Private Cabins</label>
                                <input name="cabins" value={formData.cabins} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("seatingCapacity") && (
                            <div>
                                <label className="text-sm font-medium">Seating Capacity</label>
                                <input name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("kitchenArea") && (
                            <div>
                                <label className="text-sm font-medium">Kitchen Area (sq.ft)</label>
                                <input name="kitchenArea" value={formData.kitchenArea} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("frontage") && (
                            <div>
                                <label className="text-sm font-medium">Frontage (ft)</label>
                                <input name="frontage" value={formData.frontage} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("loadingDocks") && (
                            <div>
                                <label className="text-sm font-medium">Loading Docks</label>
                                <input name="loadingDocks" value={formData.loadingDocks} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("ceilingHeight") && (
                            <div>
                                <label className="text-sm font-medium">Ceiling Height (ft)</label>
                                <input name="ceilingHeight" value={formData.ceilingHeight} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}

                        {commercialConfig.fields.includes("floorLoadCapacity") && (
                            <div>
                                <label className="text-sm font-medium">Floor Load Capacity (kg/sq.ft)</label>
                                <input name="floorLoadCapacity" value={formData.floorLoadCapacity} onChange={handleChange} type="number" className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {commercialConfig.fields.includes("barArea") && (
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="barArea" checked={formData.barArea} onChange={handleChange} />
                                Bar Area Available
                            </label>
                        )}

                        {commercialConfig.fields.includes("outdoorSeating") && (
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="outdoorSeating" checked={formData.outdoorSeating} onChange={handleChange} />
                                Outdoor Seating Available
                            </label>
                        )}

                        {commercialConfig.fields.includes("overheadCrane") && (
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="overheadCrane" checked={formData.overheadCrane} onChange={handleChange} />
                                Overhead Crane Available
                            </label>
                        )}
                    </div>
                </div>
            )}

            {/* Common fields for both property types */}
            <div className="bg-white rounded-2xl p-4 border">
                <h3 className="font-bold mb-4">Parking & Amenities</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Parking (Covered)</label>
                        <input name="parkingCovered" value={formData.parkingCovered} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Parking (Open)</label>
                        <input name="parkingOpen" value={formData.parkingOpen} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                        {PROPERTY_CATEGORIES[formData.propertyCategory].amenities.map(am => (
                            <div key={am} onClick={() => handleAmenityToggle(am)} className={`p-3 rounded-xl border cursor-pointer ${formData.selectedAmenities.includes(am) ? "bg-green-50 border-green-400" : "bg-white border-slate-200"}`}>
                                <div className="flex items-center gap-2">
                                    <div className="text-slate-600">{AMENITY_ICONS[am] || <Tag size={14} />}</div>
                                    <div className="text-sm">{am}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Tip: Select all amenities that apply — this helps match filtered searches.</div>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Photos & Documents</h2>
                <p className="text-slate-500 mt-2">Good photos and documents increase lead quality.</p>
            </div>

            <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-blue-50/30 relative">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="inline-flex items-center gap-3 bg-white p-4 rounded-full shadow mb-3">
                    <Upload size={20} className="text-blue-600" />
                    <div>
                        <div className="font-bold">Click to upload photos</div>
                        <div className="text-xs text-slate-500">Up to 15 photos. Start with main area, facade, amenities.</div>
                    </div>
                </div>
            </div>

            {previewImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {previewImages.map((src, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden">
                            <img src={src} className="w-full h-40 object-cover" alt={`preview-${idx}`} />
                            <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-white rounded-full p-2 shadow"><X size={14} /></button>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Video Walkthrough (optional)</label>
                    <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="YouTube / Google Drive link" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    <div className="text-xs text-slate-400 mt-1">Tip: A short 60-90s walkthrough greatly improves engagement.</div>
                </div>
                <div>
                    <label className="text-sm font-medium">Upload Documents (RERA / OC) - optional</label>
                    <input type="file" accept=".pdf" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    <div className="text-xs text-slate-400 mt-1">Upload RERA/Occupancy Certificate / Trade License if available.</div>
                </div>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Review & Publish</h2>
                <p className="text-slate-500 mt-2">Double-check everything — buyers prefer complete listings.</p>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
                <div className="h-56 bg-slate-100 rounded-2xl overflow-hidden relative mb-4">
                    {previewImages[0] ? <img src={previewImages[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={48} /></div>}
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold">{formData.listingType}</div>
                    <div className="absolute top-4 right-4 bg-slate-900/90 text-white px-3 py-1 rounded text-xs font-bold">{formData.propertyCategory}</div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-bold text-xl">{generateTitle()}</h3>
                            <p className="text-sm text-slate-600">{formData.locality}, {formData.city}</p>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-lg">₹ {formData.expectedPrice ? Number(formData.expectedPrice).toLocaleString() : "-"}</div>
                            <div className="text-xs text-slate-500">{formData.priceNegotiable ? "Negotiable" : "Fixed Price"}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-slate-100">
                        <div>
                            <div className="text-xs text-slate-500">Area</div>
                            <div className="font-semibold">{formData.builtUpArea || formData.carpetArea || "-"} sq.ft</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Furnishing</div>
                            <div className="font-semibold">{formData.furnishing}</div>
                        </div>
                        {isResidential && (
                            <div>
                                <div className="text-xs text-slate-500">Bedrooms</div>
                                <div className="font-semibold">{formData.bedrooms || formData.bhkType || "-"}</div>
                            </div>
                        )}
                        {isCommercial && commercialConfig && (
                            <div>
                                <div className="text-xs text-slate-500">Key Feature</div>
                                <div className="font-semibold">
                                    {formData.seatingCapacity && `Seating: ${formData.seatingCapacity}`}
                                    {formData.workstations && `Workstations: ${formData.workstations}`}
                                    {formData.frontage && `Frontage: ${formData.frontage} ft`}
                                    {!formData.seatingCapacity && !formData.workstations && !formData.frontage && "-"}
                                </div>
                            </div>
                        )}
                    </div>

                    {formData.selectedAmenities.length > 0 && (
                        <div>
                            <div className="text-xs text-slate-500">Amenities</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.selectedAmenities.map(a => <span key={a} className="bg-slate-100 px-2 py-1 rounded text-xs">{a}</span>)}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="text-xs text-slate-500">Description</div>
                        <div className="mt-2 text-sm text-slate-700">{formData.description || generateShortDescription()}</div>
                    </div>

                    <div className="pt-3">
                        <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            {isLoading ? "Publishing..." : <>Confirm & Publish <Check size={18} /></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-blue-100 pt-20">
            <aside className="hidden md:flex flex-col w-80 bg-white border-r border-slate-200 h-[calc(100vh-5rem)] sticky top-20 p-6 pt-8 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto">
                <nav className="space-y-2 flex-1">
                    {STEPS.map(step => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <div key={step.id} className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                                <div className={`relative z-10 transition-colors ${isActive ? "text-blue-600" : isCompleted ? "text-green-500" : "text-slate-400 group-hover:text-slate-600"}`}>
                                    {isCompleted ? <Check size={18} strokeWidth={3} /> : step.icon}
                                </div>
                                <div className="flex flex-col relative z-10">
                                    <span className={`font-bold text-sm ${isActive ? "text-blue-900" : "text-slate-700"}`}>{step.label}</span>
                                    <span className="text-xs opacity-70 font-medium">{step.description}</span>
                                </div>
                                {isActive && <motion.div layoutId="activeStep" className="absolute inset-0 bg-blue-50 rounded-2xl" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full" />}
                            </div>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-100">
                    <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
                        <h4 className="font-bold">Seller Assistance</h4>
                        <p className="text-xs text-slate-300 mt-2">Need help filling? Toggle tips in the form fields. Provide accurate photos and area details for better leads.</p>
                        <button onClick={() => setFormData(p => ({ ...p, showHelpTips: !p.showHelpTips }))} className="mt-3 w-full bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs transition-colors">Toggle Tips</button>
                    </div>
                </div>
            </aside>

            <div className="md:hidden bg-white p-4 sticky top-20 z-30 border-b border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg"><Home className="text-white" size={16} /></div>
                    <span className="font-bold">Step {currentStep}</span>
                </div>
                <div className="flex gap-1.5">
                    {STEPS.map(s => <div key={s.id} className={`h-1.5 w-8 rounded-full ${s.id <= currentStep ? "bg-blue-600" : "bg-slate-200"}`} />)}
                </div>
            </div>

            <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full flex flex-col h-full">
                <div className="flex-1 bg-white md:bg-transparent rounded-3xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-slate-200 p-6 md:p-0 mb-20 md:mb-0 relative">
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

                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200/60">
                        <button onClick={handlePrev} disabled={currentStep === 1} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-white hover:shadow-md hover:text-slate-900"}`}>
                            <ChevronLeft size={18} /> Back
                        </button>

                        <div className="flex items-center gap-3">
                            {currentStep < 6 ? (
                                <button onClick={handleNext} className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2">
                                    Next Step <ArrowRight size={18} />
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}