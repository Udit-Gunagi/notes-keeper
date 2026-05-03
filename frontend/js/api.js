// this file handles all the communication with our backend API
// keeping it centralized means we only update request logic in one place

const API_BASE = '/api';

const getToken = () => localStorage.getItem('nk_token');

const buildHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// generic fetch wrapper with proper error handling
const request = async (method, endpoint, body = null) => {
  const options = {
    method,
    headers: buildHeaders(),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  // safely parse JSON - server might return empty body on some errors
  let data;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Server returned an unexpected response. Is the backend running?');
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
};

const API = {
  auth: {
    login: (email, password) =>
      request('POST', '/auth/login', { email, password }),

    register: (username, email, password) =>
      request('POST', '/auth/register', { username, email, password }),

    me: () =>
      request('GET', '/auth/me'),
  },

  notes: {
    getAll: (search = '') => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request('GET', `/notes${query}`);
    },

    create: (title, content, color) =>
      request('POST', '/notes', { title, content, color }),

    update: (id, updates) =>
      request('PUT', `/notes/${id}`, updates),

    delete: (id) =>
      request('DELETE', `/notes/${id}`),

    togglePin: (id) =>
      request('PATCH', `/notes/${id}/pin`),
  }
};