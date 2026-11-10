import { KhipuPaymentResult } from '@/components/khipu-payment-result';
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
  const { orderId } = await searchParams;
  const validOrderId = orderId && isUuid(orderId) ? orderId : null;
  let orderNumber = '';

  if (validOrderId) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('order_number')
        .eq('id', validOrderId)
        .single();
      if (orderError) throw new Error(`No se pudo consultar el pedido: ${orderError.message}`);
      orderNumber = order.order_number;
    } catch (error) {
      console.error('No se pudo consultar el número del pedido:', error);
    }
  }

  return <KhipuPaymentResult orderId={validOrderId} orderNumber={orderNumber} />;
}
