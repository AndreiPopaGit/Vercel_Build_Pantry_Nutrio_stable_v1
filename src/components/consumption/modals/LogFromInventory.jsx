import React, { useState, useEffect } from 'react';
import { XIcon } from '../../../components/consumption/SVGIcons';
import { MEALS } from '../../../constant/ConsumptionDummy';


const LogFromInventoryModal = ({ isOpen, onClose, onSave, item, initialMeal }) => {
    const [logData, setLogData] = useState({ meal: initialMeal || MEALS[0], quantity: '', calories: '', protein: '', carbs: '', fat: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            setLogData({ meal: initialMeal || MEALS[0], quantity: '', calories: '', protein: '', carbs: '', fat: '' });
            setError('');
        }
    }, [item, initialMeal, isOpen]);
    
    const handleChange = (e) => setLogData({ ...logData, [e.target.name]: e.target.value });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const consumed = parseFloat(logData.quantity);
        if (isNaN(consumed) || consumed <= 0 || consumed > item.quantity) {
            setError(`Please enter a valid quantity between 0 and ${item.quantity}.`);
            return;
        }
        onSave({
            id: Date.now(),
            inventoryItemId: item.id,
            name: item.name,
            unit: item.unit,
            date: new Date().toISOString().split('T')[0],
            quantity: consumed,
            meal: logData.meal,
            calories: parseFloat(logData.calories) || 0,
            protein: parseFloat(logData.protein) || 0,
            carbs: parseFloat(logData.carbs) || 0,
            fat: parseFloat(logData.fat) || 0,
        });
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-16">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-stone-800">Log "{item.name}"</h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800 p-1 rounded-full hover:bg-stone-100"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="quantity" placeholder="Quantity" value={logData.quantity} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded" required />
                        <select name="meal" value={logData.meal} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded">
                            {MEALS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <p className="text-sm text-stone-500">Enter nutritional info for the amount consumed:</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="calories" placeholder="Calories" value={logData.calories} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded" required />
                        <input type="number" name="protein" placeholder="Protein (g)" value={logData.protein} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded" />
                        <input type="number" name="carbs" placeholder="Carbs (g)" value={logData.carbs} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded" />
                        <input type="number" name="fat" placeholder="Fat (g)" value={logData.fat} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-stone-200 text-stone-800 rounded hover:bg-stone-300 font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 font-semibold">Log Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogFromInventoryModal;
