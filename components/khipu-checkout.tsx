'use client';

import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import { getCartSnapshot, parseCartSnapshot, subscribeToCart } from '@/lib/cart-storage';
import { OrderSummary } from '@/components/order-summary';

type OrderDraft = {
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

function isOrderDraft(value: unknown): value is OrderDraft {
  return typeof value === 'object'
    && value !== null
    && 'firstName' in value && typeof value.firstName === 'string'
    && 'lastName' in value && typeof value.lastName === 'string'
    && 'email' in value && typeof value.email === 'string'
    && 'phone' in value && typeof value.phone === 'string'
    && 'address' in value && typeof value.address === 'string'
    && 'deliveryType' in value && typeof value.deliveryType === 'string'
    && 'deliveryDate' in value && typeof value.deliveryDate === 'string'
    && 'deliveryTime' in value && typeof value.deliveryTime === 'string'
    && 'notes' in value && typeof value.notes === 'string';
}

function formatPrice(amount: number) {
  return `$${amount.toLocaleString('es-CL')}`;
}

export function KhipuCheckout() {
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const snapshot = useSyncExternalStore(subscribeToCart, getCartSnapshot, () => '');
  const cart = useMemo(() => {
    try {
      return { items: parseCartSnapshot(snapshot), error: '' };
    } catch (loadError) {
      return {
        items: [],
        error: loadError instanceof Error ? loadError.message : 'No se pudo leer el carrito.',
      };
    }
  }, [snapshot]);
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function startPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (cart.error) {
      setError(cart.error);
      return;
    }
    if (cart.items.length === 0) {
      setError('Agrega productos al carrito antes de pagar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedDraft = window.sessionStorage.getItem('panaderia-order-draft-v1');
      if (!savedDraft) throw new Error('Completa primero tus datos en el formulario de pedido.');
      const customer: unknown = JSON.parse(savedDraft);
      if (!isOrderDraft(customer)) {
        throw new Error('No se pudieron leer los datos del pedido. Vuelve al formulario y complétalo nuevamente.');
      }

      const response = await fetch('/api/khipu/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
            expectedUnitPrice: product.price,
          })),
          customer,
          paymentType,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
          ? result.error
          : 'No se pudo iniciar el pago. Inténtalo nuevamente.';
        throw new Error(message);
      }

      if (
        typeof result !== 'object'
        || result === null
        || !('paymentUrl' in result)
        || typeof result.paymentUrl !== 'string'
      ) {
        throw new Error('Khipu no devolvió un enlace de pago válido.');
      }

      window.location.assign(result.paymentUrl);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'No se pudo iniciar el pago.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={startPayment}>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[30px] border border-[#f1e3d0] bg-white p-6 shadow-[0_20px_50px_rgba(91,67,55,0.05)]">
          <div>
            <h2 className="text-xl font-semibold text-[#2a1d18]">Paga de forma segura con Khipu</h2>
            <p className="mt-2 text-sm text-[#765b4a]">Elige cuánto pagar ahora. Khipu te permitirá completar la transferencia desde tu banco.</p>
            <div className="mt-4 space-y-3">
              {[
                { value: 'full' as const, label: 'Pagar el total', amount: subtotal },
                { value: 'partial' as const, label: 'Pagar el 50% ahora', amount: Math.ceil(subtotal / 2) },
              ].map((option) => (
                <label key={option.value} className="flex items-center justify-between gap-4 rounded-2xl border border-[#e7d7c7] bg-[#fff8f0] p-4 text-[#5b4337]">
                  <span className="flex items-center gap-3">
                    <input type="radio" name="paymentType" value={option.value} checked={paymentType === option.value} onChange={() => setPaymentType(option.value)} disabled={cart.items.length === 0 || Boolean(cart.error)} />
                    {option.label}
                  </span>
                  <span className="shrink-0 font-semibold text-[#2a1d18]">{formatPrice(option.amount)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#2a1d18]">Términos y condiciones</h2>
            <div className="mt-4 rounded-2xl border border-[#e7d7c7] bg-[#fff8f0] p-4 text-sm leading-7 text-[#5b4337]">
              <p>• Los cambios de pedido se aceptan hasta 24 horas antes de la fecha de entrega.</p>
              <p>• Los pagos parciales se gestionan según la disponibilidad de producción y programación.</p>
              <p>• Las tortas personalizadas requieren confirmación de diseño antes de fabricación.</p>
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm text-[#5b4337]">
              <input type="checkbox" required />
              Acepto términos, políticas y condiciones de la panadería.
            </label>
          </div>
        </section>

        <aside className="h-fit rounded-[30px] border border-[#f1e3d0] bg-[#fff8f0] p-6 shadow-[0_20px_50px_rgba(91,67,55,0.05)]">
          <OrderSummary title="Resumen" />
          {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0e8] p-3 text-sm text-[#9d4c2a]">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || cart.items.length === 0 || Boolean(cart.error)}
            className="mt-8 block w-full rounded-full bg-[#b7653e] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#a8532d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Conectando con Khipu…' : 'Pagar con Khipu'}
          </button>
        </aside>
      </div>
    </form>
  );
}
