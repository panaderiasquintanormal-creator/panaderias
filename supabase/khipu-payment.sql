create table if not exists public.khipu_credentials (
  id smallint primary key default 1 check (id = 1),
  credentials_ciphertext text not null,
  updated_at timestamptz not null default now()
);

alter table public.khipu_credentials enable row level security;

revoke all on public.khipu_credentials from public, anon, authenticated;
grant all on public.khipu_credentials to service_role;
