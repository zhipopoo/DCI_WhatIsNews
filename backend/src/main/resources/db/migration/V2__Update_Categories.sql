-- ============================================================
-- WhatIsNew - V2: Update Categories to New Set
-- ============================================================

-- Use a DO block so we can handle edge cases gracefully on cloud RDS
DO $$
DECLARE
    v_aimodels_id BIGINT;
    v_news_id BIGINT;
    v_aitools_id BIGINT;
    v_tech_id BIGINT;
    v_insights_id BIGINT;
BEGIN
    -- Step 1: Rename existing categories first
    UPDATE category SET name = 'AI Models', slug = 'ai-models',
        description = 'Artificial intelligence models and breakthroughs', sort_order = 3
    WHERE slug = 'ai-ai-models';

    -- Step 2: Insert/update categories
    INSERT INTO category (name, slug, description, sort_order) VALUES
        ('News',              'news',              'Latest news and announcements',                    1),
        ('DCI Cloud Service', 'dci-cloud-service', 'DCI cloud service related news and updates',       2),
        ('AI Models',         'ai-models',         'Artificial intelligence models and breakthroughs', 3),
        ('Training Videos',   'training-videos',   'Tutorials, guides and training resources',         4)
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order;

    -- Step 3: Resolve target category IDs
    SELECT id INTO v_aimodels_id FROM category WHERE slug = 'ai-models';
    SELECT id INTO v_news_id FROM category WHERE slug = 'news';
    SELECT id INTO v_aitools_id FROM category WHERE slug = 'ai-tools';
    SELECT id INTO v_tech_id FROM category WHERE slug = 'technology';
    SELECT id INTO v_insights_id FROM category WHERE slug = 'industry-insights';

    -- Step 4: Reassign news from removed categories to new ones
    -- AI Tools → AI Models
    IF v_aitools_id IS NOT NULL AND v_aimodels_id IS NOT NULL THEN
        UPDATE news SET category_id = v_aimodels_id WHERE category_id = v_aitools_id;
    END IF;

    -- Technology → News
    IF v_tech_id IS NOT NULL AND v_news_id IS NOT NULL THEN
        UPDATE news SET category_id = v_news_id WHERE category_id = v_tech_id;
    END IF;

    -- Industry Insights → News
    IF v_insights_id IS NOT NULL AND v_news_id IS NOT NULL THEN
        UPDATE news SET category_id = v_news_id WHERE category_id = v_insights_id;
    END IF;

    -- Step 5: Delete old categories that are no longer needed
    -- Only delete if there are truly no remaining references
    DELETE FROM category
    WHERE slug IN ('ai-tools', 'technology', 'industry-insights')
      AND id NOT IN (SELECT DISTINCT category_id FROM news WHERE category_id IS NOT NULL);
END $$;
