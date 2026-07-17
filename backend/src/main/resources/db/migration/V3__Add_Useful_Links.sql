CREATE TABLE IF NOT EXISTS useful_link (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(200)    NOT NULL,
    description     VARCHAR(1000),
    media_file_id   BIGINT          REFERENCES media_file(id) ON DELETE SET NULL,
    sort_order      INT             NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_useful_link_active_sort ON useful_link(is_active, sort_order);

COMMENT ON TABLE  useful_link               IS 'Useful links downloadable by visitors';
COMMENT ON COLUMN useful_link.media_file_id IS 'FK to media_file for the downloadable file';
