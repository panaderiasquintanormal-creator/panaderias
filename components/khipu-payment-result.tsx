'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
  orderId: string | null;
  orderNumber: string;
};

function isVerificationResponse(value: unknown): value is { isPaid: boolean } {
  return typeof value === 'object'
    && value !== null
    && 'isPaid' in value
    && typeof value.isPaid === 'boolean';
}

export function KhipuPaymentResult({ orderId, orderNumber }: Props) {
  const [isPaid, setIsPaid] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (orderId === null) return;
    const currentOrderId = orderId;

    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function verifyPayment() {
      try {
        const response = await fetch(`/api/khipu/payments/status?orderId=${encodeURIComponent(currentOrderId)}`, {
          cache: 'no-store',
        });
        const result: unknown = await response.json();

        if (!response.ok || !isVerificationResponse(result)) {
          throw new Error('No se pudo consultar el estado del pago.');
        }

        if (!active) return;
        setHasError(false);
        if (result.isPaid) {
          setIsPaid(true);
          return;
        }
      } catch {
        if (active) setHasError(true);
      }

      attempts += 1;
      if (active) {
        timeout = setTimeout(verifyPayment, attempts < 20 ? 3000 : 10000);
      }
    }

    void verifyPayment();
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [orderId, retry]);

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
          {confirmed
            ? 'Khipu confirmó el pago y registramos tu pedido.'
            : hasError
              ? 'No pudimos consultar a Khipu en este momento. Seguiremos intentando; no vuelvas a pagar.'
              : 'Khipu está verificando la transferencia. Esta página se actualizará automáticamente; no vuelvas a pagar.'}
        </p>
        {orderNumber && <p className="mt-5 text-sm text-[#765b4a]">Número de pedido: {orderNumber}</p>}
        {!orderId && <p role="alert" className="mt-3 text-sm text-[#9d4c2a]">No se pudo identificar el pedido para verificar el pago.</p>}
        {hasError && !confirmed && orderId && (
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="mt-5 rounded-full border border-[#d9b98f] px-5 py-2 text-sm font-semibold text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]"
          >
            Consultar ahora
          </button>
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
