import 'server-only';

import { createDecipheriv, createCipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type KhipuCredentials = {
  apiKey: string;
  signatureSecret: string;
};

function getEncryptionKey() {
  const encodedKey = process.env.KHIPU_CREDENTIALS_ENCRYPTION_KEY;
  if (!encodedKey) throw new Error('Configura KHIPU_CREDENTIALS_ENCRYPTION_KEY en el servidor.');

  const key = Buffer.from(encodedKey, 'base64');
  if (key.length !== 32) throw new Error('KHIPU_CREDENTIALS_ENCRYPTION_KEY debe ser una clave base64 de 32 bytes.');
  return key;
}

function encryptCredentials(credentials: KhipuCredentials) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(credentials), 'utf8'),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
}

function decryptCredentials(value: string): KhipuCredentials {
  const [encodedIv, encodedTag, encodedData] = value.split('.');
  if (!encodedIv || !encodedTag || !encodedData) throw new Error('La configuración cifrada de Khipu no es válida.');

  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(encodedIv, 'base64'));
  decipher.setAuthTag(Buffer.from(encodedTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encodedData, 'base64')),
    decipher.final(),
  ]).toString('utf8');
  const credentials: unknown = JSON.parse(decrypted);

  if (
    typeof credentials !== 'object'
    || credentials === null
    || !('apiKey' in credentials)
    || typeof credentials.apiKey !== 'string'
    || !('signatureSecret' in credentials)
    || typeof credentials.signatureSecret !== 'string'
  ) {
    throw new Error('La configuración descifrada de Khipu no es válida.');
  }

  return { apiKey: credentials.apiKey, signatureSecret: credentials.signatureSecret };
}

export async function getKhipuCredentials(): Promise<KhipuCredentials> {
  const { data, error } = await createSupabaseAdminClient()
    .from('khipu_credentials')
    .select('credentials_ciphertext')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la configuración de Khipu: ${error.message}`);
  if (!data?.credentials_ciphertext) throw new Error('Configura las credenciales de Khipu desde el panel de administración.');
  return decryptCredentials(data.credentials_ciphertext);
}

export async function saveKhipuCredentials(credentials: KhipuCredentials) {
  const { error } = await createSupabaseAdminClient()
    .from('khipu_credentials')
    .upsert({
      id: 1,
      credentials_ciphertext: encryptCredentials(credentials),
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(`No se pudo guardar la configuración de Khipu: ${error.message}`);
}

export function verifyKhipuSignature(signatureHeader: string | null, rawBody: string, secret: string) {
  if (!signatureHeader) return false;

  const values = new Map(
    signatureHeader.split(',').map((part) => {
      const [key, ...valueParts] = part.trim().split('=');
      return [key, valueParts.join('=')];
    }),
  );
  const timestamp = values.get('t');
  const signature = values.get('s');
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() - Number(timestamp)) > 5 * 60 * 1000) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest();
  const actual = Buffer.from(signature, 'base64');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function getKhipuPayment(paymentId: string) {
  const credentials = await getKhipuCredentials();
  const response = await fetch(`https://payment-api.khipu.com/v3/payments/${encodeURIComponent(paymentId)}`, {
    headers: { 'x-api-key': credentials.apiKey },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Khipu no pudo verificar el pago (HTTP ${response.status}).`);
  const payment: unknown = await response.json();
  if (typeof payment !== 'object' || payment === null) throw new Error('Khipu devolvió una respuesta de pago inválida.');
  return payment as Record<string, unknown>;
}

export async function updateOrderFromKhipu(paymentId: string, orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: paymentRow, error: paymentError } = await supabase
    .from('payments')
    .select('id, amount, order_id')
    .eq('provider', 'khipu')
    .eq('order_id', orderId)
    .eq('metadata->>payment_id', paymentId)
    .maybeSingle();

  if (paymentError) throw new Error(`No se pudo buscar el pago: ${paymentError.message}`);
  if (!paymentRow) throw new Error('El pago no corresponde a un pedido registrado.');

  const payment = await getKhipuPayment(paymentId);
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, total')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) throw new Error(`No se pudo leer el pedido: ${orderError.message}`);
  if (
    !order
    || payment.transaction_id !== orderId
    || payment.currency !== 'CLP'
    || Number(payment.amount) !== Number(paymentRow.amount)
  ) {
    throw new Error('Los datos del pago de Khipu no coinciden con el pedido.');
  }

  const isPaid = payment.status === 'done' && payment.status_detail === 'normal';
  const { error: updatePaymentError } = await supabase
    .from('payments')
    .update({
      status: isPaid ? 'paid' : 'pending',
      metadata: { payment_id: paymentId, transaction_id: orderId, status_detail: payment.status_detail },
    })
    .eq('id', paymentRow.id);

  if (updatePaymentError) throw new Error(`No se pudo actualizar el estado del pago: ${updatePaymentError.message}`);

  if (isPaid) {
    const paymentStatus = Number(paymentRow.amount) >= Number(order.total) ? 'paid' : 'partial';
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus, status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateOrderError) throw new Error(`No se pudo confirmar el pedido pagado: ${updateOrderError.message}`);
  }

  return { isPaid };
}
