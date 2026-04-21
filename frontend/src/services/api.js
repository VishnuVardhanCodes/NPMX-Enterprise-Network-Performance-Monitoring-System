import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Natively intercepts ALL web requests to inject the encrypted JWT Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('npmx_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercept responses to handle authentication errors (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401)) {
      localStorage.removeItem('npmx_token');
      localStorage.removeItem('npmx_role');
      localStorage.removeItem('npmx_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginApi = async (data) => {
    const res = await api.post('/login', data);
    return res.data;
};

export const registerApi = async (data) => {
    const res = await api.post('/register', data);
    return res.data;
};

export const getLogsApi = async () => {
    const res = await api.get('/logs');
    return res.data;
};

export const getDevicesApi = async () => {
  const response = await api.get('/devices');
  return response.data;
};

export const addDeviceApi = async (deviceData) => {
  const payload = {
    device_name: deviceData.name,
    ip_address: deviceData.ip,
    port: deviceData.port,
    snmp_community: deviceData.snmp
  };
  const response = await api.post('/devices', payload);
  return response.data;
};

export const deleteDeviceApi = async (id) => {
  const response = await api.delete(`/devices/${id}`);
  return response.data;
};

export const pingDeviceApi = async (id) => {
  const response = await api.post(`/ping/${id}`);
  return response.data;
};

export const getDeviceMetricsApi = async (id) => {
  const response = await api.get(`/metrics/${id}`);
  return response.data;
};

export const triggerSnmpApi = async (id) => {
  const response = await api.post(`/snmp/${id}`);
  return response.data;
};

export const getSnmpMetricsApi = async (id) => {
  const response = await api.get(`/snmp/${id}`);
  return response.data;
};

export const getAlertsApi = async () => {
  const response = await api.get(`/alerts`);
  return response.data;
};

export const getRecentAlertsApi = async () => {
  const response = await api.get(`/alerts/recent`);
  return response.data;
};

export const getTopologyNodesApi = async () => {
    const res = await api.get('/topology/nodes');
    return res.data;
};

export const getTopologyLinksApi = async () => {
    const res = await api.get('/topology/links');
    return res.data;
};

export const saveNodePositionApi = async (data) => {
    const res = await api.put('/topology/node/position', data);
    return res.data;
};

export const generateReportApi = async () => {
    const res = await api.post('/reports/generate');
    return res.data;
};

export const getReportsApi = async () => {
    const res = await api.get('/reports');
    return res.data;
};

export const downloadReportUrl = (dateStr) => {
    return `http://localhost:5000/api/reports/download/${dateStr}`;
};

export const getThresholdApi = async (id) => {
    const res = await api.get(`/threshold/${id}`);
    return res.data;
};

export const updateThresholdApi = async (id, data) => {
    const res = await api.post(`/threshold/${id}`, data);
    return res.data;
};

export default api;
