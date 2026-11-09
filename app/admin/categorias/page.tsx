import { AdminCategoryManager } from '@/components/admin-category-manager';
import { AdminNavigation } from '@/components/admin-navigation';
import { requireAdminUser } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const instant = false;

export default async function AdminCategoriesPage() {
  await requireAdminUser();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, description, image_url')
    .order('name');
  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);

  return (
    <div className="page-shell py-12 text-[#2a1d18]">
      <AdminNavigation />
      <p className="section-tag">Administración del catálogo</p>
      <h1 className="mb-8 mt-4 text-4xl font-bold">Categorías</h1>
      <AdminCategoryManager categories={categories ?? []} />
    </div>
  );
}
