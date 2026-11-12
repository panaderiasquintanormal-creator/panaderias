import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-[#2a1d18] text-[#f5ebdf]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d6a06a] font-bold text-[#2a1d18]">
              P
            </div>
            <div>
              <p className="text-lg font-semibold">Panadería</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#e8d1b5]">Artesanal</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[#f5dcc2]">
            Panes, tortas y delicias hechas con ingredientes de calidad, masa madre y una dedicación artesanal en cada preparación.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-base font-semibold uppercase tracking-[0.2em] text-[#f8d8a6]">Navegación</h3>
          <ul className="space-y-3 text-sm text-[#f5dcc2]">
            <li><Link href="/nosotros">Nosotros</Link></li>
            <li><Link href="/productos">Productos</Link></li>
            <li><Link href="/pedidos">Pedidos</Link></li>
            <li><Link href="/formulario-pedido">Formulario</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-base font-semibold uppercase tracking-[0.2em] text-[#f8d8a6]">Contacto</h3>
          <ul className="space-y-3 text-sm text-[#f5dcc2]">
            <li>Av. Carrascal 1234</li>
            <li>+56 9 1234 5678</li>
            <li>hola@panaderiaejemplo.cl</li>
            <li>Lun a Sáb • 07:00 - 13:30</li>
            <li>Lun a Sáb • 16:00 - 19:30</li>
            <li>Domingo   • 08:00 - 13:30</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-base font-semibold uppercase tracking-[0.2em] text-[#f8d8a6]">Síguenos</h3>
          <div className="flex gap-3">
            <a href="https://instagram.com" className="rounded-full border border-[#d6a06a] px-3 py-2 text-sm text-[#f7e5c6]">Instagram</a>
            <a href="https://facebook.com" className="rounded-full border border-[#d6a06a] px-3 py-2 text-sm text-[#f7e5c6]">Facebook</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#4d352d] py-5 text-center text-sm text-[#ead8bb]">
        © 2026 Panadería. Todos los derechos reservados.
      </div>
    </footer>
  );
}
