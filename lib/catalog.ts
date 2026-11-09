import { createClient } from '@supabase/supabase-js';
import { cacheLife, cacheTag } from 'next/cache';
import { categories as demoCategories, products as demoProducts, type Category, type Product } from '@/lib/data';

function getPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function getCatalogProducts(): Promise<Product[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag('public-catalog');

  const supabase = getPublicSupabaseClient();
  if (!supabase) return demoProducts;

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, description, ingredients, allergens, price, badge, featured, image_url, stock_status, prep_time, categories(name)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`No se pudo cargar el catálogo de Supabase: ${error.message}`);

  return (data ?? []).map((row) => {
    const category = row.categories[0];
    const demoProduct = demoProducts.find((product) => product.slug === row.slug);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: category?.name ?? 'Sin categoría',
      description: row.description ?? '',
      ingredients: Array.isArray(row.ingredients) ? row.ingredients as string[] : [],
      allergens: Array.isArray(row.allergens) ? row.allergens as string[] : [],
      price: Number(row.price),
      badge: row.badge ?? '',
      featured: row.featured,
      image: row.image_url ?? demoProduct?.image ?? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
      stock: row.stock_status ?? 'Disponible',
      prepTime: row.prep_time ?? '',
    };
  });
}

export async function getCatalogCategories(): Promise<Category[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag('public-catalog');

  const supabase = getPublicSupabaseClient();
  if (!supabase) return demoCategories;

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description, image_url')
    .order('name');
  if (error) throw new Error(`No se pudieron cargar las categorías de Supabase: ${error.message}`);

  return (data ?? []).map((row) => {
    const demoCategory = demoCategories.find((category) => category.name === row.name);
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      image: row.image_url ?? demoCategory?.image ?? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    };
  });
}
