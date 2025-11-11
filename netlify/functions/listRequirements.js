// Netlify Function: listRequirements
// Lists public requirements from Airtable; falls back to local data/requirements.json
// Env: Prefer AIRTABLE_BASE_ID & AIRTABLE_API_KEY; fallback to AIRTABLE_BASE & AIRTABLE_KEY

const fs = require('fs');
const path = require('path');

// GitHub raw fallback (free, reads latest committed JSON)
const GH_OWNER = process.env.GITHUB_OWNER || process.env.GH_OWNER || '';
const GH_REPO = process.env.GITHUB_REPO || process.env.GH_REPO || '';
const GH_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GH_REQUIREMENTS_PATH = process.env.GITHUB_REQUIREMENTS_PATH || 'data/requirements.json';

exports.handler = async () => {
  const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;
  const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_KEY;
  const table = 'Requirements';

  // Prefer Airtable if configured
  if (AIRTABLE_BASE && AIRTABLE_KEY) {
    try {
      const filter = "AND({Status}='公开', {RequirementID} != '')";
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(table)}?filterByFormula=${encodeURIComponent(filter)}&pageSize=50`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } });
      if (!resp.ok) throw new Error(`Airtable HTTP ${resp.status}`);
      const data = await resp.json();
      const items = (data.records || []).map(r => ({
        RequirementID: r.fields.RequirementID,
        Title: r.fields.Title,
        PublicPreview: r.fields.PublicPreview,
        PrimaryCategory: r.fields.PrimaryCategory,
        SecondaryCategory: r.fields.SecondaryCategory,
        Status: r.fields.Status,
        ContactPublic: !!r.fields.ContactPublic,
        ContactName: r.fields.ContactName,
        ContactPhone: r.fields.ContactPhone,
        ContactCompany: r.fields.ContactCompany,
        BudgetRange: r.fields.BudgetRange,
        PublishedAt: r.fields.PublishedAt,
        Progress: r.fields.Progress,
        AllowOpenQuotes: !!r.fields.AllowOpenQuotes,
        Parameters: r.fields.Parameters || {}
      })).filter(x => x.RequirementID);
      return { statusCode: 200, body: JSON.stringify(items) };
    } catch (e) {
      console.error('Airtable fetch failed, falling back to local file:', e.message);
    }
  }

  // Fallback to GitHub raw JSON if configured
  if (GH_OWNER && GH_REPO) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${GH_REQUIREMENTS_PATH}`;
      const resp = await fetch(rawUrl);
      if (resp.ok) {
        const items = await resp.json();
        return { statusCode: 200, body: JSON.stringify(items) };
      } else {
        console.error('GitHub raw fetch failed:', resp.status);
      }
    } catch (e) {
      console.error('GitHub raw fallback failed:', e.message);
    }
  }

  // Fallback to local data file
  try {
    const filePath = path.join(process.cwd(), 'data', 'requirements.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const items = JSON.parse(raw);
    return { statusCode: 200, body: JSON.stringify(items) };
  } catch (e) {
    console.error('Local data fallback failed:', e.message);
    return { statusCode: 200, body: JSON.stringify([]) };
  }
};