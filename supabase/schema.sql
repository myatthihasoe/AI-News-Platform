-- Biasly's server-only persistence schema.
-- Clerk remains the authentication provider; browser roles receive no table access.

create table if not exists public.sources (
  id bigint generated always as identity primary key,
  name text not null,
  listing_url text not null,
  parser_strategy jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sources_name_nonempty check (btrim(name) <> ''),
  constraint sources_listing_url_nonempty check (btrim(listing_url) <> ''),
  constraint sources_name_key unique (name),
  constraint sources_listing_url_key unique (listing_url)
);

create table if not exists public.articles (
  id bigint generated always as identity primary key,
  source_id bigint not null references public.sources(id) on delete restrict,
  original_url text not null,
  canonical_url text not null,
  slug text not null,
  title text not null,
  image_url text not null,
  image_alt text,
  author text,
  category text,
  region text,
  published_at timestamptz not null,
  raw_text text not null,
  read_time_minutes smallint,
  scraped_at timestamptz not null default now(),
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_original_url_nonempty check (btrim(original_url) <> ''),
  constraint articles_canonical_url_nonempty check (btrim(canonical_url) <> ''),
  constraint articles_slug_nonempty check (btrim(slug) <> ''),
  constraint articles_title_nonempty check (btrim(title) <> ''),
  constraint articles_image_url_nonempty check (btrim(image_url) <> ''),
  constraint articles_raw_text_nonempty check (btrim(raw_text) <> ''),
  constraint articles_read_time_positive check (read_time_minutes is null or read_time_minutes > 0),
  constraint articles_original_url_key unique (original_url),
  constraint articles_canonical_url_key unique (canonical_url),
  constraint articles_slug_key unique (slug)
);

create table if not exists public.article_analyses (
  id bigint generated always as identity primary key,
  article_id bigint not null references public.articles(id) on delete cascade,
  summary text not null,
  sentiment_score numeric(4, 3) not null,
  sentiment_label text not null,
  left_percentage smallint not null,
  center_percentage smallint not null,
  right_percentage smallint not null,
  bias_score numeric(4, 3) generated always as (
    ((right_percentage - left_percentage)::numeric / 100)
  ) stored,
  bias_label text not null,
  confidence numeric(4, 3) not null,
  framing_notes text not null,
  loaded_terms text[] not null default '{}'::text[],
  disclaimer text not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_analyses_article_id_key unique (article_id),
  constraint article_analyses_summary_nonempty check (btrim(summary) <> ''),
  constraint article_analyses_sentiment_score_range check (sentiment_score between -1 and 1),
  constraint article_analyses_sentiment_label_check check (
    sentiment_label in ('positive', 'neutral', 'negative')
  ),
  constraint article_analyses_left_percentage_range check (left_percentage between 0 and 100),
  constraint article_analyses_center_percentage_range check (center_percentage between 0 and 100),
  constraint article_analyses_right_percentage_range check (right_percentage between 0 and 100),
  constraint article_analyses_percentage_total check (
    left_percentage + center_percentage + right_percentage = 100
  ),
  constraint article_analyses_bias_label_check check (
    bias_label in ('left', 'center', 'right', 'mixed', 'unclear')
  ),
  constraint article_analyses_confidence_range check (confidence between 0 and 1),
  constraint article_analyses_framing_notes_nonempty check (btrim(framing_notes) <> ''),
  constraint article_analyses_disclaimer_nonempty check (btrim(disclaimer) <> ''),
  constraint article_analyses_model_nonempty check (btrim(model) <> '')
);

create table if not exists public.logs (
  id bigint generated always as identity primary key,
  level text not null,
  event_type text not null,
  message text not null,
  source_id bigint references public.sources(id) on delete set null,
  article_id bigint references public.articles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint logs_level_check check (level in ('debug', 'info', 'warn', 'error')),
  constraint logs_event_type_nonempty check (btrim(event_type) <> ''),
  constraint logs_message_nonempty check (btrim(message) <> '')
);

create table if not exists public.oxylabs_schedules (
  id bigint generated always as identity primary key,
  source_id bigint not null references public.sources(id) on delete restrict,
  oxylabs_schedule_id text not null,
  state text not null default 'active',
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oxylabs_schedules_source_id_key unique (source_id),
  constraint oxylabs_schedules_remote_id_key unique (oxylabs_schedule_id),
  constraint oxylabs_schedules_remote_id_nonempty check (btrim(oxylabs_schedule_id) <> ''),
  constraint oxylabs_schedules_state_check check (state in ('active', 'inactive', 'error'))
);

create table if not exists public.oxylabs_schedule_runs (
  id bigint generated always as identity primary key,
  schedule_id bigint not null references public.oxylabs_schedules(id) on delete restrict,
  oxylabs_run_id text not null,
  oxylabs_job_id text not null,
  result_status text not null default 'pending',
  processing_status text not null default 'pending',
  summary jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oxylabs_schedule_runs_run_id_nonempty check (btrim(oxylabs_run_id) <> ''),
  constraint oxylabs_schedule_runs_job_id_nonempty check (btrim(oxylabs_job_id) <> ''),
  constraint oxylabs_schedule_runs_result_status_check check (
    result_status in ('pending', 'done', 'faulted')
  ),
  constraint oxylabs_schedule_runs_processing_status_check check (
    processing_status in ('pending', 'processing', 'processed', 'failed')
  ),
  constraint oxylabs_schedule_runs_schedule_job_key unique (schedule_id, oxylabs_job_id)
);

create index if not exists sources_active_name_idx
  on public.sources (name)
  where is_active;

create index if not exists articles_source_published_at_idx
  on public.articles (source_id, published_at desc);

create index if not exists articles_published_at_idx
  on public.articles (published_at desc);

create index if not exists articles_pending_analysis_idx
  on public.articles (created_at, id)
  where analyzed_at is null;

create index if not exists logs_source_id_idx
  on public.logs (source_id)
  where source_id is not null;

create index if not exists logs_article_id_idx
  on public.logs (article_id)
  where article_id is not null;

create index if not exists logs_level_created_at_idx
  on public.logs (level, created_at desc);

create index if not exists oxylabs_schedule_runs_schedule_created_at_idx
  on public.oxylabs_schedule_runs (schedule_id, created_at desc);

create index if not exists oxylabs_schedule_runs_pending_idx
  on public.oxylabs_schedule_runs (created_at, id)
  where processing_status in ('pending', 'processing');

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.article_analyses enable row level security;
alter table public.logs enable row level security;
alter table public.oxylabs_schedules enable row level security;
alter table public.oxylabs_schedule_runs enable row level security;

revoke all on table
  public.sources,
  public.articles,
  public.article_analyses,
  public.logs,
  public.oxylabs_schedules,
  public.oxylabs_schedule_runs
from anon, authenticated;

revoke all on sequence
  public.sources_id_seq,
  public.articles_id_seq,
  public.article_analyses_id_seq,
  public.logs_id_seq,
  public.oxylabs_schedules_id_seq,
  public.oxylabs_schedule_runs_id_seq
from anon, authenticated;

grant usage on schema public to service_role;

grant select, insert, update on table
  public.sources,
  public.articles,
  public.article_analyses,
  public.oxylabs_schedules,
  public.oxylabs_schedule_runs
to service_role;

grant select, insert on table public.logs to service_role;

grant usage, select on sequence
  public.sources_id_seq,
  public.articles_id_seq,
  public.article_analyses_id_seq,
  public.logs_id_seq,
  public.oxylabs_schedules_id_seq,
  public.oxylabs_schedule_runs_id_seq
to service_role;
