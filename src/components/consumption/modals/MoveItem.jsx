import React from 'react';

const MoveItemModal = ({ isOpen, onClose, onMove, item }) => {
    if (!isOpen || !item || !['Fridge', 'Freezer'].includes(item.location)) return null;
    const destination = item.location === 'Fridge' ? 'Freezer' : 'Fridge';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-16">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs m-4">
                 <h3 className="text-lg font-medium mb-4 text-stone-800">Move "{item.name}" to:</h3>
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={() => { onMove(item.id, destination); }}
                        className="w-full px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 font-semibold"
                    >
                        {destination}
                    </button>
                </div>
                <button onClick={onClose} className="mt-4 w-full px-4 py-2 bg-stone-200 text-stone-800 rounded hover:bg-stone-300 font-semibold">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default MoveItemModal;
