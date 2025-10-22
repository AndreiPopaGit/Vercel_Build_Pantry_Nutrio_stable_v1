import { useState, useEffect } from 'react';
// Assuming this is the correct path from your project structure
import { supabase } from '../../lib/supabaseClient';

/**
 * This hook manages all application state and data logic,
 * including full CRUD functionality for the Supabase database.
 */
export const usePantry = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logEntries, setLogEntries] = useState([]); // Kept for UI compatibility

  /**
   * READ: Fetches all items from the `pantry_items` table for the current user.
   */
  const fetchInventory = async () => {
    // We don't use setLoading here to prevent screen flicker on re-fetches
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .order('expires_at', { ascending: true });

    if (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    } else if (data) {
      // Map DB names to component prop names
      const mappedData = data.map(item => ({
        ...item,
        expiryDate: item.expires_at ? item.expires_at.split('T')[0] : '',
        location: item.storage ? item.storage.charAt(0).toUpperCase() + item.storage.slice(1) : '',
        subcategory: item.subtype,
         quantity: Number(item.quantity) || 0,
      }));
      setInventory(mappedData);
    }
     if (loading) setLoading(false);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * CREATE / UPDATE: Inserts or updates an item in the `pantry_items` table.
   */
  const handleSaveItem = async (itemData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user logged in to save item.");
      return;
    }

    // Map UI-friendly unit names to the database enum values ('g', 'pcs')
    const unitMap = {
      grams: 'g',
      units: 'pcs',
    };
    // Ensure itemData.unit exists and is a string before calling toLowerCase
    const dbUnit = itemData.unit ? unitMap[itemData.unit.toLowerCase()] || 'pcs' : 'pcs';

    // Prepare payload fields common to both insert and update
    const commonPayload = {
        name: itemData.name,
        storage: itemData.location.toLowerCase(), // 'Fridge' -> 'fridge'
        category: itemData.category,
        subtype: itemData.subcategory || null, // Ensure null if empty string or undefined
        quantity: Number(itemData.quantity),
        unit: dbUnit,
        expires_at: itemData.expiryDate || null, // Ensure null if empty string or undefined
    };


    let error;
    if (itemData.id) {
      // --- UPDATE LOGIC ---
      // FIX: Create a specific payload for update, excluding user_id and potentially id
      const updatePayload = { ...commonPayload }; 
      
      ({ error } = await supabase
        .from('pantry_items')
        .update(updatePayload) // Use the specific update payload
        .eq('id', itemData.id)); // Match the item by its ID

      if (error) console.error('Error updating item:', error?.message);

    } else {
      // --- CREATE (INSERT) LOGIC ---
       // Add user_id only for new items
      const insertPayload = {
          ...commonPayload,
          user_id: user.id 
      };
      
      ({ error } = await supabase
        .from('pantry_items')
        .insert([insertPayload])); // Use the specific insert payload

      if (error) console.error('Error inserting item:', error?.message);
    }

    if (!error) {
      await fetchInventory(); // Refresh list on success
    }
  };

  /**
   * DELETE: Performs a hard delete on an item from the database.
   */
  const handleDeleteItem = async (itemId) => {
    const { error } = await supabase
      .from('pantry_items')
      .delete() // Use .delete() for a hard delete
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
    } else {
      // Optimistic UI update for faster response
      setInventory(currentInventory => currentInventory.filter(item => item.id !== itemId));
    }
  };

  /**
   * UPDATE (Move): Updates the `storage` of an item.
   */
  const handleMoveItem = async (itemId, newLocation) => {
    const { error } = await supabase
      .from('pantry_items')
      .update({ storage: newLocation.toLowerCase() }) // 'Fridge' -> 'fridge'
      .eq('id', itemId);

    if (error) {
      console.error('Error moving item:', error);
    } else {
      await fetchInventory(); // Refresh the list
    }
  };

  return {
    inventory,
    loading,
    fetchInventory, // Expose fetch function if needed
    handleSaveItem,
    handleDeleteItem,
    handleMoveItem,
  };
};

// Note: Kept logEntries-related functions from previous hook, 
// assuming they might be used elsewhere or will be replaced by useCalorieLog hook usage.
// If not needed, they can be removed.
export const useCombinedPantryAndLog = () => {
    const pantry = usePantry(); // Assuming usePantry is defined as above
    const calorieLog = useCalorieLog(); // Assuming useCalorieLog hook exists

    return {
        ...pantry,
        ...calorieLog,
        // You might need combined loading state or specific combined functions here
    };
};