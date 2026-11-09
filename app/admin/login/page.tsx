import { LoginForm } from '@/components/admin-login-form';

export default function AdminLoginPage() {
  return (
    <div className="page-shell flex min-h-[65vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-[30px] border border-[#f1e3d0] bg-white p-8 shadow-[0_25px_70px_rgba(82,58,43,0.1)]">
        <p className="section-tag">Acceso administrativo</p>
        <h1 className="mt-5 text-3xl font-bold text-[#2a1d18]">Ingresar al panel</h1>
        <p className="mt-3 text-sm leading-6 text-[#5b4337]">
          Usa el correo y la contraseña de un usuario creado en Authentication de Supabase.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
