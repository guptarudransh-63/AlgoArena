import api from './axios';

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Problems
export const problemsApi = {
  getAll: (params) => api.get('/problems', { params }),
  getBySlug: (slug) => api.get(`/problems/${slug}`),
  getSamples: (slug) => api.get(`/problems/${slug}/test-samples`),
  getStarterCode: (slug) => api.get(`/problems/${slug}/starter-code`),
};

// Submissions
export const submissionsApi = {
  run: (problemId, data) => api.post(`/problems/${problemId}/run`, data),
  submit: (problemId, data) => api.post(`/problems/${problemId}/submit`, data),
  getAll: (params) => api.get('/submissions', { params }),
  getById: (id) => api.get(`/submissions/${id}`),
  getStatus: (id) => api.get(`/submissions/${id}/status`),
  getMyForProblem: (problemId, params) => api.get(`/problems/${problemId}/submissions/me`, { params }),
};

// User
export const userApi = {
  getProgress: () => api.get('/users/me/progress'),
  getActivity: () => api.get('/users/me/activity'),
  getSubmissions: (params) => api.get('/users/me/submissions', { params }),
  getSolvedProblems: () => api.get('/users/me/solved-problems'),
};

// Admin
export const adminApi = {
  createProblem: (data) => api.post('/admin/problems', data),
  updateProblem: (id, data) => api.patch(`/admin/problems/${id}`, data),
  addTestCase: (problemId, data) => api.post(`/admin/problems/${problemId}/test-cases`, data),
  updateTestCase: (id, data) => api.patch(`/admin/test-cases/${id}`, data),
  deleteTestCase: (id) => api.delete(`/admin/test-cases/${id}`),
  publishProblem: (id) => api.post(`/admin/problems/${id}/publish`),
  getExecutionHealth: () => api.get('/admin/execution-health'),
};
