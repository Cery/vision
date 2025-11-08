const Airtable = require('airtable');

exports.handler = async (event) => {
  try {
    const ADMIN_KEY = process.env.ADMIN_KEY || '';
    const key = event.headers['x-admin-key'] || event.headers['X-Admin-Key'] || '';
    if (!ADMIN_KEY || key !== ADMIN_KEY) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
    const tableName = process.env.AIRTABLE_REQUIREMENTS_TABLE || 'Requirements';

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return { statusCode: 501, body: JSON.stringify({ error: 'Airtable not configured' }) };
    }

    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
    let records = [];
    try {
      records = await base(tableName).select({ pageSize: 100 }).all();
    } catch (e) {
      console.error('Airtable list error (SDK):', e);
      // Fallback to REST API for robustness
      try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?pageSize=100`;
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
        const data = await resp.json();
        if (!resp.ok) {
          const detail = (data && data.error && data.error.message) ? data.error.message : (e.message || String(e));
          return { statusCode: 502, body: JSON.stringify({ error: 'Airtable error', detail }) };
        }
        const items = (data.records || []).map(r => ({
          id: r.id,
          RequirementID: r.fields.RequirementID,
          Title: r.fields.Title,
          Status: r.fields.Status,
          Progress: r.fields.Progress,
          ContactPublic: r.fields.ContactPublic,
          ContactName: r.fields.ContactName,
          ContactPhone: r.fields.ContactPhone,
          ContactCompany: r.fields.ContactCompany,
          ViewPasswordPlain: r.fields.ViewPasswordPlain || '',
          ViewPasswordHash: r.fields.ViewPasswordHash || '',
          AllowOpenQuotes: !!r.fields.AllowOpenQuotes,
        })).filter(x => x.RequirementID);
        return { statusCode: 200, body: JSON.stringify({ items }) };
      } catch (e2) {
        console.error('Airtable list error (REST fallback):', e2);
        return { statusCode: 502, body: JSON.stringify({ error: 'Airtable error', detail: e2.message || String(e2) }) };
      }
    }
    const items = records.map(r => ({
      id: r.id,
      RequirementID: r.fields.RequirementID,
      Title: r.fields.Title,
      Status: r.fields.Status,
      Progress: r.fields.Progress,
      ContactPublic: r.fields.ContactPublic,
      ContactName: r.fields.ContactName,
      ContactPhone: r.fields.ContactPhone,
      ContactCompany: r.fields.ContactCompany,
      ViewPasswordPlain: r.fields.ViewPasswordPlain || '',
      ViewPasswordHash: r.fields.ViewPasswordHash || '',
      AllowOpenQuotes: !!r.fields.AllowOpenQuotes,
    })).filter(x => x.RequirementID);

    return { statusCode: 200, body: JSON.stringify({ items }) };
  } catch (err) {
    console.error('adminListRequirements error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error', detail: err.message || String(err) }) };
  }
};