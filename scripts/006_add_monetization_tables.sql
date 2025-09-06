-- Create affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    original_url TEXT NOT NULL,
    affiliate_url TEXT NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    network VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL, -- 'ad', 'affiliate', 'subscription'
    source_id UUID, -- Reference to ad_placement or affiliate_link
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create monetization settings table
CREATE TABLE IF NOT EXISTS monetization_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add click tracking for affiliate links
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add ad performance tracking
CREATE TABLE IF NOT EXISTS ad_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_placement_id UUID REFERENCES ad_placements(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ad_placement_id, date)
);

-- Enable RLS on new tables
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE monetization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_performance ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliate links
CREATE POLICY "Admins can manage affiliate links" ON affiliate_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS policies for revenue tracking
CREATE POLICY "Admins can manage revenue tracking" ON revenue_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS policies for monetization settings
CREATE POLICY "Admins can manage monetization settings" ON monetization_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS policies for affiliate clicks (insert only for tracking)
CREATE POLICY "Anyone can track affiliate clicks" ON affiliate_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view affiliate clicks" ON affiliate_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS policies for ad performance
CREATE POLICY "Admins can manage ad performance" ON ad_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Insert default monetization settings
INSERT INTO monetization_settings (setting_key, setting_value, description) VALUES
    ('google_adsense_publisher_id', '', 'Google AdSense Publisher ID'),
    ('amazon_associate_tag', '', 'Amazon Associates Tag'),
    ('auto_insert_ads', 'true', 'Automatically insert ads in articles'),
    ('ads_per_article', '3', 'Maximum number of ads per article'),
    ('affiliate_disclosure', 'This post contains affiliate links. We may earn a commission if you make a purchase through these links.', 'Affiliate disclosure text')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_links_active ON affiliate_links(is_active);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_date ON revenue_tracking(transaction_date);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_link_date ON affiliate_clicks(affiliate_link_id, clicked_at);
CREATE INDEX IF NOT EXISTS idx_ad_performance_date ON ad_performance(ad_placement_id, date);

-- Function to update affiliate link click count
CREATE OR REPLACE FUNCTION update_affiliate_click_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE affiliate_links 
    SET click_count = click_count + 1 
    WHERE id = NEW.affiliate_link_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update click count
CREATE TRIGGER trigger_update_affiliate_click_count
    AFTER INSERT ON affiliate_clicks
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_click_count();
