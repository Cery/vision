const { okJson, errJson, requireAdmin, airtableCreds, airtableCreate, airtableUpdate, readJson, writeJson } = require('./_common');
const crypto = require('crypto');

exports.handler = async function(event){
  const auth = requireAdmin(event);
  if (!auth.ok) return auth.res;
  if ((event.httpMethod||'').toUpperCase() !== 'POST'){
    return errJson(405, 'MethodNotAllowed');
  }
  let payload = {};
  try{ payload = JSON.parse(event.body||'{}'); }catch{ payload = {}; }
  const { id, CompanyName, Title, ContactName, Phone, Email, Website, ContactPublic, Password } = payload;
  const fields = {
    CompanyName: CompanyName || Title || '',
    Title: Title || CompanyName || '',
    ContactName: ContactName || '',
    Phone: Phone || '',
    Email: Email || '',
    Website: Website || '',
    ContactPublic: !!ContactPublic,
  };
  if (Password){
    fields.Password = Password;
    try{ fields.PasswordHash = crypto.createHash('sha256').update(String(Password)).digest('hex'); }catch{}
  }

  const { apiKey, baseId, ok } = airtableCreds();
  try{
    if (ok){
      const table = process.env.AIRTABLE_SUPPLIERS_TABLE || 'Suppliers';
      let rec;
      if (id){ rec = await airtableUpdate(baseId, apiKey, table, id, fields); }
      else { rec = await airtableCreate(baseId, apiKey, table, fields); }
      return okJson({ id: rec.id, fields: rec.fields||fields });
    } else {
      const list = await readJson('data/suppliers.json', []);
      let foundIdx = list.findIndex(x => String(x.id||'') === String(id||''));
      if (foundIdx < 0){ foundIdx = list.findIndex(x => String(x.CompanyName||'') === String(fields.CompanyName)); }
      if (foundIdx >= 0){
        list[foundIdx] = { ...list[foundIdx], ...fields, id: list[foundIdx].id || String(Date.now()) };
      } else {
        list.push({ id: String(Date.now()), ...fields });
      }
      await writeJson('data/suppliers.json', list);
      const rec = list[foundIdx >= 0 ? foundIdx : (list.length - 1)];
      return okJson({ id: rec.id, fields: rec });
    }
  }catch(e){
    return errJson(500, 'UpdateSupplierFailed', e.message);
  }
};