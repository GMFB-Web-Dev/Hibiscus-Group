alter table public.customer_requests
  add column if not exists cal_booking_uid text,
  add column if not exists cal_start_at timestamptz,
  add column if not exists cal_end_at timestamptz,
  add column if not exists cal_time_zone text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists payment_status text not null default 'not_required',
  add column if not exists paid_at timestamptz;

alter table public.stock_reservations
  add column if not exists customer_request_id uuid,
  add column if not exists cal_booking_uid text,
  add column if not exists cal_start_at timestamptz,
  add column if not exists cal_end_at timestamptz,
  add column if not exists cal_time_zone text,
  add column if not exists amount_cents integer,
  add column if not exists currency text not null default 'nzd';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_requests_cal_booking_uid_key'
      and conrelid = 'public.customer_requests'::regclass
  ) then
    alter table public.customer_requests
      add constraint customer_requests_cal_booking_uid_key unique (cal_booking_uid);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_requests_stripe_checkout_session_id_key'
      and conrelid = 'public.customer_requests'::regclass
  ) then
    alter table public.customer_requests
      add constraint customer_requests_stripe_checkout_session_id_key unique (stripe_checkout_session_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_requests_stripe_payment_intent_id_key'
      and conrelid = 'public.customer_requests'::regclass
  ) then
    alter table public.customer_requests
      add constraint customer_requests_stripe_payment_intent_id_key unique (stripe_payment_intent_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_requests_payment_status_check'
      and conrelid = 'public.customer_requests'::regclass
  ) then
    alter table public.customer_requests
      add constraint customer_requests_payment_status_check
      check (payment_status = any (array['not_required', 'pending', 'paid', 'failed', 'refunded']));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stock_reservations_customer_request_id_fkey'
      and conrelid = 'public.stock_reservations'::regclass
  ) then
    alter table public.stock_reservations
      add constraint stock_reservations_customer_request_id_fkey
      foreign key (customer_request_id) references public.customer_requests(id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stock_reservations_customer_request_id_key'
      and conrelid = 'public.stock_reservations'::regclass
  ) then
    alter table public.stock_reservations
      add constraint stock_reservations_customer_request_id_key unique (customer_request_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stock_reservations_cal_booking_uid_key'
      and conrelid = 'public.stock_reservations'::regclass
  ) then
    alter table public.stock_reservations
      add constraint stock_reservations_cal_booking_uid_key unique (cal_booking_uid);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stock_reservations_amount_cents_check'
      and conrelid = 'public.stock_reservations'::regclass
  ) then
    alter table public.stock_reservations
      add constraint stock_reservations_amount_cents_check
      check (amount_cents is null or amount_cents > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stock_reservations_currency_check'
      and conrelid = 'public.stock_reservations'::regclass
  ) then
    alter table public.stock_reservations
      add constraint stock_reservations_currency_check
      check (currency = lower(currency) and char_length(currency) = 3);
  end if;
end $$;

create index if not exists stock_reservations_active_sku_expires_idx
  on public.stock_reservations (sku, expires_at)
  where status = 'pending';

create index if not exists customer_requests_created_at_idx
  on public.customer_requests (created_at desc);

