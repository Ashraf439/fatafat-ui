// src/api.js
const API_BASE = 'http://localhost:8080/api';

export async function fetchRestaurants() {
  const res = await fetch(`${API_BASE}/customer/restaurants`);
  if (!res.ok) throw new Error('Failed to load restaurants');
  return res.json();
}

export async function fetchRestaurantMenu(restaurantId) {
  const res = await fetch(`${API_BASE}/customer/restaurants/${restaurantId}/menu`);
  if (!res.ok) throw new Error('Failed to load menu');
  return res.json();
}