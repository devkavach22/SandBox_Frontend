// ─── Shared Auth & API Store ──────────────────────────────────────────────────
export const ADMIN_EMAIL    = "KavachQK@gmail.com";
export const ADMIN_PASSWORD = "Kavach9080#";

// ─── Current User ─────────────────────────────────────────────────────────────
export const saveUser  = (user) => localStorage.setItem("sandbox_user", JSON.stringify(user));
export const getUser   = () => { try { return JSON.parse(localStorage.getItem("sandbox_user")); } catch { return null; } };
export const clearUser = () => localStorage.removeItem("sandbox_user");

// ─── All Registered Customers ─────────────────────────────────────────────────
export const getAllCustomers = () => {
  try { return JSON.parse(localStorage.getItem("sandbox_all_customers")) || []; } catch { return []; }
};
export const saveAllCustomers = (list) =>
  localStorage.setItem("sandbox_all_customers", JSON.stringify(list));

export const registerCustomer = (customer) => {
  const existing = getAllCustomers();
  const alreadyExists = existing.find((c) => c.email === customer.email);
  if (alreadyExists) return false;
  saveAllCustomers([...existing, { ...customer, joinedAt: new Date().toISOString(), selectedApis: [] }]);
  return true;
};

export const updateCustomerApis = (email, apis) => {
  const all = getAllCustomers();
  saveAllCustomers(all.map((c) => c.email === email ? { ...c, selectedApis: apis } : c));
};

// ─── Admin APIs ───────────────────────────────────────────────────────────────
export const getAdminApis  = () => { try { return JSON.parse(localStorage.getItem("sandbox_admin_apis")) || []; } catch { return []; } };
export const saveAdminApis = (apis) => localStorage.setItem("sandbox_admin_apis", JSON.stringify(apis));

// ─── Customer Selected APIs ───────────────────────────────────────────────────
export const getCustomerApis  = (email) => { try { return JSON.parse(localStorage.getItem(`sandbox_selected_${email}`)) || []; } catch { return []; } };
export const saveCustomerApis = (email, apis) => {
  localStorage.setItem(`sandbox_selected_${email}`, JSON.stringify(apis));
  updateCustomerApis(email, apis);
};

// ─── Wallet ───────────────────────────────────────────────────────────────────
export const getBalance  = (email) => { const v = localStorage.getItem(`sandbox_balance_${email}`); return v ? parseFloat(v) : 0; };
export const saveBalance = (email, bal) => localStorage.setItem(`sandbox_balance_${email}`, bal.toString());

// ─── API Call Count ───────────────────────────────────────────────────────────
export const getCallCount  = (email) => { const v = localStorage.getItem(`sandbox_calls_${email}`); return v ? parseInt(v) : 0; };
export const saveCallCount = (email, n) => localStorage.setItem(`sandbox_calls_${email}`, n.toString());

// ─── API Call History ─────────────────────────────────────────────────────────
// Each record: { id, email, customerName, apiId, apiName, method, url, status, statusCode, amount, timestamp }

export const getHistory = (email) => {
  try { return JSON.parse(localStorage.getItem(`sandbox_history_${email}`)) || []; } catch { return []; }
};

export const saveHistory = (email, records) =>
  localStorage.setItem(`sandbox_history_${email}`, JSON.stringify(records));

export const addHistoryRecord = (email, record) => {
  const existing = getHistory(email);
  const newRecord = {
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    email,
    timestamp: new Date().toISOString(),
    ...record,
  };
  // Keep max 200 records per customer
  const updated = [newRecord, ...existing].slice(0, 200);
  saveHistory(email, updated);
  return newRecord;
};

// Get all history across all customers (for admin)
export const getAllHistory = () => {
  const all = [];
  const customers = getAllCustomers();
  const emailsChecked = new Set();

  customers.forEach((c) => {
    emailsChecked.add(c.email);
    const records = getHistory(c.email);
    all.push(...records);
  });

  // Scan all localStorage keys for any sandbox_history_ entries
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("sandbox_history_")) {
      const email = key.replace("sandbox_history_", "");
      if (!emailsChecked.has(email)) {
        const records = getHistory(email);
        all.push(...records);
      }
    }
  }

  return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// ─── Payment History ──────────────────────────────────────────────────────────
// Each record: { id, paymentId, email, customerName, amount, timestamp, method }

export const getPayments = (email) => {
  try { return JSON.parse(localStorage.getItem(`sandbox_payments_${email}`)) || []; } catch { return []; }
};

export const savePayments = (email, records) =>
  localStorage.setItem(`sandbox_payments_${email}`, JSON.stringify(records));

export const addPaymentRecord = (email, record) => {
  const existing = getPayments(email);
  const newRecord = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    email,
    timestamp: new Date().toISOString(),
    ...record,
  };
  const updated = [newRecord, ...existing].slice(0, 200);
  savePayments(email, updated);
  return newRecord;
};

export const getAllPayments = () => {
  const all = [];

  // Method 1: from registered customers list
  const customers = getAllCustomers();
  const emailsChecked = new Set();
  customers.forEach((c) => {
    emailsChecked.add(c.email);
    const records = getPayments(c.email);
    all.push(...records);
  });

  // Method 2: scan all localStorage keys for any sandbox_payments_ entries
  // (catches payments from customers not yet in customers list)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("sandbox_payments_")) {
      const email = key.replace("sandbox_payments_", "");
      if (!emailsChecked.has(email)) {
        const records = getPayments(email);
        all.push(...records);
      }
    }
  }

  return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};