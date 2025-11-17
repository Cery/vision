-- Cloudflare D1 schema for Requirements Market

PRAGMA foreign_keys = ON;

-- Requirements table
CREATE TABLE IF NOT EXISTS requirements (
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
  created_at TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_requirements_reqid ON requirements(requirement_id);
CREATE INDEX IF NOT EXISTS idx_requirements_phone ON requirements(contact_phone);
CREATE INDEX IF NOT EXISTS idx_requirements_progress ON requirements(progress);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
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
);

CREATE INDEX IF NOT EXISTS idx_quotes_req ON quotes(requirement_id);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier ON quotes(supplier_id);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
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
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Demanders table (optional)
CREATE TABLE IF NOT EXISTS demanders (
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
);

-- System config (key-value JSON)
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value_json TEXT,
  updated_at TEXT
);