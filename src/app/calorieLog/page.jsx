"use client";
import React, { useState, useMemo } from 'react';
import { useCalorieLog } from '../../hooks/useCalorieLog'; // Use the hook with separate functions
import LogFoodModal from '../../components/dailyLogFood/modals/LogFood'; // Use the modal
import { TrashIcon, EditIcon } from '../../components/dailyLogFood/icons'; // Use the icons
import { MEALS } from '../../constant/categories'; // Import MEALS for grouping

// --- Reusable Components (CalorieCircle, MacroBar, MealLog - remain the same) ---
const CalorieCircle = ({ consumed, goal }) => {
    const percentage = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
    const circumference = 2 * Math.PI * 55;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="55" cx="60" cy="60" />
                <circle
                    className="text-teal-500"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="55"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-gray-800">{consumed.toFixed(0)}</span>
                <span className="text-sm text-gray-500">Consumed</span>
            </div>
        </div>
    );
};

const MacroBar = ({ label, current, goal, color }) => {
    const percentage = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <span className="text-xs text-gray-500">{current}g / {goal}g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const MealLog = ({ meal, totalCalories, items, onEdit, onDelete }) => (
    <div className="relative pl-8">
        {/* Timeline Dot */}
        <div className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 bg-white border-2 border-gray-300 rounded-full -translate-x-1/2 mt-1" />
        <div className="ml-4"> {/* Adjust margin if dot is shifted */}
            <h3 className="font-bold text-gray-800">{meal}</h3>
            <p className="text-sm text-gray-500 mb-3">{totalCalories.toFixed(0)} kcal</p>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.id} className="group flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                        <div>
                            <span className="text-gray-700 font-medium">{item.name}</span>
                            {/* Display quantity and unit */}
                            <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             {/* Display calories */}
                            <span className="font-medium text-gray-600">{Number(item.kcal).toFixed(0)} kcal</span>
                             {/* Edit and Delete Buttons */}
                            <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon /></button>
                            <button onClick={() => onDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-gray-400 text-sm italic">No items logged for this meal yet.</p>}
                 {/* Consider adding a button here to directly add food to *this* meal */}
                 {/* <button onClick={() => onAddFoodToMeal(meal)} className="...">+ Add to {meal}</button> */}
            </div>
        </div>
    </div>
);
// --- CalorieLog Page Component ---
export default function CalorieLog() {
    // Destructure the separate create and update functions
    const {
        logEntries,
        loading,
        handleCreateLogEntry, // Use create
        handleUpdateLogEntry, // Use update
        handleDeleteLogEntry
    } = useCalorieLog();

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [selectedMealForModal, setSelectedMealForModal] = useState('Breakfast'); // Default meal for new entries

    // Opens the modal for adding a new entry
    const handleOpenModal = (meal) => {
        setEditingEntry(null); // Ensure we are not editing
        setSelectedMealForModal(meal || 'Breakfast'); // Set context for the modal
        setModalOpen(true);
    };

    // Opens the modal for editing an existing entry
    const handleEditEntry = (entry) => {
        setEditingEntry(entry); // Pass the entry to edit
        setSelectedMealForModal(entry.meal || 'Breakfast'); // Set modal context to entry's meal
        setModalOpen(true);
    };

    // Called when the modal's save button is clicked
    const handleSaveAndClose = (data) => {
        // Check if we were editing (editingEntry is not null)
        if (editingEntry && data.id) {
             console.log("Calling handleUpdateLogEntry from page with data:", data); // Log update call
             handleUpdateLogEntry(data); // Call the specific update function
        } else {
            console.log("Calling handleCreateLogEntry from page with data:", data); // Log create call
            // If it's a new entry, ensure the selected meal is passed
            const dataToCreate = { ...data, meal: selectedMealForModal };
            handleCreateLogEntry(dataToCreate);  // Call the specific create function
        }
        setModalOpen(false); // Close modal
        setEditingEntry(null); // Reset editing state
    };

    // --- Calculations ---
    const dailyGoal = 2200; // Example calorie goal

    // Calculate summary totals using useMemo for efficiency
    const summary = useMemo(() => {
        if (!logEntries) return { consumed: 0, carbs: 0, protein: 0, fat: 0 };
        // Ensure values are numbers before adding
        return logEntries.reduce((acc, entry) => {
            acc.consumed += Number(entry.kcal) || 0;
            acc.carbs += Number(entry.carbs) || 0;
            acc.protein += Number(entry.protein) || 0;
            acc.fat += Number(entry.fat) || 0;
            return acc;
        }, { consumed: 0, carbs: 0, protein: 0, fat: 0 });
    }, [logEntries]);

    // Group log entries by meal using MEALS constant
    const groupedLogs = useMemo(() => {
        const groups = {};
        MEALS.forEach(meal => { groups[meal] = []; }); // Initialize groups for all MEALS

        if (logEntries) {
            logEntries.forEach(entry => {
                const mealKey = entry.meal && MEALS.includes(entry.meal) ? entry.meal : 'Snacks'; // Default to 'Snacks' if meal is missing or invalid
                groups[mealKey].push(entry);
            });
        }
        return groups;
    }, [logEntries]); // Recalculate only when logEntries changes

    // --- Render ---
    if (loading) return <div className="p-8 text-center text-gray-500">Loading your calorie log...</div>;

    return (
        <div className="bg-white h-full overflow-y-auto p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* --- Summary Section --- */}
                <div className="flex flex-col items-center mb-10">
                    <CalorieCircle consumed={summary.consumed} goal={dailyGoal} />
                    <p className="mt-4 text-lg text-gray-700">
                        You have <span className="font-bold text-teal-600">{(dailyGoal - summary.consumed).toFixed(0)} kcal</span> left.
                    </p>
                    <p className="text-sm text-gray-500">Goal: {dailyGoal} kcal</p>
                </div>

                {/* --- Macro Bars --- */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                     {/* Pass calculated values and example goals */}
                    <MacroBar label="Carbs" current={summary.carbs.toFixed(0)} goal={275} color="bg-blue-500" />
                    <MacroBar label="Protein" current={summary.protein.toFixed(0)} goal={165} color="bg-pink-500" />
                    <MacroBar label="Fat" current={summary.fat.toFixed(0)} goal={73} color="bg-yellow-500" />
                </div>

                {/* --- Daily Log Section --- */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Log</h2>

                {/* Timeline structure */}
                <div className="relative border-l-2 border-gray-200 pl-4 space-y-10"> {/* Adjusted padding */}
                     {/* Iterate over MEALS to ensure consistent order */}
                     {MEALS.map((meal) => (
                        <MealLog
                            key={meal}
                            meal={meal}
                            items={groupedLogs[meal] || []} // Pass items for this meal
                             // Calculate total calories for this meal section
                            totalCalories={(groupedLogs[meal] || []).reduce((sum, item) => sum + Number(item.kcal || 0), 0)}
                            onEdit={handleEditEntry} // Pass edit handler
                            onDelete={handleDeleteLogEntry} // Pass delete handler
                            // onAddFoodToMeal={handleOpenModal} // Optional: Pass handler to add food directly to this meal
                        />
                     ))}
                </div>

                 {/* --- Log Food Button --- */}
                <div className="mt-12">
                     {/* Opens modal defaulting to Breakfast or the last selected meal */}
                    <button
                        onClick={() => handleOpenModal(selectedMealForModal)}
                        className="w-full bg-teal-500 text-white font-bold py-4 px-4 rounded-xl hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
                    >
                        Log New Food Entry
                    </button>
                </div>
            </div>

            {/* --- Log Food Modal --- */}
            <LogFoodModal
                isOpen={isModalOpen}
                onClose={() => { setModalOpen(false); setEditingEntry(null); }} // Ensure editing state is reset on close
                onSave={handleSaveAndClose} // Connects to the combined save logic
                meal={selectedMealForModal} // Pass the meal context (for new entries or editing)
                existingEntry={editingEntry} // Pass the entry being edited, or null for new
            />
        </div>
    );
}