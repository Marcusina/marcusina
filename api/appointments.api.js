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

/**
 * Create a new appointment (e.g. from a consultation booking).
 */
export const createAppointment = async (payload) => {
  return await apiClient('/appointments/create', {
    method: 'POST',
    body: payload,
  });
};

/**
 * Get a single appointment by id. There is no GET /appointments/:id on the
 * backend (only /appointments/all) - this filters the real list rather than
 * hitting a nonexistent endpoint or fabricating data.
 */
export const getAppointmentById = async (id) => {
  const appointments = await getAppointments();
  return appointments.find((a) => a._id === id) || null;
};

/**
 * Cancel an appointment. Backed by a real endpoint:
 * PUT /appointments/:appointmentId/cancel.
 */
export const cancelAppointment = async (id, reason) => {
  return await apiClient(`/appointments/${id}/cancel`, {
    method: 'PUT',
    body: { cancellation_reason: reason || undefined },
  });
};

/**
 * Reschedule an appointment. Backed by a real endpoint:
 * PUT /appointments/:appointmentId/reschedule. Preserves the original
 * duration server-side if scheduled_end_time isn't passed.
 */
export const rescheduleAppointment = async (id, payload) => {
  return await apiClient(`/appointments/${id}/reschedule`, {
    method: 'PUT',
    body: payload,
  });
};

/**
 * Check in to an in-person appointment. Backed by a real endpoint:
 * POST /appointments/:appointmentId/checkin. The method/value fields are
 * accepted but not verified against anything server-side yet - there is no
 * real scannable MedGram ID/QR system to check them against.
 */
export const checkInAppointment = async (id, payload) => {
  return await apiClient(`/appointments/${id}/checkin`, {
    method: 'POST',
    body: payload,
  });
};

/**
 * Poll the caller's live queue position for a checked-in appointment.
 * Backed by a real endpoint: GET /appointments/:appointmentId/queue-position,
 * computed from other checked-in appointments for the same provider/day.
 */
export const getQueuePosition = async (id) => {
  return await apiClient(`/appointments/${id}/queue-position`, {
    method: 'GET',
  });
};
