-- Enable extensions for search
create extension if not exists pg_trgm;
create extension if not exists vector; -- Optional for future embedding use

-- 1. MARKETS
create table public.markets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FLYERS (Encartes)
create type flyer_status as enum ('received', 'processing', 'review_needed', 'published', 'archived', 'failed');

create table public.flyers (
  id uuid default gen_random_uuid() primary key,
  market_id uuid not null references public.markets(id) on delete cascade,
  pdf_path text not null, -- Path in Supabase Storage
  upload_date timestamp with time zone default timezone('utc'::text, now()) not null,
  valid_from date,
  valid_until date,
  status flyer_status default 'received',
  processing_error text
);

-- 3. FLYER ITEMS (Produtos extraídos)
create table public.flyer_items (
  id uuid default gen_random_uuid() primary key,
  flyer_id uuid not null references public.flyers(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade, -- Denormalized for query speed
  
  -- Raw extraction data
  raw_name text not null, -- O que a IA leu
  raw_price_text text, -- O texto do preço original
  
  -- Normalized data
  clean_name text, -- "Arroz Soltinho" -> "Arroz"
  brand text, -- "Tio João"
  price numeric(10, 2),
  unit text, -- "kg", "un", "L", "g"
  quantity numeric(10, 3), -- 500 (gramas), 1 (litro)
  
  -- Promo details
  promo_text text, -- "Leve 3 Pague 2"
  is_club_price boolean default false,
  
  -- Search & Reliability
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(clean_name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(brand, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(raw_name, '')), 'C')
  ) STORED,
  
  confidence_score numeric(3, 2) default 0.0, -- 0.00 to 1.00
  needs_review boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_flyer_items_market_id on public.flyer_items(market_id);
create index idx_flyer_items_search on public.flyer_items using GIN(search_vector);
create index idx_flyer_items_clean_name_trgm on public.flyer_items using gin (clean_name gin_trgm_ops); -- For fuzzy search

-- RLS Policies (Row Level Security)
alter table public.markets enable row level security;
alter table public.flyers enable row level security;
alter table public.flyer_items enable row level security;

-- Public Read Access
create policy "Public markets are viewable by everyone" on public.markets for select using (true);
create policy "Published items are viewable by everyone" on public.flyer_items for select using (true); -- Maybe filter by status logic later

-- Admin Write Access (You can refine this with auth.uid() later)
-- For MVP, assuming service_role or specific admin user
create policy "Admins can do everything on markets" on public.markets for all using (auth.role() = 'authenticated'); -- Simplification
create policy "Admins can do everything on flyers" on public.flyers for all using (auth.role() = 'authenticated');
create policy "Admins can do everything on flyer_items" on public.flyer_items for all using (auth.role() = 'authenticated');
