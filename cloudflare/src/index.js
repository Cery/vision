// Cloudflare Workers: Requirements Market API
// Provides endpoints for publishing requirements, listing, quotes submission, supplier access, and admin management.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');

    // Basic CORS with whitelist: allow visndt domains and local dev
    const allowedOrigins = new Set([
      // Online API domains
      'https://visndt.com',
      'https://www.visndt.com',
      'https://api.visndt.com',
      // Local Hugo & dev servers
      'http://localhost:1313', 'http://127.0.0.1:1313',
      'http://localhost:8888', 'http://127.0.0.1:8888',
      'http://localhost:8000', 'http://127.0.0.1:8000',
      'http://localhost:1314', 'http://127.0.0.1:1314'
    ]);
    const allowOrigin = (origin && allowedOrigins.has(origin)) ? origin : 'https://visndt.com';
    const baseHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
      'Vary': 'Origin'
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
          approved INTEGER,
          approved_at TEXT,
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
        // Lightweight migrations: add columns if missing
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN approved INTEGER').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN approved_at TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN quote_password TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN view_password TEXT').run(); } catch {}

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

        // Products
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id TEXT UNIQUE,
          supplier_id TEXT,
          name TEXT,
          model TEXT,
          series TEXT,
          primary_category TEXT,
          summary TEXT,
          parameters_json TEXT,
          created_at TEXT,
          updated_at TEXT,
          FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id)').run();

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

    // Admin: verify via header token (GET/POST) or body password (POST only)
    if (isApi('admin/verify') && (request.method === 'POST' || request.method === 'GET')) {
      const headerOk = requireAdmin(request);
      let passwordOk = false;
      if (request.method === 'POST') {
        const data = await bodyJSON(request);
        const pass = String(data.password || '').trim();
        const envPass = String(env.ADMIN_PASSWORD || env.ADMIN_PASS || env.ADMIN_SECRET || '');
        passwordOk = Boolean(envPass && pass && pass === envPass);
      }
      if (headerOk || passwordOk) {
        return json({ ok: true });
      }
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }

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
          requirement_id, title, public_preview, primary_category, secondary_category, approved, approved_at, status,
          contact_name, contact_phone, contact_company, contact_email, contact_department,
          contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
          progress, view_password_plain, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        requirement_id, data.Title || '', data.PublicPreview || '', data.primaryCategory || '', data.secondaryCategory || '', 0, '', status,
        data.contactName || '', data.contactPhone || '', data.contactCompany || '', data.contactEmail || '', data.contactDepartment || '',
        contact_public, allow_open_quotes, parameters_json, data.PublishedAt || now, data.BudgetRange || '', data.procurementPlan || '',
        progress, view_password_plain, now, now
      );
      const res = await stmt.run();
      try {
        const meta = JSON.stringify({ contact_public: !!contact_public, allow_open_quotes: !!allow_open_quotes, password_plain: view_password_plain });
        const demId = (data.contactCompany || '').trim() || (data.contactPhone || '').trim() || requirement_id;
        await env.DB.prepare(`INSERT INTO demanders (
          demander_id, name, company, contact_phone, contact_email, department, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(demander_id) DO UPDATE SET
          name = excluded.name,
          company = excluded.company,
          contact_phone = excluded.contact_phone,
          contact_email = excluded.contact_email,
          department = excluded.department,
          metadata_json = excluded.metadata_json,
          updated_at = excluded.updated_at`).bind(
          demId, data.contactName || '', data.contactCompany || '', data.contactPhone || '', data.contactEmail || '', data.contactDepartment || '', meta, now, now
        ).run();
      } catch {}
      return json({ ok: true, requirement_id, RequirementID: requirement_id, ViewPassword: view_password_plain, DemanderPassword: view_password_plain });
    }

    // List Requirements
    if (isApi('requirements') && request.method === 'GET' || isFn('listRequirements') && request.method === 'GET') {
      const progress = url.searchParams.get('progress');
      const category = url.searchParams.get('category');
      let q = 'SELECT requirement_id as RequirementID, title as Title, public_preview as PublicPreview, primary_category as PrimaryCategory, secondary_category as SecondaryCategory, approved as Approved, status as Status, contact_public as ContactPublic, contact_name as ContactName, contact_phone as ContactPhone, contact_company as ContactCompany, budget_range as BudgetRange, published_at as PublishedAt, progress as Progress, allow_open_quotes as AllowOpenQuotes, parameters_json as Parameters FROM requirements';
      const where = [];
      const binds = [];
      // 前台列表仅展示已审核且状态为“公开”的需求
      where.push('approved = 1');
      where.push("status = '公开'");
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
      const anyPwd = url.searchParams.get('password') || '';
      const supplierPwd = url.searchParams.get('supplier_access_password') || '';
      const viewPwd = url.searchParams.get('view_password') || '';

      let role = 'public';
      // Demander check via demanders metadata_json.password_plain (company-bound)
      if (anyPwd) {
        try {
          const { results: reqRows } = await env.DB.prepare('SELECT contact_company FROM requirements WHERE requirement_id = ?').bind(id).all();
          const company = (reqRows && reqRows[0] && reqRows[0].contact_company) || '';
          if (company) {
            const like = `%"password_plain":"${anyPwd}"%`;
            const { results: demRows } = await env.DB.prepare('SELECT 1 FROM demanders WHERE company = ? AND metadata_json LIKE ?').bind(company, like).all();
            if (demRows && demRows.length) role = 'demander';
          }
        } catch {}
      }
      // Supplier check via per-requirement quote_password
      if (role === 'public' && anyPwd && typeof r.quote_password === 'string' && r.quote_password && anyPwd === r.quote_password) {
        role = 'supplier';
      }
      // Guest check via per-requirement view_password or legacy view_password_plain
      if (role === 'public' && anyPwd && ((typeof r.view_password === 'string' && r.view_password && anyPwd === r.view_password) || (anyPwd === r.view_password_plain))) {
        role = 'guest';
      }

      const showSensitiveLegacy = r.contact_public === 1 || (viewPwd && viewPwd === r.view_password_plain) || await verifySupplierPassword(env, supplierPwd);
      const showSensitive = role !== 'public' ? true : showSensitiveLegacy;

      const requirement = {
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
        requirement.ContactName = r.contact_name;
        requirement.ContactPhone = r.contact_phone;
        requirement.ContactCompany = r.contact_company;
        requirement.ContactEmail = r.contact_email;
        requirement.ContactDepartment = r.contact_department;
      }

      let quotes = undefined;
      if (role === 'demander') {
        try {
          const { results: qres } = await env.DB.prepare('SELECT quote_id as QuoteID, supplier_name as SupplierName, supplier_phone as SupplierPhone, amount as Amount, currency as Currency, remarks as Remarks, status as Status, created_at as CreatedAt FROM quotes WHERE requirement_id = ? ORDER BY created_at DESC LIMIT 200').bind(id).all();
          quotes = qres || [];
        } catch {}
      }

      return json({ role, requirement, quotes });
    }

    // Update Requirement (Admin or Demander)
    if (isApi('requirements/') && request.method === 'PATCH') {
      const reqId = path.split('/').filter(p => p && p !== 'api' && p !== 'requirements').shift();
      if (!reqId) return json({ error: 'MissingRequirementID' }, 400);

      const data = await bodyJSON(request);

      let allowed = requireAdmin(request);
      let isAdmin = allowed;
      if (!allowed) {
        const demPwd = String(data.demander_password || '').trim();
        if (demPwd) {
          try {
            const { results: reqRows } = await env.DB.prepare('SELECT contact_company FROM requirements WHERE requirement_id = ?').bind(reqId).all();
            const company = (reqRows && reqRows[0] && reqRows[0].contact_company) || '';
            if (company) {
              const like = `%"password_plain":"${demPwd}"%`;
              const { results: demRows } = await env.DB.prepare('SELECT 1 FROM demanders WHERE company = ? AND metadata_json LIKE ?').bind(company, like).all();
              if (demRows && demRows.length) allowed = true;
            }
          } catch {}
        }
      }

      if (!allowed) return json({ error: 'Unauthorized' }, 401);

      const fieldsAdmin = new Set(['status','progress','contact_public','view_password_plain', 'quote_password', 'view_password']);
      const fieldsDemander = new Set(['status','progress','contact_public']);
      const canUse = isAdmin ? fieldsAdmin : fieldsDemander;
      const sets = [];
      const binds = [];

      if (canUse.has('status') && typeof data.status === 'string' && String(data.status).trim()) {
        sets.push('status = ?'); binds.push(String(data.status).trim());
      }
      if (canUse.has('progress') && typeof data.progress === 'string' && String(data.progress).trim()) {
        sets.push('progress = ?'); binds.push(String(data.progress).trim());
      }
      if (canUse.has('contact_public') && typeof data.contact_public !== 'undefined') {
        const v = !!data.contact_public ? 1 : 0; sets.push('contact_public = ?'); binds.push(v);
      }
      if (canUse.has('view_password_plain') && typeof data.view_password_plain !== 'undefined') {
        sets.push('view_password_plain = ?'); binds.push(String(data.view_password_plain||''));
      }

      if (canUse.has('quote_password') && typeof data.quote_password === 'string') {
        sets.push('quote_password = ?'); binds.push(String(data.quote_password || '').trim());
      }
      if (canUse.has('view_password') && typeof data.view_password === 'string') {
        sets.push('view_password = ?'); binds.push(String(data.view_password || '').trim());
      }

      if (!sets.length) return json({ error: 'NoFields' }, 400);

      sets.push('updated_at = ?'); binds.push(new Date().toISOString());
      const sql = `UPDATE requirements SET ${sets.join(', ')} WHERE requirement_id = ?`;
      const stmt = env.DB.prepare(sql).bind(...binds, reqId);
      const info = await stmt.run();
      if (info.changes > 0) {
        return json({ ok: true, requirement_id: reqId });
      }
      return json({ error: 'UpdateFailed' }, 404);
    }

    // Submit Quote
    if (isApi('quotes') && request.method === 'POST' || isFn('submitQuote') && request.method === 'POST') {
      const data = await bodyJSON(request);
      const required = ['requirement_id', 'supplier_name', 'amount'];
      const missing = required.filter(k => !String(data[k] || '').trim());
      if (missing.length) return json({ error: 'Missing fields', fields: missing }, 400);
      const now = new Date().toISOString();
      const quote_id = genQuoteID();
      const stmtChk = env.DB.prepare('SELECT allow_open_quotes, quote_password FROM requirements WHERE requirement_id = ?').bind(data.requirement_id);
      const { results: chk } = await stmtChk.all();
      if (!chk || !chk.length) return json({ error: 'RequirementNotFound' }, 404);

      // Access control: allow when requirement is open, or supplier has valid password
      let allowed = (chk[0].allow_open_quotes === 1);
      const anyPwd = String(data.password || '').trim();
      const supAccessPwd = String(data.supplier_access_password || '').trim();
      if (!allowed && anyPwd && chk[0].quote_password && anyPwd === chk[0].quote_password) {
        allowed = true;
      }
      if (!allowed && supAccessPwd) {
        const ok = await verifySupplierPassword(env, supAccessPwd);
        if (ok) {
          allowed = true;
          if (!data.supplier_id) {
            try {
              const { results: supRes } = await env.DB.prepare('SELECT supplier_id FROM suppliers WHERE access_password_plain = ? AND (status IS NULL OR status != "disabled")').bind(supAccessPwd).all();
              if (supRes && supRes[0]) data.supplier_id = supRes[0].supplier_id;
            } catch {}
          }
        }
      }
      if (!allowed) return json({ error: 'Unauthorized' }, 401);

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
      let supplier_id = url.searchParams.get('supplier_id');
      const admin = requireAdmin(request);
      const viewPwd = url.searchParams.get('view_password') || '';
      const supplierPwd = url.searchParams.get('supplier_access_password') || '';
      const demPwd = url.searchParams.get('demander_password') || '';

      // Access control: admin OR valid view password OR supplier access password
      let allowed = admin;
      if (!allowed && requirement_id && viewPwd) {
        const stmt = env.DB.prepare('SELECT view_password_plain FROM requirements WHERE requirement_id = ?').bind(requirement_id);
        const { results } = await stmt.all();
        if (results && results[0] && results[0].view_password_plain === viewPwd) allowed = true;
      }
      if (!allowed && supplierPwd) {
        // If supplier provided a valid access password, allow and infer supplier_id when not provided
        const stmtSup = env.DB.prepare('SELECT supplier_id FROM suppliers WHERE access_password_plain = ? AND (status IS NULL OR status != "disabled")').bind(supplierPwd);
        const { results: supRes } = await stmtSup.all();
        if (supRes && supRes[0]) {
          allowed = true;
          if (!supplier_id) supplier_id = supRes[0].supplier_id;
        }
      }
      if (!allowed && demPwd && requirement_id) {
        try {
          const { results: reqRows } = await env.DB.prepare('SELECT contact_company FROM requirements WHERE requirement_id = ?').bind(requirement_id).all();
          const company = (reqRows && reqRows[0] && reqRows[0].contact_company) || '';
          if (company) {
            const like = `%"password_plain":"${demPwd}"%`;
            const { results: demRows } = await env.DB.prepare('SELECT 1 FROM demanders WHERE company = ? AND metadata_json LIKE ?').bind(company, like).all();
            if (demRows && demRows[0]) allowed = true;
          }
        } catch {}
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

    // Suppliers: session (login-like) to retrieve supplier identity by access password
    if (isApi('suppliers/session') && request.method === 'POST') {
      const data = await bodyJSON(request);
      const pass = String(data.password || '').trim();
      if (!pass) return json({ error: 'MissingPassword' }, 400);
      const stmt = env.DB.prepare('SELECT supplier_id, name, company FROM suppliers WHERE access_password_plain = ? AND (status IS NULL OR status != "disabled")').bind(pass);
      const { results } = await stmt.all();
      if (!results || !results.length) return json({ error: 'Unauthorized' }, 401);
      const s = results[0];
      return json({ ok: true, supplier: { SupplierID: s.supplier_id, Name: s.name, Company: s.company } });
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
        if (typeof data.status === 'string' && data.status.trim()) { sets.push('status = ?'); binds.push(String(data.status).trim()); }
        sets.push('updated_at = ?'); binds.push(new Date().toISOString());
        if (!sets.length) return json({ error: 'NoFields' }, 400);
        const stmt = env.DB.prepare(`UPDATE requirements SET ${sets.join(', ')}`);
        await stmt.bind(...binds).run();
        // D1 doesn't return affected count; best-effort: return ok=true
        return json({ updated: 'all' });
      }
      // If body provides requirementID, update single
      if (data.requirementID) {
        const fields = ['title','public_preview','primary_category','secondary_category','approved','approved_at','status','contact_name','contact_phone','contact_company','contact_email','contact_department','contact_public','allow_open_quotes','parameters_json','published_at','budget_range','procurement_plan','progress','view_password_plain','quote_password','view_password'];
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
      const fields = ['title','public_preview','primary_category','secondary_category','approved','approved_at','status','contact_name','contact_phone','contact_company','contact_email','contact_department','contact_public','allow_open_quotes','parameters_json','published_at','budget_range','procurement_plan','progress','view_password_plain','quote_password','view_password'];
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

    // Admin: delete a single requirement (and cascade delete quotes)
    if (isApi('admin/requirements/') && request.method === 'DELETE') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      try {
        await env.DB.prepare('DELETE FROM quotes WHERE requirement_id = ?').bind(id).run();
        await env.DB.prepare('DELETE FROM requirements WHERE requirement_id = ?').bind(id).run();
        return json({ ok: true });
      } catch (e) {
        return json({ error: 'DeleteFailed', detail: String(e && e.message || e) }, 500);
      }
    }

    // Admin: list/update suppliers
    if (isFn('adminListSuppliers') && request.method === 'GET' || isApi('admin/suppliers') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const onlyPublic = (url.searchParams.get('public') || '').trim().toLowerCase() === 'true';
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 200);
      const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
      const where = [];
      const binds = [];
      if (q) {
        where.push('(LOWER(company) LIKE ? OR LOWER(name) LIKE ? OR LOWER(contact_phone) LIKE ? OR LOWER(contact_email) LIKE ?)');
        const like = `%${q}%`;
        binds.push(like, like, like, like);
      }
      if (onlyPublic) {
        where.push("metadata_json LIKE '%\"contact_public\":true%'");
      }
      const whereSql = where.length ? (' WHERE ' + where.join(' AND ')) : '';
      const sql = `SELECT * FROM suppliers${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      const { results } = await env.DB.prepare(sql).bind(...binds, limit, offset).all();
      const items = (results || []).map(s => ({
        supplier_id: s.supplier_id,
        name: s.name,
        company: s.company,
        access_password_plain: s.access_password_plain,
        contact_phone: s.contact_phone,
        contact_email: s.contact_email,
        status: s.status,
        metadata_json: parseJSONSafe(s.metadata_json),
        created_at: s.created_at,
        updated_at: s.updated_at
      }));
      const offsetNext = items.length >= limit ? String(offset + limit) : '';
      return json({ items, offsetNext });
    }
    // Admin: suppliers single upsert
    if (isApi('admin/suppliers/upsert') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const now = new Date().toISOString();
      const supplier_id = (String(data.supplier_id || data.company || '').trim()) || ('S-' + now.replace(/[-:T.Z]/g,''));
      const name = String(data.name || '').trim();
      const company = String(data.company || '').trim();
      const phone = String(data.contact_phone || '').trim();
      const email = String(data.contact_email || '').trim();
      const pass = String(data.access_password_plain || '').trim();
      const status = String(data.status || 'active').trim();
      const meta = JSON.stringify(data.metadata_json || {});
      try {
        await env.DB.prepare(`INSERT INTO suppliers (
          supplier_id, name, company, contact_phone, contact_email, access_password_plain, status, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(supplier_id, name, company, phone, email, pass, status, meta, now, now).run();
        return json({ ok: true, supplier_id });
      } catch (e) {
        try {
          await env.DB.prepare(`UPDATE suppliers SET name = ?, company = ?, contact_phone = ?, contact_email = ?, access_password_plain = ?, status = ?, metadata_json = ?, updated_at = ? WHERE supplier_id = ?`)
            .bind(name, company, phone, email, pass, status, meta, now, supplier_id).run();
          return json({ ok: true, supplier_id });
        } catch (err) {
          return json({ error: 'UpsertSupplierFailed', detail: String(err && err.message || err) }, 500);
        }
      }
    }
    // Admin: bulk update suppliers (apply-to-all)
    if (isApi('admin/suppliers') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const sets = [];
      const binds = [];
      if (data.applyToAll) {
        if (data.newPasswordPlain) { sets.push('access_password_plain = ?'); binds.push(String(data.newPasswordPlain)); }
        if (typeof data.status === 'string' && data.status.trim()) { sets.push('status = ?'); binds.push(String(data.status).trim()); }
        sets.push('updated_at = ?'); binds.push(new Date().toISOString());
        if (!sets.length) return json({ error: 'NoFields' }, 400);
        const stmt = env.DB.prepare(`UPDATE suppliers SET ${sets.join(', ')}`);
        await stmt.bind(...binds).run();
        return json({ updated: 'all' });
      }
      return json({ error: 'InvalidRequest' }, 400);
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

    // Admin: list/update/create/delete demanders (optional)
    if (isFn('adminListDemanders') && request.method === 'GET' || isApi('admin/demanders') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 200);
      const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
      const where = [];
      const binds = [];
      if (q) {
        const like = `%${q}%`;
        where.push('(LOWER(company) LIKE ? OR LOWER(name) LIKE ? OR LOWER(contact_phone) LIKE ? OR LOWER(contact_email) LIKE ?)');
        binds.push(like, like, like, like);
      }
      const whereSql = where.length ? (' WHERE ' + where.join(' AND ')) : '';
      const sql = `SELECT *, (
          SELECT COUNT(1) FROM requirements r WHERE r.contact_company = demanders.company AND IFNULL(r.published_at,'') <> ''
        ) AS req_count
        FROM demanders${whereSql}
        ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      const { results } = await env.DB.prepare(sql).bind(...binds, limit, offset).all();
      const items = (results || []).map(d => ({
        demander_id: d.demander_id,
        name: d.name,
        company: d.company,
        contact_phone: d.contact_phone,
        contact_email: d.contact_email,
        department: d.department,
        metadata_json: parseJSONSafe(d.metadata_json),
        requirement_count: d.req_count || 0,
        created_at: d.created_at,
        updated_at: d.updated_at
      }));
      const offsetNext = items.length >= limit ? String(offset + limit) : '';
      return json({ items, offsetNext });
    }
    // Admin: demanders stats
    if (isApi('admin/demanders/stats') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const total = await env.DB.prepare('SELECT COUNT(1) AS c FROM demanders').all();
      const pub = await env.DB.prepare('SELECT COUNT(1) AS c FROM demanders WHERE metadata_json LIKE ?').bind('%"contact_public":true%').all();
      const pwd = await env.DB.prepare('SELECT COUNT(1) AS c FROM demanders WHERE metadata_json LIKE ?').bind('%"password_plain":"%').all();
      const open = await env.DB.prepare('SELECT COUNT(1) AS c FROM demanders WHERE metadata_json LIKE ?').bind('%"allow_open_quotes":true%').all();
      const totalCount = (total.results && total.results[0] && total.results[0].c) || 0;
      const publicCount = (pub.results && pub.results[0] && pub.results[0].c) || 0;
      const passwordCount = (pwd.results && pwd.results[0] && pwd.results[0].c) || 0;
      const openQuotesCount = (open.results && open.results[0] && open.results[0].c) || 0;
      return json({ total: totalCount, public: publicCount, password: passwordCount, openQuotes: openQuotesCount });
    }
    // Admin: demanders export CSV
    if (isApi('admin/demanders/export') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const where = [];
      const binds = [];
      if (q) {
        const like = `%${q}%`;
        where.push('(LOWER(company) LIKE ? OR LOWER(name) LIKE ? OR LOWER(contact_phone) LIKE ? OR LOWER(contact_email) LIKE ?)');
        binds.push(like, like, like, like);
      }
      const whereSql = where.length ? (' WHERE ' + where.join(' AND ')) : '';
      const sql = `SELECT *, (
          SELECT COUNT(1) FROM requirements r WHERE r.contact_company = demanders.company AND IFNULL(r.published_at,'') <> ''
        ) AS req_count FROM demanders${whereSql} ORDER BY created_at DESC LIMIT 10000 OFFSET 0`;
      const { results } = await env.DB.prepare(sql).bind(...binds).all();
      const items = results || [];
      const headers = ['公司','联系人','电话','邮箱','部门','需求数量','公开','需密码'];
      function esc(v){
        const s = String(v==null?'':v);
        const r = s.replace(/"/g,'""');
        return /,|\n|"/.test(r) ? `"${r}"` : r;
      }
      const rows = items.map(d => {
        const m = parseJSONSafe(d.metadata_json) || {};
        const contactPublic = !!m.contact_public;
        const needPassword = !(m.allow_open_quotes===true);
        return [d.company||'', d.name||'', d.contact_phone||'', d.contact_email||'', d.department||'', d.req_count||0, contactPublic?'公开':'不公开', needPassword?'需要':'不需要'];
      });
      const csv = [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
      return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="demanders.csv"' } });
    }
    if (isApi('admin/demanders') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const now = new Date().toISOString();
      const demander_id = (String(data.demander_id || data.company || '').trim()) || ('D-' + now.replace(/[-:T.Z]/g,''));
      const name = String(data.name || '').trim();
      const company = String(data.company || '').trim();
      const phone = String(data.contact_phone || '').trim();
      const email = String(data.contact_email || '').trim();
      const dept = String(data.department || '').trim();
      const meta = JSON.stringify(data.metadata_json || {});
      try {
        await env.DB.prepare(`INSERT INTO demanders (
          demander_id, name, company, contact_phone, contact_email, department, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(demander_id, name, company, phone, email, dept, meta, now, now).run();
        return json({ ok: true, demander_id });
      } catch (e) {
        try {
          await env.DB.prepare(`UPDATE demanders SET name = ?, company = ?, contact_phone = ?, contact_email = ?, department = ?, metadata_json = ?, updated_at = ? WHERE demander_id = ?`)
            .bind(name, company, phone, email, dept, meta, now, demander_id).run();
          return json({ ok: true, demander_id });
        } catch (err) {
          return json({ error: 'CreateDemanderFailed', detail: String(err && err.message || err) }, 500);
        }
      }
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
    if (isApi('admin/demanders/') && request.method === 'DELETE') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      try {
        await env.DB.prepare('DELETE FROM demanders WHERE demander_id = ?').bind(id).run();
        return json({ ok: true });
      } catch (e) {
        return json({ error: 'DeleteDemanderFailed', detail: String(e && e.message || e) }, 500);
      }
    }


    // Admin: suppliers delete
    if (isApi('admin/suppliers/') && request.method === 'DELETE') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      try {
        await env.DB.prepare('DELETE FROM suppliers WHERE supplier_id = ?').bind(id).run();
        return json({ ok: true });
      } catch (e) {
        return json({ error: 'DeleteSupplierFailed', detail: String(e && e.message || e) }, 500);
      }
    }
    // Admin: suppliers export CSV
    if (isApi('admin/suppliers/export') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const onlyPublic = url.searchParams.get('public') === 'true';
      const where = [];
      const binds = [];
      if (q) {
        where.push('(LOWER(company) LIKE ? OR LOWER(name) LIKE ? OR LOWER(contact_phone) LIKE ? OR LOWER(contact_email) LIKE ?)');
        const like = `%${q}%`;
        binds.push(like, like, like, like);
      }
      if (onlyPublic) {
        where.push("metadata_json LIKE '%\"contact_public\":true%'");
      }
      const whereSql = where.length ? (' WHERE ' + where.join(' AND ')) : '';
      const sql = `SELECT * FROM suppliers${whereSql} ORDER BY created_at DESC LIMIT 10000 OFFSET 0`;
      const { results } = await env.DB.prepare(sql).bind(...binds).all();
      const items = results || [];
      const headers = ['公司/名称','联系人','电话','邮箱','公开','官网'];
      function esc(v){
        const s = String(v==null?'':v);
        const r = s.replace(/"/g,'""');
        return /,|\n|"/.test(r) ? `"${r}"` : r;
      }
      const rows = items.map(s => {
        const m = parseJSONSafe(s.metadata_json) || {};
        const contactPublic = !!m.contact_public;
        const website = m.website || '';
        return [s.company||s.name||'', s.name||'', s.contact_phone||'', s.contact_email||'', contactPublic?'公开':'不公开', website];
      });
      const csv = [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
      return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="suppliers.csv"' } });
    }

    // Admin: list/create products
    if (isApi('admin/products') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const supplier_id = url.searchParams.get('supplier_id');
      let q = 'SELECT * FROM products';
      const where = [];
      const binds = [];
      if (supplier_id) { where.push('supplier_id = ?'); binds.push(supplier_id); }
      if (where.length) q += ' WHERE ' + where.join(' AND ');
      q += ' ORDER BY created_at DESC LIMIT 100';
      const { results } = await env.DB.prepare(q).bind(...binds).all();
      const items = (results || []).map(p => ({
        product_id: p.product_id,
        supplier_id: p.supplier_id,
        name: p.name,
        model: p.model,
        series: p.series,
        primary_category: p.primary_category,
        summary: p.summary,
        parameters_json: parseJSONSafe(p.parameters_json),
        created_at: p.created_at
      }));
      return json(items);
    }
    if ((isApi('products') || isApi('admin/products')) && request.method === 'POST') {
      // Allow admin or supplier (if I implement supplier auth check here, but for simulation admin key is used)
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401); 
      const data = await bodyJSON(request);
      const now = new Date().toISOString();
      const product_id = data.ProductID || data.product_id || ('PROD-' + now.replace(/[-:T.Z]/g,'') + '-' + Math.floor(Math.random()*1000));
      const supplier_id = data.SupplierID || data.supplier_id;
      if (!supplier_id) return json({ error: 'MissingSupplierID' }, 400);
      
      await env.DB.prepare(`INSERT INTO products (
        product_id, supplier_id, name, model, series, primary_category, summary, parameters_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        product_id, supplier_id, data.Name || data.name || '', data.Model || data.model || '', 
        data.Series || data.series || '', data.PrimaryCategory || data.primary_category || '', 
        data.Summary || data.summary || '', JSON.stringify(data.Parameters || data.parameters_json || {}), now, now
      ).run();
      return json({ ok: true, product_id });
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
      let sups = await fetchJsonSafe(`${base}/suppliers.json`);
      const dems = await fetchJsonSafe(`${base}/demanders.json`);

      const now = new Date().toISOString();
      // Seed requirements
      for (const r of (reqs || [])) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO requirements (
            requirement_id, title, public_preview, primary_category, secondary_category, approved, approved_at, status,
            contact_name, contact_phone, contact_company, contact_email, contact_department,
            contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
            progress, view_password_plain, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(
            r.RequirementID || '', r.Title || '', r.PublicPreview || '', r.PrimaryCategory || '', r.SecondaryCategory || '', 1, now, r.Status || '',
            r.ContactName || '', r.ContactPhone || '', r.ContactCompany || '', r.ContactEmail || '', r.ContactDepartment || '',
            r.ContactPublic ? 1 : 0, r.AllowOpenQuotes ? 1 : 0, JSON.stringify(r.Parameters || {}), r.PublishedAt || now, r.BudgetRange || '', r.procurementPlan || '',
            r.Progress || '', r.ViewPasswordPlain || '', r.created_at || now, r.updated_at || now
          ).run();
        } catch {}
      }

      if (!Array.isArray(sups) || !sups.length) {
        const siteBase = String(base).replace(/\/?data\/?$/i, '');
        const idx = await fetchJsonSafe(`${siteBase}/index.json`);
        const list = Array.isArray(idx) ? idx : [];
        const items = list.filter(i => {
          const t = String(i.type || i.section || '').toLowerCase();
          return t === 'suppliers' || String(i.section || '').toLowerCase() === 'suppliers';
        });
        sups = items.map(i => {
          const p = i.params || {};
          const uri = String(i.uri || '').trim();
          const id = String(p.slug || (uri.split('/').filter(Boolean).pop() || '') || p.title || i.title || '').trim();
          return {
            SupplierID: id || (p.title || i.title || ''),
            Name: p.contact_person || '',
            Company: p.title || i.title || '',
            AccessPassword: '',
            ContactPhone: p.phone || '',
            ContactEmail: p.email || '',
            Status: 'active',
            metadata: {
              website: siteBase ? (siteBase + uri) : uri,
              type: p.type || '',
              address: p.address || '',
              series: Array.isArray(p.series) ? p.series : [],
              models: Array.isArray(p.models) ? p.models : [],
              gallery: Array.isArray(p.gallery) ? p.gallery : [],
              description: p.description || ''
            }
          };
        });
      }
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

    // Admin: cleanup invalid data (titles undefined/empty, missing IDs, orphan quotes)
    if (isApi('admin/cleanup-invalid') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        // Count before
        const { results: reqCountBefore } = await env.DB.prepare('SELECT COUNT(1) as c FROM requirements').all();
        const { results: quoteCountBefore } = await env.DB.prepare('SELECT COUNT(1) as c FROM quotes').all();

        // Delete invalid requirements
        await env.DB.prepare("DELETE FROM requirements WHERE requirement_id IS NULL OR TRIM(requirement_id) = ''").run();
        await env.DB.prepare("DELETE FROM requirements WHERE title IS NULL OR TRIM(title) = '' OR title = 'undefined'").run();
        await env.DB.prepare("DELETE FROM requirements WHERE primary_category = 'undefined' OR secondary_category = 'undefined'").run();

        // Delete orphan quotes
        await env.DB.prepare('DELETE FROM quotes WHERE requirement_id NOT IN (SELECT requirement_id FROM requirements)').run();

        // Count after
        const { results: reqCountAfter } = await env.DB.prepare('SELECT COUNT(1) as c FROM requirements').all();
        const { results: quoteCountAfter } = await env.DB.prepare('SELECT COUNT(1) as c FROM quotes').all();
        const deletedReqs = (reqCountBefore?.[0]?.c || 0) - (reqCountAfter?.[0]?.c || 0);
        const deletedQuotes = (quoteCountBefore?.[0]?.c || 0) - (quoteCountAfter?.[0]?.c || 0);
        return json({ ok: true, deleted: { requirements: deletedReqs, quotes: deletedQuotes } });
      } catch (e) {
        return json({ error: 'CleanupFailed', detail: String(e && e.message || e) }, 500);
      }
    }

    // Admin: reset data (wipe tables). Optional query param scope: 'all' | 'requirements' | 'quotes' | 'suppliers' | 'demanders'. Default: 'requirements,quotes'
    if (isApi('admin/reset-data') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const scope = (url.searchParams.get('scope') || '').trim();
        const wipeAll = scope === 'all' || scope === '';
        const doReq = wipeAll || scope.includes('requirements');
        const doQuote = wipeAll || scope.includes('quotes');
        const doSup = scope.includes('suppliers') || (wipeAll);
        const doDem = scope.includes('demanders') || (wipeAll);

        // Count before
        const { results: reqCountBefore } = await env.DB.prepare('SELECT COUNT(1) as c FROM requirements').all();
        const { results: quoteCountBefore } = await env.DB.prepare('SELECT COUNT(1) as c FROM quotes').all();
        const { results: supCountBefore } = await env.DB.prepare('SELECT COUNT(1) as c FROM suppliers').all();
        const { results: demCountBefore } = await env.DB.prepare('SELECT COUNT(1) as c FROM demanders').all();

        // Wipe in safe order
        if (doQuote) { await env.DB.prepare('DELETE FROM quotes').run(); }
        if (doReq) { await env.DB.prepare('DELETE FROM requirements').run(); }
        if (doSup) { await env.DB.prepare('DELETE FROM suppliers').run(); }
        if (doDem) { await env.DB.prepare('DELETE FROM demanders').run(); }

        // Count after
        const { results: reqCountAfter } = await env.DB.prepare('SELECT COUNT(1) as c FROM requirements').all();
        const { results: quoteCountAfter } = await env.DB.prepare('SELECT COUNT(1) as c FROM quotes').all();
        const { results: supCountAfter } = await env.DB.prepare('SELECT COUNT(1) as c FROM suppliers').all();
        const { results: demCountAfter } = await env.DB.prepare('SELECT COUNT(1) as c FROM demanders').all();

        return json({ ok: true, deleted: {
          requirements: (reqCountBefore?.[0]?.c || 0) - (reqCountAfter?.[0]?.c || 0),
          quotes: (quoteCountBefore?.[0]?.c || 0) - (quoteCountAfter?.[0]?.c || 0),
          suppliers: (supCountBefore?.[0]?.c || 0) - (supCountAfter?.[0]?.c || 0),
          demanders: (demCountBefore?.[0]?.c || 0) - (demCountAfter?.[0]?.c || 0)
        }});
      } catch (e) {
        return json({ error: 'ResetFailed', detail: String(e && e.message || e) }, 500);
      }
    }

    // Admin: import suppliers from JSON with upsert (synchronize with website data)
    if (isApi('admin/import-suppliers') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const base = url.searchParams.get('base') || 'http://127.0.0.1:5500/data';
        let sups = await fetchJsonSafe(`${base}/suppliers.json`);
        const now = new Date().toISOString();
        if (!Array.isArray(sups) || !sups.length) {
          const siteBase = String(base).replace(/\/?data\/?$/i, '');
          const idx = await fetchJsonSafe(`${siteBase}/index.json`);
          const list = Array.isArray(idx) ? idx : [];
          const items = list.filter(i => {
            const t = String(i.type || i.section || '').toLowerCase();
            return t === 'suppliers' || String(i.section || '').toLowerCase() === 'suppliers';
          });
          sups = items.map(i => {
            const p = i.params || {};
            const uri = String(i.uri || '').trim();
            const id = String(p.slug || (uri.split('/').filter(Boolean).pop() || '') || p.title || i.title || '').trim();
            return {
              SupplierID: id || (p.title || i.title || ''),
              Name: p.contact_person || '',
              Company: p.title || i.title || '',
              AccessPassword: '',
              ContactPhone: p.phone || '',
              ContactEmail: p.email || '',
              Status: 'active',
              metadata: {
                website: siteBase ? (siteBase + uri) : uri,
                type: p.type || '',
                address: p.address || '',
                series: Array.isArray(p.series) ? p.series : [],
                models: Array.isArray(p.models) ? p.models : [],
                gallery: Array.isArray(p.gallery) ? p.gallery : [],
                description: p.description || ''
              },
              created_at: now,
              updated_at: now
            };
          });
        }
        let upserted = 0;
        for (const s of (sups || [])) {
          try {
            await env.DB.prepare(`INSERT INTO suppliers (
              supplier_id, name, company, access_password_plain, contact_phone, contact_email, status, metadata_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(supplier_id) DO UPDATE SET
              name = excluded.name,
              company = excluded.company,
              access_password_plain = excluded.access_password_plain,
              contact_phone = excluded.contact_phone,
              contact_email = excluded.contact_email,
              status = COALESCE(excluded.status, suppliers.status),
              metadata_json = excluded.metadata_json,
              updated_at = excluded.updated_at
            `)
            .bind(
              s.SupplierID || s.supplier_id || '', s.Name || s.name || '', s.Company || s.company || '', s.AccessPassword || s.access_password_plain || '',
              s.ContactPhone || s.contact_phone || '', s.ContactEmail || s.contact_email || '', s.Status || s.status || '', JSON.stringify(s.metadata || s.metadata_json || {}),
              s.created_at || now, s.updated_at || now
            ).run();
            upserted++;
          } catch {}
        }
        return json({ ok: true, upserted });
      } catch (e) {
        return json({ error: 'ImportSuppliersFailed', detail: String(e && e.message || e) }, 500);
      }
    }

    // Admin: import demanders by aggregating published requirements
    if (isApi('admin/import-demanders') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const now = new Date().toISOString();
        const { results: reqs } = await env.DB.prepare("SELECT contact_company, contact_name, contact_phone, contact_email, contact_department, contact_public, allow_open_quotes FROM requirements WHERE IFNULL(published_at,'') <> ''").all();
        const map = new Map();
        for (const r of (reqs || [])) {
          const key = String(r.contact_company || '').trim();
          if (!key) continue;
          const prev = map.get(key) || { company: key, name: '', contact_phone: '', contact_email: '', department: '', contact_public: 0, allow_open_quotes: 0, count: 0 };
          const name = prev.name || String(r.contact_name || '').trim();
          const phone = prev.contact_phone || String(r.contact_phone || '').trim();
          const email = prev.contact_email || String(r.contact_email || '').trim();
          const dept = prev.department || String(r.contact_department || '').trim();
          const pub = prev.contact_public || (r.contact_public ? 1 : 0);
          const open = prev.allow_open_quotes || (r.allow_open_quotes ? 1 : 0);
          map.set(key, { company: key, name, contact_phone: phone, contact_email: email, department: dept, contact_public: pub, allow_open_quotes: open, count: (prev.count||0)+1 });
        }
        let upserted = 0;
        for (const [company, v] of map.entries()) {
          const id = company; // use company string as stable key
          const meta = JSON.stringify({ contact_public: !!v.contact_public, allow_open_quotes: !!v.allow_open_quotes, aggregated_from_requirements: true });
          try {
            await env.DB.prepare(`INSERT INTO demanders (
              demander_id, name, company, contact_phone, contact_email, department, metadata_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(demander_id) DO UPDATE SET
              name = excluded.name,
              company = excluded.company,
              contact_phone = excluded.contact_phone,
              contact_email = excluded.contact_email,
              department = excluded.department,
              metadata_json = excluded.metadata_json,
              updated_at = excluded.updated_at
            `)
            .bind(id, v.name, company, v.contact_phone, v.contact_email, v.department, meta, now, now).run();
            upserted++;
          } catch {}
        }
        return json({ ok: true, upserted });
      } catch (e) {
        return json({ error: 'ImportDemandersFailed', detail: String(e && e.message || e) }, 500);
      }
    }

    // Public: list requirements by view password only (for publisher entrance without ID)
    if (isApi('requirements/by-password') && request.method === 'GET') {
      const viewPwd = (url.searchParams.get('view_password') || '').trim();
      if (!viewPwd) return json({ error: 'MissingPassword' }, 400);
      const { results } = await env.DB.prepare('SELECT * FROM requirements WHERE view_password_plain = ? ORDER BY created_at DESC LIMIT 100').bind(viewPwd).all();
      const items = (results || []).map(r => ({
        RequirementID: r.requirement_id,
        Title: r.title,
        PrimaryCategory: r.primary_category,
        SecondaryCategory: r.secondary_category,
        Status: r.status,
        BudgetRange: r.budget_range,
        PublishedAt: r.published_at,
        Progress: r.progress,
        AllowOpenQuotes: !!r.allow_open_quotes,
        Parameters: parseJSONSafe(r.parameters_json),
        ContactName: r.contact_name,
        ContactPhone: r.contact_phone,
        ContactCompany: r.contact_company,
        ContactEmail: r.contact_email,
        ContactDepartment: r.contact_department
      }));
      return json({ items });
    }

    // Demanders: session by publisher password (login-like)
    if (isApi('demanders/session') && request.method === 'POST') {
      const data = await bodyJSON(request);
      const pass = String(data.password || '').trim();
      if (!pass) return json({ error: 'MissingPassword' }, 400);
      const like = `%"password_plain":"${pass}"%`;
      const { results } = await env.DB.prepare('SELECT demander_id, name, company FROM demanders WHERE metadata_json LIKE ?').bind(like).all();
      if (!results || !results.length) return json({ error: 'Unauthorized' }, 401);
      const d = results[0];
      return json({ ok: true, demander: { DemanderID: d.demander_id, Name: d.name, Company: d.company } });
    }

    // Demanders: list requirements for a company authorized by demander password
    if (isApi('demanders/requirements') && request.method === 'GET') {
      const company = (url.searchParams.get('company') || '').trim();
      const pass = (url.searchParams.get('password') || '').trim();
      if (!company || !pass) return json({ error: 'MissingParams' }, 400);
      const like = `%"password_plain":"${pass}"%`;
      const { results: demRows } = await env.DB.prepare('SELECT 1 FROM demanders WHERE company = ? AND metadata_json LIKE ?').bind(company, like).all();
      if (!demRows || !demRows.length) return json({ error: 'Unauthorized' }, 401);
      const { results } = await env.DB.prepare('SELECT requirement_id, title, status FROM requirements WHERE contact_company = ? ORDER BY created_at DESC LIMIT 100').bind(company).all();
      const items = (results || []).map(r => ({ RequirementID: r.requirement_id, Title: r.title, Status: r.status }));
      return json({ items });
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
  ,
  async scheduled(event, env, ctx) {
    // Automatic sync from website JSON if enabled via env or default
    const base = env.SYNC_BASE_URL || 'https://www.visndt.com/data';
    try {
      // Seed requirements (INSERT OR IGNORE)
      const reqs = await fetch(`${base}/requirements.json`).then(r => r.json()).catch(() => []);
      let sups = await fetch(`${base}/suppliers.json`).then(r => r.json()).catch(() => []);
      const dems = await fetch(`${base}/demanders.json`).then(r => r.json()).catch(() => []);
      const now = new Date().toISOString();
      for (const r of (reqs || [])) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO requirements (
            requirement_id, title, public_preview, primary_category, secondary_category, approved, approved_at, status,
            contact_name, contact_phone, contact_company, contact_email, contact_department,
            contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
            progress, view_password_plain, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(
            r.RequirementID || '', r.Title || '', r.PublicPreview || '', r.PrimaryCategory || '', r.SecondaryCategory || '', 1, now, r.Status || '',
            r.ContactName || '', r.ContactPhone || '', r.ContactCompany || '', r.ContactEmail || '', r.ContactDepartment || '',
            r.ContactPublic ? 1 : 0, r.AllowOpenQuotes ? 1 : 0, JSON.stringify(r.Parameters || {}), r.PublishedAt || now, r.BudgetRange || '', r.procurementPlan || '',
            r.Progress || '', r.ViewPasswordPlain || '', r.created_at || now, r.updated_at || now
          ).run();
        } catch {}
      }
      if (!Array.isArray(sups) || !sups.length) {
        const siteBase = String(base).replace(/\/?data\/?$/i, '');
        const idx = await fetch(`${siteBase}/index.json`).then(r => r.json()).catch(() => []);
        const list = Array.isArray(idx) ? idx : [];
        const items = list.filter(i => {
          const t = String(i.type || i.section || '').toLowerCase();
          return t === 'suppliers' || String(i.section || '').toLowerCase() === 'suppliers';
        });
        sups = items.map(i => {
          const p = i.params || {};
          const uri = String(i.uri || '').trim();
          const id = String(p.slug || (uri.split('/').filter(Boolean).pop() || '') || p.title || i.title || '').trim();
          return {
            SupplierID: id || (p.title || i.title || ''),
            Name: p.contact_person || '',
            Company: p.title || i.title || '',
            AccessPassword: '',
            ContactPhone: p.phone || '',
            ContactEmail: p.email || '',
            Status: 'active',
            metadata: {
              website: siteBase ? (siteBase + uri) : uri,
              type: p.type || '',
              address: p.address || '',
              series: Array.isArray(p.series) ? p.series : [],
              models: Array.isArray(p.models) ? p.models : [],
              gallery: Array.isArray(p.gallery) ? p.gallery : [],
              description: p.description || ''
            }
          };
        });
      }
      for (const s of (sups || [])) {
        try {
          await env.DB.prepare(`INSERT INTO suppliers (
            supplier_id, name, company, access_password_plain, contact_phone, contact_email, status, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(supplier_id) DO UPDATE SET
            name = excluded.name,
            company = excluded.company,
            access_password_plain = excluded.access_password_plain,
            contact_phone = excluded.contact_phone,
            contact_email = excluded.contact_email,
            status = COALESCE(excluded.status, suppliers.status),
            metadata_json = excluded.metadata_json,
            updated_at = excluded.updated_at
          `)
          .bind(
            s.SupplierID || s.supplier_id || '', s.Name || s.name || '', s.Company || s.company || '', s.AccessPassword || s.access_password_plain || '',
            s.ContactPhone || s.contact_phone || '', s.ContactEmail || s.contact_email || '', s.Status || s.status || '', JSON.stringify(s.metadata || s.metadata_json || {}),
            s.created_at || now, s.updated_at || now
          ).run();
        } catch {}
      }
      if (env.DEFAULT_SUPPLIER_PASSWORD) {
        try {
          await env.DB.prepare('UPDATE suppliers SET access_password_plain = ?, updated_at = ?').bind(String(env.DEFAULT_SUPPLIER_PASSWORD), now).run();
        } catch {}
      }
      // Apply default requirement view password only when it's currently empty
      if (env.DEFAULT_REQUIREMENT_PASSWORD) {
        try {
          await env.DB.prepare("UPDATE requirements SET view_password_plain = CASE WHEN IFNULL(view_password_plain, '') = '' THEN ? ELSE view_password_plain END, updated_at = ?").bind(String(env.DEFAULT_REQUIREMENT_PASSWORD), now).run();
        } catch {}
      }
      // Seed demanders (ignore duplicates)
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
    } catch (e) {
      // swallow errors to avoid cron failures surfacing
    }
  }
};