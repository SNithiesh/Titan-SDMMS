import apiClient from './apiClient.js';

// ─── Complaint Management ─────────────────────────────────────────────────────
export const fetchComplaints = (params = {}) => apiClient.get('/erp/complaints', { params });
export const updateComplaint = (id, data) => apiClient.put(`/erp/complaints/${id}`, data);
export const deleteComplaint = (id) => apiClient.delete(`/erp/complaints/${id}`);
export const restoreComplaint = (id) => apiClient.put(`/erp/complaints/${id}/restore`);

// ─── Machine Management ───────────────────────────────────────────────────────
export const fetchMachines = (params = {}) => apiClient.get('/erp/machines', { params });
export const createMachine = (data) => apiClient.post('/erp/machines', data);
export const updateMachine = (id, data) => apiClient.put(`/erp/machines/${id}`, data);
export const deleteMachine = (id) => apiClient.delete(`/erp/machines/${id}`);

// ─── Fault Category Management ────────────────────────────────────────────────
export const fetchFaultCategories = () => apiClient.get('/erp/fault-categories');
export const createFaultCategory = (data) => apiClient.post('/erp/fault-categories', data);
export const updateFaultCategory = (id, data) => apiClient.put(`/erp/fault-categories/${id}`, data);
export const deleteFaultCategory = (id) => apiClient.delete(`/erp/fault-categories/${id}`);

// ─── Fault Type Management ────────────────────────────────────────────────────
export const fetchFaultTypes = (categoryId) => apiClient.get('/erp/fault-types', { params: { categoryId } });
export const createFaultType = (data) => apiClient.post('/erp/fault-types', data);
export const updateFaultType = (id, data) => apiClient.put(`/erp/fault-types/${id}`, data);
export const deleteFaultType = (id) => apiClient.delete(`/erp/fault-types/${id}`);

// ─── Department Management ────────────────────────────────────────────────────
export const fetchDepartments = () => apiClient.get('/erp/departments');
export const createDepartment = (data) => apiClient.post('/erp/departments', data);
export const updateDepartment = (id, data) => apiClient.put(`/erp/departments/${id}`, data);
export const deleteDepartment = (id) => apiClient.delete(`/erp/departments/${id}`);

// ─── System Settings ──────────────────────────────────────────────────────────
export const fetchSettings = () => apiClient.get('/erp/settings');
export const upsertSetting = (data) => apiClient.post('/erp/settings', data);

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const fetchAuditLogs = (params = {}) => apiClient.get('/erp/audit-logs', { params });
