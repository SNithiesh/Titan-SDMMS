import apiClient from './apiClient.js';

/**
 * Complaint API functions — all go through authenticated Express backend
 */

export async function fetchComplaints() {
  const response = await apiClient.get('/complaints');
  return response.data;
}

export async function createComplaint(complaintData) {
  const response = await apiClient.post('/complaints', complaintData);
  return response.data;
}

export async function assignTechnician(complaintId, technicianId, technicianName) {
  const response = await apiClient.patch(`/complaints/${complaintId}/assign`, {
    technicianId,
    technicianName
  });
  return response.data;
}

export async function acceptJob(complaintId) {
  const response = await apiClient.patch(`/complaints/${complaintId}/accept`);
  return response.data;
}

export async function startRepair(complaintId) {
  const response = await apiClient.patch(`/complaints/${complaintId}/start`);
  return response.data;
}

export async function completeRepair(complaintId, remarks, partsChanged) {
  const response = await apiClient.patch(`/complaints/${complaintId}/complete`, {
    remarks,
    partsChanged
  });
  return response.data;
}

export async function verifyAndClose(complaintId) {
  const response = await apiClient.patch(`/complaints/${complaintId}/verify`);
  return response.data;
}

export async function getDashboardStats() {
  const response = await apiClient.get('/complaints/stats');
  return response.data;
}
