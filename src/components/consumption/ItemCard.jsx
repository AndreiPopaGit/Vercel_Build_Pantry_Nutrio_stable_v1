import React from 'react';
import { getExpiryStatus } from '../../components/consumption/HelperFunc';
import { EditIcon, TrashIcon, MoveIcon } from '../../components/consumption/SVGIcons';

const ItemCard = ({ item, onEdit, onDelete, onMove, onLogItem }) => {
  const { status, text } = getExpiryStatus(item.expiryDate);
  const statusColor = {
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
    green: 'bg-lime-500',
  };

  const handleMoveClick = (e) => {
    e.stopPropagation();
    const destination = item.location === 'Fridge' ? 'Freezer' : 'Fridge';
    onMove(item.id, destination);
  };
  
  const destination = item.location === 'Fridge' ? 'Freezer' : 'Fridge';

  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-sm mb-3 flex flex-col">
      {/* Main clickable area */}
      <div onClick={() => onLogItem(item)} className="p-4 cursor-pointer transition-colors hover:bg-stone-50/50 rounded-t-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center mb-1">
              <span className={`w-3 h-3 rounded-full mr-2 ${statusColor[status]}`}></span>
              <p className="font-bold text-stone-800">{item.name}</p>
            </div>
            <p className="text-sm text-stone-600">{item.quantity} {item.unit}</p>
            <p className={`text-sm mt-1 ${status === 'red' ? 'text-red-600 font-semibold' : 'text-stone-500'}`}>{text}</p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-stone-200 bg-stone-50/70 px-3 py-2 flex items-center justify-between rounded-b-lg">
        <div>
          {['Fridge', 'Freezer'].includes(item.location) && (
            <button 
              onClick={handleMoveClick} 
              className="flex items-center space-x-2 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-md hover:bg-amber-200 hover:text-amber-800 transition-all"
            >
              <MoveIcon />
              <span>Move to {destination}</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 rounded-full text-stone-400 hover:bg-blue-100 hover:text-blue-600"><EditIcon /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 rounded-full text-stone-400 hover:bg-red-100 hover:text-red-600"><TrashIcon /></button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
