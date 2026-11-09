import Link from 'next/link';

const links = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/pagos', label: 'Pagos' },
];

export function AdminNavigation() {
  return (
    <nav aria-label="Administración" className="mb-8 flex flex-wrap gap-3 border-b border-[#f0e3d0] pb-5">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="rounded-full border border-[#d9b98f] bg-white px-4 py-2 text-sm font-medium text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