create or replace function public.get_available_inventory()
returns table (
  sku text,
  service_slug text,
  name text,
  detail text,
  price_cents integer,
  stock_quantity integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    item.sku,
    item.service_slug,
    item.name,
    item.detail,
    item.price_cents,
    greatest(item.stock_quantity - coalesce(reserved.quantity, 0), 0)::integer as stock_quantity
  from public.inventory_items as item
  left join (
    select reservation.sku, sum(reservation.quantity)::integer as quantity
    from public.stock_reservations as reservation
    where reservation.status = 'pending'
      and reservation.expires_at > now()
    group by reservation.sku
  ) as reserved on reserved.sku = item.sku
  where item.active
    and item.stock_quantity - coalesce(reserved.quantity, 0) > 0
  order by item.price_cents, item.name;
$$;

create or replace function public.create_booking_reservation(
  p_sku text,
  p_service_slug text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_street_address text,
  p_address_line_2 text,
  p_city text,
  p_postcode text,
  p_cal_start_at timestamptz,
  p_cal_end_at timestamptz,
  p_cal_time_zone text,
  p_message text default null,
  p_details jsonb default '{}'::jsonb
)
returns table (
  reservation_id uuid,
  request_id uuid,
  item_name text,
  item_detail text,
  amount_cents integer,
  currency text,
  available_after_reservation integer
)
language plpgsql
set search_path = ''
as $$
declare
  selected_item record;
  reserved_quantity integer;
  new_request_id uuid;
  new_reservation_id uuid;
begin
  if p_cal_start_at <= now()
    or p_cal_end_at <= p_cal_start_at
    or p_cal_end_at > p_cal_start_at + interval '24 hours' then
    raise exception 'INVALID_SLOT' using errcode = 'P0001';
  end if;

  select item.sku, item.name, item.detail, item.price_cents, item.stock_quantity
    into selected_item
  from public.inventory_items as item
  where item.sku = p_sku
    and item.service_slug = p_service_slug
    and item.active
  for update;

  if not found then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  select coalesce(sum(reservation.quantity), 0)::integer
    into reserved_quantity
  from public.stock_reservations as reservation
  where reservation.sku = p_sku
    and reservation.status = 'pending'
    and reservation.expires_at > now();

  if selected_item.stock_quantity - reserved_quantity < 1 then
    raise exception 'OUT_OF_STOCK' using errcode = 'P0001';
  end if;

  insert into public.customer_requests (
    request_kind,
    service_slug,
    inventory_sku,
    first_name,
    last_name,
    email,
    phone,
    street_address,
    address_line_2,
    city,
    postcode,
    preferred_date,
    preferred_time,
    message,
    details,
    consent_terms,
    status,
    cal_start_at,
    cal_end_at,
    cal_time_zone,
    payment_status
  ) values (
    'booking',
    p_service_slug,
    p_sku,
    left(trim(p_first_name), 80),
    left(trim(p_last_name), 80),
    left(lower(trim(p_email)), 254),
    left(trim(p_phone), 40),
    nullif(left(trim(p_street_address), 240), ''),
    nullif(left(trim(coalesce(p_address_line_2, '')), 240), ''),
    nullif(left(trim(p_city), 120), ''),
    nullif(left(trim(p_postcode), 20), ''),
    (p_cal_start_at at time zone p_cal_time_zone)::date,
    to_char(p_cal_start_at at time zone p_cal_time_zone, 'HH24:MI'),
    nullif(left(trim(coalesce(p_message, '')), 5000), ''),
    coalesce(p_details, '{}'::jsonb),
    true,
    'pending',
    p_cal_start_at,
    p_cal_end_at,
    left(p_cal_time_zone, 100),
    'pending'
  ) returning id into new_request_id;

  insert into public.stock_reservations (
    sku,
    quantity,
    status,
    customer_request_id,
    cal_start_at,
    cal_end_at,
    cal_time_zone,
    amount_cents,
    currency,
    expires_at
  ) values (
    p_sku,
    1,
    'pending',
    new_request_id,
    p_cal_start_at,
    p_cal_end_at,
    left(p_cal_time_zone, 100),
    selected_item.price_cents,
    'nzd',
    now() + interval '35 minutes'
  ) returning id into new_reservation_id;

  return query select
    new_reservation_id,
    new_request_id,
    selected_item.name::text,
    selected_item.detail::text,
    selected_item.price_cents::integer,
    'nzd'::text,
    (selected_item.stock_quantity - reserved_quantity - 1)::integer;
end;
$$;

create or replace function public.attach_cal_booking_to_reservation(
  p_reservation_id uuid,
  p_cal_booking_uid text
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  request_id uuid;
begin
  update public.stock_reservations
  set cal_booking_uid = p_cal_booking_uid
  where id = p_reservation_id
    and status = 'pending'
  returning customer_request_id into request_id;

  if not found then
    return false;
  end if;

  update public.customer_requests
  set cal_booking_uid = p_cal_booking_uid,
      updated_at = now()
  where id = request_id;

  return true;
end;
$$;

create or replace function public.attach_checkout_to_reservation(
  p_reservation_id uuid,
  p_checkout_session_id text
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  request_id uuid;
begin
  update public.stock_reservations
  set stripe_checkout_session_id = p_checkout_session_id
  where id = p_reservation_id
    and status = 'pending'
  returning customer_request_id into request_id;

  if not found then
    return false;
  end if;

  update public.customer_requests
  set stripe_checkout_session_id = p_checkout_session_id,
      payment_status = 'pending',
      updated_at = now()
  where id = request_id;

  return true;
end;
$$;

create or replace function public.complete_inventory_reservation(
  p_reservation_id uuid,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_amount_total integer,
  p_currency text
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  reservation record;
begin
  select * into reservation
  from public.stock_reservations
  where id = p_reservation_id
  for update;

  if not found then
    return false;
  end if;

  if reservation.status = 'completed' then
    return true;
  end if;

  if reservation.status <> 'pending'
    or reservation.stripe_checkout_session_id is distinct from p_checkout_session_id
    or reservation.amount_cents is distinct from p_amount_total
    or reservation.currency is distinct from lower(p_currency) then
    return false;
  end if;

  update public.inventory_items
  set stock_quantity = stock_quantity - reservation.quantity
  where sku = reservation.sku
    and stock_quantity >= reservation.quantity;

  if not found then
    raise exception 'INSUFFICIENT_STOCK_AT_FULFILLMENT' using errcode = 'P0001';
  end if;

  update public.stock_reservations
  set status = 'completed',
      completed_at = now()
  where id = reservation.id;

  update public.customer_requests
  set status = 'confirmed',
      payment_status = 'paid',
      stripe_payment_intent_id = nullif(p_payment_intent_id, ''),
      paid_at = now(),
      updated_at = now()
  where id = reservation.customer_request_id;

  return true;
end;
$$;

create or replace function public.release_inventory_reservation(
  p_reservation_id uuid
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  request_id uuid;
begin
  update public.stock_reservations
  set status = 'released',
      released_at = now()
  where id = p_reservation_id
    and status = 'pending'
  returning customer_request_id into request_id;

  if not found then
    return false;
  end if;

  update public.customer_requests
  set status = 'cancelled',
      payment_status = 'failed',
      updated_at = now()
  where id = request_id
    and payment_status <> 'paid';

  return true;
end;
$$;

revoke all on function public.get_available_inventory() from public;
grant execute on function public.get_available_inventory() to anon, authenticated, service_role;

revoke all on function public.create_booking_reservation(text, text, text, text, text, text, text, text, text, text, timestamptz, timestamptz, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.attach_cal_booking_to_reservation(uuid, text) from public, anon, authenticated;
revoke all on function public.attach_checkout_to_reservation(uuid, text) from public, anon, authenticated;
revoke all on function public.complete_inventory_reservation(uuid, text, text, integer, text) from public, anon, authenticated;
revoke all on function public.release_inventory_reservation(uuid) from public, anon, authenticated;

grant execute on function public.create_booking_reservation(text, text, text, text, text, text, text, text, text, text, timestamptz, timestamptz, text, text, jsonb) to service_role;
grant execute on function public.attach_cal_booking_to_reservation(uuid, text) to service_role;
grant execute on function public.attach_checkout_to_reservation(uuid, text) to service_role;
grant execute on function public.complete_inventory_reservation(uuid, text, text, integer, text) to service_role;
grant execute on function public.release_inventory_reservation(uuid) to service_role;
