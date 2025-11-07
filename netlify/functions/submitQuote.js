const Airtable = require('airtable');
const { isRateLimited, validate } = require('./security');

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_REQUIREMENTS_TABLE = 'Requirements',
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
      return { statusCode: 404, body: JSON.stringify({ error: 'Requirement not found' }) };
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

    return { statusCode: 200, body: JSON.stringify({ id: created.id }) };
  } catch (err) {
    console.error('submitQuote error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};