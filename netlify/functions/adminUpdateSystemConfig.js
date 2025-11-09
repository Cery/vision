const { okJson, errJson, requireAdmin, airtableCreds, airtableGet, airtableCreate, airtableUpdate, readJson, writeJson } = require('./_common');

exports.handler = async function(event){
  const auth = requireAdmin(event);
  if (!auth.ok) return auth.res;
  if ((event.httpMethod||'').toUpperCase() !== 'POST'){
    return errJson(405, 'MethodNotAllowed');
  }
  let payload = {};
  try{ payload = JSON.parse(event.body||'{}'); }catch{ payload = {}; }
  const fields = {
    SupplierGlobalPassword: payload.SupplierGlobalPassword || '',
    DefaultExportFormat: payload.DefaultExportFormat || 'csv',
    DefaultMaskedFilter: !!payload.DefaultMaskedFilter,
    NotifyEmailEnabled: !!payload.NotifyEmailEnabled,
    NotifySmsEnabled: !!payload.NotifySmsEnabled
  };
  const { apiKey, baseId, ok } = airtableCreds();
  try{
    if (ok){
      const table = process.env.AIRTABLE_SYSTEM_TABLE || 'SystemConfig';
      // Find first record; if none, create one
      let recId = '';
      try{
        const data = await airtableGet(baseId, apiKey, table, { pageSize: 1, maxRecords: 1 });
        recId = (data.records||[])[0]?.id || '';
      }catch{}
      let result;
      if (recId) result = await airtableUpdate(baseId, apiKey, table, recId, fields);
      else result = await airtableCreate(baseId, apiKey, table, fields);
      return okJson({ id: result.id, fields: result.fields||fields });
    } else {
      await writeJson('data/system-config.json', fields);
      return okJson({ fields });
    }
  }catch(e){
    return errJson(500, 'UpdateSystemConfigFailed', e.message);
  }
};