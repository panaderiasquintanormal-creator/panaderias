'use client';

import { OrderSummary } from '@/components/order-summary';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type FocusEvent } from 'react';

export default function OrderFormPage() {
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState('');
  const [formError, setFormError] = useState('');

  function setMinimumDeliveryDate(event: FocusEvent<HTMLInputElement>) {
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    event.currentTarget.min = `${dateParts.find((part) => part.type === 'year')?.value}-${dateParts.find((part) => part.type === 'month')?.value}-${dateParts.find((part) => part.type === 'day')?.value}`;
  }

  function continueToPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const formData = new FormData(event.currentTarget);
    const draft = Object.fromEntries(formData.entries());
    try {
      window.sessionStorage.setItem('panaderia-order-draft-v1', JSON.stringify({
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        phone: draft.phone,
        address: draft.address,
        deliveryType: draft.delivery,
        deliveryDate: draft.deliveryDate,
        deliveryTime: draft.deliveryTime,
        notes: draft.notes,
      }));
      router.push('/pago');
    } catch {
      setFormError('No se pudieron guardar los datos del pedido en este navegador. Habilita el almacenamiento y vuelve a intentarlo.');
    }
  }

  return (
    <div className="page-shell py-16 text-[#2a1d18]">
      <div className="mb-8">
        <p className="section-tag">Pedido</p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Completa tus datos</h1>
      </div>

      <form onSubmit={continueToPayment}>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-[30px] border border-[#f1e3d0] bg-white p-6 shadow-[0_20px_50px_rgba(91,67,55,0.05)]">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-[#5b4337]">Nombre</label>
              <input id="firstName" name="firstName" className="form-field" placeholder="Tu nombre" autoComplete="given-name" required />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-[#5b4337]">Apellido</label>
              <input id="lastName" name="lastName" className="form-field" placeholder="Tu apellido" autoComplete="family-name" required />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#5b4337]">Correo</label>
              <input id="email" name="email" className="form-field" type="email" autoComplete="email" placeholder="correo@ejemplo.com" required />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#5b4337]">Teléfono</label>
              <input id="phone" name="phone" className="form-field" type="tel" autoComplete="tel" placeholder="+56 9 1234 5678" required />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-[#5b4337]">
              Dirección{deliveryType !== 'Entrega a domicilio' && ' (opcional para retiro)'}
            </label>
            <input id="address" name="address" className="form-field" autoComplete="street-address" placeholder="Calle / número / bloque" required={deliveryType === 'Entrega a domicilio'} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="deliveryDate" className="mb-2 block text-sm font-medium text-[#5b4337]">Fecha de entrega</label>
              <input id="deliveryDate" name="deliveryDate" className="form-field" type="date" onFocus={setMinimumDeliveryDate} required />
            </div>
            <div>
              <label htmlFor="deliveryTime" className="mb-2 block text-sm font-medium text-[#5b4337]">Hora</label>
              <select id="deliveryTime" name="deliveryTime" className="form-field" defaultValue="" required>
                <option value="" disabled>Selecciona una hora</option>
                <option value="09:00">09:00</option>
                <option value="11:30">11:30</option>
                <option value="14:00">14:00</option>
                <option value="17:30">17:30</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5b4337]">Tipo de entrega</label>
            <div className="flex flex-wrap gap-3">
              {['Retiro en local', 'Entrega a domicilio', 'Pedido especial'].map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-full border border-[#e6d3b9] bg-[#fff8f0] px-4 py-2 text-sm text-[#5b4337]">
                  <input type="radio" name="delivery" value={option} required checked={deliveryType === option} onChange={(event) => setDeliveryType(event.target.value)} />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-[#5b4337]">Notas o detalles (opcional)</label>
            <textarea id="notes" name="notes" className="form-field min-h-[120px]" placeholder="Indica detalles del pedido, decoración o instrucciones especiales" />
          </div>

          <div>
            <label htmlFor="reference" className="mb-2 block text-sm font-medium text-[#5b4337]">Adjuntar referencia (opcional)</label>
            <input id="reference" name="reference" className="form-field" type="file" />
          </div>
          {formError && <p role="alert" className="rounded-xl bg-[#fff0e8] p-3 text-sm text-[#9d4c2a]">{formError}</p>}
          </div>

          <aside className="h-fit rounded-[30px] border border-[#f1e3d0] bg-[#fff8f0] p-6 shadow-[0_20px_50px_rgba(91,67,55,0.05)]">
            <OrderSummary submitLabel="Ir a pagar" />

            <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-[#5b4337]">
              <p className="font-semibold text-[#2a1d18]">Opciones de pago</p>
              <p className="mt-2">50% se paga al confirmar y el saldo restante al retirar o entregar.</p>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
