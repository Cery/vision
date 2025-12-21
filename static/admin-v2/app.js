(function () {
  const e = React.createElement;

  function normalizeApiBase(v) {
    const raw = (v || '').trim();
    if (!raw) return '';
    return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
  }

  function getDefaultApiBase() {
    const host = (location.hostname || '').toLowerCase();
    const isProd = /(^|\.)visndt\.com$/i.test(host);
    if (isProd) return 'https://api.visndt.com';
    if (host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return 'http://127.0.0.1:8787';
    return 'https://api.visndt.com';
  }

  function apiFetch(path, options) {
    const apiBase = normalizeApiBase(localStorage.getItem('ADMIN_V2_API_BASE') || getDefaultApiBase());
    const token = localStorage.getItem('ADMIN_V2_TOKEN') || '';
    const adminKey = localStorage.getItem('ADMIN_V2_ADMIN_KEY') || '';

    const headers = { 'Content-Type': 'application/json' };
    if (options && options.headers) Object.assign(headers, options.headers);

    const k = token || adminKey;
    if (k) {
      const isJwt = String(k).split('.').length === 3;
      if (isJwt) headers['Authorization'] = 'Bearer ' + k;
      else headers['X-Admin-Key'] = k;
    }

    const url = (apiBase || '') + path;
    return fetch(url, Object.assign({}, options || {}, { headers })).then(async (res) => {
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      const bodyText = await res.text().catch(() => '');
      let body;
      if (ct.includes('application/json')) {
        try {
          body = JSON.parse(bodyText || '{}');
        } catch {
          body = { raw: bodyText };
        }
      } else {
        body = { raw: bodyText };
      }
      if (!res.ok) {
        const msg = (body && (body.error || body.message)) ? (body.error || body.message) : (bodyText || ('HTTP ' + res.status));
        const err = new Error(msg);
        err.status = res.status;
        err.response = body;
        throw err;
      }
      return body;
    });
  }

  function useHashRoute() {
    const getHash = () => {
      const h = (location.hash || '').replace(/^#/, '');
      return h || '/';
    };
    const [route, setRoute] = React.useState(getHash());

    React.useEffect(() => {
      const onChange = () => setRoute(getHash());
      window.addEventListener('hashchange', onChange);
      return () => window.removeEventListener('hashchange', onChange);
    }, []);

    return route;
  }

  function Navbar(props) {
    const loggedIn = !!props.token;

    return e(
      'nav',
      { className: 'navbar navbar-expand-lg navbar-dark bg-dark' },
      e('div', { className: 'container-fluid' },
        e('a', { className: 'navbar-brand', href: '#/' }, 'VisNDT Admin V2'),
        e('div', { className: 'd-flex gap-2 align-items-center' },
          e('a', { className: 'btn btn-sm btn-outline-light', href: '#/stats' }, 'Stats'),
          e('a', { className: 'btn btn-sm btn-outline-light', href: '#/assets' }, 'Assets'),
          e('a', { className: 'btn btn-sm btn-outline-light', href: '#/parameters-schema' }, '参数Schema'),
          e('a', { className: 'btn btn-sm btn-outline-light', href: '#/settings' }, '设置'),
          loggedIn
            ? e('button', { className: 'btn btn-sm btn-warning', onClick: props.onLogout }, '退出')
            : e('a', { className: 'btn btn-sm btn-success', href: '#/login' }, '登录')
        )
      )
    );
  }

  function Layout(props) {
    return e('div', null,
      e(Navbar, { token: props.token, onLogout: props.onLogout }),
      e('div', { className: 'container py-4' }, props.children)
    );
  }

  function Alert(props) {
    if (!props.message) return null;
    const cls = props.type === 'error' ? 'alert-danger' : (props.type === 'success' ? 'alert-success' : 'alert-secondary');
    return e('div', { className: 'alert ' + cls }, props.message);
  }

  function LoginPage(props) {
    const [username, setUsername] = React.useState('visndt');
    const [password, setPassword] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [msg, setMsg] = React.useState('');
    const [msgType, setMsgType] = React.useState('info');

    async function doLogin(ev) {
      ev.preventDefault();
      setBusy(true);
      setMsg('');
      try {
        const res = await apiFetch('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        if (!res || !res.token) throw new Error('登录接口无 token 返回');
        localStorage.setItem('ADMIN_V2_TOKEN', res.token);
        setMsgType('success');
        setMsg('登录成功');
        props.onAuthed(res.token);
        location.hash = '#/stats';
      } catch (e2) {
        setMsgType('error');
        setMsg(e2.message || '登录失败');
      } finally {
        setBusy(false);
      }
    }

    return e('div', { className: 'row justify-content-center' },
      e('div', { className: 'col-12 col-md-6 col-lg-5' },
        e('div', { className: 'card shadow-sm' },
          e('div', { className: 'card-body' },
            e('h5', { className: 'card-title mb-3' }, '登录'),
            e(Alert, { message: msg, type: msgType }),
            e('form', { onSubmit: doLogin },
              e('div', { className: 'mb-3' },
                e('label', { className: 'form-label' }, '用户名'),
                e('input', {
                  className: 'form-control',
                  value: username,
                  onChange: (ev) => setUsername(ev.target.value)
                })
              ),
              e('div', { className: 'mb-3' },
                e('label', { className: 'form-label' }, '密码'),
                e('input', {
                  type: 'password',
                  className: 'form-control',
                  value: password,
                  onChange: (ev) => setPassword(ev.target.value)
                })
              ),
              e('button', { className: 'btn btn-primary w-100', disabled: busy }, busy ? '登录中...' : '登录')
            ),
            e('div', { className: 'mt-3 small text-muted' },
              'API Base 来自设置页（默认自动：本地用 127.0.0.1:8787，线上用 api.visndt.com）。'
            )
          )
        )
      )
    );
  }

  function StatsPage() {
    const [data, setData] = React.useState(null);
    const [err, setErr] = React.useState('');
    const [busy, setBusy] = React.useState(false);

    async function load() {
      setBusy(true);
      setErr('');
      try {
        const res = await apiFetch('/api/admin/stats', { method: 'GET' });
        setData(res);
      } catch (e2) {
        setErr(e2.message || '加载失败');
      } finally {
        setBusy(false);
      }
    }

    React.useEffect(() => { load(); }, []);

    return e('div', null,
      e('div', { className: 'd-flex justify-content-between align-items-center mb-3' },
        e('h4', { className: 'mb-0' }, 'Stats'),
        e('button', { className: 'btn btn-outline-primary btn-sm', onClick: load, disabled: busy }, busy ? '刷新中...' : '刷新')
      ),
      err ? e(Alert, { message: err, type: 'error' }) : null,
      data ? e('pre', { className: 'bg-white border rounded p-3 small', style: { whiteSpace: 'pre-wrap' } }, JSON.stringify(data, null, 2)) : null
    );
  }

  function AssetsPage() {
    const [items, setItems] = React.useState([]);
    const [next, setNext] = React.useState('');
    const [type, setType] = React.useState('');
    const [prefix, setPrefix] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState('');

    async function load(reset) {
      setBusy(true);
      setErr('');
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        if (type) params.set('type', type);
        if (prefix) params.set('prefix', prefix);
        if (!reset && next) params.set('cursor', next);
        const res = await apiFetch('/api/admin/assets?' + params.toString(), { method: 'GET' });
        const newItems = Array.isArray(res.items) ? res.items : [];
        const nextVal = res.offsetNext || res.cursorNext || res.next || '';
        if (reset) setItems(newItems);
        else setItems(items.concat(newItems));
        setNext(nextVal || '');
      } catch (e2) {
        setErr(e2.message || '加载失败');
      } finally {
        setBusy(false);
      }
    }

    React.useEffect(() => { load(true); }, []);

    return e('div', null,
      e('div', { className: 'd-flex justify-content-between align-items-center mb-3' },
        e('h4', { className: 'mb-0' }, 'Assets'),
        e('button', { className: 'btn btn-outline-primary btn-sm', onClick: () => load(true), disabled: busy }, busy ? '刷新中...' : '刷新')
      ),
      e('div', { className: 'row g-2 mb-3' },
        e('div', { className: 'col-12 col-md-3' },
          e('input', {
            className: 'form-control form-control-sm',
            placeholder: 'type (如 image/)',
            value: type,
            onChange: (ev) => setType(ev.target.value)
          })
        ),
        e('div', { className: 'col-12 col-md-5' },
          e('input', {
            className: 'form-control form-control-sm',
            placeholder: 'prefix (可选)',
            value: prefix,
            onChange: (ev) => setPrefix(ev.target.value)
          })
        ),
        e('div', { className: 'col-12 col-md-4 d-flex gap-2' },
          e('button', { className: 'btn btn-sm btn-primary', onClick: () => load(true), disabled: busy }, '应用过滤'),
          e('button', { className: 'btn btn-sm btn-outline-secondary', onClick: () => { setType(''); setPrefix(''); }, disabled: busy }, '清空')
        )
      ),
      err ? e(Alert, { message: err, type: 'error' }) : null,
      e('div', { className: 'card' },
        e('div', { className: 'card-body p-0' },
          e('div', { className: 'table-responsive' },
            e('table', { className: 'table table-striped table-hover mb-0' },
              e('thead', null,
                e('tr', null,
                  e('th', null, 'key'),
                  e('th', null, 'size'),
                  e('th', null, 'url')
                )
              ),
              e('tbody', null,
                (items || []).map((it, idx) => e('tr', { key: (it.key || '') + ':' + idx },
                  e('td', { className: 'text-break' }, it.key || ''),
                  e('td', null, String(it.size || 0)),
                  e('td', { className: 'text-break' },
                    it.public_url
                      ? e('a', { href: it.public_url, target: '_blank', rel: 'noreferrer' }, it.public_url)
                      : ''
                  )
                ))
              )
            )
          )
        )
      ),
      e('div', { className: 'mt-3 d-flex gap-2' },
        e('button', {
          className: 'btn btn-outline-secondary',
          onClick: () => load(false),
          disabled: busy || !next
        }, busy ? '加载中...' : (next ? '加载更多' : '无更多'))
      )
    );
  }

  function ParametersSchemaPage() {
    const [text, setText] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [msg, setMsg] = React.useState('');
    const [msgType, setMsgType] = React.useState('info');

    async function load() {
      setBusy(true);
      setMsg('');
      try {
        const res = await apiFetch('/api/admin/parameters-schema', { method: 'GET' });
        setText(JSON.stringify(res || {}, null, 2));
      } catch (e2) {
        setMsgType('error');
        setMsg(e2.message || '加载失败');
      } finally {
        setBusy(false);
      }
    }

    async function save() {
      setBusy(true);
      setMsg('');
      try {
        let obj;
        try {
          obj = JSON.parse(text || '{}');
        } catch {
          throw new Error('JSON 无法解析');
        }
        const res = await apiFetch('/api/admin/parameters-schema', {
          method: 'POST',
          body: JSON.stringify(obj)
        });
        setMsgType('success');
        setMsg('保存成功：version=' + (res && res.version ? res.version : '')); 
        await load();
      } catch (e2) {
        setMsgType('error');
        setMsg(e2.message || '保存失败');
      } finally {
        setBusy(false);
      }
    }

    React.useEffect(() => { load(); }, []);

    return e('div', null,
      e('div', { className: 'd-flex justify-content-between align-items-center mb-3' },
        e('h4', { className: 'mb-0' }, '参数 Schema（占位：JSON 直接编辑）'),
        e('div', { className: 'd-flex gap-2' },
          e('button', { className: 'btn btn-outline-primary btn-sm', onClick: load, disabled: busy }, '刷新'),
          e('button', { className: 'btn btn-primary btn-sm', onClick: save, disabled: busy }, busy ? '保存中...' : '保存')
        )
      ),
      msg ? e(Alert, { message: msg, type: msgType }) : null,
      e('textarea', {
        className: 'form-control font-monospace',
        rows: 18,
        value: text,
        onChange: (ev) => setText(ev.target.value)
      }),
      e('div', { className: 'mt-2 small text-muted' },
        '后续这里会换成 schema-driven 表单编辑器（v2-6）。当前用于验证 Worker 的 GET/POST 接口。'
      )
    );
  }

  function SettingsPage() {
    const [apiBase, setApiBase] = React.useState(normalizeApiBase(localStorage.getItem('ADMIN_V2_API_BASE') || ''));
    const [adminKey, setAdminKey] = React.useState(localStorage.getItem('ADMIN_V2_ADMIN_KEY') || '');
    const [token, setToken] = React.useState(localStorage.getItem('ADMIN_V2_TOKEN') || '');
    const [busy, setBusy] = React.useState(false);
    const [msg, setMsg] = React.useState('');
    const [msgType, setMsgType] = React.useState('info');

    function save() {
      localStorage.setItem('ADMIN_V2_API_BASE', normalizeApiBase(apiBase));
      localStorage.setItem('ADMIN_V2_ADMIN_KEY', adminKey || '');
      localStorage.setItem('ADMIN_V2_TOKEN', token || '');
      setMsgType('success');
      setMsg('已保存');
    }

    async function triggerBuild() {
      setBusy(true);
      setMsg('');
      try {
        const res = await apiFetch('/api/admin/trigger-build', {
          method: 'POST',
          body: JSON.stringify({ reason: 'admin-v2' })
        });
        setMsgType('success');
        setMsg('触发成功：' + JSON.stringify(res));
      } catch (e2) {
        setMsgType('error');
        setMsg(e2.message || '触发失败');
      } finally {
        setBusy(false);
      }
    }

    return e('div', null,
      e('h4', { className: 'mb-3' }, '设置'),
      msg ? e(Alert, { message: msg, type: msgType }) : null,
      e('div', { className: 'card' },
        e('div', { className: 'card-body' },
          e('div', { className: 'mb-3' },
            e('label', { className: 'form-label' }, 'API Base (可为空，表示同源；或填 https://api.visndt.com / http://127.0.0.1:8787)'),
            e('input', {
              className: 'form-control',
              value: apiBase,
              onChange: (ev) => setApiBase(ev.target.value)
            })
          ),
          e('div', { className: 'mb-3' },
            e('label', { className: 'form-label' }, 'Admin Key（可选：X-Admin-Key 或 JWT，优先使用 Token）'),
            e('input', {
              className: 'form-control',
              value: adminKey,
              onChange: (ev) => setAdminKey(ev.target.value)
            })
          ),
          e('div', { className: 'mb-3' },
            e('label', { className: 'form-label' }, 'Token（JWT，登录后会自动写入）'),
            e('input', {
              className: 'form-control',
              value: token,
              onChange: (ev) => setToken(ev.target.value)
            })
          ),
          e('div', { className: 'd-flex gap-2' },
            e('button', { className: 'btn btn-primary', onClick: save }, '保存'),
            e('button', { className: 'btn btn-outline-secondary', onClick: () => { setApiBase(''); setAdminKey(''); setToken(''); }, disabled: busy }, '清空输入'),
            e('button', { className: 'btn btn-outline-success', onClick: triggerBuild, disabled: busy }, busy ? '触发中...' : '触发 Netlify 构建')
          )
        )
      )
    );
  }

  function HomePage() {
    return e('div', { className: 'card' },
      e('div', { className: 'card-body' },
        e('h4', { className: 'card-title' }, 'Admin V2 最小骨架'),
        e('p', { className: 'card-text text-muted' },
          '目标：本地/线上可访问，验证 Worker 接口（login/stats/assets/parameters-schema/trigger-build）。'
        ),
        e('div', { className: 'd-flex gap-2 flex-wrap' },
          e('a', { className: 'btn btn-primary', href: '#/login' }, '去登录'),
          e('a', { className: 'btn btn-outline-primary', href: '#/stats' }, '看 Stats'),
          e('a', { className: 'btn btn-outline-primary', href: '#/assets' }, '看 Assets'),
          e('a', { className: 'btn btn-outline-primary', href: '#/parameters-schema' }, '参数 Schema')
        )
      )
    );
  }

  function App() {
    const route = useHashRoute();
    const [token, setToken] = React.useState(localStorage.getItem('ADMIN_V2_TOKEN') || '');

    function logout() {
      localStorage.removeItem('ADMIN_V2_TOKEN');
      setToken('');
      location.hash = '#/login';
    }

    let page = null;
    if (route === '/' || route === '') page = e(HomePage);
    else if (route === '/login') page = e(LoginPage, { onAuthed: (t) => setToken(t) });
    else if (route === '/stats') page = e(StatsPage);
    else if (route === '/assets') page = e(AssetsPage);
    else if (route === '/parameters-schema') page = e(ParametersSchemaPage);
    else if (route === '/settings') page = e(SettingsPage);
    else page = e('div', { className: 'alert alert-warning' }, '未知路由：', route);

    return e(Layout, { token: token, onLogout: logout }, page);
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(e(App));
})();
