import { NextResponse } from 'next/server';
import { getKhipuCredentials } from '@/lib/khipu';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type CheckoutRequest = {
  items: Array<{ productId: string; quantity: number; expectedUnitPrice: number }>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    deliveryType: string;
    deliveryDate: string;
    deliveryTime: string;
    notes: string;
  };
  paymentType: 'full' | 'partial';
};

function isValidDeliveryDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const todayInChile = `${dateParts.find((part) => part.type === 'year')?.value}-${dateParts.find((part) => part.type === 'month')?.value}-${dateParts.find((part) => part.type === 'day')?.value}`;
  return !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === value
    && value >= todayInChile;
}

function isCheckoutRequest(value: unknown): value is CheckoutRequest {
  if (typeof value !== 'object' || value === null || !('items' in value) || !Array.isArray(value.items) || !('customer' in value) || !('paymentType' in value)) {
    return false;
  }

  const { customer, items, paymentType } = value;
  if (paymentType !== 'full' && paymentType !== 'partial') return false;
  if (
    typeof customer !== 'object'
    || customer === null
    || !('firstName' in customer) || typeof customer.firstName !== 'string'
    || !('lastName' in customer) || typeof customer.lastName !== 'string'
    || !('email' in customer) || typeof customer.email !== 'string'
    || !('phone' in customer) || typeof customer.phone !== 'string'
    || !('address' in customer) || typeof customer.address !== 'string'
    || !('deliveryType' in customer) || typeof customer.deliveryType !== 'string'
    || !('deliveryDate' in customer) || typeof customer.deliveryDate !== 'string'
    || !('deliveryTime' in customer) || typeof customer.deliveryTime !== 'string'
    || !('notes' in customer) || typeof customer.notes !== 'string'
  ) return false;

  return items.length > 0
    && items.length <= 50
    && items.every((item) =>
      typeof item === 'object'
      && item !== null
      && 'productId' in item
      && typeof item.productId === 'string'
      && 'quantity' in item
      && typeof item.quantity === 'number'
      && Number.isInteger(item.quantity)
      && item.quantity >= 1
      && item.quantity <= 99
      && 'expectedUnitPrice' in item
      && typeof item.expectedUnitPrice === 'number'
      && Number.isSafeInteger(item.expectedUnitPrice),
    )
    && customer.firstName.trim().length > 0
    && customer.firstName.length <= 100
    && customer.lastName.trim().length > 0
    && customer.lastName.length <= 100
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
    && customer.email.length <= 254
    && customer.phone.trim().length >= 6
    && customer.phone.length <= 40
    && customer.deliveryType.length <= 60
    && ['Retiro en local', 'Entrega a domicilio', 'Pedido especial'].includes(customer.deliveryType)
    && (customer.deliveryType !== 'Entrega a domicilio' || customer.address.trim().length > 0)
    && customer.address.length <= 300
    && /^\d{4}-\d{2}-\d{2}$/.test(customer.deliveryDate)
    && isValidDeliveryDate(customer.deliveryDate)
    && ['09:00', '11:30', '14:00', '17:30'].includes(customer.deliveryTime)
    && customer.notes.length <= 3000;
}

function getPublicSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) throw new Error('Configura NEXT_PUBLIC_SITE_URL con la dirección pública de tu sitio.');
  const url = new URL(value);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('NEXT_PUBLIC_SITE_URL debe usar HTTPS.');
  }
  return url.origin;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'La solicitud del pedido no tiene un formato válido.' }, { status: 400 });
  }

  if (!isCheckoutRequest(body)) {
    return NextResponse.json({ error: 'Revisa los datos del pedido y vuelve a intentarlo.' }, { status: 400 });
  }

  try {
    const credentials = await getKhipuCredentials();
    const siteUrl = getPublicSiteUrl();
    const supabase = createSupabaseAdminClient();
    const quantities = new Map<string, number>();
    const expectedPrices = new Map<string, number>();
    for (const item of body.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
      const expectedPrice = expectedPrices.get(item.productId);
      if (expectedPrice !== undefined && expectedPrice !== item.expectedUnitPrice) {
        return NextResponse.json({ error: 'El carrito contiene precios incompatibles. Actualízalo e inténtalo nuevamente.' }, { status: 409 });
      }
      expectedPrices.set(item.productId, item.expectedUnitPrice);
    }

    const productIds = [...quantities.keys()];
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);
    if (productsError) throw new Error(`No se pudo validar el catálogo: ${productsError.message}`);
    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'Uno o más productos del carrito ya no están disponibles.' }, { status: 400 });
    }

    const orderItems = products.map((product) => {
      const quantity = quantities.get(product.id);
      if (!quantity || !Number.isSafeInteger(Number(product.price)) || Number(product.price) <= 0) {
        throw new Error('El catálogo contiene un precio o cantidad no válido.');
      }
      const unitPrice = Number(product.price);
      if (expectedPrices.get(product.id) !== unitPrice) {
        throw new Error('El precio de uno o más productos cambió. Actualiza el carrito antes de pagar.');
      }
      return {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
        total: unitPrice * quantity,
      };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
      return NextResponse.json({ error: 'El total del pedido no es válido.' }, { status: 400 });
    }
    const amount = body.paymentType === 'partial' ? Math.ceil(subtotal / 2) : subtotal;

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: body.customer.firstName.trim(),
        last_name: body.customer.lastName.trim(),
        email: body.customer.email.trim(),
        phone: body.customer.phone.trim(),
        address: body.customer.address.trim() || null,
      })
      .select('id')
      .single();
    if (customerError) throw new Error(`No se pudo registrar al cliente: ${customerError.message}`);

    const orderNumber = `PED-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customer.id,
        status: 'pending_payment',
        delivery_type: body.customer.deliveryType,
        delivery_date: body.customer.deliveryDate,
        delivery_time: body.customer.deliveryTime,
        subtotal,
        discount: 0,
        shipping: 0,
        total: subtotal,
        payment_type: body.paymentType,
        payment_status: 'unpaid',
        notes: body.customer.notes.trim() || null,
      })
      .select('id')
      .single();
    if (orderError) throw new Error(`No se pudo registrar el pedido: ${orderError.message}`);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) throw new Error(`No se pudieron guardar los productos del pedido: ${itemsError.message}`);

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        provider: 'khipu',
        payment_method: 'bank_transfer',
        amount,
        status: 'pending',
        metadata: { transaction_id: order.id },
      })
      .select('id')
      .single();
    if (paymentError) throw new Error(`No se pudo preparar el pago: ${paymentError.message}`);

    const khipuResponse = await fetch('https://payment-api.khipu.com/v3/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': credentials.apiKey },
      cache: 'no-store',
      body: JSON.stringify({
        amount,
        currency: 'CLP',
        subject: `Pedido ${orderNumber}`,
        body: `Pedido de ${body.customer.firstName.trim()} ${body.customer.lastName.trim()}`,
        transaction_id: order.id,
        return_url: `${siteUrl}/pago/resultado?orderId=${encodeURIComponent(order.id)}`,
        notify_url: `${siteUrl}/api/khipu/webhook`,
        notify_api_version: '3.0',
      }),
    });

    if (!khipuResponse.ok) {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      console.error(`Khipu rechazó la creación del pago (HTTP ${khipuResponse.status}).`);
      return NextResponse.json({ error: 'Khipu no pudo iniciar el pago. Inténtalo nuevamente o contacta a la panadería.' }, { status: 502 });
    }

    const khipuResult: unknown = await khipuResponse.json();
    if (
      typeof khipuResult !== 'object'
      || khipuResult === null
      || !('payment_id' in khipuResult)
      || typeof khipuResult.payment_id !== 'string'
      || !('payment_url' in khipuResult)
      || typeof khipuResult.payment_url !== 'string'
    ) {
      throw new Error('Khipu devolvió una respuesta de pago incompleta.');
    }

    const paymentUrl = new URL(khipuResult.payment_url);
    if (paymentUrl.protocol !== 'https:' || !['khipu.com', 'www.khipu.com', 'app.khipu.com'].includes(paymentUrl.hostname)) {
      throw new Error('Khipu devolvió una dirección de pago no válida.');
    }

    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        metadata: {
          payment_id: khipuResult.payment_id,
          transaction_id: order.id,
          payment_url: paymentUrl.toString(),
        },
      })
      .eq('id', payment.id);
    if (updatePaymentError) throw new Error(`No se pudo guardar la referencia de Khipu: ${updatePaymentError.message}`);

    return NextResponse.json({ paymentUrl: paymentUrl.toString(), orderNumber });
  } catch (error) {
    console.error('Error al iniciar el pago Khipu:', error);
    const message = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
    const status = message.includes('Configura ') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
