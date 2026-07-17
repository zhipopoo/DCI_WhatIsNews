CREATE TABLE IF NOT EXISTS site_settings (
    id              BIGSERIAL       PRIMARY KEY,
    logo_url        VARCHAR(500),
    primary_color   VARCHAR(7)      NOT NULL DEFAULT '#C7000B',
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  site_settings               IS 'Singleton row for site theme/branding';
COMMENT ON COLUMN site_settings.logo_url      IS 'Public logo image URL (overrides text logo)';
COMMENT ON COLUMN site_settings.primary_color IS 'Hex brand color, e.g. #C7000B';

-- Seed default settings (singleton row)
INSERT INTO site_settings (id, logo_url, primary_color) VALUES (1, NULL, '#C7000B')
ON CONFLICT (id) DO NOTHING;
