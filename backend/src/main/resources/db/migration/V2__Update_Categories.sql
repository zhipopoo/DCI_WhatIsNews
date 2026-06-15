-- ============================================================
-- WhatIsNew - V2: Update Categories to New Set
-- ============================================================

-- Step 1: Rename existing categories first (before inserting new ones to avoid slug conflicts)
UPDATE category SET name = 'AI Models', slug = 'ai-models', description = 'Artificial intelligence models and breakthroughs', sort_order = 3
WHERE slug = 'ai-ai-models';

-- Step 2: Insert/update categories (ON CONFLICT handles both new and existing)
-- 'news' and 'training-videos' are new; 'dci-cloud-service' and 'ai-models' already exist
INSERT INTO category (name, slug, description, sort_order) VALUES
    ('News',              'news',              'Latest news and announcements',                    1),
    ('DCI Cloud Service', 'dci-cloud-service', 'DCI cloud service related news and updates',       2),
    ('AI Models',         'ai-models',         'Artificial intelligence models and breakthroughs', 3),
    ('Training Videos',   'training-videos',   'Tutorials, guides and training resources',         4)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- Step 3: Reassign news from removed categories to appropriate new categories
-- AI Tools → AI Models
UPDATE news SET category_id = (SELECT id FROM category WHERE slug = 'ai-models')
WHERE category_id IN (SELECT id FROM category WHERE slug = 'ai-tools');

-- Technology → News
UPDATE news SET category_id = (SELECT id FROM category WHERE slug = 'news')
WHERE category_id IN (SELECT id FROM category WHERE slug = 'technology');

-- Industry Insights → News
UPDATE news SET category_id = (SELECT id FROM category WHERE slug = 'news')
WHERE category_id IN (SELECT id FROM category WHERE slug = 'industry-insights');

-- Step 4: Delete old categories that are no longer needed
DELETE FROM category WHERE slug IN ('ai-tools', 'technology', 'industry-insights');
