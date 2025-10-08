"use client";
import React, { useState } from 'react';
import { usePantry } from '../../hooks/usePantry';

import Header from '../../components/consumption/Header';
import InventoryPage from '../../components/consumption/InventoryPage';
import DailyLogPage from '../../components/consumption/DailyLogPage';
import ItemModal from '../../components/consumption/modals/Item';
import MoveItemModal from '../../components/consumption/modals/MoveItem';
import LogFromInventoryModal from '../../components/consumption/modals/LogFromInventory';
import ConfirmationModal from '../../components/consumption/modals/Confirmation';

export default function App() {
  const [page, setPage] = useState('inventory');
  
  // All data logic is now in the custom hook
  const pantry = usePantry();

  // State for managing modals
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);
  const [movingItem, setMovingItem] = useState(null);
  const [logItemModal, setLogItemModal] = useState({ isOpen: false, item: null, meal: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, message: '' });

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };
  const handleOpenMoveModal = (item) => {
    setMovingItem(item);
    setMoveModalOpen(true);
  };
  const handleOpenLogItemModal = (item, meal = null) => {
    setLogItemModal({ isOpen: true, item: item, meal: meal });
  };
  const handleOpenConfirmModal = (message, onConfirm) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };
  
  // CRUD handlers that also close modals
  const handleSaveItemAndClose = (itemData) => {
    pantry.handleSaveItem(itemData);
    setItemModalOpen(false);
    setEditingItem(null);
  };
  
  const handleMoveItemAndClose = (itemId, newLocation) => {
    pantry.handleMoveItem(itemId, newLocation);
    setMoveModalOpen(false);
    setMovingItem(null);
  }

  const handleSaveLogAndClose = (entry) => {
      pantry.handleSaveLogEntry(entry);
      setLogItemModal({isOpen: false, item: null, meal: null});
  }

  const handleDeleteItem = (itemId) => {
    handleOpenConfirmModal(
        'Are you sure you want to delete this item? This action cannot be undone.',
        () => {
            pantry.handleDeleteItem(itemId);
            setConfirmModal({ isOpen: false, onConfirm: null, message: '' });
        }
    );
  };
  
  const handleDeleteLogEntry = (entryId) => {
     handleOpenConfirmModal(
        'Are you sure you want to delete this log entry?',
        () => {
            pantry.handleDeleteLogEntry(entryId);
            setConfirmModal({ isOpen: false, onConfirm: null, message: '' });
        }
    );
  };


  return (
    <div className="bg-stone-50 min-h-screen font-sans">
      <Header page={page} setPage={setPage} />
      <main>
        {page === 'inventory' && (
          <InventoryPage 
            inventory={pantry.inventory} 
            onAdd={handleOpenAddModal}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteItem}
            onMove={handleOpenMoveModal}
            onLogItem={handleOpenLogItemModal}
          />
        )}
        {page === 'daily-log' && (
            <DailyLogPage 
                logEntries={pantry.logEntries}
                inventory={pantry.inventory}
                onSaveLogEntry={pantry.handleSaveLogEntry}
                onDeleteLogEntry={handleDeleteLogEntry}
                onLogFromInventory={handleOpenLogItemModal}
            />
        )}
      </main>

       {/* --- Modals --- */}
       <ItemModal isOpen={isItemModalOpen} onClose={() => setItemModalOpen(false)} onSave={handleSaveItemAndClose} item={editingItem}/>
       <MoveItemModal isOpen={isMoveModalOpen} onClose={() => setMoveModalOpen(false)} onMove={handleMoveItemAndClose} item={movingItem} />
       <LogFromInventoryModal 
            isOpen={logItemModal.isOpen}
            onClose={() => setLogItemModal({ isOpen: false, item: null, meal: null })}
            onSave={handleSaveLogAndClose}
            item={logItemModal.item}
            initialMeal={logItemModal.meal}
       />
       <ConfirmationModal 
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, onConfirm: null, message: '' })}
            onConfirm={confirmModal.onConfirm}
            message={confirmModal.message}
        />
    </div>
  );
}
