// api/labs.api.js
import apiClient from './apiClient';

/**
 * Get all lab/imaging orders for the current patient.
 */
export const getLabOrders = async () => {
  try {
    return await apiClient('/labs/orders/all', {
      method: 'GET',
    });
  } catch (error) {
    if (error.message.includes('No lab orders found')) {
      return [];
    }
    throw error;
  }
};

/**
 * Get a single lab/imaging order's detail and status.
 */
export const getLabOrderById = async (id) => {
  return await apiClient(`/labs/orders/${id}`, {
    method: 'GET',
  });
};

/**
 * Get a single lab/imaging result (available once the order is completed).
 */
export const getLabResultById = async (id) => {
  return await apiClient(`/labs/orders/${id}/result`, {
    method: 'GET',
  });
};

/**
 * Persist the patient's preferred lab/diagnostic center for a pending order.
 */
export const selectLabCenter = async (orderId, centerId) => {
  return await apiClient(`/labs/orders/${orderId}/center`, {
    method: 'PATCH',
    body: { center_id: centerId },
  });
};

/**
 * Create a lab/radiology order for a patient. Professional use only.
 */
export const createLabOrder = async (patientId, data) => {
  return await apiClient(`/patients/${patientId}/labs/orders/create`, {
    method: 'POST',
    body: data,
  });
};
