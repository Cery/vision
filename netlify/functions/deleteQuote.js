const Airtable = require('airtable');
const { isRateLimited, validateDelete } = require('./security');

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_QUOTES_TABLE = 'RequirementQuotes',
} = process.env;

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
    const errors = validateDelete(data);

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

    const deleted = await base(AIRTABLE_QUOTES_TABLE).destroy(data.quoteId);

    return { statusCode: 200, body: JSON.stringify({ id: deleted.id }) };
  } catch (err) {
    console.error('deleteQuote error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};