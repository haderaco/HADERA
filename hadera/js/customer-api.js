/* ==========================================================================
   HADÉRA — customer-api.js
   Customer account API service
   ========================================================================== */

const CUSTOMER_API_CONFIG = {
    baseUrl: 'https://hadera-co.onrender.com/'
};


/* ==========================================================================
   CUSTOMER SESSION
   ========================================================================== */

function getCustomerToken() {
    return (
        localStorage.getItem('hadera_customer_token') ||
        sessionStorage.getItem('hadera_customer_token') ||
        ''
    );
}


function setCustomerToken(token, rememberMe = true) {
    localStorage.removeItem('hadera_customer_token');
    sessionStorage.removeItem('hadera_customer_token');

    if (!token) {
        return;
    }

    if (rememberMe) {
        localStorage.setItem(
            'hadera_customer_token',
            token
        );
    } else {
        sessionStorage.setItem(
            'hadera_customer_token',
            token
        );
    }
}


function getStoredCustomer() {
    const raw =
        localStorage.getItem('hadera_customer_user') ||
        sessionStorage.getItem('hadera_customer_user');

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}


function setStoredCustomer(customer, rememberMe = true) {
    localStorage.removeItem('hadera_customer_user');
    sessionStorage.removeItem('hadera_customer_user');

    if (!customer) {
        return;
    }

    const value = JSON.stringify(customer);

    if (rememberMe) {
        localStorage.setItem(
            'hadera_customer_user',
            value
        );
    } else {
        sessionStorage.setItem(
            'hadera_customer_user',
            value
        );
    }
}


function clearCustomerSession() {
    localStorage.removeItem(
        'hadera_customer_token'
    );

    localStorage.removeItem(
        'hadera_customer_user'
    );

    sessionStorage.removeItem(
        'hadera_customer_token'
    );

    sessionStorage.removeItem(
        'hadera_customer_user'
    );
}


function isCustomerLoggedIn() {
    return Boolean(getCustomerToken());
}


/* ==========================================================================
   REQUEST HELPER
   ========================================================================== */

async function customerApiRequest(
    path,
    options = {}
) {
    const {
        method = 'GET',
        body,
        auth = false
    } = options;

    const headers = {
        Accept: 'application/json'
    };

    if (body !== undefined) {
        headers['Content-Type'] =
            'application/json';
    }

    if (auth) {
        const token = getCustomerToken();

        if (!token) {
            throw new Error(
                'Please log in to continue.'
            );
        }

        headers.Authorization =
            `Bearer ${token}`;
    }

    const response = await fetch(
        `${CUSTOMER_API_CONFIG.baseUrl}${path}`,
        {
            method,
            headers,
            body:
                body === undefined
                    ? undefined
                    : JSON.stringify(body)
        }
    );

    let result = null;

    try {
        result = await response.json();
    } catch {
        result = null;
    }


    /*
     * Only clear the stored customer session when
     * an authenticated request actually fails.
     *
     * A 401 during login/signup means the credentials
     * were rejected, not that an existing session expired.
     */

    if (response.status === 401) {
        if (auth) {
            clearCustomerSession();

            throw new Error(
                result?.message ||
                'Your customer session has expired. Please log in again.'
            );
        }

        throw new Error(
            result?.message ||
            'Invalid email or password.'
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
   SIGNUP
   ========================================================================== */

async function signupCustomer(
    customerData,
    rememberMe = true
) {
    const result =
        await customerApiRequest(
            '/customer/auth/signup',
            {
                method: 'POST',
                body: customerData
            }
        );

    if (!result.token) {
        throw new Error(
            'The server did not return an authentication token.'
        );
    }

    setCustomerToken(
        result.token,
        rememberMe
    );

    setStoredCustomer(
        result.customer,
        rememberMe
    );

    return result;
}


/* ==========================================================================
   LOGIN
   ========================================================================== */

async function loginCustomer(
    credentials,
    rememberMe = true
) {
    const result =
        await customerApiRequest(
            '/customer/auth/login',
            {
                method: 'POST',
                body: credentials
            }
        );

    if (!result.token) {
        throw new Error(
            'The server did not return an authentication token.'
        );
    }

    setCustomerToken(
        result.token,
        rememberMe
    );

    setStoredCustomer(
        result.customer,
        rememberMe
    );

    return result;
}


/* ==========================================================================
   CURRENT CUSTOMER
   ========================================================================== */

async function getCurrentCustomer() {
    return customerApiRequest(
        '/customer/auth/me',
        {
            auth: true
        }
    );
}


/* ==========================================================================
   UPDATE PROFILE
   ========================================================================== */

async function updateCustomerProfile(
    profileData
) {
    const result =
        await customerApiRequest(
            '/customer/profile',
            {
                method: 'PATCH',
                body: profileData,
                auth: true
            }
        );

    if (result.customer) {
        const rememberMe = Boolean(
            localStorage.getItem(
                'hadera_customer_token'
            )
        );

        setStoredCustomer(
            result.customer,
            rememberMe
        );
    }

    return result;
}


/* ==========================================================================
   CUSTOMER ORDERS
   ========================================================================== */

async function getCustomerOrders() {
    const result =
        await customerApiRequest(
            '/customer/orders',
            {
                auth: true
            }
        );

    return (
        result.orders ||
        result.data ||
        []
    );
}


async function getCustomerOrder(
    orderId
) {
    return customerApiRequest(
        `/customer/orders/${encodeURIComponent(orderId)}`,
        {
            auth: true
        }
    );
}


/* ==========================================================================
   LOGOUT
   ========================================================================== */

async function logoutCustomer() {
    try {
        if (getCustomerToken()) {
            await customerApiRequest(
                '/customer/auth/logout',
                {
                    method: 'POST',
                    auth: true
                }
            );
        }
    } catch {
        // Local session is still cleared below.
    }

    clearCustomerSession();
}


/* ==========================================================================
   REQUIRE CUSTOMER
   ========================================================================== */

async function requireCustomerSession() {
    if (!getCustomerToken()) {
        window.location.replace(
            '../login.html'
        );

        return false;
    }

    try {
        const result =
            await getCurrentCustomer();

        if (result.customer) {
            const rememberMe = Boolean(
                localStorage.getItem(
                    'hadera_customer_token'
                )
            );

            setStoredCustomer(
                result.customer,
                rememberMe
            );
        }

        return true;
    } catch {
        clearCustomerSession();

        window.location.replace(
            '../login.html'
        );

        return false;
    }
}