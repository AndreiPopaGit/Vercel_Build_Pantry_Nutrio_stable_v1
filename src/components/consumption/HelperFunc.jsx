// --- HELPER FUNCTIONS ---

export const getExpiryStatus = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'red', text: `Expired ${-diffDays} day(s) ago` };
  if (diffDays <= 3) return { status: 'yellow', text: `Expires in ${diffDays} day(s)` };
  return { status: 'green', text: `Expires on ${expiry.toLocaleDateString()}` };
};
