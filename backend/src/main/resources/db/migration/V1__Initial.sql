-- ============================================================
-- WhatIsNew - Initial Database Schema (Flyway V1)
-- ============================================================

-- Enable trigram extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 1. Category Table
-- ============================================================
CREATE TABLE IF NOT EXISTS category (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    slug            VARCHAR(120)    NOT NULL UNIQUE,
    description     VARCHAR(500),
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  category      IS 'News categories';
COMMENT ON COLUMN category.name       IS 'Category display name';
COMMENT ON COLUMN category.slug       IS 'URL-friendly identifier';
COMMENT ON COLUMN category.sort_order IS 'Display sort order';

-- ============================================================
-- 2. News Table
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(300)    NOT NULL,
    subtitle        VARCHAR(500),
    summary         TEXT,
    content         TEXT            NOT NULL,
    cover_image     VARCHAR(500),
    category_id     BIGINT          NOT NULL REFERENCES category(id),
    tags            VARCHAR(500),
    author          VARCHAR(100)    NOT NULL DEFAULT 'WhatIsNew Editor',
    is_published    BOOLEAN         NOT NULL DEFAULT FALSE,
    is_top          BOOLEAN         NOT NULL DEFAULT FALSE,
    view_count      BIGINT          NOT NULL DEFAULT 0,
    is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at    TIMESTAMP
);

