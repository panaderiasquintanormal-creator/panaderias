import { NextResponse } from 'next/server';
import { getKhipuPayment, updateOrderFromKhipu, verifyKhipuSignature } from '@/lib/khipu';
import { getKhipuCredentials } from '@/lib/khipu';

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    const credentials = await getKhipuCredentials();
    if (!verifyKhipuSignature(request.headers.get('x-khipu-signature'), rawBody, credentials.signatureSecret)) {
      return NextResponse.json({ error: 'Firma de notificación no válida.' }, { status: 401 });
    }

    let event: unknown;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'La notificación no tiene un formato válido.' }, { status: 400 });
    }
    if (typeof event !== 'object' || event === null || !('payment_id' in event) || typeof event.payment_id !== 'string') {
      return NextResponse.json({ error: 'La notificación no contiene un identificador de pago.' }, { status: 400 });
    }

    const payment = await getKhipuPayment(event.payment_id);
    if (typeof payment.transaction_id !== 'string') {
      return NextResponse.json({ error: 'El pago no tiene un identificador de pedido asociado.' }, { status: 400 });
    }

    await updateOrderFromKhipu(event.payment_id, payment.transaction_id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error al procesar notificación Khipu:', error);
    return NextResponse.json({ error: 'No se pudo procesar la notificación de pago.' }, { status: 500 });
  }
}
