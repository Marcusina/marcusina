// api/wishlist.api.js
import apiClient from './apiClient';

/**
 * Get the current user's wishlist.
 */
export const getWishlist = async () => {
  return await apiClient('/wishlist/user', {
    method: 'GET',
  });
};

/**
 * Add an item to the wishlist.
 */
export const addToWishlist = async (medicationId, inventoryId = null) => {
  return await apiClient('/wishlist/add', {
    body: {
      medication_id: medicationId,
      inventory_id: inventoryId,
    },
    method: 'POST',
  });
};

/**
 * Remove an item from the wishlist.
 */
export const removeFromWishlist = async (itemId) => {
  return await apiClient(`/wishlist/item/${itemId}`, {
    method: 'DELETE',
  });
};
