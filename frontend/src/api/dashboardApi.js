import api from './axiosInstance';
export const getSummary = () => api.get('/dashboard/summary');
export const getCharts  = () => api.get('/dashboard/charts');
