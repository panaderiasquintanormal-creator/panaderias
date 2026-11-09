import { KhipuCheckout } from '@/components/khipu-checkout';

export default function PaymentPage() {
  return (
    <div className="page-shell py-16 text-[#2a1d18]">
      <div className="mb-8">
        <p className="section-tag">Pago</p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Elige tu forma de pago</h1>
      </div>

      <KhipuCheckout />
    </div>
  );
}
