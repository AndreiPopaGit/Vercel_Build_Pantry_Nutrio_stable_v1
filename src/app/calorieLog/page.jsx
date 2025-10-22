"use client";
import React, { useState, useMemo } from 'react';
import { useCalorieLog } from '../../hooks/useCalorieLog'; // Use the new hook
import LogFoodModal from '../../components/dailyLogFood/modals/LogFood'; // Use the new modal
import { TrashIcon, EditIcon } from '../../components/dailyLogFood/icons'; // Use the new icons
import { MEALS } from '../../constant/categories'; // Import MEALS for grouping

// --- Reusable Components ---
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
        <div className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 bg-white border-2 border-gray-300 rounded-full" />
        <div className="ml-4">
            <h3 className="font-bold text-gray-800">{meal}</h3>
            <p className="text-sm text-gray-500 mb-3">{totalCalories.toFixed(0)} kcal</p>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.id} className="group flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                        <div>
                            <span className="text-gray-700 font-medium">{item.name}</span>
                            <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-600">{Number(item.kcal).toFixed(0)} kcal</span>
                            <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon /></button>
                            <button onClick={() => onDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-gray-400 text-sm">No items logged for this meal.</p>}
            </div>
        </div>
    </div>
);


export default function CalorieLog() {
    const { logEntries, loading, handleSaveLogEntry, handleDeleteLogEntry } = useCalorieLog();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [selectedMealForModal, setSelectedMealForModal] = useState('Breakfast'); // For opening modal

    const handleOpenModal = (meal) => {
        setEditingEntry(null);
        setSelectedMealForModal(meal);
        setModalOpen(true);
    };

    const handleEditEntry = (entry) => {
        setEditingEntry(entry);
        setSelectedMealForModal(entry.meal || 'Breakfast'); // Use entry's meal
        setModalOpen(true);
    };

    const handleSaveAndClose = (data) => {
        handleSaveLogEntry(data);
        setModalOpen(false);
        setEditingEntry(null);
    };

    // --- Calculations ---
    const dailyGoal = 2200; // Example goal

    const summary = useMemo(() => {
        if (!logEntries) return { consumed: 0, carbs: 0, protein: 0, fat: 0 };
        return logEntries.reduce((acc, entry) => {
            acc.consumed += Number(entry.kcal) || 0;
            acc.carbs += Number(entry.carbs) || 0;
            acc.protein += Number(entry.protein) || 0;
            acc.fat += Number(entry.fat) || 0;
            return acc;
        }, { consumed: 0, carbs: 0, protein: 0, fat: 0 });
    }, [logEntries]);

    // Group logs by meal using the MEALS constant
    const groupedLogs = useMemo(() => {
        const groups = {};
        MEALS.forEach(meal => groups[meal] = []); // Use MEALS from import
        if (logEntries) {
            logEntries.forEach(entry => {
                const mealKey = entry.meal || 'Snacks'; // Default if meal is null
                if (groups[mealKey]) {
                    groups[mealKey].push(entry);
                } else {
                     groups['Snacks'].push(entry); // Fallback
                }
            });
        }
        return groups;
    }, [logEntries]);

    if(loading) return <div className="p-8 text-center text-gray-500">Loading your log...</div>;

    return (
        <div className="bg-white h-full overflow-y-auto p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center mb-10">
                    <CalorieCircle consumed={summary.consumed} goal={dailyGoal} />
                    <p className="mt-4 text-lg text-gray-700">
                        You have <span className="font-bold text-teal-600">{(dailyGoal - summary.consumed).toFixed(0)} kcal</span> left.
                    </p>
                    <p className="text-sm text-gray-500">Goal: {dailyGoal} kcal</p>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-12">
                    <MacroBar label="Carbs" current={summary.carbs.toFixed(0)} goal={240} color="bg-blue-500" />
                    <MacroBar label="Protein" current={summary.protein.toFixed(0)} goal={150} color="bg-pink-500" />
                    <MacroBar label="Fat" current={summary.fat.toFixed(0)} goal={70} color="bg-yellow-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Log</h2>

                <div className="relative border-l-2 border-gray-200 pl-8 space-y-10">
                     {MEALS.map((meal) => ( // Iterate using MEALS constant
                        <MealLog
                            key={meal}
                            meal={meal}
                            items={groupedLogs[meal] || []}
                            totalCalories={(groupedLogs[meal] || []).reduce((sum, item) => sum + Number(item.kcal), 0)}
                            onEdit={handleEditEntry}
                            onDelete={handleDeleteLogEntry}
                        />
                     ))}
                </div>

                <div className="mt-12">
                    <button onClick={() => handleOpenModal('Breakfast')} className="w-full bg-teal-500 text-white font-bold py-4 px-4 rounded-xl hover:bg-teal-600 transition-colors">
                        Log Food
                    </button>
                </div>
            </div>

            <LogFoodModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveAndClose}
                meal={selectedMealForModal} // Pass meal context to modal
                existingEntry={editingEntry}
            />
        </div>
    );
}