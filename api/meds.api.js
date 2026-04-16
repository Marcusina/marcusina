// api/meds.api.js
import apiClient from './apiClient';

/**
 * Fetch all medications or search with a query.
 */
export const getMedications = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  
  const queryString = queryParams.toString();
  const endpoint = `/medications/all${queryString ? `?${queryString}` : ''}`;
  
  return await apiClient(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Get the current user's cart.
 */
export const getCart = async (token) => {
  return await apiClient('/cart/user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Add an item to the cart.
 */
export const addToCart = async (token, medicationId, quantity = 1) => {
  return await apiClient('/cart/add', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      medication_id: medicationId,
      quantity,
    },
  });
};

/**
 * Update a cart item's quantity.
 */
export const updateCartItem = async (token, itemId, quantity) => {
  return await apiClient(`/cart/item/${itemId}/update`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: { quantity },
  });
};

/**
 * Remove an item from the cart.
 */
export const removeFromCart = async (token, itemId) => {
  return await apiClient(`/cart/item/${itemId}/delete`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Upload a prescription.
 */
export const uploadPrescription = async (token, patientId, prescriptionData) => {
  return await apiClient(`/patients/${patientId}/prescriptions/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: prescriptionData,
  });
};
