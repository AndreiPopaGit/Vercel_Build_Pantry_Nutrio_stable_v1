import { useState, useEffect } from 'react';
// FIX: Updated the import path to match your project structure
import { supabase } from '../../lib/supabaseClient';

/**
 * This hook manages all application state and data logic,
 * including fetching from and writing to the Supabase database.
 */
export const usePantry = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logEntries, setLogEntries] = useState([]);

  // This function fetches data from your `pantry_items` table.
  const fetchInventory = async () => {
    // We don't set loading to true here, so the screen doesn't flicker on re-fetch
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .order('expires_at', { ascending: true });

    if (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    } else if (data) {
      const mappedData = data.map(item => ({
        ...item,
        // FIX: Format the full timestamp to "YYYY-MM-DD" for the date input field
        expiryDate: item.expires_at ? item.expires_at.split('T')[0] : '',
        location: item.storage ? item.storage.charAt(0).toUpperCase() + item.storage.slice(1) : '',
        subcategory: item.subtype
      }));
      setInventory(mappedData);
    }
    setLoading(false); // Only set loading to false after the initial fetch
  };

  // This useEffect runs once when the app loads to fetch the initial data.
  useEffect(() => {
    fetchInventory();
  }, []);

  // --- NEWLY IMPLEMENTED FUNCTION ---
  const handleSaveItem = async (itemData) => {
    // 1. Get the current user from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user logged in to save item.");
      // Optionally, show a message to the user
      return;
    }

    // FIX: Map UI-friendly unit names to database enum values
    const unitMap = {
      grams: 'g',
      kg: 'kg',
      liters: 'l',
      ml: 'ml',
      units: 'pcs',
    };
    const dbUnit = unitMap[itemData.unit] || itemData.unit; // Convert "grams" to "g", etc.


    // 2. Check if we are UPDATING an existing item or CREATING a new one
    if (itemData.id) {
      // --- UPDATE LOGIC ---
      const { error } = await supabase
        .from('pantry_items')
        .update({
          name: itemData.name,
          storage: itemData.location.toLowerCase(), // 'Fridge' -> 'fridge'
          category: itemData.category,
          subtype: itemData.subcategory,
          quantity: itemData.quantity,
          unit: dbUnit, // Use the mapped database unit
          expires_at: itemData.expiryDate,
        })
        .eq('id', itemData.id); // Find the row where the 'id' matches

      if (error) {
        console.error('Error updating item:', error);
      }
    } else {
      // --- CREATE (INSERT) LOGIC ---
      const { error } = await supabase
        .from('pantry_items')
        .insert([{
          // Map component state to database columns
          name: itemData.name,
          storage: itemData.location.toLowerCase(),
          category: itemData.category,
          subtype: itemData.subcategory,
          quantity: itemData.quantity,
          unit: dbUnit, // Use the mapped database unit
          expires_at: itemData.expiryDate,
          user_id: user.id // Assign the item to the currently logged-in user
        }]);

      if (error) {
        console.error('Error inserting item:', error);
      }
    }

    // 3. After saving, re-fetch the inventory to show the latest data
    await fetchInventory();
  };

  // --- Other functions are still placeholders ---
  const handleDeleteItem = async (itemId) => { console.log("Next step: Delete item", itemId); };
  const handleMoveItem = async (itemId, newLocation) => { console.log("Next step: Move item", itemId, newLocation); };
  const handleSaveLogEntry = async (entry) => { console.log("Next step: Save log", entry); };
  const handleDeleteLogEntry = async (entryId) => { console.log("Next step: Delete log", entryId); };

  return {
    inventory,
    logEntries,
    loading,
    handleSaveItem,
    handleDeleteItem,
    handleMoveItem,
    handleSaveLogEntry,
    handleDeleteLogEntry,
  };
};

