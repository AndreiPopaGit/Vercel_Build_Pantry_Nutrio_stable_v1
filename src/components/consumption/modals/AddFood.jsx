import React, { useState, useEffect } from 'react';
import { XIcon } from '../../../components/consumption/SVGIcons';

const AddFoodModal = ({ isOpen, onClose, onSave, inventory, meal, onLogFromInventory }) => {
    const [activeTab, setActiveTab] = useState('quick');
    const [quickAddForm, setQuickAddForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
      if (isOpen) {
          setQuickAddForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
          setSearchTerm('');
          setActiveTab('quick');
      }
    }, [isOpen]);

    const handleQuickAddChange = (e) => setQuickAddForm({ ...quickAddForm, [e.target.name]: e.target.value });

    const handleQuickAddSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...quickAddForm, meal, id: Date.now(), date: new Date().toISOString().split('T')[0],
            calories: parseFloat(quickAddForm.calories) || 0, protein: parseFloat(quickAddForm.protein) || 0,
            carbs: parseFloat(quickAddForm.carbs) || 0, fat: parseFloat(quickAddForm.fat) || 0,
            quantity: 1, unit: 'serving',
        });
    }

    const handleSelectFromInventory = (item) => {
        onLogFromInventory(item, meal); // Pass the meal type
        onClose();
    }
    
    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-16">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold text-stone-800">Add Food to {meal}</h2>
                     <button onClick={onClose} className="text-stone-500 hover:text-stone-800 p-1 rounded-full hover:bg-stone-100"><XIcon /></button>
                </div>
                <div className="border-b border-stone-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('quick')} className={`${activeTab === 'quick' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Quick Add</button>
                        <button onClick={() => setActiveTab('inventory')} className={`${activeTab === 'inventory' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Add from Inventory</button>
                    </nav>
                </div>
                <div className="pt-6">
                    {activeTab === 'quick' && (
                        <form onSubmit={handleQuickAddSubmit} className="space-y-4">
                           <input type="text" name="name" placeholder="Food Name" value={quickAddForm.name} onChange={handleQuickAddChange} className="w-full p-2 border-stone-300 border rounded" required />
                            <div className="grid grid-cols-2 gap-4">
                               <input type="number" name="calories" placeholder="Calories" value={quickAddForm.calories} onChange={handleQuickAddChange} className="w-full p-2 border-stone-300 border rounded" required />
                               <input type="number" name="protein" placeholder="Protein (g)" value={quickAddForm.protein} onChange={handleQuickAddChange} className="w-full p-2 border-stone-300 border rounded" />
                               <input type="number" name="carbs" placeholder="Carbs (g)" value={quickAddForm.carbs} onChange={handleQuickAddChange} className="w-full p-2 border-stone-300 border rounded" />
                               <input type="number" name="fat" placeholder="Fat (g)" value={quickAddForm.fat} onChange={handleQuickAddChange} className="w-full p-2 border-stone-300 border rounded" />
                           </div>
                           <button type="submit" className="w-full py-2 px-4 bg-amber-600 text-white rounded hover:bg-amber-700 font-semibold">Add Log Entry</button>
                        </form>
                    )}
                    {activeTab === 'inventory' && (
                        <div>
                             <input type="text" placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border-stone-300 border rounded mb-4" />
                            <div className="max-h-64 overflow-y-auto">
                               {filteredInventory.map(item => (
                                   <div key={item.id} onClick={() => handleSelectFromInventory(item)} className="flex justify-between items-center p-2 hover:bg-stone-100 rounded cursor-pointer">
                                       <span className="text-stone-700">{item.name}</span>
                                       <span className="text-sm text-stone-500">{item.quantity} {item.unit}</span>
                                   </div>
                               ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFoodModal;
