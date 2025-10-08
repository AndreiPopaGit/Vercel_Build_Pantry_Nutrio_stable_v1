import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm m-4 text-center">
                <p className="text-stone-800 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onClose} className="px-6 py-2 bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 font-semibold">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
