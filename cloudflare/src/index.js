// Cloudflare Workers: Requirements Market API
// Provides endpoints for publishing requirements, listing, quotes submission, supplier access, and admin management.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');

    // Basic CORS
    const allowOrigin = origin || '*';
    const baseHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key'
    };
    if (request.method === 'OPTIONS') {
      return new Response('', { headers: baseHeaders });
    }

    // Ensure D1 schema exists (local/dev safety). These are idempotent.
    async function ensureSchema(env) {
      try {
        // Requirements
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS requirements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          requirement_id TEXT UNIQUE,
          title TEXT,
          public_preview TEXT,
          primary_category TEXT,
          secondary_category TEXT,
          status TEXT,
          contact_name TEXT,
          contact_phone TEXT,
          contact_company TEXT,
          contact_email TEXT,
          contact_department TEXT,
          contact_public INTEGER,
          allow_open_quotes INTEGER,
          parameters_json TEXT,
          published_at TEXT,
          budget_range TEXT,
          procurement_plan TEXT,
          progress TEXT,
          view_password_plain TEXT,
          view_password_hash TEXT,
          created_at TEXT,
          updated_at TEXT
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_requirements_reqid ON requirements(requirement_id)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_requirements_phone ON requirements(contact_phone)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_requirements_progress ON requirements(progress)').run();

        // Quotes
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quote_id TEXT UNIQUE,
          requirement_id TEXT,
          supplier_id TEXT,
          supplier_name TEXT,
          supplier_phone TEXT,
          amount REAL,
          currency TEXT,
          remarks TEXT,
          status TEXT,
          created_at TEXT,
          updated_at TEXT,
          FOREIGN KEY (requirement_id) REFERENCES requirements(requirement_id) ON DELETE CASCADE
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_quotes_req ON quotes(requirement_id)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_quotes_supplier ON quotes(supplier_id)').run();

        // Suppliers
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS suppliers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          supplier_id TEXT UNIQUE,
          name TEXT,
          company TEXT,
          access_password_plain TEXT,
          access_password_hash TEXT,
          contact_phone TEXT,
          contact_email TEXT,
          status TEXT,
          metadata_json TEXT,
          created_at TEXT,
          updated_at TEXT
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name)').run();

        // Demanders
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS demanders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          demander_id TEXT UNIQUE,
          name TEXT,
          company TEXT,
          contact_phone TEXT,
          contact_email TEXT,
          department TEXT,
          metadata_json TEXT,
          created_at TEXT,
          updated_at TEXT
        )`).run();

        // System config
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS system_config (
          key TEXT PRIMARY KEY,
          value_json TEXT,
          updated_at TEXT
        )`).run();
      } catch (e) {
        // Best-effort; if schema fails, subsequent queries will surface errors.
      }
    }

    await ensureSchema(env);

    function json(data, status = 200, extra = {}) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...baseHeaders, ...extra }
      });
    }
    async function bodyJSON(req) {
      try { return await req.json(); } catch { return {}; }
    }
    function requireAdmin(req) {
      const key = req.headers.get('X-Admin-Key') || req.headers.get('x-admin-key') || '';
      const expected = env.ADMIN_KEY || env.ADMIN_KEY_SECRET || env.ADMIN_TOKEN || '';
      return Boolean(expected && key === expected);
    }
    function genRequirementID() {
      const d = new Date();
      const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
      const rnd = Math.floor(Math.random() * 9000) + 1000;
      return `REQ-${ymd}-${rnd}`;
    }

    async function fetchJsonSafe(url) {
      try {
        const r = await fetch(url);
        if (!r.ok) return [];
        return await r.json();
      } catch {
        return [];
      }
    }
    function genQuoteID() {
      const d = new Date();
      const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
      const rnd = Math.floor(Math.random() * 900000) + 100000;
      return `Q-${ymd}-${rnd}`;
    }
    function genViewPassword() {
      return String(Math.floor(Math.random() * 900000) + 100000);
    }

    const path = url.pathname;
    const isFn = (p) => path.startsWith(`/.netlify/functions/${p}`);
    const isApi = (p) => path.startsWith(`/api/${p}`);

    // Create Requirement (alias for compatibility)
    if (isApi('requirements') && request.method === 'POST' || isFn('createRequirement') && request.method === 'POST') {
      const data = await bodyJSON(request);
      // Basic validation
      const required = ['contactName', 'contactPhone', 'Title', 'primaryCategory'];
      const missing = required.filter(k => !String(data[k] || '').trim());
      if (missing.length) return json({ error: 'Missing fields', fields: missing }, 400);

      const now = new Date().toISOString();
      const requirement_id = String(data.requirementID || '').trim() || genRequirementID();
      const view_password_plain = String(data.viewPassword || '').trim() || genViewPassword();
      const progress = String(data.Progress || '').trim() || '发布中';
      const status = String(data.Status || '').trim() || '公开';
      const allow_open_quotes = status === '在线报价' ? 1 : (data.AllowOpenQuotes ? 1 : 0);
      const contact_public = data.ContactPublic ? 1 : 0;
      const parameters_json = JSON.stringify(data.Parameters || {});

      const stmt = env.DB.prepare(
        `INSERT INTO requirements (
          requirement_id, title, public_preview, primary_category, secondary_category, status,
          contact_name, contact_phone, contact_company, contact_email, contact_department,
          contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
          progress, view_password_plain, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        requirement_id, data.Title || '', data.PublicPreview || '', data.primaryCategory || '', data.secondaryCategory || '', status,
        data.contactName || '', data.contactPhone || '', data.contactCompany || '', data.contactEmail || '', data.contactDepartment || '',
        contact_public, allow_open_quotes, parameters_json, data.PublishedAt || now, data.BudgetRange || '', data.procurementPlan || '',
        progress, view_password_plain, now, now
      );
      const res = await stmt.run();
      return json({ RequirementID: requirement_id, ViewPassword: view_password_plain });
    }

    // List Requirements
    if (isApi('requirements') && request.method === 'GET' || isFn('listRequirements') && request.method === 'GET') {
      const progress = url.searchParams.get('progress');
      const category = url.searchParams.get('category');
      let q = 'SELECT requirement_id as RequirementID, title as Title, public_preview as PublicPreview, primary_category as PrimaryCategory, secondary_category as SecondaryCategory, status as Status, contact_public as ContactPublic, contact_name as ContactName, contact_phone as ContactPhone, contact_company as ContactCompany, budget_range as BudgetRange, published_at as PublishedAt, progress as Progress, allow_open_quotes as AllowOpenQuotes, parameters_json as Parameters FROM requirements';
      const where = [];
      const binds = [];
      if (progress) { where.push('progress = ?'); binds.push(progress); }
      if (category) { where.push('primary_category = ?'); binds.push(category); }
      if (where.length) q += ' WHERE ' + where.join(' AND ');
      q += ' ORDER BY created_at DESC LIMIT 100';
      const stmt = env.DB.prepare(q).bind(...binds);
      const { results } = await stmt.all();
      const items = (results || []).map(r => ({
        ...r,
        ContactPublic: !!r.ContactPublic,
        AllowOpenQuotes: !!r.AllowOpenQuotes,
        Parameters: (function(){ try { return JSON.parse(r.Parameters); } catch { return {}; } })()
      }));
      return json(items);
    }

    // Requirement Detail
    if (isApi('requirements/') && request.method === 'GET') {
      const id = path.split('/').pop();
      const stmt = env.DB.prepare('SELECT * FROM requirements WHERE requirement_id = ?').bind(id);
      const { results } = await stmt.all();
      if (!results || !results.length) return json({ error: 'NotFound' }, 404);
      const r = results[0];
      const supplierPwd = url.searchParams.get('supplier_access_password') || '';
      const viewPwd = url.searchParams.get('view_password') || '';

      const showSensitive = r.contact_public === 1 || (viewPwd && viewPwd === r.view_password_plain) || await verifySupplierPassword(env, supplierPwd);
      const payload = {
        RequirementID: r.requirement_id,
        Title: r.title,
        PublicPreview: r.public_preview,
        PrimaryCategory: r.primary_category,
        SecondaryCategory: r.secondary_category,
        Status: r.status,
        BudgetRange: r.budget_range,
        PublishedAt: r.published_at,
        Progress: r.progress,
        AllowOpenQuotes: !!r.allow_open_quotes,
        Parameters: parseJSONSafe(r.parameters_json)
      };
      if (showSensitive) {
        payload.ContactName = r.contact_name;
        payload.ContactPhone = r.contact_phone;
        payload.ContactCompany = r.contact_company;
        payload.ContactEmail = r.contact_email;
        payload.ContactDepartment = r.contact_department;
      }
      return json(payload);
    }

    // Submit Quote
    if (isApi('quotes') && request.method === 'POST' || isFn('submitQuote') && request.method === 'POST') {
      const data = await bodyJSON(request);
      const required = ['requirement_id', 'supplier_name', 'amount'];
      const missing = required.filter(k => !String(data[k] || '').trim());
      if (missing.length) return json({ error: 'Missing fields', fields: missing }, 400);
      const now = new Date().toISOString();
      const quote_id = genQuoteID();
      const stmtChk = env.DB.prepare('SELECT 1 FROM requirements WHERE requirement_id = ?').bind(data.requirement_id);
      const { results: chk } = await stmtChk.all();
      if (!chk || !chk.length) return json({ error: 'RequirementNotFound' }, 404);
      const stmt = env.DB.prepare(
        `INSERT INTO quotes (quote_id, requirement_id, supplier_id, supplier_name, supplier_phone, amount, currency, remarks, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        quote_id, data.requirement_id, data.supplier_id || '', data.supplier_name || '', data.supplier_phone || '', Number(data.amount) || 0, data.currency || 'CNY', data.remarks || '', data.status || 'submitted', now, now
      );
      await stmt.run();
      return json({ QuoteID: quote_id });
    }

    // List Quotes
    if (isApi('quotes') && request.method === 'GET' || isFn('listQuotes') && request.method === 'GET') {
      const requirement_id = url.searchParams.get('requirement_id');
      const supplier_id = url.searchParams.get('supplier_id');
      const admin = requireAdmin(request);
      const viewPwd = url.searchParams.get('view_password') || '';
      const supplierPwd = url.searchParams.get('supplier_access_password') || '';

      // Access control: admin OR valid view password OR supplier access password
      let allowed = admin;
      if (!allowed && requirement_id && viewPwd) {
        const stmt = env.DB.prepare('SELECT view_password_plain FROM requirements WHERE requirement_id = ?').bind(requirement_id);
        const { results } = await stmt.all();
        if (results && results[0] && results[0].view_password_plain === viewPwd) allowed = true;
      }
      if (!allowed && supplierPwd) {
        allowed = await verifySupplierPassword(env, supplierPwd);
      }
      if (!allowed) return json({ error: 'Unauthorized' }, 401);

      let q = 'SELECT * FROM quotes';
      const where = [];
      const binds = [];
      if (requirement_id) { where.push('requirement_id = ?'); binds.push(requirement_id); }
      if (supplier_id) { where.push('supplier_id = ?'); binds.push(supplier_id); }
      if (where.length) q += ' WHERE ' + where.join(' AND ');
      q += ' ORDER BY created_at DESC LIMIT 200';
      const stmt = env.DB.prepare(q).bind(...binds);
      const { results } = await stmt.all();
      return json(results || []);
    }

    // Update/Delete Quote (Admin)
    if (isFn('updateQuoteStatus') && request.method === 'POST' || isApi('quotes/') && request.method === 'PATCH') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const idOrPath = data.quoteId || path.split('/').pop();
      const stmt = env.DB.prepare('UPDATE quotes SET status = ?, updated_at = ? WHERE quote_id = ?').bind(data.status || 'updated', new Date().toISOString(), idOrPath);
      await stmt.run();
      return json({ ok: true });
    }
    if (isFn('deleteQuote') && request.method === 'POST' || isApi('quotes/') && request.method === 'DELETE') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const idOrPath = data.quoteId || path.split('/').pop();
      const stmt = env.DB.prepare('DELETE FROM quotes WHERE quote_id = ?').bind(idOrPath);
      await stmt.run();
      return json({ ok: true });
    }

    // Suppliers: verify access
    if (isApi('suppliers/verify') && request.method === 'POST' || isFn('verifyPassword') && request.method === 'POST') {
      const data = await bodyJSON(request);
      const pass = String(data.password || '').trim();
      const ok = await verifySupplierPassword(env, pass);
      return json({ ok });
    }

    // Admin: list/update requirements
    if (isFn('adminListRequirements') && request.method === 'GET' || isApi('admin/requirements') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      // Basic search filters (optional)
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const status = (url.searchParams.get('status') || '').trim();
      const open = url.searchParams.get('open');
      const contact = url.searchParams.get('contact');
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '500', 10) || 500, 1), 500);
      const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
      let sql = 'SELECT * FROM requirements';
      const where = [];
      const binds = [];
      if (status) { where.push('status = ?'); binds.push(status); }
      if (open === 'true') { where.push('allow_open_quotes = 1'); }
      if (open === 'false') { where.push('allow_open_quotes = 0'); }
      if (contact === 'true') { where.push('contact_public = 1'); }
      if (contact === 'false') { where.push('contact_public = 0'); }
      if (where.length) sql += ' WHERE ' + where.join(' AND ');
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      binds.push(limit, offset);
      const { results } = await env.DB.prepare(sql).bind(...binds).all();
      const items = (results || []).filter(r => {
        if (!q) return true;
        const id = String(r.requirement_id || '').toLowerCase();
        const title = String(r.title || '').toLowerCase();
        const company = String(r.contact_company || '').toLowerCase();
        const contactName = String(r.contact_name || '').toLowerCase();
        return id.includes(q) || title.includes(q) || company.includes(q) || contactName.includes(q);
      });
      const offsetNext = items.length === limit ? String(offset + items.length) : '';
      return json({ items, offsetNext });
    }
    if (isFn('adminUpdateRequirement') && request.method === 'POST' || isApi('admin/requirements') && (request.method === 'POST')) {
      // Apply-to-all update
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      if (data.applyToAll) {
        const sets = [];
        const binds = [];
        if (typeof data.allowOpenQuotes === 'boolean') { sets.push('allow_open_quotes = ?'); binds.push(data.allowOpenQuotes ? 1 : 0); }
        if (typeof data.contactPublic === 'boolean') { sets.push('contact_public = ?'); binds.push(data.contactPublic ? 1 : 0); }
        if (data.newPasswordPlain) { sets.push('view_password_plain = ?'); binds.push(String(data.newPasswordPlain)); }
        sets.push('updated_at = ?'); binds.push(new Date().toISOString());
        if (!sets.length) return json({ error: 'NoFields' }, 400);
        const stmt = env.DB.prepare(`UPDATE requirements SET ${sets.join(', ')}`);
        await stmt.bind(...binds).run();
        // D1 doesn't return affected count; best-effort: return ok=true
        return json({ updated: 'all' });
      }
      // If body provides requirementID, update single
      if (data.requirementID) {
        const fields = ['title','public_preview','primary_category','secondary_category','status','contact_name','contact_phone','contact_company','contact_email','contact_department','contact_public','allow_open_quotes','parameters_json','published_at','budget_range','procurement_plan','progress','view_password_plain'];
        const sets = [];
        const binds = [];
        for (const f of fields) {
          if (f in data) { sets.push(`${f} = ?`); binds.push(f === 'parameters_json' ? JSON.stringify(data[f]) : data[f]); }
        }
        sets.push('updated_at = ?'); binds.push(new Date().toISOString());
        if (!sets.length) return json({ error: 'NoFields' }, 400);
        const stmt = env.DB.prepare(`UPDATE requirements SET ${sets.join(', ')} WHERE requirement_id = ?`).bind(...binds, String(data.requirementID));
        await stmt.run();
        return json({ ok: true });
      }
      return json({ error: 'InvalidRequest' }, 400);
    }
    if (isApi('admin/requirements/') && request.method === 'PATCH') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      const data = await bodyJSON(request);
      const fields = ['title','public_preview','primary_category','secondary_category','status','contact_name','contact_phone','contact_company','contact_email','contact_department','contact_public','allow_open_quotes','parameters_json','published_at','budget_range','procurement_plan','progress','view_password_plain'];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) { sets.push(`${f} = ?`); binds.push(f === 'parameters_json' ? JSON.stringify(data[f]) : data[f]); }
      }
      sets.push('updated_at = ?'); binds.push(new Date().toISOString());
      if (!sets.length) return json({ error: 'NoFields' }, 400);
      const stmt = env.DB.prepare(`UPDATE requirements SET ${sets.join(', ')} WHERE requirement_id = ?`).bind(...binds, id);
      await stmt.run();
      return json({ ok: true });
    }

    // Admin: list/update suppliers
    if (isFn('adminListSuppliers') && request.method === 'GET' || isApi('admin/suppliers') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const { results } = await env.DB.prepare('SELECT * FROM suppliers ORDER BY created_at DESC LIMIT 500').all();
      return json(results || []);
    }
    if (isFn('adminUpdateSupplier') && request.method === 'POST' || isApi('admin/suppliers/') && request.method === 'PATCH') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const id = data.id || path.split('/').pop();
      const fields = ['name','company','access_password_plain','contact_phone','contact_email','status','metadata_json'];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) { sets.push(`${f} = ?`); binds.push(f === 'metadata_json' ? JSON.stringify(data[f]) : data[f]); }
      }
      sets.push('updated_at = ?'); binds.push(new Date().toISOString());
      if (!sets.length) return json({ error: 'NoFields' }, 400);
      const stmt = env.DB.prepare(`UPDATE suppliers SET ${sets.join(', ')} WHERE supplier_id = ?`).bind(...binds, id);
      await stmt.run();
      return json({ ok: true });
    }

    // Admin: list/update demanders (optional)
    if (isFn('adminListDemanders') && request.method === 'GET' || isApi('admin/demanders') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const { results } = await env.DB.prepare('SELECT * FROM demanders ORDER BY created_at DESC LIMIT 500').all();
      return json(results || []);
    }
    if (isFn('adminUpdateDemander') && request.method === 'POST' || isApi('admin/demanders/') && request.method === 'PATCH') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const id = data.id || path.split('/').pop();
      const fields = ['name','company','contact_phone','contact_email','department','metadata_json'];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) { sets.push(`${f} = ?`); binds.push(f === 'metadata_json' ? JSON.stringify(data[f]) : data[f]); }
      }
      sets.push('updated_at = ?'); binds.push(new Date().toISOString());
      if (!sets.length) return json({ error: 'NoFields' }, 400);
      const stmt = env.DB.prepare(`UPDATE demanders SET ${sets.join(', ')} WHERE demander_id = ?`).bind(...binds, id);
      await stmt.run();
      return json({ ok: true });
    }

    // Admin: system config
    if (isApi('admin/system-config') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const { results } = await env.DB.prepare('SELECT value_json FROM system_config WHERE key = ?').bind('default').all();
      const config = (results && results[0] && parseJSONSafe(results[0].value_json)) || {};
      return json({ config });
    }
    if (isApi('admin/system-config') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const now = new Date().toISOString();
      const value = JSON.stringify(data || {});
      await env.DB.prepare('INSERT INTO system_config (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?')
        .bind('default', value, now, value, now).run();
      return json({ ok: true });
    }

    // Admin: dev seed from static JSON files (local development helper)
    if (isApi('admin/dev-seed') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const base = url.searchParams.get('base') || 'http://127.0.0.1:5500/data';
      const reqs = await fetchJsonSafe(`${base}/requirements.json`);
      const sups = await fetchJsonSafe(`${base}/suppliers.json`);
      const dems = await fetchJsonSafe(`${base}/demanders.json`);

      const now = new Date().toISOString();
      // Seed requirements
      for (const r of (reqs || [])) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO requirements (
            requirement_id, title, public_preview, primary_category, secondary_category, status,
            contact_name, contact_phone, contact_company, contact_email, contact_department,
            contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
            progress, view_password_plain, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(
            r.RequirementID || '', r.Title || '', r.PublicPreview || '', r.PrimaryCategory || '', r.SecondaryCategory || '', r.Status || '',
            r.ContactName || '', r.ContactPhone || '', r.ContactCompany || '', r.ContactEmail || '', r.ContactDepartment || '',
            r.ContactPublic ? 1 : 0, r.AllowOpenQuotes ? 1 : 0, JSON.stringify(r.Parameters || {}), r.PublishedAt || now, r.BudgetRange || '', r.procurementPlan || '',
            r.Progress || '', r.ViewPasswordPlain || '', r.created_at || now, r.updated_at || now
          ).run();
        } catch {}
      }

      // Seed suppliers
      for (const s of (sups || [])) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO suppliers (
            supplier_id, name, company, access_password_plain, contact_phone, contact_email, status, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(
            s.SupplierID || s.supplier_id || '', s.Name || s.name || '', s.Company || s.company || '', s.AccessPassword || s.access_password_plain || '',
            s.ContactPhone || s.contact_phone || '', s.ContactEmail || s.contact_email || '', s.Status || s.status || '', JSON.stringify(s.metadata || s.metadata_json || {}),
            s.created_at || now, s.updated_at || now
          ).run();
        } catch {}
      }

      // Seed demanders
      for (const d of (dems || [])) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO demanders (
            demander_id, name, company, contact_phone, contact_email, department, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(
            d.demander_id || d.DemanderID || '', d.name || d.Name || '', d.company || d.Company || '', d.contact_phone || d.ContactPhone || '', d.contact_email || d.ContactEmail || '',
            d.department || d.Department || '', JSON.stringify(d.metadata || {}), d.created_at || now, d.updated_at || now
          ).run();
        } catch {}
      }

      return json({ ok: true, counts: { requirements: (reqs||[]).length, suppliers: (sups||[]).length, demanders: (dems||[]).length } });
    }

    return json({ error: 'NotFound' }, 404);

    function parseJSONSafe(s) { try { return JSON.parse(s || '{}'); } catch { return {}; } }
    async function verifySupplierPassword(env, pass) {
      if (!pass) return false;
      const stmt = env.DB.prepare('SELECT 1 FROM suppliers WHERE access_password_plain = ? AND (status IS NULL OR status != "disabled")').bind(pass);
      const { results } = await stmt.all();
      return Boolean(results && results.length);
    }
  }
};