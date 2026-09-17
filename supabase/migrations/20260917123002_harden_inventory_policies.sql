drop policy "public can view active inventory" on public.inventory_items;
drop policy "admins can view all inventory" on public.inventory_items;

create policy "anonymous can view active inventory" on public.inventory_items
for select to anon using (active);

create policy "authenticated users can view permitted inventory" on public.inventory_items
for select to authenticated using (active or (select private.is_admin()));

create policy "client roles cannot access reservations" on public.stock_reservations
for all to anon, authenticated using (false) with check (false);

create index admin_users_created_by_idx on public.admin_users (created_by) where created_by is not null;
create index inventory_items_updated_by_idx on public.inventory_items (updated_by) where updated_by is not null;
create index inventory_adjustments_changed_by_idx on public.inventory_adjustments (changed_by);

