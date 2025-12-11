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
      'http://localhost:1314', 'http://127.0.0.1:1314',
      'http://localhost:1319', 'http://127.0.0.1:1319'
    ]);
    let allowOrigin = 'https://visndt.com';
    if (origin) {
      try {
        const o = new URL(origin);
        const h = String(o.hostname || '').toLowerCase();
        if (allowedOrigins.has(origin) || h === 'localhost' || h === '127.0.0.1' || h.endsWith('.workers.dev')) {
          allowOrigin = origin;
        }
      } catch {}
    }
    const baseHeaders = {
      'Access-Control-Allow-Origin': (origin === 'null' || !origin) ? '*' : allowOrigin,
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key, x-admin-key',
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
          quote_password TEXT,
          view_password TEXT,
          is_featured INTEGER DEFAULT 0,
          is_urgent INTEGER DEFAULT 0,
          admin_notes TEXT,
          tags TEXT,
          created_at TEXT,
          updated_at TEXT
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_requirements_reqid ON requirements(requirement_id)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_requirements_phone ON requirements(contact_phone)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_requirements_progress ON requirements(progress)').run();
        // Lightweight migrations
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN approved INTEGER').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN approved_at TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN quote_password TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN view_password TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN is_featured INTEGER DEFAULT 0').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN is_urgent INTEGER DEFAULT 0').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN admin_notes TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE requirements ADD COLUMN tags TEXT').run(); } catch {}

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
          slug TEXT UNIQUE,
          model TEXT,
          series TEXT,
          primary_category TEXT,
          secondary_category TEXT,
          summary TEXT,
          description TEXT,
          parameters_json TEXT,
          cover_image TEXT,
          gallery_json TEXT,
          documents_json TEXT,
          seo_title TEXT,
          seo_keywords TEXT,
          seo_description TEXT,
          status TEXT,
          is_featured INTEGER,
          created_at TEXT,
          updated_at TEXT,
          FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)').run();
        // Migrations for products
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN slug TEXT UNIQUE').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN secondary_category TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN description TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN cover_image TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN gallery_json TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN documents_json TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN seo_title TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN seo_keywords TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN seo_description TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN status TEXT').run(); } catch {}
        try { await env.DB.prepare('ALTER TABLE products ADD COLUMN is_featured INTEGER').run(); } catch {}

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

        // News
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS news (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          news_id TEXT UNIQUE,
          title TEXT,
          slug TEXT UNIQUE,
          summary TEXT,
          content TEXT,
          cover_image TEXT,
          category TEXT,
          tags TEXT,
          author TEXT,
          status TEXT,
          seo_title TEXT,
          seo_keywords TEXT,
          seo_description TEXT,
          published_at TEXT,
          created_at TEXT,
          updated_at TEXT
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_news_cat ON news(category)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug)').run();

        // Cases
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS cases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id TEXT UNIQUE,
          title TEXT,
          slug TEXT UNIQUE,
          summary TEXT,
          content TEXT,
          cover_image TEXT,
          industry TEXT,
          related_product_id TEXT,
          status TEXT,
          seo_title TEXT,
          seo_keywords TEXT,
          seo_description TEXT,
          published_at TEXT,
          created_at TEXT,
          updated_at TEXT
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_cases_slug ON cases(slug)').run();

        // Exhibitions
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS exhibitions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          exhibition_id TEXT UNIQUE,
          title TEXT,
          slug TEXT UNIQUE,
          location TEXT,
          start_date TEXT,
          end_date TEXT,
          booth_number TEXT,
          description TEXT,
          cover_image TEXT,
          status TEXT,
          seo_title TEXT,
          seo_keywords TEXT,
          seo_description TEXT,
          created_at TEXT,
          updated_at TEXT
        )`).run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_exhibitions_slug ON exhibitions(slug)').run();

        // Assets
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS assets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          asset_id TEXT UNIQUE,
          filename TEXT,
          r2_key TEXT,
          public_url TEXT,
          file_type TEXT,
          file_size INTEGER,
          alt_text TEXT,
          uploaded_by TEXT,
          created_at TEXT
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
      const expected = env.ADMIN_KEY || env.ADMIN_KEY_SECRET || env.ADMIN_TOKEN || '@Aa123456';
      if (expected) return key === expected;
      const origin = req.headers.get('origin') || '';
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
        return !!key; // allow any non-empty key in local dev when ADMIN_KEY is not set
      }
      return false;
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
    const isFn = (p) => {
      const base = `/.netlify/functions/${String(p).replace(/^\/+/, '').replace(/\/+$/, '')}`;
      return path === base || path.startsWith(base + '/');
    };
    const isApi = (p) => {
      const base = `/api/${String(p).replace(/^\/+/, '').replace(/\/+$/, '')}`;
      return path === base || path.startsWith(base + '/');
    };

    // Health check
    if (isApi('health') && request.method === 'GET') {
      try {
        const req = await env.DB.prepare('SELECT COUNT(1) as c FROM requirements').all();
        const sup = await env.DB.prepare('SELECT COUNT(1) as c FROM suppliers').all();
        const dem = await env.DB.prepare('SELECT COUNT(1) as c FROM demanders').all();
        return json({ ok: true, db: { requirements: (req.results?.[0]?.c)||0, suppliers: (sup.results?.[0]?.c)||0, demanders: (dem.results?.[0]?.c)||0 } });
      } catch (e) {
        return json({ ok: true });
      }
    }

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

    // Public: Dynamic News Data (Syncs DB to Frontend)
    if (url.pathname.endsWith('/data/news.json') || isApi('news/public')) {
       try {
          const { results: news } = await env.DB.prepare("SELECT * FROM news WHERE status='published' ORDER BY published_at DESC").all();
          const { results: exhs } = await env.DB.prepare("SELECT * FROM exhibitions WHERE status='published' ORDER BY start_date DESC").all();
          // Merge and format
          const items = [];
          for(const n of (news||[])) {
             items.push({
                id: n.news_id,
                title: n.title,
                date: n.published_at,
                category: n.category,
                summary: n.summary,
                hero: n.cover_image,
                link: `/news/${n.slug || n.news_id}`
             });
          }
          for(const e of (exhs||[])) {
             items.push({
                id: e.exhibition_id,
                title: e.title,
                date: e.start_date,
                category: '展会活动',
                summary: e.description || `${e.location} | ${e.booth_number}`,
                hero: e.cover_image,
                link: `/exhibitions/${e.slug || e.exhibition_id}`
             });
          }
          // Sort by date desc
          items.sort((a,b) => new Date(b.date) - new Date(a.date));
          return json({ items });
       } catch(e) { return json({ error: e.message }, 500); }
    }

    if (isApi('news') && request.method === 'GET') {
      const cat = url.searchParams.get('category');
      const page = Math.max(parseInt(url.searchParams.get('page')||'1',10)||1, 1);
      const limit = Math.min(parseInt(url.searchParams.get('limit')||'20',10)||20, 200);
      let baseSql = "FROM news WHERE status='published'";
      const binds = [];
      const countBinds = [];
      if (cat) { baseSql += ' AND category = ?'; binds.push(cat); countBinds.push(cat); }
      const { results: countRows } = await env.DB.prepare(`SELECT COUNT(1) AS total ${baseSql}`).bind(...countBinds).all();
      const total = (countRows && countRows[0] && countRows[0].total) || 0;
      const offset = (page - 1) * limit;
      const { results } = await env.DB.prepare(`SELECT news_id, title, slug, summary, cover_image, category, tags, author, published_at ${baseSql} ORDER BY published_at DESC LIMIT ? OFFSET ?`).bind(...binds, limit, offset).all();
      const items = (results||[]).map(n => ({
        id: n.news_id,
        title: n.title,
        slug: n.slug,
        summary: n.summary,
        cover_image: n.cover_image,
        category: n.category,
        tags: n.tags,
        author: n.author,
        published_at: n.published_at
      }));
      return json({ items, page, limit, total });
    }

    if (isApi('cases') && request.method === 'GET') {
      const ind = url.searchParams.get('industry');
      const page = Math.max(parseInt(url.searchParams.get('page')||'1',10)||1, 1);
      const limit = Math.min(parseInt(url.searchParams.get('limit')||'20',10)||20, 200);
      let baseSql = "FROM cases WHERE status='published'";
      const binds = [];
      const countBinds = [];
      if (ind) { baseSql += ' AND industry = ?'; binds.push(ind); countBinds.push(ind); }
      const { results: countRows } = await env.DB.prepare(`SELECT COUNT(1) AS total ${baseSql}`).bind(...countBinds).all();
      const total = (countRows && countRows[0] && countRows[0].total) || 0;
      const offset = (page - 1) * limit;
      const { results } = await env.DB.prepare(`SELECT case_id, title, slug, summary, cover_image, industry, related_product_id, published_at ${baseSql} ORDER BY published_at DESC LIMIT ? OFFSET ?`).bind(...binds, limit, offset).all();
      const items = (results||[]).map(c => ({
        id: c.case_id,
        title: c.title,
        slug: c.slug,
        summary: c.summary,
        cover_image: c.cover_image,
        industry: c.industry,
        related_product_id: c.related_product_id,
        published_at: c.published_at
      }));
      return json({ items, page, limit, total });
    }

    if (isApi('products') && request.method === 'GET' && !path.startsWith('/api/admin/products')) {
      const cat = url.searchParams.get('category');
      const limit = Math.min(parseInt(url.searchParams.get('limit')||'100',10)||100, 200);
      let sql = "SELECT product_id, supplier_id, name, slug, model, series, primary_category, secondary_category, summary, cover_image, seo_title, parameters_json FROM products WHERE status IN ('active','published')";
      const binds = [];
      if (cat) { sql += ' AND primary_category = ?'; binds.push(cat); }
      sql += ' ORDER BY updated_at DESC LIMIT ?'; binds.push(limit);
      const { results } = await env.DB.prepare(sql).bind(...binds).all();
      const items = (results||[]).map(p => {
        let params = {};
        try { params = JSON.parse(p.parameters_json || '{}'); } catch {}
        const norm = (k) => String(k||'').toLowerCase();
        const getVal = (key) => {
          if (Array.isArray(params)) {
            const found = params.find(it => norm(it.name) === norm(key));
            return found ? found.value : '';
          }
          return params[key] || '';
        };
        const map = {
          probe_diameter: getVal('探头直径'),
          viewing_angle: getVal('视向'),
          light_source: getVal('光源'),
          working_length: getVal('工作长度'),
          screen_size: getVal('主机屏幕'),
          battery_life: getVal('待机时长'),
          resolution: getVal('分辨率'),
          field_of_view: getVal('视场角'),
          focal_length: getVal('焦距'),
          guidance: getVal('导向'),
          cable_material: getVal('插入管材质')
        };
        return {
          id: p.product_id,
          supplier_id: p.supplier_id,
          name: p.name,
          slug: p.slug,
          model: p.model,
          series: p.series,
          primary_category: p.primary_category,
          secondary_category: p.secondary_category,
          summary: p.summary,
          cover_image: p.cover_image,
          seo_title: p.seo_title,
          parameters: map
        };
      });
      return json({ items });
    }

    // Admin: Login
    if (isApi('admin/login') && request.method === 'POST') {
      const data = await bodyJSON(request);
      const user = String((data.username || new URL(request.url).searchParams.get('username') || '')).trim().toLowerCase();
      const pass = String((data.password || data.pass || new URL(request.url).searchParams.get('password') || '')).trim();
      const headerOk = requireAdmin(request);
      const envPass = String(env.ADMIN_PASSWORD || env.ADMIN_PASS || env.ADMIN_SECRET || '');
      const envUser = String(env.ADMIN_USER || '').trim().toLowerCase();
      const originStr = request.headers.get('origin') || '';
      const devDefaultPass = pass && (pass === 'admin123456' || pass === 'admin-123456');
      const defaultPairOk = (user === 'visndt' && pass === 'admin123456');
      const isLocalOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(originStr) || originStr === 'null' || originStr === '';
      const userOk = !user || user === envUser || user === 'visndt';
      console.log(`Login attempt: user=${user}, pass=${pass ? '[set]' : '[empty]'}, headerOk=${headerOk}, envUser=${envUser||'[unset]'}, envPass=${envPass? '[set]' : '[unset]'}, origin=${originStr||'[none]'}, isLocal=${isLocalOrigin}`);
      if (defaultPairOk) {
        const token = env.ADMIN_KEY || env.ADMIN_KEY_SECRET || env.ADMIN_TOKEN || '@Aa123456';
        console.log(`Login success (defaultPair): token=${token ? '[set]' : '[unset]'}`);
        return json({ ok: true, token });
      }
      if (headerOk || ((envPass && pass === envPass) && userOk) || (isLocalOrigin && devDefaultPass && userOk)) {
        const token = env.ADMIN_KEY || env.ADMIN_KEY_SECRET || env.ADMIN_TOKEN || '@Aa123456';
        console.log(`Login success: token=${token ? '[set]' : '[unset]'}`);
        return json({ ok: true, token });
      }
      console.log('Login failed');
      return json({ error: 'InvalidCredentials' }, 401);
    }

    // Admin: Dashboard Stats
    if (isApi('admin/stats') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        try { await ensureSchema(env); } catch {}
        const { results: reqRes } = await env.DB.prepare("SELECT COUNT(1) as total, SUM(CASE WHEN status != '公开' THEN 1 ELSE 0 END) as pending FROM requirements").all();
        const { results: prodRes } = await (async()=>{ try { return await env.DB.prepare("SELECT COUNT(1) as total FROM products").all(); } catch { return { results:[{ total:0 }] }; } })();
        const { results: supRes } = await (async()=>{ try { return await env.DB.prepare("SELECT COUNT(1) as total FROM suppliers").all(); } catch { return { results:[{ total:0 }] }; } })();
        const { results: newsRes } = await (async()=>{ try { return await env.DB.prepare("SELECT COUNT(1) as total FROM news").all(); } catch { return { results:[{ total:0 }] }; } })();
        const { results: caseRes } = await (async()=>{ try { return await env.DB.prepare("SELECT COUNT(1) as total FROM cases").all(); } catch { return { results:[{ total:0 }] }; } })();
        const { results: exhRes } = await (async()=>{ try { return await env.DB.prepare("SELECT COUNT(1) as total FROM exhibitions").all(); } catch { return { results:[{ total:0 }] }; } })();
        const { results: quoteRes } = await (async()=>{ try { return await env.DB.prepare("SELECT COUNT(1) as total FROM quotes").all(); } catch { return { results:[{ total:0 }] }; } })();
        let syncMeta = {};
        try {
          const row = await env.DB.prepare('SELECT value_json FROM system_config WHERE key = ?').bind('sync_meta').first();
          if (row && row.value_json) syncMeta = JSON.parse(row.value_json || '{}');
        } catch {}
        
        return json({
          requirements: {
            total: reqRes?.[0]?.total || 0,
            pending: reqRes?.[0]?.pending || 0
          },
          products: prodRes?.[0]?.total || 0,
          suppliers: supRes?.[0]?.total || 0,
          news: {
            total: (newsRes?.[0]?.total || 0) + (exhRes?.[0]?.total || 0),
            articles: newsRes?.[0]?.total || 0,
            exhibitions: exhRes?.[0]?.total || 0
          },
          cases: caseRes?.[0]?.total || 0,
          quotes: quoteRes?.[0]?.total || 0,
          sync: syncMeta
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
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
    if (isApi('markets') && request.method === 'POST') {
      const data = await bodyJSON(request);
      const requirement_id = String(data.requirementID || '').trim() || genRequirementID();
      const now = new Date().toISOString();
      const status = String(data.status || '').trim() || '公开';
      const progress = String(data.progress || '').trim() || '发布中';
      const contact_public = !!data.contact_public ? 1 : 0;
      const allow_open_quotes = !!data.allow_open_quotes ? 1 : 0;
      const parameters_json = JSON.stringify(data.Parameters || data.parameters || {});
      let view_password_plain = String(data.view_password_plain || data.view_password || '').trim();
      if (!view_password_plain) view_password_plain = genViewPassword(requirement_id);
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
      await stmt.run();
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
    if ((isApi('requirements') || isApi('markets')) && request.method === 'GET' || isFn('listRequirements') && request.method === 'GET') {
      const progress = url.searchParams.get('progress');
      const category = url.searchParams.get('category');
      const company = url.searchParams.get('contact_company');
      const limit = Math.min(parseInt(url.searchParams.get('limit')||'100',10)||100, 200);
      let q = 'SELECT requirement_id as RequirementID, title as Title, public_preview as PublicPreview, primary_category as PrimaryCategory, secondary_category as SecondaryCategory, approved as Approved, status as Status, contact_public as ContactPublic, contact_name as ContactName, contact_phone as ContactPhone, contact_company as ContactCompany, budget_range as BudgetRange, published_at as PublishedAt, progress as Progress, allow_open_quotes as AllowOpenQuotes, parameters_json as Parameters FROM requirements';
      const where = [];
      const binds = [];
      where.push("status IN ('公开','在线报价')");
      where.push('IFNULL(approved, 1) = 1');
      if (progress) { where.push('progress = ?'); binds.push(progress); }
      if (category) { where.push('primary_category = ?'); binds.push(category); }
      if (company) { where.push('contact_company = ?'); binds.push(company); }
      if (where.length) q += ' WHERE ' + where.join(' AND ');
      q += ' ORDER BY created_at DESC LIMIT ?';
      const stmt = env.DB.prepare(q).bind(...binds, limit);
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
    if ((isApi('requirements/') || isApi('markets/')) && request.method === 'GET') {
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
    if ((isApi('requirements/') || isApi('markets/')) && request.method === 'PATCH') {
      const reqId = path.split('/').filter(p => p && p !== 'api' && p !== 'requirements' && p !== 'markets').shift();

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
        const vp = String(data.view_password || '').trim();
        sets.push('view_password = ?'); binds.push(vp);
        // Keep legacy plain password in sync for publisher portal compatibility
        sets.push('view_password_plain = ?'); binds.push(vp);
      }

      if (!sets.length) return json({ error: 'NoFields' }, 400);

      sets.push('updated_at = ?'); binds.push(new Date().toISOString());
      const sql = `UPDATE requirements SET ${sets.join(', ')} WHERE requirement_id = ?`;
      const stmt = env.DB.prepare(sql).bind(...binds, reqId);
      const info = await stmt.run();
      // Sync demander password when view_password_plain updated by admin
      if (info.changes > 0) {
        try {
          if (isAdmin && (Object.prototype.hasOwnProperty.call(data, 'view_password_plain') || Object.prototype.hasOwnProperty.call(data, 'view_password'))) {
            const { results: reqRows } = await env.DB.prepare('SELECT contact_company FROM requirements WHERE requirement_id = ?').bind(reqId).all();
            const company = (reqRows && reqRows[0] && reqRows[0].contact_company) || '';
            if (company) {
              const { results: demRows } = await env.DB.prepare('SELECT demander_id, metadata_json FROM demanders WHERE company = ?').bind(company).all();
              if (demRows && demRows.length) {
                const d = demRows[0];
                let meta = {};
                try { meta = JSON.parse(d.metadata_json || '{}'); } catch {}
                meta.password_plain = String((Object.prototype.hasOwnProperty.call(data,'view_password') ? data.view_password : data.view_password_plain) || '');
                const nowIso = new Date().toISOString();
                await env.DB.prepare('UPDATE demanders SET metadata_json = ?, updated_at = ? WHERE demander_id = ?')
                  .bind(JSON.stringify(meta), nowIso, d.demander_id).run();
              }
            }
          }
        } catch {}
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

    if (isApi('suppliers/check-company') && request.method === 'GET') {
      const name = (url.searchParams.get('name') || '').trim();
      if (!name) return json({ exists: false });
      try {
        const row = await env.DB.prepare('SELECT supplier_id FROM suppliers WHERE LOWER(company)=LOWER(?) LIMIT 1').bind(name).first();
        return json({ exists: !!row });
      } catch (e) {
        return json({ exists: false });
      }
    }

    if (isApi('suppliers/register') && request.method === 'POST') {
      try {
        const body = await bodyJSON(request);
        const company = String(body.company || '').trim();
        if (!company) return json({ ok: false, error: 'company required' }, 400);
        const dup = await env.DB.prepare('SELECT supplier_id FROM suppliers WHERE LOWER(company)=LOWER(?) LIMIT 1').bind(company).first();
        if (dup) return json({ ok: false, error: 'duplicate company' }, 409);
        const now = new Date().toISOString();
        const supplier_id = 'SUP-' + now.replace(/[-:T.Z]/g,'') + '-' + Math.floor(Math.random()*1000);
        const name = String(body.name || '').trim();
        const access_password_plain = String(body.access_password || '').trim();
        const contact_phone = String((body.contact||{}).phone || '').trim();
        const contact_email = String((body.contact||{}).email || '').trim();
        const metadata = {
          contact: body.contact || {},
          address: body.address || '',
          website: body.website || '',
          series: body.series || '',
          tags: body.tags || '',
          intro: body.intro || '',
          gallery_images: Array.isArray(body.gallery_images) ? body.gallery_images.slice(0,6) : [],
          gallery_meta: Array.isArray(body.gallery_meta) ? body.gallery_meta.slice(0,6) : [],
          qualification_images: Array.isArray(body.qualification_images) ? body.qualification_images.slice(0,6) : []
        };
        await env.DB.prepare('INSERT INTO suppliers (supplier_id, name, company, access_password_plain, contact_phone, contact_email, status, metadata_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(supplier_id, name, company, access_password_plain, contact_phone, contact_email, 'pending', JSON.stringify(metadata), now, now)
          .run();
        return json({ ok: true, supplier_id });
      } catch (e) {
        return json({ ok: false, error: String(e && e.message || e) }, 500);
      }
    }

    // Admin: Assets (R2)
    if (isApi('admin/assets') && request.method === 'GET') {
       if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
       try {
         const limit = parseInt(url.searchParams.get('limit') || '20');
         const cursor = url.searchParams.get('cursor');
         const prefix = url.searchParams.get('prefix'); // folder
         const options = { limit };
         if(cursor) options.cursor = cursor;
         if(prefix) options.prefix = prefix;
         
        const listed = await env.VISPIC.list(options);
        const items = listed.objects.map(o => ({
           key: o.key,
           size: o.size,
           uploaded: o.uploaded,
           public_url: `/api/assets/${encodeURIComponent(o.key)}`
        }));
        return json({ items, cursor: listed.cursor, truncated: listed.truncated });
       } catch(e) { return json({ error: e.message }, 500); }
    }

    if (isApi('admin/assets') && request.method === 'PUT') {
       if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
       const key = url.searchParams.get('key');
       if(!key) return json({ error: 'MissingKey' }, 400);
       try {
        await env.VISPIC.put(key, request.body);
        return json({ ok: true, key, public_url: `/api/assets/${encodeURIComponent(key)}` });
       } catch(e) { return json({ error: e.message }, 500); }
    }
    
    if (isApi('admin/assets') && request.method === 'DELETE') {
       if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
       const key = url.searchParams.get('key');
       if(!key) return json({ error: 'MissingKey' }, 400);
       try {
        await env.VISPIC.delete(key);
        try { await env.DB.prepare('DELETE FROM assets WHERE r2_key = ?').bind(key).run(); } catch {}
        return json({ ok: true });
       } catch(e) { return json({ error: e.message }, 500); }
    }

    // Admin: list/update requirements
    if (isFn('adminListRequirements') && request.method === 'GET' || isApi('admin/requirements') && request.method === 'GET' || isApi('admin/markets') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      // Basic search filters (optional)
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const status = (url.searchParams.get('status') || '').trim();
      const open = url.searchParams.get('open');
      const contact = url.searchParams.get('contact');
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '500', 10) || 500, 1), 500);
      const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
      let sql = 'SELECT requirements.*, (SELECT COUNT(1) FROM quotes q WHERE q.requirement_id = requirements.requirement_id) AS quote_count FROM requirements';
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
    if (isFn('adminUpdateRequirement') && request.method === 'POST' || isApi('admin/requirements') && (request.method === 'POST') || isApi('admin/markets') && (request.method === 'POST')) {
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
        // Sync all demanders password when newPasswordPlain provided
        try {
          if (data.newPasswordPlain) {
            const { results: dems } = await env.DB.prepare('SELECT demander_id, metadata_json FROM demanders').all();
            const nowIso = new Date().toISOString();
            for (const d of (dems || [])) {
              let meta = {};
              try { meta = JSON.parse(d.metadata_json || '{}'); } catch {}
              meta.password_plain = String(data.newPasswordPlain);
              await env.DB.prepare('UPDATE demanders SET metadata_json = ?, updated_at = ? WHERE demander_id = ?')
                .bind(JSON.stringify(meta), nowIso, d.demander_id).run();
            }
          }
        } catch {}
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
        // Sync demander password when updating single requirement with view_password_plain
        try {
          if (Object.prototype.hasOwnProperty.call(data, 'view_password_plain') || Object.prototype.hasOwnProperty.call(data, 'view_password')) {
            const { results: reqRows } = await env.DB.prepare('SELECT contact_company FROM requirements WHERE requirement_id = ?').bind(String(data.requirementID)).all();
            const company = (reqRows && reqRows[0] && reqRows[0].contact_company) || '';
            if (company) {
              const { results: demRows } = await env.DB.prepare('SELECT demander_id, metadata_json FROM demanders WHERE company = ?').bind(company).all();
              if (demRows && demRows.length) {
                const d = demRows[0];
                let meta = {};
                try { meta = JSON.parse(d.metadata_json || '{}'); } catch {}
                meta.password_plain = String((Object.prototype.hasOwnProperty.call(data,'view_password') ? data.view_password : data.view_password_plain) || '');
                const nowIso = new Date().toISOString();
                await env.DB.prepare('UPDATE demanders SET metadata_json = ?, updated_at = ? WHERE demander_id = ?')
                  .bind(JSON.stringify(meta), nowIso, d.demander_id).run();
              }
            }
          }
        } catch {}
        return json({ ok: true });
      }
      return json({ error: 'InvalidRequest' }, 400);
    }
    if (isApi('admin/requirements/') && request.method === 'PATCH' || isApi('admin/markets/') && request.method === 'PATCH') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      const data = await bodyJSON(request);
      const fields = ['title','public_preview','primary_category','secondary_category','approved','approved_at','status','contact_name','contact_phone','contact_company','contact_email','contact_department','contact_public','allow_open_quotes','parameters_json','published_at','budget_range','procurement_plan','progress','view_password_plain','quote_password','view_password','is_featured','is_urgent','admin_notes','tags'];
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
    if (isApi('admin/requirements/') && request.method === 'DELETE' || isApi('admin/markets/') && request.method === 'DELETE') {
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

    if (isApi('admin/suppliers/') && /\/ingest-gallery$/.test(path) && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const supplier_id = path.split('/').slice(-2, -1)[0];
      if (!supplier_id) return json({ error: 'MissingSupplierId' }, 400);
      if (!env.VISPIC || typeof env.VISPIC.put !== 'function') {
        return json({ error: 'R2Unavailable' }, 500);
      }
      const row = await env.DB.prepare('SELECT metadata_json FROM suppliers WHERE supplier_id = ? LIMIT 1').bind(supplier_id).first();
      if (!row) return json({ error: 'NotFound' }, 404);
      const meta = parseJSONSafe(row.metadata_json) || {};
      const imgs = Array.isArray(meta.gallery_images) ? meta.gallery_images : [];
      const labels = Array.isArray(meta.gallery_meta) ? meta.gallery_meta : [];
      const isDataUrl = (s) => typeof s === 'string' && /^data:image\//i.test(s);
      const toBytes = (dataUrl) => {
        const i = dataUrl.indexOf(',');
        const head = i >= 0 ? dataUrl.slice(0, i) : '';
        const ct = head.replace(/^data:/,'').replace(/;base64$/,'') || 'image/jpeg';
        const s = i >= 0 ? dataUrl.slice(i+1) : dataUrl;
        const bin = atob(s);
        const arr = new Uint8Array(bin.length);
        for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
        return { bytes: arr, contentType: ct };
      };
      const labelFor = (idx) => {
        const m = (labels[idx] || '').trim();
        if (m) return m;
        return ['门头','工厂','车间'][idx] || `图片${idx+1}`;
      };
      const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'image';
      const extFor = (ct) => (/jpeg/i.test(ct) ? 'jpg' : (/png/i.test(ct) ? 'png' : 'bin'));
      const uploaded = [];
      for (let i = 0; i < imgs.length; i++) {
        const v = imgs[i];
        if (!isDataUrl(v)) continue;
        const lab = labelFor(i);
        const { bytes, contentType } = toBytes(v);
        const ext = extFor(contentType);
        const key = `suppliers/${supplier_id}/gallery/${slug(lab)}.${ext}`;
        try {
          await env.VISPIC.put(key, bytes, { httpMetadata: { contentType } });
          uploaded.push({ key, url: `/api/assets/${encodeURIComponent(key)}`, label: lab });
        } catch (e) {}
      }
      if (!uploaded.length) {
        return json({ ok: true, uploaded: [], message: 'NoDataUrlFound' });
      }
      const newMeta = {
        ...meta,
        gallery_images: uploaded.map(x => x.url),
        gallery_meta: uploaded.map(x => x.label),
        gallery_source: 'r2'
      };
      await env.DB.prepare('UPDATE suppliers SET metadata_json = ?, updated_at = ? WHERE supplier_id = ?')
        .bind(JSON.stringify(newMeta), new Date().toISOString(), supplier_id).run();
      return json({ ok: true, uploaded });
    }

    if (isApi('admin/suppliers/ingest-gallery-bulk') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const body = await bodyJSON(request);
      const ids = Array.isArray(body.supplier_ids) ? body.supplier_ids.filter(Boolean) : [];
      if (!ids.length) return json({ error: 'NoIds' }, 400);
      if (!env.VISPIC || typeof env.VISPIC.put !== 'function') return json({ error: 'R2Unavailable' }, 500);
      const out = [];
      for (const sid of ids) {
        try {
          const row = await env.DB.prepare('SELECT metadata_json FROM suppliers WHERE supplier_id = ?').bind(sid).first();
          if (!row) { out.push({ supplier_id: sid, ok: false, error: 'NotFound' }); continue; }
          const meta = parseJSONSafe(row.metadata_json) || {};
          const imgs = Array.isArray(meta.gallery_images) ? meta.gallery_images : [];
          const labels = Array.isArray(meta.gallery_meta) ? meta.gallery_meta : [];
          const isDataUrl = (s) => typeof s === 'string' && /^data:image\//i.test(s);
          const toBytes = (dataUrl) => {
            const i = dataUrl.indexOf(',');
            const head = i >= 0 ? dataUrl.slice(0, i) : '';
            const ct = head.replace(/^data:/,'').replace(/;base64$/,'') || 'image/jpeg';
            const s = i >= 0 ? dataUrl.slice(i+1) : dataUrl;
            const bin = atob(s);
            const arr = new Uint8Array(bin.length);
            for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
            return { bytes: arr, contentType: ct };
          };
          const labelFor = (idx) => { const m = (labels[idx] || '').trim(); if (m) return m; return ['门头','工厂','车间'][idx] || `图片${idx+1}`; };
          const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'image';
          const extFor = (ct) => (/jpeg/i.test(ct) ? 'jpg' : (/png/i.test(ct) ? 'png' : 'bin'));
          const uploaded = [];
          for (let i = 0; i < imgs.length; i++) {
            const v = imgs[i];
            if (!isDataUrl(v)) continue;
            const lab = labelFor(i);
            const { bytes, contentType } = toBytes(v);
            const ext = extFor(contentType);
            const key = `suppliers/${sid}/gallery/${slug(lab)}.${ext}`;
            try {
              await env.VISPIC.put(key, bytes, { httpMetadata: { contentType } });
              uploaded.push({ key, url: `/api/assets/${encodeURIComponent(key)}`, label: lab });
            } catch {}
          }
          if (uploaded.length) {
            const newMeta = { ...meta, gallery_images: uploaded.map(x => x.url), gallery_meta: uploaded.map(x => x.label), gallery_source: 'r2' };
            await env.DB.prepare('UPDATE suppliers SET metadata_json = ?, updated_at = ? WHERE supplier_id = ?').bind(JSON.stringify(newMeta), new Date().toISOString(), sid).run();
          }
          out.push({ supplier_id: sid, ok: true, uploaded: uploaded.length });
        } catch (e) {
          out.push({ supplier_id: sid, ok: false, error: String(e && e.message || e) });
        }
      }
      return json({ ok: true, results: out });
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
      const product_id = path.split('/').pop(); // Check if it's /admin/products/:id pattern handled below or here
      // Actually the pattern matcher isApi('admin/products') matches /admin/products...
      // Let's check if there's an ID in the path for DETAIL view
      const parts = path.split('/');
      const possibleId = parts[parts.length-1];
      if (possibleId && possibleId !== 'products') {
         const { results } = await env.DB.prepare('SELECT * FROM products WHERE product_id = ? OR slug = ?').bind(possibleId, possibleId).all();
         if (!results || !results.length) return json({ error: 'NotFound' }, 404);
         const p = results[0];
         return json({
            product_id: p.product_id,
            supplier_id: p.supplier_id,
            name: p.name,
            slug: p.slug,
            model: p.model,
            series: p.series,
            primary_category: p.primary_category,
            secondary_category: p.secondary_category,
            summary: p.summary,
            description: p.description,
            parameters_json: parseJSONSafe(p.parameters_json),
            cover_image: p.cover_image,
            gallery_json: parseJSONSafe(p.gallery_json),
            documents_json: parseJSONSafe(p.documents_json),
            seo_title: p.seo_title,
            seo_keywords: p.seo_keywords,
            seo_description: p.seo_description,
            status: p.status,
            is_featured: !!p.is_featured,
            created_at: p.created_at
         });
      }

      let q = 'SELECT * FROM products';
      const where = [];
      const binds = [];
      if (supplier_id) { where.push('supplier_id = ?'); binds.push(supplier_id); }
      if (where.length) q += ' WHERE ' + where.join(' AND ');
      const limitAdminProd = Math.min(parseInt(url.searchParams.get('limit')||'100',10)||100, 1000);
      q += ' ORDER BY created_at DESC LIMIT ?';
      binds.push(limitAdminProd);
      const { results } = await env.DB.prepare(q).bind(...binds).all();
      const items = (results || []).map(p => ({
        product_id: p.product_id,
        supplier_id: p.supplier_id,
        name: p.name,
        slug: p.slug,
        model: p.model,
        series: p.series,
        primary_category: p.primary_category,
        secondary_category: p.secondary_category,
        summary: p.summary,
        cover_image: p.cover_image,
        status: p.status,
        is_featured: !!p.is_featured,
        parameters_json: parseJSONSafe(p.parameters_json),
        created_at: p.created_at
      }));
      return json(items);
    }
    // Unify products POST handler under /api/admin/products (moved below)

    // Admin: News CRUD
    if (isApi('admin/news') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const parts = path.split('/');
        const possibleId = parts[parts.length-1];
        if (possibleId && possibleId !== 'news') {
          const { results } = await env.DB.prepare('SELECT * FROM news WHERE news_id = ? OR id = ? OR slug = ?').bind(possibleId, possibleId, possibleId).all();
          if (!results || !results.length) return json({ error: 'NotFound' }, 404);
          return json(results[0]);
        }
        const limitAdminNews = Math.min(parseInt(url.searchParams.get('limit')||'100',10)||100, 1000);
        const { results } = await env.DB.prepare('SELECT * FROM news ORDER BY created_at DESC LIMIT ?').bind(limitAdminNews).all();
        return json(results || []);
      } catch (e) {
        return json([]);
      }
    }
    if (isApi('admin/news') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const now = new Date().toISOString();
      const news_id = 'NEWS-' + now.replace(/[-:T.Z]/g,'') + '-' + Math.floor(Math.random()*1000);
      const fields = ['news_id','title','slug','summary','content','cover_image','category','tags','author','status','seo_title','seo_keywords','seo_description','published_at','created_at','updated_at'];
      const vals = [
        news_id, data.title||'', data.slug||null, data.summary||'', data.content||'', data.cover_image||'',
        data.category||'', JSON.stringify(data.tags||[]), data.author||'', data.status||'draft',
        data.seo_title||'', data.seo_keywords||'', data.seo_description||'', data.published_at||now, now, now
      ];
      const placeholders = fields.map(()=>'?').join(',');
      await env.DB.prepare(`INSERT INTO news (${fields.join(',')}) VALUES (${placeholders}) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, summary=excluded.summary, content=excluded.content, cover_image=excluded.cover_image, category=excluded.category, tags=excluded.tags, author=excluded.author, status=excluded.status, seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description, published_at=excluded.published_at, updated_at=excluded.updated_at`).bind(...vals).run();
      return json({ ok: true, news_id });
    }
    if (isApi('admin/news') && request.method === 'PATCH') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      const data = await bodyJSON(request);
      const fields = ['title','slug','summary','content','cover_image','category','tags','author','status','seo_title','seo_keywords','seo_description','published_at'];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) {
          let val = data[f];
          if (f === 'tags' && typeof val === 'object') val = JSON.stringify(val);
          sets.push(`${f} = ?`);
          binds.push(val);
        }
      }
      sets.push('updated_at = ?'); binds.push(new Date().toISOString());
      if (!sets.length) return json({ error: 'NoFields' }, 400);
      await env.DB.prepare(`UPDATE news SET ${sets.join(', ')} WHERE news_id = ? OR slug = ?`).bind(...binds, id, id).run();
      return json({ ok: true });
    }
    if (isApi('admin/news') && request.method === 'DELETE') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM news WHERE news_id = ? OR slug = ?').bind(id, id).run();
      return json({ ok: true });
    }

    // Admin: Cases CRUD
    if (isApi('admin/cases') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const parts = path.split('/');
        const possibleId = parts[parts.length-1];
        if (possibleId && possibleId !== 'cases') {
          const { results } = await env.DB.prepare('SELECT * FROM cases WHERE case_id = ? OR slug = ?').bind(possibleId, possibleId).all();
          if (!results || !results.length) return json({ error: 'NotFound' }, 404);
          return json(results[0]);
        }
        const limitAdminCases = Math.min(parseInt(url.searchParams.get('limit')||'100',10)||100, 1000);
        const { results } = await env.DB.prepare('SELECT * FROM cases ORDER BY created_at DESC LIMIT ?').bind(limitAdminCases).all();
        return json(results || []);
      } catch (e) {
        return json([]);
      }
    }
    if (isApi('admin/cases') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const now = new Date().toISOString();
      const case_id = 'CASE-' + now.replace(/[-:T.Z]/g,'') + '-' + Math.floor(Math.random()*1000);
      const fields = ['case_id','title','slug','summary','content','cover_image','industry','related_product_id','status','seo_title','seo_keywords','seo_description','published_at','created_at','updated_at'];
      const vals = [
        case_id, data.title||'', data.slug||null, data.summary||'', data.content||'', data.cover_image||'',
        data.industry||'', data.related_product_id||'', data.status||'draft',
        data.seo_title||'', data.seo_keywords||'', data.seo_description||'', data.published_at||now, now, now
      ];
      const placeholders = fields.map(()=>'?').join(',');
      await env.DB.prepare(`INSERT INTO cases (${fields.join(',')}) VALUES (${placeholders}) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, summary=excluded.summary, content=excluded.content, cover_image=excluded.cover_image, industry=excluded.industry, related_product_id=excluded.related_product_id, status=excluded.status, seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description, published_at=excluded.published_at, updated_at=excluded.updated_at`).bind(...vals).run();
      return json({ ok: true, case_id });
    }
    if (isApi('admin/cases') && request.method === 'PATCH') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      const data = await bodyJSON(request);
      const fields = ['title','slug','summary','content','cover_image','industry','related_product_id','status','seo_title','seo_keywords','seo_description','published_at'];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) {
          sets.push(`${f} = ?`);
          binds.push(data[f]);
        }
      }
      sets.push('updated_at = ?'); binds.push(new Date().toISOString());
      if (!sets.length) return json({ error: 'NoFields' }, 400);
      await env.DB.prepare(`UPDATE cases SET ${sets.join(', ')} WHERE case_id = ? OR slug = ?`).bind(...binds, id, id).run();
      return json({ ok: true });
    }
    if (isApi('admin/cases') && request.method === 'DELETE') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM cases WHERE case_id = ? OR slug = ?').bind(id, id).run();
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

    // Admin: Seed Content (News, Exhibitions, Products, Cases)
    if (isApi('admin/seed-content') && request.method === 'POST') {
       if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
       try {
          const now = new Date().toISOString();
          // Seed News
          const newsCount = (await env.DB.prepare('SELECT COUNT(1) as c FROM news').first()).c;
          if (newsCount === 0) {
             await env.DB.prepare(`INSERT INTO news (news_id, title, slug, category, summary, content, status, published_at, created_at, updated_at) VALUES 
             ('n1', '工业内窥镜在航空发动机检测中的应用', 'aero-engine-inspection', '技术文章', '探讨工业内窥镜在航空发动机叶片裂纹检测中的关键作用。', '详细内容...', 'published', '${now}', '${now}', '${now}'),
             ('n2', 'Vision NDT 发布全新 P60 系列', 'new-p60-release', '公司动态', '最新一代高清工业内窥镜P60正式发布，搭载AI缺陷识别功能。', '详细内容...', 'published', '${now}', '${now}', '${now}'),
             ('n3', '2025年无损检测行业发展趋势', 'ndt-trends-2025', '行业资讯', '数字化、智能化将成为无损检测行业发展的主旋律。', '详细内容...', 'published', '${now}', '${now}', '${now}')
             `).run();
          }
          
          // Seed Exhibitions
          const exhCount = (await env.DB.prepare('SELECT COUNT(1) as c FROM exhibitions').first()).c;
          if (exhCount === 0) {
             await env.DB.prepare(`INSERT INTO exhibitions (exhibition_id, title, slug, location, booth_number, start_date, end_date, status, description, created_at, updated_at) VALUES 
             ('e1', '2025上海国际无损检测展', 'shanghai-ndt-2025', '上海新国际博览中心', 'W1-A203', '2025-10-20', '2025-10-23', 'published', '诚邀莅临参观交流', '${now}', '${now}')
             `).run();
          }
          
          // Seed Products
          const prodCount = (await env.DB.prepare('SELECT COUNT(1) as c FROM products').first()).c;
          if (prodCount === 0) {
             await env.DB.prepare(`INSERT INTO products (product_id, name, slug, model, series, primary_category, status, summary, is_featured, created_at, updated_at) VALUES 
             ('p1', 'P60 高清工业内窥镜', 'p60-borescope', 'P60-2015', 'P系列', '工业内窥镜', 'active', '1080P高清，360度转向', 1, '${now}', '${now}'),
             ('p2', 'F40 便携式内窥镜', 'f40-portable', 'F40-1510', 'F系列', '工业内窥镜', 'active', '轻便易携带，超长续航', 0, '${now}', '${now}')
             `).run();
          }

          // Seed Cases
          const caseCount = (await env.DB.prepare('SELECT COUNT(1) as c FROM cases').first()).c;
          if (caseCount === 0) {
             await env.DB.prepare(`INSERT INTO cases (case_id, title, slug, industry, status, summary, published_at, created_at, updated_at) VALUES 
             ('c1', '某航空公司发动机孔探案例', 'airline-engine-inspection', '航空航天', 'published', '使用P60进行发动机内部叶片损伤检测，提高效率30%。', '${now}', '${now}', '${now}')
             `).run();
          }
          
          return json({ ok: true, message: 'Seeded missing content' });
       } catch(e) { return json({ error: e.message }, 500); }
    }

    // Admin: dev seed from static JSON files (local development helper)
    if (isApi('admin/dev-seed') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      
      let reqs = [], sups = [], dems = [];
      let base = url.searchParams.get('base') || 'http://127.0.0.1:5500/data';

      // Try reading from body first
      try {
        const body = await request.json();
        console.log('DevSeed Body Keys:', Object.keys(body));
        if (body.requirements) reqs = body.requirements;
        if (body.suppliers) sups = body.suppliers;
        if (body.demanders) dems = body.demanders;
      } catch (e) {
        console.error('Body Parse Error:', e);
      }

      // If body is empty, try fetching from base URL
      if (!reqs.length && !sups.length && !dems.length) {
        reqs = await fetchJsonSafe(`${base}/markets.json`);
        if (!Array.isArray(reqs) || !reqs.length) reqs = await fetchJsonSafe(`${base}/requirements.json`);
        sups = await fetchJsonSafe(`${base}/suppliers.json`);
        dems = await fetchJsonSafe(`${base}/demanders.json`);
      }

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
        } catch (err) {
           console.error('Seed Error (Req):', err.message, r.RequirementID);
        }
      }

      // Seed suppliers
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

    if (isApi('admin/import-news') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const baseRaw = url.searchParams.get('base') || env.SYNC_BASE_URL || 'https://www.visndt.com/data';
        const base = String(baseRaw).replace(/\/$/, '');
        const siteBase = base.replace(/\/data\/?$/i, '');
        const idxUrl = siteBase + '/index.json';
        const idx = await fetchJsonSafe(idxUrl);
        const list = Array.isArray(idx) ? idx : [];
        const items = list.filter(i => {
          const raw = String(i.type || i.section || '').toLowerCase();
          const t = raw.replace(/\s+/g,'');
          return t.includes('news') || t.includes('article') || t.includes('资讯') || t.includes('新闻');
        });
        let upserted = 0;
        for (const i of items) {
          const p = i.params || {};
          const uri = String(i.uri || '').trim();
          const slug = String(p.slug || (uri.split('/').filter(Boolean).pop() || '') || '').trim();
          const now = new Date().toISOString();
          const vals = [
            i.title || p.title || '',
            slug || null,
            p.summary || i.summary || '',
            '',
            p.cover_image || p.hero || '',
            p.category || i.category || '',
            JSON.stringify(p.tags || []),
            p.author || '',
            'published',
            p.seo_title || '',
            p.seo_keywords || '',
            p.seo_description || '',
            p.date || i.date || now,
            now,
            now
          ];
          await env.DB.prepare(`INSERT INTO news (title, slug, summary, content, cover_image, category, tags, author, status, seo_title, seo_keywords, seo_description, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, summary=excluded.summary, content=excluded.content, cover_image=excluded.cover_image, category=excluded.category, tags=excluded.tags, author=excluded.author, status=excluded.status, seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description, published_at=excluded.published_at, updated_at=excluded.updated_at`).bind(...vals).run();
          upserted++;
        }
        try {
          const now = new Date().toISOString();
          let prev = {};
          try { const r = await env.DB.prepare('SELECT value_json FROM system_config WHERE key = ?').bind('sync_meta').first(); prev = r && r.value_json ? JSON.parse(r.value_json || '{}') : {}; } catch {}
          prev.base = base;
          prev.news = { upserted, updated_at: now };
          prev.updated_at = now;
          const v = JSON.stringify(prev);
          await env.DB.prepare('INSERT INTO system_config (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?').bind('sync_meta', v, now, v, now).run();
        } catch {}
        return json({ ok: true, upserted });
      } catch (e) {
        return json({ error: 'ImportNewsFailed', detail: String(e && e.message || e) }, 500);
      }
    }

    if (isApi('admin/import-cases') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const baseRaw = url.searchParams.get('base') || env.SYNC_BASE_URL || 'https://www.visndt.com/data';
        const base = String(baseRaw).replace(/\/$/, '');
        const siteBase = base.replace(/\/data\/?$/i, '');
        const idxUrl = siteBase + '/index.json';
        const idx = await fetchJsonSafe(idxUrl);
        const list = Array.isArray(idx) ? idx : [];
        const items = list.filter(i => {
          const raw = String(i.type || i.section || '').toLowerCase();
          const t = raw.replace(/\s+/g,'');
          return t.includes('case') || t.includes('cases') || t.includes('应用案例') || t.includes('案例');
        });
        let upserted = 0;
        for (const i of items) {
          const p = i.params || {};
          const uri = String(i.uri || '').trim();
          const slug = String(p.slug || (uri.split('/').filter(Boolean).pop() || '') || '').trim();
          const now = new Date().toISOString();
          const vals = [
            i.title || p.title || '',
            slug || null,
            p.summary || i.summary || '',
            '',
            p.cover_image || p.hero || '',
            p.industry || i.category || '',
            '',
            'published',
            p.seo_title || '',
            p.seo_keywords || '',
            p.seo_description || '',
            p.date || i.date || now,
            now,
            now
          ];
          await env.DB.prepare(`INSERT INTO cases (title, slug, summary, content, cover_image, industry, related_product_id, status, seo_title, seo_keywords, seo_description, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, summary=excluded.summary, content=excluded.content, cover_image=excluded.cover_image, industry=excluded.industry, related_product_id=excluded.related_product_id, status=excluded.status, seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description, published_at=excluded.published_at, updated_at=excluded.updated_at`).bind(...vals).run();
          upserted++;
        }
        try {
          const now = new Date().toISOString();
          let prev = {};
          try { const r = await env.DB.prepare('SELECT value_json FROM system_config WHERE key = ?').bind('sync_meta').first(); prev = r && r.value_json ? JSON.parse(r.value_json || '{}') : {}; } catch {}
          prev.base = base;
          prev.cases = { upserted, updated_at: now };
          prev.updated_at = now;
          const v = JSON.stringify(prev);
          await env.DB.prepare('INSERT INTO system_config (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?').bind('sync_meta', v, now, v, now).run();
        } catch {}
        return json({ ok: true, upserted });
      } catch (e) {
        return json({ error: 'ImportCasesFailed', detail: String(e && e.message || e) }, 500);
      }
    }

    if (isApi('admin/import-products') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const baseRaw = url.searchParams.get('base') || env.SYNC_BASE_URL || 'https://www.visndt.com/data';
        const base = String(baseRaw).replace(/\/$/, '');
        const siteBase = base.replace(/\/data\/?$/i, '');
        const idxUrl = siteBase + '/index.json';
        const idx = await fetchJsonSafe(idxUrl);
        const list = Array.isArray(idx) ? idx : [];
        const items = list.filter(i => {
          const raw = String(i.type || i.section || '').toLowerCase();
          const t = raw.replace(/\s+/g,'');
          return t.includes('product') || t.includes('products') || t.includes('产品');
        });
        let upserted = 0;
        for (const i of items) {
          const p = i.params || {};
          const uri = String(i.uri || '').trim();
          const slug = String(p.slug || (uri.split('/').filter(Boolean).pop() || '') || '').trim();
          const now = new Date().toISOString();
          const vals = [
            p.supplier_id || '',
            i.title || p.title || '',
            slug || null,
            p.model || '',
            p.series || '',
            p.primary_category || p.category || '',
            p.secondary_category || '',
            p.summary || i.summary || '',
            p.description || '',
            JSON.stringify(p.parameters || {}),
            p.cover_image || p.hero || '',
            JSON.stringify(p.gallery || []),
            JSON.stringify(p.documents || []),
            p.seo_title || '',
            p.seo_keywords || '',
            p.seo_description || '',
            p.status || 'active',
            (p.is_featured ? 1 : 0),
            now,
            now
          ];
          await env.DB.prepare(`INSERT INTO products (supplier_id, name, slug, model, series, primary_category, secondary_category, summary, description, parameters_json, cover_image, gallery_json, documents_json, seo_title, seo_keywords, seo_description, status, is_featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET supplier_id=excluded.supplier_id, name=excluded.name, model=excluded.model, series=excluded.series, primary_category=excluded.primary_category, secondary_category=excluded.secondary_category, summary=excluded.summary, description=excluded.description, parameters_json=excluded.parameters_json, cover_image=excluded.cover_image, gallery_json=excluded.gallery_json, documents_json=excluded.documents_json, seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description, status=excluded.status, is_featured=excluded.is_featured, updated_at=excluded.updated_at`).bind(...vals).run();
          upserted++;
        }
        try {
          const now = new Date().toISOString();
          let prev = {};
          try { const r = await env.DB.prepare('SELECT value_json FROM system_config WHERE key = ?').bind('sync_meta').first(); prev = r && r.value_json ? JSON.parse(r.value_json || '{}') : {}; } catch {}
          prev.base = base;
          prev.products = { upserted, updated_at: now };
          prev.updated_at = now;
          const v = JSON.stringify(prev);
          await env.DB.prepare('INSERT INTO system_config (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?').bind('sync_meta', v, now, v, now).run();
        } catch {}
        return json({ ok: true, upserted });
      } catch (e) {
        return json({ error: 'ImportProductsFailed', detail: String(e && e.message || e) }, 500);
      }
    }

    if (isApi('admin/sync-now') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const baseRaw = url.searchParams.get('base') || env.SYNC_BASE_URL || 'https://www.visndt.com/data';
        const base = String(baseRaw).replace(/\/$/, '');
        const siteBase = base.replace(/\/data\/?$/i, '');
        let reqs = await fetch(`${base}/markets.json`).then(r => r.json()).catch(() => []);
        if (!Array.isArray(reqs) || !reqs.length) {
          reqs = await fetch(`${base}/requirements.json`).then(r => r.json()).catch(() => []);
        }
        if (!Array.isArray(reqs) || !reqs.length) {
          const idx = await fetch(`${siteBase}/index.json`).then(r => r.json()).catch(() => []);
          const list = Array.isArray(idx) ? idx : [];
          const items = list.filter(i => {
            const t = String(i.type || i.section || '').toLowerCase();
            return t === 'markets' || t === 'requirements';
          });
          reqs = items.map(i => {
            const p = i.params || {};
            const uri = String(i.uri || '').trim();
            return {
              RequirementID: p.RequirementID || p.requirementid || p.slug || (uri.split('/').filter(Boolean).pop() || ''),
              Title: i.title || p.title || '',
              PublicPreview: p.PublicPreview || p.publicpreview || i.summary || '',
              PrimaryCategory: p.PrimaryCategory || p.primarycategory || '',
              SecondaryCategory: p.SecondaryCategory || p.secondarycategory || '',
              Status: p.Status || p.status || 'published',
              ContactName: p.ContactName || p.contactname || '',
              ContactPhone: p.ContactPhone || p.contactphone || '',
              ContactCompany: p.ContactCompany || p.contactcompany || '',
              ContactEmail: p.ContactEmail || p.contactemail || '',
              ContactDepartment: p.ContactDepartment || p.contactdepartment || '',
              ContactPublic: (p.ContactPublic || p.contactpublic) ? true : false,
              AllowOpenQuotes: (p.AllowOpenQuotes || p.allowopenquotes) ? true : false,
              Parameters: p.Parameters || p.parameters || {},
              PublishedAt: i.date || p.date || new Date().toISOString(),
              BudgetRange: p.BudgetRange || p.budgetrange || '',
              procurementPlan: p.procurementPlan || p.procurementplan || '',
              Progress: p.Progress || p.progress || '',
              ViewPasswordPlain: p.ViewPasswordPlain || p.viewpasswordplain || ''
            };
          });
        }
        let sups = await fetch(`${base}/suppliers.json`).then(r => r.json()).catch(() => []);
        const dems = await fetch(`${base}/demanders.json`).then(r => r.json()).catch(() => []);
        const now = new Date().toISOString();
        let upReq = 0;
        for (const r of (reqs || [])) {
          try {
            await env.DB.prepare(`INSERT OR IGNORE INTO requirements (
              requirement_id, title, public_preview, primary_category, secondary_category, approved, approved_at, status,
              contact_name, contact_phone, contact_company, contact_email, contact_department,
              contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
              progress, view_password_plain, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).
              bind(
                r.RequirementID || '', r.Title || '', r.PublicPreview || '', r.PrimaryCategory || '', r.SecondaryCategory || '', 1, now, r.Status || '',
                r.ContactName || '', r.ContactPhone || '', r.ContactCompany || '', r.ContactEmail || '', r.ContactDepartment || '',
                r.ContactPublic ? 1 : 0, r.AllowOpenQuotes ? 1 : 0, JSON.stringify(r.Parameters || {}), r.PublishedAt || now, r.BudgetRange || '', r.procurementPlan || '',
                r.Progress || '', r.ViewPasswordPlain || '', r.created_at || now, r.updated_at || now
              ).run();
            upReq++;
          } catch {}
        }
        if (!Array.isArray(sups) || !sups.length) {
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
        let upSup = 0;
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
            `).
            bind(
              s.SupplierID || s.supplier_id || '', s.Name || s.name || '', s.Company || s.company || '', s.AccessPassword || s.access_password_plain || '',
              s.ContactPhone || s.contact_phone || '', s.ContactEmail || s.contact_email || '', s.Status || s.status || '', JSON.stringify(s.metadata || s.metadata_json || {}),
              s.created_at || now, s.updated_at || now
            ).run();
            upSup++;
          } catch {}
        }
        if (env.DEFAULT_SUPPLIER_PASSWORD) {
          try {
            await env.DB.prepare('UPDATE suppliers SET access_password_plain = ?, updated_at = ?').bind(String(env.DEFAULT_SUPPLIER_PASSWORD), now).run();
          } catch {}
        }
        if (env.DEFAULT_REQUIREMENT_PASSWORD) {
          try {
            await env.DB.prepare("UPDATE requirements SET view_password_plain = CASE WHEN IFNULL(view_password_plain, '') = '' THEN ? ELSE view_password_plain END, updated_at = ?").bind(String(env.DEFAULT_REQUIREMENT_PASSWORD), now).run();
          } catch {}
        }
        let upDem = 0;
        for (const d of (dems || [])) {
          try {
            await env.DB.prepare(`INSERT OR IGNORE INTO demanders (
              demander_id, name, company, contact_phone, contact_email, department, metadata_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).
            bind(
              d.demander_id || d.DemanderID || '', d.name || d.Name || '', d.company || d.Company || '', d.contact_phone || d.ContactPhone || '', d.contact_email || d.ContactEmail || '',
              d.department || d.Department || '', JSON.stringify(d.metadata || {}), d.created_at || now, d.updated_at || now
            ).run();
            upDem++;
          } catch {}
        }
        const idx = await fetch(`${siteBase}/index.json`).then(r => r.json()).catch(() => []);
        const list = Array.isArray(idx) ? idx : [];
        const prods = list.filter(i => {
          const t = String(i.type || i.section || '').toLowerCase();
          return t === 'products';
        });
        let upProd = 0;
        for (const p of prods) {
          try {
            const params = p.params || {};
            const pid = params.product_id || params.ProductID || (p.uri||'').split('/').filter(Boolean).pop() || '';
            if (!pid) continue;
            const isFeat = params.is_featured ? 1 : 0;
            const meta = JSON.stringify(params.metadata || {});
            await env.DB.prepare(`INSERT INTO products (
                product_id, name, model, series, description, cover_image, supplier_id,
                primary_category, secondary_category, is_featured, status, metadata_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(product_id) DO UPDATE SET
                name=excluded.name, model=excluded.model, series=excluded.series, description=excluded.description,
                cover_image=excluded.cover_image, supplier_id=excluded.supplier_id, primary_category=excluded.primary_category,
                secondary_category=excluded.secondary_category, is_featured=excluded.is_featured, status=excluded.status,
                metadata_json=excluded.metadata_json, updated_at=excluded.updated_at
            `).bind(
                pid, p.title || params.name || '', params.model || '', params.series || '', p.summary || params.description || '',
                params.cover_image || params.hero || '', params.supplier_id || '',
                params.primary_category || '', params.secondary_category || '', isFeat,
                params.status || 'active', meta, p.date || now, now
            ).run();
            upProd++;
          } catch {}
        }
        const newsItems = list.filter(i => {
          const t = String(i.type || i.section || '').toLowerCase();
          return t.includes('news') || t.includes('article') || t.includes('资讯') || t.includes('新闻');
        });
        let upNews = 0;
        for (const n of newsItems) {
          try {
            const params = n.params || {};
            const slug = params.slug || (n.uri||'').split('/').filter(Boolean).pop() || '';
            if (!slug) continue;
            await env.DB.prepare(`INSERT INTO news (
                title, slug, summary, content, cover_image, category, tags, author, status,
                seo_title, seo_keywords, seo_description, published_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
                title=excluded.title, summary=excluded.summary, content=excluded.content,
                cover_image=excluded.cover_image, category=excluded.category, tags=excluded.tags,
                author=excluded.author, status=excluded.status, seo_title=excluded.seo_title,
                seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description,
                published_at=excluded.published_at, updated_at=excluded.updated_at
            `).bind(
                n.title || params.title || '', slug, n.summary || params.summary || '', '',
                params.cover_image || params.hero || '', params.category || n.category || '',
                JSON.stringify(params.tags || []), params.author || '', 'published',
                params.seo_title || '', params.seo_keywords || '', params.seo_description || '',
                n.date || now, now, now
            ).run();
            upNews++;
          } catch {}
        }
        const caseItems = list.filter(i => {
          const t = String(i.type || i.section || '').toLowerCase();
          return t.includes('case') || t.includes('cases') || t.includes('应用案例') || t.includes('案例');
        });
        let upCases = 0;
        for (const c of caseItems) {
          try {
            const params = c.params || {};
            const slug = params.slug || (c.uri||'').split('/').filter(Boolean).pop() || '';
            if (!slug) continue;
            await env.DB.prepare(`INSERT INTO cases (
                title, slug, summary, content, cover_image, industry, related_product_id, status,
                seo_title, seo_keywords, seo_description, published_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
                title=excluded.title, summary=excluded.summary, content=excluded.content,
                cover_image=excluded.cover_image, industry=excluded.industry,
                related_product_id=excluded.related_product_id, status=excluded.status,
                seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords,
                seo_description=excluded.seo_description, published_at=excluded.published_at,
                updated_at=excluded.updated_at
            `).bind(
                c.title || params.title || '', slug, c.summary || params.summary || '', '',
                params.cover_image || params.hero || '', params.industry || c.category || '',
                '', 'published', params.seo_title || '', params.seo_keywords || '',
                params.seo_description || '', c.date || now, now, now
            ).run();
            upCases++;
          } catch {}
        }
        try {
          const metaStr = JSON.stringify({ base, updated_at: now, type: 'admin-sync', counts: { requirements: upReq, suppliers: upSup, demanders: upDem, products: upProd, news: upNews, cases: upCases } });
          await env.DB.prepare('INSERT INTO system_config (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?')
            .bind('sync_meta', metaStr, now, metaStr, now).run();
        } catch {}
        return json({ ok: true });
      } catch (e) {
        return json({ error: String(e && e.message || e) }, 500);
      }
    }

    if (isApi('admin/debug-index') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      try {
        const base = url.searchParams.get('base') || env.SYNC_BASE_URL || 'https://www.visndt.com/data';
        const idxUrl = (String(base).endsWith('/')) ? (String(base) + 'index.json') : (String(base) + '/index.json');
        const idx = await fetchJsonSafe(idxUrl);
        const arr = Array.isArray(idx) ? idx : [];
        const sample = arr.slice(0, 10).map(i => ({
          title: i.title,
          section: i.section || i.type,
          uri: i.uri,
          params: i.params ? Object.keys(i.params) : []
        }));
        return json({ ok: true, idxUrl, count: arr.length, sample });
      } catch (e) {
        return json({ ok: false, error: String(e && e.message || e) }, 500);
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
    if (isApi('markets/by-password') && request.method === 'GET') {
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
    if (isApi('demanders/markets') && request.method === 'GET') {
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

    // Admin: Assets Management
    if (isApi('admin/assets') && request.method === 'GET') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const type = url.searchParams.get('type');
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 200);
      const cursor = url.searchParams.get('cursor') || undefined;
      const items = [];
      let next = '';
      try {
        if (env.VISPIC && typeof env.VISPIC.list === 'function') {
          const opts = { limit };
          if (cursor) opts.cursor = cursor;
          const list = await env.VISPIC.list(opts);
          for (const o of (list.objects || [])) {
            const key = o.key;
            const isTypeOk = type ? ((o.httpMetadata && o.httpMetadata.contentType || '').startsWith(type)) : true;
            if (!isTypeOk) continue;
            const public_url = `/api/assets/${encodeURIComponent(key)}`;
            items.push({ key, size: o.size || 0, public_url });
          }
          next = list.truncated && list.cursor ? list.cursor : '';
        } else {
          const off = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);
          let q = 'SELECT * FROM assets';
          const where = [];
          const binds = [];
          if (type) { where.push('file_type LIKE ?'); binds.push(`${type}%`); }
          if (where.length) q += ' WHERE ' + where.join(' AND ');
          q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
          binds.push(limit, off);
          const { results } = await env.DB.prepare(q).bind(...binds).all();
          for (const r of (results || [])) {
            const key = r.r2_key || '';
            const public_url = r.public_url || (key ? `/api/assets/${encodeURIComponent(key)}` : '');
            items.push({ key, size: r.file_size || 0, public_url });
          }
        }
      } catch {}
      return json({ items, offsetNext: next });
    }

    if (isApi('admin/assets') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const now = new Date().toISOString();
      const asset_id = 'AST-' + now.replace(/[-:T.Z]/g,'') + '-' + Math.floor(Math.random()*10000);
      let public_url = data.public_url || '';
      let r2_key = data.r2_key || '';
      let file_type = data.file_type || 'application/octet-stream';
      let file_size = data.file_size || 0;
      try {
        if (!public_url && env.VISPIC && typeof env.VISPIC.put === 'function') {
          let bytes = null;
          if (typeof data.file_base64 === 'string' && data.file_base64) {
            let s = data.file_base64;
            const i = s.indexOf(',');
            if (i >= 0) { s = s.slice(i+1); }
            const bin = atob(s);
            const arr = new Uint8Array(bin.length);
            for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
            bytes = arr;
          } else if (typeof data.data_url === 'string' && data.data_url) {
            const p = String(data.data_url);
            const i = p.indexOf(',');
            const head = i >= 0 ? p.slice(0, i) : '';
            file_type = head.replace(/^data:/,'').replace(/;base64$/,'') || file_type;
            let s = i >= 0 ? p.slice(i+1) : p;
            const bin = atob(s);
            const arr = new Uint8Array(bin.length);
            for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
            bytes = arr;
          } else if (typeof data.url === 'string' && data.url) {
            const resp = await fetch(data.url);
            file_type = resp.headers.get('content-type') || file_type;
            bytes = await resp.arrayBuffer();
          }
          if (bytes) {
            const baseName = (data.filename || 'asset').replace(/[^a-zA-Z0-9._-]/g,'_');
            const y = now.slice(0,7).replace('-','/');
            r2_key = `assets/${y}/${asset_id}-${baseName}`;
            await env.VISPIC.put(r2_key, bytes, { httpMetadata: { contentType: file_type } });
            const obj = await env.VISPIC.get(r2_key);
            file_size = (obj && obj.size) || (bytes.byteLength || 0);
            public_url = `/api/assets/${encodeURIComponent(r2_key)}`;
          }
        }
      } catch {}
      if (!public_url) {
        public_url = `https://via.placeholder.com/150?text=${encodeURIComponent(data.filename||'Asset')}`;
      }
      await env.DB.prepare(`INSERT INTO assets (
        asset_id, filename, r2_key, public_url, file_type, file_size, alt_text, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        asset_id, data.filename || 'unknown', r2_key, public_url,
        file_type, file_size, data.alt_text || '', 'admin', now
      ).run();
      return json({ ok: true, asset: { asset_id, public_url, filename: data.filename } });
    }
    
    if (isApi('admin/assets') && request.method === 'PUT') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const key = url.searchParams.get('key') || '';
      if (!key) return json({ error: 'MissingKey' }, 400);
      const ct = request.headers.get('content-type') || 'application/octet-stream';
      let ok = false;
      let size = 0;
      try {
        if (env.VISPIC && typeof env.VISPIC.put === 'function') {
          await env.VISPIC.put(key, request.body, { httpMetadata: { contentType: ct } });
          const obj = await env.VISPIC.get(key);
          size = (obj && obj.size) || 0;
          ok = true;
        }
      } catch {}
      if (!ok) return json({ error: 'UploadFailed' }, 500);
      const now = new Date().toISOString();
      const asset_id = 'AST-' + now.replace(/[-:T.Z]/g,'') + '-' + Math.floor(Math.random()*10000);
      const public_url = `/api/assets/${encodeURIComponent(key)}`;
      await env.DB.prepare(`INSERT INTO assets (
        asset_id, filename, r2_key, public_url, file_type, file_size, alt_text, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        asset_id, key.split('/').pop(), key, public_url, ct, size, '', 'admin', now
      ).run();
      return json({ ok: true, key, public_url });
    }
    if (isApi('admin/assets') && request.method === 'DELETE') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const key = url.searchParams.get('key');
      if (key) {
        try { if (env.VISPIC && typeof env.VISPIC.delete === 'function') await env.VISPIC.delete(key); } catch {}
        try { await env.DB.prepare('DELETE FROM assets WHERE r2_key = ?').bind(key).run(); } catch {}
        return json({ ok: true });
      }
      const id = path.split('/').pop();
      try { await env.DB.prepare('DELETE FROM assets WHERE asset_id = ?').bind(id).run(); } catch {}
      return json({ ok: true });
    }
    if (isApi('assets/') && request.method === 'GET') {
      const k = decodeURIComponent(path.replace('/api/assets/',''));
      if (!k) return new Response('Not Found', { status: 404, headers: baseHeaders });
      try {
        const obj = await env.VISPIC.get(k);
        if (!obj || !obj.body) return new Response('Not Found', { status: 404, headers: baseHeaders });
        const h = new Headers(baseHeaders);
        const ct = obj.httpMetadata && obj.httpMetadata.contentType || 'application/octet-stream';
        h.set('Content-Type', ct);
        return new Response(obj.body, { status: 200, headers: h });
      } catch (e) {
        return new Response('Not Found', { status: 404, headers: baseHeaders });
      }
    }

    // Admin: Products Create
    if (isApi('admin/products') && request.method === 'POST') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const data = await bodyJSON(request);
      const now = new Date().toISOString();
      const product_id = data.ProductID || data.product_id || ('PROD-' + now.replace(/[-:T.Z]/g,'') + '-' + Math.floor(Math.random()*10000));
      const supplier_id = data.SupplierID || data.supplier_id || '';
      const name = data.Name || data.name || '';
      const slug = data.Slug || data.slug || null;
      const model = data.Model || data.model || '';
      const series = data.Series || data.series || '';
      const primary_category = data.PrimaryCategory || data.primary_category || '';
      const secondary_category = data.SecondaryCategory || data.secondary_category || '';
      const summary = data.Summary || data.summary || '';
      const description = data.Description || data.description || '';
      const parameters_json = JSON.stringify(data.Parameters || data.parameters_json || {});
      const cover_image = data.CoverImage || data.cover_image || '';
      const gallery_json = JSON.stringify(data.Gallery || data.gallery_json || []);
      const documents_json = JSON.stringify(data.Documents || data.documents_json || []);
      const seo_title = data.SeoTitle || data.seo_title || '';
      const seo_keywords = data.SeoKeywords || data.seo_keywords || '';
      const seo_description = data.SeoDescription || data.seo_description || '';
      const status = (data.Status || data.status || 'active');
      const is_featured = (data.IsFeatured || data.is_featured) ? 1 : 0;

      try {
        const fields = 'product_id, supplier_id, name, slug, model, series, primary_category, secondary_category, summary, description, parameters_json, cover_image, gallery_json, documents_json, seo_title, seo_keywords, seo_description, status, is_featured, created_at, updated_at';
        const vals = [product_id, supplier_id, name, slug, model, series, primary_category, secondary_category, summary, description, parameters_json, cover_image, gallery_json, documents_json, seo_title, seo_keywords, seo_description, status, is_featured, now, now];
        if (slug) {
          await env.DB.prepare(`INSERT INTO products (${fields}) VALUES (${new Array(21).fill('?').join(',')}) ON CONFLICT(slug) DO UPDATE SET supplier_id=excluded.supplier_id, name=excluded.name, model=excluded.model, series=excluded.series, primary_category=excluded.primary_category, secondary_category=excluded.secondary_category, summary=excluded.summary, description=excluded.description, parameters_json=excluded.parameters_json, cover_image=excluded.cover_image, gallery_json=excluded.gallery_json, documents_json=excluded.documents_json, seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description, status=excluded.status, is_featured=excluded.is_featured, updated_at=excluded.updated_at`).bind(...vals).run();
        } else {
          await env.DB.prepare(`INSERT INTO products (${fields}) VALUES (${new Array(21).fill('?').join(',')}) ON CONFLICT(product_id) DO UPDATE SET supplier_id=excluded.supplier_id, name=excluded.name, slug=excluded.slug, model=excluded.model, series=excluded.series, primary_category=excluded.primary_category, secondary_category=excluded.secondary_category, summary=excluded.summary, description=excluded.description, parameters_json=excluded.parameters_json, cover_image=excluded.cover_image, gallery_json=excluded.gallery_json, documents_json=excluded.documents_json, seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description, status=excluded.status, is_featured=excluded.is_featured, updated_at=excluded.updated_at`).bind(...vals).run();
        }
        return json({ ok: true, product_id });
      } catch (e) {
        return json({ error: 'CreateFailed', detail: e.message }, 500);
      }
    }

    // Products list endpoint consolidated at 1578 GET handler

    // Admin: Product Search (for association)
    if (isApi('admin/products/search') && request.method === 'GET') {
       if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
       const q = (url.searchParams.get('q') || '').trim();
       if (!q) return json([]);
       const like = `%${q}%`;
       const { results } = await env.DB.prepare('SELECT product_id, name, model FROM products WHERE name LIKE ? OR model LIKE ? LIMIT 20').bind(like, like).all();
       return json(results || []);
    }

    // Admin: Supplier Search
    if (isApi('admin/suppliers/search') && request.method === 'GET') {
       if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
       const q = (url.searchParams.get('q') || '').trim();
       if (!q) return json([]);
       const like = `%${q}%`;
       const { results } = await env.DB.prepare('SELECT supplier_id, company, name FROM suppliers WHERE company LIKE ? OR name LIKE ? LIMIT 20').bind(like, like).all();
       return json(results || []);
    }

    // Admin: Products Update/Delete
    if (isApi('admin/products') && request.method === 'PATCH') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      const data = await bodyJSON(request);
      const fields = ['name','slug','model','series','primary_category','secondary_category','summary','description','parameters_json','cover_image','gallery_json','documents_json','seo_title','seo_keywords','seo_description','status','is_featured'];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) { 
            let val = data[f];
            if (f.endsWith('_json') && typeof val === 'object') val = JSON.stringify(val);
            sets.push(`${f} = ?`); 
            binds.push(val); 
        }
      }
      sets.push('updated_at = ?'); binds.push(new Date().toISOString());
      if (!sets.length) return json({ error: 'NoFields' }, 400);
      const stmt = env.DB.prepare(`UPDATE products SET ${sets.join(', ')} WHERE product_id = ? OR slug = ?`).bind(...binds, id, id);
      await stmt.run();
      return json({ ok: true });
    }

    if (isApi('admin/products') && request.method === 'DELETE') {
      if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM products WHERE product_id = ? OR slug = ?').bind(id, id).run();
      return json({ ok: true });
    }


    // Admin: Exhibitions
    if (isApi('admin/exhibitions') && request.method === 'GET') {
        if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
        const { results } = await env.DB.prepare('SELECT * FROM exhibitions ORDER BY created_at DESC LIMIT 100').all();
        return json(results || []);
    }
    if (isApi('admin/exhibitions') && request.method === 'POST') {
        if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
        const data = await bodyJSON(request);
        const now = new Date().toISOString();
        const ex_id = 'EXH-' + now.replace(/[-:T.Z]/g,'') + '-' + Math.floor(Math.random()*1000);
        const fields = ['exhibition_id','title','slug','location','start_date','end_date','booth_number','description','cover_image','status','seo_keywords','seo_description','created_at','updated_at'];
        const vals = [ex_id, data.title||'', data.slug||'', data.location||'', data.start_date||'', data.end_date||'', data.booth_number||'', data.description||'', data.cover_image||'', data.status||'draft', data.seo_keywords||'', data.seo_description||'', now, now];
        const placeholders = fields.map(()=>'?').join(',');
        await env.DB.prepare(`INSERT INTO exhibitions (${fields.join(',')}) VALUES (${placeholders})`).bind(...vals).run();
        return json({ ok: true, exhibition_id: ex_id });
    }
    if (isApi('admin/exhibitions/') && request.method === 'GET') {
        const id = path.split('/').pop();
        const item = await env.DB.prepare('SELECT * FROM exhibitions WHERE exhibition_id = ?').bind(id).first();
        return json(item || {});
    }
    if (isApi('admin/exhibitions/') && request.method === 'PATCH') {
        if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
        const id = path.split('/').pop();
        const data = await bodyJSON(request);
        const fields = [];
        const vals = [];
        for(const k of ['title','slug','location','start_date','end_date','booth_number','description','cover_image','status','seo_keywords','seo_description']) {
            if (data[k] !== undefined) { fields.push(`${k} = ?`); vals.push(data[k]); }
        }
        fields.push('updated_at = ?'); vals.push(new Date().toISOString());
        vals.push(id);
        await env.DB.prepare(`UPDATE exhibitions SET ${fields.join(',')} WHERE exhibition_id = ?`).bind(...vals).run();
        return json({ ok: true });
    }
    if (isApi('admin/exhibitions/') && request.method === 'DELETE') {
        if (!requireAdmin(request)) return json({ error: 'Unauthorized' }, 401);
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM exhibitions WHERE exhibition_id = ?').bind(id).run();
        return json({ ok: true });
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
    const baseRaw = env.SYNC_BASE_URL || 'https://www.visndt.com/data';
    const base = String(baseRaw).replace(/\/$/, '');
    const siteBase = base.replace(/\/data\/?$/i, '');
    try {
      // Seed requirements (INSERT OR IGNORE)
      let reqs = await fetch(`${base}/markets.json`).then(r => r.json()).catch(() => []);
      if (!Array.isArray(reqs) || !reqs.length) {
         reqs = await fetch(`${base}/requirements.json`).then(r => r.json()).catch(() => []);
      }
      // Fallback to index.json for markets/requirements
      if (!Array.isArray(reqs) || !reqs.length) {
         const idx = await fetch(`${siteBase}/index.json`).then(r => r.json()).catch(() => []);
         const list = Array.isArray(idx) ? idx : [];
         const items = list.filter(i => {
           const t = String(i.type || i.section || '').toLowerCase();
           return t === 'markets' || t === 'requirements';
         });
         reqs = items.map(i => {
           const p = i.params || {};
           const uri = String(i.uri || '').trim();
           return {
             RequirementID: p.RequirementID || p.requirementid || p.slug || (uri.split('/').filter(Boolean).pop() || ''),
             Title: i.title || p.title || '',
             PublicPreview: p.PublicPreview || p.publicpreview || i.summary || '',
             PrimaryCategory: p.PrimaryCategory || p.primarycategory || '',
             SecondaryCategory: p.SecondaryCategory || p.secondarycategory || '',
             Status: p.Status || p.status || 'published',
             ContactName: p.ContactName || p.contactname || '',
             ContactPhone: p.ContactPhone || p.contactphone || '',
             ContactCompany: p.ContactCompany || p.contactcompany || '',
             ContactEmail: p.ContactEmail || p.contactemail || '',
             ContactDepartment: p.ContactDepartment || p.contactdepartment || '',
             ContactPublic: (p.ContactPublic || p.contactpublic) ? true : false,
             AllowOpenQuotes: (p.AllowOpenQuotes || p.allowopenquotes) ? true : false,
             Parameters: p.Parameters || p.parameters || {},
             PublishedAt: i.date || p.date || new Date().toISOString(),
             BudgetRange: p.BudgetRange || p.budgetrange || '',
             procurementPlan: p.procurementPlan || p.procurementplan || '',
             Progress: p.Progress || p.progress || '',
             ViewPasswordPlain: p.ViewPasswordPlain || p.viewpasswordplain || ''
           };
         });
      }

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

      // Sync Products, News, Cases from index.json
      if (!Array.isArray(sups) || !sups.length || true) { // Always check index.json for content types
         const idx = await fetch(`${siteBase}/index.json`).then(r => r.json()).catch(() => []);
         const list = Array.isArray(idx) ? idx : [];
         
         // 1. Sync Products
         const products = list.filter(i => {
             const t = String(i.type || i.section || '').toLowerCase();
             return t === 'products';
         });
         for (const p of products) {
             try {
                 const params = p.params || {};
                 const pid = params.product_id || params.ProductID || (p.uri||'').split('/').filter(Boolean).pop() || '';
                 if (!pid) continue;
                 const isFeat = params.is_featured ? 1 : 0;
                 const meta = JSON.stringify(params.metadata || {});
                 await env.DB.prepare(`INSERT INTO products (
                     product_id, name, model, series, description, cover_image, supplier_id,
                     primary_category, secondary_category, is_featured, status, metadata_json, created_at, updated_at
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(product_id) DO UPDATE SET
                     name=excluded.name, model=excluded.model, series=excluded.series, description=excluded.description,
                     cover_image=excluded.cover_image, supplier_id=excluded.supplier_id, primary_category=excluded.primary_category,
                     secondary_category=excluded.secondary_category, is_featured=excluded.is_featured, status=excluded.status,
                     metadata_json=excluded.metadata_json, updated_at=excluded.updated_at
                 `).bind(
                     pid, p.title || params.name || '', params.model || '', params.series || '', p.summary || params.description || '',
                     params.cover_image || params.hero || '', params.supplier_id || '',
                     params.primary_category || '', params.secondary_category || '', isFeat,
                     params.status || 'active', meta, p.date || now, now
                 ).run();
             } catch {}
         }

         // 2. Sync News
         const newsItems = list.filter(i => {
             const t = String(i.type || i.section || '').toLowerCase();
             return t.includes('news') || t.includes('article') || t.includes('资讯') || t.includes('新闻');
         });
         for (const n of newsItems) {
             try {
                 const params = n.params || {};
                 const slug = params.slug || (n.uri||'').split('/').filter(Boolean).pop() || '';
                 if (!slug) continue;
                 await env.DB.prepare(`INSERT INTO news (
                     title, slug, summary, content, cover_image, category, tags, author, status,
                     seo_title, seo_keywords, seo_description, published_at, created_at, updated_at
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(slug) DO UPDATE SET
                     title=excluded.title, summary=excluded.summary, content=excluded.content,
                     cover_image=excluded.cover_image, category=excluded.category, tags=excluded.tags,
                     author=excluded.author, status=excluded.status, seo_title=excluded.seo_title,
                     seo_keywords=excluded.seo_keywords, seo_description=excluded.seo_description,
                     published_at=excluded.published_at, updated_at=excluded.updated_at
                 `).bind(
                     n.title || params.title || '', slug, n.summary || params.summary || '', '',
                     params.cover_image || params.hero || '', params.category || n.category || '',
                     JSON.stringify(params.tags || []), params.author || '', 'published',
                     params.seo_title || '', params.seo_keywords || '', params.seo_description || '',
                     n.date || now, now, now
                 ).run();
             } catch {}
         }

         // 3. Sync Cases
         const caseItems = list.filter(i => {
             const t = String(i.type || i.section || '').toLowerCase();
             return t.includes('case') || t.includes('cases') || t.includes('应用案例') || t.includes('案例');
         });
         for (const c of caseItems) {
             try {
                 const params = c.params || {};
                 const slug = params.slug || (c.uri||'').split('/').filter(Boolean).pop() || '';
                 if (!slug) continue;
                 await env.DB.prepare(`INSERT INTO cases (
                     title, slug, summary, content, cover_image, industry, related_product_id, status,
                     seo_title, seo_keywords, seo_description, published_at, created_at, updated_at
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(slug) DO UPDATE SET
                     title=excluded.title, summary=excluded.summary, content=excluded.content,
                     cover_image=excluded.cover_image, industry=excluded.industry,
                     related_product_id=excluded.related_product_id, status=excluded.status,
                     seo_title=excluded.seo_title, seo_keywords=excluded.seo_keywords,
                     seo_description=excluded.seo_description, published_at=excluded.published_at,
                     updated_at=excluded.updated_at
                 `).bind(
                     c.title || params.title || '', slug, c.summary || params.summary || '', '',
                     params.cover_image || params.hero || '', params.industry || c.category || '',
                     '', 'published', params.seo_title || '', params.seo_keywords || '',
                     params.seo_description || '', c.date || now, now, now
                 ).run();
             } catch {}
         }
      }

      // Update sync meta
      try {
        const metaStr = JSON.stringify({ base, updated_at: now, type: 'auto-scheduled' });
        await env.DB.prepare('INSERT INTO system_config (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?')
          .bind('sync_meta', metaStr, now, metaStr, now).run();
      } catch {}

    } catch (e) {
      // swallow errors to avoid cron failures surfacing
    }
  }
};
