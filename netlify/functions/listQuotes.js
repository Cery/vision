exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const requirementID = (qs.RequirementID || qs.requirementID || '').trim();
    const limit = Math.max(1, Math.min(100, parseInt(qs.limit || '50', 10)));
    const offset = (qs.offset || '').trim();

    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
    const quotesTable = process.env.AIRTABLE_QUOTES_TABLE || 'RequirementQuotes';

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      // 无 Airtable 配置时返回空，前端将显示“暂无报价”
      return { statusCode: 200, body: JSON.stringify({ items: [], offsetNext: '' }) };
    }

    const base = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(quotesTable)}`;
    const search = [];
    if (requirementID) search.push(`filterByFormula=${encodeURIComponent(`{RequirementID}='${requirementID}'`)}`);
    search.push(`pageSize=${limit}`);
    if (offset) search.push(`offset=${encodeURIComponent(offset)}`);
    const url = `${base}?${search.join('&')}`;

    const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
    const text = await resp.text();
    let data = {}; try { data = JSON.parse(text); } catch {}
    if (!resp.ok) {
      const detail = (data && data.error && data.error.message) ? data.error.message : `${resp.status}`;
      return { statusCode: resp.status || 502, body: JSON.stringify({ error: 'Airtable error', detail }) };
    }

    const items = (data.records || []).map(r => {
      const f = r.fields || {};
      return {
        QuoteID: f.QuoteID || r.id,
        RequirementID: f.RequirementID,
        SupplierCompanyName: f.SupplierCompanyName,
        SupplierContact: f.SupplierContact,
        SupplierEmail: f.SupplierEmail,
        SupplierPhone: f.SupplierPhone,
        ProductModel: f.ProductModel,
        KeyParams: f.KeyParams,
        DeliveryTime: f.DeliveryTime,
        Price: f.Price,
        QuoteDetail: f.QuoteDetail,
        Status: f.Status || f.QuoteStatus,
        CreatedAt: f.CreatedAt,
        RequirementRef: f.RequirementRef,
        SupplierRef: f.SupplierRef,
      };
    });

    return { statusCode: 200, body: JSON.stringify({ items, offsetNext: data.offset || '' }) };
  } catch (err) {
    console.error('listQuotes error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error', detail: err.message || String(err) }) };
  }
};