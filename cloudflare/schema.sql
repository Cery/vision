-- Cloudflare D1 Schema

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
  quote_password TEXT,
  view_password TEXT,
  is_featured INTEGER DEFAULT 0,
  is_urgent INTEGER DEFAULT 0,
  admin_notes TEXT,
  tags TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_requirements_reqid ON requirements(requirement_id);
CREATE INDEX IF NOT EXISTS idx_requirements_phone ON requirements(contact_phone);
CREATE INDEX IF NOT EXISTS idx_requirements_progress ON requirements(progress);

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

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT UNIQUE,
  supplier_id TEXT,
  name TEXT,
  slug TEXT UNIQUE,
  model TEXT,
  series TEXT,
  primary_category TEXT,
  secondary_category TEXT,
  summary TEXT,
  description TEXT,
  parameters_json TEXT,
  cover_image TEXT,
  gallery_json TEXT,
  documents_json TEXT,
  seo_title TEXT,
  seo_keywords TEXT,
  seo_description TEXT,
  status TEXT,
  is_featured INTEGER,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

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

CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value_json TEXT,
  updated_at TEXT
);

-- New Content Tables
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  news_id TEXT UNIQUE,
  title TEXT,
  slug TEXT UNIQUE,
  summary TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT,
  tags TEXT,
  author TEXT,
  status TEXT,
  seo_title TEXT,
  seo_keywords TEXT,
  seo_description TEXT,
  published_at TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_news_cat ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT UNIQUE,
  title TEXT,
  slug TEXT UNIQUE,
  summary TEXT,
  content TEXT,
  cover_image TEXT,
  industry TEXT,
  related_product_id TEXT,
  status TEXT,
  seo_title TEXT,
  seo_keywords TEXT,
  seo_description TEXT,
  published_at TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_cases_slug ON cases(slug);

CREATE TABLE IF NOT EXISTS exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exhibition_id TEXT UNIQUE,
  title TEXT,
  slug TEXT UNIQUE,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  booth_number TEXT,
  description TEXT,
  cover_image TEXT,
  status TEXT,
  seo_title TEXT,
  seo_keywords TEXT,
  seo_description TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_exhibitions_slug ON exhibitions(slug);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id TEXT UNIQUE,
  filename TEXT,
  r2_key TEXT,
  public_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  alt_text TEXT,
  uploaded_by TEXT,
  created_at TEXT
);
