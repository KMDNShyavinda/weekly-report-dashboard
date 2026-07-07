import api from './axiosInstance';
export const getMyReports  = ()          => api.get('/reports/me');
export const getAllReports  = (params)   => api.get('/reports', { params });
export const createReport  = (data)     => api.post('/reports', data);
export const updateReport  = (id, data) => api.put(`/reports/${id}`, data);
export const submitReport  = (id)       => api.put(`/reports/${id}/submit`);
