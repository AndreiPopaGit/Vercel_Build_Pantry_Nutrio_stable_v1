export const CATEGORIES = {
  "Carne": ["Pui", "Porc", "Carne de vită", "Curcan", "Cârnați", "Miel"],
  "Pește": ["Somon", "Ton", "Creveți"],
  "Lactate și ouă": ["Lapte", "Ouă", "Brânză", "Iaurt", "Unt", "Smântână"],
  "Fructe": ["Mere", "Banane", "Portocale", "Struguri", "Căpșuni"],
  "Legume": ["Cartofi", "Ceapă", "Roșii", "Castraveți", "Morcovi"],
  "Alimente de bază": ["Paste", "Orez", "Quinoa", "Ovăz", "Făină", "Cereale", "Zahăr", "Drojdie", "Bicarbonat de sodiu", "Siropuri"],
  "Uleiuri și oțeturi": ["Ulei de măsline", "Ulei vegetal", "Oțet balsamic", "Oțet de mere"],
  "Băuturi": ["Cafea", "Ceai", "Pudră de cacao"],
  "Articole de curățenie": ["Detergent", "Soluție de curățat universală", "Detergent de vase", "Bureți"],
  "Articole din hârtie și de unică folosință": ["Hârtie igienică", "Prosoape de hârtie", "Șervețele", "Saci de gunoi"],
  "Îngrijire personală": ["Săpun", "Șampon", "Pastă de dinți", "Deodorant"],
  "Articole de menaj": ["Baterii", "Becuri", "Pungi cu fermoar", "Folie", "Ambalaje"],
};

export const UNITS = ['grams', 'kg', 'liters', 'ml', 'units'];
export const LOCATIONS = ['Fridge', 'Freezer', 'Pantry'];
export const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const initialInventory = [
  { id: 1, name: 'Lapte', quantity: 1, unit: 'liters', expiryDate: getFutureDate(5), category: 'Lactate și ouă', subcategory: 'Lapte', location: 'Fridge' },
  { id: 2, name: 'Ouă', quantity: 12, unit: 'units', expiryDate: getFutureDate(10), category: 'Lactate și ouă', subcategory: 'Ouă', location: 'Fridge' },
  { id: 3, name: 'Piept de Pui', quantity: 500, unit: 'grams', expiryDate: getFutureDate(2), category: 'Carne', subcategory: 'Pui', location: 'Fridge' },
  { id: 4, name: 'Somon', quantity: 2, unit: 'units', expiryDate: getFutureDate(60), category: 'Pește', subcategory: 'Somon', location: 'Freezer' },
  { id: 5, name: 'Mazare congelata', quantity: 1, unit: 'kg', expiryDate: getFutureDate(180), category: 'Legume', subcategory: 'Mazare', location: 'Freezer' },
  { id: 6, name: 'Paste', quantity: 1, unit: 'kg', expiryDate: getFutureDate(365), category: 'Alimente de bază', subcategory: 'Paste', location: 'Pantry' },
  { id: 7, name: 'Roșii', quantity: 4, unit: 'units', expiryDate: getFutureDate(-1), category: 'Legume', subcategory: 'Roșii', location: 'Fridge' },
  { id: 8, name: 'Ulei de măsline', quantity: 750, unit: 'ml', expiryDate: getFutureDate(200), category: 'Uleiuri și oțeturi', subcategory: 'Ulei de măsline', location: 'Pantry' },
];

export const initialLogEntries = [
  { id: 1, inventoryItemId: 2, meal: 'Breakfast', name: 'Ouă', quantity: 2, unit: 'units', calories: 156, protein: 12, carbs: 1, fat: 10, date: new Date().toISOString().split('T')[0] },
  { id: 2, meal: 'Lunch', name: 'Salata rapida', quantity: 1, unit: 'units', calories: 350, protein: 20, carbs: 15, fat: 22, date: new Date().toISOString().split('T')[0] }
];
