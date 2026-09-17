create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table private.admin_invites (
  email text primary key check (email = lower(email)),
  display_name text not null,
  created_at timestamptz not null default now()
);

insert into private.admin_invites (email, display_name)
values ('team@weblaunch.co.nz', 'Hibiscus Group Admin')
on conflict (email) do update set display_name = excluded.display_name;

create table public.inventory_items (
  sku text primary key,
  service_slug text not null check (service_slug in ('skip-2-u', 'h2o-2-u')),
  name text not null,
  detail text not null,
  price_cents integer not null check (price_cents > 0),
  stock_quantity integer not null default 5 check (stock_quantity >= 0),
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  sku text not null references public.inventory_items(sku),
  quantity integer not null default 1 check (quantity > 0),
  status text not null default 'pending' check (status in ('pending', 'completed', 'released')),
  stripe_checkout_session_id text unique,
  expires_at timestamptz not null default (now() + interval '35 minutes'),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  released_at timestamptz
);

create index stock_reservations_pending_expiry_idx on public.stock_reservations (expires_at) where status = 'pending';
create index stock_reservations_sku_idx on public.stock_reservations (sku);

create table public.inventory_adjustments (
  id bigint generated always as identity primary key,
  sku text not null references public.inventory_items(sku),
  previous_stock integer not null,
  new_stock integer not null,
  changed_by uuid not null references auth.users(id) on delete restrict,
  changed_at timestamptz not null default now()
);

create index inventory_adjustments_sku_changed_at_idx on public.inventory_adjustments (sku, changed_at desc);

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid()) and active
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.grant_invited_admin()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.admin_users (user_id, email, display_name)
  select new.id, lower(new.email), invite.display_name
  from private.admin_invites as invite
  where invite.email = lower(new.email)
  on conflict (user_id) do update
    set email = excluded.email, display_name = excluded.display_name, active = true;
  return new;
end;
$$;

revoke all on function private.grant_invited_admin() from public, anon, authenticated;

create trigger grant_invited_admin_after_auth_signup
after insert or update of email on auth.users
for each row execute function private.grant_invited_admin();

insert into public.admin_users (user_id, email, display_name)
select users.id, lower(users.email), invites.display_name
from auth.users as users
join private.admin_invites as invites on invites.email = lower(users.email)
where users.email is not null
on conflict (user_id) do update
  set email = excluded.email, display_name = excluded.display_name, active = true;

create or replace function private.set_inventory_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_inventory_updated_at() from public, anon, authenticated;

create trigger set_inventory_updated_at before update on public.inventory_items
for each row execute function private.set_inventory_updated_at();

create or replace function private.audit_manual_stock_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor uuid := (select auth.uid());
begin
  if new.stock_quantity is distinct from old.stock_quantity and actor is not null then
    insert into public.inventory_adjustments (sku, previous_stock, new_stock, changed_by)
    values (new.sku, old.stock_quantity, new.stock_quantity, actor);
  end if;
  return new;
end;
$$;

revoke all on function private.audit_manual_stock_change() from public, anon, authenticated;

create trigger audit_manual_stock_change after update of stock_quantity on public.inventory_items
for each row execute function private.audit_manual_stock_change();

alter table public.admin_users enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_reservations enable row level security;
alter table public.inventory_adjustments enable row level security;

create policy "admins can read their own role" on public.admin_users
for select to authenticated using (user_id = (select auth.uid()) and active);

create policy "public can view active inventory" on public.inventory_items
for select to anon, authenticated using (active);

create policy "admins can view all inventory" on public.inventory_items
for select to authenticated using ((select private.is_admin()));

