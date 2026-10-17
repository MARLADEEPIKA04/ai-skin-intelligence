import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap response data directly for ease of use across components
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Profile
export const saveProfile = (data) => api.post('/api/profile', data);
export const getProfile = () => api.get('/skin-profile/me');
export const updateProfile = (data) => api.put('/skin-profile/me', data);

// Dashboard
export const getDashboard = () => api.get('/api/dashboard/overview');
export const getDashboardM3 = () => api.get('/api/dashboard/milestone3');

// AI Analysis & Recommendations
export const getAISummary = () => api.get('/api/ai/summary');
export const getAIAnalysis = () => api.get('/api/ai/skin-analysis');
export const getRecommendations = () => api.get('/api/ai/recommendations');
export const getDermatologyRec = () => api.get('/api/ai/dermatology-recommendation');
export const getExplanation = () => api.get('/api/ai/recommendation-explanation');
export const getOverviewMetrics = () => api.get('/api/overview/metrics');
export const getActionPlan = () => api.get('/api/ai/action-plan');
export const getSkinIndex = () => api.get('/api/ai/skin-index');
export const getInsights = () => api.get('/api/ai/insights');

// Ingredients
export const getIngredients = (query = '', category = '') => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (category) params.append('category', category);
  return api.get(`/api/ingredients?${params.toString()}`);
};
export const getIngredient = (name) => api.get(`/api/ingredients/${encodeURIComponent(name)}`);
export const analyzeIngredient = (nameOrData) => {
  const payload = typeof nameOrData === 'string' ? { ingredient_name: nameOrData } : nameOrData;
  return api.post('/api/ingredients/analyze', payload);
};

// Products
export const getProducts = (params) => api.get('/api/products', { params });
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const getProductRecommendations = (params) => api.get('/api/products/recommendations', { params });
export const compareProducts = (idsOrData) => {
  const ids = Array.isArray(idsOrData) ? idsOrData : (idsOrData?.product_ids || []);
  return api.post('/api/products/compare', { product_ids: ids });
};
export const getAlternatives = (id) => api.get(`/api/products/alternatives/${id}`);

// Progress Tracking
export const logRoutine = (data) => {
  const payload = {
    log_date: data.log_date || data.date || new Date().toISOString().split('T')[0],
    morning_completed: !!data.morning_completed,
    evening_completed: !!data.evening_completed,
    sunscreen_completed: !!(data.sunscreen_completed ?? data.sunscreen_applied),
    notes: data.notes || '',
  };
  return api.post('/api/progress/routine-log', payload);
};
export const getRoutineLogs = (limit = 30) => api.get('/api/progress/routine-logs', { params: { limit } });
export const logProgress = (data) => {
  const payload = {
    routine_adherence: data.routine_adherence !== undefined ? Number(data.routine_adherence) : undefined,
    improvement_score: data.improvement_score !== undefined ? Number(data.improvement_score) : (data.score !== undefined ? Number(data.score) : undefined),
    hydration_score: data.hydration_score !== undefined ? Number(data.hydration_score) : undefined,
    lifestyle_score: data.lifestyle_score !== undefined ? Number(data.lifestyle_score) : undefined,
    sleep_score: data.sleep_score !== undefined ? Number(data.sleep_score) : undefined,
    concern_status: data.concern_status || undefined,
    notes: data.notes || '',
  };
  return api.post('/api/progress/log', payload);
};
export const getProgress = (limit = 30) => api.get('/api/progress/me', { params: { limit } });
export const getAnalyticsOverview = () => api.get('/api/analytics/overview');
export const getAnalyticsTrends = (limit = 30) => api.get('/api/analytics/trends', { params: { limit } });

// Consultations
export const createConsultation = (data) => api.post('/consultations', data);
export const getMyConsultations = () => api.get('/consultations/my');
export const getConsultationQueue = () => api.get('/consultations/queue');
export const getConsultation = (id) => api.get(`/consultations/${id}`);
export const acceptConsultation = (id) => api.patch(`/consultations/${id}/accept`);
export const respondConsultation = (id, data) => api.patch(`/consultations/${id}/respond`, data);
export const cancelConsultation = (id) => api.patch(`/consultations/${id}/cancel`);
export const sendConsultationMessage = (id, msgOrData) => {
  const payload = typeof msgOrData === 'string' ? { message: msgOrData } : msgOrData;
  return api.post(`/consultations/${id}/messages`, payload);
};
export const getConsultationMessages = (id) => api.get(`/consultations/${id}/messages`);
export const getConsultationStats = () => api.get('/api/consultations/stats');
export const getSpecialists = () => api.get('/api/specialists');
export const getDermatologistDashboard = () => api.get('/api/dermatologist/dashboard');
export const getConsultantDashboard = () => api.get('/api/consultant/dashboard');

// Skin Check-in
export const uploadCheckinPhoto = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/skin-checkin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const uploadCheckinCamera = (imageBase64) => api.post('/api/skin-checkin/upload-camera', { image_base64: imageBase64 });
export const analyzeCheckin = (data) => {
  const payload = {
    ...data,
    photo_url: data.photo_url || data.photo_path || null,
  };
  return api.post('/api/skin-checkin/analyze', payload);
};
export const getLatestCheckin = () => api.get('/api/skin-checkin/latest');
export const getCheckinHistory = (limit = 30) => api.get('/api/skin-checkin/history', { params: { limit } });

// Milestone 4: Executive Dashboard & Clinical Reports
export const getExecutiveDashboard = () => api.get('/api/admin/executive-dashboard');
export const getClinicalSummaryReport = (userId) => api.get('/api/reports/clinical-summary', { params: userId ? { user_id: userId } : {} });
export const exportCSVReport = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8000/api/reports/export/csv', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to export CSV');
  return res.blob();
};
export const exportJSONReport = () => api.get('/api/reports/export/json');

// Notifications & Reminders
export const getNotifications = () => api.get('/api/notifications');
export const getUnreadNotificationCount = () => api.get('/api/notifications/unread-count');
export const markNotificationRead = (id) => api.patch(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post('/api/notifications/read-all');
export const createNotification = (data) => api.post('/api/notifications', data);

// Tele-Consultation Appointments
export const getAvailableAppointmentSlots = (specialistId, date) =>
  api.get('/api/appointments/available-slots', { params: { specialist_id: specialistId, date } });
export const bookAppointment = (data) => api.post('/api/appointments', data);
export const getMyAppointments = () => api.get('/api/appointments/my');
export const cancelAppointment = (id) => api.patch(`/api/appointments/${id}/cancel`);

// Ingredient Conflict & Interactions Matrix
export const getInteractionMatrix = () => api.get('/api/ingredients/interactions/matrix');
export const checkIngredientConflicts = (ingredients) =>
  api.post('/api/ingredients/interactions', { ingredients });

// AI Virtual Skincare Chatbot
export const sendAIChatMessage = (message, history = []) =>
  api.post('/api/ai/chat', { message, history });

// System
export const getCapabilities = () => api.get('/api/system/capabilities');

export default api;


