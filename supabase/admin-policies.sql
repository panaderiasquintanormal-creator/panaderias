alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.schedule_blocks enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated using (true);
drop policy if exists categories_admin_manage on public.categories;
create policy categories_admin_manage on public.categories for all to authenticated using (true) with check (true);

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated using (true);
drop policy if exists products_admin_manage on public.products;
create policy products_admin_manage on public.products for all to authenticated using (true) with check (true);

drop policy if exists customers_admin_manage on public.customers;
create policy customers_admin_manage on public.customers for all to authenticated using (true) with check (true);
drop policy if exists orders_admin_manage on public.orders;
create policy orders_admin_manage on public.orders for all to authenticated using (true) with check (true);
drop policy if exists order_items_admin_manage on public.order_items;
create policy order_items_admin_manage on public.order_items for all to authenticated using (true) with check (true);
drop policy if exists payments_admin_manage on public.payments;
create policy payments_admin_manage on public.payments for all to authenticated using (true) with check (true);
drop policy if exists schedule_blocks_admin_manage on public.schedule_blocks;
create policy schedule_blocks_admin_manage on public.schedule_blocks for all to authenticated using (true) with check (true);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status_created_at on public.orders(status, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'category-images',
  'category-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists category_images_public_read on storage.objects;
create policy category_images_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'category-images');

drop policy if exists category_images_authenticated_upload on storage.objects;
create policy category_images_authenticated_upload
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'category-images');

drop policy if exists category_images_authenticated_update on storage.objects;
create policy category_images_authenticated_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'category-images')
  with check (bucket_id = 'category-images');

drop policy if exists category_images_authenticated_delete on storage.objects;
create policy category_images_authenticated_delete
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'category-images');
