import { AdminNavigation } from '@/components/admin-navigation';
import { AdminProductManager } from '@/components/admin-product-manager';
import { requireAdminUser } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const instant = false;

export default async function AdminProductsPage() {
  await requireAdminUser();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase.from('products').select('id, slug, name, category_id, description, ingredients, allergens, price, badge, featured, image_url, stock_status, prep_time').order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name').order('name'),
  ]);
  if (productsError) throw new Error(`No se pudieron cargar los productos: ${productsError.message}`);
  if (categoriesError) throw new Error(`No se pudieron cargar las categorías: ${categoriesError.message}`);

  return (
    <div className="page-shell py-12 text-[#2a1d18]">
      <AdminNavigation />
      <p className="section-tag">Administración del catálogo</p>
      <h1 className="mb-8 mt-4 text-4xl font-bold">Productos</h1>
      <AdminProductManager products={products ?? []} categories={categories ?? []} />
    </div>
  );
}
