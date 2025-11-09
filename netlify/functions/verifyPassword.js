// Netlify Function: verifyPassword (bcryptjs)
// Validates a requirement view password against Airtable-stored bcrypt hash
// Env: Prefer AIRTABLE_BASE_ID & AIRTABLE_API_KEY; fallback to AIRTABLE_BASE & AIRTABLE_KEY

const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const { requirementID, password } = body;
  if (!requirementID || !password) {
    return { statusCode: 200, body: JSON.stringify({ valid: false, error: 'Missing fields' }) };
  }

  const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
  const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
  const table = 'Requirements';
  const AIRTABLE_SYSTEM_TABLE = process.env.AIRTABLE_SYSTEM_TABLE || 'SystemConfig';
  const SUPPLIER_GLOBAL_PASSWORD_HASH = process.env.SUPPLIER_GLOBAL_PASSWORD_HASH || '';
  const SUPPLIER_GLOBAL_PASSWORD = process.env.SUPPLIER_GLOBAL_PASSWORD || '';

  if (!AIRTABLE_BASE || !AIRTABLE_KEY) {
    return { statusCode: 200, body: JSON.stringify({ valid: false, error: 'Airtable not configured. Set AIRTABLE_API_KEY/AIRTABLE_BASE_ID or AIRTABLE_KEY/AIRTABLE_BASE.' }) };
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(table)}?filterByFormula=${encodeURIComponent(`{RequirementID}='${requirementID}'`)}`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_KEY}` }
    });

    // Gracefully handle non-OK responses to avoid 500 in frontend
    if (!resp.ok) {
      // Provide clearer error for common misconfigurations
      if (resp.status === 401 || resp.status === 403) {
        return { statusCode: 200, body: JSON.stringify({ valid: false, error: 'Airtable访问未授权，请检查 AIRTABLE_API_KEY/AIRTABLE_BASE_ID 配置。' }) };
      }
      if (resp.status === 404) {
        return { statusCode: 200, body: JSON.stringify({ valid: false }) };
      }
      let msg = `Airtable HTTP ${resp.status}`;
      try {
        const errJson = await resp.json();
        msg = errJson?.error?.message || msg;
      } catch (_) {}
      return { statusCode: 200, body: JSON.stringify({ valid: false, error: msg }) };
    }

    const data = await resp.json();
    const record = Array.isArray(data.records) && data.records[0] ? data.records[0].fields : null;
    if (!record) {
      return { statusCode: 200, body: JSON.stringify({ valid: false }) };
    }

    const storedHash = record.ViewPasswordHash || '';
    let ok = false;

    // 1) Requirement-specific password (bcrypt)
    if (storedHash) {
      try { ok = await bcrypt.compare(password, storedHash); } catch (_) {}
    }

    // 2) Global supplier password (prefer hash, fallback to plain)
    if (!ok) {
      let globalHash = SUPPLIER_GLOBAL_PASSWORD_HASH;
      let globalPlain = SUPPLIER_GLOBAL_PASSWORD;
      if (!globalHash && !globalPlain) {
        // Try reading from SystemConfig
        try {
          const urlCfg = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_SYSTEM_TABLE)}?filterByFormula=${encodeURIComponent(`OR({Key}='SupplierGlobalPasswordHash',{Key}='SupplierGlobalPasswordPlain')`)}`;
          const respCfg = await fetch(urlCfg, { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } });
          if (respCfg.ok) {
            const cfg = await respCfg.json();
            (cfg.records||[]).forEach(r => {
              const k = r.fields.Key || r.fields.Name || r.fields.ConfigKey;
              const v = r.fields.Value ?? r.fields.ConfigValue ?? '';
              if (k === 'SupplierGlobalPasswordHash') globalHash = v;
              if (k === 'SupplierGlobalPasswordPlain') globalPlain = v;
            });
          }
        } catch (_) {}
      }
      if (globalHash) {
        try { ok = await bcrypt.compare(password, globalHash); } catch (_) {}
      } else if (globalPlain) {
        ok = globalPlain === password;
      }
    }
    if (!ok) {
      // 审计：验证失败
      try {
        const { logEvent } = require('./_audit');
        const ip = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'];
        logEvent({ eventType: 'verify_failed', requirementID, ip, meta: {} });
      } catch {}
      return { statusCode: 200, body: JSON.stringify({ valid: false }) };
    }

    // Return minimal private info on success
    try {
      const { logEvent } = require('./_audit');
      const ip = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'];
      let via = 'unknown';
      try {
        if (storedHash && (await bcrypt.compare(password, storedHash))) via = 'requirement';
        else via = 'global';
      } catch (_) {}
      logEvent({ eventType: 'verify_success', requirementID, ip, meta: { via } });
    } catch {}
    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        data: {
          company: record.ContactCompany || '',
          contact: record.ContactName || '',
          phone: record.ContactPhone || ''
        }
      })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Internal Error' };
  }
};