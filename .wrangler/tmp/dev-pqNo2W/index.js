var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "X-Admin-Key, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    };
    function cors(resp) {
      const h = new Headers(resp.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => h.set(k, v));
      return new Response(resp.body, { status: resp.status, headers: h });
    }
    __name(cors, "cors");
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (url.pathname === "/api/admin/demanders" && request.method === "GET") {
      return cors(await handleAdminDemanders(request, env));
    }
    if (url.pathname === "/api/admin/suppliers" && request.method === "GET") {
      return cors(await handleGetSuppliers(request, env));
    }
    if (url.pathname === "/api/admin/suppliers/upsert" && request.method === "POST") {
      return cors(await handleUpsertSupplier(request, env));
    }
    if (url.pathname === "/api/suppliers/session" && request.method === "POST") {
      return cors(await handleSupplierSession(request, env));
    }
    if (url.pathname === "/api/suppliers/check-company" && request.method === "GET") {
      return cors(await handleSupplierCheckCompany(request, env));
    }
    if (url.pathname === "/api/suppliers/register" && request.method === "POST") {
      return cors(await handleSupplierRegister(request, env));
    }
    if ((url.pathname === "/api/admin/products" || url.pathname === "/api/products") && request.method === "GET") {
      return cors(await handleGetProducts(request, env));
    }
    if ((url.pathname === "/api/admin/products" || url.pathname === "/api/products") && request.method === "POST") {
      return cors(await handlePostProduct(request, env));
    }
    if (request.method === "GET" && url.pathname.match(/^\/api\/admin\/products\/[^\/]+$/)) {
      return cors(await handleGetProductById(request, env));
    }
    if (request.method === "PATCH" && url.pathname.match(/^\/api\/admin\/products\/[^\/]+$/)) {
      return cors(await handlePatchProduct(request, env));
    }
    if (request.method === "DELETE" && url.pathname.match(/^\/api\/admin\/products\/[^\/]+$/)) {
      return cors(await handleDeleteProduct(request, env));
    }
    if (url.pathname === "/api/debug/seed" && request.method === "POST") {
      return cors(await handleSeed(request, env));
    }
    if ((url.pathname === "/api/requirements" || url.pathname === "/api/markets") && request.method === "GET") {
      return cors(await handleGetRequirements(request, env));
    }
    if ((url.pathname === "/api/admin/requirements" || url.pathname === "/api/admin/markets") && request.method === "GET") {
      return cors(await handleGetRequirements(request, env));
    }
    if (request.method === "GET" && (url.pathname.match(/^\/api\/markets\/[^\/]+$/) || url.pathname.match(/^\/api\/requirements\/[^\/]+$/))) {
      return cors(await handleGetRequirementById(request, env));
    }
    if ((url.pathname === "/api/markets/by-password" || url.pathname === "/api/requirements/by-password") && request.method === "GET") {
      return cors(await handleGetByPassword(request, env));
    }
    if ((url.pathname === "/api/requirements" || url.pathname === "/api/markets") && request.method === "POST") {
      return cors(await handlePostRequirement(request, env, ctx));
    }
    if ((url.pathname.match(/^\/api\/admin\/requirements\/.+/) || url.pathname.match(/^\/api\/admin\/markets\/.+/)) && request.method === "PATCH") {
      return cors(await handlePatchRequirement(request, env));
    }
    if (url.pathname === "/api/quotes" && request.method === "GET") {
      return cors(await handleGetQuotes(request, env));
    }
    if (url.pathname.startsWith("/api/quotes") && request.method === "POST") {
      return cors(await handlePostQuote(request, env));
    }
    if (url.pathname === "/api/demanders/session" && request.method === "POST") {
      return cors(await handleDemanderSession(request, env));
    }
    if (url.pathname === "/api/demanders/requirements" && request.method === "GET") {
      return cors(await handleDemanderRequirements(request, env));
    }
    if (url.pathname === "/api/admin/stats" && request.method === "GET") {
      return cors(await handleAdminStats(request, env));
    }
    if (url.pathname === "/api/health" && request.method === "GET") {
      return cors(await handleHealth(request, env));
    }
    if (url.pathname === "/api/admin/news" && request.method === "GET") {
      return cors(await handleGetNews(request, env));
    }
    if (url.pathname === "/api/admin/cases" && request.method === "GET") {
      return cors(await handleGetCases(request, env));
    }
    if (url.pathname === "/api/admin/import-products" && request.method === "POST") {
      return cors(await handleImportContent(request, env, "products"));
    }
    if (url.pathname === "/api/admin/import-news" && request.method === "POST") {
      return cors(await handleImportContent(request, env, "news"));
    }
    if (url.pathname === "/api/admin/import-cases" && request.method === "POST") {
      return cors(await handleImportContent(request, env, "cases"));
    }
    if (url.pathname === "/api/admin/import-requirements" && request.method === "POST") {
      return cors(await handleImportContent(request, env, "markets"));
    }
    if (url.pathname === "/api/admin/import-suppliers" && request.method === "POST") {
      return cors(await handleImportContent(request, env, "suppliers"));
    }
    if (url.pathname === "/api/admin/sync-now" && request.method === "POST") {
      return cors(await handleSyncNow(request, env));
    }
    if (url.pathname === "/api/admin/debug-index" && request.method === "GET") {
      return cors(await handleDebugIndex(request, env));
    }
    if (url.pathname.startsWith("/api/proxy")) {
      return cors(await handleProxy(request, env));
    }
    return new Response("Not Found", { status: 404 });
  }
};
async function handleProxy(req, env) {
  const u = new URL(req.url);
  const tail = u.pathname.replace(/^\/api\/proxy/, "");
  const target = env.TARGET_BASE + tail + (u.search || "");
  const h = new Headers(req.headers);
  h.delete("host");
  h.delete("content-length");
  h.set("Accept-Encoding", "gzip");
  try {
    const resp = await fetch(target, {
      method: req.method,
      headers: h,
      body: req.body
    });
    return resp;
  } catch (e) {
    return new Response(JSON.stringify({ error: "Proxy Error: " + e.message }), { status: 502 });
  }
}
__name(handleProxy, "handleProxy");
async function handlePostRequirement(req, env, ctx) {
  const body = await req.json();
  if (!body.RequirementID) body.RequirementID = "REQ-" + Date.now();
  if (!body.PublishedAt) body.PublishedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (!body.Status) body.Status = "\u5F85\u5BA1\u6838";
  body.Title = body.Title || body.title || "";
  body.PrimaryCategory = body.PrimaryCategory || body.primaryCategory || body.category || "";
  body.BudgetRange = body.BudgetRange || body.budget_range || "";
  body.Progress = body.Progress || body.progress || "";
  body.ContactCompany = body.ContactCompany || body.contactCompany || body.contact_company || "";
  body.ContactName = body.ContactName || body.contactName || body.contact_name || "";
  body.ContactPhone = body.ContactPhone || body.contactPhone || body.contact_phone || "";
  body.ContactEmail = body.ContactEmail || body.contactEmail || body.contact_email || "";
  body.PublicPreview = body.PublicPreview || body.public_preview || "";
  body.ParametersJSON = body.ParametersJSON || body.parameters_json || body.Parameters || {};
  if (typeof body.AllowOpenQuotes === "undefined") body.AllowOpenQuotes = body.allow_open_quotes ?? false;
  if (typeof body.ContactPublic === "undefined") body.ContactPublic = body.contact_public ?? false;
  if (typeof body.Approved === "undefined") body.Approved = body.approved ?? 0;
  let list = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  list.push(body);
  await env.VISION_KV.put("requirements", JSON.stringify(list));
  if (body.contactCompany) {
    ctx.waitUntil((async () => {
      const key = `demander:${body.contactCompany.trim()}`;
      const existing = await env.VISION_KV.get(key, { type: "json" });
      if (!existing) {
        const pwd = Math.random().toString(36).slice(-8);
        await env.VISION_KV.put(key, JSON.stringify({
          company: body.contactCompany,
          name: body.contactName,
          contact_phone: body.contactPhone,
          contact_email: body.contactEmail,
          password_plain: pwd,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    })());
  }
  return new Response(JSON.stringify({ ok: true, requirement_id: body.RequirementID }), { headers: { "Content-Type": "application/json" } });
}
__name(handlePostRequirement, "handlePostRequirement");
async function handleGetRequirements(req, env) {
  const u = new URL(req.url);
  const limit = parseInt(u.searchParams.get("limit")) || 100;
  const contactCompany = u.searchParams.get("contact_company");
  const approvedParam = u.searchParams.get("approved");
  const category = u.searchParams.get("category") || u.searchParams.get("primary_category");
  const progress = u.searchParams.get("progress");
  let list = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  list.sort((a, b) => new Date(b.PublishedAt) - new Date(a.PublishedAt));
  if (contactCompany) {
    list = list.filter((r) => r.ContactCompany === contactCompany || r.contactCompany === contactCompany);
  }
  if (approvedParam === "1") {
    list = list.filter((r) => {
      const approved = r.Approved ?? r.approved ?? 1;
      const status = r.Status || r.status || "";
      return approved == 1 && (status === "\u516C\u5F00" || status === "\u5728\u7EBF\u62A5\u4EF7");
    });
  }
  if (category) {
    list = list.filter((r) => (r.PrimaryCategory || r.primaryCategory) === category);
  }
  if (progress) {
    list = list.filter((r) => (r.Progress || r.progress) === progress);
  }
  return new Response(JSON.stringify(list.slice(0, limit)), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetRequirements, "handleGetRequirements");
async function handlePatchRequirement(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split("/").pop();
  const body = await req.json();
  let list = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  const idx = list.findIndex((r) => r.RequirementID === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...body };
    await env.VISION_KV.put("requirements", JSON.stringify(list));
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
}
__name(handlePatchRequirement, "handlePatchRequirement");
async function handleAdminDemanders(req, env) {
  let items = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  const stats = {};
  items.forEach((r) => {
    const c = (r.ContactCompany || r.contact_company || "Unknown").trim();
    if (!c) return;
    if (!stats[c]) stats[c] = { count: 0, name: r.ContactName || r.contactName, phone: r.ContactPhone || r.contactPhone, email: r.ContactEmail || r.contactEmail, public: r.ContactPublic };
    stats[c].count++;
  });
  const result = [];
  for (const company of Object.keys(stats)) {
    const key = `demander:${company}`;
    const kvData = await env.VISION_KV.get(key, { type: "json" }) || {};
    result.push({
      company,
      name: kvData.name || stats[company].name,
      contact_phone: kvData.contact_phone || stats[company].phone,
      contact_email: kvData.contact_email || stats[company].email,
      requirement_count: stats[company].count,
      contact_public: kvData.contact_public ?? stats[company].public,
      metadata_json: {
        password_plain: kvData.password_plain || "Not Set"
      }
    });
  }
  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
}
__name(handleAdminDemanders, "handleAdminDemanders");
async function handleGetSuppliers(req, env) {
  const data = await env.VISION_KV.get("suppliers", { type: "json" });
  return new Response(JSON.stringify(data || []), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetSuppliers, "handleGetSuppliers");
async function handleUpsertSupplier(req, env) {
  const body = await req.json();
  let list = await env.VISION_KV.get("suppliers", { type: "json" }) || [];
  if (body.id) {
    const idx = list.findIndex((x) => x.id === body.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...body };
    } else {
      list.push(body);
    }
  } else {
    body.id = "S-" + Date.now().toString(36).toUpperCase();
    body.created_at = (/* @__PURE__ */ new Date()).toISOString();
    list.push(body);
  }
  await env.VISION_KV.put("suppliers", JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, id: body.id }), { headers: { "Content-Type": "application/json" } });
}
__name(handleUpsertSupplier, "handleUpsertSupplier");
async function handleSupplierSession(req, env) {
  const { password } = await req.json();
  const list = await env.VISION_KV.get("suppliers", { type: "json" }) || [];
  const match = list.find((s) => s.access_password_plain === password && s.status !== "inactive");
  if (match) {
    return new Response(JSON.stringify({ ok: true, supplier: {
      SupplierID: match.id,
      CompanyName: match.company,
      Name: match.name,
      Phone: match.contact_phone
    } }), { headers: { "Content-Type": "application/json" } });
  } else {
    return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
  }
}
__name(handleSupplierSession, "handleSupplierSession");
async function handleGetProducts(req, env) {
  const u = new URL(req.url);
  const supplierId = u.searchParams.get("supplier") || u.searchParams.get("supplier_id");
  let list = await env.VISION_KV.get("products", { type: "json" }) || [];
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
    }
  }
  if (supplierId) {
    list = list.filter((p) => p.SupplierID === supplierId || p.supplier_id === supplierId);
  }
  return new Response(JSON.stringify(Array.isArray(list) ? list : []), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetProducts, "handleGetProducts");
async function handlePostProduct(req, env) {
  const body = await req.json();
  let list = await env.VISION_KV.get("products", { type: "json" }) || [];
  if (!body.ProductID) body.ProductID = "PROD-" + Date.now();
  if (!body.CreatedAt) body.CreatedAt = (/* @__PURE__ */ new Date()).toISOString();
  list.push(body);
  await env.VISION_KV.put("products", JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, product_id: body.ProductID }), { headers: { "Content-Type": "application/json" } });
}
__name(handlePostProduct, "handlePostProduct");
async function handleGetProductById(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split("/").pop();
  let list = await env.VISION_KV.get("products", { type: "json" }) || [];
  const p = list.find((x) => String(x.ProductID || x.product_id || "") === id || String(x.slug || "") === id);
  if (!p) return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
  return new Response(JSON.stringify(p), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetProductById, "handleGetProductById");
async function handlePatchProduct(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split("/").pop();
  const body = await req.json();
  let list = await env.VISION_KV.get("products", { type: "json" }) || [];
  const idx = list.findIndex((x) => String(x.ProductID || x.product_id || "") === id || String(x.slug || "") === id);
  if (idx < 0) return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
  list[idx] = { ...list[idx], ...body };
  await env.VISION_KV.put("products", JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
__name(handlePatchProduct, "handlePatchProduct");
async function handleDeleteProduct(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split("/").pop();
  let list = await env.VISION_KV.get("products", { type: "json" }) || [];
  const filtered = list.filter((x) => String(x.ProductID || x.product_id || "") !== id && String(x.slug || "") !== id);
  await env.VISION_KV.put("products", JSON.stringify(filtered));
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
__name(handleDeleteProduct, "handleDeleteProduct");
async function handleGetQuotes(req, env) {
  const u = new URL(req.url);
  const reqId = u.searchParams.get("requirement_id");
  const supplierId = u.searchParams.get("supplier_id");
  const all = u.searchParams.get("all");
  let list = await env.VISION_KV.get("quotes", { type: "json" }) || [];
  if (reqId) list = list.filter((q) => q.RequirementID === reqId);
  if (supplierId) list = list.filter((q) => q.SupplierID === supplierId);
  if (all === "true") {
  }
  return new Response(JSON.stringify(list), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetQuotes, "handleGetQuotes");
async function handlePostQuote(req, env) {
  const body = await req.json();
  let list = await env.VISION_KV.get("quotes", { type: "json" }) || [];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const quote = {
    QuoteID: body.QuoteID || "Q-" + Date.now(),
    RequirementID: body.RequirementID || body.requirement_id,
    SupplierID: body.SupplierID || body.supplier_id || null,
    SupplierCompanyName: body.SupplierCompanyName || body.supplier_name || "",
    SupplierPhone: body.SupplierPhone || body.supplier_phone || "",
    Price: body.Price || body.price,
    Currency: body.Currency || body.currency || "CNY",
    Remarks: body.Remarks || body.remarks || "",
    Status: body.Status || "submitted",
    CreatedAt: now
  };
  const supPwd = body.supplier_access_password;
  if (supPwd) {
    const suppliers = await env.VISION_KV.get("suppliers", { type: "json" }) || [];
    const sup = suppliers.find((s) => s.access_password_plain === supPwd);
    if (sup) {
      quote.SupplierID = quote.SupplierID || sup.id;
      quote.SupplierCompanyName = quote.SupplierCompanyName || sup.company;
      quote.SupplierPhone = quote.SupplierPhone || sup.contact_phone;
    }
  }
  list.push(quote);
  await env.VISION_KV.put("quotes", JSON.stringify(list));
  let reqs = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  const rIdx = reqs.findIndex((r) => r.RequirementID === quote.RequirementID);
  if (rIdx >= 0) {
    reqs[rIdx].QuoteCount = (reqs[rIdx].QuoteCount || 0) + 1;
    await env.VISION_KV.put("requirements", JSON.stringify(reqs));
  }
  return new Response(JSON.stringify({ ok: true, quote_id: quote.QuoteID }), { headers: { "Content-Type": "application/json" } });
}
__name(handlePostQuote, "handlePostQuote");
async function handleSeed(req, env) {
  const suppliers = [
    { id: "S-OLY", company: "Olympus Medical", name: "Sales Dept", contact_phone: "400-123-4567", access_password_plain: "olympus123", status: "active" },
    { id: "S-FUJI", company: "Fujifilm Healthcare", name: "Support Team", contact_phone: "400-987-6543", access_password_plain: "fuji123", status: "active" },
    { id: "S-STORZ", company: "Karl Storz", name: "Global Sales", contact_phone: "+49 1234 5678", access_password_plain: "storz123", status: "active" }
  ];
  await env.VISION_KV.put("suppliers", JSON.stringify(suppliers));
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const requirements = [
    {
      RequirementID: "REQ-LOCAL-1",
      Title: "\u9AD8\u6E05\u5DE5\u4E1A\u5185\u7AA5\u955C\u91C7\u8D2D",
      PrimaryCategory: "\u5DE5\u4E1A\u5185\u7AA5\u955C",
      BudgetRange: "CNY 200,000-400,000",
      PublishedAt: now,
      Status: "\u516C\u5F00",
      Progress: "\u53D1\u5E03\u4E2D",
      AllowOpenQuotes: true,
      ContactPublic: false,
      ContactCompany: "Simulated Future Factory",
      ContactName: "\u5F20\u4E09",
      ContactPhone: "13012345678",
      ContactEmail: "demo@factory.com",
      PublicPreview: "\u9488\u5BF9\u710A\u7F1D\u4E0E\u590D\u6742\u7BA1\u8DEF\u7684\u9AD8\u6E05\u68C0\u67E5\u9700\u6C42\uFF0C\u9700\u914D\u5957\u591A\u89D2\u5EA6\u955C\u5934\u3002",
      ParametersJSON: { "\u5DE5\u4F5C\u957F\u5EA6": "3m", "\u76F4\u5F84": "4mm" },
      Approved: 1,
      QuoteCount: 1
    },
    {
      RequirementID: "REQ-LOCAL-2",
      Title: "\u533B\u7597\u7535\u5B50\u80C3\u955C\u91C7\u8D2D",
      PrimaryCategory: "\u7535\u5B50\u5185\u7AA5\u955C",
      BudgetRange: "CNY 800,000-1,200,000",
      PublishedAt: now,
      Status: "\u5728\u7EBF\u62A5\u4EF7",
      Progress: "\u63A5\u6D3D\u4E2D",
      AllowOpenQuotes: true,
      ContactPublic: true,
      ContactCompany: "City General Hospital",
      ContactName: "\u674E\u56DB",
      ContactPhone: "13100001111",
      ContactEmail: "procure@hospital.cn",
      PublicPreview: "\u7528\u4E8E\u6D88\u5316\u5185\u79D1\u65E5\u5E38\u68C0\u67E5\uFF0C\u652F\u6301\u9AD8\u6E05\u6210\u50CF\u4E0E\u53EF\u6D88\u6BD2\u5904\u7406\u3002",
      ParametersJSON: { "\u7528\u9014": "\u6D88\u5316\u5185\u79D1", "\u753B\u8D28": "1080p" },
      Approved: 1,
      QuoteCount: 0
    }
  ];
  await env.VISION_KV.put("requirements", JSON.stringify(requirements));
  const quotes = [
    { QuoteID: "Q-LOCAL-1", RequirementID: "REQ-LOCAL-1", SupplierID: "S-OLY", SupplierCompanyName: "Olympus Medical", SupplierPhone: "400-123-4567", Price: 36e4, Currency: "CNY", Remarks: "\u542B\u4E00\u5E74\u7EF4\u4FDD", Status: "submitted", CreatedAt: now }
  ];
  await env.VISION_KV.put("quotes", JSON.stringify(quotes));
  await env.VISION_KV.put("demander:Simulated Future Factory", JSON.stringify({ company: "Simulated Future Factory", name: "\u5F20\u4E09", contact_phone: "13012345678", contact_email: "demo@factory.com", password_plain: "factory123", created_at: now }));
  await env.VISION_KV.put("demander:City General Hospital", JSON.stringify({ company: "City General Hospital", name: "\u674E\u56DB", contact_phone: "13100001111", contact_email: "procure@hospital.cn", password_plain: "hospital123", created_at: now }));
  return new Response(JSON.stringify({ ok: true, msg: "Seeded" }), { headers: { "Content-Type": "application/json" } });
}
__name(handleSeed, "handleSeed");
async function handleSupplierCheckCompany(req, env) {
  const u = new URL(req.url);
  const name = String(u.searchParams.get("name") || "").trim().toLowerCase();
  const list = await env.VISION_KV.get("suppliers", { type: "json" }) || [];
  const exists = list.some((s) => String(s.company || "").trim().toLowerCase() === name);
  return new Response(JSON.stringify({ exists }), { headers: { "Content-Type": "application/json" } });
}
__name(handleSupplierCheckCompany, "handleSupplierCheckCompany");
async function handleSupplierRegister(req, env) {
  const b = await req.json();
  const id = "S-" + Date.now().toString(36).toUpperCase();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const record = {
    id,
    company: b.company || "",
    name: b.name || "",
    contact_phone: b.contact && b.contact.phone || "",
    contact_email: b.contact && b.contact.email || "",
    access_password_plain: b.access_password || "",
    website: b.website || "",
    address: b.address || "",
    series: b.series || "",
    tags: b.tags || "",
    intro: b.intro || "",
    gallery_images: b.gallery_images || [],
    qualification_images: b.qualification_images || [],
    status: "active",
    created_at: now
  };
  if (!record.company || !record.name || !record.access_password_plain) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }
  let list = await env.VISION_KV.get("suppliers", { type: "json" }) || [];
  list.push(record);
  await env.VISION_KV.put("suppliers", JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, supplier_id: id }), { headers: { "Content-Type": "application/json" } });
}
__name(handleSupplierRegister, "handleSupplierRegister");
async function handleGetRequirementById(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split("/").pop();
  const list = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  const r = list.find((x) => x.RequirementID === id || x.id === id);
  if (!r) return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
  return new Response(JSON.stringify(r), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetRequirementById, "handleGetRequirementById");
async function handleGetByPassword(req, env) {
  const u = new URL(req.url);
  const vp = u.searchParams.get("view_password") || "";
  let list = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  const items = list.filter((r) => {
    const v = r.view_password || r.ViewPassword || r.view_password_plain || "";
    return v && v === vp;
  });
  return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetByPassword, "handleGetByPassword");
async function handleDemanderSession(req, env) {
  const b = await req.json();
  const pwd = String(b.password || "").trim();
  const reqs = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  const companies = Array.from(new Set(reqs.map((r) => r.ContactCompany || r.contactCompany).filter(Boolean)));
  for (const c of companies) {
    const kv = await env.VISION_KV.get("demander:" + c, { type: "json" });
    if (kv && kv.password_plain === pwd) {
      return new Response(JSON.stringify({ ok: true, demander: { Company: c } }), { headers: { "Content-Type": "application/json" } });
    }
  }
  return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
}
__name(handleDemanderSession, "handleDemanderSession");
async function handleDemanderRequirements(req, env) {
  const u = new URL(req.url);
  const company = String(u.searchParams.get("company") || "").trim();
  const pwd = String(u.searchParams.get("password") || u.searchParams.get("demander_password") || "").trim();
  const kv = await env.VISION_KV.get("demander:" + company, { type: "json" });
  if (!kv || kv.password_plain !== pwd) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  let list = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  list = list.filter((r) => (r.ContactCompany || r.contactCompany) === company);
  return new Response(JSON.stringify({ items: list }), { headers: { "Content-Type": "application/json" } });
}
__name(handleDemanderRequirements, "handleDemanderRequirements");
async function handleAdminStats(req, env) {
  const requirements = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  const quotes = await env.VISION_KV.get("quotes", { type: "json" }) || [];
  const suppliers = await env.VISION_KV.get("suppliers", { type: "json" }) || [];
  const products = await env.VISION_KV.get("products", { type: "json" }) || [];
  const news = await env.VISION_KV.get("news", { type: "json" }) || [];
  const cases = await env.VISION_KV.get("cases", { type: "json" }) || [];
  const sync = await env.VISION_KV.get("sync_meta", { type: "json" }) || {};
  const reqPending = requirements.filter((r) => {
    const approved = r.Approved ?? r.approved ?? 0;
    const status = r.Status || r.status || "";
    return !(approved == 1 && (status === "\u516C\u5F00" || status === "\u5728\u7EBF\u62A5\u4EF7"));
  }).length;
  const payload = {
    requirements: { total: requirements.length, pending: reqPending },
    quotes: quotes.length,
    suppliers: suppliers.length,
    products: products.length,
    news: { articles: Array.isArray(news) ? news.length : 0 },
    cases: Array.isArray(cases) ? cases.length : 0,
    sync
  };
  return new Response(JSON.stringify(payload), { headers: { "Content-Type": "application/json" } });
}
__name(handleAdminStats, "handleAdminStats");
async function handleHealth(req, env) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return new Response(JSON.stringify({ ok: true, time: now }), { headers: { "Content-Type": "application/json" } });
}
__name(handleHealth, "handleHealth");
async function handleGetNews(req, env) {
  let list = await env.VISION_KV.get("news", { type: "json" }) || [];
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
    }
  }
  return new Response(JSON.stringify(Array.isArray(list) ? list : []), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetNews, "handleGetNews");
async function handleGetCases(req, env) {
  let list = await env.VISION_KV.get("cases", { type: "json" }) || [];
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
    }
  }
  return new Response(JSON.stringify(Array.isArray(list) ? list : []), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetCases, "handleGetCases");
