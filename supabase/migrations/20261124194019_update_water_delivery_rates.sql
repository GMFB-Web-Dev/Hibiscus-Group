begin;

-- A blank rate leaves any existing price for that area and load size in place.
with rates (area_slug, area_name, litres_5000, litres_10000, litres_15000, litres_20000) as (
  values
    ('albany', 'Albany', 250, 275, 400, 500),
    ('algies-bay', 'Algies Bay', null, 350, 525, 650),
    ('coatesville', 'Coatesville', 250, 275, 400, 500),
    ('dairy-flat', 'Dairy Flat', 250, 275, 400, 500),
    ('greenhithe', 'Greenhithe', 250, 275, 400, 500),
    ('helensville', 'Helensville', null, 350, 525, 650),
    ('huapai', 'Huapai', null, 350, 525, 650),
    ('kaipara-flats', 'Kaipara Flats', null, 375, 550, 700),
    ('kaukapakapa', 'Kaukapakapa', null, 325, 475, 600),
    ('kumeu', 'Kumeu', null, 350, 525, 650),
    ('mahurangi-east', 'Mahurangi East', null, 350, 525, 650),
    ('mahurangi-west', 'Mahurangi West', null, 350, 525, 650),
    ('makarau', 'Makarau', null, 425, null, null),
    ('matakana', 'Matakana', null, 350, 525, 650),
    ('millwater', 'Millwater', 250, 275, 400, 500),
    ('okura-river', 'Okura River', 250, 375, 400, 500),
    ('omaha', 'Omaha', null, 350, 525, 650),
    ('paremoremo', 'Paremoremo', 250, 275, 400, 500),
    ('puhoi', 'Puhoi', null, 350, 525, 650),
    ('riverhead', 'Riverhead', null, 275, 400, 500),
    ('silverdale', 'Silverdale', 250, 275, 400, 500),
    ('snells-beach', 'Snells Beach', null, 350, 525, 650),
    ('south-head', 'South Head', null, 450, 650, 800),
    ('stillwater', 'Stillwater', 250, 275, 400, 500),
    ('tawharanui-peninsula', 'Tawharanui Peninsula', null, 350, 525, 650),
    ('taupaki', 'Taupaki', null, 350, 525, 650),
    ('waimauku', 'Waimauku', null, 350, 525, 650),
    ('wainui', 'Wainui', 250, 275, 400, 500),
    ('waitoki', 'Waitoki', 250, 275, 400, 500),
    ('waiwera', 'Waiwera', null, 325, 475, 650),
    ('warkworth', 'Warkworth', null, 350, 525, 650),
    ('wellsford', 'Wellsford', null, 425, null, null),
    ('whangaparaoa', 'Whangaparaoa', null, 250, 325, 425)
)
insert into public.inventory_items as item (sku, service_slug, name, detail, price_cents, stock_quantity, active)
select
  'h2o-' || rates.area_slug || '-' || load.litres,
  'h2o-2-u',
  load.label || ' litres to ' || rates.area_name,
  'Bulk water delivery',
  load.price_nzd * 100,
  5,
  true
from rates
cross join lateral (values
  (5000, '5,000', rates.litres_5000),
  (10000, '10,000', rates.litres_10000),
  (15000, '15,000', rates.litres_15000),
  (20000, '20,000', rates.litres_20000)
) as load (litres, label, price_nzd)
where load.price_nzd is not null
order by 1
on conflict (sku) do update
set price_cents = excluded.price_cents,
    active = item.active or excluded.sku like '%-5000',
    updated_at = now()
where item.service_slug = 'h2o-2-u';

-- Keep retired SKUs for past orders and for a future switch back to 6,000 L.
update public.inventory_items
set active = false,
    updated_at = now()
where service_slug = 'h2o-2-u'
  and sku like 'h2o-%-6000'
  and active;

commit;
