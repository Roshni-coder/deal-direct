// src/Components/HeroSection/CommercialPropertyTypeFilter.jsx
import React from "react";
import { commercialPropertyTypes } from "./filterConfig";

const CommercialPropertyTypeFilter = ({
  selectedCommercialPropertyTypes,
  setSelectedCommercialPropertyTypes,
  openDropdown,
  setOpenDropdown,
  dropdownRef
}) => {
  const handleToggle = (type) => {
    setSelectedCommercialPropertyTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpenDropdown(openDropdown === 'commercialPropertyType' ? null : 'commercialPropertyType')}
        className="appearance-none bg-white rounded-xl px-4 py-3 min-h-[44px] pr-10 text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 outline-none border border-gray-300 cursor-pointer text-base sm:text-sm shadow-sm flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100"
      >
        Property Type
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {openDropdown === 'commercialPropertyType' && (
        <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-50 w-72">
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {commercialPropertyTypes.map((type, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 p-3 min-h-[44px] rounded-lg transition-colors touch-action-manipulation"
              >
                <input
                  type="checkbox"
                  checked={selectedCommercialPropertyTypes.includes(type)}
                  onChange={() => handleToggle(type)}
                  className="w-5 h-5 min-w-[20px] text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer touch-checkbox"
                />
                <span className="text-sm text-gray-700 font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialPropertyTypeFilter;
