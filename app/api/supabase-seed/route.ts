import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Faltan variables de entorno de Supabase: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY' },
      { status: 500 },
    );
  }

  try {
    const { data, error } = await supabase.from('categories').select('id').limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Conexión a Supabase OK. Ejecuta el SQL del archivo supabase/schema.sql y supabase/seed.sql desde el panel de SQL de Supabase.',
      sample: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
