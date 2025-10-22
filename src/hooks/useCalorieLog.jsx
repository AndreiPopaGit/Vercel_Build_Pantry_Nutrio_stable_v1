import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Make sure this path is correct

export const useCalorieLog = () => {
    const [logEntries, setLogEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Helper to prepare data (avoids repetition) ---
    const preparePayload = (logData, userId) => {
        return {
            item_id: logData.inventoryItemId || null,
            name: logData.name,
            quantity: Number(logData.quantity) || 0,
            unit: logData.unit,
            grams: Number(logData.grams) || null,
            kcal: Number(logData.kcal) || 0,
            protein: Number(logData.protein) || 0,
            fat: Number(logData.fat) || 0,
            carbs: Number(logData.carbs) || 0,
            consumed_at: logData.consumed_at || new Date().toISOString().split('T')[0],
            user_id: userId,
            meal: logData.meal
        };
    };

    // --- Fetch (remains the same, added console logs before) ---
    const fetchLogEntries = useCallback(async () => {
        console.log("Fetching log entries...");
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("Error fetching user:", userError);
            setLogEntries([]);
            setLoading(false);
            return;
        }
        if (!user) {
            console.log("No user logged in, cannot fetch log entries.");
            setLogEntries([]);
            setLoading(false);
            return;
        }
        console.log("User found:", user.id);

        const { data, error } = await supabase
            .from('daily_consumption')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching log entries from Supabase:', error);
            setLogEntries([]);
        } else {
            console.log("Successfully fetched log entries:", data);
            setLogEntries(data || []);
        }
        setLoading(false);
        console.log("Fetching log entries complete.");
    }, []);

    useEffect(() => {
        fetchLogEntries();
    }, [fetchLogEntries]);

    // --- CREATE Function ---
    const handleCreateLogEntry = async (logData) => {
        console.log("handleCreateLogEntry called with:", logData);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error("User error or not logged in for create:", userError);
            return;
        }
        console.log("User confirmed for create:", user.id);

        const payload = preparePayload(logData, user.id);
        console.log("Prepared payload for INSERT:", payload);

        const { data: insertData, error } = await supabase
            .from('daily_consumption')
            .insert([payload]) // Insert requires an array
            .select();

        if (error) {
            console.error('Error inserting log entry into Supabase:', error);
        } else {
            console.log('Successfully inserted new log entry. Response data:', insertData);
            await fetchLogEntries(); // Refresh list on success
        }
    };

    // --- UPDATE Function ---
    const handleUpdateLogEntry = async (logData) => {
        console.log("handleUpdateLogEntry called with:", logData);
        if (!logData.id) {
            console.error("Cannot update entry: Missing ID.");
            return;
        }

        const entryIdToMatch = logData.id;
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("User error or not logged in for update:", userError);
            return;
        }
         console.log("User confirmed for update:", user.id);

        // Prepare payload, but exclude the 'id' field itself from the update data
        const { id, ...payloadForUpdate } = preparePayload(logData, user.id);
        // Note: payloadForUpdate now correctly contains user_id and meal
        console.log("Data intended for UPDATE (excluding id):", payloadForUpdate);

        const { data: updateData, error } = await supabase
            .from('daily_consumption')
            .update(payloadForUpdate)
            .eq('id', entryIdToMatch) // Match by the original id
            .select();

        if (error) {
            console.error(`Error updating log entry (id: ${entryIdToMatch}) in Supabase:`, error);
        } else {
            console.log(`Successfully updated log entry (id: ${entryIdToMatch}). Response data:`, updateData);
             // Even if select returns [], the update might have worked. Refresh to be sure.
            await fetchLogEntries(); // Refresh list on success
        }
    };


    // --- DELETE Function (remains the same) ---
    const handleDeleteLogEntry = async (entryId) => {
        console.log(`Attempting to DELETE entry with id: ${entryId}`);
        const { error } = await supabase
            .from('daily_consumption')
            .delete()
            .eq('id', entryId);

        if (error) {
            console.error('Error deleting log entry from Supabase:', error);
        } else {
            console.log(`Successfully deleted entry with id: ${entryId}`);
            setLogEntries(current => current.filter(e => e.id !== entryId));
        }
    };

    // --- Return the separate functions ---
    return {
        logEntries,
        loading,
        fetchLogEntries,
        handleCreateLogEntry, // New create function
        handleUpdateLogEntry, // New update function
        handleDeleteLogEntry,
    };
};