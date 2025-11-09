const fs = require('fs');
const fsp = require('fs/promises');

function okJson(body){
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
function errJson(status, message, detail){
  const payload = { error: message };
  if (detail) payload.detail = detail;
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
}

function getAdminKey(event){
  const hdr = (event.headers||{})['x-admin-key'] || (event.headers||{})['X-Admin-Key'];
  const q = (event.queryStringParameters||{}).adminKey;
  return hdr || q || '';
}
function requireAdmin(event){
  const provided = getAdminKey(event);
  const expected = process.env.ADMIN_KEY || '';
  if (!expected || provided !== expected){
    return { ok:false, res: errJson(401, 'Unauthorized', 'Invalid or missing admin key') };
  }
  return { ok:true };
}

function airtableCreds(){
  const apiKey = process.env.AIRTABLE_KEY || process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN || '';
  const baseId = process.env.AIRTABLE_BASE || process.env.AIRTABLE_BASE_ID || '';
  return { apiKey, baseId, ok: !!(apiKey && baseId) };
}

async function readJson(relPath, defaultVal){
  try{
    const p = require('path').join(process.cwd(), relPath);
    const txt = await fsp.readFile(p, 'utf8');
    return JSON.parse(txt);
  }catch(e){
    if (typeof defaultVal !== 'undefined') return defaultVal;
    throw e;
  }
}
async function writeJson(relPath, obj){
  const p = require('path').join(process.cwd(), relPath);
  await fsp.mkdir(require('path').dirname(p), { recursive: true });
  await fsp.writeFile(p, JSON.stringify(obj, null, 2), 'utf8');
}

function buildAirtableUrl(baseId, table, params){
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
  if (params){ Object.entries(params).forEach(([k,v]) => { if(v!==undefined && v!==null && v!=='') url.searchParams.set(k, String(v)); }); }
  return url.toString();
}
async function airtableGet(baseId, apiKey, table, params){
  const url = buildAirtableUrl(baseId, table, params);
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  const data = await resp.json();
  if (!resp.ok) throw new Error((data.error && data.error.message) || data.error || resp.statusText);
  return data;
}
async function airtableCreate(baseId, apiKey, table, fields){
  const url = buildAirtableUrl(baseId, table);
  const resp = await fetch(url, { method:'POST', headers:{ Authorization: `Bearer ${apiKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ fields }) });
  const data = await resp.json();
  if (!resp.ok) throw new Error((data.error && data.error.message) || data.error || resp.statusText);
  return data;
}
async function airtableUpdate(baseId, apiKey, table, recId, fields){
  const url = buildAirtableUrl(baseId, `${table}/${recId}`);
  const resp = await fetch(url, { method:'PATCH', headers:{ Authorization: `Bearer ${apiKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ fields }) });
  const data = await resp.json();
  if (!resp.ok) throw new Error((data.error && data.error.message) || data.error || resp.statusText);
  return data;
}
async function airtableBatchUpdate(baseId, apiKey, table, records){
  const url = buildAirtableUrl(baseId, table);
  const resp = await fetch(url, { method:'PATCH', headers:{ Authorization: `Bearer ${apiKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ records }) });
  const data = await resp.json();
  if (!resp.ok) throw new Error((data.error && data.error.message) || data.error || resp.statusText);
  return data;
}

module.exports = {
  okJson, errJson, getAdminKey, requireAdmin,
  airtableCreds, airtableGet, airtableCreate, airtableUpdate, airtableBatchUpdate,
  readJson, writeJson
};