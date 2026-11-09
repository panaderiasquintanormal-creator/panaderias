import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="page-shell py-16 text-[#2a1d18]">
      <section className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="section-tag">Nuestra historia</p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Pan y tradición con un toque moderno.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#5b4337]">
            Desde hace más de una década, elaboramos panes, tortas y productos de repostería con cuidado, servicio y una atención más cercana que hace que cada pedido se sienta especial.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/productos" className="rounded-full bg-[#b7653e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a8532d]">
              Ver catálogo
            </Link>
            <Link href="/formulario-pedido" className="rounded-full border border-[#d7b17a] px-6 py-3 text-sm font-semibold text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]">
              Hacer pedido
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[#f1e3d0] bg-white p-3 shadow-[0_30px_80px_rgba(82,58,43,0.12)]">
          <img
            src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1000&q=80"
            alt="Panadería artesanal"
            className="h-[500px] w-full rounded-[24px] object-cover"
          />
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          ['Misión', 'Crear experiencias de sabor, calidez y confianza con productos artesanales y una atención cercana.'],
          ['Visión', 'Ser la panadería favorita de la comunidad, reconocida por la calidad, el cariño y la innovación.'],
          ['Valores', 'Tradición, honestidad, ingredientes de calidad y un servicio que se siente humano.'],
        ].map(([title, text]) => (
          <article key={title} className="rounded-[28px] border border-[#f1e3d0] bg-white p-7 shadow-[0_20px_50px_rgba(91,67,55,0.06)]">
            <h2 className="text-2xl font-semibold text-[#2a1d18]">{title}</h2>
            <p className="mt-4 text-base leading-7 text-[#5b4337]">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-[#f1e3d0] bg-[#fff8f0] p-8 shadow-[0_20px_40px_rgba(91,67,55,0.04)]">
          <p className="section-tag">Compromiso</p>
          <h2 className="mt-5 text-3xl font-bold text-[#2a1d18]">Ingredientes de calidad y procesos cuidadosos</h2>
          <ul className="mt-6 space-y-4 text-[#5b4337]">
            <li className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#b7653e]" /> Harina con masa madre y elaboración lenta para una mejor fermentación.</li>
            <li className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#b7653e]" /> Selección de mantequilla, huevos, frutas y sabores con atención a cada detalle.</li>
            <li className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#b7653e]" /> Preparaciones pensadas para cada celebración, pedido especial y ocasión familiar.</li>
          </ul>
        </div>

        <div className="rounded-[30px] border border-[#f1e3d0] bg-white p-8 shadow-[0_20px_40px_rgba(91,67,55,0.04)]">
          <p className="section-tag">Equipo</p>
          <h2 className="mt-5 text-3xl font-bold text-[#2a1d18]">Hecho por personas que aman lo que hacen</h2>
          <div className="mt-6 space-y-5 text-[#5b4337]">
            <p className="text-base leading-7">Nuestro equipo combina tradición, creatividad y rigor en cada etapa de producción. Cada pedido se entrega con el mismo cuidado que si fuera para nuestra propia familia.</p>
            <p className="rounded-2xl bg-[#f9efe6] p-4 text-base leading-7">“La buena panadería se siente desde el aroma, la textura y la atención. Ese equilibrio nos guía cada día.”</p>
          </div>
        </div>
      </section>
    </div>
  );
}
