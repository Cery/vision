const { okJson, errJson, requireAdmin, airtableCreds, airtableGet, readJson } = require('./_common');

exports.handler = async function(event){
  const auth = requireAdmin(event);
  if (!auth.ok) return auth.res;
  const { apiKey, baseId, ok } = airtableCreds();
  try{
    if (ok){
      const table = process.env.AIRTABLE_SYSTEM_TABLE || 'SystemConfig';
      const data = await airtableGet(baseId, apiKey, table, { pageSize: 1, maxRecords: 1 });
      const rec = (data.records||[])[0];
      const cfg = rec ? (rec.fields||{}) : {};
      return okJson({ config: cfg, id: rec ? rec.id : '' });
    }else{
      const cfg = await readJson('data/system-config.json', {});
      return okJson({ config: cfg });
    }
  }catch(e){
    return errJson(500, 'GetSystemConfigFailed', e.message);
  }
};