import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const useCalorieLog = () => {
    const [logEntries, setLogEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogEntries = useCallback(async () => {
        setLoading(true); // Set loading true at the start of fetch
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log("No user logged in, cannot fetch log entries.");
            setLogEntries([]); // Clear entries if no user
            setLoading(false);
            return;
        };

        // Fetch entries for the logged-in user
        const { data, error } = await supabase
            .from('daily_consumption')
            .select('*')
            .eq('user_id', user.id)
            // Uncomment the next line to filter for today's date only
            // .eq('consumed_at', new Date().toISOString().split('T')[0])
            .order('created_at', { ascending: true }); // Order by creation time

        if (error) {
            console.error('Error fetching log entries:', error);
            setLogEntries([]);
        } else {
            setLogEntries(data || []); // Ensure it's an array even if data is null
        }
        setLoading(false); // Set loading false after fetch completes
    }, []);

    // Fetch data when the component mounts
    useEffect(() => {
        fetchLogEntries();
    }, [fetchLogEntries]);

    // CREATE or UPDATE a log entry
    const handleSaveLogEntry = async (logData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("No user logged in to save log entry.");
            return;
        }

        // Prepare the payload, ensure numeric values are numbers
        const payload = {
            item_id: logData.inventoryItemId || null, // Link to pantry item if applicable
            name: logData.name,
            quantity: Number(logData.quantity),
            unit: logData.unit, // 'pcs' or 'g'
            grams: Number(logData.grams),
            kcal: Number(logData.kcal),
            protein: Number(logData.protein) || 0, // Default to 0 if not provided
            fat: Number(logData.fat) || 0,
            carbs: Number(logData.carbs) || 0,
            consumed_at: logData.date || new Date().toISOString().split('T')[0], // Default to today
            user_id: user.id,
            // meal field is not in the db schema, remove it if submitting
            // meal: logData.meal 
        };
        // Remove meal property if it exists, as it's not in the DB schema
        delete payload.meal; 

        if (logData.id) {
            // --- UPDATE ---
            const { error } = await supabase
                .from('daily_consumption')
                .update(payload)
                .eq('id', logData.id);
            if (error) console.error('Error updating log entry:', error);
        } else {
            // --- CREATE ---
            const { error } = await supabase
                .from('daily_consumption')
                .insert([payload]);
            if (error) console.error('Error inserting log entry:', error);
        }
        await fetchLogEntries(); // Refresh the list
    };

    // DELETE a log entry
    const handleDeleteLogEntry = async (entryId) => {
        const { error } = await supabase
            .from('daily_consumption')
            .delete()
            .eq('id', entryId);

        if (error) {
            console.error('Error deleting log entry:', error);
        } else {
            // Optimistic UI update
            setLogEntries(current => current.filter(e => e.id !== entryId));
        }
    };

    return {
        logEntries,
        loading,
        fetchLogEntries, // Expose fetch function if needed for manual refresh
        handleSaveLogEntry,
        handleDeleteLogEntry,
    };
};