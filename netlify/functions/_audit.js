const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
const AIRTABLE_AUDIT_TABLE = process.env.AIRTABLE_AUDIT_TABLE || 'AuditLogs';

function safeBase() {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return null;
  try {
    return new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
  } catch {
    return null;
  }
}

exports.logEvent = async function logEvent({ eventType, requirementID, ip, meta }) {
  try {
    const base = safeBase();
    if (!base) return;
    const payload = {
      EventType: eventType || 'unknown',
      RequirementID: requirementID || '',
      IP: ip || '',
      Timestamp: new Date().toISOString(),
      Meta: typeof meta === 'string' ? meta : JSON.stringify(meta || {})
    };
    await base(AIRTABLE_AUDIT_TABLE).create(payload);
  } catch (e) {
    // 审计失败不阻断主流程
    console.warn('audit log failed:', e.message || String(e));
  }
};