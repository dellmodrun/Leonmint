create table if not exists public.leonmint_ca (
  slug text primary key,
  mint text,
  updated_at timestamptz not null default now(),
  constraint leonmint_ca_mint_format check (mint is null or mint ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$')
);

alter table public.leonmint_ca enable row level security;

drop policy if exists leonmint_ca_public_read on public.leonmint_ca;
create policy leonmint_ca_public_read on public.leonmint_ca
  for select to anon, authenticated using (true);

grant select on public.leonmint_ca to anon, authenticated;
revoke insert, update, delete on public.leonmint_ca from anon, authenticated;

insert into public.leonmint_ca (slug, mint)
values ('official', null)
on conflict (slug) do nothing;
