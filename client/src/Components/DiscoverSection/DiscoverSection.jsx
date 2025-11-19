// src/Components/DiscoverSection/DiscoverSection.jsx
import React, { useState } from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

const DiscoverSection = () => {
  const [expandedSection, setExpandedSection] = useState("New Projects");
  const [activeTabs, setActiveTabs] = useState({
    "New Projects": "budget",
    "Properties for Sale": "budget",
    "Properties for Rent": "propertyType",
  });

  const toggleSection = (title) => {
    if (expandedSection === title) {
      return;
    }
    setExpandedSection(title);
  };

  const setActiveTab = (section, tab) => {
    setActiveTabs({ ...activeTabs, [section]: tab });
  };

  const sections = {
    "New Projects": {
      description:
        "Be part of something fresh and exciting with these new projects in Mumbai. They feature innovative designs, smart layouts, and all the modern comforts you always dreamed of. Known to be ideal for new-age living, find early-bird prices and flexible payment plans.",
      tabs: [
        { name: "By Budget", key: "budget" },
        { name: "By Property Type", key: "propertyType" },
        { name: "By BHK", key: "bhk" },
      ],
      content: {
        budget: [
          {
            image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
            title: "25878+ Ready to Move",
            subtitle: "Projects in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
            title: "984+ New Launch",
            subtitle: "Projects in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
            title: "Above 3 Cr Luxury Housing",
            subtitle: "Projects in Mumbai",
          },
        ],
        propertyType: [
          {
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
            title: "Apartments",
            subtitle: "in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
            title: "Villas",
            subtitle: "in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
            title: "Plots & Land",
            subtitle: "in Mumbai",
          },
        ],
        bhk: [
          {
            image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
            title: "Studio Apartment",
            subtitle: "in Mumbai for Sale",
          },
          {
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
            title: "1 BHK Flats",
            subtitle: "in Mumbai for Sale",
          },
          {
            image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
            title: "2 BHK Flats",
            subtitle: "in Mumbai for Sale",
          },
        ],
      },
    },
    "Properties for Sale": {
      description:
        "Make a confident buying decision with our curated properties for sale listings. These properties back up everything you need: the positioning, conveniences, affordability, and legal clarity. It doesn't matter if it's a compact urban apartment or a spacious suburban home, we take care of it.",
      tabs: [
        { name: "By Budget", key: "budget" },
        { name: "By Property Type", key: "propertyType" },
        { name: "By BHK", key: "bhk" },
      ],
      content: {
        budget: [
          {
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            title: "Property for Sale",
            subtitle: "Under 30 Lakhs",
          },
          {
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
            title: "Property for Sale",
            subtitle: "30 - 60 Lakhs",
          },
          {
            image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
            title: "Property for Sale",
            subtitle: "Above 60 Lakhs",
          },
        ],
        propertyType: [
          {
            image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
            title: "Flats & Apartments",
            subtitle: "for Sale in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
            title: "Independent Houses",
            subtitle: "for Sale in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
            title: "Builder Floor",
            subtitle: "for Sale in Mumbai",
          },
        ],
        bhk: [
          {
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
            title: "Studio Apartment",
            subtitle: "for Sale in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&q=80",
            title: "1 BHK Flats",
            subtitle: "in Mumbai for Sale",
          },
          {
            image: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80",
            title: "2 BHK Flats",
            subtitle: "in Mumbai for Sale",
          },
        ],
      },
    },
    "Properties for Rent": {
      description:
        "Find your perfect rental property in Mumbai. Browse through verified listings with transparent pricing, flexible lease terms, and hassle-free documentation. From studio apartments to spacious family homes, discover your ideal rental today.",
      tabs: [
        { name: "By Property Type", key: "propertyType" },
        { name: "By BHK", key: "bhk" },
      ],
      content: {
        propertyType: [
          {
            image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
            title: "Flats & Apartments",
            subtitle: "for Rent in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800&q=80",
            title: "Independent Houses",
            subtitle: "for Rent in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
            title: "PG / Hostels",
            subtitle: "in Mumbai",
          },
        ],
        bhk: [
          {
            image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
            title: "Studio Apartment",
            subtitle: "for Rent in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
            title: "1 RK Flats",
            subtitle: "for Rent in Mumbai",
          },
          {
            image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&q=80",
            title: "1 BHK Flats",
            subtitle: "for Rent in Mumbai",
          },
        ],
      },
    },
  };

  return (
    // ✅ ENHANCED: Subtle gradient background for better visual hierarchy
    <section className="w-full py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
          Discover More Real Estate Options in Mumbai
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Sidebar */}
          <div className="flex flex-col gap-3 w-full md:w-[300px]">
            {Object.keys(sections).map((sectionTitle) => (
              <div
                key={sectionTitle}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  className="w-full flex justify-between items-center px-4 py-3 font-semibold text-base hover:bg-gray-50 transition"
                  onClick={() => toggleSection(sectionTitle)}
                >
                  <span>{sectionTitle}</span>
                  <span>
                    {expandedSection === sectionTitle ? (
                      <FiChevronDown className="text-lg transition-transform" />
                    ) : (
                      <FiChevronRight className="text-lg transition-transform" />
                    )}
                  </span>
                </button>

                {expandedSection === sectionTitle && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="text-gray-600 text-xs leading-relaxed mt-3 mb-3">
                      {sections[sectionTitle].description}
                    </div>
                    <button className="bg-red-600 text-white font-semibold px-3 py-2 rounded-md shadow hover:bg-blue-700 transition text-xs">
                      View All
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Cards */}
          {expandedSection && sections[expandedSection] && (
            <div className="flex-1">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {sections[expandedSection].tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(expandedSection, tab.key)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      activeTabs[expandedSection] === tab.key
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Cards Grid - Compact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sections[expandedSection].content[
                  activeTabs[expandedSection]
                ].map((card, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl shadow-sm hover:shadow-md bg-white overflow-hidden transition transform hover:scale-[1.02] group cursor-pointer"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-48 object-cover hover:brightness-90 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <div className="text-sm sm:text-base font-semibold drop-shadow mb-1">
                        {card.title}
                      </div>
                      <p className="text-xs font-medium drop-shadow">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DiscoverSection;
