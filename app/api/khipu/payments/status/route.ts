import { NextResponse } from 'next/server';
import { updateOrderFromKhipu } from '@/lib/khipu';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get('orderId');
  if (!orderId || !isUuid(orderId)) {
    return NextResponse.json({ error: 'El identificador del pedido no es válido.' }, { status: 400 });
  }

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
    if (
      typeof metadata !== 'object'
      || metadata === null
      || !('payment_id' in metadata)
      || typeof metadata.payment_id !== 'string'
    ) {
      return NextResponse.json({ error: 'No se encontró el pago asociado al pedido.' }, { status: 404 });
    }

    const { isPaid } = await updateOrderFromKhipu(metadata.payment_id, orderId);
    return NextResponse.json({ isPaid }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('No se pudo consultar el estado del pago Khipu:', error);
    return NextResponse.json(
      { error: 'No se pudo consultar el estado del pago en Khipu.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
