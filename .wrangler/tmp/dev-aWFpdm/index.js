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
    if ((url.pathname === "/api/admin/products" || url.pathname === "/api/products") && request.method === "GET") {
      return cors(await handleGetProducts(request, env));
    }
    if ((url.pathname === "/api/admin/products" || url.pathname === "/api/products") && request.method === "POST") {
      return cors(await handlePostProduct(request, env));
    }
    if (url.pathname === "/api/debug/seed" && request.method === "POST") {
      return cors(await handleSeed(request, env));
    }
    if (url.pathname === "/api/requirements" && request.method === "GET") {
      return cors(await handleGetRequirements(request, env));
    }
    if (url.pathname === "/api/requirements" && request.method === "POST") {
      return cors(await handlePostRequirement(request, env, ctx));
    }
    if (url.pathname.match(/^\/api\/admin\/requirements\/.+/) && request.method === "PATCH") {
      return cors(await handlePatchRequirement(request, env));
    }
    if (url.pathname === "/api/quotes" && request.method === "GET") {
      return cors(await handleGetQuotes(request, env));
    }
    if (url.pathname.startsWith("/api/quotes") && request.method === "POST") {
      return cors(await handlePostQuote(request, env));
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
  let list = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  list.sort((a, b) => new Date(b.PublishedAt) - new Date(a.PublishedAt));
  if (contactCompany) {
    list = list.filter((r) => r.ContactCompany === contactCompany || r.contactCompany === contactCompany);
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
  if (supplierId) {
    list = list.filter((p) => p.SupplierID === supplierId || p.supplier_id === supplierId);
  }
  return new Response(JSON.stringify(list), { headers: { "Content-Type": "application/json" } });
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
async function handleGetQuotes(req, env) {
  const u = new URL(req.url);
  const reqId = u.searchParams.get("requirement_id");
  let list = await env.VISION_KV.get("quotes", { type: "json" }) || [];
  if (reqId) {
    list = list.filter((q) => q.RequirementID === reqId);
  }
  return new Response(JSON.stringify(list), { headers: { "Content-Type": "application/json" } });
}
__name(handleGetQuotes, "handleGetQuotes");
async function handlePostQuote(req, env) {
  const body = await req.json();
  let list = await env.VISION_KV.get("quotes", { type: "json" }) || [];
  if (!body.QuoteID) body.QuoteID = "Q-" + Date.now();
  body.CreatedAt = (/* @__PURE__ */ new Date()).toISOString();
  body.Status = "submitted";
  list.push(body);
  await env.VISION_KV.put("quotes", JSON.stringify(list));
  let reqs = await env.VISION_KV.get("requirements", { type: "json" }) || [];
  const rIdx = reqs.findIndex((r) => r.RequirementID === body.RequirementID);
  if (rIdx >= 0) {
    reqs[rIdx].QuoteCount = (reqs[rIdx].QuoteCount || 0) + 1;
    await env.VISION_KV.put("requirements", JSON.stringify(reqs));
  }
  return new Response(JSON.stringify({ ok: true, quote_id: body.QuoteID }), { headers: { "Content-Type": "application/json" } });
}
__name(handlePostQuote, "handlePostQuote");
async function handleSeed(req, env) {
  const suppliers = [
    { id: "S-OLY", company: "Olympus Medical", name: "Sales Dept", contact_phone: "400-123-4567", access_password_plain: "olympus123", status: "active" },
    { id: "S-FUJI", company: "Fujifilm Healthcare", name: "Support Team", contact_phone: "400-987-6543", access_password_plain: "fuji123", status: "active" },
    { id: "S-STORZ", company: "Karl Storz", name: "Global Sales", contact_phone: "+49 1234 5678", access_password_plain: "storz123", status: "active" }
  ];
  await env.VISION_KV.put("suppliers", JSON.stringify(suppliers));
  return new Response(JSON.stringify({ ok: true, msg: "Seeded" }), { headers: { "Content-Type": "application/json" } });
}
__name(handleSeed, "handleSeed");

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

// .wrangler/tmp/bundle-kzLCxh/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-kzLCxh/middleware-loader.entry.ts
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
