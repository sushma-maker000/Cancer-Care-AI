const API_BASE_URL = '/api';

const originalFetch = globalThis.fetch;
globalThis.fetch = (resource, options = {}) => {
  const { timeout = 10000 } = options;
  let actualTimeout = timeout;
  
  const resourceStr = typeof resource === 'string' ? resource : '';
  if (resourceStr.includes('/prescriptions/upload')) {
    actualTimeout = 30000;
  } else if (resourceStr.includes('/chat')) {
    actualTimeout = 60000;
  }
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), actualTimeout);
  
  return originalFetch(resource, {
    ...options,
    signal: controller.signal
  }).then(response => {
    clearTimeout(id);
    return response;
  }).catch(error => {
    clearTimeout(id);
    throw error;
  });
};

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

// Prescription APIs
export async function uploadPrescriptionFile(patientId, file) {
  const formData = new FormData();
  formData.append('patient_id', patientId);
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/prescriptions/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload prescription');
  }
  return res.json();
}

export async function loadSamplePrescription(patientId) {
  const formData = new FormData();
  formData.append('patient_id', patientId);

  const res = await fetch(`${API_BASE_URL}/prescriptions/load-sample`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load sample prescription');
  }
  return res.json();
}

export async function confirmPrescription(prescriptionId, medications, startDate = null) {
  const res = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      medications,
      start_date: startDate,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to confirm prescription');
  }
  return res.json();
}

// Medication & Schedule APIs
export async function fetchPatientMedications(patientId) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/medications`);
  if (!res.ok) throw new Error('Failed to fetch medications');
  return res.json();
}

export async function fetchPatientDoseEvents(patientId) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/dose-events`);
  if (!res.ok) throw new Error('Failed to fetch dose events');
  return res.json();
}

export async function recordDoseAction(eventId, actionData) {
  const res = await fetch(`${API_BASE_URL}/dose-events/${eventId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(actionData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to record dose action');
  }
  return res.json();
}

export async function fetchAdherence(patientId) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/adherence`);
  if (!res.ok) throw new Error('Failed to fetch adherence');
  return res.json();
}

export async function fetchInventory(patientId) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function fetchAppointments(patientId) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/appointments`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function triggerDemoEscalation(eventId) {
  const res = await fetch(`${API_BASE_URL}/caregiver/escalate/demo/${eventId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to trigger demo escalation');
  }
  return res.json();
}

