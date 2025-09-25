// Dynamic API base: env override else current host + :3001
const API_BASE = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`).replace(/\/$/, '');

async function request(path, opts = {}) {
  try {
    const res = await fetch(API_BASE + path, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts
    });
    if (!res.ok) {
      const text = await res.text().catch(()=> '');
      throw new Error(`HTTP ${res.status} ${text}`);
    }
    return res.json();
  } catch (err) {
    console.error('API request error', path, err);
    throw err;
  }
}

export function apiBase(){ return API_BASE; }

export async function health(){
  return request('/health', { method: 'GET' });
}

export async function login(busNumber, password) {
  return request('/driver/login', {
    method: 'POST',
    body: JSON.stringify({ busNumber, password })
  });
}

export async function startTrip(token, { direction }) {
  return request('/driver/trips/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ direction })
  });
}

export async function sendLocation(token, tripId, { lng, lat, speed, heading }) {
  return request(`/driver/trips/${tripId}/location`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ lng, lat, speed, heading })
  });
}

export async function endTrip(token, tripId) {
  return request(`/driver/trips/${tripId}/end`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
}
