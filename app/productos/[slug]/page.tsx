import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { getCatalogProducts } from '@/lib/catalog';

async function ProductDetailContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getCatalogProducts();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="page-shell py-16 text-[#2a1d18]">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[32px] border border-[#f1e3d0] bg-white p-3 shadow-[0_25px_60px_rgba(91,67,55,0.08)]">
          <img src={product.image} alt={product.name} fetchPriority="high" decoding="async" className="h-[540px] w-full rounded-[24px] object-cover" />
        </div>

        <div>
          <span className="rounded-full bg-[#f1d9a8] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#563a2d]">{product.badge}</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#2a1d18]">{product.name}</h1>
          <p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#8a664d]">{product.category}</p>
          <p className="mt-5 text-lg leading-8 text-[#5b4337]">{product.description}</p>

          <div className="mt-6 flex items-end justify-between gap-4 rounded-[24px] border border-[#f1e3d0] bg-[#fff8f0] p-5">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[#8a664d]">Precio</p>
              <p className="mt-2 text-4xl font-bold text-[#2a1d18]">${product.price.toLocaleString('es-CL')}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6b4d38]">{product.stock}</span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <AddToCartButton
              product={product}
              className="w-full rounded-full bg-[#b7653e] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#a8532d]"
            />
            <Link href="/formulario-pedido" className="rounded-full border border-[#d9b98f] px-5 py-3 text-center text-sm font-semibold text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]">
              Pedir ahora
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#f1e3d0] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#2a1d18]">Ingredientes</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#5b4337]">
                {product.ingredients.map((ingredient) => (
                  <li key={ingredient}>• {ingredient}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] border border-[#f1e3d0] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#2a1d18]">Alérgenos</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#5b4337]">
                {product.allergens.map((allergen) => (
                  <li key={allergen}>• {allergen}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-[#f1e3d0] bg-[#fff8f0] p-5 text-[#5b4337]">
            <p><strong>Tiempo de preparación:</strong> {product.prepTime}</p>
            <p className="mt-2"><strong>Recomendación:</strong> Ideal para compartir en desayunos, reuniones o celebraciones pequeñas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="page-shell py-20 text-[#5b4337]">Cargando producto…</div>}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
