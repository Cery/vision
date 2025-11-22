export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    if (request.method === 'OPTIONS') {
      const h = new Headers();
      h.set('Access-Control-Allow-Origin', '*');
      h.set('Access-Control-Allow-Headers', 'X-Admin-Key, Content-Type');
      h.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      return new Response('', { status: 204, headers: h });
    }
    if (!u.pathname.startsWith('/api')) {
      return new Response('NotFound', { status: 404 });
    }
    const tail = u.pathname.replace(/^\/api/, '');
    const target = env.TARGET_BASE + tail + (u.search || '');
    const hdr = new Headers(request.headers);
    hdr.delete('host');
    hdr.delete('content-length');
    hdr.set('Accept-Encoding', 'gzip');
    const resp = await fetch(target, { method: request.method, headers: hdr, body: request.body });
    const out = new Headers(resp.headers);
    out.set('Access-Control-Allow-Origin', '*');
    out.set('Access-Control-Allow-Headers', 'X-Admin-Key, Content-Type');
    out.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    return new Response(resp.body, { status: resp.status, headers: out });
  }
}