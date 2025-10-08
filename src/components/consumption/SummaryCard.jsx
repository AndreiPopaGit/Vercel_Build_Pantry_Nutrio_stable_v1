import React from 'react';

const SummaryCard = ({ title, value, color }) => (
    <div className={`p-4 rounded-lg shadow-sm border ${color}`}>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
);

export default SummaryCard;
