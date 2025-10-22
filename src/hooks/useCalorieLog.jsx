import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const useCalorieLog = () => {
    const [logEntries, setLogEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogEntries = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log("No user logged in, cannot fetch log entries.");
            setLogEntries([]);
            setLoading(false);
            return;
        };

        const { data, error } = await supabase
            .from('daily_consumption')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching log entries:', error);
            setLogEntries([]);
        } else {
            setLogEntries(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchLogEntries();
    }, [fetchLogEntries]);

    const handleSaveLogEntry = async (logData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("No user logged in to save log entry.");
            return;
        }

        // Prepare the complete payload for the database
        const payload = {
            item_id: logData.inventoryItemId || null,
            name: logData.name,
            quantity: Number(logData.quantity),
            unit: logData.unit,
            grams: Number(logData.grams),
            kcal: Number(logData.kcal),
            protein: Number(logData.protein) || 0,
            fat: Number(logData.fat) || 0,
            carbs: Number(logData.carbs) || 0,
            consumed_at: logData.consumed_at || new Date().toISOString().split('T')[0],
            user_id: user.id,
            meal: logData.meal // Ensure meal is included
        };

        // Separate id for matching, keep the rest for the update/insert data
        const { id, ...dataToSave } = payload;

        if (logData.id) {
            // --- UPDATE ---
            // FIX: Use the 'dataToSave' object which *includes* the meal field
            const { error } = await supabase
                .from('daily_consumption')
                .update(dataToSave)
                .eq('id', logData.id); // Match by the original id
            if (error) console.error('Error updating log entry:', error);
        } else {
            // --- CREATE ---
            // Insert the full payload (which includes meal)
            const { error } = await supabase
                .from('daily_consumption')
                .insert([payload]);
            if (error) console.error('Error inserting log entry:', error);
        }
        await fetchLogEntries(); // Refresh the list
    };

    const handleDeleteLogEntry = async (entryId) => {
        const { error } = await supabase
            .from('daily_consumption')
            .delete()
            .eq('id', entryId);

        if (error) {
            console.error('Error deleting log entry:', error);
        } else {
            setLogEntries(current => current.filter(e => e.id !== entryId));
        }
    };

    return {
        logEntries,
        loading,
        fetchLogEntries,
        handleSaveLogEntry,
        handleDeleteLogEntry,
    };
};