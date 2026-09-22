-- Restrict one booked time to two total units, across all selected options.
create or replace function public.create_booking_cart_reservation(
  p_items jsonb,
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
  total_amount_cents integer,
  currency text,
  line_items jsonb
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cart_item jsonb;
  selected_item record;
  reserved_quantity integer;
  item_sku text;
  item_quantity integer;
  seen_skus text[] := '{}';
  cart_quantity integer := 0;
  new_request_id uuid;
  first_reservation_id uuid;
  new_reservation_id uuid;
  cart_total bigint := 0;
  cart_lines jsonb := '[]'::jsonb;
begin
  if p_cal_start_at <= now()
    or p_cal_end_at <= p_cal_start_at
    or p_cal_end_at > p_cal_start_at + interval '24 hours' then
    raise exception 'INVALID_SLOT' using errcode = 'P0001';
  end if;

  if p_service_slug not in ('skip-2-u', 'h2o-2-u')
    or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'INVALID_CART' using errcode = 'P0001';
  end if;

  if jsonb_array_length(p_items) not between 1 and 2 then
    raise exception 'INVALID_CART' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_items) as item
    where item->>'sku' = 'skip-rubbish-45'
  ) and (
    jsonb_array_length(p_items) <> 1
    or (p_items->0->>'quantity') <> '1'
  ) then
    raise exception 'LARGE_SKIP_ONE_PER_BOOKING' using errcode = 'P0001';
  end if;

  insert into public.customer_requests (
    request_kind, service_slug, inventory_sku, first_name, last_name,
    email, phone, street_address, address_line_2, city, postcode,
    preferred_date, preferred_time, message, details, consent_terms,
    status, cal_start_at, cal_end_at, cal_time_zone, payment_status
  ) values (
    'booking', p_service_slug, p_items->0->>'sku',
    left(trim(p_first_name), 80), left(trim(p_last_name), 80),
    left(lower(trim(p_email)), 254), left(trim(p_phone), 40),
    nullif(left(trim(p_street_address), 240), ''),
    nullif(left(trim(coalesce(p_address_line_2, '')), 240), ''),
    nullif(left(trim(p_city), 120), ''),
    nullif(left(trim(p_postcode), 20), ''),
    (p_cal_start_at at time zone p_cal_time_zone)::date,
    to_char(p_cal_start_at at time zone p_cal_time_zone, 'HH24:MI'),
    nullif(left(trim(coalesce(p_message, '')), 5000), ''),
    coalesce(p_details, '{}'::jsonb), true, 'pending',
    p_cal_start_at, p_cal_end_at, left(p_cal_time_zone, 100), 'pending'
  ) returning id into new_request_id;

  -- Stable SKU order prevents competing carts from deadlocking on item locks.
  for cart_item in
    select value from jsonb_array_elements(p_items) order by value->>'sku'
  loop
    item_sku := cart_item->>'sku';
    if item_sku is null or char_length(item_sku) > 100
      or coalesce(cart_item->>'quantity', '') !~ '^[1-9][0-9]?$' then
      raise exception 'INVALID_CART_ITEM' using errcode = 'P0001';
    end if;

    item_quantity := (cart_item->>'quantity')::integer;
    if item_quantity > 2 or item_sku = any(seen_skus) then
      raise exception 'INVALID_CART_ITEM' using errcode = 'P0001';
    end if;
    cart_quantity := cart_quantity + item_quantity;
    if cart_quantity > 2 then
      raise exception 'BOOKING_ITEM_LIMIT' using errcode = 'P0001';
    end if;
    seen_skus := array_append(seen_skus, item_sku);

    select item.sku, item.name, item.detail, item.price_cents, item.stock_quantity
    into selected_item
    from public.inventory_items as item
    where item.sku = item_sku
      and item.service_slug = p_service_slug
      and item.active
    for update;

    if not found then
      raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
    end if;

    select coalesce(sum(reservation.quantity), 0)::integer
    into reserved_quantity
    from public.stock_reservations as reservation
    where reservation.sku = item_sku
      and reservation.status = 'pending'
      and reservation.expires_at > now();

    if selected_item.stock_quantity - reserved_quantity < item_quantity then
      raise exception 'OUT_OF_STOCK' using errcode = 'P0001';
    end if;

    insert into public.stock_reservations (
      sku, quantity, status, customer_request_id, cal_start_at, cal_end_at,
      cal_time_zone, amount_cents, currency, expires_at
    ) values (
      item_sku, item_quantity, 'pending', new_request_id,
      p_cal_start_at, p_cal_end_at, left(p_cal_time_zone, 100),
      selected_item.price_cents, 'nzd', now() + interval '35 minutes'
    ) returning id into new_reservation_id;

    first_reservation_id := coalesce(first_reservation_id, new_reservation_id);
    cart_total := cart_total + selected_item.price_cents::bigint * item_quantity;
    cart_lines := cart_lines || jsonb_build_array(jsonb_build_object(
      'sku', item_sku,
      'name', selected_item.name,
      'detail', selected_item.detail,
      'unit_amount', selected_item.price_cents,
      'quantity', item_quantity
    ));
  end loop;

  if cart_total > 2147483647 then
    raise exception 'INVALID_CART_TOTAL' using errcode = 'P0001';
  end if;

  return query select first_reservation_id, new_request_id,
    cart_total::integer, 'nzd'::text, cart_lines;
end;
$$;