create policy "admins can update inventory" on public.inventory_items
for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "admins can read inventory audit" on public.inventory_adjustments
for select to authenticated using ((select private.is_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.inventory_items to anon, authenticated;
grant update (stock_quantity, active, updated_by) on public.inventory_items to authenticated;
grant select on public.admin_users, public.inventory_adjustments to authenticated;
revoke all on public.stock_reservations from anon, authenticated;
revoke insert, update, delete on public.admin_users from anon, authenticated;
revoke insert, update, delete on public.inventory_adjustments from anon, authenticated;

insert into public.inventory_items (sku, service_slug, name, detail, price_cents, stock_quantity)
values
  ('skip-rubbish-2', 'skip-2-u', '2m³ Cubic Mini Skip', 'Rubbish · 450kg limit', 23500, 5),
  ('skip-rubbish-3', 'skip-2-u', '3m³ Standard Mini Skip', 'Rubbish · 600kg limit', 28500, 5),
  ('skip-rubbish-45', 'skip-2-u', '4.5m³ Large Mini Skip', 'Rubbish · 700kg limit', 33500, 5),
  ('skip-hardfill-2', 'skip-2-u', '2m³ Cubic Mini Skip', 'Hard fill · concrete, bricks or soil', 23500, 5),
  ('skip-hardfill-3', 'skip-2-u', '3m³ Standard Mini Skip', 'Hard fill · clean fill only', 28500, 5)
on conflict (sku) do update set
  service_slug = excluded.service_slug,
  name = excluded.name,
  detail = excluded.detail,
  price_cents = excluded.price_cents;

with areas (area, slug, prices) as (
  values
    ('Albany', 'albany', array[24000, 24000, 34000, 44000]),
    ('Kaukapakapa', 'kaukapakapa', array[29000, 29000, 39000, 46000]),
    ('Makarau', 'makarau', array[35000, 35000, 43000, 55000]),
    ('Gulf Harbour', 'gulf-harbour', array[35000, 35000, 49000, 59000]),
    ('Puhoi', 'puhoi', array[29000, 29000, 36000, 48000]),
    ('Whangaparaoa', 'whangaparaoa', array[20000, 21000, 26000, 36000]),
    ('Waiwera', 'waiwera', array[26000, 26000, 36000, 46000]),
    ('Stanmore Bay', 'stanmore-bay', array[26000, 26000, 36000, 46000]),
    ('Dairy Flat', 'dairy-flat', array[26000, 26000, 36000, 46000])
), water_products as (
  select
    'h2o-' || area.slug || '-' || item.litres::text as sku,
    'h2o-2-u'::text as service_slug,
    to_char(item.litres, 'FM999,999') || ' litres to ' || area.area as name,
    'Bulk water delivery'::text as detail,
    item.price_cents,
    5 as stock_quantity
  from areas as area
  cross join lateral unnest(array[6000, 10000, 15000, 20000], area.prices) as item(litres, price_cents)
)
insert into public.inventory_items (sku, service_slug, name, detail, price_cents, stock_quantity)
select sku, service_slug, name, detail, price_cents, stock_quantity from water_products
on conflict (sku) do update set
  service_slug = excluded.service_slug,
  name = excluded.name,
  detail = excluded.detail,
  price_cents = excluded.price_cents;

create or replace function public.release_expired_inventory()
returns integer language plpgsql security invoker set search_path = ''
as $$
declare released record; released_count integer := 0;
begin
  for released in
    update public.stock_reservations
    set status = 'released', released_at = now()
    where status = 'pending' and expires_at <= now()
    returning sku, quantity
  loop
    update public.inventory_items set stock_quantity = stock_quantity + released.quantity where sku = released.sku;
    released_count := released_count + 1;
  end loop;
  return released_count;
end;
$$;

create or replace function public.reserve_inventory(p_sku text, p_quantity integer default 1)
returns uuid language plpgsql security invoker set search_path = ''
as $$
declare reservation_id uuid;
begin
  if p_quantity < 1 then raise exception 'INVALID_QUANTITY' using errcode = '22023'; end if;
  perform public.release_expired_inventory();
  update public.inventory_items
  set stock_quantity = stock_quantity - p_quantity
  where sku = p_sku and active and stock_quantity >= p_quantity;
  if not found then raise exception 'OUT_OF_STOCK' using errcode = 'P0001'; end if;
  insert into public.stock_reservations (sku, quantity) values (p_sku, p_quantity)
  returning id into reservation_id;
  return reservation_id;
end;
$$;

create or replace function public.attach_checkout_to_reservation(p_reservation_id uuid, p_checkout_session_id text)
returns boolean language plpgsql security invoker set search_path = ''
as $$
begin
  update public.stock_reservations set stripe_checkout_session_id = p_checkout_session_id
  where id = p_reservation_id and status = 'pending';
  return found;
end;
$$;

create or replace function public.complete_inventory_reservation(p_reservation_id uuid)
returns boolean language plpgsql security invoker set search_path = ''
as $$
begin
  update public.stock_reservations set status = 'completed', completed_at = now()
  where id = p_reservation_id and status = 'pending';
  return found;
end;
$$;

create or replace function public.release_inventory_reservation(p_reservation_id uuid)
returns boolean language plpgsql security invoker set search_path = ''
as $$
declare released record;
begin
  update public.stock_reservations set status = 'released', released_at = now()
  where id = p_reservation_id and status = 'pending'
  returning sku, quantity into released;
  if not found then return false; end if;
  update public.inventory_items set stock_quantity = stock_quantity + released.quantity where sku = released.sku;
  return true;
end;
$$;

revoke all on function public.release_expired_inventory() from public, anon, authenticated;
revoke all on function public.reserve_inventory(text, integer) from public, anon, authenticated;
revoke all on function public.attach_checkout_to_reservation(uuid, text) from public, anon, authenticated;
revoke all on function public.complete_inventory_reservation(uuid) from public, anon, authenticated;
revoke all on function public.release_inventory_reservation(uuid) from public, anon, authenticated;
grant execute on function public.release_expired_inventory() to service_role;
grant execute on function public.reserve_inventory(text, integer) to service_role;
grant execute on function public.attach_checkout_to_reservation(uuid, text) to service_role;
grant execute on function public.complete_inventory_reservation(uuid) to service_role;
grant execute on function public.release_inventory_reservation(uuid) to service_role;

