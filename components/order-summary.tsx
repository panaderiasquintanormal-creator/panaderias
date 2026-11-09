'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { getCartSnapshot, parseCartSnapshot, subscribeToCart } from '@/lib/cart-storage';

function useOrderCart() {
  const snapshot = useSyncExternalStore(subscribeToCart, getCartSnapshot, () => '');

  return useMemo(() => {
    try {
      const items = parseCartSnapshot(snapshot);
      return {
        items,
        error: '',
        total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      };
    } catch (loadError) {
      return {
        items: [],
        error: loadError instanceof Error ? loadError.message : 'No se pudo leer el carrito.',
        total: 0,
      };
    }
  }, [snapshot]);
}

function formatPrice(amount: number) {
  return `$${amount.toLocaleString('es-CL')}`;
}

export function OrderSummary({
  title = 'Resumen del pedido',
  nextStepHref,
  nextStepLabel = 'Continuar',
  submitLabel,
}: {
  title?: string;
  nextStepHref?: string;
  nextStepLabel?: string;
  submitLabel?: string;
}) {
  const { items, error, total } = useOrderCart();

  return (
    <>
      <h2 className="text-2xl font-semibold text-[#2a1d18]">{title}</h2>

      {error ? (
        <p role="alert" className="mt-6 rounded-2xl bg-[#fff0e8] p-4 text-sm text-[#9d4c2a]">{error}</p>
      ) : items.length === 0 ? (
        <div className="mt-6 text-sm text-[#5b4337]">
          <p>Tu carrito está vacío. Agrega productos para continuar con el pedido.</p>
          <Link href="/productos" className="mt-4 inline-block font-semibold text-[#8c4f2b]">Explorar productos</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4 text-[#5b4337]">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between gap-4">
                <span>{product.name} × {quantity}</span>
                <span className="shrink-0">{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-[#ecdcc3] pt-4 text-lg font-semibold text-[#2a1d18]">
              <span>Total de productos</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#765b4a]">
            El costo de entrega, si corresponde, se confirmará por separado y no está incluido.
          </p>

          {nextStepHref && (
            <Link href={nextStepHref} className="mt-8 block rounded-full bg-[#b7653e] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#a8532d]">
              {nextStepLabel}
            </Link>
          )}
        </>
      )}

      {submitLabel && (
        <button
          type="submit"
          disabled={items.length === 0 || Boolean(error)}
          className="mt-8 block w-full rounded-full bg-[#b7653e] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#a8532d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      )}
    </>
  );
}
