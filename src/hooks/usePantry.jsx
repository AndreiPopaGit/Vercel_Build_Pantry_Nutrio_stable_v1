import { useState } from 'react';
import { initialInventory, initialLogEntries, MEALS } from '../constant/ConsumptionDummy';

/**
 * This hook manages all application state and data logic.
 * TO CONNECT SUPABASE:
 * 1. Replace `useState(initialInventory)` with a `useEffect` to fetch data from your Supabase table.
 * 2. In each `handle...` function, replace the state update logic (`setInventory(...)`) 
 * with the corresponding Supabase client call (e.g., `supabase.from('inventory').insert(...)`).
 */
export const usePantry = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [logEntries, setLogEntries] = useState(initialLogEntries);

  // --- Inventory CRUD ---
  const handleSaveItem = (itemData) => {
    if (itemData.id) { // Update
      // SUPABASE: Replace with supabase.from('inventory').update({...}).eq('id', itemData.id)
      setInventory(inventory.map(i => (i.id === itemData.id ? { ...i, ...itemData } : i)));
    } else { // Create
      // SUPABASE: Replace with supabase.from('inventory').insert([{...}])
      const newItem = { ...itemData, id: Date.now() };
      setInventory([...inventory, newItem]);
    }
  };

  const handleDeleteItem = (itemId) => {
    // SUPABASE: Replace with supabase.from('inventory').delete().eq('id', itemId)
    setInventory(current => current.filter(i => i.id !== itemId));
  };
  
  const handleMoveItem = (itemId, newLocation) => {
    // SUPABASE: Replace with supabase.from('inventory').update({ location: newLocation }).eq('id', itemId)
    setInventory(inventory.map(i => i.id === itemId ? { ...i, location: newLocation } : i));
  };

  // --- Daily Log CRUD ---
  const handleSaveLogEntry = (entry) => {
      // SUPABASE: Replace with supabase.from('log_entries').insert([{...}])
      setLogEntries(prev => [...prev, entry].sort((a,b) => MEALS.indexOf(a.meal) - MEALS.indexOf(b.meal)));
      
      if(entry.inventoryItemId) {
          // This part is tricky. You might want to do this in a Supabase Function (Edge Function)
          // to ensure the update is atomic (transactional).
          // For now, we update the state.
          setInventory(prevInventory => prevInventory.map(item => {
              if (item.id === entry.inventoryItemId) {
                  const newQuantity = Math.max(0, item.quantity - entry.quantity);
                  return { ...item, quantity: parseFloat(newQuantity.toFixed(2)) };
              }
              return item;
          }).filter(item => item.quantity > 0)); 
      }
  };

  const handleDeleteLogEntry = (entryId) => {
    // SUPABASE: Replace with supabase.from('log_entries').delete().eq('id', entryId)
    setLogEntries(current => current.filter(e => e.id !== entryId));
  };

  return {
    inventory,
    logEntries,
    handleSaveItem,
    handleDeleteItem,
    handleMoveItem,
    handleSaveLogEntry,
    handleDeleteLogEntry,
  };
};
