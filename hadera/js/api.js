/* ==========================================================================
   HADÉRA — api.js
   Real frontend API service layer.
   All protected admin requests use the stored admin token.
   ========================================================================== */

const API_CONFIG = {
  // Replace this with the actual deployed HADÉRA backend URL.
  baseUrl: 'https://YOUR-HADERA-BACKEND.onrender.com/api',
};

function getAdminToken() {
  return localStorage.getItem('hadera_admin_token');
}

function setAdminToken(token) {
  if (token) {
    localStorage.setItem('hadera_admin_token', token);
  } else {
    localStorage.removeItem('hadera_admin_token');
  }
}

function clearAdminSession() {
  localStorage.removeItem('hadera_admin_token');
  localStorage.removeItem('hadera_admin_user');
  sessionStorage.removeItem('hadera_admin_session');
}

async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = false,
  } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAdminToken();

    if (!token) {
      throw new Error('Authentication required.');
    }

    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined
      ? undefined
      : isFormData
        ? body
        : JSON.stringify(body),
  });

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (response.status === 401) {
    clearAdminSession();
    throw new Error('Your admin session has expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.error ||
      `Request failed with status ${response.status}.`
    );
  }

  return result;
}

/* ==========================================================================
   PRODUCTS
   ========================================================================== */

async function getProducts(filters = {}) {
  const params = new URLSearchParams();

  if (filters.category) params.set('category', filters.category);
  if (filters.location) params.set('location', filters.location);
  if (filters.search) params.set('search', filters.search);
  if (filters.minPrice !== '') params.set('minPrice', filters.minPrice);
  if (filters.maxPrice !== '') params.set('maxPrice', filters.maxPrice);
  if (filters.sort) params.set('sort', filters.sort);

  const query = params.toString();

  const result = await apiRequest(
    `/products${query ? `?${query}` : ''}`
  );

  return result.products || result.data || result || [];
}

async function getProduct(id) {
  if (!id) return null;

  try {
    const result = await apiRequest(`/products/${encodeURIComponent(id)}`);
    return result.product || result.data || result;
  } catch (error) {
    if (error.message.includes('404')) return null;
    throw error;
  }
}

/* ==========================================================================
   ORDERS / CHECKOUT
   ========================================================================== */

async function createOrder(orderData) {
  return apiRequest('/orders', {
    method: 'POST',
    body: orderData,
  });
}

async function initializePayment(paymentData) {
  return apiRequest('/payments/initialize', {
    method: 'POST',
    body: paymentData,
  });
}

async function getOrder(orderId) {
  return apiRequest(`/orders/${encodeURIComponent(orderId)}`);
}

/* ==========================================================================
   APPOINTMENTS
   ========================================================================== */

async function createAppointment(appointmentData) {
  return apiRequest('/appointments', {
    method: 'POST',
    body: appointmentData,
  });
}

/* ==========================================================================
   CONTACT
   ========================================================================== */

async function createContactMessage(messageData) {
  return apiRequest('/contact', {
    method: 'POST',
    body: messageData,
  });
}

/* ==========================================================================
   ADMIN AUTH
   ========================================================================== */

async function loginAdmin(credentials) {
  const result = await apiRequest('/admin/auth/login', {
    method: 'POST',
    body: credentials,
  });

  const token = result.token || result.accessToken;

  if (!token) {
    throw new Error('The server did not return an authentication token.');
  }

  setAdminToken(token);

  if (result.admin || result.user) {
    localStorage.setItem(
      'hadera_admin_user',
      JSON.stringify(result.admin || result.user)
    );
  }

  sessionStorage.setItem('hadera_admin_session', '1');

  return result;
}

async function getAdminMe() {
  return apiRequest('/admin/auth/me', {
    auth: true,
  });
}

async function logoutAdmin() {
  try {
    await apiRequest('/admin/auth/logout', {
      method: 'POST',
      auth: true,
    });
  } catch {
    // Local logout still happens if the backend logout endpoint is unavailable.
  }

  clearAdminSession();
}

/* ==========================================================================
   ADMIN PRODUCTS
   ========================================================================== */

async function getAdminProducts() {
  const result = await apiRequest('/admin/products', {
    auth: true,
  });

  return result.products || result.data || result || [];
}

async function createAdminProduct(formData) {
  return apiRequest('/admin/products', {
    method: 'POST',
    body: formData,
    auth: true,
  });
}

async function updateAdminProduct(id, formData) {
  return apiRequest(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: formData,
    auth: true,
  });
}

async function deleteAdminProduct(id) {
  return apiRequest(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  });
}

/* ==========================================================================
   ADMIN ORDERS
   ========================================================================== */

async function getOrders() {
  const result = await apiRequest('/admin/orders', {
    auth: true,
  });

  return result.orders || result.data || result || [];
}

async function updateOrderStatus(id, status) {
  return apiRequest(`/admin/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}

/* ==========================================================================
   ADMIN APPOINTMENTS
   ========================================================================== */

async function getAppointments() {
  const result = await apiRequest('/admin/appointments', {
    auth: true,
  });

  return result.appointments || result.data || result || [];
}

async function updateAppointmentStatus(id, status) {
  return apiRequest(
    `/admin/appointments/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      body: { status },
      auth: true,
    }
  );
}

/* ==========================================================================
   ADMIN CATEGORIES
   ========================================================================== */

async function getCategories() {
  const result = await apiRequest('/categories');

  return result.categories || result.data || result || [];
}

async function createCategory(formData) {
  return apiRequest('/admin/categories', {
    method: 'POST',
    body: formData,
    auth: true,
  });
}

async function updateCategory(id, formData) {
  return apiRequest(`/admin/categories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: formData,
    auth: true,
  });
}

async function deleteCategory(id) {
  return apiRequest(`/admin/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  });
}

/* ==========================================================================
   ADMIN DASHBOARD
   ========================================================================== */

async function getDashboardStats() {
  return apiRequest('/admin/dashboard', {
    auth: true,
  });
}

/* ==========================================================================
   ADMIN SETTINGS
   ========================================================================== */

async function getAdminSettings() {
  return apiRequest('/admin/settings', {
    auth: true,
  });
}

async function updateAdminSettings(settings) {
  return apiRequest('/admin/settings', {
    method: 'PATCH',
    body: settings,
    auth: true,
  });
}