'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { revalidatePublicCatalog } from '@/lib/revalidate-catalog';

type CategoryRow = { id: string; name: string; description: string | null; image_url: string | null };
const emptyForm = { name: '', description: '', image_url: '' };
const imageBucket = 'category-images';
const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const maxImageSize = 5 * 1024 * 1024;

export function AdminCategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = '';
    setError('');
    setNotice('');
    if (!file) return;
    if (!imageExtensions[file.type]) {
      setImageFile(null);
      setError('Elige una imagen JPG, PNG o WebP.');
      return;
    }
    if (file.size > maxImageSize) {
      setImageFile(null);
      setError('La imagen no puede superar los 5 MB.');
      return;
    }
    setImageFile(file);
  }

  function edit(category: CategoryRow) {
    setEditingId(category.id);
    setImageFile(null);
    setForm({
      name: category.name,
      description: category.description ?? '',
      image_url: category.image_url ?? '',
    });
    setError('');
    setNotice('');
  }

  function reset() {
    setEditingId(null);
    setImageFile(null);
    setForm(emptyForm);
    setError('');
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      let imageUrl = form.image_url.trim() || null;
      let uploadedImagePath: string | null = null;
      if (imageFile) {
        const extension = imageExtensions[imageFile.type];
        uploadedImagePath = `${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from(imageBucket)
          .upload(uploadedImagePath, imageFile, {
            cacheControl: '3600',
            contentType: imageFile.type,
            upsert: false,
          });
        if (uploadError) {
          setError(`No se pudo subir la imagen: ${uploadError.message}`);
          return;
        }
        imageUrl = supabase.storage.from(imageBucket).getPublicUrl(uploadedImagePath).data.publicUrl;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        image_url: imageUrl,
      };
      const result = editingId
        ? await supabase.from('categories').update(payload).eq('id', editingId)
        : await supabase.from('categories').insert(payload);
      if (result.error) {
        let errorMessage = result.error.message;
        if (uploadedImagePath) {
          const { error: cleanupError } = await supabase.storage.from(imageBucket).remove([uploadedImagePath]);
          if (cleanupError) errorMessage += ` No se pudo eliminar la imagen subida: ${cleanupError.message}`;
        }
        setError(errorMessage);
        return;
      }
      try {
        await revalidatePublicCatalog();
      } catch (revalidationError) {
        setNotice(`Categoría guardada, pero no se pudo actualizar la caché pública: ${revalidationError instanceof Error ? revalidationError.message : 'error desconocido'}`);
        reset();
        router.refresh();
        return;
      }
      setNotice(editingId ? 'Categoría actualizada.' : 'Categoría creada.');
      reset();
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la categoría.');
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(category: CategoryRow) {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"? Los productos quedarán sin categoría.`)) return;
    setError('');
    setNotice('');
    try {
      const { error: deleteError } = await createSupabaseBrowserClient()
        .from('categories')
        .delete()
        .eq('id', category.id);
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
      if (editingId === category.id) reset();
      if (revalidationErrorMessage) {
        setError(`Categoría eliminada, pero no se pudo actualizar la caché pública: ${revalidationErrorMessage}`);
      } else {
        setNotice('Categoría eliminada.');
      }
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la categoría.');
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
      <form onSubmit={save} className="h-fit space-y-4 rounded-[28px] border border-[#f1e3d0] bg-white p-6 shadow-[0_20px_50px_rgba(91,67,55,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{editingId ? 'Editar categoría' : 'Agregar categoría'}</h2>
          {editingId && <button type="button" className="text-sm text-[#9d4c2a]" onClick={reset}>Cancelar</button>}
        </div>
        <label className="block text-sm font-medium text-[#5b4337]">Nombre
          <input required className="form-field mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block text-sm font-medium text-[#5b4337]">Descripción
          <textarea className="form-field mt-2 min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="block text-sm font-medium text-[#5b4337]">Subir imagen
          <input type="file" accept="image/jpeg,image/png,image/webp" className="form-field mt-2" onChange={chooseImage} />
          <span className="mt-1 block text-xs font-normal text-[#765b4a]">JPG, PNG o WebP, hasta 5 MB. Se subirá al guardar la categoría.</span>
          {imageFile && <span className="mt-1 block text-xs font-normal text-[#765b4a]">{imageFile.name}</span>}
        </label>
        <label className="block text-sm font-medium text-[#5b4337]">O URL de imagen
          <input type="url" className="form-field mt-2" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </label>
        {error && <p role="alert" className="rounded-xl bg-[#fff0e8] p-3 text-sm text-[#9d4c2a]">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-[#eef8f0] p-3 text-sm text-[#34724d]">{notice}</p>}
        <button disabled={isSaving} className="w-full rounded-full bg-[#b7653e] px-5 py-3 font-semibold text-white disabled:opacity-60">
          {isSaving ? imageFile ? 'Subiendo imagen…' : 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Categorías ({categories.length})</h2>
        {categories.length === 0 && <p className="rounded-2xl bg-white p-5 text-[#5b4337]">Aún no hay categorías. Crea la primera con el formulario.</p>}
        {categories.map((category) => (
          <article key={category.id} className="flex flex-col gap-4 rounded-[24px] border border-[#f1e3d0] bg-white p-4 shadow-[0_10px_30px_rgba(91,67,55,0.04)] sm:flex-row sm:items-center">
            {category.image_url ? <img src={category.image_url} alt="" className="h-20 w-20 rounded-2xl object-cover" /> : <div className="h-20 w-20 rounded-2xl bg-[#f9efe6]" />}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{category.name}</h3>
              <p className="mt-1 text-sm text-[#765b4a]">{category.description || 'Sin descripción'}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => edit(category)} className="rounded-full border border-[#d9b98f] px-4 py-2 text-sm font-medium">Editar</button>
              <button type="button" onClick={() => remove(category)} className="rounded-full border border-[#e6b9a5] px-4 py-2 text-sm font-medium text-[#9d4c2a]">Eliminar</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
