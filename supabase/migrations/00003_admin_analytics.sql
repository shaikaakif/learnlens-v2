-- Admin allowlist
CREATE TABLE IF NOT EXISTS admins (
    user_id UUID PRIMARY KEY, -- References auth.users(id), but we won't strictly enforce foreign key to avoid breaking on auth delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS to ensure only Service Role can query/modify it by default
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Nullable for anonymous events like app_open before login
    event_type TEXT NOT NULL,
    device_type TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- Enable RLS to ensure only Service Role can query/modify analytics by default
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
