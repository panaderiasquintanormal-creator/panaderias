insert into public.categories (id, name, description, image_url)
values
  ('7af8d3c0-6ddf-41d6-9f8d-7c2d2142367b', 'Pan artesanal', 'Harina, masa madre y tradición en cada pieza.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'),
  ('0ff7260d-ef88-4eb0-9ba1-801b44c86f1d', 'Pasteles', 'Repostería suave con sabores que enamoran.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80'),
  ('b8fec197-7d45-4d53-bc2c-9db6df9c1df0', 'Tortas personalizadas', 'Diseños únicos para celebraciones y momentos especiales.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80'),
  ('3a8e8d44-0b4e-4d91-8f38-93e2dd1974c3', 'Bollería', 'Texturas doradas y rellenos irresistibles.', 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80')
on conflict (id) do nothing;

insert into public.products (slug, name, category_id, description, ingredients, allergens, price, badge, featured, image_url, stock_status, prep_time)
values
  ('pan-masa-madre', 'Pan de masa madre', '7af8d3c0-6ddf-41d6-9f8d-7c2d2142367b', 'Pan casero con miga suave y corteza dorada, horneado con masa madre natural.', '["Harina de trigo","Masa madre","Agua","Sal"]', '["Gluten"]', 3800, 'Más vendido', true, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', 'Disponible hoy', '2 horas'),
  ('croissant-clasico', 'Croissant clásico', '3a8e8d44-0b4e-4d91-8f38-93e2dd1974c3', 'Capas hojaldradas y doradas, ideales para un desayuno gourmet.', '["Harina","Mantequilla","Levadura","Leche"]', '["Gluten","Lácteos"]', 2600, 'Nuevo', true, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80', '12 unidades', '90 minutos'),
  ('torta-cumpleanos', 'Torta de cumpleaños', 'b8fec197-7d45-4d53-bc2c-9db6df9c1df0', 'Torta de vainilla con capas de crema, decorada a medida para tu celebración.', '["Huevos","Harina","Leche","Crema","Frutas"]', '["Gluten","Lácteos","Huevos"]', 48900, 'Oferta', true, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80', 'Pedido especial', '24 horas'),
  ('galletas-avena', 'Galletas de avena y miel', '3a8e8d44-0b4e-4d91-8f38-93e2dd1974c3', 'Crujientes por fuera y suaves por dentro, con un toque de miel natural.', '["Avena","Miel","Harina","Canela"]', '["Gluten","Sésamo"]', 4200, 'Más vendido', false, 'https://images.unsplash.com/photo-1499636136210-6d4ee1b0f4be?auto=format&fit=crop&w=900&q=80', '18 paquetes', '45 minutos')
on conflict (slug) do nothing;

insert into public.customers (id, name, last_name, email, phone, address)
values
  ('0d44c3f5-93d8-4ee8-b27d-8b8d9f6f4dbf', 'Valentina', 'Silva', 'valentina@correo.com', '+56912345678', 'Av. Providencia 1234'),
  ('2902d56e-f77e-4f40-82c8-b4d3d24405fd', 'Francisco', 'Díaz', 'francisco@correo.com', '+56987654321', 'Los Aromos 567')
on conflict (id) do nothing;

insert into public.orders (id, order_number, customer_id, status, delivery_type, delivery_date, delivery_time, subtotal, discount, shipping, total, payment_type, payment_status, notes)
values
  ('6f3bbff4-5a8a-4e6d-b1f2-6f7d4e1b4b20', 'PED-1001', '0d44c3f5-93d8-4ee8-b27d-8b8d9f6f4dbf', 'pending_payment', 'pickup', '2026-11-10', '11:30', 48000, 0, 0, 48000, 'partial', 'unpaid', 'Pedido de cumpleaños con mensaje personalizado'),
  ('9d69cd8b-c4ff-4ceb-b631-0d964be2bc44', 'PED-1002', '2902d56e-f77e-4f40-82c8-b4d3d24405fd', 'paid', 'delivery', '2026-11-09', '09:30', 25000, 1500, 2500, 26000, 'full', 'paid', 'Entrega en la mañana')
on conflict (id) do nothing;

insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, total)
select '6f3bbff4-5a8a-4e6d-b1f2-6f7d4e1b4b20'::uuid, p.id, p.name, 1, p.price, p.price
from public.products p where p.slug = 'torta-cumpleanos'
union all
select '9d69cd8b-c4ff-4ceb-b631-0d964be2bc44'::uuid, p.id, p.name, 2, p.price, p.price*2
from public.products p where p.slug = 'pan-masa-madre';

insert into public.payments (order_id, provider, payment_method, amount, status, metadata)
values
  ('6f3bbff4-5a8a-4e6d-b1f2-6f7d4e1b4b20', 'manual', 'transferencia', 24000, 'pending', '{"partial": true}'),
  ('9d69cd8b-c4ff-4ceb-b631-0d964be2bc44', 'manual', 'webpay', 26000, 'paid', '{"invoice": "INV-2241"}')
on conflict do nothing;

insert into public.schedule_blocks (date, slot_start, slot_end, capacity, is_blocked, reason)
values
  ('2026-11-10', '09:00', '10:00', 2, false, null),
  ('2026-11-10', '11:00', '12:00', 1, false, null),
  ('2026-11-10', '15:00', '16:00', 3, true, 'Mantenimiento estacional')
on conflict do nothing;

insert into public.admin_users (email, name, role)
values
  ('admin@panaderiaejemplo.cl', 'Administrador', 'admin')
on conflict (email) do nothing;