async function handleImportContent(req, env, type) {
  const u = new URL(req.url);
  const baseIn = u.searchParams.get("base") || (env.SYNC_BASE_URL || "https://www.visndt.com/data");
  const b = String(baseIn).replace(/\/$/, "");
  const idxPrimary = b + "/index.json";
  const bAlt = b.replace(/\/data$/i, "");
  const idxAlt = bAlt + "/index.json";
  try {
    let all = [];
    if (type === "markets" || type === "suppliers") {
      const r1 = await fetch(idxPrimary);
      if (r1.ok) {
        const d1 = await r1.json();
        const a1 = Array.isArray(d1.items) ? d1.items : Array.isArray(d1) ? d1 : [];
        all = all.concat(a1);
      }
      const r2 = await fetch(idxAlt);
      if (r2.ok) {
        const d2 = await r2.json();
        const a2 = Array.isArray(d2.items) ? d2.items : Array.isArray(d2) ? d2 : [];
        all = all.concat(a2);
      }
      if (!all.length) return new Response(JSON.stringify({ error: "IndexFetchFailed", status: 404 }), { status: 502 });
    } else {
      let resp = await fetch(idxPrimary);
      if (!resp.ok) resp = await fetch(idxAlt);
      if (!resp.ok) return new Response(JSON.stringify({ error: "IndexFetchFailed", status: resp.status }), { status: 502 });
      const data = await resp.json();
      all = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
    }
    const items = all.filter((it) => String(it.section || "") === type);
    if (type === "products") {
      let list = await env.VISION_KV.get("products", { type: "json" }) || [];
      const suppliers = await env.VISION_KV.get("suppliers", { type: "json" }) || [];
      let supChanged = false;
      for (const it of items) {
        const uri = String(it.uri || "");
        const slug = it.params?.slug || it.slug || uri.replace(/\/$/, "").split("/").pop();
        const existingIdx = list.findIndex((p) => (p.slug || "") === slug);
        const cover = Array.isArray(it.params?.gallery) ? it.params.gallery[0] || "" : "";
        let sid = "";
        const hint = it.params?.supplier_id || it.params?.supplier || it.params?.company || it.params?.vendor || "";
        if (it.params?.supplier_id) {
          sid = String(it.params.supplier_id);
        } else if (hint) {
          const t = String(hint).trim().toLowerCase();
          const sup = suppliers.find((s) => String(s.company || "").trim().toLowerCase() === t || String(s.name || "").trim().toLowerCase() === t || String(s.SupplierID || "").trim().toLowerCase() === t || String(s.id || "").trim().toLowerCase() === t);
          if (sup) sid = sup.SupplierID || sup.id || "";
        }
        if (!sid) {
          const ser = it.params?.series || "";
          const mod = it.params?.model || "";
          const sup2 = suppliers.find((s) => {
            const ss = Array.isArray(s.series) ? s.series : Array.isArray(s.metadata_json?.series) ? s.metadata_json.series : [];
            const mm = Array.isArray(s.models) ? s.models : Array.isArray(s.metadata_json?.models) ? s.metadata_json.models : [];
            return ser && ss && ss.includes(ser) || mod && mm && mm.includes(mod);
          });
          if (sup2) sid = sup2.SupplierID || sup2.id || "";
        }
        if (!sid && uri.startsWith("/products/")) {
          const parts = uri.replace(/^\//, "").split("/");
          if (parts.length >= 3 && parts[0] === "products") {
            const sslug = parts[1];
            const found = suppliers.find((s) => s.id === sslug || s.SupplierID === sslug);
            if (found) sid = found.SupplierID || found.id || "";
            else {
              sid = sslug;
              suppliers.push({ id: sslug, SupplierID: sslug, company: sslug, created_at: it.date || (/* @__PURE__ */ new Date()).toISOString(), status: "active" });
              supChanged = true;
            }
          }
        }
        const record = {
          ProductID: slug ? "PROD-" + slug : "PROD-" + Date.now(),
          CreatedAt: it.date || (/* @__PURE__ */ new Date()).toISOString(),
          supplier_id: sid || "",
          name: it.title || "",
          slug,
          detail_path: uri || "/products/" + slug + "/",
          model: it.params?.model || "",
          series: it.params?.series || "",
          primary_category: it.params?.primary_category || "",
          secondary_category: it.params?.secondary_category || "",
          summary: it.summary || "",
          description: it.content || "",
          parameters_json: it.params?.parameters || {},
          cover_image: cover,
          status: "active"
        };
        if (existingIdx >= 0) list[existingIdx] = { ...list[existingIdx], ...record };
        else list.push(record);
      }
      await env.VISION_KV.put("products", JSON.stringify(list));
      if (supChanged) await env.VISION_KV.put("suppliers", JSON.stringify(suppliers));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { "Content-Type": "application/json" } });
    }
    if (type === "news") {
      let list = await env.VISION_KV.get("news", { type: "json" }) || [];
      for (const it of items) {
        const uri = String(it.uri || "");
        const slug = it.params?.slug || it.slug || uri.replace(/\/$/, "").split("/").pop();
        const idx = list.findIndex((n) => (n.slug || "") === slug);
        const rec = {
          news_id: slug ? "NEWS-" + slug : "NEWS-" + Date.now(),
          title: it.title || "",
          slug,
          detail_path: uri || "/news/" + slug + "/",
          summary: it.summary || "",
          category: it.params?.category || it.params?.categories || "",
          status: "published",
          published_at: it.date || (/* @__PURE__ */ new Date()).toISOString()
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...rec };
        else list.push(rec);
      }
      await env.VISION_KV.put("news", JSON.stringify(list));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { "Content-Type": "application/json" } });
    }
    if (type === "cases") {
      let list = await env.VISION_KV.get("cases", { type: "json" }) || [];
      for (const it of items) {
        const uri = String(it.uri || "");
        const slug = it.params?.slug || it.slug || uri.replace(/\/$/, "").split("/").pop();
        const idx = list.findIndex((c) => (c.slug || "") === slug);
        const rec = {
          case_id: slug ? "CASE-" + slug : "CASE-" + Date.now(),
          title: it.title || "",
          slug,
          detail_path: uri || "/cases/" + slug + "/",
          industry: it.params?.industry || "",
          related_product_id: it.params?.related_product_id || "",
          status: "published",
          published_at: it.date || (/* @__PURE__ */ new Date()).toISOString()
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...rec };
        else list.push(rec);
      }
      await env.VISION_KV.put("cases", JSON.stringify(list));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { "Content-Type": "application/json" } });
    }
    if (type === "markets") {
      let list = await env.VISION_KV.get("requirements", { type: "json" }) || [];
      for (const it of items) {
        const uri = String(it.uri || "");
        const slug = it.params?.slug || it.slug || uri.replace(/\/$/, "").split("/").pop();
        const idx = list.findIndex((r) => (r.slug || "") === slug);
        const approved = Number(it.params?.approved || 0);
        const status = approved === 1 ? "\u5728\u7EBF\u62A5\u4EF7" : "\u8349\u7A3F";
        const rec = {
          ReqID: slug ? "REQ-" + slug : "REQ-" + Date.now(),
          Title: it.title || "",
          slug,
          Approved: approved,
          Status: status,
          DemanderName: it.params?.demander_name || it.params?.company || "",
          DemanderContact: it.params?.contact || "",
          CreatedAt: it.date || (/* @__PURE__ */ new Date()).toISOString()
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...rec };
        else list.push(rec);
      }
      await env.VISION_KV.put("requirements", JSON.stringify(list));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { "Content-Type": "application/json" } });
    }
    if (type === "suppliers") {
      let list = await env.VISION_KV.get("suppliers", { type: "json" }) || [];
      for (const it of items) {
        const uri = String(it.uri || "");
        const slug = it.params?.supplier_id || it.params?.slug || it.slug || uri.replace(/\/$/, "").split("/").pop();
        const idx = list.findIndex((s) => (s.id || s.SupplierID || "") === slug);
        const rec = {
          id: slug,
          SupplierID: slug,
          company: it.title || "",
          address: it.params?.address || "",
          type: it.params?.type || "",
          contact_person: it.params?.contact_person || "",
          contact_phone: it.params?.phone || "",
          contact_email: it.params?.email || "",
          series: it.params?.series || [],
          models: it.params?.models || [],
          gallery: it.params?.gallery || [],
          detail_path: uri || "/suppliers/" + slug + "/",
          created_at: it.date || (/* @__PURE__ */ new Date()).toISOString(),
          status: "active"
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...rec };
        else list.push(rec);
      }
      await env.VISION_KV.put("suppliers", JSON.stringify(list));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "UnsupportedType" }), { status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
__name(handleImportContent, "handleImportContent");
async function handleSyncNow(req, env) {
  const u = new URL(req.url);
  const base = u.searchParams.get("base") || (env.SYNC_BASE_URL || "https://www.visndt.com/data");
  const types = ["products", "news", "cases", "markets", "suppliers"];
  const results = {};
  for (const t of types) {
    const r = await handleImportContent(new Request(req.url, { method: "POST" }), env, t);
    const txt = await r.text();
    try {
      results[t] = JSON.parse(txt);
    } catch {
      results[t] = { raw: txt };
    }
  }
  const syncMeta = { base, updated_at: (/* @__PURE__ */ new Date()).toISOString(), upserted: { products: results.products?.upserted || 0, news: results.news?.upserted || 0, cases: results.cases?.upserted || 0, markets: results.markets?.upserted || 0, suppliers: results.suppliers?.upserted || 0 } };
  await env.VISION_KV.put("sync_meta", JSON.stringify(syncMeta));
  return new Response(JSON.stringify({ ok: true, results, meta: syncMeta }), { headers: { "Content-Type": "application/json" } });
}
__name(handleSyncNow, "handleSyncNow");
async function handleDebugIndex(req, env) {
  const u = new URL(req.url);
  const baseIn = u.searchParams.get("base") || (env.SYNC_BASE_URL || "https://www.visndt.com/data");
  const b = String(baseIn).replace(/\/$/, "");
  const idxPrimary = b + "/index.json";
  const bAlt = b.replace(/\/data$/i, "");
  const idx = idxPrimary;
  try {
    let resp = await fetch(idxPrimary);
    if (!resp.ok) resp = await fetch(bAlt + "/index.json");
    const ok = resp.ok;
    let data = null;
    if (ok) data = await resp.json();
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return new Response(JSON.stringify({ ok, idxUrl: idx, count: items.length, sample: items.slice(0, 3) }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, idxUrl: idx, error: e.message }), { headers: { "Content-Type": "application/json" }, status: 500 });
  }
}
__name(handleDebugIndex, "handleDebugIndex");

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
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

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
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

// .wrangler/tmp/bundle-rbHTQI/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
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

// .wrangler/tmp/bundle-rbHTQI/middleware-loader.entry.ts
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
