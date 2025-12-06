var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    const allowedOrigins = /* @__PURE__ */ new Set([
      // Online API domains
      "https://visndt.com",
      "https://www.visndt.com",
      "https://api.visndt.com",
      // Local Hugo & dev servers
      "http://localhost:1313",
      "http://127.0.0.1:1313",
      "http://localhost:8888",
      "http://127.0.0.1:8888",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://localhost:1314",
      "http://127.0.0.1:1314"
    ]);
    let allowOrigin = "https://visndt.com";
    if (origin) {
      try {
        const o = new URL(origin);
        const h = String(o.hostname || "").toLowerCase();
        if (allowedOrigins.has(origin) || h === "localhost" || h === "127.0.0.1" || h.endsWith(".workers.dev")) {
          allowOrigin = origin;
        }
      } catch {
      }
    }
    const baseHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") {
      return new Response("", { headers: baseHeaders });
    }
    async function ensureSchema(env2) {
      try {
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS requirements (
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
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_requirements_reqid ON requirements(requirement_id)").run();
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_requirements_phone ON requirements(contact_phone)").run();
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_requirements_progress ON requirements(progress)").run();
        try {
          await env2.DB.prepare("ALTER TABLE requirements ADD COLUMN approved INTEGER").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE requirements ADD COLUMN approved_at TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE requirements ADD COLUMN quote_password TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE requirements ADD COLUMN view_password TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE requirements ADD COLUMN is_featured INTEGER DEFAULT 0").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE requirements ADD COLUMN is_urgent INTEGER DEFAULT 0").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE requirements ADD COLUMN admin_notes TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE requirements ADD COLUMN tags TEXT").run();
        } catch {
        }
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS quotes (
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
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_quotes_req ON quotes(requirement_id)").run();
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_quotes_supplier ON quotes(supplier_id)").run();
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS suppliers (
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
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name)").run();
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS products (
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
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id)").run();
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)").run();
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN slug TEXT UNIQUE").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN secondary_category TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN description TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN cover_image TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN gallery_json TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN documents_json TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN seo_title TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN seo_keywords TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN seo_description TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN status TEXT").run();
        } catch {
        }
        try {
          await env2.DB.prepare("ALTER TABLE products ADD COLUMN is_featured INTEGER").run();
        } catch {
        }
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS demanders (
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
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS system_config (
          key TEXT PRIMARY KEY,
          value_json TEXT,
          updated_at TEXT
        )`).run();
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS news (
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
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_news_cat ON news(category)").run();
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug)").run();
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS cases (
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
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_cases_slug ON cases(slug)").run();
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS exhibitions (
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
        await env2.DB.prepare("CREATE INDEX IF NOT EXISTS idx_exhibitions_slug ON exhibitions(slug)").run();
        await env2.DB.prepare(`CREATE TABLE IF NOT EXISTS assets (
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
      }
    }
    __name(ensureSchema, "ensureSchema");
    await ensureSchema(env);
    function json(data, status = 200, extra = {}) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json; charset=utf-8", ...baseHeaders, ...extra }
      });
    }
    __name(json, "json");
    async function bodyJSON(req) {
      try {
        return await req.json();
      } catch {
        return {};
      }
    }
    __name(bodyJSON, "bodyJSON");
    function requireAdmin(req) {
      const key = req.headers.get("X-Admin-Key") || req.headers.get("x-admin-key") || "";
      const expected = env.ADMIN_KEY || env.ADMIN_KEY_SECRET || env.ADMIN_TOKEN || "";
      return Boolean(expected && key === expected);
    }
    __name(requireAdmin, "requireAdmin");
    function genRequirementID() {
      const d = /* @__PURE__ */ new Date();
      const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
      const rnd = Math.floor(Math.random() * 9e3) + 1e3;
      return `REQ-${ymd}-${rnd}`;
    }
    __name(genRequirementID, "genRequirementID");
    async function fetchJsonSafe(url2) {
      try {
        const r = await fetch(url2);
        if (!r.ok) return [];
        return await r.json();
      } catch {
        return [];
      }
    }
    __name(fetchJsonSafe, "fetchJsonSafe");
    function genQuoteID() {
      const d = /* @__PURE__ */ new Date();
      const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
      const rnd = Math.floor(Math.random() * 9e5) + 1e5;
      return `Q-${ymd}-${rnd}`;
    }
    __name(genQuoteID, "genQuoteID");
    function genViewPassword() {
      return String(Math.floor(Math.random() * 9e5) + 1e5);
    }
    __name(genViewPassword, "genViewPassword");
    const path = url.pathname;
    const isFn = /* @__PURE__ */ __name((p) => path.startsWith(`/.netlify/functions/${p}`), "isFn");
    const isApi = /* @__PURE__ */ __name((p) => path.startsWith(`/api/${p}`), "isApi");
    if (isApi("health") && request.method === "GET") {
      try {
        const req = await env.DB.prepare("SELECT COUNT(1) as c FROM requirements").all();
        const sup = await env.DB.prepare("SELECT COUNT(1) as c FROM suppliers").all();
        const dem = await env.DB.prepare("SELECT COUNT(1) as c FROM demanders").all();
        return json({ ok: true, db: { requirements: req.results?.[0]?.c || 0, suppliers: sup.results?.[0]?.c || 0, demanders: dem.results?.[0]?.c || 0 } });
      } catch (e) {
        return json({ ok: true });
      }
    }
    if (isApi("admin/verify") && (request.method === "POST" || request.method === "GET")) {
      const headerOk = requireAdmin(request);
      let passwordOk = false;
      if (request.method === "POST") {
        const data = await bodyJSON(request);
        const pass = String(data.password || "").trim();
        const envPass = String(env.ADMIN_PASSWORD || env.ADMIN_PASS || env.ADMIN_SECRET || "");
        passwordOk = Boolean(envPass && pass && pass === envPass);
      }
      if (headerOk || passwordOk) {
        return json({ ok: true });
      }
      return json({ ok: false, error: "Unauthorized" }, 401);
    }
    if (url.pathname.endsWith("/data/news.json") || isApi("news/public")) {
      try {
        const { results: news } = await env.DB.prepare("SELECT * FROM news WHERE status='published' ORDER BY published_at DESC").all();
        const { results: exhs } = await env.DB.prepare("SELECT * FROM exhibitions WHERE status='published' ORDER BY start_date DESC").all();
        const items = [];
        for (const n of news || []) {
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
        for (const e of exhs || []) {
          items.push({
            id: e.exhibition_id,
            title: e.title,
            date: e.start_date,
            // Use start date
            category: "\u5C55\u4F1A\u6D3B\u52A8",
            // Fixed category for exhibitions
            summary: e.summary || `${e.location} | ${e.booth_number}`,
            hero: e.cover_image,
            link: `/exhibitions/${e.slug || e.exhibition_id}`
          });
        }
        items.sort((a, b) => new Date(b.date) - new Date(a.date));
        return json({ items });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (isApi("admin/login") && request.method === "POST") {
      const data = await bodyJSON(request);
      const user = String(data.username || "").trim();
      const pass = String(data.password || "").trim();
      const validUser = env.ADMIN_USER || "visndt";
      const validPass = env.ADMIN_PASSWORD || "@Aa123456";
      if (user === validUser && pass === validPass) {
        return json({ ok: true, token: env.ADMIN_KEY || "admin123456" });
      }
      return json({ error: "InvalidCredentials" }, 401);
    }
    if (isApi("admin/stats") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        try {
          await ensureSchema(env);
        } catch {
        }
        const { results: reqRes } = await env.DB.prepare("SELECT COUNT(1) as total, SUM(CASE WHEN status != '\u516C\u5F00' THEN 1 ELSE 0 END) as pending FROM requirements").all();
        const { results: prodRes } = await (async () => {
          try {
            return await env.DB.prepare("SELECT COUNT(1) as total FROM products").all();
          } catch {
            return { results: [{ total: 0 }] };
          }
        })();
        const { results: supRes } = await (async () => {
          try {
            return await env.DB.prepare("SELECT COUNT(1) as total FROM suppliers").all();
          } catch {
            return { results: [{ total: 0 }] };
          }
        })();
        const { results: newsRes } = await (async () => {
          try {
            return await env.DB.prepare("SELECT COUNT(1) as total FROM news").all();
          } catch {
            return { results: [{ total: 0 }] };
          }
        })();
        const { results: caseRes } = await (async () => {
          try {
            return await env.DB.prepare("SELECT COUNT(1) as total FROM cases").all();
          } catch {
            return { results: [{ total: 0 }] };
          }
        })();
        const { results: exhRes } = await (async () => {
          try {
            return await env.DB.prepare("SELECT COUNT(1) as total FROM exhibitions").all();
          } catch {
            return { results: [{ total: 0 }] };
          }
        })();
        const { results: quoteRes } = await (async () => {
          try {
            return await env.DB.prepare("SELECT COUNT(1) as total FROM quotes").all();
          } catch {
            return { results: [{ total: 0 }] };
          }
        })();
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
          quotes: quoteRes?.[0]?.total || 0
        });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (isApi("requirements") && request.method === "POST" || isFn("createRequirement") && request.method === "POST") {
      const data = await bodyJSON(request);
      const required = ["contactName", "contactPhone", "Title", "primaryCategory"];
      const missing = required.filter((k) => !String(data[k] || "").trim());
      if (missing.length) return json({ error: "Missing fields", fields: missing }, 400);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const requirement_id = String(data.requirementID || "").trim() || genRequirementID();
      const view_password_plain = String(data.viewPassword || "").trim() || genViewPassword();
      const progress = String(data.Progress || "").trim() || "\u53D1\u5E03\u4E2D";
      const status = String(data.Status || "").trim() || "\u516C\u5F00";
      const allow_open_quotes = status === "\u5728\u7EBF\u62A5\u4EF7" ? 1 : data.AllowOpenQuotes ? 1 : 0;
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
        requirement_id,
        data.Title || "",
        data.PublicPreview || "",
        data.primaryCategory || "",
        data.secondaryCategory || "",
        0,
        "",
        status,
        data.contactName || "",
        data.contactPhone || "",
        data.contactCompany || "",
        data.contactEmail || "",
        data.contactDepartment || "",
        contact_public,
        allow_open_quotes,
        parameters_json,
        data.PublishedAt || now,
        data.BudgetRange || "",
        data.procurementPlan || "",
        progress,
        view_password_plain,
        now,
        now
      );
      const res = await stmt.run();
      try {
        const meta = JSON.stringify({ contact_public: !!contact_public, allow_open_quotes: !!allow_open_quotes, password_plain: view_password_plain });
        const demId = (data.contactCompany || "").trim() || (data.contactPhone || "").trim() || requirement_id;
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
          demId,
          data.contactName || "",
          data.contactCompany || "",
          data.contactPhone || "",
          data.contactEmail || "",
          data.contactDepartment || "",
          meta,
          now,
          now
        ).run();
      } catch {
      }
      return json({ ok: true, requirement_id, RequirementID: requirement_id, ViewPassword: view_password_plain, DemanderPassword: view_password_plain });
    }
    if (isApi("requirements") && request.method === "GET" || isFn("listRequirements") && request.method === "GET") {
      const progress = url.searchParams.get("progress");
      const category = url.searchParams.get("category");
      let q = "SELECT requirement_id as RequirementID, title as Title, public_preview as PublicPreview, primary_category as PrimaryCategory, secondary_category as SecondaryCategory, approved as Approved, status as Status, contact_public as ContactPublic, contact_name as ContactName, contact_phone as ContactPhone, contact_company as ContactCompany, budget_range as BudgetRange, published_at as PublishedAt, progress as Progress, allow_open_quotes as AllowOpenQuotes, parameters_json as Parameters FROM requirements";
      const where = [];
      const binds = [];
      where.push("approved = 1");
      where.push("status = '\u516C\u5F00'");
      if (progress) {
        where.push("progress = ?");
        binds.push(progress);
      }
      if (category) {
        where.push("primary_category = ?");
        binds.push(category);
      }
      if (where.length) q += " WHERE " + where.join(" AND ");
      q += " ORDER BY created_at DESC LIMIT 100";
      const stmt = env.DB.prepare(q).bind(...binds);
      const { results } = await stmt.all();
      const items = (results || []).map((r) => ({
        ...r,
        ContactPublic: !!r.ContactPublic,
        AllowOpenQuotes: !!r.AllowOpenQuotes,
        Parameters: function() {
          try {
            return JSON.parse(r.Parameters);
          } catch {
            return {};
          }
        }()
      }));
      return json(items);
    }
    if (isApi("requirements/") && request.method === "GET") {
      const id = path.split("/").pop();
      const stmt = env.DB.prepare("SELECT * FROM requirements WHERE requirement_id = ?").bind(id);
      const { results } = await stmt.all();
      if (!results || !results.length) return json({ error: "NotFound" }, 404);
      const r = results[0];
      const anyPwd = url.searchParams.get("password") || "";
      const supplierPwd = url.searchParams.get("supplier_access_password") || "";
      const viewPwd = url.searchParams.get("view_password") || "";
      let role = "public";
      if (anyPwd) {
        try {
          const { results: reqRows } = await env.DB.prepare("SELECT contact_company FROM requirements WHERE requirement_id = ?").bind(id).all();
          const company = reqRows && reqRows[0] && reqRows[0].contact_company || "";
          if (company) {
            const like = `%"password_plain":"${anyPwd}"%`;
            const { results: demRows } = await env.DB.prepare("SELECT 1 FROM demanders WHERE company = ? AND metadata_json LIKE ?").bind(company, like).all();
            if (demRows && demRows.length) role = "demander";
          }
        } catch {
        }
      }
      if (role === "public" && anyPwd && typeof r.quote_password === "string" && r.quote_password && anyPwd === r.quote_password) {
        role = "supplier";
      }
      if (role === "public" && anyPwd && (typeof r.view_password === "string" && r.view_password && anyPwd === r.view_password || anyPwd === r.view_password_plain)) {
        role = "guest";
      }
      const showSensitiveLegacy = r.contact_public === 1 || viewPwd && viewPwd === r.view_password_plain || await verifySupplierPassword(env, supplierPwd);
      const showSensitive = role !== "public" ? true : showSensitiveLegacy;
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
      let quotes = void 0;
      if (role === "demander") {
        try {
          const { results: qres } = await env.DB.prepare("SELECT quote_id as QuoteID, supplier_name as SupplierName, supplier_phone as SupplierPhone, amount as Amount, currency as Currency, remarks as Remarks, status as Status, created_at as CreatedAt FROM quotes WHERE requirement_id = ? ORDER BY created_at DESC LIMIT 200").bind(id).all();
          quotes = qres || [];
        } catch {
        }
      }
      return json({ role, requirement, quotes });
    }
    if (isApi("requirements/") && request.method === "PATCH") {
      const reqId = path.split("/").filter((p) => p && p !== "api" && p !== "requirements").shift();
      if (!reqId) return json({ error: "MissingRequirementID" }, 400);
      const data = await bodyJSON(request);
      let allowed = requireAdmin(request);
      let isAdmin = allowed;
      if (!allowed) {
        const demPwd = String(data.demander_password || "").trim();
        if (demPwd) {
          try {
            const { results: reqRows } = await env.DB.prepare("SELECT contact_company FROM requirements WHERE requirement_id = ?").bind(reqId).all();
            const company = reqRows && reqRows[0] && reqRows[0].contact_company || "";
            if (company) {
              const like = `%"password_plain":"${demPwd}"%`;
              const { results: demRows } = await env.DB.prepare("SELECT 1 FROM demanders WHERE company = ? AND metadata_json LIKE ?").bind(company, like).all();
              if (demRows && demRows.length) allowed = true;
            }
          } catch {
          }
        }
      }
      if (!allowed) return json({ error: "Unauthorized" }, 401);
      const fieldsAdmin = /* @__PURE__ */ new Set(["status", "progress", "contact_public", "view_password_plain", "quote_password", "view_password"]);
      const fieldsDemander = /* @__PURE__ */ new Set(["status", "progress", "contact_public"]);
      const canUse = isAdmin ? fieldsAdmin : fieldsDemander;
      const sets = [];
      const binds = [];
      if (canUse.has("status") && typeof data.status === "string" && String(data.status).trim()) {
        sets.push("status = ?");
        binds.push(String(data.status).trim());
      }
      if (canUse.has("progress") && typeof data.progress === "string" && String(data.progress).trim()) {
        sets.push("progress = ?");
        binds.push(String(data.progress).trim());
      }
      if (canUse.has("contact_public") && typeof data.contact_public !== "undefined") {
        const v = !!data.contact_public ? 1 : 0;
        sets.push("contact_public = ?");
        binds.push(v);
      }
      if (canUse.has("view_password_plain") && typeof data.view_password_plain !== "undefined") {
        sets.push("view_password_plain = ?");
        binds.push(String(data.view_password_plain || ""));
      }
      if (canUse.has("quote_password") && typeof data.quote_password === "string") {
        sets.push("quote_password = ?");
        binds.push(String(data.quote_password || "").trim());
      }
      if (canUse.has("view_password") && typeof data.view_password === "string") {
        const vp = String(data.view_password || "").trim();
        sets.push("view_password = ?");
        binds.push(vp);
        sets.push("view_password_plain = ?");
        binds.push(vp);
      }
      if (!sets.length) return json({ error: "NoFields" }, 400);
      sets.push("updated_at = ?");
      binds.push((/* @__PURE__ */ new Date()).toISOString());
      const sql = `UPDATE requirements SET ${sets.join(", ")} WHERE requirement_id = ?`;
      const stmt = env.DB.prepare(sql).bind(...binds, reqId);
      const info = await stmt.run();
      if (info.changes > 0) {
        try {
          if (isAdmin && (Object.prototype.hasOwnProperty.call(data, "view_password_plain") || Object.prototype.hasOwnProperty.call(data, "view_password"))) {
            const { results: reqRows } = await env.DB.prepare("SELECT contact_company FROM requirements WHERE requirement_id = ?").bind(reqId).all();
            const company = reqRows && reqRows[0] && reqRows[0].contact_company || "";
            if (company) {
              const { results: demRows } = await env.DB.prepare("SELECT demander_id, metadata_json FROM demanders WHERE company = ?").bind(company).all();
              if (demRows && demRows.length) {
                const d = demRows[0];
                let meta = {};
                try {
                  meta = JSON.parse(d.metadata_json || "{}");
                } catch {
                }
                meta.password_plain = String((Object.prototype.hasOwnProperty.call(data, "view_password") ? data.view_password : data.view_password_plain) || "");
                const nowIso = (/* @__PURE__ */ new Date()).toISOString();
                await env.DB.prepare("UPDATE demanders SET metadata_json = ?, updated_at = ? WHERE demander_id = ?").bind(JSON.stringify(meta), nowIso, d.demander_id).run();
              }
            }
          }
        } catch {
        }
        return json({ ok: true, requirement_id: reqId });
      }
      return json({ error: "UpdateFailed" }, 404);
    }
    if (isApi("quotes") && request.method === "POST" || isFn("submitQuote") && request.method === "POST") {
      const data = await bodyJSON(request);
      const required = ["requirement_id", "supplier_name", "amount"];
      const missing = required.filter((k) => !String(data[k] || "").trim());
      if (missing.length) return json({ error: "Missing fields", fields: missing }, 400);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const quote_id = genQuoteID();
      const stmtChk = env.DB.prepare("SELECT allow_open_quotes, quote_password FROM requirements WHERE requirement_id = ?").bind(data.requirement_id);
      const { results: chk } = await stmtChk.all();
      if (!chk || !chk.length) return json({ error: "RequirementNotFound" }, 404);
      let allowed = chk[0].allow_open_quotes === 1;
      const anyPwd = String(data.password || "").trim();
      const supAccessPwd = String(data.supplier_access_password || "").trim();
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
            } catch {
            }
          }
        }
      }
      if (!allowed) return json({ error: "Unauthorized" }, 401);
      const stmt = env.DB.prepare(
        `INSERT INTO quotes (quote_id, requirement_id, supplier_id, supplier_name, supplier_phone, amount, currency, remarks, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        quote_id,
        data.requirement_id,
        data.supplier_id || "",
        data.supplier_name || "",
        data.supplier_phone || "",
        Number(data.amount) || 0,
        data.currency || "CNY",
        data.remarks || "",
        data.status || "submitted",
        now,
        now
      );
      await stmt.run();
      return json({ QuoteID: quote_id });
    }
    if (isApi("quotes") && request.method === "GET" || isFn("listQuotes") && request.method === "GET") {
      const requirement_id = url.searchParams.get("requirement_id");
      let supplier_id = url.searchParams.get("supplier_id");
      const admin = requireAdmin(request);
      const viewPwd = url.searchParams.get("view_password") || "";
      const supplierPwd = url.searchParams.get("supplier_access_password") || "";
      const demPwd = url.searchParams.get("demander_password") || "";
      let allowed = admin;
      if (!allowed && requirement_id && viewPwd) {
        const stmt2 = env.DB.prepare("SELECT view_password_plain FROM requirements WHERE requirement_id = ?").bind(requirement_id);
        const { results: results2 } = await stmt2.all();
        if (results2 && results2[0] && results2[0].view_password_plain === viewPwd) allowed = true;
      }
      if (!allowed && supplierPwd) {
        const stmtSup = env.DB.prepare('SELECT supplier_id FROM suppliers WHERE access_password_plain = ? AND (status IS NULL OR status != "disabled")').bind(supplierPwd);
        const { results: supRes } = await stmtSup.all();
        if (supRes && supRes[0]) {
          allowed = true;
          if (!supplier_id) supplier_id = supRes[0].supplier_id;
        }
      }
      if (!allowed && demPwd && requirement_id) {
        try {
          const { results: reqRows } = await env.DB.prepare("SELECT contact_company FROM requirements WHERE requirement_id = ?").bind(requirement_id).all();
          const company = reqRows && reqRows[0] && reqRows[0].contact_company || "";
          if (company) {
            const like = `%"password_plain":"${demPwd}"%`;
            const { results: demRows } = await env.DB.prepare("SELECT 1 FROM demanders WHERE company = ? AND metadata_json LIKE ?").bind(company, like).all();
            if (demRows && demRows[0]) allowed = true;
          }
        } catch {
        }
      }
      if (!allowed) return json({ error: "Unauthorized" }, 401);
      let q = "SELECT * FROM quotes";
      const where = [];
      const binds = [];
      if (requirement_id) {
        where.push("requirement_id = ?");
        binds.push(requirement_id);
      }
      if (supplier_id) {
        where.push("supplier_id = ?");
        binds.push(supplier_id);
      }
      if (where.length) q += " WHERE " + where.join(" AND ");
      q += " ORDER BY created_at DESC LIMIT 200";
      const stmt = env.DB.prepare(q).bind(...binds);
      const { results } = await stmt.all();
      return json(results || []);
    }
    if (isFn("updateQuoteStatus") && request.method === "POST" || isApi("quotes/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const idOrPath = data.quoteId || path.split("/").pop();
      const stmt = env.DB.prepare("UPDATE quotes SET status = ?, updated_at = ? WHERE quote_id = ?").bind(data.status || "updated", (/* @__PURE__ */ new Date()).toISOString(), idOrPath);
      await stmt.run();
      return json({ ok: true });
    }
    if (isFn("deleteQuote") && request.method === "POST" || isApi("quotes/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const idOrPath = data.quoteId || path.split("/").pop();
      const stmt = env.DB.prepare("DELETE FROM quotes WHERE quote_id = ?").bind(idOrPath);
      await stmt.run();
      return json({ ok: true });
    }
    if (isApi("suppliers/verify") && request.method === "POST" || isFn("verifyPassword") && request.method === "POST") {
      const data = await bodyJSON(request);
      const pass = String(data.password || "").trim();
      const ok = await verifySupplierPassword(env, pass);
      return json({ ok });
    }
    if (isApi("suppliers/session") && request.method === "POST") {
      const data = await bodyJSON(request);
      const pass = String(data.password || "").trim();
      if (!pass) return json({ error: "MissingPassword" }, 400);
      const stmt = env.DB.prepare('SELECT supplier_id, name, company FROM suppliers WHERE access_password_plain = ? AND (status IS NULL OR status != "disabled")').bind(pass);
      const { results } = await stmt.all();
      if (!results || !results.length) return json({ error: "Unauthorized" }, 401);
      const s = results[0];
      return json({ ok: true, supplier: { SupplierID: s.supplier_id, Name: s.name, Company: s.company } });
    }
    if (isApi("admin/assets") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const cursor = url.searchParams.get("cursor");
        const prefix = url.searchParams.get("prefix");
        const options = { limit };
        if (cursor) options.cursor = cursor;
        if (prefix) options.prefix = prefix;
        const listed = await env.VISPIC.list(options);
        const items = listed.objects.map((o) => ({
          key: o.key,
          size: o.size,
          uploaded: o.uploaded,
          public_url: `/api/assets/${encodeURIComponent(o.key)}`
        }));
        return json({ items, cursor: listed.cursor, truncated: listed.truncated });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (isApi("admin/assets") && request.method === "PUT") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "MissingKey" }, 400);
      try {
        await env.VISPIC.put(key, request.body);
        return json({ ok: true, key, public_url: `/api/assets/${encodeURIComponent(key)}` });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (isApi("admin/assets") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "MissingKey" }, 400);
      try {
        await env.VISPIC.delete(key);
        try {
          await env.DB.prepare("DELETE FROM assets WHERE r2_key = ?").bind(key).run();
        } catch {
        }
        return json({ ok: true });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (isFn("adminListRequirements") && request.method === "GET" || isApi("admin/requirements") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const status = (url.searchParams.get("status") || "").trim();
      const open = url.searchParams.get("open");
      const contact = url.searchParams.get("contact");
      const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "500", 10) || 500, 1), 500);
      const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);
      let sql = "SELECT * FROM requirements";
      const where = [];
      const binds = [];
      if (status) {
        where.push("status = ?");
        binds.push(status);
      }
      if (open === "true") {
        where.push("allow_open_quotes = 1");
      }
      if (open === "false") {
        where.push("allow_open_quotes = 0");
      }
      if (contact === "true") {
        where.push("contact_public = 1");
      }
      if (contact === "false") {
        where.push("contact_public = 0");
      }
      if (where.length) sql += " WHERE " + where.join(" AND ");
      sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      binds.push(limit, offset);
      const { results } = await env.DB.prepare(sql).bind(...binds).all();
      const items = (results || []).filter((r) => {
        if (!q) return true;
        const id = String(r.requirement_id || "").toLowerCase();
        const title = String(r.title || "").toLowerCase();
        const company = String(r.contact_company || "").toLowerCase();
        const contactName = String(r.contact_name || "").toLowerCase();
        return id.includes(q) || title.includes(q) || company.includes(q) || contactName.includes(q);
      });
      const offsetNext = items.length === limit ? String(offset + items.length) : "";
      return json({ items, offsetNext });
    }
    if (isFn("adminUpdateRequirement") && request.method === "POST" || isApi("admin/requirements") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      if (data.applyToAll) {
        const sets = [];
        const binds = [];
        if (typeof data.allowOpenQuotes === "boolean") {
          sets.push("allow_open_quotes = ?");
          binds.push(data.allowOpenQuotes ? 1 : 0);
        }
        if (typeof data.contactPublic === "boolean") {
          sets.push("contact_public = ?");
          binds.push(data.contactPublic ? 1 : 0);
        }
        if (data.newPasswordPlain) {
          sets.push("view_password_plain = ?");
          binds.push(String(data.newPasswordPlain));
        }
        if (typeof data.status === "string" && data.status.trim()) {
          sets.push("status = ?");
          binds.push(String(data.status).trim());
        }
        sets.push("updated_at = ?");
        binds.push((/* @__PURE__ */ new Date()).toISOString());
        if (!sets.length) return json({ error: "NoFields" }, 400);
        const stmt = env.DB.prepare(`UPDATE requirements SET ${sets.join(", ")}`);
        await stmt.bind(...binds).run();
        try {
          if (data.newPasswordPlain) {
            const { results: dems } = await env.DB.prepare("SELECT demander_id, metadata_json FROM demanders").all();
            const nowIso = (/* @__PURE__ */ new Date()).toISOString();
            for (const d of dems || []) {
              let meta = {};
              try {
                meta = JSON.parse(d.metadata_json || "{}");
              } catch {
              }
              meta.password_plain = String(data.newPasswordPlain);
              await env.DB.prepare("UPDATE demanders SET metadata_json = ?, updated_at = ? WHERE demander_id = ?").bind(JSON.stringify(meta), nowIso, d.demander_id).run();
            }
          }
        } catch {
        }
        return json({ updated: "all" });
      }
      if (data.requirementID) {
        const fields = ["title", "public_preview", "primary_category", "secondary_category", "approved", "approved_at", "status", "contact_name", "contact_phone", "contact_company", "contact_email", "contact_department", "contact_public", "allow_open_quotes", "parameters_json", "published_at", "budget_range", "procurement_plan", "progress", "view_password_plain", "quote_password", "view_password"];
        const sets = [];
        const binds = [];
        for (const f of fields) {
          if (f in data) {
            sets.push(`${f} = ?`);
            binds.push(f === "parameters_json" ? JSON.stringify(data[f]) : data[f]);
          }
        }
        sets.push("updated_at = ?");
        binds.push((/* @__PURE__ */ new Date()).toISOString());
        if (!sets.length) return json({ error: "NoFields" }, 400);
        const stmt = env.DB.prepare(`UPDATE requirements SET ${sets.join(", ")} WHERE requirement_id = ?`).bind(...binds, String(data.requirementID));
        await stmt.run();
        try {
          if (Object.prototype.hasOwnProperty.call(data, "view_password_plain") || Object.prototype.hasOwnProperty.call(data, "view_password")) {
            const { results: reqRows } = await env.DB.prepare("SELECT contact_company FROM requirements WHERE requirement_id = ?").bind(String(data.requirementID)).all();
            const company = reqRows && reqRows[0] && reqRows[0].contact_company || "";
            if (company) {
              const { results: demRows } = await env.DB.prepare("SELECT demander_id, metadata_json FROM demanders WHERE company = ?").bind(company).all();
              if (demRows && demRows.length) {
                const d = demRows[0];
                let meta = {};
                try {
                  meta = JSON.parse(d.metadata_json || "{}");
                } catch {
                }
                meta.password_plain = String((Object.prototype.hasOwnProperty.call(data, "view_password") ? data.view_password : data.view_password_plain) || "");
                const nowIso = (/* @__PURE__ */ new Date()).toISOString();
                await env.DB.prepare("UPDATE demanders SET metadata_json = ?, updated_at = ? WHERE demander_id = ?").bind(JSON.stringify(meta), nowIso, d.demander_id).run();
              }
            }
          }
        } catch {
        }
        return json({ ok: true });
      }
      return json({ error: "InvalidRequest" }, 400);
    }
    if (isApi("admin/requirements/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      const data = await bodyJSON(request);
      const fields = ["title", "public_preview", "primary_category", "secondary_category", "approved", "approved_at", "status", "contact_name", "contact_phone", "contact_company", "contact_email", "contact_department", "contact_public", "allow_open_quotes", "parameters_json", "published_at", "budget_range", "procurement_plan", "progress", "view_password_plain", "quote_password", "view_password", "is_featured", "is_urgent", "admin_notes", "tags"];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) {
          sets.push(`${f} = ?`);
          binds.push(f === "parameters_json" ? JSON.stringify(data[f]) : data[f]);
        }
      }
      sets.push("updated_at = ?");
      binds.push((/* @__PURE__ */ new Date()).toISOString());
      if (!sets.length) return json({ error: "NoFields" }, 400);
      const stmt = env.DB.prepare(`UPDATE requirements SET ${sets.join(", ")} WHERE requirement_id = ?`).bind(...binds, id);
      await stmt.run();
      return json({ ok: true });
    }
    if (isApi("admin/requirements/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      try {
        await env.DB.prepare("DELETE FROM quotes WHERE requirement_id = ?").bind(id).run();
        await env.DB.prepare("DELETE FROM requirements WHERE requirement_id = ?").bind(id).run();
        return json({ ok: true });
      } catch (e) {
        return json({ error: "DeleteFailed", detail: String(e && e.message || e) }, 500);
      }
    }
    if (isFn("adminListSuppliers") && request.method === "GET" || isApi("admin/suppliers") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const onlyPublic = (url.searchParams.get("public") || "").trim().toLowerCase() === "true";
      const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 1), 200);
      const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);
      const where = [];
      const binds = [];
      if (q) {
        where.push("(LOWER(company) LIKE ? OR LOWER(name) LIKE ? OR LOWER(contact_phone) LIKE ? OR LOWER(contact_email) LIKE ?)");
        const like = `%${q}%`;
        binds.push(like, like, like, like);
      }
      if (onlyPublic) {
        where.push(`metadata_json LIKE '%"contact_public":true%'`);
      }
      const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";
      const sql = `SELECT * FROM suppliers${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      const { results } = await env.DB.prepare(sql).bind(...binds, limit, offset).all();
      const items = (results || []).map((s) => ({
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
      const offsetNext = items.length >= limit ? String(offset + limit) : "";
      return json({ items, offsetNext });
    }
    if (isApi("admin/suppliers/upsert") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const supplier_id = String(data.supplier_id || data.company || "").trim() || "S-" + now.replace(/[-:T.Z]/g, "");
      const name = String(data.name || "").trim();
      const company = String(data.company || "").trim();
      const phone = String(data.contact_phone || "").trim();
      const email = String(data.contact_email || "").trim();
      const pass = String(data.access_password_plain || "").trim();
      const status = String(data.status || "active").trim();
      const meta = JSON.stringify(data.metadata_json || {});
      try {
        await env.DB.prepare(`INSERT INTO suppliers (
          supplier_id, name, company, contact_phone, contact_email, access_password_plain, status, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(supplier_id, name, company, phone, email, pass, status, meta, now, now).run();
        return json({ ok: true, supplier_id });
      } catch (e) {
        try {
          await env.DB.prepare(`UPDATE suppliers SET name = ?, company = ?, contact_phone = ?, contact_email = ?, access_password_plain = ?, status = ?, metadata_json = ?, updated_at = ? WHERE supplier_id = ?`).bind(name, company, phone, email, pass, status, meta, now, supplier_id).run();
          return json({ ok: true, supplier_id });
        } catch (err) {
          return json({ error: "UpsertSupplierFailed", detail: String(err && err.message || err) }, 500);
        }
      }
    }
    if (isApi("admin/suppliers") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const sets = [];
      const binds = [];
      if (data.applyToAll) {
        if (data.newPasswordPlain) {
          sets.push("access_password_plain = ?");
          binds.push(String(data.newPasswordPlain));
        }
        if (typeof data.status === "string" && data.status.trim()) {
          sets.push("status = ?");
          binds.push(String(data.status).trim());
        }
        sets.push("updated_at = ?");
        binds.push((/* @__PURE__ */ new Date()).toISOString());
        if (!sets.length) return json({ error: "NoFields" }, 400);
        const stmt = env.DB.prepare(`UPDATE suppliers SET ${sets.join(", ")}`);
        await stmt.bind(...binds).run();
        return json({ updated: "all" });
      }
      return json({ error: "InvalidRequest" }, 400);
    }
    if (isFn("adminUpdateSupplier") && request.method === "POST" || isApi("admin/suppliers/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const id = data.id || path.split("/").pop();
      const fields = ["name", "company", "access_password_plain", "contact_phone", "contact_email", "status", "metadata_json"];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) {
          sets.push(`${f} = ?`);
          binds.push(f === "metadata_json" ? JSON.stringify(data[f]) : data[f]);
        }
      }
      sets.push("updated_at = ?");
      binds.push((/* @__PURE__ */ new Date()).toISOString());
      if (!sets.length) return json({ error: "NoFields" }, 400);
      const stmt = env.DB.prepare(`UPDATE suppliers SET ${sets.join(", ")} WHERE supplier_id = ?`).bind(...binds, id);
      await stmt.run();
      return json({ ok: true });
    }
    if (isFn("adminListDemanders") && request.method === "GET" || isApi("admin/demanders") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 1), 200);
      const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);
      const where = [];
      const binds = [];
      if (q) {
        const like = `%${q}%`;
        where.push("(LOWER(company) LIKE ? OR LOWER(name) LIKE ? OR LOWER(contact_phone) LIKE ? OR LOWER(contact_email) LIKE ?)");
        binds.push(like, like, like, like);
      }
      const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";
      const sql = `SELECT *, (
          SELECT COUNT(1) FROM requirements r WHERE r.contact_company = demanders.company AND IFNULL(r.published_at,'') <> ''
        ) AS req_count
        FROM demanders${whereSql}
        ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      const { results } = await env.DB.prepare(sql).bind(...binds, limit, offset).all();
      const items = (results || []).map((d) => ({
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
      const offsetNext = items.length >= limit ? String(offset + limit) : "";
      return json({ items, offsetNext });
    }
    if (isApi("admin/demanders/stats") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const total = await env.DB.prepare("SELECT COUNT(1) AS c FROM demanders").all();
      const pub = await env.DB.prepare("SELECT COUNT(1) AS c FROM demanders WHERE metadata_json LIKE ?").bind('%"contact_public":true%').all();
      const pwd = await env.DB.prepare("SELECT COUNT(1) AS c FROM demanders WHERE metadata_json LIKE ?").bind('%"password_plain":"%').all();
      const open = await env.DB.prepare("SELECT COUNT(1) AS c FROM demanders WHERE metadata_json LIKE ?").bind('%"allow_open_quotes":true%').all();
      const totalCount = total.results && total.results[0] && total.results[0].c || 0;
      const publicCount = pub.results && pub.results[0] && pub.results[0].c || 0;
      const passwordCount = pwd.results && pwd.results[0] && pwd.results[0].c || 0;
      const openQuotesCount = open.results && open.results[0] && open.results[0].c || 0;
      return json({ total: totalCount, public: publicCount, password: passwordCount, openQuotes: openQuotesCount });
    }
    if (isApi("admin/demanders/export") && request.method === "GET") {
      let esc = function(v) {
        const s = String(v == null ? "" : v);
        const r = s.replace(/"/g, '""');
        return /,|\n|"/.test(r) ? `"${r}"` : r;
      };
      __name(esc, "esc");
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const where = [];
      const binds = [];
      if (q) {
        const like = `%${q}%`;
        where.push("(LOWER(company) LIKE ? OR LOWER(name) LIKE ? OR LOWER(contact_phone) LIKE ? OR LOWER(contact_email) LIKE ?)");
        binds.push(like, like, like, like);
      }
      const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";
      const sql = `SELECT *, (
          SELECT COUNT(1) FROM requirements r WHERE r.contact_company = demanders.company AND IFNULL(r.published_at,'') <> ''
        ) AS req_count FROM demanders${whereSql} ORDER BY created_at DESC LIMIT 10000 OFFSET 0`;
      const { results } = await env.DB.prepare(sql).bind(...binds).all();
      const items = results || [];
      const headers = ["\u516C\u53F8", "\u8054\u7CFB\u4EBA", "\u7535\u8BDD", "\u90AE\u7BB1", "\u90E8\u95E8", "\u9700\u6C42\u6570\u91CF", "\u516C\u5F00", "\u9700\u5BC6\u7801"];
      const rows = items.map((d) => {
        const m = parseJSONSafe(d.metadata_json) || {};
        const contactPublic = !!m.contact_public;
        const needPassword = !(m.allow_open_quotes === true);
        return [d.company || "", d.name || "", d.contact_phone || "", d.contact_email || "", d.department || "", d.req_count || 0, contactPublic ? "\u516C\u5F00" : "\u4E0D\u516C\u5F00", needPassword ? "\u9700\u8981" : "\u4E0D\u9700\u8981"];
      });
      const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="demanders.csv"' } });
    }
    if (isApi("admin/demanders") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const demander_id = String(data.demander_id || data.company || "").trim() || "D-" + now.replace(/[-:T.Z]/g, "");
      const name = String(data.name || "").trim();
      const company = String(data.company || "").trim();
      const phone = String(data.contact_phone || "").trim();
      const email = String(data.contact_email || "").trim();
      const dept = String(data.department || "").trim();
      const meta = JSON.stringify(data.metadata_json || {});
      try {
        await env.DB.prepare(`INSERT INTO demanders (
          demander_id, name, company, contact_phone, contact_email, department, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(demander_id, name, company, phone, email, dept, meta, now, now).run();
        return json({ ok: true, demander_id });
      } catch (e) {
        try {
          await env.DB.prepare(`UPDATE demanders SET name = ?, company = ?, contact_phone = ?, contact_email = ?, department = ?, metadata_json = ?, updated_at = ? WHERE demander_id = ?`).bind(name, company, phone, email, dept, meta, now, demander_id).run();
          return json({ ok: true, demander_id });
        } catch (err) {
          return json({ error: "CreateDemanderFailed", detail: String(err && err.message || err) }, 500);
        }
      }
    }
    if (isFn("adminUpdateDemander") && request.method === "POST" || isApi("admin/demanders/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const id = data.id || path.split("/").pop();
      const fields = ["name", "company", "contact_phone", "contact_email", "department", "metadata_json"];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) {
          sets.push(`${f} = ?`);
          binds.push(f === "metadata_json" ? JSON.stringify(data[f]) : data[f]);
        }
      }
      sets.push("updated_at = ?");
      binds.push((/* @__PURE__ */ new Date()).toISOString());
      if (!sets.length) return json({ error: "NoFields" }, 400);
      const stmt = env.DB.prepare(`UPDATE demanders SET ${sets.join(", ")} WHERE demander_id = ?`).bind(...binds, id);
      await stmt.run();
      return json({ ok: true });
    }
    if (isApi("admin/demanders/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      try {
        await env.DB.prepare("DELETE FROM demanders WHERE demander_id = ?").bind(id).run();
        return json({ ok: true });
      } catch (e) {
        return json({ error: "DeleteDemanderFailed", detail: String(e && e.message || e) }, 500);
      }
    }
    if (isApi("admin/suppliers/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      try {
        await env.DB.prepare("DELETE FROM suppliers WHERE supplier_id = ?").bind(id).run();
        return json({ ok: true });
      } catch (e) {
        return json({ error: "DeleteSupplierFailed", detail: String(e && e.message || e) }, 500);
      }
    }
    if (isApi("admin/suppliers/export") && request.method === "GET") {
      let esc = function(v) {
        const s = String(v == null ? "" : v);
        const r = s.replace(/"/g, '""');
        return /,|\n|"/.test(r) ? `"${r}"` : r;
      };
      __name(esc, "esc");
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const onlyPublic = url.searchParams.get("public") === "true";
      const where = [];
      const binds = [];
      if (q) {
        where.push("(LOWER(company) LIKE ? OR LOWER(name) LIKE ? OR LOWER(contact_phone) LIKE ? OR LOWER(contact_email) LIKE ?)");
        const like = `%${q}%`;
        binds.push(like, like, like, like);
      }
      if (onlyPublic) {
        where.push(`metadata_json LIKE '%"contact_public":true%'`);
      }
      const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";
      const sql = `SELECT * FROM suppliers${whereSql} ORDER BY created_at DESC LIMIT 10000 OFFSET 0`;
      const { results } = await env.DB.prepare(sql).bind(...binds).all();
      const items = results || [];
      const headers = ["\u516C\u53F8/\u540D\u79F0", "\u8054\u7CFB\u4EBA", "\u7535\u8BDD", "\u90AE\u7BB1", "\u516C\u5F00", "\u5B98\u7F51"];
      const rows = items.map((s) => {
        const m = parseJSONSafe(s.metadata_json) || {};
        const contactPublic = !!m.contact_public;
        const website = m.website || "";
        return [s.company || s.name || "", s.name || "", s.contact_phone || "", s.contact_email || "", contactPublic ? "\u516C\u5F00" : "\u4E0D\u516C\u5F00", website];
      });
      const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="suppliers.csv"' } });
    }
    if (isApi("admin/products") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const supplier_id = url.searchParams.get("supplier_id");
      const product_id = path.split("/").pop();
      const parts = path.split("/");
      const possibleId = parts[parts.length - 1];
      if (possibleId && possibleId !== "products") {
        const { results: results2 } = await env.DB.prepare("SELECT * FROM products WHERE product_id = ?").bind(possibleId).all();
        if (!results2 || !results2.length) return json({ error: "NotFound" }, 404);
        const p = results2[0];
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
      let q = "SELECT * FROM products";
      const where = [];
      const binds = [];
      if (supplier_id) {
        where.push("supplier_id = ?");
        binds.push(supplier_id);
      }
      if (where.length) q += " WHERE " + where.join(" AND ");
      q += " ORDER BY created_at DESC LIMIT 100";
      const { results } = await env.DB.prepare(q).bind(...binds).all();
      const items = (results || []).map((p) => ({
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
    if ((isApi("products") || isApi("admin/products")) && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const product_id = data.ProductID || data.product_id || "PROD-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e3);
      const supplier_id = data.SupplierID || data.supplier_id;
      if (!supplier_id) return json({ error: "MissingSupplierID" }, 400);
      await env.DB.prepare(`INSERT INTO products (
        product_id, supplier_id, name, slug, model, series, primary_category, secondary_category, summary, description, parameters_json, cover_image, gallery_json, documents_json, seo_title, seo_keywords, seo_description, status, is_featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        product_id,
        supplier_id,
        data.Name || data.name || "",
        data.Slug || data.slug || null,
        data.Model || data.model || "",
        data.Series || data.series || "",
        data.PrimaryCategory || data.primary_category || "",
        data.SecondaryCategory || data.secondary_category || "",
        data.Summary || data.summary || "",
        data.Description || data.description || "",
        JSON.stringify(data.Parameters || data.parameters_json || {}),
        data.CoverImage || data.cover_image || "",
        JSON.stringify(data.Gallery || data.gallery_json || []),
        JSON.stringify(data.Documents || data.documents_json || []),
        data.SeoTitle || data.seo_title || "",
        data.SeoKeywords || data.seo_keywords || "",
        data.SeoDescription || data.seo_description || "",
        data.Status || data.status || "active",
        data.IsFeatured || data.is_featured ? 1 : 0,
        now,
        now
      ).run();
      return json({ ok: true, product_id });
    }
    if (isApi("admin/news") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const parts = path.split("/");
      const possibleId = parts[parts.length - 1];
      if (possibleId && possibleId !== "news") {
        const { results: results2 } = await env.DB.prepare("SELECT * FROM news WHERE news_id = ? OR id = ?").bind(possibleId, possibleId).all();
        if (!results2 || !results2.length) return json({ error: "NotFound" }, 404);
        return json(results2[0]);
      }
      const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 100").all();
      return json(results || []);
    }
    if (isApi("admin/news") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const news_id = "NEWS-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e3);
      await env.DB.prepare(`INSERT INTO news (
        news_id, title, slug, summary, content, cover_image, category, tags, author, status, seo_title, seo_keywords, seo_description, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        news_id,
        data.title || "",
        data.slug || null,
        data.summary || "",
        data.content || "",
        data.cover_image || "",
        data.category || "",
        JSON.stringify(data.tags || []),
        data.author || "",
        data.status || "draft",
        data.seo_title || "",
        data.seo_keywords || "",
        data.seo_description || "",
        data.published_at || now,
        now,
        now
      ).run();
      return json({ ok: true, news_id });
    }
    if (isApi("admin/news/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      const data = await bodyJSON(request);
      const fields = ["title", "slug", "summary", "content", "cover_image", "category", "tags", "author", "status", "seo_title", "seo_keywords", "seo_description", "published_at"];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) {
          let val = data[f];
          if (f === "tags" && typeof val === "object") val = JSON.stringify(val);
          sets.push(`${f} = ?`);
          binds.push(val);
        }
      }
      sets.push("updated_at = ?");
      binds.push((/* @__PURE__ */ new Date()).toISOString());
      if (!sets.length) return json({ error: "NoFields" }, 400);
      await env.DB.prepare(`UPDATE news SET ${sets.join(", ")} WHERE news_id = ?`).bind(...binds, id).run();
      return json({ ok: true });
    }
    if (isApi("admin/news/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      await env.DB.prepare("DELETE FROM news WHERE news_id = ?").bind(id).run();
      return json({ ok: true });
    }
    if (isApi("admin/cases") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const parts = path.split("/");
      const possibleId = parts[parts.length - 1];
      if (possibleId && possibleId !== "cases") {
        const { results: results2 } = await env.DB.prepare("SELECT * FROM cases WHERE case_id = ?").bind(possibleId).all();
        if (!results2 || !results2.length) return json({ error: "NotFound" }, 404);
        return json(results2[0]);
      }
      const { results } = await env.DB.prepare("SELECT * FROM cases ORDER BY created_at DESC LIMIT 100").all();
      return json(results || []);
    }
    if (isApi("admin/cases") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const case_id = "CASE-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e3);
      await env.DB.prepare(`INSERT INTO cases (
        case_id, title, slug, summary, content, cover_image, industry, related_product_id, status, seo_title, seo_keywords, seo_description, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        case_id,
        data.title || "",
        data.slug || null,
        data.summary || "",
        data.content || "",
        data.cover_image || "",
        data.industry || "",
        data.related_product_id || "",
        data.status || "draft",
        data.seo_title || "",
        data.seo_keywords || "",
        data.seo_description || "",
        data.published_at || now,
        now,
        now
      ).run();
      return json({ ok: true, case_id });
    }
    if (isApi("admin/cases/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      const data = await bodyJSON(request);
      const fields = ["title", "slug", "summary", "content", "cover_image", "industry", "related_product_id", "status", "seo_title", "seo_keywords", "seo_description", "published_at"];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) {
          sets.push(`${f} = ?`);
          binds.push(data[f]);
        }
      }
      sets.push("updated_at = ?");
      binds.push((/* @__PURE__ */ new Date()).toISOString());
      if (!sets.length) return json({ error: "NoFields" }, 400);
      await env.DB.prepare(`UPDATE cases SET ${sets.join(", ")} WHERE case_id = ?`).bind(...binds, id).run();
      return json({ ok: true });
    }
    if (isApi("admin/cases/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      await env.DB.prepare("DELETE FROM cases WHERE case_id = ?").bind(id).run();
      return json({ ok: true });
    }
    if (isApi("admin/system-config") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const { results } = await env.DB.prepare("SELECT value_json FROM system_config WHERE key = ?").bind("default").all();
      const config = results && results[0] && parseJSONSafe(results[0].value_json) || {};
      return json({ config });
    }
    if (isApi("admin/system-config") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const value = JSON.stringify(data || {});
      await env.DB.prepare("INSERT INTO system_config (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?").bind("default", value, now, value, now).run();
      return json({ ok: true });
    }
    if (isApi("admin/seed-content") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const newsCount = (await env.DB.prepare("SELECT COUNT(1) as c FROM news").first()).c;
        if (newsCount === 0) {
          await env.DB.prepare(`INSERT INTO news (news_id, title, slug, category, summary, content, status, published_at, created_at, updated_at) VALUES 
             ('n1', '\u5DE5\u4E1A\u5185\u7AA5\u955C\u5728\u822A\u7A7A\u53D1\u52A8\u673A\u68C0\u6D4B\u4E2D\u7684\u5E94\u7528', 'aero-engine-inspection', '\u6280\u672F\u6587\u7AE0', '\u63A2\u8BA8\u5DE5\u4E1A\u5185\u7AA5\u955C\u5728\u822A\u7A7A\u53D1\u52A8\u673A\u53F6\u7247\u88C2\u7EB9\u68C0\u6D4B\u4E2D\u7684\u5173\u952E\u4F5C\u7528\u3002', '\u8BE6\u7EC6\u5185\u5BB9...', 'published', '${now}', '${now}', '${now}'),
             ('n2', 'Vision NDT \u53D1\u5E03\u5168\u65B0 P60 \u7CFB\u5217', 'new-p60-release', '\u516C\u53F8\u52A8\u6001', '\u6700\u65B0\u4E00\u4EE3\u9AD8\u6E05\u5DE5\u4E1A\u5185\u7AA5\u955CP60\u6B63\u5F0F\u53D1\u5E03\uFF0C\u642D\u8F7DAI\u7F3A\u9677\u8BC6\u522B\u529F\u80FD\u3002', '\u8BE6\u7EC6\u5185\u5BB9...', 'published', '${now}', '${now}', '${now}'),
             ('n3', '2025\u5E74\u65E0\u635F\u68C0\u6D4B\u884C\u4E1A\u53D1\u5C55\u8D8B\u52BF', 'ndt-trends-2025', '\u884C\u4E1A\u8D44\u8BAF', '\u6570\u5B57\u5316\u3001\u667A\u80FD\u5316\u5C06\u6210\u4E3A\u65E0\u635F\u68C0\u6D4B\u884C\u4E1A\u53D1\u5C55\u7684\u4E3B\u65CB\u5F8B\u3002', '\u8BE6\u7EC6\u5185\u5BB9...', 'published', '${now}', '${now}', '${now}')
             `).run();
        }
        const exhCount = (await env.DB.prepare("SELECT COUNT(1) as c FROM exhibitions").first()).c;
        if (exhCount === 0) {
          await env.DB.prepare(`INSERT INTO exhibitions (exhibition_id, title, slug, location, booth_number, start_date, end_date, status, summary, created_at, updated_at) VALUES 
             ('e1', '2025\u4E0A\u6D77\u56FD\u9645\u65E0\u635F\u68C0\u6D4B\u5C55', 'shanghai-ndt-2025', '\u4E0A\u6D77\u65B0\u56FD\u9645\u535A\u89C8\u4E2D\u5FC3', 'W1-A203', '2025-10-20', '2025-10-23', 'published', '\u8BDA\u9080\u8385\u4E34\u53C2\u89C2\u4EA4\u6D41', '${now}', '${now}')
             `).run();
        }
        const prodCount = (await env.DB.prepare("SELECT COUNT(1) as c FROM products").first()).c;
        if (prodCount === 0) {
          await env.DB.prepare(`INSERT INTO products (product_id, name, slug, model, series, primary_category, status, summary, is_featured, created_at, updated_at) VALUES 
             ('p1', 'P60 \u9AD8\u6E05\u5DE5\u4E1A\u5185\u7AA5\u955C', 'p60-borescope', 'P60-2015', 'P\u7CFB\u5217', '\u5DE5\u4E1A\u5185\u7AA5\u955C', 'active', '1080P\u9AD8\u6E05\uFF0C360\u5EA6\u8F6C\u5411', 1, '${now}', '${now}'),
             ('p2', 'F40 \u4FBF\u643A\u5F0F\u5185\u7AA5\u955C', 'f40-portable', 'F40-1510', 'F\u7CFB\u5217', '\u5DE5\u4E1A\u5185\u7AA5\u955C', 'active', '\u8F7B\u4FBF\u6613\u643A\u5E26\uFF0C\u8D85\u957F\u7EED\u822A', 0, '${now}', '${now}')
             `).run();
        }
        const caseCount = (await env.DB.prepare("SELECT COUNT(1) as c FROM cases").first()).c;
        if (caseCount === 0) {
          await env.DB.prepare(`INSERT INTO cases (case_id, title, slug, industry, status, summary, published_at, created_at, updated_at) VALUES 
             ('c1', '\u67D0\u822A\u7A7A\u516C\u53F8\u53D1\u52A8\u673A\u5B54\u63A2\u6848\u4F8B', 'airline-engine-inspection', '\u822A\u7A7A\u822A\u5929', 'published', '\u4F7F\u7528P60\u8FDB\u884C\u53D1\u52A8\u673A\u5185\u90E8\u53F6\u7247\u635F\u4F24\u68C0\u6D4B\uFF0C\u63D0\u9AD8\u6548\u738730%\u3002', '${now}', '${now}', '${now}')
             `).run();
        }
        return json({ ok: true, message: "Seeded missing content" });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (isApi("admin/dev-seed") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      let reqs = [], sups = [], dems = [];
      let base = url.searchParams.get("base") || "http://127.0.0.1:5500/data";
      try {
        const body = await request.json();
        console.log("DevSeed Body Keys:", Object.keys(body));
        if (body.requirements) reqs = body.requirements;
        if (body.suppliers) sups = body.suppliers;
        if (body.demanders) dems = body.demanders;
      } catch (e) {
        console.error("Body Parse Error:", e);
      }
      if (!reqs.length && !sups.length && !dems.length) {
        reqs = await fetchJsonSafe(`${base}/requirements.json`);
        sups = await fetchJsonSafe(`${base}/suppliers.json`);
        dems = await fetchJsonSafe(`${base}/demanders.json`);
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      for (const r of reqs || []) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO requirements (
            requirement_id, title, public_preview, primary_category, secondary_category, approved, approved_at, status,
            contact_name, contact_phone, contact_company, contact_email, contact_department,
            contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
            progress, view_password_plain, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
            r.RequirementID || "",
            r.Title || "",
            r.PublicPreview || "",
            r.PrimaryCategory || "",
            r.SecondaryCategory || "",
            1,
            now,
            r.Status || "",
            r.ContactName || "",
            r.ContactPhone || "",
            r.ContactCompany || "",
            r.ContactEmail || "",
            r.ContactDepartment || "",
            r.ContactPublic ? 1 : 0,
            r.AllowOpenQuotes ? 1 : 0,
            JSON.stringify(r.Parameters || {}),
            r.PublishedAt || now,
            r.BudgetRange || "",
            r.procurementPlan || "",
            r.Progress || "",
            r.ViewPasswordPlain || "",
            r.created_at || now,
            r.updated_at || now
          ).run();
        } catch (err) {
          console.error("Seed Error (Req):", err.message, r.RequirementID);
        }
      }
      if (!Array.isArray(sups) || !sups.length) {
        const siteBase = String(base).replace(/\/?data\/?$/i, "");
        const idx = await fetchJsonSafe(`${siteBase}/index.json`);
        const list = Array.isArray(idx) ? idx : [];
        const items = list.filter((i) => {
          const t = String(i.type || i.section || "").toLowerCase();
          return t === "suppliers" || String(i.section || "").toLowerCase() === "suppliers";
        });
        sups = items.map((i) => {
          const p = i.params || {};
          const uri = String(i.uri || "").trim();
          const id = String(p.slug || (uri.split("/").filter(Boolean).pop() || "") || p.title || i.title || "").trim();
          return {
            SupplierID: id || (p.title || i.title || ""),
            Name: p.contact_person || "",
            Company: p.title || i.title || "",
            AccessPassword: "",
            ContactPhone: p.phone || "",
            ContactEmail: p.email || "",
            Status: "active",
            metadata: {
              website: siteBase ? siteBase + uri : uri,
              type: p.type || "",
              address: p.address || "",
              series: Array.isArray(p.series) ? p.series : [],
              models: Array.isArray(p.models) ? p.models : [],
              gallery: Array.isArray(p.gallery) ? p.gallery : [],
              description: p.description || ""
            }
          };
        });
      }
      for (const s of sups || []) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO suppliers (
            supplier_id, name, company, access_password_plain, contact_phone, contact_email, status, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
            s.SupplierID || s.supplier_id || "",
            s.Name || s.name || "",
            s.Company || s.company || "",
            s.AccessPassword || s.access_password_plain || "",
            s.ContactPhone || s.contact_phone || "",
            s.ContactEmail || s.contact_email || "",
            s.Status || s.status || "",
            JSON.stringify(s.metadata || s.metadata_json || {}),
            s.created_at || now,
            s.updated_at || now
          ).run();
        } catch {
        }
      }
      for (const d of dems || []) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO demanders (
            demander_id, name, company, contact_phone, contact_email, department, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
            d.demander_id || d.DemanderID || "",
            d.name || d.Name || "",
            d.company || d.Company || "",
            d.contact_phone || d.ContactPhone || "",
            d.contact_email || d.ContactEmail || "",
            d.department || d.Department || "",
            JSON.stringify(d.metadata || {}),
            d.created_at || now,
            d.updated_at || now
          ).run();
        } catch {
        }
      }
      return json({ ok: true, counts: { requirements: (reqs || []).length, suppliers: (sups || []).length, demanders: (dems || []).length } });
    }
    if (isApi("admin/cleanup-invalid") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        const { results: reqCountBefore } = await env.DB.prepare("SELECT COUNT(1) as c FROM requirements").all();
        const { results: quoteCountBefore } = await env.DB.prepare("SELECT COUNT(1) as c FROM quotes").all();
        await env.DB.prepare("DELETE FROM requirements WHERE requirement_id IS NULL OR TRIM(requirement_id) = ''").run();
        await env.DB.prepare("DELETE FROM requirements WHERE title IS NULL OR TRIM(title) = '' OR title = 'undefined'").run();
        await env.DB.prepare("DELETE FROM requirements WHERE primary_category = 'undefined' OR secondary_category = 'undefined'").run();
        await env.DB.prepare("DELETE FROM quotes WHERE requirement_id NOT IN (SELECT requirement_id FROM requirements)").run();
        const { results: reqCountAfter } = await env.DB.prepare("SELECT COUNT(1) as c FROM requirements").all();
        const { results: quoteCountAfter } = await env.DB.prepare("SELECT COUNT(1) as c FROM quotes").all();
        const deletedReqs = (reqCountBefore?.[0]?.c || 0) - (reqCountAfter?.[0]?.c || 0);
        const deletedQuotes = (quoteCountBefore?.[0]?.c || 0) - (quoteCountAfter?.[0]?.c || 0);
        return json({ ok: true, deleted: { requirements: deletedReqs, quotes: deletedQuotes } });
      } catch (e) {
        return json({ error: "CleanupFailed", detail: String(e && e.message || e) }, 500);
      }
    }
    if (isApi("admin/reset-data") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        const scope = (url.searchParams.get("scope") || "").trim();
        const wipeAll = scope === "all" || scope === "";
        const doReq = wipeAll || scope.includes("requirements");
        const doQuote = wipeAll || scope.includes("quotes");
        const doSup = scope.includes("suppliers") || wipeAll;
        const doDem = scope.includes("demanders") || wipeAll;
        const { results: reqCountBefore } = await env.DB.prepare("SELECT COUNT(1) as c FROM requirements").all();
        const { results: quoteCountBefore } = await env.DB.prepare("SELECT COUNT(1) as c FROM quotes").all();
        const { results: supCountBefore } = await env.DB.prepare("SELECT COUNT(1) as c FROM suppliers").all();
        const { results: demCountBefore } = await env.DB.prepare("SELECT COUNT(1) as c FROM demanders").all();
        if (doQuote) {
          await env.DB.prepare("DELETE FROM quotes").run();
        }
        if (doReq) {
          await env.DB.prepare("DELETE FROM requirements").run();
        }
        if (doSup) {
          await env.DB.prepare("DELETE FROM suppliers").run();
        }
        if (doDem) {
          await env.DB.prepare("DELETE FROM demanders").run();
        }
        const { results: reqCountAfter } = await env.DB.prepare("SELECT COUNT(1) as c FROM requirements").all();
        const { results: quoteCountAfter } = await env.DB.prepare("SELECT COUNT(1) as c FROM quotes").all();
        const { results: supCountAfter } = await env.DB.prepare("SELECT COUNT(1) as c FROM suppliers").all();
        const { results: demCountAfter } = await env.DB.prepare("SELECT COUNT(1) as c FROM demanders").all();
        return json({ ok: true, deleted: {
          requirements: (reqCountBefore?.[0]?.c || 0) - (reqCountAfter?.[0]?.c || 0),
          quotes: (quoteCountBefore?.[0]?.c || 0) - (quoteCountAfter?.[0]?.c || 0),
          suppliers: (supCountBefore?.[0]?.c || 0) - (supCountAfter?.[0]?.c || 0),
          demanders: (demCountBefore?.[0]?.c || 0) - (demCountAfter?.[0]?.c || 0)
        } });
      } catch (e) {
        return json({ error: "ResetFailed", detail: String(e && e.message || e) }, 500);
      }
    }
    if (isApi("admin/import-suppliers") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        const base = url.searchParams.get("base") || "http://127.0.0.1:5500/data";
        let sups = await fetchJsonSafe(`${base}/suppliers.json`);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        if (!Array.isArray(sups) || !sups.length) {
          const siteBase = String(base).replace(/\/?data\/?$/i, "");
          const idx = await fetchJsonSafe(`${siteBase}/index.json`);
          const list = Array.isArray(idx) ? idx : [];
          const items = list.filter((i) => {
            const t = String(i.type || i.section || "").toLowerCase();
            return t === "suppliers" || String(i.section || "").toLowerCase() === "suppliers";
          });
          sups = items.map((i) => {
            const p = i.params || {};
            const uri = String(i.uri || "").trim();
            const id = String(p.slug || (uri.split("/").filter(Boolean).pop() || "") || p.title || i.title || "").trim();
            return {
              SupplierID: id || (p.title || i.title || ""),
              Name: p.contact_person || "",
              Company: p.title || i.title || "",
              AccessPassword: "",
              ContactPhone: p.phone || "",
              ContactEmail: p.email || "",
              Status: "active",
              metadata: {
                website: siteBase ? siteBase + uri : uri,
                type: p.type || "",
                address: p.address || "",
                series: Array.isArray(p.series) ? p.series : [],
                models: Array.isArray(p.models) ? p.models : [],
                gallery: Array.isArray(p.gallery) ? p.gallery : [],
                description: p.description || ""
              },
              created_at: now,
              updated_at: now
            };
          });
        }
        let upserted = 0;
        for (const s of sups || []) {
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
            `).bind(
              s.SupplierID || s.supplier_id || "",
              s.Name || s.name || "",
              s.Company || s.company || "",
              s.AccessPassword || s.access_password_plain || "",
              s.ContactPhone || s.contact_phone || "",
              s.ContactEmail || s.contact_email || "",
              s.Status || s.status || "",
              JSON.stringify(s.metadata || s.metadata_json || {}),
              s.created_at || now,
              s.updated_at || now
            ).run();
            upserted++;
          } catch {
          }
        }
        return json({ ok: true, upserted });
      } catch (e) {
        return json({ error: "ImportSuppliersFailed", detail: String(e && e.message || e) }, 500);
      }
    }
    if (isApi("admin/import-demanders") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const { results: reqs } = await env.DB.prepare("SELECT contact_company, contact_name, contact_phone, contact_email, contact_department, contact_public, allow_open_quotes FROM requirements WHERE IFNULL(published_at,'') <> ''").all();
        const map = /* @__PURE__ */ new Map();
        for (const r of reqs || []) {
          const key = String(r.contact_company || "").trim();
          if (!key) continue;
          const prev = map.get(key) || { company: key, name: "", contact_phone: "", contact_email: "", department: "", contact_public: 0, allow_open_quotes: 0, count: 0 };
          const name = prev.name || String(r.contact_name || "").trim();
          const phone = prev.contact_phone || String(r.contact_phone || "").trim();
          const email = prev.contact_email || String(r.contact_email || "").trim();
          const dept = prev.department || String(r.contact_department || "").trim();
          const pub = prev.contact_public || (r.contact_public ? 1 : 0);
          const open = prev.allow_open_quotes || (r.allow_open_quotes ? 1 : 0);
          map.set(key, { company: key, name, contact_phone: phone, contact_email: email, department: dept, contact_public: pub, allow_open_quotes: open, count: (prev.count || 0) + 1 });
        }
        let upserted = 0;
        for (const [company, v] of map.entries()) {
          const id = company;
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
            `).bind(id, v.name, company, v.contact_phone, v.contact_email, v.department, meta, now, now).run();
            upserted++;
          } catch {
          }
        }
        return json({ ok: true, upserted });
      } catch (e) {
        return json({ error: "ImportDemandersFailed", detail: String(e && e.message || e) }, 500);
      }
    }
    if (isApi("requirements/by-password") && request.method === "GET") {
      const viewPwd = (url.searchParams.get("view_password") || "").trim();
      if (!viewPwd) return json({ error: "MissingPassword" }, 400);
      const { results } = await env.DB.prepare("SELECT * FROM requirements WHERE view_password_plain = ? ORDER BY created_at DESC LIMIT 100").bind(viewPwd).all();
      const items = (results || []).map((r) => ({
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
    if (isApi("demanders/session") && request.method === "POST") {
      const data = await bodyJSON(request);
      const pass = String(data.password || "").trim();
      if (!pass) return json({ error: "MissingPassword" }, 400);
      const like = `%"password_plain":"${pass}"%`;
      const { results } = await env.DB.prepare("SELECT demander_id, name, company FROM demanders WHERE metadata_json LIKE ?").bind(like).all();
      if (!results || !results.length) return json({ error: "Unauthorized" }, 401);
      const d = results[0];
      return json({ ok: true, demander: { DemanderID: d.demander_id, Name: d.name, Company: d.company } });
    }
    if (isApi("demanders/requirements") && request.method === "GET") {
      const company = (url.searchParams.get("company") || "").trim();
      const pass = (url.searchParams.get("password") || "").trim();
      if (!company || !pass) return json({ error: "MissingParams" }, 400);
      const like = `%"password_plain":"${pass}"%`;
      const { results: demRows } = await env.DB.prepare("SELECT 1 FROM demanders WHERE company = ? AND metadata_json LIKE ?").bind(company, like).all();
      if (!demRows || !demRows.length) return json({ error: "Unauthorized" }, 401);
      const { results } = await env.DB.prepare("SELECT requirement_id, title, status FROM requirements WHERE contact_company = ? ORDER BY created_at DESC LIMIT 100").bind(company).all();
      const items = (results || []).map((r) => ({ RequirementID: r.requirement_id, Title: r.title, Status: r.status }));
      return json({ items });
    }
    if (isApi("admin/assets") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const type = url.searchParams.get("type");
      const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 200);
      const cursor = url.searchParams.get("cursor") || void 0;
      const items = [];
      let next = "";
      try {
        if (env.VISPIC && typeof env.VISPIC.list === "function") {
          const opts = { limit };
          if (cursor) opts.cursor = cursor;
          const list = await env.VISPIC.list(opts);
          for (const o of list.objects || []) {
            const key = o.key;
            const isTypeOk = type ? (o.httpMetadata && o.httpMetadata.contentType || "").startsWith(type) : true;
            if (!isTypeOk) continue;
            const public_url = `/api/assets/${encodeURIComponent(key)}`;
            items.push({ key, size: o.size || 0, public_url });
          }
          next = list.truncated && list.cursor ? list.cursor : "";
        } else {
          const off = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);
          let q = "SELECT * FROM assets";
          const where = [];
          const binds = [];
          if (type) {
            where.push("file_type LIKE ?");
            binds.push(`${type}%`);
          }
          if (where.length) q += " WHERE " + where.join(" AND ");
          q += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
          binds.push(limit, off);
          const { results } = await env.DB.prepare(q).bind(...binds).all();
          for (const r of results || []) {
            const key = r.r2_key || "";
            const public_url = r.public_url || (key ? `/api/assets/${encodeURIComponent(key)}` : "");
            items.push({ key, size: r.file_size || 0, public_url });
          }
        }
      } catch {
      }
      return json({ items, offsetNext: next });
    }
    if (isApi("admin/assets") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const asset_id = "AST-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e4);
      let public_url = data.public_url || "";
      let r2_key = data.r2_key || "";
      let file_type = data.file_type || "application/octet-stream";
      let file_size = data.file_size || 0;
      try {
        if (!public_url && env.VISPIC && typeof env.VISPIC.put === "function") {
          let bytes = null;
          if (typeof data.file_base64 === "string" && data.file_base64) {
            let s = data.file_base64;
            const i = s.indexOf(",");
            if (i >= 0) {
              s = s.slice(i + 1);
            }
            const bin = atob(s);
            const arr = new Uint8Array(bin.length);
            for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
            bytes = arr;
          } else if (typeof data.data_url === "string" && data.data_url) {
            const p = String(data.data_url);
            const i = p.indexOf(",");
            const head = i >= 0 ? p.slice(0, i) : "";
            file_type = head.replace(/^data:/, "").replace(/;base64$/, "") || file_type;
            let s = i >= 0 ? p.slice(i + 1) : p;
            const bin = atob(s);
            const arr = new Uint8Array(bin.length);
            for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
            bytes = arr;
          } else if (typeof data.url === "string" && data.url) {
            const resp = await fetch(data.url);
            file_type = resp.headers.get("content-type") || file_type;
            bytes = await resp.arrayBuffer();
          }
          if (bytes) {
            const baseName = (data.filename || "asset").replace(/[^a-zA-Z0-9._-]/g, "_");
            const y = now.slice(0, 7).replace("-", "/");
            r2_key = `assets/${y}/${asset_id}-${baseName}`;
            await env.VISPIC.put(r2_key, bytes, { httpMetadata: { contentType: file_type } });
            const obj = await env.VISPIC.get(r2_key);
            file_size = obj && obj.size || (bytes.byteLength || 0);
            public_url = `/api/assets/${encodeURIComponent(r2_key)}`;
          }
        }
      } catch {
      }
      if (!public_url) {
        public_url = `https://via.placeholder.com/150?text=${encodeURIComponent(data.filename || "Asset")}`;
      }
      await env.DB.prepare(`INSERT INTO assets (
        asset_id, filename, r2_key, public_url, file_type, file_size, alt_text, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        asset_id,
        data.filename || "unknown",
        r2_key,
        public_url,
        file_type,
        file_size,
        data.alt_text || "",
        "admin",
        now
      ).run();
      return json({ ok: true, asset: { asset_id, public_url, filename: data.filename } });
    }
    if (isApi("admin/assets") && request.method === "PUT") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const key = url.searchParams.get("key") || "";
      if (!key) return json({ error: "MissingKey" }, 400);
      const ct = request.headers.get("content-type") || "application/octet-stream";
      let ok = false;
      let size = 0;
      try {
        if (env.VISPIC && typeof env.VISPIC.put === "function") {
          await env.VISPIC.put(key, request.body, { httpMetadata: { contentType: ct } });
          const obj = await env.VISPIC.get(key);
          size = obj && obj.size || 0;
          ok = true;
        }
      } catch {
      }
      if (!ok) return json({ error: "UploadFailed" }, 500);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const asset_id = "AST-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e4);
      const public_url = `/api/assets/${encodeURIComponent(key)}`;
      await env.DB.prepare(`INSERT INTO assets (
        asset_id, filename, r2_key, public_url, file_type, file_size, alt_text, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        asset_id,
        key.split("/").pop(),
        key,
        public_url,
        ct,
        size,
        "",
        "admin",
        now
      ).run();
      return json({ ok: true, key, public_url });
    }
    if (isApi("admin/assets") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const key = url.searchParams.get("key");
      if (key) {
        try {
          if (env.VISPIC && typeof env.VISPIC.delete === "function") await env.VISPIC.delete(key);
        } catch {
        }
        try {
          await env.DB.prepare("DELETE FROM assets WHERE r2_key = ?").bind(key).run();
        } catch {
        }
        return json({ ok: true });
      }
      const id = path.split("/").pop();
      try {
        await env.DB.prepare("DELETE FROM assets WHERE asset_id = ?").bind(id).run();
      } catch {
      }
      return json({ ok: true });
    }
    if (isApi("assets/") && request.method === "GET") {
      const k = decodeURIComponent(path.replace("/api/assets/", ""));
      if (!k) return new Response("Not Found", { status: 404, headers: baseHeaders });
      try {
        const obj = await env.VISPIC.get(k);
        if (!obj || !obj.body) return new Response("Not Found", { status: 404, headers: baseHeaders });
        const h = new Headers(baseHeaders);
        const ct = obj.httpMetadata && obj.httpMetadata.contentType || "application/octet-stream";
        h.set("Content-Type", ct);
        return new Response(obj.body, { status: 200, headers: h });
      } catch (e) {
        return new Response("Not Found", { status: 404, headers: baseHeaders });
      }
    }
    if (isApi("admin/products") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const product_id = data.product_id || "PROD-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e4);
      try {
        const fields = ["product_id", "supplier_id", "name", "slug", "model", "series", "primary_category", "secondary_category", "summary", "description", "parameters_json", "cover_image", "gallery_json", "documents_json", "seo_title", "seo_keywords", "seo_description", "status", "is_featured", "created_at", "updated_at"];
        const vals = [
          product_id,
          data.supplier_id || "",
          data.name || "",
          data.slug || "",
          data.model || "",
          data.series || "",
          data.primary_category || "",
          data.secondary_category || "",
          data.summary || "",
          data.description || "",
          JSON.stringify(data.parameters_json || {}),
          data.cover_image || "",
          JSON.stringify(data.gallery_json || []),
          JSON.stringify(data.documents_json || []),
          data.seo_title || "",
          data.seo_keywords || "",
          data.seo_description || "",
          data.status || "offline",
          data.is_featured ? 1 : 0,
          now,
          now
        ];
        const placeholders = fields.map(() => "?").join(",");
        await env.DB.prepare(`INSERT INTO products (${fields.join(",")}) VALUES (${placeholders})`).bind(...vals).run();
        return json({ ok: true, product_id });
      } catch (e) {
        return json({ error: "CreateFailed", detail: e.message }, 500);
      }
    }
    if (isApi("admin/products") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const supplier_id = url.searchParams.get("supplier_id");
      let q = "SELECT * FROM products";
      const binds = [];
      if (supplier_id) {
        q += " WHERE supplier_id = ?";
        binds.push(supplier_id);
      }
      q += " ORDER BY created_at DESC LIMIT 100";
      const { results } = await env.DB.prepare(q).bind(...binds).all();
      const items = (results || []).map((p) => ({
        ...p,
        parameters_json: parseJSONSafe(p.parameters_json),
        gallery_json: parseJSONSafe(p.gallery_json),
        documents_json: parseJSONSafe(p.documents_json)
      }));
      return json(items);
    }
    if (isApi("admin/products/search") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const q = (url.searchParams.get("q") || "").trim();
      if (!q) return json([]);
      const like = `%${q}%`;
      const { results } = await env.DB.prepare("SELECT product_id, name, model FROM products WHERE name LIKE ? OR model LIKE ? LIMIT 20").bind(like, like).all();
      return json(results || []);
    }
    if (isApi("admin/suppliers/search") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const q = (url.searchParams.get("q") || "").trim();
      if (!q) return json([]);
      const like = `%${q}%`;
      const { results } = await env.DB.prepare("SELECT supplier_id, company, name FROM suppliers WHERE company LIKE ? OR name LIKE ? LIMIT 20").bind(like, like).all();
      return json(results || []);
    }
    if (isApi("admin/products/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      const data = await bodyJSON(request);
      const fields = ["name", "slug", "model", "series", "primary_category", "secondary_category", "summary", "description", "parameters_json", "cover_image", "gallery_json", "documents_json", "seo_title", "seo_keywords", "seo_description", "status", "is_featured"];
      const sets = [];
      const binds = [];
      for (const f of fields) {
        if (f in data) {
          let val = data[f];
          if (f.endsWith("_json") && typeof val === "object") val = JSON.stringify(val);
          sets.push(`${f} = ?`);
          binds.push(val);
        }
      }
      sets.push("updated_at = ?");
      binds.push((/* @__PURE__ */ new Date()).toISOString());
      if (!sets.length) return json({ error: "NoFields" }, 400);
      const stmt = env.DB.prepare(`UPDATE products SET ${sets.join(", ")} WHERE product_id = ?`).bind(...binds, id);
      await stmt.run();
      return json({ ok: true });
    }
    if (isApi("admin/products/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      await env.DB.prepare("DELETE FROM products WHERE product_id = ?").bind(id).run();
      return json({ ok: true });
    }
    if (isApi("admin/news") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 100").all();
      return json(results || []);
    }
    if (isApi("admin/news") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const news_id = "NEWS-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e3);
      const fields = ["news_id", "title", "slug", "summary", "content", "cover_image", "category", "tags", "author", "status", "seo_keywords", "seo_description", "published_at", "created_at", "updated_at"];
      const vals = [news_id, data.title || "", data.slug || "", data.summary || "", data.content || "", data.cover_image || "", data.category || "", data.tags || "", "Admin", data.status || "draft", data.seo_keywords || "", data.seo_description || "", now, now, now];
      const placeholders = fields.map(() => "?").join(",");
      await env.DB.prepare(`INSERT INTO news (${fields.join(",")}) VALUES (${placeholders})`).bind(...vals).run();
      return json({ ok: true, news_id });
    }
    if (isApi("admin/news/") && request.method === "GET") {
      const id = path.split("/").pop();
      const item = await env.DB.prepare("SELECT * FROM news WHERE news_id = ?").bind(id).first();
      return json(item || {});
    }
    if (isApi("admin/news/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      const data = await bodyJSON(request);
      const fields = [];
      const vals = [];
      for (const k of ["title", "slug", "summary", "content", "cover_image", "category", "tags", "status", "seo_keywords", "seo_description"]) {
        if (data[k] !== void 0) {
          fields.push(`${k} = ?`);
          vals.push(data[k]);
        }
      }
      fields.push("updated_at = ?");
      vals.push((/* @__PURE__ */ new Date()).toISOString());
      vals.push(id);
      await env.DB.prepare(`UPDATE news SET ${fields.join(",")} WHERE news_id = ?`).bind(...vals).run();
      return json({ ok: true });
    }
    if (isApi("admin/news/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      await env.DB.prepare("DELETE FROM news WHERE news_id = ?").bind(id).run();
      return json({ ok: true });
    }
    if (isApi("admin/cases") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const { results } = await env.DB.prepare("SELECT * FROM cases ORDER BY created_at DESC LIMIT 100").all();
      return json(results || []);
    }
    if (isApi("admin/cases") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const case_id = "CASE-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e3);
      const fields = ["case_id", "title", "slug", "summary", "content", "cover_image", "industry", "related_product_id", "status", "seo_keywords", "seo_description", "published_at", "created_at", "updated_at"];
      const vals = [case_id, data.title || "", data.slug || "", data.summary || "", data.content || "", data.cover_image || "", data.industry || "", data.related_product_id || "", data.status || "draft", data.seo_keywords || "", data.seo_description || "", now, now, now];
      const placeholders = fields.map(() => "?").join(",");
      await env.DB.prepare(`INSERT INTO cases (${fields.join(",")}) VALUES (${placeholders})`).bind(...vals).run();
      return json({ ok: true, case_id });
    }
    if (isApi("admin/cases/") && request.method === "GET") {
      const id = path.split("/").pop();
      const item = await env.DB.prepare("SELECT * FROM cases WHERE case_id = ?").bind(id).first();
      return json(item || {});
    }
    if (isApi("admin/cases/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      const data = await bodyJSON(request);
      const fields = [];
      const vals = [];
      for (const k of ["title", "slug", "summary", "content", "cover_image", "industry", "related_product_id", "status", "seo_keywords", "seo_description"]) {
        if (data[k] !== void 0) {
          fields.push(`${k} = ?`);
          vals.push(data[k]);
        }
      }
      fields.push("updated_at = ?");
      vals.push((/* @__PURE__ */ new Date()).toISOString());
      vals.push(id);
      await env.DB.prepare(`UPDATE cases SET ${fields.join(",")} WHERE case_id = ?`).bind(...vals).run();
      return json({ ok: true });
    }
    if (isApi("admin/cases/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      await env.DB.prepare("DELETE FROM cases WHERE case_id = ?").bind(id).run();
      return json({ ok: true });
    }
    if (isApi("admin/exhibitions") && request.method === "GET") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const { results } = await env.DB.prepare("SELECT * FROM exhibitions ORDER BY created_at DESC LIMIT 100").all();
      return json(results || []);
    }
    if (isApi("admin/exhibitions") && request.method === "POST") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const data = await bodyJSON(request);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const ex_id = "EXH-" + now.replace(/[-:T.Z]/g, "") + "-" + Math.floor(Math.random() * 1e3);
      const fields = ["exhibition_id", "title", "slug", "location", "start_date", "end_date", "booth_number", "description", "cover_image", "status", "seo_keywords", "seo_description", "created_at", "updated_at"];
      const vals = [ex_id, data.title || "", data.slug || "", data.location || "", data.start_date || "", data.end_date || "", data.booth_number || "", data.description || "", data.cover_image || "", data.status || "draft", data.seo_keywords || "", data.seo_description || "", now, now];
      const placeholders = fields.map(() => "?").join(",");
      await env.DB.prepare(`INSERT INTO exhibitions (${fields.join(",")}) VALUES (${placeholders})`).bind(...vals).run();
      return json({ ok: true, exhibition_id: ex_id });
    }
    if (isApi("admin/exhibitions/") && request.method === "GET") {
      const id = path.split("/").pop();
      const item = await env.DB.prepare("SELECT * FROM exhibitions WHERE exhibition_id = ?").bind(id).first();
      return json(item || {});
    }
    if (isApi("admin/exhibitions/") && request.method === "PATCH") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      const data = await bodyJSON(request);
      const fields = [];
      const vals = [];
      for (const k of ["title", "slug", "location", "start_date", "end_date", "booth_number", "description", "cover_image", "status", "seo_keywords", "seo_description"]) {
        if (data[k] !== void 0) {
          fields.push(`${k} = ?`);
          vals.push(data[k]);
        }
      }
      fields.push("updated_at = ?");
      vals.push((/* @__PURE__ */ new Date()).toISOString());
      vals.push(id);
      await env.DB.prepare(`UPDATE exhibitions SET ${fields.join(",")} WHERE exhibition_id = ?`).bind(...vals).run();
      return json({ ok: true });
    }
    if (isApi("admin/exhibitions/") && request.method === "DELETE") {
      if (!requireAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const id = path.split("/").pop();
      await env.DB.prepare("DELETE FROM exhibitions WHERE exhibition_id = ?").bind(id).run();
      return json({ ok: true });
    }
    return json({ error: "NotFound" }, 404);
    function parseJSONSafe(s) {
      try {
        return JSON.parse(s || "{}");
      } catch {
        return {};
      }
    }
    __name(parseJSONSafe, "parseJSONSafe");
    async function verifySupplierPassword(env2, pass) {
      if (!pass) return false;
      const stmt = env2.DB.prepare('SELECT 1 FROM suppliers WHERE access_password_plain = ? AND (status IS NULL OR status != "disabled")').bind(pass);
      const { results } = await stmt.all();
      return Boolean(results && results.length);
    }
    __name(verifySupplierPassword, "verifySupplierPassword");
  },
  async scheduled(event, env, ctx) {
    const base = env.SYNC_BASE_URL || "https://www.visndt.com/data";
    try {
      const reqs = await fetch(`${base}/requirements.json`).then((r) => r.json()).catch(() => []);
      let sups = await fetch(`${base}/suppliers.json`).then((r) => r.json()).catch(() => []);
      const dems = await fetch(`${base}/demanders.json`).then((r) => r.json()).catch(() => []);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      for (const r of reqs || []) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO requirements (
            requirement_id, title, public_preview, primary_category, secondary_category, approved, approved_at, status,
            contact_name, contact_phone, contact_company, contact_email, contact_department,
            contact_public, allow_open_quotes, parameters_json, published_at, budget_range, procurement_plan,
            progress, view_password_plain, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
            r.RequirementID || "",
            r.Title || "",
            r.PublicPreview || "",
            r.PrimaryCategory || "",
            r.SecondaryCategory || "",
            1,
            now,
            r.Status || "",
            r.ContactName || "",
            r.ContactPhone || "",
            r.ContactCompany || "",
            r.ContactEmail || "",
            r.ContactDepartment || "",
            r.ContactPublic ? 1 : 0,
            r.AllowOpenQuotes ? 1 : 0,
            JSON.stringify(r.Parameters || {}),
            r.PublishedAt || now,
            r.BudgetRange || "",
            r.procurementPlan || "",
            r.Progress || "",
            r.ViewPasswordPlain || "",
            r.created_at || now,
            r.updated_at || now
          ).run();
        } catch {
        }
      }
      if (!Array.isArray(sups) || !sups.length) {
        const siteBase = String(base).replace(/\/?data\/?$/i, "");
        const idx = await fetch(`${siteBase}/index.json`).then((r) => r.json()).catch(() => []);
        const list = Array.isArray(idx) ? idx : [];
        const items = list.filter((i) => {
          const t = String(i.type || i.section || "").toLowerCase();
          return t === "suppliers" || String(i.section || "").toLowerCase() === "suppliers";
        });
        sups = items.map((i) => {
          const p = i.params || {};
          const uri = String(i.uri || "").trim();
          const id = String(p.slug || (uri.split("/").filter(Boolean).pop() || "") || p.title || i.title || "").trim();
          return {
            SupplierID: id || (p.title || i.title || ""),
            Name: p.contact_person || "",
            Company: p.title || i.title || "",
            AccessPassword: "",
            ContactPhone: p.phone || "",
            ContactEmail: p.email || "",
            Status: "active",
            metadata: {
              website: siteBase ? siteBase + uri : uri,
              type: p.type || "",
              address: p.address || "",
              series: Array.isArray(p.series) ? p.series : [],
              models: Array.isArray(p.models) ? p.models : [],
              gallery: Array.isArray(p.gallery) ? p.gallery : [],
              description: p.description || ""
            }
          };
        });
      }
      for (const s of sups || []) {
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
          `).bind(
            s.SupplierID || s.supplier_id || "",
            s.Name || s.name || "",
            s.Company || s.company || "",
            s.AccessPassword || s.access_password_plain || "",
            s.ContactPhone || s.contact_phone || "",
            s.ContactEmail || s.contact_email || "",
            s.Status || s.status || "",
            JSON.stringify(s.metadata || s.metadata_json || {}),
            s.created_at || now,
            s.updated_at || now
          ).run();
        } catch {
        }
      }
      if (env.DEFAULT_SUPPLIER_PASSWORD) {
        try {
          await env.DB.prepare("UPDATE suppliers SET access_password_plain = ?, updated_at = ?").bind(String(env.DEFAULT_SUPPLIER_PASSWORD), now).run();
        } catch {
        }
      }
      if (env.DEFAULT_REQUIREMENT_PASSWORD) {
        try {
          await env.DB.prepare("UPDATE requirements SET view_password_plain = CASE WHEN IFNULL(view_password_plain, '') = '' THEN ? ELSE view_password_plain END, updated_at = ?").bind(String(env.DEFAULT_REQUIREMENT_PASSWORD), now).run();
        } catch {
        }
      }
      for (const d of dems || []) {
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO demanders (
            demander_id, name, company, contact_phone, contact_email, department, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
            d.demander_id || d.DemanderID || "",
            d.name || d.Name || "",
            d.company || d.Company || "",
            d.contact_phone || d.ContactPhone || "",
            d.contact_email || d.ContactEmail || "",
            d.department || d.Department || "",
            JSON.stringify(d.metadata || {}),
            d.created_at || now,
            d.updated_at || now
          ).run();
        } catch {
        }
      }
    } catch (e) {
    }
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-ObCTr5/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ObCTr5/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
