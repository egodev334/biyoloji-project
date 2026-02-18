import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// Modules
export const modulesApi = {
  getAll: (params?: { category?: string; search?: string }) =>
    api.get('/modules', { params }),
  getById: (id: string) => api.get(`/modules/${id}`),
  create: (data: FormData) => api.post('/modules', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/modules/${id}`, data),
  delete: (id: string) => api.delete(`/modules/${id}`),
  uploadFile: (id: string, file: FormData) => api.post(`/modules/${id}/files`, file),
  deleteFile: (moduleId: string, fileId: string) =>
    api.delete(`/modules/${moduleId}/files/${fileId}`),
  getCategories: () => api.get('/modules/categories'),
};

// Exams
export const examsApi = {
  getById: (id: string) => api.get(`/exams/${id}`),
  submit: (id: string, data: { answers: Record<string, string>; timeTaken: number }) =>
    api.post(`/exams/${id}/submit`, data),
  create: (data: Record<string, unknown>) => api.post('/exams', data),
  addQuestion: (examId: string, data: Record<string, unknown>) =>
    api.post(`/exams/${examId}/questions`, data),
  getQuestions: (examId: string) => api.get(`/exams/${examId}/questions`),
  deleteQuestion: (questionId: string) => api.delete(`/exams/questions/${questionId}`),
  getMyAttempts: () => api.get('/exams/my-attempts'),
};

// Forum
export const forumApi = {
  getCategories: () => api.get('/forum/categories'),
  getTopics: (categoryId: string, params?: { page?: number }) =>
    api.get(`/forum/categories/${categoryId}/topics`, { params }),
  getTopic: (topicId: string) => api.get(`/forum/topics/${topicId}`),
  createTopic: (data: { category_id: string; title: string; content: string }) =>
    api.post('/forum/topics', data),
  createReply: (topicId: string, content: string) =>
    api.post(`/forum/topics/${topicId}/replies`, { content }),
  deleteTopic: (topicId: string) => api.delete(`/forum/topics/${topicId}`),
  deleteReply: (replyId: string) => api.delete(`/forum/replies/${replyId}`),
  pinTopic: (topicId: string) => api.patch(`/forum/topics/${topicId}/pin`),
  lockTopic: (topicId: string) => api.patch(`/forum/topics/${topicId}/lock`),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { search?: string; role?: string; page?: number }) =>
    api.get('/admin/users', { params }),
  toggleStatus: (userId: string) => api.patch(`/admin/users/${userId}/status`),
  changeRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, { role }),
};

// Badges
export const badgesApi = {
  getMine: () => api.get('/badges/mine'),
  getAll: () => api.get('/badges'),
};

// Users
export const usersApi = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  updateProfile: (data: FormData) => api.put('/users/profile', data),
};

// Practice
export const practiceApi = {
  getAll: (params?: { moduleId?: string; difficulty?: string }) =>
    api.get('/practice', { params }),
  create: (data: Record<string, unknown>) => api.post('/practice', data),
  delete: (id: string) => api.delete(`/practice/${id}`),
};
