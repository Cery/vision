const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

// Support both naming conventions to avoid local 501 due to env name mismatch
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
const AIRTABLE_QUOTES_TABLE = process.env.AIRTABLE_QUOTES_TABLE || 'RequirementQuotes';

exports.handler = async (event) => {
  try {
    const requirementId = (event.queryStringParameters || {}).RequirementID;
    if (!requirementId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'RequirementID is required' }) };
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      // Local fallback: try docs/quotes.csv or root RequirementQuotes.csv
      try {
        const candidates = [
          path.join(process.cwd(), 'docs', 'quotes.csv'),
          path.join(process.cwd(), 'RequirementQuotes.csv'),
        ];
        const filePath = candidates.find((p) => fs.existsSync(p));
        if (!filePath) {
          return { statusCode: 200, body: JSON.stringify({ items: [] }) };
        }

        const raw = fs.readFileSync(filePath, 'utf-8');

        // Minimal CSV parser supporting quoted fields
        const lines = raw.trim().split(/\r?\n/);
        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const cols = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
            } else if (ch === ',' && !inQuotes) {
              cols.push(cur);
              cur = '';
            } else {
              cur += ch;
            }
          }
          cols.push(cur);
          const obj = {};
          headers.forEach((h, idx) => { obj[h] = (cols[idx] || '').trim(); });
          return obj;
        });

        const items = rows
          .filter((r) => (r.RequirementID || r.Requirement) === requirementId)
          .map((r, idx) => ({
            id: r.QuoteID || `LOCAL-${idx + 1}`,
            RequirementID: r.RequirementID || r.Requirement || requirementId,
            SupplierCompanyName: r.SupplierCompanyName || r.SupplierName || '',
            SupplierContact: r.SupplierContact || '',
            SupplierPhone: r.SupplierPhone || '',
            SupplierEmail: r.SupplierEmail || '',
            ProductModel: r.ProductModel || '',
            KeyParams: r.KeyParams || r.Parameters || '',
            DeliveryTime: r.DeliveryTime || '',
            Price: Number(r.Price || r.QuoteAmount || 0),
            QuoteDetail: r.QuoteDetail || r.Note || '',
            Status: r.Status || '接洽中',
          }));

        return { statusCode: 200, body: JSON.stringify({ items }) };
      } catch (e) {
        console.error('Local quotes fallback failed:', e.message);
        return { statusCode: 200, body: JSON.stringify({ items: [] }) };
      }
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