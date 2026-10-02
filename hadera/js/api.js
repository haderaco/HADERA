/* ==========================================================================
   HADÉRA — api.js
   Real frontend API service layer.
   All protected admin requests use the stored admin token.
   ========================================================================== */

const API_CONFIG = {
  // Replace this with the actual deployed HADÉRA backend URL.
  baseUrl: 'https://hadera-co.onrender.com/',
};


/* ==========================================================================
   ADMIN SESSION HELPERS
   ========================================================================== */

function getAdminToken() {
  return (
    localStorage.getItem('hadera_admin_token') ||
    sessionStorage.getItem('hadera_admin_token')
  );
}

function setAdminToken(token, rememberMe = true) {
  // Always remove old copies first so there is only one active storage location.
  localStorage.removeItem('hadera_admin_token');
  sessionStorage.removeItem('hadera_admin_token');

  if (!token) return;

  if (rememberMe) {
    localStorage.setItem(
      'hadera_admin_token',
      token
    );
  } else {
    sessionStorage.setItem(
      'hadera_admin_token',
      token
    );
  }
}

function getStoredAdminUser() {
  const storedUser =
    localStorage.getItem('hadera_admin_user') ||
    sessionStorage.getItem('hadera_admin_user');

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

function setStoredAdminUser(user, rememberMe = true) {
  localStorage.removeItem('hadera_admin_user');
  sessionStorage.removeItem('hadera_admin_user');

  if (!user) return;

  const storage = rememberMe
    ? localStorage
    : sessionStorage;

  storage.setItem(
    'hadera_admin_user',
    JSON.stringify(user)
  );
}

function clearAdminSession() {
  localStorage.removeItem('hadera_admin_token');
  localStorage.removeItem('hadera_admin_user');

  sessionStorage.removeItem('hadera_admin_token');
  sessionStorage.removeItem('hadera_admin_user');
  sessionStorage.removeItem('hadera_admin_session');
}


/* ==========================================================================
   GENERIC API REQUEST
   ========================================================================== */

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
    requestHeaders['Content-Type'] =
      'application/json';
  }

  if (auth) {
    const token = getAdminToken();

    if (!token) {
      throw new Error(
        'Authentication required.'
      );
    }

    requestHeaders.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_CONFIG.baseUrl}${path}`,
    {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    }
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (response.status === 401) {
    clearAdminSession();

    throw new Error(
      'Your admin session has expired. Please log in again.'
    );
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

  if (filters.category) {
    params.set(
      'category',
      filters.category
    );
  }

  if (filters.location) {
    params.set(
      'location',
      filters.location
    );
  }

  if (filters.search) {
    params.set(
      'search',
      filters.search
    );
  }

  if (filters.minPrice !== '') {
    params.set(
      'minPrice',
      filters.minPrice
    );
  }

  if (filters.maxPrice !== '') {
    params.set(
      'maxPrice',
      filters.maxPrice
    );
  }

  if (filters.sort) {
    params.set(
      'sort',
      filters.sort
    );
  }

  const query = params.toString();

  const result = await apiRequest(
    `/products${query ? `?${query}` : ''}`
  );

  return (
    result.products ||
    result.data ||
    result ||
    []
  );
}

async function getProduct(id) {
  if (!id) return null;

  try {
    const result = await apiRequest(
      `/products/${encodeURIComponent(id)}`
    );

    return (
      result.product ||
      result.data ||
      result
    );
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }

    throw error;
  }
}


/* ==========================================================================
   ORDERS / CHECKOUT
   ========================================================================== */

async function createOrder(orderData) {
  const customerToken =
    localStorage.getItem('hadera_customer_token') ||
    sessionStorage.getItem('hadera_customer_token');

  return apiRequest('/orders', {
    method: 'POST',
    body: orderData,
    headers: customerToken
      ? {
        Authorization: `Bearer ${customerToken}`,
      }
      : {},
  });
}

async function initializePayment({ orderId }) {
  const result = await apiRequest(
    '/payments/initialize',
    {
      method: 'POST',

      body: {
        orderId
      }
    }
  );

  return (
    result.payment ||
    result
  );
}

async function getOrder(orderId) {
  return apiRequest(
    `/orders/${encodeURIComponent(orderId)}`
  );
}


/* ==========================================================================
   APPOINTMENTS
   ========================================================================== */

async function createAppointment(
  appointmentData
) {
  return apiRequest('/appointments', {
    method: 'POST',
    body: appointmentData,
  });
}


/* ==========================================================================
   CONTACT
   ========================================================================== */

async function createContactMessage(
  messageData
) {
  return apiRequest('/contact', {
    method: 'POST',
    body: messageData,
  });
}


/* ==========================================================================
   ADMIN AUTH
   ========================================================================== */

async function loginAdmin(
  credentials,
  rememberMe = true
) {
  const result = await apiRequest(
    '/admin/auth/login',
    {
      method: 'POST',
      body: credentials,
    }
  );

  const token =
    result.token ||
    result.accessToken;

  if (!token) {
    throw new Error(
      'The server did not return an authentication token.'
    );
  }

  setAdminToken(
    token,
    rememberMe
  );

  const adminUser =
    result.admin ||
    result.user ||
    null;

  if (adminUser) {
    setStoredAdminUser(
      adminUser,
      rememberMe
    );
  }

  /*
   * This flag is only informational.
   * The actual session is determined by the token
   * stored in localStorage or sessionStorage.
   */
  sessionStorage.setItem(
    'hadera_admin_session',
    '1'
  );

  return result;
}

async function getAdminMe() {
  return apiRequest(
    '/admin/auth/me',
    {
      auth: true,
    }
  );
}

async function requireAdminSession() {
  const token = getAdminToken();

  if (!token) {
    window.location.href =
      'login.html';

    return false;
  }

  try {
    await getAdminMe();
    return true;
  } catch {
    clearAdminSession();

    window.location.href =
      'index.html';

    return false;
  }
}

async function logoutAdmin() {
  try {
    await apiRequest(
      '/admin/auth/logout',
      {
        method: 'POST',
        auth: true,
      }
    );
  } catch {
    // Local logout still happens if the backend logout endpoint is unavailable.
  }

  clearAdminSession();

  /*
   * If this function is called from an admin page,
   * return the admin to the login page.
   */
  if (
    window.location.pathname.includes('/admin/')
  ) {
    window.location.href =
      'index.html';
  }
}


/* ==========================================================================
   ADMIN PRODUCTS
   ========================================================================== */

async function getAdminProducts() {
  const result = await apiRequest(
    '/admin/products',
    {
      auth: true,
    }
  );

  return (
    result.products ||
    result.data ||
    result ||
    []
  );
}

async function createAdminProduct(
  formData
) {
  return apiRequest(
    '/admin/products',
    {
      method: 'POST',
      body: formData,
      auth: true,
    }
  );
}

async function updateAdminProduct(
  id,
  formData
) {
  return apiRequest(
    `/admin/products/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: formData,
      auth: true,
    }
  );
}

