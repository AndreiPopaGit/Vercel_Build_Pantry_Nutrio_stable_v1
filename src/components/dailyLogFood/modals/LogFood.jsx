import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabaseClient'; // Adjust path as needed
// Import XIcon and a new SearchIcon (assuming you'll add it to SVGIcons.jsx)
import { XIcon, SearchIcon } from '../../consumption/SVGIcons'; // Adjust path as needed
import { MEALS } from '../../../constant/categories'; // Adjust path as needed

// Debounce helper
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};


const LogFoodModal = ({ isOpen, onClose, onSave, meal: initialMeal, existingEntry }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('g');
    const [kcal, setKcal] = useState(0);
    const [protein, setProtein] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fat, setFat] = useState(0);
    const [uiMeal, setUiMeal] = useState('Breakfast');

    // Reset/Pre-fill state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (existingEntry) {
                setName(existingEntry.name);
                setQuantity(existingEntry.quantity);
                setUnit(existingEntry.unit);
                setKcal(existingEntry.kcal);
                setProtein(existingEntry.protein);
                setCarbs(existingEntry.carbs);
                setFat(existingEntry.fat);
                setSelectedFood({ name: existingEntry.name });
                setUiMeal(existingEntry.meal || 'Breakfast');
            } else {
                setSearchTerm('');
                setSearchResults([]);
                setSelectedFood(null);
                setName('');
                setQuantity(100);
                setUnit('g');
                setKcal(0); setProtein(0); setCarbs(0); setFat(0);
                setUiMeal(initialMeal || 'Breakfast');
            }
        }
    }, [isOpen, existingEntry, initialMeal]);

    // --- Search Logic ---
    const searchCatalog = async (term) => {
        if (term.length < 2) {
            setSearchResults([]); return;
        }
        setIsLoading(true);
        const { data, error } = await supabase.from('nutrition_catalog').select('*').ilike('name', `%${term}%`).limit(10);
        if (error) console.error('Error searching nutrition catalog:', error);
        else setSearchResults(data || []);
        setIsLoading(false);
    };

    const debouncedSearch = useCallback(debounce(searchCatalog, 300), []);

    useEffect(() => {
        if (!existingEntry && searchTerm) debouncedSearch(searchTerm);
        else setSearchResults([]);
    }, [searchTerm, debouncedSearch, existingEntry]);

    // --- Nutrition Calculation ---
    useEffect(() => {
        if (!selectedFood || !selectedFood.kcal_per_100g || (existingEntry && selectedFood.name === existingEntry.name)) {
             return; // Allow manual entry or keep existing values when editing same item
        }

        let totalGrams = 0;
        const currentQuantity = Number(quantity);
        if (isNaN(currentQuantity)) return;

        if (unit === 'g') totalGrams = currentQuantity;
        else if (unit === 'pcs' && selectedFood.grams_per_piece) totalGrams = currentQuantity * selectedFood.grams_per_piece;
        else if (unit === 'pcs') {
             setKcal(0); setProtein(0); setCarbs(0); setFat(0); return;
        }

        if (totalGrams > 0) {
            const ratio = totalGrams / 100;
            setKcal(+(selectedFood.kcal_per_100g * ratio).toFixed(1));
            setProtein(+(selectedFood.protein_per_100g * ratio).toFixed(1));
            setCarbs(+(selectedFood.carbs_per_100g * ratio).toFixed(1));
            setFat(+(selectedFood.fat_per_100g * ratio).toFixed(1));
        } else {
            setKcal(0); setProtein(0); setCarbs(0); setFat(0);
        }
    }, [quantity, unit, selectedFood, existingEntry]);

    // --- Handlers ---
    const handleSelectFood = (food) => {
        setSelectedFood(food);
        setName(food.name);
        setSearchTerm('');
        setSearchResults([]);
        setUnit(food.grams_per_piece ? 'pcs' : 'g');
        setQuantity(food.grams_per_piece ? 1 : 100);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentQuantity = Number(quantity);
        let finalGrams = 0;
        if (unit === 'g') finalGrams = currentQuantity;
        else if (unit === 'pcs' && selectedFood?.grams_per_piece) finalGrams = currentQuantity * selectedFood.grams_per_piece;
        else if (unit === 'pcs') finalGrams = currentQuantity; // Fallback if no g/pcs info

        onSave({
            id: existingEntry?.id,
            name,
            quantity: currentQuantity,
            unit,
            grams: +finalGrams.toFixed(3),
            kcal: +Number(kcal).toFixed(3),
            protein: +Number(protein).toFixed(3),
            carbs: +Number(carbs).toFixed(3),
            fat: +Number(fat).toFixed(3),
            meal: uiMeal, // Pass the selected meal back
            consumed_at: existingEntry?.consumed_at || new Date().toISOString().split('T')[0]
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-50 flex justify-center items-start pt-16">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{existingEntry ? 'Edit' : 'Log'} Food</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!existingEntry && (
                        <div className="relative">
                            {/* Icon Wrapper */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search nutrition catalog..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setSelectedFood(null); setName(e.target.value); }}
                                // Added padding-left to make space for the icon
                                className="w-full p-2 pl-10 border-gray-300 border rounded-md focus:ring-teal-500 focus:border-teal-500" // Added focus styles
                            />
                            {isLoading && <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">Searching...</div>}
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {searchResults.map(food => (<div key={food.id} onClick={() => handleSelectFood(food)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{food.name}</div>))}
                                </div>
                            )}
                        </div>
                    )}

                     {/* Rest of the form remains the same */}
                     <input type="text" name="name" placeholder="Food Name" value={name} onChange={(e) => { setName(e.target.value); if (selectedFood && e.target.value !== selectedFood.name) setSelectedFood(null); }} className="w-full p-2 border-gray-300 border rounded-md" required />

                    <div className="flex items-center space-x-2">
                        <input type="number" step="0.1" name="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md" required min="0" />
                        <select name="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="p-2 border-gray-300 border rounded-md bg-white">
                            <option value="g">g</option>
                            {(selectedFood?.grams_per_piece || !selectedFood || existingEntry?.unit === 'pcs') && <option value="pcs">pcs</option>}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" step="0.1" name="kcal" placeholder="Kcal" value={kcal} onChange={e => setKcal(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md bg-gray-50" required />
                        <input type="number" step="0.1" name="protein" placeholder="Protein (g)" value={protein} onChange={e => setProtein(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md bg-gray-50" />
                        <input type="number" step="0.1" name="carbs" placeholder="Carbs (g)" value={carbs} onChange={e => setCarbs(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md bg-gray-50" />
                        <input type="number" step="0.1" name="fat" placeholder="Fat (g)" value={fat} onChange={e => setFat(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md bg-gray-50" />
                    </div>

                     <div>
                        <label htmlFor="mealSelect" className="block text-sm font-medium text-gray-700">Meal</label>
                         <select id="mealSelect" name="meal" value={uiMeal} onChange={(e) => setUiMeal(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 border rounded-md bg-white">
                            {MEALS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                     </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 font-semibold">{existingEntry ? 'Update Entry' : 'Log Food'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogFoodModal;