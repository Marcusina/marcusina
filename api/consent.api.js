// api/consent.api.js
import apiClient from './apiClient';

/**
 * Get the current user's consent records.
 */
export const getMyConsents = async (userId) => {
  return await apiClient(`/consents/user/${userId}`, {
    method: 'GET',
  });
};

/**
 * Revoke a consent record.
 */
export const revokeConsent = async (consentId) => {
  return await apiClient(`/consents/${consentId}/revoke`, {
    method: 'PUT',
  });
};
