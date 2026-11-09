import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { saveKhipuCredentials } from '@/lib/khipu';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'No tienes permiso para administrar los pagos.' }, { status: 403 });

    const { data, error } = await createSupabaseAdminClient()
      .from('khipu_credentials')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw new Error(`No se pudo consultar la configuración de Khipu: ${error.message}`);
    return NextResponse.json({ configured: Boolean(data) });
  } catch (error) {
    console.error('Error al consultar configuración de Khipu:', error);
    return NextResponse.json({
      error: getErrorMessage(error, 'No se pudo consultar la configuración de Khipu.'),
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'No tienes permiso para administrar los pagos.' }, { status: 403 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'El contenido de la solicitud no es válido.' }, { status: 400 });
    }

    if (
      typeof body !== 'object'
      || body === null
      || !('apiKey' in body)
      || typeof body.apiKey !== 'string'
      || !('signatureSecret' in body)
      || typeof body.signatureSecret !== 'string'
      || body.apiKey.trim().length < 8
      || body.apiKey.length > 1000
      || body.signatureSecret.trim().length < 8
      || body.signatureSecret.length > 1000
    ) {
      return NextResponse.json({ error: 'Ingresa una API key y un secreto de firma válidos.' }, { status: 400 });
    }

    await saveKhipuCredentials({
      apiKey: body.apiKey.trim(),
      signatureSecret: body.signatureSecret.trim(),
    });

    return NextResponse.json({ configured: true });
  } catch (error) {
    console.error('Error al guardar configuración de Khipu:', error);
    return NextResponse.json({
      error: getErrorMessage(error, 'No se pudo guardar la configuración de Khipu.'),
    }, { status: 500 });
  }
}
