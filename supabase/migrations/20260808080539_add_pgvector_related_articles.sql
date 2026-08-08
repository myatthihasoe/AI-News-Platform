create extension if not exists vector with schema extensions;

alter table public.article_analyses
  add column if not exists embedding extensions.vector(1536);

create index if not exists article_analyses_embedding_ivfflat_idx
  on public.article_analyses
  using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 100)
  where embedding is not null;

create or replace function public.match_related_articles(
  p_article_id bigint,
  p_query_embedding extensions.vector(1536),
  p_match_count integer default 5
)
returns table (
  id bigint,
  slug text,
  title text,
  image_url text,
  image_alt text,
  category text,
  region text,
  published_at timestamptz,
  read_time_minutes smallint,
  source_id bigint,
  source_name text,
  source_logo_url text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    article.id,
    article.slug,
    article.title,
    article.image_url,
    article.image_alt,
    article.category,
    article.region,
    article.published_at,
    article.read_time_minutes,
    source.id as source_id,
    source.name as source_name,
    source.logo_url as source_logo_url,
    (1 - (analysis.embedding <=> p_query_embedding))::double precision as similarity
  from public.article_analyses as analysis
  inner join public.articles as article on article.id = analysis.article_id
  inner join public.sources as source on source.id = article.source_id
  where analysis.embedding is not null
    and article.analyzed_at is not null
    and article.id <> p_article_id
  order by analysis.embedding <=> p_query_embedding, article.id
  limit least(greatest(coalesce(p_match_count, 5), 0), 5);
$$;

revoke all on function public.match_related_articles(bigint, extensions.vector, integer)
  from public, anon, authenticated;

grant execute on function public.match_related_articles(bigint, extensions.vector, integer)
  to service_role;
