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
 * Upload a prescription.
 */
export const uploadPrescription = async (patientId, prescriptionData) => {
  return await apiClient(`/patients/${patientId}/prescriptions/create`, {
    method: 'POST',
    body: prescriptionData,
  });
};
