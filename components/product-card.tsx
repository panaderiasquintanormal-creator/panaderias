import Link from 'next/link';
import { AddToCartButton } from '@/components/add-to-cart-button';
import type { Product } from '@/lib/data';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-[#f1e3d0] bg-white shadow-[0_20px_50px_rgba(91,67,55,0.08)] transition hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(91,67,55,0.12)]">
      <div className="relative">
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="h-56 w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-[#f2d8ad] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#563a2d]">
          {product.badge}
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#9b7759]">{product.category}</p>
            <h3 className="mt-2 text-xl font-semibold text-[#2a1d18]">{product.name}</h3>
          </div>
          <span className="rounded-full bg-[#f8f0e5] px-2.5 py-1 text-sm font-semibold text-[#b7653e]">
            {product.stock}
          </span>
        </div>
        <p className="text-sm leading-6 text-[#5b4337]">{product.description}</p>
        <div className="flex items-center justify-between border-t border-[#f3e7db] pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#8f6c52]">Precio</p>
            <p className="text-2xl font-bold text-[#2a1d18]">${product.price.toLocaleString('es-CL')}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/productos/${product.slug}`}
              className="rounded-full border border-[#d8b999] px-3 py-2 text-sm font-medium text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]"
            >
              Ver detalle
            </Link>
            <AddToCartButton
              product={product}
              className="rounded-full bg-[#b7653e] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#a8532d]"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
