const API_BASE_URL = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function fetchPatients() {
  const res = await fetch(`${API_BASE_URL}/patients`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function fetchPatientById(patientId) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}`);
  if (!res.ok) throw new Error(`Patient #${patientId} not found`);
  return res.json();
}

export async function createPatient(patientData) {
  const res = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create patient profile');
  }
  return res.json();
}

export async function updatePatient(patientId, patientData) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update patient profile');
  }
  return res.json();
}

export async function seedSyntheticPatient(language = 'English') {
  const res = await fetch(`${API_BASE_URL}/patients/seed-synthetic?language=${encodeURIComponent(language)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed synthetic patient');
  return res.json();
}
