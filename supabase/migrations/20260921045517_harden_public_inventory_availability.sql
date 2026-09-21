alter function public.get_available_inventory() security invoker;

revoke all on table public.stock_reservations from anon, authenticated;
grant select (sku, quantity, status, expires_at)
  on table public.stock_reservations
  to anon, authenticated;

drop policy if exists "public can read active reservation quantities" on public.stock_reservations;
create policy "public can read active reservation quantities"
  on public.stock_reservations
  for select
  to anon, authenticated
  using (status = 'pending' and expires_at > now());

comment on policy "public can read active reservation quantities" on public.stock_reservations is
  'Exposes only non-sensitive quantity columns granted above so public stock counts can subtract active holds.';
