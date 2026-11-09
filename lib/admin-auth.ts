import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getAuthenticatedAdmin() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  return { supabase, user };
}

export async function requireAdminUser() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect('/admin/login');
  return admin.user;
}
