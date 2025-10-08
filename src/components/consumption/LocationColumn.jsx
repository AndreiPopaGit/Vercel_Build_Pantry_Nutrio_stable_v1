import React from 'react';
import ItemCard from './ItemCard';

const LocationColumn = ({ title, items, ...props }) => (
  <div className="bg-stone-50/50 rounded-lg p-4 h-full border border-stone-200">
    <h2 className="text-xl font-bold mb-4 text-amber-900 border-b-2 border-amber-200 pb-2">{title}</h2>
    <div className="overflow-y-auto h-[calc(100vh-230px)] pr-2">
      {items.length > 0 ? items.map(item => <ItemCard key={item.id} item={item} {...props} />) : <p className="text-stone-500 text-center mt-4">Nothing here!</p>}
    </div>
  </div>
);

export default LocationColumn;
