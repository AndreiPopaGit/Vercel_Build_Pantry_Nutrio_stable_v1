import React, { useState } from 'react';
import LogItem from './LogItem';
import { ChevronDownIcon } from '../../components/consumption/SVGIcons';

const MealSection = ({ title, entries, onAddFood, onDeleteLogEntry }) => {
    const [isOpen, setIsOpen] = useState(true);
    const totalCalories = entries.reduce((sum, item) => sum + item.calories, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-stone-200">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4">
                <div>
                    <h3 className="text-xl font-bold text-stone-800">{title}</h3>
                    <p className="text-sm text-stone-500">{totalCalories.toFixed(0)} calories</p>
                </div>
                 <ChevronDownIcon className={`transform transition-transform text-stone-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-stone-200">
                    <div className="space-y-3 my-4">
                        {entries.map(entry => (
                            <LogItem key={entry.id} entry={entry} onDelete={() => onDeleteLogEntry(entry.id)} />
                        ))}
                         {entries.length === 0 && <p className="text-stone-500 text-center">No items logged for this meal.</p>}
                    </div>
                    <button onClick={onAddFood} className="w-full py-2 px-4 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 font-semibold">
                        Add Food
                    </button>
                </div>
            )}
        </div>
    );
};

export default MealSection;
