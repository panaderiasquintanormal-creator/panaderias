import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 503 });
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para actualizar el catálogo.' }, { status: 401 });
  }

  revalidateTag('public-catalog', { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
