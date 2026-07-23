// api/insurance.api.js
import apiClient from './apiClient';
import { getPatientProfile } from './auth.api';

/**
 * Get the current user's insurance plan.
 * The backend keys insurance records by the patient's PatientProfile _id
 * (not the User _id), so this first resolves that id via the patient
 * profile endpoint already used elsewhere in the app.
 */
export const getMyInsurance = async (token, userId) => {
  const patientProfile = await getPatientProfile(token, userId);
  if (!patientProfile || !patientProfile._id) {
    return [];
  }
  try {
    return await apiClient(`/insurance/patient/${patientProfile._id}`, {
      method: 'GET',
    });
  } catch (error) {
    // The backend returns 403 "Unauthorized" both for real auth failures and
    // for a patient with zero insurance records on file - treat it as empty.
    if (error.message.includes('Unauthorized')) {
      return [];
    }
    throw error;
  }
};
