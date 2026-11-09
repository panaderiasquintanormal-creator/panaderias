'use client';

export async function revalidatePublicCatalog() {
  const response = await fetch('/api/revalidate-catalog', { method: 'POST' });
  const result = await response.json() as { error?: string; revalidated?: boolean };
  if (!response.ok || !result.revalidated) {
    throw new Error(result.error ?? 'No se pudo actualizar el catálogo público.');
  }
}
