
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

    // 5. Admin: Get Products (New)
    if ((url.pathname === '/api/admin/products' || url.pathname === '/api/products') && request.method === 'GET') {
      return cors(await handleGetProducts(request, env));
    }

    // 6. Admin/Supplier: Post Product (New)
    if ((url.pathname === '/api/admin/products' || url.pathname === '/api/products') && request.method === 'POST') {
      return cors(await handlePostProduct(request, env));
    }

    // 7. Seed: Init Data
    if (url.pathname === '/api/debug/seed' && request.method === 'POST') {
      return cors(await handleSeed(request, env));
    }

    // --- Requirements ---

    // 8. Get Requirements (KV based now)
    if (url.pathname === '/api/requirements' && request.method === 'GET') {
      return cors(await handleGetRequirements(request, env));
    }

    // 9. Post Requirement (KV + Extract)
    if (url.pathname === '/api/requirements' && request.method === 'POST') {
      return cors(await handlePostRequirement(request, env, ctx));
    }

    // 10. Patch Requirement (Update Status etc)
    if (url.pathname.match(/^\/api\/admin\/requirements\/.+/) && request.method === 'PATCH') {
        return cors(await handlePatchRequirement(request, env));
    }

    // 11. Quotes (Simple KV)
    if (url.pathname === '/api/quotes' && request.method === 'GET') {
        return cors(await handleGetQuotes(request, env));
    }
    if (url.pathname.startsWith('/api/quotes') && request.method === 'POST') { // usually posted by supplier
        return cors(await handlePostQuote(request, env));
    }
    // ... other quote methods ...

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

    let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
    
    // Sort by date desc
    list.sort((a, b) => new Date(b.PublishedAt) - new Date(a.PublishedAt));

    if (contactCompany) {
        list = list.filter(r => r.ContactCompany === contactCompany || r.contactCompany === contactCompany);
    }

    return new Response(JSON.stringify(list.slice(0, limit)), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePatchRequirement(req, env) {
    const u = new URL(req.url);
    const id = u.pathname.split('/').pop();
    const body = await req.json();

    let list = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
    const idx = list.findIndex(r => r.RequirementID === id);
    
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...body };
        await env.VISION_KV.put('requirements', JSON.stringify(list));
        return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
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
    
    if (supplierId) {
        list = list.filter(p => p.SupplierID === supplierId || p.supplier_id === supplierId);
    }
    
    return new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } });
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

async function handleGetQuotes(req, env) {
    // Simplistic quotes implementation
    const u = new URL(req.url);
    const reqId = u.searchParams.get('requirement_id');
    let list = (await env.VISION_KV.get('quotes', { type: 'json' })) || [];
    if (reqId) {
        list = list.filter(q => q.RequirementID === reqId);
    }
    return new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } });
}

async function handlePostQuote(req, env) {
    const body = await req.json();
    let list = (await env.VISION_KV.get('quotes', { type: 'json' })) || [];
    if (!body.QuoteID) body.QuoteID = 'Q-' + Date.now();
    body.CreatedAt = new Date().toISOString();
    body.Status = 'submitted';
    list.push(body);
    await env.VISION_KV.put('quotes', JSON.stringify(list));
    
    // Update Requirement QuoteCount
    let reqs = (await env.VISION_KV.get('requirements', { type: 'json' })) || [];
    const rIdx = reqs.findIndex(r => r.RequirementID === body.RequirementID);
    if (rIdx >= 0) {
        reqs[rIdx].QuoteCount = (reqs[rIdx].QuoteCount || 0) + 1;
        await env.VISION_KV.put('requirements', JSON.stringify(reqs));
    }
    
    return new Response(JSON.stringify({ ok: true, quote_id: body.QuoteID }), { headers: { 'Content-Type': 'application/json' } });
}


async function handleSeed(req, env) {
  // Seed Suppliers
  const suppliers = [
    { id: 'S-OLY', company: 'Olympus Medical', name: 'Sales Dept', contact_phone: '400-123-4567', access_password_plain: 'olympus123', status: 'active' },
    { id: 'S-FUJI', company: 'Fujifilm Healthcare', name: 'Support Team', contact_phone: '400-987-6543', access_password_plain: 'fuji123', status: 'active' },
    { id: 'S-STORZ', company: 'Karl Storz', name: 'Global Sales', contact_phone: '+49 1234 5678', access_password_plain: 'storz123', status: 'active' }
  ];
  await env.VISION_KV.put('suppliers', JSON.stringify(suppliers));
  return new Response(JSON.stringify({ ok: true, msg: 'Seeded' }), { headers: { 'Content-Type': 'application/json' } });
}
