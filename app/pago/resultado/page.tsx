import Link from 'next/link';
import { updateOrderFromKhipu } from '@/lib/khipu';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const instant = false;

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; error?: string }>;
}) {
  const { orderId, error: returnError } = await searchParams;
  let isPaid = false;
  let orderNumber = '';
  let verificationError = '';

  if (orderId && isUuid(orderId)) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data: payment, error } = await supabase
        .from('payments')
        .select('metadata')
        .eq('provider', 'khipu')
        .eq('order_id', orderId)
        .maybeSingle();
      if (error) throw new Error(`No se pudo buscar el pago: ${error.message}`);

      const metadata: unknown = payment?.metadata;
      if (typeof metadata !== 'object' || metadata === null || !('payment_id' in metadata) || typeof metadata.payment_id !== 'string') {
        throw new Error('No se encontró el identificador del pago.');
      }

      ({ isPaid } = await updateOrderFromKhipu(metadata.payment_id, orderId));
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('order_number')
        .eq('id', orderId)
        .single();
      if (orderError) throw new Error(`No se pudo consultar el pedido: ${orderError.message}`);
      orderNumber = order.order_number;
    } catch (error) {
      console.error('No se pudo verificar el resultado del pago:', error);
      verificationError = 'El pago continúa en verificación. No vuelvas a pagar; revisaremos el estado y te enviaremos una confirmación.';
    }
  }

  const confirmed = isPaid;

  return (
    <div className="page-shell flex items-center justify-center py-20 text-[#2a1d18]">
      <div className="max-w-2xl rounded-[32px] border border-[#f1e3d0] bg-white p-10 text-center shadow-[0_30px_80px_rgba(82,58,43,0.08)]">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl ${confirmed ? 'bg-[#e9f8ef] text-[#34724d]' : 'bg-[#fff8f0] text-[#8c4f2b]'}`}>
          {confirmed ? '✓' : '…'}
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.22em] text-[#8a664d]">
          {confirmed ? 'Pago confirmado' : 'Pago en verificación'}
        </p>
        <h1 className="mt-5 text-4xl font-bold text-[#2a1d18]">
          {confirmed ? '¡Gracias por tu compra!' : 'Estamos verificando tu pago'}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#5b4337]">
          {verificationError || (confirmed
            ? 'Khipu confirmó el pago y registramos tu pedido.'
            : 'Khipu aún no confirma el pago. No entregaremos el pedido hasta recibir la confirmación.')}
        </p>
        {orderNumber && <p className="mt-5 text-sm text-[#765b4a]">Número de pedido: {orderNumber}</p>}
        {returnError && !verificationError && !confirmed && (
          <p className="mt-3 text-sm text-[#765b4a]">La respuesta de pago aún no está disponible; puedes volver a revisar esta página más tarde.</p>
        )}
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
