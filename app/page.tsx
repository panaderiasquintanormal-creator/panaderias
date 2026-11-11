import Link from 'next/link';
import { promos, testimonials } from '@/lib/data';
import { getCatalogCategories, getCatalogProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCatalogCategories(), getCatalogProducts()]);
  const featuredProducts = products.filter((product) => product.featured).slice(0, 3);

  return (
    <div className="bg-[#fffaf4] pb-10 text-[#2a1d18]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,222,177,0.75),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(183,101,62,0.12),_transparent_30%)]" />
        <div className="page-shell relative grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <span className="section-tag">Panadería artesanal</span>
            <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-[#2a1d18] sm:text-5xl lg:text-6xl">
              Deliciosos panes y tortas para cada momento especial.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5b4337]">
              Preparamos productos frescos con masa madre, ingredientes selectos y un servicio cálido pensado para familias, celebraciones y desayunos inolvidables.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/productos" className="rounded-full bg-[#b7653e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a8532d]">
                Explorar catálogo
              </Link>
              <Link href="/formulario-pedido" className="rounded-full border border-[#d9b98f] bg-white px-6 py-3 text-sm font-semibold text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]">
                Hacer pedido
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#f1e3d0] bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-bold text-[#2a1d18]">+12k</p>
                <p className="mt-1 text-sm text-[#7a5d4d]">Pedidos</p>
              </div>
              <div className="rounded-2xl border border-[#f1e3d0] bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-bold text-[#2a1d18]">8 yrs</p>
                <p className="mt-1 text-sm text-[#7a5d4d]">Experiencia</p>
              </div>
              <div className="rounded-2xl border border-[#f1e3d0] bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-bold text-[#2a1d18]">4.9</p>
                <p className="mt-1 text-sm text-[#7a5d4d]">Valoración</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-10 h-20 w-20 rounded-full bg-[#f1d9a8] blur-2xl" />
            <div className="absolute -right-6 bottom-8 h-28 w-28 rounded-full bg-[#d6815d]/20 blur-3xl" />
            <div className="overflow-hidden rounded-[32px] border border-[#f1e3d0] bg-white p-3 shadow-[0_25px_70px_rgba(98,64,47,0.13)]">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80"
                alt="Pan artesanal fresco"
                fetchPriority="high"
                decoding="async"
                className="h-[500px] w-full rounded-[24px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-tag">Categorías</p>
            <h2 className="mt-4 text-3xl font-bold text-[#2a1d18]">Explora nuestras especialidades</h2>
          </div>
          <Link href="/productos" className="hidden text-sm font-semibold text-[#b7653e] sm:inline-flex">
            Ver todos los productos →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.slice(0, 4).map((category) => (
            <article key={category.id} className="overflow-hidden rounded-[28px] border border-[#f1e3d0] bg-white shadow-[0_16px_40px_rgba(62,41,32,0.04)] transition hover:-translate-y-1">
              <img src={category.image} alt={category.name} loading="lazy" decoding="async" className="h-52 w-full object-cover" />
              <div className="space-y-3 p-5">
                <h3 className="text-xl font-semibold text-[#2a1d18]">{category.name}</h3>
                <p className="text-sm leading-6 text-[#5b4337]">{category.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f9efe6] py-16">
        <div className="page-shell">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-tag">Productos destacados</p>
              <h2 className="mt-4 text-3xl font-bold text-[#2a1d18]">Lo más pedido esta semana</h2>
            </div>
            <Link href="/productos" className="hidden text-sm font-semibold text-[#b7653e] sm:inline-flex">
              Ver catálogo completo →
            </Link>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <p className="section-tag">Cómo funciona</p>
        <h2 className="mt-4 text-3xl font-bold text-[#2a1d18]">Un proceso simple para ordenar en minutos</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ['1', 'Selecciona tus productos', 'Elige entre pan artesanal, tortas, bollería y más.'],
            ['2', 'Personaliza y agenda', 'Define fecha, hora, envío o retiro en la opción más conveniente.'],
            ['3', 'Paga y recibe confirmación', 'Confirma tu pedido con pago parcial o total y recibe la señalización por WhatsApp.'],
          ].map(([step, title, description]) => (
            <div key={step} className="rounded-[28px] border border-[#f1e3d0] bg-white p-6 shadow-[0_20px_50px_rgba(91,67,55,0.06)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1d9a8] text-xl font-bold text-[#563a2d]">{step}</div>
              <h3 className="mt-5 text-xl font-semibold text-[#2a1d18]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5b4337]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#2a1d18] py-16 text-[#f6e9d9]">
        <div className="page-shell">
          <p className="section-tag bg-[#4a2b20] text-[#f0d7b0]">Opiniones</p>
          <h2 className="mt-4 text-3xl font-bold text-white">La confianza de quienes ya lo probaron</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-[28px] border border-[#4b3127] bg-[#382922] p-6">
                <div className="mb-4 text-lg text-[#f0d7b0]">★★★★★</div>
                <p className="text-base leading-8 text-[#f3e5d4]">“{item.text}”</p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#d9af7e]">{item.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[30px] border border-[#f1e3d0] bg-[#fff8f0] p-8 shadow-[0_20px_45px_rgba(91,67,55,0.06)]">
            <p className="section-tag">Promociones</p>
            <h2 className="mt-4 text-3xl font-bold text-[#2a1d18]">Además, tenemos descuentos para ti</h2>
            <ul className="mt-6 space-y-4">
              {promos.map((promo) => (
                <li key={promo} className="flex items-start gap-3 rounded-2xl border border-[#f1e3d0] bg-white p-4 text-[#5b4337]">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#b7653e]" />
                  <span>{promo}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[30px] border border-[#f1e3d0] bg-white p-8 shadow-[0_20px_45px_rgba(91,67,55,0.06)]">
            <p className="section-tag">Contacto</p>
            <h2 className="mt-4 text-3xl font-bold text-[#2a1d18]">Atención cercana y WhatsApp</h2>
            <div className="mt-6 space-y-4 text-[#5b4337]">
              <p><strong>Dirección:</strong> Av. Carrascal 1234, Santiago</p>
              <p><strong>Horario:</strong> Lun a Sáb • 07:00 - 13:30</p>
              <p><strong>Horario:</strong> Lun a Sáb • 16:00 - 19:30</p>
              <p><strong>Horario:</strong> Domingo   • 08:00 - 13:30</p>
              <p><strong>Teléfono:</strong> +56 9 1234 5678</p>
              <p><strong>Email:</strong> hola@panaderiaejemplo.cl</p>
            </div>
            <div className="mt-6 flex gap-3">
              <a href="https://wa.me/56912345678" target="_blank" rel="noreferrer" className="rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1fa957]">
                Chatea por WhatsApp
              </a>
              <Link href="/pedidos" className="rounded-full border border-[#d9b98f] px-5 py-3 text-sm font-semibold text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]">
                Ver carrito
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
