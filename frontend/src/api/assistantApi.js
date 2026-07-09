import api from './axiosInstance';

export const sendAssistantMessage = (question) => api.post('/assistant/message', { question });
