const { okJson, errJson, requireAdmin, airtableCreds, airtableGet, readJson } = require('./_common');

exports.handler = async function(event){
  const auth = requireAdmin(event);
  if (!auth.ok) return auth.res;
  const { apiKey, baseId, ok } = airtableCreds();
  const qs = event.queryStringParameters||{};
  const q = qs.q || '';
  const status = qs.status || '';
  const open = qs.open || '';
  const contact = qs.contact || '';
  const limit = parseInt(qs.limit||'20', 10);
  const offset = qs.offset || '';
  try{
    if (ok){
      const table = process.env.AIRTABLE_REQUIREMENTS_TABLE || 'Requirements';
      const filters = [];
      if (q){
        const esc = q.replace(/"/g,'\\"');
        filters.push(`OR(FIND(LOWER("${esc}"), LOWER({RequirementID})), FIND(LOWER("${esc}"), LOWER({Title})))`);
      }
      if (status){ filters.push(`{Status} = "${status.replace(/"/g,'\\"')}"`); }
      if (open){ filters.push(open === 'true' ? '{AllowOpenQuotes}' : 'NOT({AllowOpenQuotes})'); }
      if (contact){ filters.push(contact === 'true' ? '{ContactPublic}' : 'NOT({ContactPublic})'); }
      const params = { pageSize: Math.min(Math.max(limit,1), 100) };
      if (offset) params.offset = offset;
      if (filters.length){ params.filterByFormula = filters.length>1 ? `AND(${filters.join(',')})` : filters[0]; }
      try{
        const data = await airtableGet(baseId, apiKey, table, params);
        const items = (data.records||[]).map(r => ({ id: r.id, ...r.fields }));
        return okJson({ items, offsetNext: data.offset || '' });
      }catch(e){
        const msg = String(e && e.message || '');
        // Graceful fallback when table or base not found
        if (msg.includes('NOT_FOUND') || msg.includes('could not find') || msg.includes('Unknown')){
          const arr = await readJson('data/requirements.json', []);
          let items = Array.isArray(arr) ? arr : [];
          if (q){ const qq = q.toLowerCase(); items = items.filter(it => (String(it.RequirementID||'').toLowerCase().includes(qq) || String(it.Title||'').toLowerCase().includes(qq))); }
          if (status){ items = items.filter(it => String(it.Status||'') === status); }
          if (open){ const b = (open==='true'); items = items.filter(it => !!it.AllowOpenQuotes === b); }
          if (contact){ const b = (contact==='true'); items = items.filter(it => !!it.ContactPublic === b); }
          return okJson({ items: items.slice(0, limit), offsetNext: '' });
        }
        // Other errors propagate
        throw e;
      }
    } else {
      const arr = await readJson('data/requirements.json', []);
      let items = Array.isArray(arr) ? arr : [];
      if (q){ const qq = q.toLowerCase(); items = items.filter(it => (String(it.RequirementID||'').toLowerCase().includes(qq) || String(it.Title||'').toLowerCase().includes(qq))); }
      if (status){ items = items.filter(it => String(it.Status||'') === status); }
      if (open){ const b = (open==='true'); items = items.filter(it => !!it.AllowOpenQuotes === b); }
      if (contact){ const b = (contact==='true'); items = items.filter(it => !!it.ContactPublic === b); }
      return okJson({ items: items.slice(0, limit), offsetNext: '' });
    }
  }catch(e){
    return errJson(500, 'ListRequirementsFailed', e.message);
  }
};