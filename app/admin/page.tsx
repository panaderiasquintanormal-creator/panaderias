import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminNavigation } from '@/components/admin-navigation';
import { AdminSignOutButton } from '@/components/admin-sign-out-button';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const instant = false;

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect('/admin/login');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    redirect('/admin/login');
  }

  const now = new Date();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const [recentResult, salesResult, pendingResult] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, status, total, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('orders')
      .select('total, created_at')
      .gte('created_at', monthStart)
      .not('status', 'in', '(cancelled,refunded)')
      .limit(1000),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_payment'),
  ]);
  if (recentResult.error) throw new Error(`No se pudieron cargar los pedidos recientes: ${recentResult.error.message}`);
  if (salesResult.error) throw new Error(`No se pudieron calcular las ventas del mes: ${salesResult.error.message}`);
  if (pendingResult.error) throw new Error(`No se pudieron contar los pedidos pendientes: ${pendingResult.error.message}`);

  const recentOrders = recentResult.data ?? [];
  const salesThisMonth = salesResult.data ?? [];
  const todayOrders = salesThisMonth.filter((order) => order.created_at.slice(0, 10) === today);
  const monthlySales = salesThisMonth.reduce((sum, order) => sum + Number(order.total), 0);
  const metrics = [
    { label: 'Ventas del día', value: `$${todayOrders.reduce((sum, order) => sum + Number(order.total), 0).toLocaleString('es-CL')}` },
    { label: 'Ventas del mes', value: `$${monthlySales.toLocaleString('es-CL')}` },
    { label: 'Pedidos de hoy', value: String(todayOrders.length) },
    { label: 'Pendientes de pago', value: String(pendingResult.count ?? 0) },
  ];

  return (
    <div className="page-shell py-16 text-[#2a1d18]">
      <AdminNavigation />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-tag">Administración</p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Dashboard general</h1>
        </div>
        <div className="flex gap-3">
          <AdminSignOutButton />
          <Link href="/admin" className="rounded-full bg-[#b7653e] px-5 py-2.5 text-sm font-semibold text-white">Resumen</Link>
          <Link href="/productos" className="rounded-full border border-[#d9b98f] px-5 py-2.5 text-sm font-semibold text-[#5b4337]">Ver catálogo</Link>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-[24px] border border-[#f1e3d0] bg-white p-5 shadow-[0_20px_50px_rgba(91,67,55,0.04)]">
            <p className="text-sm uppercase tracking-[0.18em] text-[#8a664d]">{metric.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-bold text-[#2a1d18]">{metric.value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-[#f1e3d0] bg-white p-6 shadow-[0_20px_50px_rgba(91,67,55,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#2a1d18]">Pedidos recientes</h2>
            <button className="rounded-full bg-[#fff8f0] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5b4337]">Ver todos</button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#f1e3d0]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fff8f0] text-[#5b4337]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pedido</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-[#f1e3d0]">
                    <td className="px-4 py-3 font-medium text-[#2a1d18]">{order.order_number}</td>
                    <td className="px-4 py-3 text-[#5b4337]">{new Date(order.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-[#f7efe3] px-2.5 py-1 text-xs font-semibold text-[#6b4d38]">{order.status.replaceAll('_', ' ')}</span></td>
                    <td className="px-4 py-3 font-semibold text-[#2a1d18]">${Number(order.total).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && <tr><td className="px-4 py-6 text-center text-[#765b4a]" colSpan={4}>Todavía no hay pedidos registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-[#f1e3d0] bg-[#fff8f0] p-6 shadow-[0_20px_50px_rgba(91,67,55,0.04)]">
            <h2 className="text-2xl font-semibold text-[#2a1d18]">Inventario</h2>
            <ul className="mt-5 space-y-4 text-[#5b4337]">
              <li className="flex justify-between"><span>Pan artesanal</span><span className="font-semibold text-[#2a1d18]">84</span></li>
              <li className="flex justify-between"><span>Croissant</span><span className="font-semibold text-[#2a1d18]">32</span></li>
              <li className="flex justify-between"><span>Tortas</span><span className="font-semibold text-[#2a1d18]">7</span></li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-[#f1e3d0] bg-white p-6 shadow-[0_20px_50px_rgba(91,67,55,0.04)]">
            <h2 className="text-2xl font-semibold text-[#2a1d18]">Alertas</h2>
            <ul className="mt-5 space-y-4 text-sm text-[#5b4337]">
              <li className="rounded-2xl bg-[#fef2e5] p-3">2 pedidos sin pago de saldo</li>
              <li className="rounded-2xl bg-[#f4f8ea] p-3">1 pedido con entrega programada hoy</li>
              <li className="rounded-2xl bg-[#fef5df] p-3">Inventario de tortas por debajo del mínimo</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
