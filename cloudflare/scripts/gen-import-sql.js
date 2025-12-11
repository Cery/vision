// Generate D1 import SQL from existing JSON files in /data
// Usage: node cloudflare/scripts/gen-import-sql.js

// This script writes UTF-8 content directly to cloudflare/import.sql to avoid
// Windows shell redirection encoding issues.

const fs = require('fs');
const path = require('path');

function escape(v){
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function loadJson(rel){
  try{ return JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), 'utf8')); } catch(e){ return []; }
}

function run(){
  let reqs = loadJson('data/markets.json');
  if (!Array.isArray(reqs) || !reqs.length) reqs = loadJson('data/requirements.json');
  const sups = loadJson('data/suppliers.json');
  let out = '';
  out += '-- Import Requirements\n';
  for (const r of reqs){
    const now = new Date().toISOString();
    const sql = `INSERT OR IGNORE INTO requirements (
      requirement_id, title, public_preview, primary_category, secondary_category, status,
      contact_name, contact_phone, contact_company, contact_email, contact_department,
      contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
      progress, view_password_plain, created_at, updated_at
    ) VALUES (
      ${escape(r.RequirementID)}, ${escape(r.Title)}, ${escape(r.PublicPreview)}, ${escape(r.PrimaryCategory)}, ${escape(r.SecondaryCategory)}, ${escape(r.Status)},
      ${escape(r.ContactName)}, ${escape(r.ContactPhone)}, ${escape(r.ContactCompany)}, ${escape(r.ContactEmail)}, ${escape(r.ContactDepartment)},
      ${r.ContactPublic?1:0}, ${r.AllowOpenQuotes?1:0}, ${escape(JSON.stringify(r.Parameters||{}))}, ${escape(r.PublishedAt)}, ${escape(r.BudgetRange)}, ${escape(r.procurementPlan||'')},
      ${escape(r.Progress)}, ${escape(r.ViewPasswordPlain||'')}, ${escape(r.created_at||now)}, ${escape(r.updated_at||now)}
    );`;
    out += sql + '\n';
  }

  out += '\n-- Import Suppliers\n';
  for (const s of sups){
    const now = new Date().toISOString();
    const sql = `INSERT OR IGNORE INTO suppliers (
      supplier_id, name, company, access_password_plain, contact_phone, contact_email, status, metadata_json, created_at, updated_at
    ) VALUES (
      ${escape(s.SupplierID||s.supplier_id||'')}, ${escape(s.Name||s.name||'')}, ${escape(s.Company||s.company||'')}, ${escape(s.AccessPassword||s.access_password_plain||'')}, ${escape(s.ContactPhone||s.contact_phone||'')}, ${escape(s.ContactEmail||s.contact_email||'')}, ${escape(s.Status||s.status||'')}, ${escape(JSON.stringify(s.Meta||s.metadata_json||{}))}, ${escape(now)}, ${escape(now)}
    );`;
    out += sql + '\n';
  }

  const target = path.join(process.cwd(), 'cloudflare', 'import.sql');
  fs.writeFileSync(target, out, 'utf8');
}

run();
