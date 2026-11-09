'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore, useState } from 'react';
import { getCartSnapshot, parseCartSnapshot, subscribeToCart, writeCart, type CartItem } from '@/lib/cart-storage';

export function CartPage() {
  const [error, setError] = useState('');
  const snapshot = useSyncExternalStore(subscribeToCart, getCartSnapshot, () => '');
  const cartState = useMemo((): { items: CartItem[]; error: string } => {
    try {
      return { items: parseCartSnapshot(snapshot), error: '' };
    } catch (loadError) {
      return {
        items: [],
        error: loadError instanceof Error ? loadError.message : 'No se pudo leer el carrito.',
      };
    }
  }, [snapshot]);
  const items = cartState.items;

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  function updateQuantity(productId: string, quantity: number) {
    const updatedItems = quantity <= 0
      ? items.filter((item) => item.product.id !== productId)
      : items.map((item) => item.product.id === productId ? { ...item, quantity } : item);
    try {
      writeCart(updatedItems);
      setError('');
    } catch (writeError) {
      setError(writeError instanceof Error ? writeError.message : 'No se pudo actualizar el carrito.');
    }
  }

  return (
    <div className="page-shell py-16 text-[#2a1d18]">
      <div className="mb-8">
        <p className="section-tag">Carrito</p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Tu pedido actual</h1>
      </div>

      {(error || cartState.error) && <p role="alert" className="mb-6 rounded-2xl bg-[#fff0e8] p-4 text-sm text-[#9d4c2a]">{error || cartState.error}</p>}

      {items.length === 0 ? (
        <div className="rounded-[28px] border border-[#f1e3d0] bg-white p-10 text-center">
          <h2 className="text-2xl font-semibold">Tu carrito está vacío</h2>
          <p className="mt-3 text-[#5b4337]">Agrega productos del catálogo y aparecerán aquí.</p>
          <Link href="/productos" className="mt-6 inline-flex rounded-full bg-[#b7653e] px-6 py-3 text-sm font-semibold text-white">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            {items.map(({ product, quantity }) => (
              <article key={product.id} className="flex flex-col gap-4 rounded-[28px] border border-[#f1e3d0] bg-white p-5 shadow-[0_20px_50px_rgba(91,67,55,0.05)] sm:flex-row sm:items-center">
                <img src={product.image} alt="" loading="lazy" decoding="async" className="h-24 w-24 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-[#2a1d18]">{product.name}</h2>
                  <p className="mt-1 text-sm text-[#5b4337]">${product.price.toLocaleString('es-CL')} c/u</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" aria-label={`Quitar una unidad de ${product.name}`} onClick={() => updateQuantity(product.id, quantity - 1)} className="h-9 w-9 rounded-full border border-[#e6d3b9] text-lg text-[#5b4337]">−</button>
                  <span className="min-w-6 text-center text-lg font-semibold">{quantity}</span>
                  <button type="button" aria-label={`Agregar una unidad de ${product.name}`} onClick={() => updateQuantity(product.id, quantity + 1)} className="h-9 w-9 rounded-full border border-[#e6d3b9] text-lg text-[#5b4337]">+</button>
                </div>
                <p className="text-xl font-bold text-[#2a1d18]">${(product.price * quantity).toLocaleString('es-CL')}</p>
                <button type="button" onClick={() => updateQuantity(product.id, 0)} className="text-sm text-[#9d4c2a]">Eliminar</button>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-[28px] border border-[#f1e3d0] bg-[#fff8f0] p-6 shadow-[0_20px_50px_rgba(91,67,55,0.05)]">
            <h2 className="text-2xl font-semibold text-[#2a1d18]">Resumen</h2>
            <div className="mt-6 flex justify-between text-lg font-semibold text-[#2a1d18]">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#765b4a]">El costo de entrega y el pago se confirmarán en el siguiente paso.</p>
            <Link href="/formulario-pedido" className="mt-8 block rounded-full bg-[#b7653e] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#a8532d]">
              Continuar con la compra
            </Link>
            <Link href="/productos" className="mt-4 block text-center text-sm font-semibold text-[#8c4f2b]">Seguir comprando</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
