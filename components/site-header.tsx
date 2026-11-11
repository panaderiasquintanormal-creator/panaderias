import Link from 'next/link';
import { CartIndicator } from '@/components/cart-indicator';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/productos', label: 'Productos' },
  { href: '/pedidos', label: 'Pedidos' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#f0e3d0] bg-[#fffdf9]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b7653e] text-lg font-bold text-white shadow-sm">
            P
          </div>
          <div>
            <p className="text-lg font-semibold text-[#2a1d18]">Panadería</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b6a4a]">Artesanal</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#5b4337] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#b7653e]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
