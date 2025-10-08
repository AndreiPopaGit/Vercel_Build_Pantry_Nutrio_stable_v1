import React, { useState, useMemo } from 'react';
import SummaryCard from '../../components/consumption/SummaryCard';
import MealSection from '../../components/consumption/MealSection';
import AddFoodModal from '../../components/consumption/modals/AddFood';
import { MEALS } from '../../constant/ConsumptionDummy';

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

export default DailyLogPage;
