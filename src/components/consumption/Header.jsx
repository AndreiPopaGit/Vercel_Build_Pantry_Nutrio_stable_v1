import React from 'react';

const Header = ({ page, setPage }) => (
  <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-stone-200">
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-amber-900">PantryPal</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage('inventory')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${page === 'inventory' ? 'bg-amber-100 text-amber-800' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            Inventory
          </button>
          <button
            onClick={() => setPage('daily-log')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${page === 'daily-log' ? 'bg-amber-100 text-amber-800' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            Daily Log
          </button>
        </div>
      </div>
    </nav>
  </header>
);

export default Header;
