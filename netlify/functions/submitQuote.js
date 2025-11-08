const Airtable = require('airtable');
const bcrypt = require('bcryptjs');
const { isRateLimited, validate } = require('./security');

// Support both naming conventions for Airtable env vars
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
const AIRTABLE_REQUIREMENTS_TABLE = process.env.AIRTABLE_REQUIREMENTS_TABLE || 'Requirements';
const AIRTABLE_QUOTES_TABLE = process.env.AIRTABLE_QUOTES_TABLE || 'RequirementQuotes';
const REQUIRE_QUOTE_PASSWORD = (process.env.REQUIRE_QUOTE_PASSWORD || 'false') === 'true';

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const ip = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'];
    if (isRateLimited(ip)) {
      return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) };
    }

    const data = JSON.parse(event.body || '{}');
    const errors = validate(data);

    if (Object.keys(errors).length > 0) {
      return { statusCode: 400, body: JSON.stringify({ errors }) };
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return {
        statusCode: 501,
        body: JSON.stringify({
          error: 'Airtable is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.',
        }),
      };
    }

    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

    // Verify requirement exists
    const reqRecords = await base(AIRTABLE_REQUIREMENTS_TABLE)
      .select({ filterByFormula: `{RequirementID} = '${data.RequirementID}'`, maxRecords: 1 })
      .all();
    if (reqRecords.length === 0) {
      try {
        const { logEvent } = require('./_audit');
        const ip = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'];
        logEvent({ eventType: 'submit_quote_requirement_missing', requirementID: data.RequirementID, ip, meta: {} });
      } catch {}
      return { statusCode: 404, body: JSON.stringify({ error: 'Requirement not found' }) };
    }

    // Optionally require correct view password to submit quotes (unless open quotes enabled)
    const allowOpenQuotes = !!reqRecords[0]?.fields?.AllowOpenQuotes;
    if (REQUIRE_QUOTE_PASSWORD && !allowOpenQuotes) {
      const viewPw = (data.ViewPassword || '').trim();
      const storedHash = reqRecords[0]?.fields?.ViewPasswordHash || '';
      if (!viewPw || !storedHash) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Password required' }) };
      }
      const ok = await bcrypt.compare(viewPw, storedHash);
      if (!ok) {
        try {
          const { logEvent } = require('./_audit');
          const ip = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'];
          logEvent({ eventType: 'submit_quote_invalid_password', requirementID: data.RequirementID, ip, meta: {} });
        } catch {}
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid password' }) };
      }
    }

    // 同时写入文本字段 RequirementID（便于按编号筛选）与链接字段 RequirementRef（链接到需求表记录）
    const created = await base(AIRTABLE_QUOTES_TABLE).create({
      RequirementID: data.RequirementID,
      RequirementRef: [reqRecords[0].id],
      SupplierCompanyName: data.SupplierCompanyName,
      SupplierContact: data.SupplierContact,
      SupplierEmail: data.SupplierEmail,
      SupplierPhone: data.SupplierPhone,
      ProductModel: data.ProductModel,
      KeyParams: data.KeyParams,
      DeliveryTime: data.DeliveryTime,
      Price: Number(data.Price),
      QuoteDetail: data.QuoteDetail,
      Status: '接洽中',
    });

    try {
      const { logEvent } = require('./_audit');
      const ip = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'];
      logEvent({ eventType: 'submit_quote_success', requirementID: data.RequirementID, ip, meta: { quoteId: created.id } });
    } catch {}
    return { statusCode: 200, body: JSON.stringify({ id: created.id }) };
  } catch (err) {
    console.error('submitQuote error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};