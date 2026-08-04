import apiClient from './apiClient.js';

/**
 * Authentication API functions
 * All calls go to Express backend → bcrypt verify → JWT returned
 */

/**
 * Login with employee ID and password
 * Returns: { accessToken, refreshToken, user }
 */
export async function loginRequest(employeeId, password) {
  const response = await apiClient.post('/auth/login', { employeeId, password });
  return response.data;
}

/**
 * Logout — notifies server and clears tokens
 */
export async function logoutRequest() {
  try {
    await apiClient.post('/auth/logout');
  } catch (_) { /* ignore errors on logout */ }
  sessionStorage.removeItem('titan_access_token');
  localStorage.removeItem('titan_access_token');
  localStorage.removeItem('titan_sdmms_user');
}

/**
 * Get current user profile from token
 */
export async function getMeRequest() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}
