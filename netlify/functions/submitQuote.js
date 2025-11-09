const Airtable = require('airtable');
const bcrypt = require('bcryptjs');
const { isRateLimited, validate } = require('./security');

// Support both naming conventions for Airtable env vars
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
const AIRTABLE_REQUIREMENTS_TABLE = process.env.AIRTABLE_REQUIREMENTS_TABLE || 'Requirements';
const AIRTABLE_QUOTES_TABLE = process.env.AIRTABLE_QUOTES_TABLE || 'RequirementQuotes';
const REQUIRE_QUOTE_PASSWORD_ENV = (process.env.REQUIRE_QUOTE_PASSWORD || 'false') === 'true';
const AIRTABLE_SYSTEM_TABLE = process.env.AIRTABLE_SYSTEM_TABLE || 'SystemConfig';
const SUPPLIER_GLOBAL_PASSWORD_HASH = process.env.SUPPLIER_GLOBAL_PASSWORD_HASH || '';
const SUPPLIER_GLOBAL_PASSWORD = process.env.SUPPLIER_GLOBAL_PASSWORD || '';

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

    // Determine whether password is required for quotes
    let REQUIRE_QUOTE_PASSWORD = REQUIRE_QUOTE_PASSWORD_ENV;
    if (!REQUIRE_QUOTE_PASSWORD_ENV) {
      try {
        const sys = await base(AIRTABLE_SYSTEM_TABLE).select({
          filterByFormula: `{Key}='RequireQuotePasswordEnabled'`, maxRecords: 1
        }).all();
        const v = sys[0]?.fields?.Value;
        if (typeof v !== 'undefined') REQUIRE_QUOTE_PASSWORD = !!v;
      } catch (_) {}
    }

    // Optionally require correct view password to submit quotes (unless open quotes enabled)
    const allowOpenQuotes = !!reqRecords[0]?.fields?.AllowOpenQuotes;
    if (REQUIRE_QUOTE_PASSWORD && !allowOpenQuotes) {
      const viewPw = (data.ViewPassword || '').trim();
      const storedHash = reqRecords[0]?.fields?.ViewPasswordHash || '';
      if (!viewPw) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Password required' }) };
      }
      let ok = false;
      if (storedHash) {
        try { ok = await bcrypt.compare(viewPw, storedHash); } catch (_) {}
      }
      if (!ok) {
        if (SUPPLIER_GLOBAL_PASSWORD_HASH) {
          try { ok = await bcrypt.compare(viewPw, SUPPLIER_GLOBAL_PASSWORD_HASH); } catch (_) {}
        } else if (SUPPLIER_GLOBAL_PASSWORD) {
          ok = SUPPLIER_GLOBAL_PASSWORD === viewPw;
        }
        if (!ok) {
          // Try SystemConfig for supplier global password
          try {
            const sysPw = await base(AIRTABLE_SYSTEM_TABLE).select({
              filterByFormula: `OR({Key}='SupplierGlobalPasswordHash',{Key}='SupplierGlobalPasswordPlain')`,
              maxRecords: 2
            }).all();
            let gHash = '', gPlain = '';
            sysPw.forEach(r => {
              const k = r.fields.Key; const v = r.fields.Value;
              if (k === 'SupplierGlobalPasswordHash') gHash = v || '';
              if (k === 'SupplierGlobalPasswordPlain') gPlain = v || '';
            });
            if (gHash) { try { ok = await bcrypt.compare(viewPw, gHash); } catch (_) {} }
            else if (gPlain) { ok = gPlain === viewPw; }
          } catch (_) {}
        }
      }
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