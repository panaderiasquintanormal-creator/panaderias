import { AdminNavigation } from '@/components/admin-navigation';
import { KhipuSettingsForm } from '@/components/khipu-settings-form';
import { requireAdminUser } from '@/lib/admin-auth';

export const instant = false;

export default async function AdminPaymentsPage() {
  await requireAdminUser();

  return (
    <div className="page-shell py-12 text-[#2a1d18]">
      <AdminNavigation />
      <p className="section-tag">Administración de pagos</p>
      <h1 className="mb-3 mt-4 text-4xl font-bold">Khipu</h1>
      <p className="mb-8 max-w-2xl text-[#5b4337]">
        Configura las credenciales de tu cuenta de cobro. Se guardan cifradas y nunca se muestran nuevamente.
      </p>
      <KhipuSettingsForm />
    </div>
  );
}
