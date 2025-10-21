"use client";
import React from 'react';

// --- Reusable Components (Normally in separate files) ---

// Circular progress component for the main calorie counter
const CalorieCircle = ({ consumed, goal }) => {
    const percentage = Math.min(100, (consumed / goal) * 100);
    const circumference = 2 * Math.PI * 55; // (radius of 55)
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="55"
                    cx="60"
                    cy="60"
                />
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
                <span className="text-3xl font-bold text-gray-800">{consumed}</span>
                <span className="text-sm text-gray-500">Consumed</span>
            </div>
        </div>
    );
};

// Progress bar for individual macros
const MacroBar = ({ label, current, goal, color }) => {
    const percentage = Math.min(100, (current / goal) * 100);
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

// Component for a single meal section (e.g., Breakfast)
const MealLog = ({ meal, totalCalories, items }) => (
    <div className="relative pl-8">
        <div className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 bg-white border-2 border-gray-300 rounded-full">
            {/* This empty div creates the circle on the timeline */}
        </div>
        <div className="ml-4">
            <h3 className="font-bold text-gray-800">{meal}</h3>
            <p className="text-sm text-gray-500 mb-3">{totalCalories} kcal</p>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium text-gray-600">{item.kcal} kcal</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


// --- Main Page Component ---

export default function CalorieLog() {
    // --- Dummy Data (Replace with data from your database later) ---
    const dailyGoal = 2200;
    const consumed = 1560;
    
    const macros = {
        carbs: { current: 180, goal: 240 },
        protein: { current: 128, goal: 150 },
        fat: { current: 42, goal: 70 },
    };

    const logData = [
        { 
            meal: 'Breakfast', 
            totalCalories: 450, 
            items: [
                { name: 'Oatmeal with Berries', kcal: 300 },
                { name: 'Black Coffee', kcal: 5 },
                { name: 'Scrambled Eggs (2)', kcal: 145 },
            ] 
        },
        { 
            meal: 'Lunch', 
            totalCalories: 650, 
            items: [
                { name: 'Grilled Chicken Salad', kcal: 450 },
                { name: 'Apple', kcal: 95 },
                { name: 'Iced Tea', kcal: 5 },
            ] 
        },
         { 
            meal: 'Dinner', 
            totalCalories: 460, 
            items: [
                { name: 'Salmon with Asparagus', kcal: 380 },
                { name: 'Brown Rice (1/2 cup)', kcal: 80 },
            ] 
        },
    ];

    return (
        <div className="bg-white h-full overflow-y-auto p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* --- Top Summary Section --- */}
                <div className="flex flex-col items-center mb-10">
                    <CalorieCircle consumed={consumed} goal={dailyGoal} />
                    <p className="mt-4 text-lg text-gray-700">
                        You have <span className="font-bold text-teal-600">{dailyGoal - consumed} kcal</span> left.
                    </p>
                    <p className="text-sm text-gray-500">Goal: {dailyGoal} kcal</p>
                </div>

                {/* --- Macro Bars --- */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <MacroBar label="Carbs" current={macros.carbs.current} goal={macros.carbs.goal} color="bg-blue-500" />
                    <MacroBar label="Protein" current={macros.protein.current} goal={macros.protein.goal} color="bg-pink-500" />
                    <MacroBar label="Fat" current={macros.fat.current} goal={macros.fat.goal} color="bg-yellow-500" />
                </div>

                {/* --- Today's Log Section --- */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Log</h2>

                <div className="relative border-l-2 border-gray-200 pl-8 space-y-10">
                     {logData.map((mealData) => (
                        <MealLog key={mealData.meal} {...mealData} />
                     ))}
                </div>

                {/* --- Log Food Button --- */}
                <div className="mt-12">
                    <button className="w-full bg-teal-500 text-white font-bold py-4 px-4 rounded-xl hover:bg-teal-600 transition-colors">
                        Log Food
                    </button>
                </div>
            </div>
        </div>
    );
}

