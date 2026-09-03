const API_BASE_URL = 'http://127.0.0.1:8000';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { isOnline: true, data };
    }
  } catch (e) {
    // Offline / fallback mode
  }
  return { isOnline: false, data: null };
}

export async function fetchInvoices(status = null, clientId = null) {
  try {
    let url = `${API_BASE_URL}/api/invoices`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (clientId) params.append('client_id', clientId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend unavailable, using local cache:', e);
  }
  return null;
}

export async function uploadInvoice(file, clientId = 'c1', customerName = 'Reliance Logistics Pvt Ltd') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('client_id', clientId);
  formData.append('customer_name', customerName);
  formData.append('firm_id', 'firm_default');

  const res = await fetch(`${API_BASE_URL}/api/invoices/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }

  return await res.json();
}

export async function approveInvoice(invoiceId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/approve`, {
      method: 'PATCH',
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API approve failed, fallback:', e);
  }
  return { success: true };
}

export async function rejectInvoice(invoiceId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/reject`, {
      method: 'PATCH',
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API reject failed, fallback:', e);
  }
  return { success: true };
}

export async function updateInvoice(invoiceId, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API update failed, fallback:', e);
  }
  return { success: true };
}

export async function fetchVendorPatterns() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendor-patterns`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API fetch patterns failed, fallback:', e);
  }
  return null;
}

export async function saveVendorPattern(pattern) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendor-patterns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pattern),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API save pattern failed, fallback:', e);
  }
  return { success: true };
}

export async function deleteVendorPattern(supplierGstin) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendor-patterns/${supplierGstin}`, {
      method: 'DELETE',
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API delete pattern failed, fallback:', e);
  }
  return { success: true };
}

// ---------------------------------------------------------------------------
// Reconciliation API
// ---------------------------------------------------------------------------

export async function runReconciliation(gstr2bFile = null, tallyFile = null, useDatabaseBooks = true, clientId = 'c1') {
  const formData = new FormData();
  if (gstr2bFile) formData.append('gstr2b_file', gstr2bFile);
  if (tallyFile) formData.append('tally_file', tallyFile);
  formData.append('use_database_books', useDatabaseBooks ? 'true' : 'false');
  formData.append('client_id', clientId);
  formData.append('firm_id', 'firm_default');

  const res = await fetch(`${API_BASE_URL}/api/reconcile/run`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Reconciliation failed' }));
    throw new Error(err.detail || 'Reconciliation failed');
  }

  return await res.json();
}

export async function fetchLatestReconciliation(firmId = 'firm_default') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reconcile/latest?firm_id=${firmId}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API fetch latest recon failed, fallback:', e);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Returns API
// ---------------------------------------------------------------------------

export async function fetchReturnSummary(period = '072026') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/returns/summary?period=${period}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API fetch return summary failed, fallback:', e);
  }
  return null;
}

export function downloadGstr1Url(period = '072026') {
  return `${API_BASE_URL}/api/returns/gstr1/download-json?period=${period}`;
}

export function downloadGstr3bUrl(period = '072026') {
  return `${API_BASE_URL}/api/returns/gstr3b/download-json?period=${period}`;
}
