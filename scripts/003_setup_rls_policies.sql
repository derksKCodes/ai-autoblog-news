-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published articles" ON articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

-- Admin access policies
CREATE POLICY "Admins can manage all articles" ON articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage RSS sources" ON rss_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage ad placements" ON ad_placements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage content queue" ON content_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can update their own profile" ON admin_users
  FOR UPDATE USING (id = auth.uid());

-- Newsletter subscription policies (public can subscribe)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscriptions" ON newsletter_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );
