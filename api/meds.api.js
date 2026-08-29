// api/meds.api.js
import apiClient from './apiClient';

/**
 * Fetch all medications or search with a query.
 */
export const getMedications = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);

  const queryString = queryParams.toString();
  const endpoint = `/medications/all${queryString ? `?${queryString}` : ''}`;

  return await apiClient(endpoint, {
    method: 'GET',
  });
};

/**
 * Upload a prescription. Also backs professional prescription creation (RX-09) -
 * the shape is the same "prescriptions/create" endpoint, just called by a
 * professional on behalf of a patient rather than the patient uploading their own.
 */
export const uploadPrescription = async (patientId, prescriptionData) => {
  return await apiClient(`/patients/${patientId}/prescriptions/create`, {
    method: 'POST',
    body: prescriptionData,
  });
};

/**
 * Fetch all prescriptions for a patient.
 */
export const getUserPrescriptions = async (token, userId) => {
  try {
    return await apiClient(`/patients/${userId}/prescriptions`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (!error.message.includes('create a profile')) {
      console.error('[API getUserPrescriptions Error]', error);
    }
    return []; // Return empty array if error
  }
};

/**
 * Fetch a single prescription's full detail.
 */
export const getPrescriptionById = async (id) => {
  return await apiClient(`/prescriptions/${id}`, {
    method: 'GET',
  });
};

/**
 * Request a refill for an existing prescription.
 */
export const requestRefill = async (id) => {
  return await apiClient(`/prescriptions/${id}/refill`, {
    method: 'POST',
  });
};

/**
 * Persist a reminder schedule against a specific prescription.
 */
export const updatePrescriptionReminder = async (id, patch) => {
  return await apiClient(`/prescriptions/${id}/reminder`, {
    method: 'PATCH',
    body: patch,
  });
};
