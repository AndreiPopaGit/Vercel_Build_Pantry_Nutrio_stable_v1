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

  return (
    <div onClick={() => onLogItem(item)} className="bg-white rounded-lg border border-stone-200 p-4 mb-3 transition-all hover:shadow-lg hover:border-amber-400 cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center mb-1">
            <span className={`w-3 h-3 rounded-full mr-2 ${statusColor[status]}`}></span>
            <p className="font-bold text-stone-800">{item.name}</p>
          </div>
          <p className="text-sm text-stone-600">{item.quantity} {item.unit}</p>
          <p className={`text-sm mt-1 ${status === 'red' ? 'text-red-600 font-semibold' : 'text-stone-500'}`}>{text}</p>
        </div>
        <div className="flex items-center space-x-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 rounded-full text-stone-400 hover:bg-blue-100 hover:text-blue-600"><EditIcon /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 rounded-full text-stone-400 hover:bg-red-100 hover:text-red-600"><TrashIcon /></button>
            {['Fridge', 'Freezer'].includes(item.location) && (
                <button onClick={(e) => { e.stopPropagation(); onMove(item); }} className="p-2 rounded-full text-stone-400 hover:bg-amber-100 hover:text-amber-600"><MoveIcon /></button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
