'use client';

import { useEffect, useState, type FormEvent } from 'react';

export function KhipuSettingsForm() {
  const [apiKey, setApiKey] = useState('');
  const [signatureSecret, setSignatureSecret] = useState('');
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadConfiguration() {
      try {
        const response = await fetch('/api/admin/khipu');
        const result: unknown = await response.json();
        if (!response.ok) {
          const message = typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
            ? result.error
            : 'No se pudo consultar la configuración de Khipu.';
          throw new Error(message);
        }
        if (typeof result !== 'object' || result === null || !('configured' in result)) {
          throw new Error('El servidor devolvió una respuesta de configuración inválida.');
        }
        if (active) setConfigured(result.configured === true);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'No se pudo consultar la configuración.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadConfiguration();
    return () => { active = false; };
  }, []);

  async function saveConfiguration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const response = await fetch('/api/admin/khipu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, signatureSecret }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
          ? result.error
          : 'No se pudo guardar la configuración.';
        throw new Error(message);
      }

      setConfigured(true);
      setApiKey('');
      setSignatureSecret('');
      setNotice('Credenciales guardadas de forma segura.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveConfiguration} className="max-w-2xl space-y-5 rounded-[28px] border border-[#f1e3d0] bg-white p-6 shadow-[0_20px_50px_rgba(91,67,55,0.05)]">
      {loading && <p role="status" className="text-sm text-[#5b4337]">Consultando configuración…</p>}
      {!loading && (
        <p className={`rounded-xl p-3 text-sm ${configured ? 'bg-[#eef8f0] text-[#34724d]' : 'bg-[#fff8f0] text-[#765b4a]'}`}>
          {configured ? 'Khipu está configurado. Ingresa nuevas credenciales para reemplazarlas.' : 'Khipu todavía no está configurado.'}
        </p>
      )}

      <div>
        <label htmlFor="khipu-api-key" className="mb-2 block text-sm font-medium text-[#5b4337]">API key de Khipu</label>
        <input id="khipu-api-key" className="form-field" type="password" autoComplete="new-password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} required />
      </div>
      <div>
        <label htmlFor="khipu-signature-secret" className="mb-2 block text-sm font-medium text-[#5b4337]">Secreto de firma de notificaciones</label>
        <input id="khipu-signature-secret" className="form-field" type="password" autoComplete="new-password" value={signatureSecret} onChange={(event) => setSignatureSecret(event.target.value)} required />
        <p className="mt-2 text-sm text-[#765b4a]">Se usa para verificar que las notificaciones de pago provienen de Khipu.</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-[#fff0e8] p-3 text-sm text-[#9d4c2a]">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-[#eef8f0] p-3 text-sm text-[#34724d]">{notice}</p>}

      <button type="submit" disabled={saving || loading} className="rounded-full bg-[#b7653e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a8532d] disabled:cursor-not-allowed disabled:opacity-60">
        {saving ? 'Guardando…' : 'Guardar credenciales'}
      </button>
    </form>
  );
}
