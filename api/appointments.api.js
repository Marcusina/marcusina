// api/appointments.api.js
import apiClient from './apiClient';

/**
 * Get all appointments (as scheduler or provider) for the current user.
 */
export const getAppointments = async () => {
  try {
    return await apiClient('/appointments/all', {
      method: 'GET',
    });
  } catch (error) {
    if (error.message.includes('No appointments found')) {
      return [];
    }
    throw error;
  }
};
