const API_URL = 'https://script.google.com/macros/s/AKfycbx2Kf59z6_RBGjkURpnbF1aOM0vt9CuF799qIjguqs-rFdUsBxMr0yQdmRihh-9hyE/exec';

export async function fetchAll() {
  const res = await fetch(`${API_URL}?action=getAll`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch');
  return data;
}

export async function addExpense(expense) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // Apps Script needs text/plain to avoid CORS preflight
    body: JSON.stringify({ action: 'addExpense', expense }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to add');
  return data;
}

export async function deleteExpense(id) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'deleteExpense', id }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to delete');
  return data;
}

export async function updateSetting(key, value) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateSetting', key, value }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to update');
  return data;
}
