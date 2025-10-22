import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { XIcon } from '../icons';
import { MEALS } // Assuming MEALS ('Breakfast', etc.) is defined here or imported
    from '../../../constant/categories'; // Adjust import if MEALS is elsewhere

// Debounce helper
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const LogFoodModal = ({ isOpen, onClose, onSave, /* meal, */ existingEntry }) => { // Removed meal prop as it's not in DB schema
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null); // From nutrition_catalog
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state - aligned with daily_consumption columns
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('g'); // 'g' or 'pcs'
    const [kcal, setKcal] = useState(0);
    const [protein, setProtein] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fat, setFat] = useState(0);
    // You might want to add a meal selector if needed for UI grouping, 
    // even if not stored in DB directly
    const [uiMeal, setUiMeal] = useState('Breakfast'); 

    // Reset/Pre-fill state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (existingEntry) {
                // Pre-fill form for editing
                setName(existingEntry.name);
                setQuantity(existingEntry.quantity);
                setUnit(existingEntry.unit); // Should be 'g' or 'pcs'
                setKcal(existingEntry.kcal);
                setProtein(existingEntry.protein);
                setCarbs(existingEntry.carbs);
                setFat(existingEntry.fat);
                // Assume editing means manual entry or pre-selected item
                setSelectedFood({ name: existingEntry.name }); 
                // Set the meal selector based on existing entry if available
                // setUiMeal(existingEntry.meal || 'Breakfast'); 
            } else {
                // Reset for adding new entry
                setSearchTerm('');
                setSearchResults([]);
                setSelectedFood(null);
                setName('');
                setQuantity(100); // Default to 100g or 1 pcs? Let's start with 100g
                setUnit('g');
                setKcal(0); setProtein(0); setCarbs(0); setFat(0);
                setUiMeal('Breakfast'); // Default meal for UI
            }
        }
    }, [isOpen, existingEntry]);

    // --- Search Logic ---
    const searchCatalog = async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);
        const { data, error } = await supabase
            .from('nutrition_catalog')
            .select('*')
            .ilike('name', `%${term}%`)
            .limit(10);
        
        if (error) {
            console.error('Error searching nutrition catalog:', error);
        } else {
            setSearchResults(data || []);
        }
        setIsLoading(false);
    };

    const debouncedSearch = useCallback(debounce(searchCatalog, 300), []);

    useEffect(() => {
        if (!existingEntry && searchTerm) { // Only search when adding new and term exists
            debouncedSearch(searchTerm);
        } else {
            setSearchResults([]); // Clear results otherwise
        }
    }, [searchTerm, debouncedSearch, existingEntry]);


    // --- Nutrition Calculation Logic ---
    useEffect(() => {
        // Only calculate if a catalog item is selected and we're *not* editing 
        // (allow manual values during edit)
        if (!selectedFood || !selectedFood.kcal_per_100g || existingEntry) {
            return;
        }

        let totalGrams = 0;
        const currentQuantity = Number(quantity);
        if (isNaN(currentQuantity)) return; // Don't calculate if quantity is invalid

        if (unit === 'g') {
            totalGrams = currentQuantity;
        } else if (unit === 'pcs' && selectedFood.grams_per_piece) {
            totalGrams = currentQuantity * selectedFood.grams_per_piece;
        } else if (unit === 'pcs') {
             // Handle case where unit is pcs but no grams_per_piece is defined
             // Maybe default to 100g equivalent or keep fields editable?
             // For now, let's reset calculation - user must input manually
             setKcal(0); setProtein(0); setCarbs(0); setFat(0);
             return;
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
        setName(food.name); // Pre-fill name
        setSearchTerm(''); // Clear search
        setSearchResults([]); // Hide results
        // Set unit based on catalog data
        setUnit(food.grams_per_piece ? 'pcs' : 'g');
        // Set quantity default (e.g., 1 piece or 100g)
        setQuantity(food.grams_per_piece ? 1 : 100); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentQuantity = Number(quantity);
        
        // Calculate final grams based on unit and selected food (if any)
        let finalGrams = 0;
        if (unit === 'g') {
             finalGrams = currentQuantity;
        } else if (unit === 'pcs' && selectedFood?.grams_per_piece) {
            finalGrams = currentQuantity * selectedFood.grams_per_piece;
        } else if (unit === 'pcs') {
            // If unit is 'pcs' but no grams_per_piece, store 0 or prompt user?
            // Storing 0 might be problematic for later analysis. Let's store quantity as grams for now.
             console.warn("Saving 'pcs' without grams_per_piece, storing quantity as grams.");
             finalGrams = currentQuantity; 
        }

        onSave({
            id: existingEntry?.id, // Pass id if editing
            name,
            quantity: currentQuantity,
            unit, // 'g' or 'pcs'
            grams: +finalGrams.toFixed(3), // Ensure grams reflects calculation
            kcal: +Number(kcal).toFixed(3),
            protein: +Number(protein).toFixed(3),
            carbs: +Number(carbs).toFixed(3),
            fat: +Number(fat).toFixed(3),
            // We pass the uiMeal back for potential UI grouping on the page
            // but it won't be saved to DB unless schema changes
            meal: uiMeal, 
            consumed_at: existingEntry?.consumed_at || new Date().toISOString().split('T')[0] // Keep original date if editing
        });
        onClose(); // Close modal after saving
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-50 flex justify-center items-start pt-16">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{existingEntry ? 'Edit' : 'Log'} Food for {uiMeal}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Search Input - Only show when adding new */}
                    {!existingEntry && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search nutrition catalog..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    // If user types, clear selected food to allow manual entry
                                    setSelectedFood(null); 
                                    setName(e.target.value); // Update name field as user types
                                }}
                                className="w-full p-2 border-gray-300 border rounded-md"
                            />
                            {isLoading && <div className="p-2 text-sm text-gray-500">Searching...</div>}
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {searchResults.map(food => (
                                        <div
                                            key={food.id}
                                            onClick={() => handleSelectFood(food)}
                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        >
                                            {food.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Name - Editable, pre-filled by search */}
                     <input 
                        type="text"
                        name="name"
                        placeholder="Food Name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            // If name is manually changed, deselect catalog item
                            if (selectedFood && e.target.value !== selectedFood.name) {
                                setSelectedFood(null);
                            }
                        }}
                        className="w-full p-2 border-gray-300 border rounded-md"
                        required
                    />

                    {/* Quantity and Unit */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            step="0.1" // Allow decimals
                            name="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full p-2 border-gray-300 border rounded-md"
                            required
                            min="0" // Prevent negative quantities
                        />
                        <select 
                            name="unit" 
                            value={unit} 
                            onChange={(e) => setUnit(e.target.value)}
                            className="p-2 border-gray-300 border rounded-md bg-white" // Ensure white background
                        >
                            <option value="g">g</option>
                            {/* Only show 'pcs' if catalog item supports it OR if manually entered/edited */}
                            {(selectedFood?.grams_per_piece || !selectedFood || existingEntry?.unit === 'pcs') && <option value="pcs">pcs</option>}
                        </select>
                    </div>

                    {/* Nutritional Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" step="0.1" name="kcal" placeholder="Kcal" value={kcal} onChange={e => setKcal(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md bg-gray-50" required />
                        <input type="number" step="0.1" name="protein" placeholder="Protein (g)" value={protein} onChange={e => setProtein(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md bg-gray-50" />
                        <input type="number" step="0.1" name="carbs" placeholder="Carbs (g)" value={carbs} onChange={e => setCarbs(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md bg-gray-50" />
                        <input type="number" step="0.1" name="fat" placeholder="Fat (g)" value={fat} onChange={e => setFat(e.target.value)} className="w-full p-2 border-gray-300 border rounded-md bg-gray-50" />
                    </div>

                     {/* Meal Selector (for UI grouping - not saved to DB) */}
                     <div>
                        <label htmlFor="mealSelect" className="block text-sm font-medium text-gray-700">Meal</label>
                         <select 
                            id="mealSelect"
                            name="meal" 
                            value={uiMeal} 
                            onChange={(e) => setUiMeal(e.target.value)}
                            className="mt-1 block w-full p-2 border-gray-300 border rounded-md bg-white"
                        >
                            {MEALS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                     </div>


                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 font-semibold">
                            {existingEntry ? 'Update Entry' : 'Log Food'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogFoodModal;