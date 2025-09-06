-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Latest technology news and updates'),
  ('Business', 'business', 'Business and finance news'),
  ('Sports', 'sports', 'Sports news and updates'),
  ('Entertainment', 'entertainment', 'Entertainment and celebrity news'),
  ('Health', 'health', 'Health and wellness news'),
  ('Science', 'science', 'Scientific discoveries and research'),
  ('Politics', 'politics', 'Political news and analysis'),
  ('World', 'world', 'International news and events')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample RSS sources
INSERT INTO rss_sources (name, url, category_id) VALUES
  ('TechCrunch', 'https://techcrunch.com/feed/', (SELECT id FROM categories WHERE slug = 'technology')),
  ('BBC Business', 'http://feeds.bbci.co.uk/news/business/rss.xml', (SELECT id FROM categories WHERE slug = 'business')),
  ('ESPN', 'https://www.espn.com/espn/rss/news', (SELECT id FROM categories WHERE slug = 'sports')),
  ('BBC World', 'http://feeds.bbci.co.uk/news/world/rss.xml', (SELECT id FROM categories WHERE slug = 'world'))
ON CONFLICT (url) DO NOTHING;

-- Insert default ad placements
INSERT INTO ad_placements (name, position, ad_code) VALUES
  ('Header Banner', 'header', '<!-- Header Ad Code -->'),
  ('Sidebar Ad', 'sidebar', '<!-- Sidebar Ad Code -->'),
  ('In-Article Ad', 'in-article', '<!-- In-Article Ad Code -->'),
  ('Footer Ad', 'footer', '<!-- Footer Ad Code -->')
ON CONFLICT DO NOTHING;
