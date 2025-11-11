const Airtable = require('airtable');
const bcrypt = require('bcryptjs');
const { isRateLimited } = require('./security');
const { readJson, writeJson } = require('./_common');

// Env vars (support legacy names too)
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
const AIRTABLE_REQUIREMENTS_TABLE = process.env.AIRTABLE_REQUIREMENTS_TABLE || 'Requirements';

// Optional notification providers
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || '';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_FROM = process.env.TWILIO_PHONE_FROM || '';

// Optional free persistence via GitHub (commits JSON to repo)
const GH_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const GH_OWNER = process.env.GITHUB_OWNER || process.env.GH_OWNER || '';
const GH_REPO = process.env.GITHUB_REPO || process.env.GH_REPO || '';
const GH_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GH_REQUIREMENTS_PATH = process.env.GITHUB_REQUIREMENTS_PATH || 'data/requirements.json';

function generateServerRequirementID() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rnd = Math.floor(Math.random() * 9000) + 1000; // 4 digits
  return `REQ-${y}${m}${day}-${rnd}`;
}

async function sendEmail({ to, subject, text }) {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !to) return { sent: false, reason: 'Email disabled or missing env' };
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [to],
        subject,
        text
      })
    });
    if (!resp.ok) throw new Error(`Resend HTTP ${resp.status}`);
    return { sent: true };
  } catch (e) {
    console.error('notify email error:', e);
    return { sent: false, reason: e.message || String(e) };
  }
}

async function sendSMS({ to, text }) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_FROM || !to) return { sent: false, reason: 'SMS disabled or missing env' };
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const body = new URLSearchParams({ From: TWILIO_PHONE_FROM, To: to, Body: text });
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64') },
      body
    });
    if (!resp.ok) throw new Error(`Twilio HTTP ${resp.status}`);
    return { sent: true };
  } catch (e) {
    console.error('notify sms error:', e);
    return { sent: false, reason: e.message || String(e) };
  }
}

// Append record to JSON in GitHub repository via Contents API
async function githubAppendRequirement(record) {
  if (!GH_TOKEN || !GH_OWNER || !GH_REPO) throw new Error('GitHub not configured');
  const baseUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_REQUIREMENTS_PATH}`;
  let current = [];
  let sha;
  try {
    const getUrl = `${baseUrl}?ref=${encodeURIComponent(GH_BRANCH)}`;
    const resp = await fetch(getUrl, { headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json' } });
    if (resp.status === 404) {
      current = [];
      sha = undefined;
    } else {
      if (!resp.ok) throw new Error(`GitHub GET ${resp.status}`);
      const data = await resp.json();
      sha = data.sha;
      const decoded = Buffer.from(data.content, data.encoding || 'base64').toString('utf8');
      try { current = JSON.parse(decoded); } catch { current = []; }
    }
  } catch (e) {
    // If GET fails for reasons other than 404, surface error
    if (e && String(e).includes('GitHub GET')) throw e;
    current = current || [];
  }
  current.push(record);
  const newContent = Buffer.from(JSON.stringify(current, null, 2)).toString('base64');
  const putResp = await fetch(baseUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json' },
    body: JSON.stringify({
      message: `chore: add requirement ${record.RequirementID}`,
      content: newContent,
      branch: GH_BRANCH,
      sha
    })
  });
  const putData = await putResp.json();
  if (!putResp.ok) throw new Error(putData.message || `GitHub PUT ${putResp.status}`);
  return { committed: true, url: (putData.content && putData.content.html_url) || '' };
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const ip = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'];
    if (isRateLimited(ip)) {
      return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) };
    }

    const data = JSON.parse(event.body || '{}');
    // Basic validation
    const required = ['contactName', 'contactPhone', 'Title', 'primaryCategory'];
    const missing = required.filter(k => !String(data[k] || '').trim());
    if (missing.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields', fields: missing }) };
    }

    // Prepare fields (shared for Airtable or local fallback)
    const now = new Date();
    const requirementID = String(data.requirementID || '').trim() || generateServerRequirementID();
    const status = String(data.Status || '').trim() || '公开';
    const allowOpenQuotes = status === '在线报价' ? true : !!data.AllowOpenQuotes;
    const contactPublic = !!data.ContactPublic;
    const secondaryCategory = String(data.secondaryCategory || '').trim();
    const budgetRange = String(data.BudgetRange || '').trim();
    const publicPreview = String(data.PublicPreview || '').trim();
    const contactCompany = String(data.contactCompany || '').trim();
    const contactEmail = String(data.contactEmail || '').trim();
    const publishedAt = data.PublishedAt || now.toISOString();
    const progress = String(data.Progress || '').trim() || '发布中';

    // password handling
    let viewPasswordPlain = String(data.viewPassword || '').trim();
    if (!viewPasswordPlain) {
      viewPasswordPlain = String(Math.floor(Math.random() * 900000) + 100000); // 6 digits
    }
    const viewPasswordHash = await bcrypt.hash(viewPasswordPlain, 10);

    // Parameters
    const parametersObj = (function(){
      try { return data.Parameters || {}; } catch { return {}; }
    })();
    // Build common record object for non-Airtable storage flows
    const localRecord = {
      RequirementID: requirementID,
      Title: data.Title,
      PublicPreview: publicPreview,
      PrimaryCategory: data.primaryCategory,
      SecondaryCategory: secondaryCategory,
      Status: status,
      ContactName: data.contactName,
      ContactPhone: data.contactPhone,
      ContactCompany: contactCompany,
      ContactPublic: contactPublic,
      AllowOpenQuotes: allowOpenQuotes,
      Parameters: parametersObj,
      PublishedAt: publishedAt,
      BudgetRange: budgetRange,
      Progress: progress,
      ViewPasswordPlain: viewPasswordPlain
    };

    // Prefer GitHub persistence if configured
    if (GH_TOKEN && GH_OWNER && GH_REPO) {
      try {
        await githubAppendRequirement(localRecord);
        // Notifications (best-effort)
        const siteUrl = process.env.SITE_URL || '';
        const detailUrl = siteUrl ? `${siteUrl}/requirements/${encodeURIComponent(requirementID)}/` : '';
        const subject = `需求发布成功：${requirementID}`;
        const textLines = [
          `您的需求已发布成功。`,
          `编号：${requirementID}`,
          `查看密码：${viewPasswordPlain}`,
          detailUrl ? `查看链接：${detailUrl}` : '',
          `如需修改开放报价/联系方式脱敏，可联系平台客服。`
        ].filter(Boolean);
        const text = textLines.join('\n');
        try { if (contactEmail) await sendEmail({ to: contactEmail, subject, text }); } catch {}
        try { if (data.contactPhone) await sendSMS({ to: data.contactPhone, text }); } catch {}
        return { statusCode: 200, body: JSON.stringify({ RequirementID: requirementID, ViewPassword: viewPasswordPlain, storage: 'github' }) };
      } catch (e) {
        console.error('GitHub commit failed, falling back:', e.message || e);
        // fall through to Airtable/local
      }
    }

    // If Airtable is not configured, store locally as a graceful fallback
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      try {
        const arr = await readJson('data/requirements.json', []);
        arr.push(localRecord);
        await writeJson('data/requirements.json', arr);
      } catch (e) {
        console.error('Local fallback write failed:', e);
        return { statusCode: 500, body: JSON.stringify({ error: 'Local storage failed', detail: e.message || String(e) }) };
      }

      // Notifications (best-effort)
      const siteUrl = process.env.SITE_URL || '';
      const detailUrl = siteUrl ? `${siteUrl}/requirements/${encodeURIComponent(requirementID)}/` : '';
      const subject = `需求发布成功：${requirementID}`;
      const textLines = [
        `您的需求已发布成功。`,
        `编号：${requirementID}`,
        `查看密码：${viewPasswordPlain}`,
        detailUrl ? `查看链接：${detailUrl}` : '',
        `如需修改开放报价/联系方式脱敏，可联系平台客服。`
      ].filter(Boolean);
      const text = textLines.join('\n');

      try { if (contactEmail) await sendEmail({ to: contactEmail, subject, text }); } catch {}
      try { if (data.contactPhone) await sendSMS({ to: data.contactPhone, text }); } catch {}

      return {
        statusCode: 200,
        body: JSON.stringify({ RequirementID: requirementID, ViewPassword: viewPasswordPlain, storage: 'local' })
      };
    }

    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
    const fields = {
      RequirementID: requirementID,
      Title: data.Title,
      PublicPreview: publicPreview,
      PrimaryCategory: data.primaryCategory,
      SecondaryCategory: secondaryCategory,
      Status: status,
      ContactName: data.contactName,
      ContactPhone: data.contactPhone,
      ContactCompany: contactCompany,
      ContactPublic: contactPublic,
      ViewPasswordHash: viewPasswordHash,
      ViewPasswordPlain: viewPasswordPlain,
      AllowOpenQuotes: allowOpenQuotes,
      Parameters: JSON.stringify(parametersObj),
      PublishedAt: publishedAt,
      BudgetRange: budgetRange,
      Progress: progress
    };

    const created = await base(AIRTABLE_REQUIREMENTS_TABLE).create(fields);

    // Audit (best-effort)
    try {
      const { logEvent } = require('./_audit');
      logEvent({ eventType: 'create_requirement_success', requirementID, ip, meta: { recordId: created.id } });
    } catch {}

    // Notifications (best-effort)
    const siteUrl = process.env.SITE_URL || '';
    const detailUrl = siteUrl ? `${siteUrl}/requirements/${encodeURIComponent(requirementID)}/` : '';
    const subject = `需求发布成功：${requirementID}`;
    const textLines = [
      `您的需求已发布成功。`,
      `编号：${requirementID}`,
      `查看密码：${viewPasswordPlain}`,
      detailUrl ? `查看链接：${detailUrl}` : '',
      `如需修改开放报价/联系方式脱敏，可联系平台客服。`
    ].filter(Boolean);
    const text = textLines.join('\n');

    let emailResult = { sent: false };
    let smsResult = { sent: false };
    if (contactEmail) {
      emailResult = await sendEmail({ to: contactEmail, subject, text });
    }
    if (data.contactPhone) {
      // Ensure phone includes country code if required by provider; here we send as-is
      smsResult = await sendSMS({ to: data.contactPhone, text });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: created.id,
        RequirementID: requirementID,
        ViewPassword: viewPasswordPlain,
        notifications: { email: emailResult, sms: smsResult }
      })
    };
  } catch (err) {
    console.error('createRequirement error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};