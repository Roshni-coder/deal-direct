// components/FunnelChart.jsx
import React from "react";

const FunnelChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="w-full">
          <p className="font-medium mb-1">{item.label}</p>
          <div className="relative h-8 bg-gray-200 rounded-xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-xl"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            ></div>

            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-800">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FunnelChart;
