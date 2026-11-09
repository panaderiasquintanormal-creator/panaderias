import { AdminNavigation } from '@/components/admin-navigation';
import { AdminOrderManager } from '@/components/admin-order-manager';
import { requireAdminUser } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const instant = false;

export default async function AdminOrdersPage() {
  await requireAdminUser();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, delivery_type, delivery_date, delivery_time, total, created_at, customers(name, last_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);

  return (
    <div className="page-shell py-12 text-[#2a1d18]">
      <AdminNavigation />
      <p className="section-tag">Administración de ventas</p>
      <h1 className="mb-8 mt-4 text-4xl font-bold">Pedidos</h1>
      <AdminOrderManager orders={orders ?? []} />
    </div>
  );
}
