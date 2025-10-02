"use client";
import React, { useState, useMemo, useEffect } from 'react';

// --- CONSTANTS & DUMMY DATA ---

const CATEGORIES = {
  "Carne": ["Pui", "Porc", "Carne de vită", "Curcan", "Cârnați", "Miel"],
  "Pește": ["Somon", "Ton", "Creveți"],
  "Lactate și ouă": ["Lapte", "Ouă", "Brânză", "Iaurt", "Unt", "Smântână"],
  "Fructe": ["Mere", "Banane", "Portocale", "Struguri", "Căpșuni"],
  "Legume": ["Cartofi", "Ceapă", "Roșii", "Castraveți", "Morcovi"],
  "Alimente de bază": ["Paste", "Orez", "Quinoa", "Ovăz", "Făină", "Cereale", "Zahăr", "Drojdie", "Bicarbonat de sodiu", "Siropuri"],
  "Uleiuri și oțeturi": ["Ulei de măsline", "Ulei vegetal", "Oțet balsamic", "Oțet de mere"],
  "Băuturi": ["Cafea", "Ceai", "Pudră de cacao"],
  "Articole de curățenie": ["Detergent", "Soluție de curățat universală", "Detergent de vase", "Bureți"],
  "Articole din hârtie și de unică folosință": ["Hârtie igienică", "Prosoape de hârtie", "Șervețele", "Saci de gunoi"],
  "Îngrijire personală": ["Săpun", "Șampon", "Pastă de dinți", "Deodorant"],
  "Articole de menaj": ["Baterii", "Becuri", "Pungi cu fermoar", "Folie", "Ambalaje"],
};

const UNITS = ['grams', 'kg', 'liters', 'ml', 'units'];
const LOCATIONS = ['Fridge', 'Freezer', 'Pantry'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const initialInventory = [
  { id: 1, name: 'Lapte', quantity: 1, unit: 'liters', expiryDate: getFutureDate(5), category: 'Lactate și ouă', subcategory: 'Lapte', location: 'Fridge' },
  { id: 2, name: 'Ouă', quantity: 12, unit: 'units', expiryDate: getFutureDate(10), category: 'Lactate și ouă', subcategory: 'Ouă', location: 'Fridge' },
  { id: 3, name: 'Piept de Pui', quantity: 500, unit: 'grams', expiryDate: getFutureDate(2), category: 'Carne', subcategory: 'Pui', location: 'Fridge' },
  { id: 4, name: 'Somon', quantity: 2, unit: 'units', expiryDate: getFutureDate(60), category: 'Pește', subcategory: 'Somon', location: 'Freezer' },
  { id: 5, name: 'Mazare congelata', quantity: 1, unit: 'kg', expiryDate: getFutureDate(180), category: 'Legume', subcategory: 'Mazare', location: 'Freezer' },
  { id: 6, name: 'Paste', quantity: 1, unit: 'kg', expiryDate: getFutureDate(365), category: 'Alimente de bază', subcategory: 'Paste', location: 'Pantry' },
  { id: 7, name: 'Roșii', quantity: 4, unit: 'units', expiryDate: getFutureDate(-1), category: 'Legume', subcategory: 'Roșii', location: 'Fridge' },
  { id: 8, name: 'Ulei de măsline', quantity: 750, unit: 'ml', expiryDate: getFutureDate(200), category: 'Uleiuri și oțeturi', subcategory: 'Ulei de măsline', location: 'Pantry' },
];

const initialLogEntries = [
  { id: 1, inventoryItemId: 2, meal: 'Breakfast', name: 'Ouă', quantity: 2, unit: 'units', calories: 156, protein: 12, carbs: 1, fat: 10, date: new Date().toISOString().split('T')[0] },
  { id: 2, meal: 'Lunch', name: 'Salata rapida', quantity: 1, unit: 'units', calories: 350, protein: 20, carbs: 15, fat: 22, date: new Date().toISOString().split('T')[0] }
];

// --- HELPER FUNCTIONS ---

const getExpiryStatus = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'red', text: `Expired ${-diffDays} day(s) ago` };
  if (diffDays <= 3) return { status: 'yellow', text: `Expires in ${diffDays} day(s)` };
  return { status: 'green', text: `Expires on ${expiry.toLocaleDateString()}` };
};


// --- SVG ICONS ---

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);
const MoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
);
const ChevronDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- COMPONENTS ---

