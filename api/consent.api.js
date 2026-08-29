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

/**
 * Grant a new, scoped consent record (e.g. sharing a single lab result with
 * a named professional). Minimal implementation - see add-laboratory-diagnostics
 * design.md: reconcile/de-duplicate if a dedicated Consent Center grant flow
 * (CON-02) is built separately.
 */
export const grantConsent = async (payload) => {
  return await apiClient('/consents/grant', {
    method: 'POST',
    body: payload,
  });
};
