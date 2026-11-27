/**
 * Hospital Navigation System - Frontend API Client
 * Connects to FastAPI backend
 */

const BASE_URL = '/api';

export async function fetchFloors() {
  const res = await fetch(`${BASE_URL}/floors`);
  if (!res.ok) throw new Error('Failed to fetch floors');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchLocations(params = {}) {
  const query = new URLSearchParams();
  if (params.floor !== undefined && params.floor !== null) query.append('floor', params.floor);
  if (params.category_id) query.append('category_id', params.category_id);
  if (params.search) query.append('search', params.search);
  if (params.is_emergency !== undefined) query.append('is_emergency', params.is_emergency);

  const url = `${BASE_URL}/locations${query.toString() ? '?' + query.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch locations');
  return res.json();
}

export async function fetchLocationDetail(locationId) {
  const res = await fetch(`${BASE_URL}/locations/${locationId}`);
  if (!res.ok) throw new Error(`Failed to fetch location ${locationId}`);
  return res.json();
}

export async function fetchGraph(floor = null) {
  const query = floor !== null ? `?floor=${floor}` : '';
  const res = await fetch(`${BASE_URL}/graph${query}`);
  if (!res.ok) throw new Error('Failed to fetch graph');
  return res.json();
}

export async function fetchFacilitiesSummary() {
  const res = await fetch(`${BASE_URL}/facilities/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchDoctors(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${BASE_URL}/doctors${query}`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function calculateRoute({ sourceId, targetId, algorithm = 'astar', accessibleOnly = false }) {
  const res = await fetch(`${BASE_URL}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_id: sourceId,
      target_id: targetId,
      algorithm,
      accessible_only: accessibleOnly
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to calculate route');
  }
  return res.json();
}

export async function compareAlgorithms({ sourceId, targetId, accessibleOnly = false }) {
  const res = await fetch(`${BASE_URL}/route/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_id: sourceId,
      target_id: targetId,
      algorithm: 'astar',
      accessible_only: accessibleOnly
    })
  });
  if (!res.ok) throw new Error('Failed to compare algorithms');
  return res.json();
}

export async function fetchNearestEmergency({ currentLocationId, targetType = 'exit', accessibleOnly = false }) {
  const query = new URLSearchParams({
    current_location_id: currentLocationId,
    target_type: targetType,
    accessible_only: accessibleOnly
  });
  const res = await fetch(`${BASE_URL}/route/emergency/nearest?${query.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to find emergency route');
  }
  return res.json();
}

export async function fetchQRCheckpoints() {
  const res = await fetch(`${BASE_URL}/qr/checkpoints`);
  if (!res.ok) throw new Error('Failed to fetch QR checkpoints');
  return res.json();
}

export async function scanQRCode(code) {
  const res = await fetch(`${BASE_URL}/qr/scan/${encodeURIComponent(code)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Invalid QR code ${code}`);
  }
  return res.json();
}

export async function checkBackendHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Backend unhealthy');
  return res.json();
}

