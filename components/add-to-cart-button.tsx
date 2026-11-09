'use client';

import { useState } from 'react';
import type { Product } from '@/lib/data';
import { readCart, writeCart } from '@/lib/cart-storage';

export function AddToCartButton({ product, className }: { product: Product; className?: string }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function addToCart() {
    setError('');
    try {
      const items = readCart();
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) existing.quantity += 1;
      else items.push({ product, quantity: 1 });
      writeCart(items);
      setMessage('Agregado ✓');
      window.setTimeout(() => setMessage(''), 1600);
    } catch {
      setError('No se pudo guardar el carrito en este navegador.');
    }
  }

  return (
    <div>
      <button type="button" onClick={addToCart} className={className}>
        {message || 'Agregar'}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-[#9d4c2a]">{error}</p>}
    </div>
  );
}
