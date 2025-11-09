const { okJson, errJson, requireAdmin, airtableCreds, airtableGet, airtableUpdate, airtableBatchUpdate, readJson, writeJson } = require('./_common');
const crypto = require('crypto');

exports.handler = async function(event){
  const auth = requireAdmin(event);
  if (!auth.ok) return auth.res;
  if ((event.httpMethod||'').toUpperCase() !== 'POST'){
    return errJson(405, 'MethodNotAllowed');
  }
  let payload = {};
  try{ payload = JSON.parse(event.body||'{}'); }catch{ payload = {}; }
  const { requirementID, applyToAll, newPasswordPlain, allowOpenQuotes, contactPublic } = payload;
  const fields = {};
  if (typeof allowOpenQuotes !== 'undefined') fields.AllowOpenQuotes = !!allowOpenQuotes;
  if (typeof contactPublic !== 'undefined') fields.ContactPublic = !!contactPublic;
  if (newPasswordPlain){
    fields.ViewPasswordPlain = newPasswordPlain;
    try{ fields.ViewPasswordHash = crypto.createHash('sha256').update(String(newPasswordPlain)).digest('hex'); }catch{}
  }
  const { apiKey, baseId, ok } = airtableCreds();
  try{
    if (ok){
      const table = process.env.AIRTABLE_REQUIREMENTS_TABLE || 'Requirements';
      if (applyToAll){
        // Fetch a page of records, then batch update
        const data = await airtableGet(baseId, apiKey, table, { pageSize: 50 });
        const records = (data.records||[]).map(r => ({ id: r.id, fields }));
        const result = await airtableBatchUpdate(baseId, apiKey, table, records);
        return okJson({ updated: (result.records||[]).length });
      } else if (requirementID){
        // Find record by RequirementID, then update
        const esc = String(requirementID).replace(/"/g,'\\"');
        const data = await airtableGet(baseId, apiKey, table, { pageSize: 1, maxRecords: 1, filterByFormula: `{RequirementID} = "${esc}"` });
        const rec = (data.records||[])[0];
        if (!rec) return errJson(404, 'RequirementNotFound');
        const result = await airtableUpdate(baseId, apiKey, table, rec.id, fields);
        return okJson({ id: result.id, fields: result.fields||fields });
      } else {
        return errJson(400, 'BadRequest', 'Missing requirementID or applyToAll');
      }
    } else {
      const list = await readJson('data/requirements.json', []);
      let updatedCount = 0;
      if (applyToAll){
        const newList = list.map(it => ({ ...it, ...fields }));
        updatedCount = newList.length;
        await writeJson('data/requirements.json', newList);
        return okJson({ updated: updatedCount });
      } else if (requirementID){
        const idx = list.findIndex(x => String(x.RequirementID||'') === String(requirementID));
        if (idx < 0) return errJson(404, 'RequirementNotFound');
        list[idx] = { ...list[idx], ...fields };
        await writeJson('data/requirements.json', list);
        return okJson({ id: list[idx].RequirementID, fields: list[idx] });
      } else {
        return errJson(400, 'BadRequest', 'Missing requirementID or applyToAll');
      }
    }
  }catch(e){
    return errJson(500, 'UpdateRequirementFailed', e.message);
  }
};