import React, { useState } from 'react';
import { TrashIcon } from '../../components/consumption/SVGIcons';

const LogItem = ({ entry, onDelete }) => {
    const [detailsVisible, setDetailsVisible] = useState(false);

    return (
        <div className="p-3 rounded-md bg-stone-50 border border-stone-200">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setDetailsVisible(!detailsVisible)}>
                <div>
                    <p className="font-medium text-stone-700">{entry.name}</p>
                    <p className="text-sm text-stone-500">{entry.calories.toFixed(0)} calories</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-stone-400">{entry.quantity} {entry.unit}</span>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-stone-400 hover:text-red-600"><TrashIcon /></button>
                </div>
            </div>
            {detailsVisible && (
                <div className="mt-2 pt-2 border-t text-sm text-stone-600">
                    <p>Protein: {entry.protein}g, Carbs: {entry.carbs}g, Fat: {entry.fat}g</p>
                </div>
            )}
        </div>
    );
}

export default LogItem;
