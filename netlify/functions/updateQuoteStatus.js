const Airtable = require('airtable');
const { isRateLimited, validateStatusUpdate } = require('./security');

// Support both naming conventions: *_API_KEY/*_BASE_ID and *_KEY/*_BASE
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
const AIRTABLE_QUOTES_TABLE = process.env.AIRTABLE_QUOTES_TABLE || 'RequirementQuotes';

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
    const errors = validateStatusUpdate(data);

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

    const updated = await base(AIRTABLE_QUOTES_TABLE).update(data.quoteId, {
      Status: data.status,
    });

    return { statusCode: 200, body: JSON.stringify({ id: updated.id }) };
  } catch (err) {
    console.error('updateQuoteStatus error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};