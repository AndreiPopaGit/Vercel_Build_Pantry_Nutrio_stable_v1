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
      }));
      setInventory(mappedData);
    }
    setLoading(false);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchInventory();
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
    const dbUnit = unitMap[itemData.unit] || itemData.unit;

    const payload = {
      name: itemData.name,
      storage: itemData.location.toLowerCase(),
      category: itemData.category,
      subtype: itemData.subcategory,
      quantity: itemData.quantity,
      unit: dbUnit,
      expires_at: itemData.expiryDate,
      user_id: user.id,
    };

    if (itemData.id) {
      const { error } = await supabase.from('pantry_items').update(payload).eq('id', itemData.id);
      if (error) console.error('Error updating item:', error);
    } else {
      const { error } = await supabase.from('pantry_items').insert([payload]);
      if (error) console.error('Error inserting item:', error);
    }
    await fetchInventory();
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
      // Optimistic UI update for faster response, then re-fetch
      setInventory(currentInventory => currentInventory.filter(item => item.id !== itemId));
      await fetchInventory(); 
    }
  };

  /**
   * UPDATE (Move): Updates the `storage` of an item.
   */
  const handleMoveItem = async (itemId, newLocation) => {
    const { error } = await supabase
      .from('pantry_items')
      .update({ storage: newLocation.toLowerCase() })
      .eq('id', itemId);

    if (error) {
      console.error('Error moving item:', error);
    } else {
      await fetchInventory();
    }
  };

  // --- Daily Log functions are placeholders for the next step ---
  const handleSaveLogEntry = async (entry) => { console.log("Next step: Save daily log entry", entry); };
  const handleDeleteLogEntry = async (entryId) => { console.log("Next step: Delete daily log entry", entryId); };

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

