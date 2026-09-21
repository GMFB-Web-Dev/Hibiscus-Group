drop function if exists public.complete_inventory_reservation(uuid);
drop function if exists public.reserve_inventory(text, integer);

create or replace function public.extend_inventory_reservation(
  p_reservation_id uuid,
  p_checkout_session_id text
)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  update public.stock_reservations
  set expires_at = greatest(expires_at, now() + interval '7 days')
  where id = p_reservation_id
    and status = 'pending'
    and stripe_checkout_session_id = p_checkout_session_id;

  return found;
end;
$$;

create or replace function public.release_expired_inventory()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  released_count integer;
begin
  with released as (
    update public.stock_reservations
    set status = 'released',
        released_at = now()
    where status = 'pending'
      and expires_at <= now()
    returning customer_request_id
  ), updated_requests as (
    update public.customer_requests as request
    set status = 'cancelled',
        payment_status = 'failed',
        updated_at = now()
    from released
    where request.id = released.customer_request_id
      and request.payment_status <> 'paid'
    returning request.id
  )
  select count(*)::integer into released_count from released;

  return released_count;
end;
$$;

revoke all on function public.extend_inventory_reservation(uuid, text) from public, anon, authenticated;
revoke all on function public.release_expired_inventory() from public, anon, authenticated;
grant execute on function public.extend_inventory_reservation(uuid, text) to service_role;
grant execute on function public.release_expired_inventory() to service_role;
