'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function AdminSignOutButton() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function signOut() {
    setError('');
    try {
      const { error: signOutError } = await createSupabaseBrowserClient().auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
        return;
      }
      router.replace('/admin/login');
      router.refresh();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'No se pudo cerrar sesión.');
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="rounded-full border border-[#d9b98f] px-5 py-2.5 text-sm font-semibold text-[#5b4337] transition hover:border-[#b7653e] hover:text-[#b7653e]"
        type="button"
        onClick={signOut}
      >
        Cerrar sesión
      </button>
      {error && <p role="alert" className="text-xs text-[#9d4c2a]">{error}</p>}
    </div>
  );
}
