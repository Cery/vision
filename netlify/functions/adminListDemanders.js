const { okJson, errJson, requireAdmin, airtableCreds, airtableGet, readJson } = require('./_common');

exports.handler = async function(event){
  const auth = requireAdmin(event);
  if (!auth.ok) return auth.res;
  const { apiKey, baseId, ok } = airtableCreds();
  const q = (event.queryStringParameters||{}).q || '';
  const publicOnly = ((event.queryStringParameters||{}).public||'').toLowerCase() === 'true';
  const limit = parseInt((event.queryStringParameters||{}).limit || '20', 10);
  const offset = (event.queryStringParameters||{}).offset || '';

  try{
    if (ok){
      const table = process.env.AIRTABLE_DEMANDERS_TABLE || 'Demanders';
      let formulaParts = [];
      if (q){
        const esc = q.replace(/"/g,'\\"');
        formulaParts.push(`OR(FIND(LOWER("${esc}"), LOWER({CompanyName})), FIND(LOWER("${esc}"), LOWER({ContactName})), FIND(LOWER("${esc}"), LOWER({Phone})), FIND(LOWER("${esc}"), LOWER({Email})))`);
      }
      if (publicOnly){ formulaParts.push('{ContactPublic}'); }
      const params = { pageSize: Math.min(Math.max(limit,1), 100) };
      if (offset) params.offset = offset;
      if (formulaParts.length){ params.filterByFormula = formulaParts.length>1 ? `AND(${formulaParts.join(',')})` : formulaParts[0]; }
      const data = await airtableGet(baseId, apiKey, table, params);
      const items = (data.records||[]).map(r => ({ id: r.id, ...r.fields }));
      return okJson({ items, offsetNext: data.offset || '' });
    } else {
      const arr = await readJson('data/demanders.json', []);
      let items = Array.isArray(arr) ? arr : [];
      if (q){
        const qq = q.toLowerCase();
        items = items.filter(d => (
          String(d.CompanyName||'').toLowerCase().includes(qq) ||
          String(d.ContactName||'').toLowerCase().includes(qq) ||
          String(d.Phone||'').toLowerCase().includes(qq) ||
          String(d.Email||'').toLowerCase().includes(qq)
        ));
      }
      if (publicOnly){ items = items.filter(d => !!d.ContactPublic); }
      return okJson({ items: items.slice(0, limit), offsetNext: '' });
    }
  }catch(e){
    return errJson(500, 'ListDemandersFailed', e.message);
  }
};