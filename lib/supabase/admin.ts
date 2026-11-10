import 'server-only';

import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el servidor.');
  }

  if (/[\s\u0000-\u001f\u007f]/.test(serviceRoleKey)) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY contiene espacios o saltos de línea. Configura solo la clave en esa variable y define las demás variables por separado.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
