'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { revalidatePublicCatalog } from '@/lib/revalidate-catalog';

type CategoryOption = { id: string; name: string };
type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  description: string | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  price: number;
  badge: string | null;
  featured: boolean;
  image_url: string | null;
  stock_status: string | null;
  prep_time: string | null;
};

const emptyForm = {
  name: '',
  category_id: '',
  description: '',
  ingredients: '',
  allergens: '',
  price: '',
  badge: '',
  image_url: '',
  stock_status: 'Disponible',
  prep_time: '',
  featured: false,
};

function makeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminProductManager({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function startEdit(product: ProductRow) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category_id: product.category_id ?? '',
      description: product.description ?? '',
      ingredients: (product.ingredients ?? []).join(', '),
      allergens: (product.allergens ?? []).join(', '),
      price: String(product.price),
      badge: product.badge ?? '',
      image_url: product.image_url ?? '',
      stock_status: product.stock_status ?? '',
      prep_time: product.prep_time ?? '',
      featured: product.featured,
    });
    setError('');
    setNotice('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    const price = Number(form.price);
    if (!form.name.trim() || !Number.isFinite(price) || price < 0) {
      setError('Ingresa un nombre y un precio válido (igual o mayor que cero).');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        slug: makeSlug(form.name),
        name: form.name.trim(),
        category_id: form.category_id || null,
        description: form.description.trim() || null,
        ingredients: form.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
        allergens: form.allergens.split(',').map((item) => item.trim()).filter(Boolean),
        price,
        badge: form.badge.trim() || null,
        image_url: form.image_url.trim() || null,
        stock_status: form.stock_status.trim() || null,
        prep_time: form.prep_time.trim() || null,
        featured: form.featured,
      };

      const result = editingId
        ? await supabase.from('products').update(payload).eq('id', editingId)
        : await supabase.from('products').insert(payload);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      try {
        await revalidatePublicCatalog();
      } catch (revalidationError) {
        setNotice(`Producto guardado, pero no se pudo actualizar la caché pública: ${revalidationError instanceof Error ? revalidationError.message : 'error desconocido'}`);
        resetForm();
        router.refresh();
        return;
      }

      setNotice(editingId ? 'Producto actualizado.' : 'Producto creado.');
      resetForm();
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(product: ProductRow) {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setError('');
    setNotice('');
    try {
      const { error: deleteError } = await createSupabaseBrowserClient()
        .from('products')
        .delete()
        .eq('id', product.id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      let revalidationErrorMessage = '';
      try {
        await revalidatePublicCatalog();
      } catch (revalidationError) {
        revalidationErrorMessage = revalidationError instanceof Error ? revalidationError.message : 'error desconocido';
      }
      if (editingId === product.id) resetForm();
      if (revalidationErrorMessage) {
        setError(`Producto eliminado, pero no se pudo actualizar la caché pública: ${revalidationErrorMessage}`);
      } else {
        setNotice('Producto eliminado.');
      }
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el producto.');
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
      <form onSubmit={saveProduct} className="h-fit space-y-4 rounded-[28px] border border-[#f1e3d0] bg-white p-6 shadow-[0_20px_50px_rgba(91,67,55,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{editingId ? 'Editar producto' : 'Agregar producto'}</h2>
          {editingId && <button type="button" className="text-sm text-[#9d4c2a]" onClick={resetForm}>Cancelar</button>}
        </div>
        <label className="block text-sm font-medium text-[#5b4337]">Nombre
          <input required className="form-field mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block text-sm font-medium text-[#5b4337]">Categoría
          <select className="form-field mt-2" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Sin categoría</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-[#5b4337]">Descripción
          <textarea className="form-field mt-2 min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#5b4337]">Precio
            <input required min="0" step="1" type="number" className="form-field mt-2" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-[#5b4337]">Etiqueta
            <input className="form-field mt-2" placeholder="Nuevo, Oferta..." value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
          </label>
        </div>
        <label className="block text-sm font-medium text-[#5b4337]">URL de imagen
          <input type="url" className="form-field mt-2" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#5b4337]">Disponibilidad / stock
            <input className="form-field mt-2" value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-[#5b4337]">Tiempo de preparación
            <input className="form-field mt-2" value={form.prep_time} onChange={(e) => setForm({ ...form, prep_time: e.target.value })} />
          </label>
        </div>
        <label className="block text-sm font-medium text-[#5b4337]">Ingredientes (separados por coma)
          <input className="form-field mt-2" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
        </label>
        <label className="block text-sm font-medium text-[#5b4337]">Alérgenos (separados por coma)
          <input className="form-field mt-2" value={form.allergens} onChange={(e) => setForm({ ...form, allergens: e.target.value })} />
        </label>
        <label className="flex items-center gap-3 text-sm text-[#5b4337]">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Mostrar como destacado
        </label>
        {error && <p role="alert" className="rounded-xl bg-[#fff0e8] p-3 text-sm text-[#9d4c2a]">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-[#eef8f0] p-3 text-sm text-[#34724d]">{notice}</p>}
        <button disabled={isSaving} className="w-full rounded-full bg-[#b7653e] px-5 py-3 font-semibold text-white disabled:opacity-60">
          {isSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Productos ({products.length})</h2>
        {products.length === 0 && <p className="rounded-2xl bg-white p-5 text-[#5b4337]">Aún no hay productos. Usa el formulario para crear el primero.</p>}
        {products.map((product) => (
          <article key={product.id} className="flex flex-col gap-4 rounded-[24px] border border-[#f1e3d0] bg-white p-4 shadow-[0_10px_30px_rgba(91,67,55,0.04)] sm:flex-row sm:items-center">
            {product.image_url ? <img src={product.image_url} alt="" className="h-20 w-20 rounded-2xl object-cover" /> : <div className="h-20 w-20 rounded-2xl bg-[#f9efe6]" />}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm text-[#765b4a]">{product.slug} · ${Number(product.price).toLocaleString('es-CL')}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEdit(product)} className="rounded-full border border-[#d9b98f] px-4 py-2 text-sm font-medium">Editar</button>
              <button type="button" onClick={() => deleteProduct(product)} className="rounded-full border border-[#e6b9a5] px-4 py-2 text-sm font-medium text-[#9d4c2a]">Eliminar</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
