CREATE TABLE IF NOT EXISTS orders (
 id VARCHAR(40) PRIMARY KEY,
 secret_hash TEXT NOT NULL,
 name VARCHAR(80) NOT NULL,
 email VARCHAR(180) NOT NULL,
 phone VARCHAR(30) NOT NULL,
 theme VARCHAR(24) NOT NULL CHECK(theme IN ('debut','fearless','speak-now','red','1989','reputation','lover','folklore','evermore','midnights','ttpd','1989-vault','red-tv','speak-now-tv','fearless-tv')),
 package_code VARCHAR(30) NOT NULL DEFAULT 'two-strips',
 price_idr INTEGER NOT NULL CHECK(price_idr >= 0),
 status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PAID','PROCESSING','READY','FAILED','CANCELLED')),
 payment_url TEXT,
 drive_file_id TEXT,
 drive_link TEXT,
 photo_path TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 paid_at TIMESTAMPTZ,
 completed_at TIMESTAMPTZ,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE TABLE IF NOT EXISTS outbox (
 id BIGSERIAL PRIMARY KEY,
 kind VARCHAR(30) NOT NULL,
 ref_id VARCHAR(40) NOT NULL,
 payload JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 next_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 attempts INTEGER NOT NULL DEFAULT 0,
 sent_at TIMESTAMPTZ,
 last_error TEXT,
 UNIQUE(kind,ref_id)
);
CREATE TABLE IF NOT EXISTS b2b_leads (
 id BIGSERIAL PRIMARY KEY,
 company VARCHAR(120) NOT NULL,
 contact_name VARCHAR(80) NOT NULL,
 email VARCHAR(180) NOT NULL,
 phone VARCHAR(30) NOT NULL,
 event_type VARCHAR(80) NOT NULL,
 event_date DATE,
 message VARCHAR(1200),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
