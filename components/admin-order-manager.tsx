'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  delivery_type: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  total: number;
  created_at: string;
  customers: { name: string; last_name: string | null; email: string | null }[];
};

const orderStatuses = [
  { value: 'pending_payment', label: 'Pendiente de pago' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'in_preparation', label: 'En preparación' },
  { value: 'ready_for_pickup', label: 'Listo para retiro' },
  { value: 'on_the_way', label: 'En camino' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

const paymentStatuses = [
  { value: 'unpaid', label: 'No pagado' },
  { value: 'partial', label: 'Pago parcial' },
  { value: 'paid', label: 'Pagado' },
  { value: 'refunded', label: 'Reembolsado' },
];

export function AdminOrderManager({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  async function updateOrder(id: string, field: 'status' | 'payment_status', value: string) {
    setError('');
    setNotice('');
    setSavingId(id);
    try {
      const { error: updateError } = await createSupabaseBrowserClient()
        .from('orders')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setNotice('Pedido actualizado.');
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'No se pudo actualizar el pedido.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-xl bg-[#fff0e8] p-3 text-sm text-[#9d4c2a]">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-[#eef8f0] p-3 text-sm text-[#34724d]">{notice}</p>}
      {orders.length === 0 && <p className="rounded-2xl bg-white p-5 text-[#5b4337]">Todavía no hay pedidos registrados.</p>}
      {orders.map((order) => {
        const customer = order.customers[0];
        return (
          <article key={order.id} className="grid gap-4 rounded-[24px] border border-[#f1e3d0] bg-white p-5 shadow-[0_10px_30px_rgba(91,67,55,0.04)] lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div>
              <h2 className="font-semibold">{order.order_number}</h2>
              <p className="mt-1 text-sm text-[#765b4a]">{customer ? `${customer.name} ${customer.last_name ?? ''}` : 'Cliente sin registro'}{customer?.email ? ` · ${customer.email}` : ''}</p>
              <p className="mt-1 text-sm text-[#765b4a]">
                {order.delivery_date ?? 'Sin fecha'} {order.delivery_time ?? ''} · {order.delivery_type ?? 'Sin método'} · ${Number(order.total).toLocaleString('es-CL')}
              </p>
            </div>
            <label className="text-sm text-[#5b4337]">Estado del pedido
              <select disabled={savingId === order.id} className="form-field mt-1 min-w-48" value={order.status} onChange={(e) => updateOrder(order.id, 'status', e.target.value)}>
                {orderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
            <label className="text-sm text-[#5b4337]">Estado del pago
              <select disabled={savingId === order.id} className="form-field mt-1 min-w-40" value={order.payment_status} onChange={(e) => updateOrder(order.id, 'payment_status', e.target.value)}>
                {paymentStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
          </article>
        );
      })}
    </div>
  );
}
