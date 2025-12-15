
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Helper
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Admin-Key, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    };
    function cors(resp) {
      const h = new Headers(resp.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => h.set(k, v));
      return new Response(resp.body, { status: resp.status, headers: h });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // --- Custom Admin/Logic Endpoints ---

    // 1. Admin: Get Demanders (Aggregated)
    if (url.pathname === '/api/admin/demanders' && request.method === 'GET') {
      return cors(await handleAdminDemanders(request, env));
    }

    // 2. Admin: Get Suppliers
    if (url.pathname === '/api/admin/suppliers' && request.method === 'GET') {
      return cors(await handleGetSuppliers(request, env));
    }

    // 3. Admin: Upsert Supplier
    if (url.pathname === '/api/admin/suppliers/upsert' && request.method === 'POST') {
      return cors(await handleUpsertSupplier(request, env));
    }

    // 4. Supplier: Session Login
    if (url.pathname === '/api/suppliers/session' && request.method === 'POST') {
      return cors(await handleSupplierSession(request, env));
    }

    if (url.pathname === '/api/suppliers/check-company' && request.method === 'GET') {
      return cors(await handleSupplierCheckCompany(request, env));
    }

    if (url.pathname === '/api/suppliers/register' && request.method === 'POST') {
      return cors(await handleSupplierRegister(request, env));
    }

    // 5. Admin: Get Products (New)
    if ((url.pathname === '/api/admin/products' || url.pathname === '/api/products') && request.method === 'GET') {
      return cors(await handleGetProducts(request, env));
    }

    // 6. Admin/Supplier: Post Product (New)
    if ((url.pathname === '/api/admin/products' || url.pathname === '/api/products') && request.method === 'POST') {
      return cors(await handlePostProduct(request, env));
    }

    if (request.method === 'GET' && url.pathname.match(/^\/api\/admin\/products\/[^\/]+$/)) {
      return cors(await handleGetProductById(request, env));
    }
    if (request.method === 'PATCH' && url.pathname.match(/^\/api\/admin\/products\/[^\/]+$/)) {
      return cors(await handlePatchProduct(request, env));
    }
    if (request.method === 'DELETE' && url.pathname.match(/^\/api\/admin\/products\/[^\/]+$/)) {
      return cors(await handleDeleteProduct(request, env));
    }

    // 7. Seed: Init Data
    if (url.pathname === '/api/debug/seed' && request.method === 'POST') {
      return cors(await handleSeed(request, env));
    }

    // --- Requirements ---

    // 8. Get Requirements/Markets (KV based now)
    if ((url.pathname === '/api/requirements' || url.pathname === '/api/markets') && request.method === 'GET') {
      return cors(await handleGetRequirements(request, env));
    }

    if ((url.pathname === '/api/admin/requirements' || url.pathname === '/api/admin/markets') && request.method === 'GET') {
      return cors(await handleGetRequirements(request, env));
    }

    if (request.method === 'GET' && (url.pathname.match(/^\/api\/markets\/[^\/]+$/) || url.pathname.match(/^\/api\/requirements\/[^\/]+$/))) {
      return cors(await handleGetRequirementById(request, env));
    }

    if ((url.pathname === '/api/markets/by-password' || url.pathname === '/api/requirements/by-password') && request.method === 'GET') {
      return cors(await handleGetByPassword(request, env));
    }

    // 9. Post Requirement/Market (KV + Extract)
    if ((url.pathname === '/api/requirements' || url.pathname === '/api/markets') && request.method === 'POST') {
      return cors(await handlePostRequirement(request, env, ctx));
    }

    // 10. Patch Requirement/Market (Update Status etc)
    if ((url.pathname.match(/^\/api\/admin\/requirements\/.+/) || url.pathname.match(/^\/api\/admin\/markets\/.+/)) && request.method === 'PATCH') {
        return cors(await handlePatchRequirement(request, env));
    }

    if ((url.pathname.match(/^\/api\/admin\/requirements\/.+/) || url.pathname.match(/^\/api\/admin\/markets\/.+/)) && request.method === 'DELETE') {
        return cors(await handleDeleteRequirement(request, env));
    }

    // 11. Quotes (Simple KV)
    if (url.pathname === '/api/quotes' && request.method === 'GET') {
        return cors(await handleGetQuotes(request, env));
    }
    if (url.pathname.startsWith('/api/quotes') && request.method === 'POST') { // usually posted by supplier
        return cors(await handlePostQuote(request, env));
    }
    // ... other quote methods ...

    if (url.pathname === '/api/demanders/session' && request.method === 'POST') {
      return cors(await handleDemanderSession(request, env));
    }

    if (url.pathname === '/api/demanders/requirements' && request.method === 'GET') {
      return cors(await handleDemanderRequirements(request, env));
    }

    if (url.pathname === '/api/admin/stats' && request.method === 'GET') {
      return cors(await handleAdminStats(request, env));
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return cors(await handleHealth(request, env));
    }

    if (url.pathname === '/api/admin/news' && request.method === 'GET') {
      return cors(await handleGetNews(request, env));
    }

    if (url.pathname === '/api/admin/news' && request.method === 'POST') {
      return cors(await handlePostNews(request, env));
    }

    if (request.method === 'GET' && url.pathname.match(/^\/api\/admin\/news\/[^\/]+$/)) {
      return cors(await handleGetNewsById(request, env));
    }
    if (request.method === 'PATCH' && url.pathname.match(/^\/api\/admin\/news\/[^\/]+$/)) {
      return cors(await handlePatchNews(request, env));
    }
    if (request.method === 'DELETE' && url.pathname.match(/^\/api\/admin\/news\/[^\/]+$/)) {
      return cors(await handleDeleteNews(request, env));
    }

    if (url.pathname === '/api/admin/cases' && request.method === 'GET') {
      return cors(await handleGetCases(request, env));
    }

    if (url.pathname === '/api/admin/cases' && request.method === 'POST') {
      return cors(await handlePostCase(request, env));
    }

    if (request.method === 'GET' && url.pathname.match(/^\/api\/admin\/cases\/[^\/]+$/)) {
      return cors(await handleGetCaseById(request, env));
    }
    if (request.method === 'PATCH' && url.pathname.match(/^\/api\/admin\/cases\/[^\/]+$/)) {
      return cors(await handlePatchCase(request, env));
    }
    if (request.method === 'DELETE' && url.pathname.match(/^\/api\/admin\/cases\/[^\/]+$/)) {
      return cors(await handleDeleteCase(request, env));
    }

    if (url.pathname === '/api/admin/import-products' && request.method === 'POST') {
      return cors(await handleImportContent(request, env, 'products'));
    }

    if (url.pathname === '/api/admin/import-news' && request.method === 'POST') {
      return cors(await handleImportContent(request, env, 'news'));
    }

    if (url.pathname === '/api/admin/import-cases' && request.method === 'POST') {
      return cors(await handleImportContent(request, env, 'cases'));
    }

    if (url.pathname === '/api/admin/import-requirements' && request.method === 'POST') {
      return cors(await handleImportContent(request, env, 'markets'));
    }

    if (url.pathname === '/api/admin/import-suppliers' && request.method === 'POST') {
      return cors(await handleImportContent(request, env, 'suppliers'));
    }

    if (url.pathname === '/api/admin/sync-now' && request.method === 'POST') {
      return cors(await handleSyncNow(request, env));
    }

    if (url.pathname === '/api/admin/debug-index' && request.method === 'GET') {
      return cors(await handleDebugIndex(request, env));
    }

    // Default Proxy (Fallback)
    if (url.pathname.startsWith('/api/proxy')) {
      return cors(await handleProxy(request, env));
    }

    return new Response('Not Found', { status: 404 });
  }
};

