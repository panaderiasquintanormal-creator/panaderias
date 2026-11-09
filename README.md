# Panadería [Nombre]

Plataforma web artesanal para una panadería premium con catálogo, carrito, pedido, pago, confirmación y panel administrativo.

## Tecnologías

- Next.js 16 + App Router
- TypeScript
- Tailwind CSS

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Estructura principal

- `app/page.tsx`: inicio con hero, categorías, promociones y testimonios.
- `app/productos/page.tsx`: catálogo de productos.
- `app/productos/[slug]/page.tsx`: detalle de producto.
- `app/pedidos/page.tsx`: resumen del carrito.
- `app/formulario-pedido/page.tsx`: formulario de pedido.
- `app/pago/page.tsx`: flujo de pago.
- `app/confirmacion/page.tsx`: confirmación final.
- `app/admin/page.tsx`: dashboard administrativo.

## Estado actual

El catálogo y el panel administrativo usan Supabase. El checkout registra clientes, pedidos y pagos en Supabase, y Khipu crea y verifica los cobros en su API de pagos instantáneos v3.

## Acceso al panel administrativo

1. Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
2. Ejecuta `supabase/schema.sql`, `supabase/admin-policies.sql` y `supabase/khipu-payment.sql` en Supabase.
3. Configura en el servidor `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` y `KHIPU_CREDENTIALS_ENCRYPTION_KEY`. Genera esta última con `openssl rand -base64 32`; no la cambies después de guardar credenciales, porque son necesarias para descifrarlas. Nunca uses el prefijo `NEXT_PUBLIC_` para secretos.
4. Crea el usuario desde Supabase Dashboard > Authentication > Users y define una contraseña. Cualquier usuario que inicie sesión correctamente con Supabase Authentication tiene acceso al panel.
5. Inicia sesión desde `/admin/login`, abre **Pagos** y guarda la API key y el secreto de firma de notificaciones entregados por Khipu. El panel solo muestra el estado de configuración; las claves cifradas no se devuelven al navegador.

No agregues una `service_role` key al frontend ni a variables `NEXT_PUBLIC_*`.

El panel ofrece resumen basado en pedidos, altas/edición/bajas de productos y categorías, actualización de estados y configuración de pagos. La integración usa [`POST /v3/payments` de Khipu](https://docs.khipu.com/apis/v3/instant-payments/openapi/other/postpayment.md), verifica las notificaciones mediante la firma HMAC de Khipu y consulta la API de Khipu antes de confirmar pedidos. La URL pública del sitio debe ser HTTPS y accesible por Khipu para recibir notificaciones.

Las imágenes de categoría se suben a Supabase Storage al guardar y se conserva la URL pública en `categories.image_url`; también se pueden ingresar URLs existentes. Las operaciones se guardan en Supabase y reportan errores de permisos o validación en pantalla.

Para instalaciones anteriores, ejecuta también `supabase/admin-policies.sql` después de aplicar esta migración de índices y políticas.

## Rendimiento e interacción

- El catálogo público se cachea durante un minuto y se invalida al modificar productos o categorías desde el panel.
- La búsqueda, filtros por categoría y orden de productos se actualizan en el navegador sin volver a consultar Supabase.
- El carrito se guarda localmente y permite cambiar cantidades antes de continuar.
- Las imágenes secundarias usan carga diferida y las consultas del dashboard se limitan a métricas y pedidos recientes.
