// api/auth.api.js
import apiClient from './apiClient';

export const login = async (email, password) => {
  return await apiClient('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
};

export const register = async (userData) => {
  return await apiClient('/auth/register', {
    method: 'POST',
    body: userData,
  });
};

export const verifyEmail = async (email, code) => {
  return await apiClient(`/verify-email?email=${email}&code=${code}`, {
    method: 'GET',
  });
};

export const checkVerificationStatus = async (email) => {
  return await apiClient(`/verify-email?email=${email}`, {
    method: 'GET',
  });
};

export const logout = async (token) => {
  return await apiClient('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentUser = async (token) => {
  return await apiClient('/get-user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