const Header = ({ page, setPage }) => (
  <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-stone-200">
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-amber-900">PantryPal</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage('inventory')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${page === 'inventory' ? 'bg-amber-100 text-amber-800' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            Inventory
          </button>
          <button
            onClick={() => setPage('daily-log')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${page === 'daily-log' ? 'bg-amber-100 text-amber-800' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            Daily Log
          </button>
        </div>
      </div>
    </nav>
  </header>
);

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

const LocationColumn = ({ title, items, ...props }) => (
  <div className="bg-stone-50/50 rounded-lg p-4 h-full border border-stone-200">
    <h2 className="text-xl font-bold mb-4 text-amber-900 border-b-2 border-amber-200 pb-2">{title}</h2>
    <div className="overflow-y-auto h-[calc(100vh-230px)] pr-2">
      {items.length > 0 ? items.map(item => <ItemCard key={item.id} item={item} {...props} />) : <p className="text-stone-500 text-center mt-4">Nothing here!</p>}
    </div>
  </div>
);

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

const ItemModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({});
    const [subcategories, setSubcategories] = useState([]);

    useEffect(() => {
        const initialData = item || {
            name: '', quantity: '', unit: UNITS[0], expiryDate: '', category: Object.keys(CATEGORIES)[0], subcategory: '', location: LOCATIONS[0]
        };
        setFormData(initialData);

        if (initialData.category) {
            setSubcategories(CATEGORIES[initialData.category] || []);
        } else {
             setSubcategories(CATEGORIES[Object.keys(CATEGORIES)[0]] || []);
        }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-16">
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
                        <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} className="w-full p-2 border-stone-300 border rounded mt-1" required />
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

const MoveItemModal = ({ isOpen, onClose, onMove, item }) => {
    if (!isOpen || !item || !['Fridge', 'Freezer'].includes(item.location)) return null;
    const destination = item.location === 'Fridge' ? 'Freezer' : 'Fridge';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-16">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs m-4">
                 <h3 className="text-lg font-medium mb-4 text-stone-800">Move "{item.name}" to:</h3>
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={() => { onMove(item.id, destination); onClose(); }}
                        className="w-full px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 font-semibold"
                    >
                        {destination}
                    </button>
                </div>
                <button onClick={onClose} className="mt-4 w-full px-4 py-2 bg-stone-200 text-stone-800 rounded hover:bg-stone-300 font-semibold">
                    Cancel
                </button>
            </div>
        </div>
    );
};

const DailyLogPage = ({ logEntries, inventory, onSaveLogEntry, onDeleteLogEntry, onLogFromInventory }) => {
    const [isFoodModalOpen, setFoodModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);

    const summary = useMemo(() => {
        return logEntries.reduce((acc, entry) => {
            acc.calories += entry.calories;
            acc.protein += entry.protein;
            acc.carbs += entry.carbs;
            acc.fat += entry.fat;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [logEntries]);

    const handleAddFood = (meal) => {
        setSelectedMeal(meal);
        setFoodModalOpen(true);
    }
    
    const handleSaveAndClose = (entry) => {
        onSaveLogEntry(entry);
        setFoodModalOpen(false);
        setSelectedMeal(null);
    }

    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <SummaryCard title="Total Calories" value={summary.calories.toFixed(0)} color="bg-blue-100 text-blue-800" />
                <SummaryCard title="Protein" value={`${summary.protein.toFixed(1)}g`} color="bg-rose-100 text-rose-800" />
                <SummaryCard title="Carbs" value={`${summary.carbs.toFixed(1)}g`} color="bg-amber-100 text-amber-800" />
                <SummaryCard title="Fat" value={`${summary.fat.toFixed(1)}g`} color="bg-lime-100 text-lime-800" />
            </div>
            <div className="space-y-6">
                {MEALS.map(meal => (
                    <MealSection 
                        key={meal} 
                        title={meal}
                        entries={logEntries.filter(e => e.meal === meal)}
                        onAddFood={() => handleAddFood(meal)}
                        onDeleteLogEntry={onDeleteLogEntry}
                    />
                ))}
            </div>
            <AddFoodModal 
                isOpen={isFoodModalOpen} 
                onClose={() => setFoodModalOpen(false)}
                onSave={handleSaveAndClose}
                inventory={inventory}
                meal={selectedMeal}
                onLogFromInventory={onLogFromInventory}
            />
        </div>
    );
}

const SummaryCard = ({ title, value, color }) => (
    <div className={`p-4 rounded-lg shadow-sm border ${color}`}>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
);

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

const LogFromInventoryModal = ({ isOpen, onClose, onSave, item, initialMeal }) => {
    const [logData, setLogData] = useState({ meal: initialMeal || MEALS[0], quantity: '', calories: '', protein: '', carbs: '', fat: '' });

    useEffect(() => {
        if (item) {
            setLogData({ meal: initialMeal || MEALS[0], quantity: '', calories: '', protein: '', carbs: '', fat: '' });
        }
    }, [item, initialMeal]);
    
    const handleChange = (e) => setLogData({ ...logData, [e.target.name]: e.target.value });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const consumed = parseFloat(logData.quantity);
        if (isNaN(consumed) || consumed <= 0 || consumed > item.quantity) {
            // Replaced alert with a more user-friendly mechanism if possible
            console.error(`Please enter a valid quantity between 0 and ${item.quantity}.`);
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
        onClose();
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

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm m-4 text-center">
                <p className="text-stone-800 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onClose} className="px-6 py-2 bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 font-semibold">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [page, setPage] = useState('inventory');
  const [inventory, setInventory] = useState(initialInventory);
  const [logEntries, setLogEntries] = useState(initialLogEntries);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);
  const [movingItem, setMovingItem] = useState(null);
  const [logItemModal, setLogItemModal] = useState({ isOpen: false, item: null, meal: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, message: '' });


  // --- Inventory CRUD ---
  const handleSaveItem = (itemData) => {
    if (itemData.id) { // Update
      setInventory(inventory.map(i => (i.id === itemData.id ? { ...i, ...itemData } : i)));
    } else { // Create
      const newItem = { ...itemData, id: Date.now() };
      setInventory([...inventory, newItem]);
    }
    setItemModalOpen(false);
    setEditingItem(null);
  };
  
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleDeleteItem = (itemId) => {
    setConfirmModal({
        isOpen: true,
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        onConfirm: () => {
            setInventory(current => current.filter(i => i.id !== itemId));
            setConfirmModal({ isOpen: false, onConfirm: null, message: '' });
        }
    });
  };
  
  const handleOpenMoveModal = (item) => {
    setMovingItem(item);
    setMoveModalOpen(true);
  };
  
  const handleMoveItem = (itemId, newLocation) => {
    setInventory(inventory.map(i => i.id === itemId ? { ...i, location: newLocation } : i));
    setMoveModalOpen(false);
    setMovingItem(null);
  };

  const handleOpenLogItemModal = (item, meal = null) => {
    setLogItemModal({ isOpen: true, item: item, meal: meal });
  }

  // --- Daily Log CRUD ---
  const handleSaveLogEntry = (entry) => {
      setLogEntries(prev => [...prev, entry].sort((a,b) => MEALS.indexOf(a.meal) - MEALS.indexOf(b.meal)));
      if(entry.inventoryItemId) {
          setInventory(prevInventory => prevInventory.map(item => {
              if (item.id === entry.inventoryItemId) {
                  const newQuantity = Math.max(0, item.quantity - entry.quantity);
                  return { ...item, quantity: parseFloat(newQuantity.toFixed(2)) };
              }
              return item;
          }).filter(item => item.quantity > 0)); // Also remove item if quantity is 0
      }
  };

  const handleDeleteLogEntry = (entryId) => {
    setConfirmModal({
        isOpen: true,
        message: 'Are you sure you want to delete this log entry?',
        onConfirm: () => {
            setLogEntries(current => current.filter(e => e.id !== entryId));
            setConfirmModal({ isOpen: false, onConfirm: null, message: '' });
        }
    });
  };

  return (
    <div className="bg-stone-50 min-h-screen font-sans">
      <Header page={page} setPage={setPage} />
      <main>
        {page === 'inventory' && (
          <InventoryPage 
            inventory={inventory} 
            onAdd={handleOpenAddModal}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteItem}
            onMove={handleOpenMoveModal}
            onLogItem={handleOpenLogItemModal}
          />
        )}
        {page === 'daily-log' && (
            <DailyLogPage 
                logEntries={logEntries}
                inventory={inventory}
                onSaveLogEntry={handleSaveLogEntry}
                onDeleteLogEntry={handleDeleteLogEntry}
                onLogFromInventory={handleOpenLogItemModal}
            />
        )}
      </main>

       <ItemModal isOpen={isItemModalOpen} onClose={() => setItemModalOpen(false)} onSave={handleSaveItem} item={editingItem}/>
       <MoveItemModal isOpen={isMoveModalOpen} onClose={() => setMoveModalOpen(false)} onMove={handleMoveItem} item={movingItem} />
       <LogFromInventoryModal 
            isOpen={logItemModal.isOpen}
            onClose={() => setLogItemModal({ isOpen: false, item: null, meal: null })}
            onSave={handleSaveLogEntry}
            item={logItemModal.item}
            initialMeal={logItemModal.meal}
       />
       <ConfirmationModal 
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, onConfirm: null, message: '' })}
            onConfirm={confirmModal.onConfirm}
            message={confirmModal.message}
        />
    </div>
  );
}

