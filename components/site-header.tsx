'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CartIndicator } from '@/components/cart-indicator';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/productos', label: 'Productos' },
  { href: '/pedidos', label: 'Pedidos' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#f0e3d0] bg-[#fffdf9]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b7653e] text-lg font-bold text-white shadow-sm">
              P
            </div>
            <div>
              <p className="text-lg font-semibold text-[#2a1d18]">Panadería</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8b6a4a]">Artesanal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5b4337] lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[#b7653e]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/admin"
              className="rounded-full border border-[#d9b98f] px-4 py-2 text-sm font-medium text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]"
            >
              Panel
            </Link>
            <CartIndicator />
            <Link
              href="/productos"
              className="hidden rounded-full border border-[#d9b98f] px-4 py-2 text-sm font-medium text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e] sm:inline-flex"
            >
              Ver catálogo
            </Link>
            <Link
              href="/formulario-pedido"
              className="inline-flex items-center justify-center rounded-full bg-[#b7653e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a8532d]"
            >
              Hacer pedido
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[#d9b98f] px-3 text-sm font-medium text-[#5b4337]"
            >
              {menuOpen ? 'Cerrar' : 'Menú'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-navigation" aria-label="Navegación principal" className="mt-3 grid gap-1 border-t border-[#f0e3d0] pt-3 text-sm font-medium text-[#5b4337] lg:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 transition hover:bg-[#fff8f0] hover:text-[#b7653e]">
                {item.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 transition hover:bg-[#fff8f0] hover:text-[#b7653e]">
              Panel
            </Link>
            <div className="flex min-h-11 items-center px-3" onClick={() => setMenuOpen(false)}>
              <CartIndicator />
            </div>
            <Link href="/productos" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 transition hover:bg-[#fff8f0] hover:text-[#b7653e]">
              Ver catálogo
            </Link>
            <Link href="/formulario-pedido" onClick={() => setMenuOpen(false)} className="mt-1 inline-flex min-h-11 items-center justify-center rounded-full bg-[#b7653e] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a8532d]">
              Hacer pedido
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
