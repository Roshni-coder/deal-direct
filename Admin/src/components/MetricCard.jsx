import React from 'react';

const MetricCard = ({ title, value, change }) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-sm font-medium opacity-90">{title}</h3>

    <div className="text-3xl font-extrabold tracking-tight">{value}</div>

    {change && (
      <p className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full w-fit">
        {change}
      </p>
    )}
  </div>
);



export default MetricCard;