async function deleteAdminProduct(id) {
  return apiRequest(
    `/admin/products/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      auth: true,
    }
  );
}


/* ==========================================================================
   ADMIN ORDERS
   ========================================================================== */

async function getOrders() {
  const result = await apiRequest(
    '/admin/orders',
    {
      auth: true,
    }
  );

  return (
    result.orders ||
    result.data ||
    result ||
    []
  );
}

async function updateOrderStatus(
  id,
  status
) {
  return apiRequest(
    `/admin/orders/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      body: { status },
      auth: true,
    }
  );
}


/* ==========================================================================
   ADMIN APPOINTMENTS
   ========================================================================== */

async function getAppointments() {
  const result = await apiRequest(
    '/admin/appointments',
    {
      auth: true,
    }
  );

  return (
    result.appointments ||
    result.data ||
    result ||
    []
  );
}

async function updateAppointmentStatus(
  id,
  status
) {
  if (!id) {
    throw new Error(
      'Appointment ID is required.'
    );
  }

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
  const result = await apiRequest(
    '/categories'
  );

  return (
    result.categories ||
    result.data ||
    result ||
    []
  );
}

async function createCategory(
  formData
) {
  return apiRequest(
    '/admin/categories',
    {
      method: 'POST',
      body: formData,
      auth: true,
    }
  );
}

async function updateCategory(
  id,
  formData
) {
  return apiRequest(
    `/admin/categories/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: formData,
      auth: true,
    }
  );
}

async function deleteCategory(id) {
  return apiRequest(
    `/admin/categories/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      auth: true,
    }
  );
}


/* ==========================================================================
   ADMIN DASHBOARD
   ========================================================================== */

async function getDashboardStats() {
  return apiRequest(
    '/admin/dashboard',
    {
      auth: true,
    }
  );
}


/* ==========================================================================
   ADMIN SETTINGS
   ========================================================================== */

async function getAdminSettings() {
  return apiRequest(
    '/admin/settings',
    {
      auth: true,
    }
  );
}

async function updateAdminSettings(
  settings
) {
  return apiRequest(
    '/admin/settings',
    {
      method: 'PATCH',
      body: settings,
      auth: true,
    }
  );
}

async function loginUnified(email, password, remember = true) {
  const response = await fetch(
    `${API_CONFIG.baseUrl}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
      'Invalid email or password'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */

  if (data.role === 'admin') {
    if (remember) {
      localStorage.setItem(
        'hadera_admin_token',
        data.token
      );

      localStorage.setItem(
        'hadera_admin_user',
        JSON.stringify(data.admin)
      );

      sessionStorage.removeItem(
        'hadera_admin_token'
      );

      sessionStorage.removeItem(
        'hadera_admin_user'
      );
    } else {
      sessionStorage.setItem(
        'hadera_admin_token',
        data.token
      );

      sessionStorage.setItem(
        'hadera_admin_user',
        JSON.stringify(data.admin)
      );

      localStorage.removeItem(
        'hadera_admin_token'
      );

      localStorage.removeItem(
        'hadera_admin_user'
      );
    }

    return {
      role: 'admin',
      token: data.token,
      user: data.admin
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER
  |--------------------------------------------------------------------------
  */

  if (data.role === 'customer') {
    if (remember) {
      localStorage.setItem(
        'hadera_customer_token',
        data.token
      );

      localStorage.setItem(
        'hadera_customer_user',
        JSON.stringify(data.customer)
      );

      sessionStorage.removeItem(
        'hadera_customer_token'
      );

      sessionStorage.removeItem(
        'hadera_customer_user'
      );
    } else {
      sessionStorage.setItem(
        'hadera_customer_token',
        data.token
      );

      sessionStorage.setItem(
        'hadera_customer_user',
        JSON.stringify(data.customer)
      );

      localStorage.removeItem(
        'hadera_customer_token'
      );

      localStorage.removeItem(
        'hadera_customer_user'
      );
    }

    return {
      role: 'customer',
      token: data.token,
      user: data.customer
    };
  }

  throw new Error('Unknown account type');
}