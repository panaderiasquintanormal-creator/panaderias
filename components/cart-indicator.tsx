'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readCart, subscribeToCart } from '@/lib/cart-storage';

export function CartIndicator() {
  const [count, setCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      try {
        setCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
        setHasError(false);
      } catch {
        setHasError(true);
      }
    };
    updateCount();
    return subscribeToCart(updateCount);
  }, []);

  return (
    <Link
      href="/pedidos"
      aria-label={hasError ? 'Carrito con error' : `Carrito, ${count} productos`}
      className="rounded-full border border-[#d9b98f] px-4 py-2 text-sm font-medium text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]"
    >
      <span className="hidden sm:inline">Carrito</span>
      <span aria-hidden="true" className="sm:hidden">🛒</span>
      <span className="ml-1 rounded-full bg-[#f2d8ad] px-2 py-0.5 text-xs font-semibold">{hasError ? '!' : count}</span>
    </Link>
  );
}
