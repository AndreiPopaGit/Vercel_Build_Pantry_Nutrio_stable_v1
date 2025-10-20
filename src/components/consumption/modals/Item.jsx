import React, { useState, useEffect } from 'react';
import { XIcon } from '../../../components/consumption/SVGIcons';
import { CATEGORIES, UNITS, LOCATIONS } from '../../../constant/categories';

const ItemModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({});
    const [subcategories, setSubcategories] = useState([]);

    useEffect(() => {
        const initialCategory = item ? item.category : Object.keys(CATEGORIES)[0];
        const initialSubcategories = CATEGORIES[initialCategory] || [];
        const initialSubcategory = item ? item.subcategory : initialSubcategories[0] || '';

        const initialData = item || {
            name: '',
            quantity: '',
            unit: UNITS[0],
            expiryDate: '',
            category: initialCategory,
            subcategory: initialSubcategory,
            location: LOCATIONS[0]
        };
        setFormData(initialData);
        setSubcategories(initialSubcategories);
    }, [item, isOpen]);

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        const newSubcategories = CATEGORIES[category] || [];
        setSubcategories(newSubcategories);
        setFormData({ ...formData, category, subcategory: newSubcategories[0] || '' });
    };
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        // FIX: Replaced Tailwind opacity classes with a direct RGBA background for reliable transparency.
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-40 flex justify-center items-start pt-16">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold text-stone-800">{item ? 'Edit Item' : 'Add New Item'}</h2>
                     <button onClick={onClose} className="text-stone-500 hover:text-stone-800 p-1 rounded-full hover:bg-stone-100"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Item Name" className="w-full p-2 border-stone-300 border rounded" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} placeholder="Quantity" className="w-full p-2 border-stone-300 border rounded" required />
                        <select name="unit" value={formData.unit || ''} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded">
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-stone-700">Expiry Date</label>
                        <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <select name="category" value={formData.category || ''} onChange={handleCategoryChange} className="w-full p-2 border-stone-300 border rounded">
                            {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <select name="subcategory" value={formData.subcategory || ''} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded">
                            {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <select name="location" value={formData.location || ''} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded">
                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-stone-200 text-stone-800 rounded hover:bg-stone-300 font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 font-semibold">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemModal;