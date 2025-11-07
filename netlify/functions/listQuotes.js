const Airtable = require('airtable');

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_QUOTES_TABLE = 'RequirementQuotes',
} = process.env;

exports.handler = async (event) => {
  try {
    const requirementId = (event.queryStringParameters || {}).RequirementID;
    if (!requirementId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'RequirementID is required' }) };
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
    const records = await base(AIRTABLE_QUOTES_TABLE)
      .select({
        filterByFormula: `{RequirementID} = '${requirementId}'`,
        sort: [{ field: 'CreatedAt', direction: 'desc' }],
      })
      .all();

    const items = records.map((r) => ({ id: r.id, ...r.fields }));
    return { statusCode: 200, body: JSON.stringify({ items }) };
  } catch (err) {
    console.error('listQuotes error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};