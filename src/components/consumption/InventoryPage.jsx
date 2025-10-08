import React, { useMemo } from 'react';
import { PlusIcon } from '../../components/consumption/SVGIcons';
import LocationColumn from '../../components/consumption/LocationColumn';

const InventoryPage = ({ inventory, onEdit, onDelete, onMove, onAdd, onLogItem }) => {
  const sortedInventory = useMemo(() => 
    [...inventory].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)), 
    [inventory]
  );
  
  const fridgeItems = sortedInventory.filter(i => i.location === 'Fridge');
  const freezerItems = sortedInventory.filter(i => i.location === 'Freezer');
  const pantryItems = sortedInventory.filter(i => i.location === 'Pantry');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LocationColumn title="Fridge" items={fridgeItems} onEdit={onEdit} onDelete={onDelete} onMove={onMove} onLogItem={onLogItem} />
        <LocationColumn title="Freezer" items={freezerItems} onEdit={onEdit} onDelete={onDelete} onMove={onMove} onLogItem={onLogItem} />
        <LocationColumn title="Pantry" items={pantryItems} onEdit={onEdit} onDelete={onDelete} onMove={onMove} onLogItem={onLogItem} />
      </div>
       <button 
        onClick={onAdd}
        className="fixed bottom-8 right-8 bg-amber-600 text-white rounded-full p-4 shadow-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-transform hover:scale-110"
        aria-label="Add new item"
       >
        <PlusIcon />
      </button>
    </div>
  );
};

export default InventoryPage;
