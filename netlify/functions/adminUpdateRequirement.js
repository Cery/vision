const Airtable = require('airtable');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

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
    const body = JSON.parse(event.body || '{}');
    const requirementID = body.requirementID || '';
    const applyToAll = !!body.applyToAll;
    const newPasswordPlain = (body.newPasswordPlain || '').trim();
    const allowOpenQuotes = (typeof body.allowOpenQuotes === 'boolean') ? body.allowOpenQuotes : undefined;
    const contactPublic = (typeof body.contactPublic === 'boolean') ? body.contactPublic : undefined;

    const buildFields = async () => {
      const fields = {};
      if (newPasswordPlain) {
        fields.ViewPasswordPlain = newPasswordPlain;
        fields.ViewPasswordHash = await bcrypt.hash(newPasswordPlain, 10);
      }
      if (typeof allowOpenQuotes !== 'undefined') {
        fields.AllowOpenQuotes = allowOpenQuotes;
      }
      if (typeof contactPublic !== 'undefined') {
        fields.ContactPublic = contactPublic;
      }
      return fields;
    };

    const fields = await buildFields();
    if (Object.keys(fields).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No updates specified' }) };
    }

    if (applyToAll) {
      const records = await base(tableName).select({ pageSize: 100 }).all();
      for (const r of records) {
        await base(tableName).update([{ id: r.id, fields }]);
      }
      return { statusCode: 200, body: JSON.stringify({ updated: records.length }) };
    } else {
      if (!requirementID) {
        return { statusCode: 400, body: JSON.stringify({ error: 'requirementID is required' }) };
      }
      const found = await base(tableName)
        .select({ filterByFormula: `{RequirementID} = '${requirementID}'`, maxRecords: 1 })
        .all();
      if (!found.length) {
        return { statusCode: 404, body: JSON.stringify({ error: 'Requirement not found' }) };
      }
      await base(tableName).update([{ id: found[0].id, fields }]);
      return { statusCode: 200, body: JSON.stringify({ updated: 1 }) };
    }
  } catch (err) {
    console.error('adminUpdateRequirement error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};