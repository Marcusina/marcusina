// api/cart.api.js
import apiClient from './apiClient';

/**
 * Get the current user's cart.
 */
export const getCart = async () => {
  return await apiClient('/cart/user', {
    method: 'GET',
  });
};

/**
 * Add an item to the cart.
 */
export const addToCart = async (medicationId, quantity = 1) => {
  return await apiClient('/cart/add', {
    method: 'POST',
    body: {
      medication_id: medicationId,
      quantity,
    },
  });
};

/**
 * Update a cart item's quantity.
 */
export const updateCartItem = async (itemId, quantity) => {
  return await apiClient(`/cart/item/${itemId}/update`, {
    method: 'PUT',
    body: { quantity },
  });
};

/**
 * Remove an item from the cart.
 */
export const removeFromCart = async (itemId) => {
  return await apiClient(`/cart/item/${itemId}/delete`, {
    method: 'DELETE',
  });
};
