import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="page-shell flex items-center justify-center py-20 text-[#2a1d18]">
      <div className="max-w-2xl rounded-[32px] border border-[#f1e3d0] bg-white p-10 text-center shadow-[0_30px_80px_rgba(82,58,43,0.08)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f8ef] text-3xl">✓</div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.22em] text-[#3d7f57]">Pedido confirmado</p>
        <h1 className="mt-5 text-4xl font-bold text-[#2a1d18]">¡Gracias por tu compra!</h1>
        <p className="mt-5 text-lg leading-8 text-[#5b4337]">
          Tu pedido fue registrado con éxito. Recibirás la confirmación por correo y WhatsApp con el número de seguimiento y los próximos pasos.
        </p>

        <div className="mt-8 rounded-[24px] bg-[#fff8f0] p-5 text-left text-[#5b4337]">
          <p><strong>Número de pedido:</strong> #PED-2048</p>
          <p className="mt-2"><strong>Fecha de entrega:</strong> 18 de julio, 14:00 hrs</p>
          <p className="mt-2"><strong>Pago realizado:</strong> 50% confirmado</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/productos" className="rounded-full bg-[#b7653e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a8532d]">
            Seguir comprando
          </Link>
          <Link href="/" className="rounded-full border border-[#d9b98f] px-6 py-3 text-sm font-semibold text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
