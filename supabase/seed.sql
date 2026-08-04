-- Development seed data is intentionally separate from the production schema.
insert into public.sources (name, listing_url, is_active)
values
  ('Reuters', 'https://www.reuters.com/', true),
  ('Fox News', 'https://www.foxnews.com/', true),
  ('BBC', 'https://www.bbc.com/news', true),
  ('The New York Times', 'https://www.nytimes.com/', true),
  ('CNN', 'https://www.cnn.com/', true)
on conflict (name) do update
set
  listing_url = excluded.listing_url,
  is_active = true,
  updated_at = now();