// --- Handlers ---

async function handleProxy(req, env) {
  const u = new URL(req.url);
  const tail = u.pathname.replace(/^\/api\/proxy/, '');
  const target = env.TARGET_BASE + tail + (u.search || '');
  
  const h = new Headers(req.headers);
  h.delete('host');
  h.delete('content-length');
  h.set('Accept-Encoding', 'gzip');
  
  try {
    const resp = await fetch(target, {
      method: req.method,
      headers: h,
      body: req.body
    });
    return resp;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy Error: ' + e.message }), { status: 502 });
  }
}

async function handlePostRequirement(req, env, ctx) {
  const body = await req.json();
  
  // Generate ID if missing
  if (!body.RequirementID) body.RequirementID = 'REQ-' + Date.now();
  if (!body.PublishedAt) body.PublishedAt = new Date().toISOString();
  if (!body.Status) body.Status = '待审核';

  // Normalize keys for compatibility
  body.Title = body.Title || body.title || '';
  body.PrimaryCategory = body.PrimaryCategory || body.primaryCategory || body.category || '';
  body.BudgetRange = body.BudgetRange || body.budget_range || '';
  body.Progress = body.Progress || body.progress || '';
  body.ContactCompany = body.ContactCompany || body.contactCompany || body.contact_company || '';
  body.ContactName = body.ContactName || body.contactName || body.contact_name || '';
  body.ContactPhone = body.ContactPhone || body.contactPhone || body.contact_phone || '';
  body.ContactEmail = body.ContactEmail || body.contactEmail || body.contact_email || '';
  body.PublicPreview = body.PublicPreview || body.public_preview || '';
  body.ParametersJSON = body.ParametersJSON || body.parameters_json || body.Parameters || {};
  if (typeof body.AllowOpenQuotes === 'undefined') body.AllowOpenQuotes = body.allow_open_quotes ?? false;
  if (typeof body.ContactPublic === 'undefined') body.ContactPublic = body.contact_public ?? false;
  if (typeof body.Approved === 'undefined') body.Approved = body.approved ?? 0;

  // Store in KV
  let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
  list.push(body);
  await env.VISION_KV.put('requirements', JSON.stringify(list));
  
  // Extract logic: Async update demander info
  if (body.contactCompany) {
    ctx.waitUntil((async () => {
      const key = `demander:${body.contactCompany.trim()}`;
      const existing = await env.VISION_KV.get(key, { type: 'json' });
      if (!existing) {
        const pwd = Math.random().toString(36).slice(-8);
        await env.VISION_KV.put(key, JSON.stringify({
          company: body.contactCompany,
          name: body.contactName,
          contact_phone: body.contactPhone,
          contact_email: body.contactEmail,
          password_plain: pwd,
          created_at: new Date().toISOString()
        }));
      }
    })());
  }
  
  return new Response(JSON.stringify({ ok: true, requirement_id: body.RequirementID }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetRequirements(req, env) {
    const u = new URL(req.url);
    const limit = parseInt(u.searchParams.get('limit')) || 100;
    const contactCompany = u.searchParams.get('contact_company');
    const approvedParam = u.searchParams.get('approved');
    const category = u.searchParams.get('category') || u.searchParams.get('primary_category');
    const progress = u.searchParams.get('progress');

    let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
    
    // Sort by date desc
    list.sort((a, b) => new Date(b.PublishedAt) - new Date(a.PublishedAt));

    if (contactCompany) {
        list = list.filter(r => r.ContactCompany === contactCompany || r.contactCompany === contactCompany);
    }

    if (approvedParam === '1') {
        list = list.filter(r => {
          const approved = (r.Approved ?? r.approved ?? 1);
          const status = r.Status || r.status || '';
          return approved == 1 && (status === '公开' || status === '在线报价');
        });
    }

    if (category) {
        list = list.filter(r => (r.PrimaryCategory || r.primaryCategory) === category);
    }

    if (progress) {
        list = list.filter(r => (r.Progress || r.progress) === progress);
    }

    return new Response(JSON.stringify(list.slice(0, limit)), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePatchRequirement(req, env) {
    const u = new URL(req.url);
    const id = u.pathname.split('/').pop();
    const body = await req.json();

    let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
    const idx = list.findIndex(r => (r.RequirementID || r.ReqID || r.requirement_id || r.id) === id);
    
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...body };
        await env.VISION_KV.put('requirements', JSON.stringify(list));
        return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
}

async function handleDeleteRequirement(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
  const before = Array.isArray(list) ? list.length : 0;
  list = (Array.isArray(list) ? list : []).filter(r => (r.RequirementID || r.ReqID || r.requirement_id || r.id) !== id);
  await env.VISION_KV.put('requirements', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, deleted: before - list.length }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleAdminDemanders(req, env) {
  // Fetch from KV requirements
  let items = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
  
  // Aggregate stats
  const stats = {};
  items.forEach(r => {
    const c = (r.ContactCompany || r.contact_company || 'Unknown').trim();
    if (!c) return;
    if (!stats[c]) stats[c] = { count: 0, name: r.ContactName || r.contactName, phone: r.ContactPhone || r.contactPhone, email: r.ContactEmail || r.contactEmail, public: r.ContactPublic };
    stats[c].count++;
  });
  
  // Merge with KV data (passwords)
  const result = [];
  for (const company of Object.keys(stats)) {
    const key = `demander:${company}`;
    const kvData = (await env.VISION_KV.get(key, { type: 'json' })) || {};
    
    result.push({
      company: company,
      name: kvData.name || stats[company].name,
      contact_phone: kvData.contact_phone || stats[company].phone,
      contact_email: kvData.contact_email || stats[company].email,
      requirement_count: stats[company].count,
      contact_public: kvData.contact_public ?? stats[company].public,
      metadata_json: {
        password_plain: kvData.password_plain || 'Not Set'
      }
    });
  }
  
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetSuppliers(req, env) {
  const data = await env.VISION_KV.get('suppliers', { type: 'json' });
  return new Response(JSON.stringify(data || []), { headers: { 'Content-Type': 'application/json' } });
}

async function handleUpsertSupplier(req, env) {
  const body = await req.json();
  let list = (await env.VISION_KV.get('suppliers', { type: 'json' })) || [];
  
  if (body.id) {
    // Update
    const idx = list.findIndex(x => x.id === body.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...body };
    } else {
      list.push(body);
    }
  } else {
    // Create
    body.id = 'S-' + Date.now().toString(36).toUpperCase();
    body.created_at = new Date().toISOString();
    list.push(body);
  }
  
  await env.VISION_KV.put('suppliers', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, id: body.id }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleSupplierSession(req, env) {
  const { password } = await req.json();
  const list = (await env.VISION_KV.get('suppliers', { type: 'json' })) || [];
  const match = list.find(s => s.access_password_plain === password && s.status !== 'inactive');
  
  if (match) {
    return new Response(JSON.stringify({ ok: true, supplier: {
      SupplierID: match.id,
      CompanyName: match.company,
      Name: match.name,
      Phone: match.contact_phone
    }}), { headers: { 'Content-Type': 'application/json' } });
  } else {
    return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
  }
}

async function handleGetProducts(req, env) {
    const u = new URL(req.url);
    const supplierId = u.searchParams.get('supplier') || u.searchParams.get('supplier_id');
    
    let list = (await env.VISION_KV.get('products', { type: 'json' })) || [];
    if (typeof list === 'string') {
        try { list = JSON.parse(list); } catch {}
    }
    
    if (supplierId) {
        list = list.filter(p => p.SupplierID === supplierId || p.supplier_id === supplierId);
    }
    
    return new Response(JSON.stringify(Array.isArray(list) ? list : []), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePostProduct(req, env) {
    const body = await req.json();
    let list = (await env.VISION_KV.get('products', { type: 'json' })) || [];
    
    if (!body.ProductID) body.ProductID = 'PROD-' + Date.now();
    if (!body.CreatedAt) body.CreatedAt = new Date().toISOString();
    
    list.push(body);
    await env.VISION_KV.put('products', JSON.stringify(list));
    
    return new Response(JSON.stringify({ ok: true, product_id: body.ProductID }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetProductById(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  let list = (await env.VISION_KV.get('products', { type: 'json' })) || [];
  const p = list.find(x => String(x.ProductID||x.product_id||'') === id || String(x.slug||'') === id);
  if (!p) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  return new Response(JSON.stringify(p), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePatchProduct(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  const body = await req.json();
  let list = (await env.VISION_KV.get('products', { type: 'json' })) || [];
  const idx = list.findIndex(x => String(x.ProductID||x.product_id||'') === id || String(x.slug||'') === id);
  if (idx < 0) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  list[idx] = { ...list[idx], ...body };
  await env.VISION_KV.put('products', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleDeleteProduct(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  let list = (await env.VISION_KV.get('products', { type: 'json' })) || [];
  const filtered = list.filter(x => String(x.ProductID||x.product_id||'') !== id && String(x.slug||'') !== id);
  await env.VISION_KV.put('products', JSON.stringify(filtered));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetQuotes(req, env) {
    // Simplistic quotes implementation
    const u = new URL(req.url);
    const reqId = u.searchParams.get('requirement_id');
    const supplierId = u.searchParams.get('supplier_id');
    const all = u.searchParams.get('all');
    let list = (await env.VISION_KV.get('quotes', { type: 'json' })) || [];
    if (reqId) list = list.filter(q => q.RequirementID === reqId);
    if (supplierId) list = list.filter(q => q.SupplierID === supplierId);
    if (all === 'true') {
      // return full list
    }
    return new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePostQuote(req, env) {
    const body = await req.json();
    let list = (await env.VISION_KV.get('quotes', { type: 'json' })) || [];
    const now = new Date().toISOString();
    const quote = {
      QuoteID: body.QuoteID || ('Q-' + Date.now()),
      RequirementID: body.RequirementID || body.requirement_id,
      SupplierID: body.SupplierID || body.supplier_id || null,
      SupplierCompanyName: body.SupplierCompanyName || body.supplier_name || '',
      SupplierPhone: body.SupplierPhone || body.supplier_phone || '',
      Price: body.Price || body.price,
      Currency: body.Currency || body.currency || 'CNY',
      Remarks: body.Remarks || body.remarks || '',
      Status: body.Status || 'submitted',
      CreatedAt: now
    };

    // Enrich supplier info if access password provided
    const supPwd = body.supplier_access_password;
    if (supPwd) {
      const suppliers = (await env.VISION_KV.get('suppliers', { type: 'json' })) || [];
      const sup = suppliers.find(s => s.access_password_plain === supPwd);
      if (sup) {
        quote.SupplierID = quote.SupplierID || sup.id;
        quote.SupplierCompanyName = quote.SupplierCompanyName || sup.company;
        quote.SupplierPhone = quote.SupplierPhone || sup.contact_phone;
      }
    }

    list.push(quote);
    await env.VISION_KV.put('quotes', JSON.stringify(list));
    
    // Update Requirement QuoteCount
    let reqs = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
    const rIdx = reqs.findIndex(r => r.RequirementID === quote.RequirementID);
    if (rIdx >= 0) {
        reqs[rIdx].QuoteCount = (reqs[rIdx].QuoteCount || 0) + 1;
        await env.VISION_KV.put('requirements', JSON.stringify(reqs));
    }
    
    return new Response(JSON.stringify({ ok: true, quote_id: quote.QuoteID }), { headers: { 'Content-Type': 'application/json' } });
}


async function handleSeed(req, env) {
  // Seed Suppliers
  const suppliers = [
    { id: 'S-OLY', company: 'Olympus Medical', name: 'Sales Dept', contact_phone: '400-123-4567', access_password_plain: 'olympus123', status: 'active' },
    { id: 'S-FUJI', company: 'Fujifilm Healthcare', name: 'Support Team', contact_phone: '400-987-6543', access_password_plain: 'fuji123', status: 'active' },
    { id: 'S-STORZ', company: 'Karl Storz', name: 'Global Sales', contact_phone: '+49 1234 5678', access_password_plain: 'storz123', status: 'active' }
  ];
  await env.VISION_KV.put('suppliers', JSON.stringify(suppliers));

  const now = new Date().toISOString();
  const requirements = [
    {
      RequirementID: 'REQ-LOCAL-1',
      Title: '高清工业内窥镜采购',
      PrimaryCategory: '工业内窥镜',
      BudgetRange: 'CNY 200,000-400,000',
      PublishedAt: now,
      Status: '公开',
      Progress: '发布中',
      AllowOpenQuotes: true,
      ContactPublic: false,
      ContactCompany: 'Simulated Future Factory',
      ContactName: '张三',
      ContactPhone: '13012345678',
      ContactEmail: 'demo@factory.com',
      PublicPreview: '针对焊缝与复杂管路的高清检查需求，需配套多角度镜头。',
      ParametersJSON: { '工作长度': '3m', '直径': '4mm' },
      Approved: 1,
      QuoteCount: 1
    },
    {
      RequirementID: 'REQ-LOCAL-2',
      Title: '医疗电子胃镜采购',
      PrimaryCategory: '电子内窥镜',
      BudgetRange: 'CNY 800,000-1,200,000',
      PublishedAt: now,
      Status: '在线报价',
      Progress: '接洽中',
      AllowOpenQuotes: true,
      ContactPublic: true,
      ContactCompany: 'City General Hospital',
      ContactName: '李四',
      ContactPhone: '13100001111',
      ContactEmail: 'procure@hospital.cn',
      PublicPreview: '用于消化内科日常检查，支持高清成像与可消毒处理。',
      ParametersJSON: { '用途': '消化内科', '画质': '1080p' },
      Approved: 1,
      QuoteCount: 0
    }
  ];
  await env.VISION_KV.put('requirements', JSON.stringify(requirements));

  const quotes = [
    { QuoteID: 'Q-LOCAL-1', RequirementID: 'REQ-LOCAL-1', SupplierID: 'S-OLY', SupplierCompanyName: 'Olympus Medical', SupplierPhone: '400-123-4567', Price: 360000, Currency: 'CNY', Remarks: '含一年维保', Status: 'submitted', CreatedAt: now }
  ];
  await env.VISION_KV.put('quotes', JSON.stringify(quotes));
  await env.VISION_KV.put('demander:Simulated Future Factory', JSON.stringify({ company: 'Simulated Future Factory', name: '张三', contact_phone: '13012345678', contact_email: 'demo@factory.com', password_plain: 'factory123', created_at: now }));
  await env.VISION_KV.put('demander:City General Hospital', JSON.stringify({ company: 'City General Hospital', name: '李四', contact_phone: '13100001111', contact_email: 'procure@hospital.cn', password_plain: 'hospital123', created_at: now }));
  return new Response(JSON.stringify({ ok: true, msg: 'Seeded' }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleSupplierCheckCompany(req, env) {
  const u = new URL(req.url);
  const name = String(u.searchParams.get('name') || '').trim().toLowerCase();
  const list = (await env.VISION_KV.get('suppliers', { type: 'json' })) || [];
  const exists = list.some(s => String(s.company || '').trim().toLowerCase() === name);
  return new Response(JSON.stringify({ exists }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleSupplierRegister(req, env) {
  const b = await req.json();
  const id = 'S-' + Date.now().toString(36).toUpperCase();
  const now = new Date().toISOString();
  const record = {
    id,
    company: b.company || '',
    name: b.name || '',
    contact_phone: (b.contact && b.contact.phone) || '',
    contact_email: (b.contact && b.contact.email) || '',
    access_password_plain: b.access_password || '',
    website: b.website || '',
    address: b.address || '',
    series: b.series || '',
    tags: b.tags || '',
    intro: b.intro || '',
    gallery_images: b.gallery_images || [],
    qualification_images: b.qualification_images || [],
    status: 'active',
    created_at: now
  };
  if (!record.company || !record.name || !record.access_password_plain) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }
  let list = (await env.VISION_KV.get('suppliers', { type: 'json' })) || [];
  list.push(record);
  await env.VISION_KV.put('suppliers', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, supplier_id: id }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetRequirementById(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  const list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
  const r = list.find(x => (x.RequirementID || x.ReqID || x.requirement_id || x.id) === id);
  if (!r) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  return new Response(JSON.stringify(r), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetByPassword(req, env) {
  const u = new URL(req.url);
  const vp = u.searchParams.get('view_password') || '';
  let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
  const items = list.filter(r => {
    const v = r.view_password || r.ViewPassword || r.view_password_plain || '';
    return v && v === vp;
  });
  return new Response(JSON.stringify({ items }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleDemanderSession(req, env) {
  const b = await req.json();
  const pwd = String(b.password || '').trim();
  const reqs = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
  const companies = Array.from(new Set(reqs.map(r => r.ContactCompany || r.contactCompany).filter(Boolean)));
  for (const c of companies) {
    const kv = await env.VISION_KV.get('demander:' + c, { type: 'json' });
    if (kv && kv.password_plain === pwd) {
      return new Response(JSON.stringify({ ok: true, demander: { Company: c } }), { headers: { 'Content-Type': 'application/json' } });
    }
  }
  return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
}

async function handleDemanderRequirements(req, env) {
  const u = new URL(req.url);
  const company = String(u.searchParams.get('company') || '').trim();
  const pwd = String(u.searchParams.get('password') || u.searchParams.get('demander_password') || '').trim();
  const kv = await env.VISION_KV.get('demander:' + company, { type: 'json' });
  if (!kv || kv.password_plain !== pwd) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
  list = list.filter(r => (r.ContactCompany || r.contactCompany) === company);
  return new Response(JSON.stringify({ items: list }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleAdminStats(req, env) {
  const requirements = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
  const quotes = (await env.VISION_KV.get('quotes', { type: 'json' })) || [];
  const suppliers = (await env.VISION_KV.get('suppliers', { type: 'json' })) || [];
  const products = (await env.VISION_KV.get('products', { type: 'json' })) || [];
  const news = (await env.VISION_KV.get('news', { type: 'json' })) || [];
  const cases = (await env.VISION_KV.get('cases', { type: 'json' })) || [];
  const sync = (await env.VISION_KV.get('sync_meta', { type: 'json' })) || {};

  const reqPending = requirements.filter(r => {
    const approved = (r.Approved ?? r.approved ?? 0);
    const status = r.Status || r.status || '';
    return !(approved == 1 && (status === '公开' || status === '在线报价'));
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
  return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
}

async function handleHealth(req, env) {
  const now = new Date().toISOString();
  return new Response(JSON.stringify({ ok: true, time: now }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetNews(req, env) {
  let list = (await env.VISION_KV.get('news', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch {}
  }
  return new Response(JSON.stringify(Array.isArray(list) ? list : []), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetNewsById(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  let list = (await env.VISION_KV.get('news', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch {}
  }
  const item = (Array.isArray(list) ? list : []).find(n => (n.news_id || n.id) === id);
  if (!item) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  return new Response(JSON.stringify(item), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePostNews(req, env) {
  const body = await req.json();
  let list = (await env.VISION_KV.get('news', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = []; }
  }
  const now = new Date().toISOString();
  const slug = body.slug || (body.title ? String(body.title).trim().toLowerCase().replace(/\s+/g, '-') : '') || ('news-' + Date.now());
  const id = body.news_id || ('NEWS-' + slug);
  const rec = {
    ...body,
    news_id: id,
    slug,
    title: body.title || '',
    detail_path: body.detail_path || ('/news/' + slug + '/'),
    published_at: body.published_at || now,
    status: body.status || 'published'
  };
  list.push(rec);
  await env.VISION_KV.put('news', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, news_id: id }), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePatchNews(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  const body = await req.json();
  let list = (await env.VISION_KV.get('news', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = []; }
  }
  const idx = (Array.isArray(list) ? list : []).findIndex(n => (n.news_id || n.id) === id);
  if (idx < 0) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  list[idx] = { ...list[idx], ...body, news_id: list[idx].news_id || id };
  await env.VISION_KV.put('news', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleDeleteNews(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  let list = (await env.VISION_KV.get('news', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = []; }
  }
  const before = Array.isArray(list) ? list.length : 0;
  list = (Array.isArray(list) ? list : []).filter(n => (n.news_id || n.id) !== id);
  await env.VISION_KV.put('news', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, deleted: before - list.length }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetCases(req, env) {
  let list = (await env.VISION_KV.get('cases', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch {}
  }
  return new Response(JSON.stringify(Array.isArray(list) ? list : []), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetCaseById(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  let list = (await env.VISION_KV.get('cases', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch {}
  }
  const item = (Array.isArray(list) ? list : []).find(c => (c.case_id || c.id) === id);
  if (!item) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  return new Response(JSON.stringify(item), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePostCase(req, env) {
  const body = await req.json();
  let list = (await env.VISION_KV.get('cases', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = []; }
  }
  const now = new Date().toISOString();
  const slug = body.slug || (body.title ? String(body.title).trim().toLowerCase().replace(/\s+/g, '-') : '') || ('case-' + Date.now());
  const id = body.case_id || ('CASE-' + slug);
  const rec = {
    ...body,
    case_id: id,
    slug,
    title: body.title || '',
    detail_path: body.detail_path || ('/cases/' + slug + '/'),
    published_at: body.published_at || now,
    status: body.status || 'published'
  };
  list.push(rec);
  await env.VISION_KV.put('cases', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, case_id: id }), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePatchCase(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  const body = await req.json();
  let list = (await env.VISION_KV.get('cases', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = []; }
  }
  const idx = (Array.isArray(list) ? list : []).findIndex(c => (c.case_id || c.id) === id);
  if (idx < 0) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  list[idx] = { ...list[idx], ...body, case_id: list[idx].case_id || id };
  await env.VISION_KV.put('cases', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleDeleteCase(req, env) {
  const u = new URL(req.url);
  const id = u.pathname.split('/').pop();
  let list = (await env.VISION_KV.get('cases', { type: 'json' })) || [];
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = []; }
  }
  const before = Array.isArray(list) ? list.length : 0;
  list = (Array.isArray(list) ? list : []).filter(c => (c.case_id || c.id) !== id);
  await env.VISION_KV.put('cases', JSON.stringify(list));
  return new Response(JSON.stringify({ ok: true, deleted: before - list.length }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleImportContent(req, env, type) {
  const u = new URL(req.url);
  const baseIn = u.searchParams.get('base') || (env.SYNC_BASE_URL || 'https://www.visndt.com/data');
  const b = String(baseIn).replace(/\/$/, '');
  const idxPrimary = b + '/index.json';
  const bAlt = b.replace(/\/data$/i, '');
  const idxAlt = bAlt + '/index.json';
  try {
    let all = [];
    // Prefer combining for markets & suppliers to include site root index
    if (type === 'markets' || type === 'suppliers') {
      const r1 = await fetch(idxPrimary);
      if (r1.ok) {
        const d1 = await r1.json();
        const a1 = Array.isArray(d1.items) ? d1.items : (Array.isArray(d1) ? d1 : []);
        all = all.concat(a1);
      }
      const r2 = await fetch(idxAlt);
      if (r2.ok) {
        const d2 = await r2.json();
        const a2 = Array.isArray(d2.items) ? d2.items : (Array.isArray(d2) ? d2 : []);
        all = all.concat(a2);
      }
      if (!all.length) return new Response(JSON.stringify({ error: 'IndexFetchFailed', status: 404 }), { status: 502 });
    } else {
      const candidates = [
        idxPrimary,
        idxAlt,
        b + '/search-index.json',
        bAlt + '/search-index.json'
      ];
      let resp = null;
      for (const cand of candidates) {
        resp = await fetch(cand);
        if (resp && resp.ok) break;
      }
      if (!resp || !resp.ok) return new Response(JSON.stringify({ error: 'IndexFetchFailed', status: resp ? resp.status : 0 }), { status: 502 });
      const data = await resp.json();
      all = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
    }
    const items = all.filter(it => String(it.section||'') === type);
    if (type === 'products') {
      let list = (await env.VISION_KV.get('products', { type: 'json' })) || [];
      const suppliers = (await env.VISION_KV.get('suppliers', { type: 'json' })) || [];
      let supChanged = false;
      for (const it of items) {
        const uri = String(it.uri||'');
        const slug = (it.params?.slug || it.slug || uri.replace(/\/$/, '').split('/').pop());
        const existingIdx = list.findIndex(p => (p.slug||'') === slug);
        const cover = Array.isArray(it.params?.gallery) ? it.params.gallery[0] || '' : '';
        let sid = '';
        const hint = it.params?.supplier_id || it.params?.supplier || it.params?.company || it.params?.vendor || '';
        if (it.params?.supplier_id) {
          sid = String(it.params.supplier_id);
        } else if (hint) {
          const t = String(hint).trim().toLowerCase();
          const sup = suppliers.find(s => String(s.company||'').trim().toLowerCase() === t || String(s.name||'').trim().toLowerCase() === t || String(s.SupplierID||'').trim().toLowerCase() === t || String(s.id||'').trim().toLowerCase() === t);
          if (sup) sid = sup.SupplierID || sup.id || '';
        }
        if (!sid) {
          const ser = it.params?.series || '';
          const mod = it.params?.model || '';
          const sup2 = suppliers.find(s => {
            const ss = Array.isArray(s.series) ? s.series : (Array.isArray(s.metadata_json?.series) ? s.metadata_json.series : []);
            const mm = Array.isArray(s.models) ? s.models : (Array.isArray(s.metadata_json?.models) ? s.metadata_json.models : []);
            return (ser && ss && ss.includes(ser)) || (mod && mm && mm.includes(mod));
          });
          if (sup2) sid = sup2.SupplierID || sup2.id || '';
        }
        if (!sid && uri.startsWith('/products/')) {
          const parts = uri.replace(/^\//,'').split('/');
          if (parts.length >= 3 && parts[0] === 'products') {
            const sslug = parts[1];
            const found = suppliers.find(s => (s.id === sslug) || (s.SupplierID === sslug));
            if (found) sid = found.SupplierID || found.id || '';
            else {
              sid = sslug;
              suppliers.push({ id: sslug, SupplierID: sslug, company: sslug, created_at: it.date || new Date().toISOString(), status: 'active' });
              supChanged = true;
            }
          }
        }
        const record = {
          ProductID: slug ? 'PROD-' + slug : 'PROD-' + Date.now(),
          CreatedAt: it.date || new Date().toISOString(),
          supplier_id: sid || '',
          name: it.title || '',
          slug: slug,
          detail_path: uri || ('/products/' + slug + '/'),
          model: it.params?.model || '',
          series: it.params?.series || '',
          primary_category: it.params?.primary_category || '',
          secondary_category: it.params?.secondary_category || '',
          summary: it.summary || '',
          description: it.content || '',
          parameters_json: it.params?.parameters || {},
          cover_image: cover,
          status: 'active'
        };
        if (existingIdx >= 0) list[existingIdx] = { ...list[existingIdx], ...record }; else list.push(record);
      }
      await env.VISION_KV.put('products', JSON.stringify(list));
      if (supChanged) await env.VISION_KV.put('suppliers', JSON.stringify(suppliers));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (type === 'news') {
      let list = (await env.VISION_KV.get('news', { type: 'json' })) || [];
      for (const it of items) {
        const uri = String(it.uri||'');
        const slug = (it.params?.slug || it.slug || uri.replace(/\/$/, '').split('/').pop());
        const idx = list.findIndex(n => (n.slug||'') === slug);
        const rec = {
          news_id: slug ? 'NEWS-' + slug : 'NEWS-' + Date.now(),
          title: it.title || '',
          slug: slug,
          detail_path: uri || ('/news/' + slug + '/'),
          summary: it.summary || '',
          category: it.params?.category || it.params?.categories || '',
          status: 'published',
          published_at: it.date || new Date().toISOString()
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...rec }; else list.push(rec);
      }
      await env.VISION_KV.put('news', JSON.stringify(list));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (type === 'cases') {
      let list = (await env.VISION_KV.get('cases', { type: 'json' })) || [];
      for (const it of items) {
        const uri = String(it.uri||'');
        const slug = (it.params?.slug || it.slug || uri.replace(/\/$/, '').split('/').pop());
        const idx = list.findIndex(c => (c.slug||'') === slug);
        const rec = {
          case_id: slug ? 'CASE-' + slug : 'CASE-' + Date.now(),
          title: it.title || '',
          slug: slug,
          detail_path: uri || ('/cases/' + slug + '/'),
          industry: it.params?.industry || '',
          related_product_id: it.params?.related_product_id || '',
          status: 'published',
          published_at: it.date || new Date().toISOString()
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...rec }; else list.push(rec);
      }
      await env.VISION_KV.put('cases', JSON.stringify(list));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (type === 'markets') {
      let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
      for (const it of items) {
        const uri = String(it.uri||'');
        const slug = (it.params?.slug || it.slug || uri.replace(/\/$/, '').split('/').pop());
        const idx = list.findIndex(r => (r.slug||'') === slug || (r.RequirementID || r.ReqID || r.id) === (it.params?.RequirementID || it.params?.requirement_id));
        const approved = Number(it.params?.approved ?? it.params?.Approved ?? 1);
        const rawStatus = String(it.params?.Status || it.params?.status || '').trim();
        const status = rawStatus || (approved === 1 ? '公开' : '待审核');
        const rec = {
          RequirementID: String(it.params?.RequirementID || it.params?.requirement_id || (slug ? 'REQ-' + slug : 'REQ-' + Date.now())),
          Title: it.title || '',
          slug: slug,
          Approved: approved,
          Status: status,
          Progress: it.params?.Progress || it.params?.progress || (approved === 1 ? '发布中' : '待发布'),
          PrimaryCategory: it.params?.PrimaryCategory || it.params?.primary_category || it.params?.product_type || '',
          BudgetRange: it.params?.BudgetRange || it.params?.budget || '',
          ContactCompany: it.params?.ContactCompany || it.params?.contact_company || it.params?.company_name || it.params?.company || '',
          ContactName: it.params?.ContactName || it.params?.contact_name || '',
          ContactPhone: it.params?.ContactPhone || it.params?.contact_phone || '',
          ContactEmail: it.params?.ContactEmail || it.params?.contact_email || '',
          PublicPreview: it.params?.PublicPreview || it.params?.public_preview || it.summary || '',
          Description: it.params?.Description || it.params?.description || it.content || '',
          AllowOpenQuotes: (typeof it.params?.AllowOpenQuotes !== 'undefined') ? it.params.AllowOpenQuotes : (it.params?.allow_open_quotes ?? (status === '在线报价')),
          ContactPublic: (typeof it.params?.ContactPublic !== 'undefined') ? it.params.ContactPublic : (it.params?.contact_public ?? false),
          PublishedAt: it.params?.PublishedAt || it.params?.published_at || it.date || new Date().toISOString(),
          CreatedAt: it.params?.CreatedAt || it.params?.created_at || it.date || new Date().toISOString()
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...rec }; else list.push(rec);
      }
      await env.VISION_KV.put('requirements', JSON.stringify(list));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (type === 'suppliers') {
      let list = (await env.VISION_KV.get('suppliers', { type: 'json' })) || [];
      for (const it of items) {
        const uri = String(it.uri||'');
        const slug = (it.params?.supplier_id || it.params?.slug || it.slug || uri.replace(/\/$/, '').split('/').pop());
        const idx = list.findIndex(s => (s.id||s.SupplierID||'') === slug);
        const rec = {
          id: slug,
          SupplierID: slug,
          company: it.title || '',
          address: it.params?.address || '',
          type: it.params?.type || '',
          contact_person: it.params?.contact_person || '',
          contact_phone: it.params?.phone || '',
          contact_email: it.params?.email || '',
          series: it.params?.series || [],
          models: it.params?.models || [],
          gallery: it.params?.gallery || [],
          detail_path: uri || ('/suppliers/' + slug + '/'),
          created_at: it.date || new Date().toISOString(),
          status: 'active'
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...rec }; else list.push(rec);
      }
      await env.VISION_KV.put('suppliers', JSON.stringify(list));
      return new Response(JSON.stringify({ ok: true, upserted: items.length }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'UnsupportedType' }), { status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

async function handleSyncNow(req, env) {
  const u = new URL(req.url);
  const base = u.searchParams.get('base') || (env.SYNC_BASE_URL || 'https://www.visndt.com/data');
  const types = ['products','news','cases','markets','suppliers'];
  const results = {};
  for (const t of types) {
    const r = await handleImportContent(new Request(req.url, { method: 'POST' }), env, t);
    const txt = await r.text();
    try { results[t] = JSON.parse(txt); } catch { results[t] = { raw: txt }; }
  }
  const syncMeta = { base, updated_at: new Date().toISOString(), upserted: { products: results.products?.upserted||0, news: results.news?.upserted||0, cases: results.cases?.upserted||0, markets: results.markets?.upserted||0, suppliers: results.suppliers?.upserted||0 } };
  await env.VISION_KV.put('sync_meta', JSON.stringify(syncMeta));
  return new Response(JSON.stringify({ ok: true, results, meta: syncMeta }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleDebugIndex(req, env) {
  const u = new URL(req.url);
  const baseIn = u.searchParams.get('base') || (env.SYNC_BASE_URL || 'https://www.visndt.com/data');
  const b = String(baseIn).replace(/\/$/, '');
  const idxPrimary = b + '/index.json';
  const bAlt = b.replace(/\/data$/i, '');
  const idx = idxPrimary;
  try {
    let resp = await fetch(idxPrimary);
    if (!resp.ok) resp = await fetch(bAlt + '/index.json');
    const ok = resp.ok;
    let data = null;
    if (ok) data = await resp.json();
    const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    return new Response(JSON.stringify({ ok, idxUrl: idx, count: items.length, sample: items.slice(0,3) }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, idxUrl: idx, error: e.message }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}