CREATE INDEX idx_news_category_id   ON news(category_id);
CREATE INDEX idx_news_is_published  ON news(is_published) WHERE is_deleted = FALSE;
CREATE INDEX idx_news_is_top        ON news(is_top) WHERE is_deleted = FALSE;
CREATE INDEX idx_news_published_at  ON news(published_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_news_created_at    ON news(created_at DESC);
CREATE INDEX idx_news_title_trgm    ON news USING gin (title gin_trgm_ops);
CREATE INDEX idx_news_tags          ON news USING gin (to_tsvector('english', COALESCE(tags, '')));

COMMENT ON TABLE  news               IS 'News articles';
COMMENT ON COLUMN news.title         IS 'Article title';
COMMENT ON COLUMN news.subtitle      IS 'Article subtitle';
COMMENT ON COLUMN news.summary       IS 'Short summary for cards';
COMMENT ON COLUMN news.content       IS 'Rich text HTML content';
COMMENT ON COLUMN news.cover_image   IS 'Cover image URL or path';
COMMENT ON COLUMN news.tags          IS 'Comma-separated tags';
COMMENT ON COLUMN news.is_published  IS 'Publish status';
COMMENT ON COLUMN news.is_top        IS 'Sticky/pinned article';
COMMENT ON COLUMN news.is_deleted    IS 'Soft delete flag';

-- ============================================================
-- 3. Admin User Table
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_user (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    display_name    VARCHAR(100),
    email           VARCHAR(200),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  admin_user             IS 'Admin / backend users';
COMMENT ON COLUMN admin_user.password    IS 'BCrypt hashed password';

-- ============================================================
-- 4. Media File Table
-- ============================================================
CREATE TABLE IF NOT EXISTS media_file (
    id              BIGSERIAL       PRIMARY KEY,
    original_name   VARCHAR(500)    NOT NULL,
    stored_name     VARCHAR(500)    NOT NULL,
    file_path       VARCHAR(1000)   NOT NULL,
    file_size       BIGINT          NOT NULL DEFAULT 0,
    mime_type       VARCHAR(100),
    file_type       VARCHAR(20)     NOT NULL DEFAULT 'IMAGE',
    width           INT,
    height          INT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_file_type ON media_file(file_type);

COMMENT ON TABLE  media_file              IS 'Uploaded media files';
COMMENT ON COLUMN media_file.file_type    IS 'IMAGE, VIDEO, DOCUMENT, etc.';

-- ============================================================
-- Seed Data
-- ============================================================

-- 5 categories
INSERT INTO category (name, slug, description, sort_order) VALUES
    ('DCI Cloud Service',       'dci-cloud-service',        'DCI cloud service related news and updates',       1),
    ('AI & AI Models',          'ai-ai-models',             'Artificial intelligence and AI models',            2),
    ('AI Tools',                'ai-tools',                 'AI tools and applications',                        3),
    ('Technology',              'technology',               'General technology news',                          4),
    ('Industry Insights',       'industry-insights',        'Industry trends and analysis',                     5)
ON CONFLICT (slug) DO NOTHING;

-- Default admin user (password: admin123)
-- BCrypt $2y$10 hash for "admin123" (verified)
INSERT INTO admin_user (username, password, display_name, email, is_active) VALUES
    ('admin', '$2y$10$7z5cHybVxQK5oLnTBghPPe/kPuUDyRXKaVPXSn6khHy1rGj4Tvggm', 'Super Admin', 'admin@whatisnew.com', TRUE)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- Demo News Articles (8 articles across categories)
-- ============================================================
INSERT INTO news (title, subtitle, summary, content, cover_image, category_id, tags, author, is_published, is_top, view_count, published_at) VALUES

-- Article 1: Top (DCI Cloud Service)
(
    'DCI Cloud Service Launches Next-Gen Infrastructure Platform',
    'Revolutionizing cloud deployment with AI-powered orchestration',
    'DCI Cloud Service unveils its next-generation infrastructure platform, featuring AI-powered orchestration, auto-scaling, and enhanced security capabilities for enterprise customers worldwide.',
    '<h2>Next-Generation Cloud Infrastructure</h2>
<p>DCI Cloud Service has officially launched its next-generation infrastructure platform, marking a significant milestone in cloud computing technology. The new platform leverages artificial intelligence to optimize resource allocation, predict workload patterns, and automatically scale services based on real-time demand.</p>
<h3>Key Features</h3>
<ul>
    <li><strong>AI-Powered Orchestration:</strong> Intelligent workload distribution across global data centers</li>
    <li><strong>Auto-Scaling 2.0:</strong> Predictive scaling that anticipates traffic spikes before they occur</li>
    <li><strong>Enhanced Security:</strong> Zero-trust architecture with real-time threat detection</li>
    <li><strong>Cost Optimization:</strong> Smart resource allocation reducing cloud costs by up to 35%</li>
</ul>
<blockquote>This platform represents years of research and development, bringing enterprise-grade cloud capabilities to organizations of all sizes.</blockquote>
<p>The platform is available starting today for all DCI Cloud Service customers, with migration tools provided for existing deployments.</p>',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    1, 'Cloud,DCI,Infrastructure,AI', 'Michael Chen', TRUE, TRUE, 1520,
    '2026-05-28 09:00:00'
),

-- Article 2: AI & AI Models
(
    'GPT-5 Preview: What to Expect from the Next Generation Language Model',
    'OpenAI shares early benchmarks showing dramatic improvements in reasoning and multilingual capabilities',
    'Early benchmarks of GPT-5 reveal significant advances in logical reasoning, code generation, and multilingual understanding. Experts weigh in on what this means for the AI industry.',
    '<h2>The Dawn of GPT-5</h2>
<p>OpenAI has released preliminary benchmarks for GPT-5, its upcoming next-generation language model. The results show substantial improvements across multiple dimensions, particularly in areas that have historically challenged large language models.</p>
<h3>Benchmark Highlights</h3>
<ul>
    <li><strong>Reasoning:</strong> 47% improvement on complex logical reasoning tasks</li>
    <li><strong>Code Generation:</strong> Near-human performance on competitive programming problems</li>
    <li><strong>Multilingual:</strong> Native-level fluency in over 100 languages</li>
    <li><strong>Hallucination Rate:</strong> Reduced by 62% compared to GPT-4</li>
</ul>
<p>Industry analysts predict GPT-5 will transform software development, scientific research, and content creation. The model is expected to be released later this year.</p>
<h3>What This Means for Developers</h3>
<p>With enhanced code generation capabilities, developers can expect more accurate code suggestions, better debugging assistance, and more sophisticated automated refactoring. The improved reasoning also means better architectural recommendations and more thorough code reviews.</p>',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    2, 'AI,GPT-5,OpenAI,LLM', 'Sarah Johnson', TRUE, TRUE, 2340,
    '2026-05-27 14:30:00'
),

-- Article 3: AI Tools
(
    'Claude Code Revolutionizes Developer Workflows with AI-Powered Terminal',
    'How Anthropic''s CLI tool is changing the way developers write, debug, and deploy code',
    'Claude Code, Anthropic''s AI-powered terminal tool, is transforming developer workflows. From automated debugging to intelligent refactoring, discover how this tool is reshaping software development.',
    '<h2>The Rise of AI-Powered Development Tools</h2>
<p>Anthropic''s Claude Code has emerged as one of the most powerful AI-assisted development tools in the market. Running directly in the terminal, it provides developers with an intelligent assistant that understands codebases, writes and edits files, and manages complex multi-step tasks.</p>
<h3>Key Capabilities</h3>
<ul>
    <li><strong>Codebase Understanding:</strong> Reads and comprehends entire project structures</li>
    <li><strong>Intelligent Editing:</strong> Makes precise, context-aware code changes</li>
    <li><strong>Git Integration:</strong> Seamlessly manages branches, commits, and PRs</li>
    <li><strong>Multi-Agent Orchestration:</strong> Spawns specialized sub-agents for complex tasks</li>
</ul>
<blockquote>Claude Code has reduced our development cycle by 40%. It''s not just a copilot—it''s a full development partner.</blockquote>
<p>With support for hundreds of programming languages and deep integration with modern development workflows, Claude Code is quickly becoming an essential tool for development teams worldwide.</p>',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    3, 'Claude,Anthropic,Developer Tools,AI', 'David Kim', TRUE, TRUE, 1890,
    '2026-05-26 11:00:00'
),

-- Article 4: Technology
(
    'Kubernetes 2.0: The Future of Container Orchestration',
    'CNCF announces major version release with WebAssembly support and edge-native capabilities',
    'The Cloud Native Computing Foundation has announced Kubernetes 2.0, featuring native WebAssembly support, edge computing optimizations, and a dramatically simplified user experience.',
    '<h2>Kubernetes 2.0 Is Here</h2>
<p>After years of community development, Kubernetes 2.0 has been officially released. This major version introduces several groundbreaking features that extend Kubernetes beyond traditional container orchestration.</p>
<h3>Major New Features</h3>
<ul>
    <li><strong>WebAssembly (Wasm) Support:</strong> Run Wasm workloads natively alongside containers</li>
    <li><strong>Edge-Native Architecture:</strong> Lightweight control plane for edge deployments</li>
    <li><strong>Simplified UX:</strong> New declarative configuration format reducing YAML complexity by 60%</li>
    <li><strong>Enhanced Security:</strong> Built-in supply chain security with SBOM integration</li>
</ul>
<p>The WebAssembly support is particularly significant, enabling faster cold starts and better resource efficiency for microservices. Edge-native capabilities allow Kubernetes to run efficiently on resource-constrained devices, opening new possibilities for IoT and edge computing.</p>',
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
    4, 'Kubernetes,Containers,WebAssembly,Cloud Native', 'Emily Rodriguez', TRUE, FALSE, 876,
    '2026-05-25 08:00:00'
),

-- Article 5: Industry Insights
(
    'Cloud Computing Market to Reach $1.5 Trillion by 2028',
    'New industry report highlights explosive growth driven by AI workloads and digital transformation',
    'A comprehensive market analysis predicts the global cloud computing market will surpass $1.5 trillion by 2028, fueled by AI adoption, edge computing expansion, and enterprise digital transformation initiatives.',
    '<h2>Market Growth Analysis</h2>
<p>According to a new report from Gartner, the global cloud computing market is on track to reach $1.5 trillion by 2028, representing a compound annual growth rate of 18.3% from 2024 levels.</p>
<h3>Key Growth Drivers</h3>
<ul>
    <li><strong>AI and Machine Learning:</strong> Training and inference workloads account for 35% of new cloud spending</li>
    <li><strong>Digital Transformation:</strong> 78% of enterprises have accelerated cloud migration plans</li>
    <li><strong>Edge Computing:</strong> Hybrid cloud-edge architectures growing at 42% CAGR</li>
    <li><strong>SaaS Expansion:</strong> Enterprise SaaS adoption expected to double by 2028</li>
</ul>
<blockquote>The convergence of AI and cloud computing is creating unprecedented demand for scalable infrastructure.</blockquote>
<p>The report also highlights that DCI Cloud Service is well-positioned to capture significant market share in the Asia-Pacific region, where cloud adoption is accelerating rapidly.</p>',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    5, 'Cloud Computing,Market Analysis,Digital Transformation', 'Alex Thompson', TRUE, FALSE, 654,
    '2026-05-24 16:00:00'
),

-- Article 6: AI & AI Models
(
    'Open Source AI Models Close the Gap with Proprietary Giants',
    'Llama 4 and Mistral-Next demonstrate that open-source models can compete with GPT-4 class systems',
    'The latest open-source large language models are achieving performance levels that rival proprietary systems. Meta''s Llama 4 and Mistral''s latest model are leading this new wave of accessible AI.',
    '<h2>The Open Source AI Revolution</h2>
<p>The gap between proprietary and open-source AI models has narrowed dramatically. Recent releases from Meta, Mistral, and the open-source community demonstrate that freely available models can achieve performance on par with the best commercial offerings.</p>
<h3>Leading Open Source Models (May 2026)</h3>
<ul>
    <li><strong>Llama 4 (70B):</strong> Outperforms GPT-4 on several reasoning benchmarks</li>
    <li><strong>Mistral-Next:</strong> State-of-the-art multilingual performance with efficient architecture</li>
    <li><strong>Qwen 3:</strong> Strong performance across Chinese and English language tasks</li>
    <li><strong>DeepSeek-R1:</strong> Innovative mixture-of-experts architecture with competitive results</li>
</ul>
<p>This democratization of AI technology means businesses of all sizes can now deploy sophisticated AI capabilities without being locked into expensive proprietary platforms. The open-source community continues to innovate at a remarkable pace.</p>',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
    2, 'Open Source,LLM,Meta,Mistral,AI Models', 'Sarah Johnson', TRUE, FALSE, 1200,
    '2026-05-23 10:00:00'
),

-- Article 7: Technology
(
    'Rust Overtakes C++ as the Language of Choice for Systems Programming',
    'Stack Overflow survey reveals Rust is now the most loved and fastest-growing systems language',
    'For the first time, Rust has overtaken C++ in the Stack Overflow Developer Survey as the most-admired systems programming language. Memory safety and developer experience are driving the shift.',
    '<h2>Rust''s Meteoric Rise</h2>
<p>The 2026 Stack Overflow Developer Survey confirms what many have suspected: Rust has become the premier systems programming language. With its unique combination of performance, memory safety, and developer experience, Rust is winning over developers from C and C++.</p>
<h3>Why Developers Are Switching</h3>
<ul>
    <li><strong>Memory Safety:</strong> Eliminates entire classes of security vulnerabilities at compile time</li>
    <li><strong>Developer Experience:</strong> Cargo package manager and helpful compiler error messages</li>
    <li><strong>Growing Ecosystem:</strong> Mature libraries for web, embedded, and cloud development</li>
    <li><strong>Industry Adoption:</strong> Used in the Linux kernel, Android, and AWS infrastructure</li>
</ul>
<p>Major tech companies including Google, Microsoft, and Amazon have publicly committed to increasing their use of Rust for critical infrastructure components. The language''s adoption in safety-critical systems signals a long-term industry shift.</p>',
    'https://images.unsplash.com/photo-1515879218367-8466d910auj92?w=800',
    4, 'Rust,Systems Programming,C++,Developer Survey', 'Emily Rodriguez', TRUE, FALSE, 945,
    '2026-05-22 13:00:00'
),

-- Article 8: AI Tools
(
    'Top 10 AI Tools Every Developer Should Know in 2026',
    'From code generation to automated testing, these AI tools are essential for modern development workflows',
    'Discover the must-have AI tools that are transforming software development in 2026. From intelligent code completion to automated testing and deployment, these tools can dramatically boost your productivity.',
    '<h2>Essential AI Developer Tools for 2026</h2>
<p>The landscape of AI-powered development tools has matured significantly. Here are ten tools that every developer should consider adding to their workflow.</p>
<h3>The Top 10</h3>
<ol>
    <li><strong>Claude Code:</strong> Terminal-based AI assistant with full codebase awareness</li>
    <li><strong>GitHub Copilot X:</strong> Next-gen code completion with context-aware suggestions</li>
    <li><strong>Cursor IDE:</strong> AI-first code editor with inline editing and generation</li>
    <li><strong>Codium AI:</strong> Automated test generation and code review</li>
    <li><strong>Continue.dev:</strong> Open-source AI code assistant for any IDE</li>
    <li><strong>Warp Terminal:</strong> AI-enhanced terminal with smart completions</li>
    <li><strong>Perplexity Code:</strong> AI-powered code search and documentation</li>
    <li><strong>Vercel v0:</strong> Generate UI components from natural language descriptions</li>
    <li><strong>CodeRabbit:</strong> AI code reviewer for pull requests</li>
    <li><strong>Sweep AI:</strong> Autonomous bug fixing and feature implementation</li>
</ol>
<blockquote>The best developers are not those who write the most code, but those who leverage the best tools to write better code faster.</blockquote>
<p>Integrating even a few of these tools can significantly improve development velocity and code quality. Start with one that addresses your most painful workflow bottleneck.</p>',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800',
    3, 'Developer Tools,AI,Productivity,Code Generation', 'David Kim', TRUE, FALSE, 1567,
    '2026-05-21 09:30:00'
)

ON CONFLICT DO NOTHING;
