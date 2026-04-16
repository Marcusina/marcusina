// api/community.api.js
import apiClient from './apiClient';

/**
 * Fetch all communities or search with a query.
 */
export const getCommunities = async (token, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.type) queryParams.append('type', params.type);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const queryString = queryParams.toString();
  const endpoint = `/communities/all${queryString ? `?${queryString}` : ''}`;
  
  return await apiClient(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Get communities current user belongs to.
 */
export const getMyCommunities = async (token) => {
  return await apiClient('/communities/my', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Join a community.
 */
export const joinCommunity = async (token, communityId) => {
  return await apiClient(`/communities/${communityId}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Leave a community.
 */
export const leaveCommunity = async (token, communityId) => {
  return await apiClient(`/communities/${communityId}/leave`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Create a new community.
 */
export const createCommunity = async (token, communityData) => {
  return await apiClient('/communities/create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: communityData,
  });
};
