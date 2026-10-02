/* ==========================================================================
   HADÉRA — customer-api.js
   Customer account API service
   ========================================================================== */

const CUSTOMER_API_CONFIG = {
    baseUrl: 'https://hadera-co.onrender.com/api'
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

    // Build the API URL safely
    const url =
        `${CUSTOMER_API_CONFIG.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

    console.log('CUSTOMER API REQUEST:', url);

    const response = await fetch(
        url,
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
    const token = getCustomerToken();

    if (!token) {
        console.error(
            'CUSTOMER AUTH: No customer token found.'
        );

        // TEMPORARY: do not redirect while debugging
        return false;
    }

    console.log(
        'CUSTOMER AUTH: Token found:',
        token.substring(0, 20) + '...'
    );

    try {
        const result = await getCurrentCustomer();

        console.log(
            'CUSTOMER AUTH: /customer/auth/me response:',
            result
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

        return true;

    } catch (error) {
        console.error(
            'CUSTOMER AUTH: Session verification FAILED:',
            error
        );

        console.error(
            'CUSTOMER AUTH: Error message:',
            error?.message
        );

        // TEMPORARY: do NOT clear the session or redirect
        // so we can inspect the actual problem.
        return false;
    }
}