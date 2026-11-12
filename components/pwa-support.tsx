'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const DISMISSED_KEY = 'panaderia-pwa-install-dismissed-v1';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true;
}

export function PwaSupport() {
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [installError, setInstallError] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isAppleMobile = /iPhone|iPad|iPod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIos(isAppleMobile);
    setIsInstalled(isStandalone());
    setIsOffline(!navigator.onLine);

    try {
      setDismissed(window.localStorage.getItem(DISMISSED_KEY) === 'true');
    } catch (error) {
      console.warn('No se pudo leer la preferencia de instalación PWA.', error);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error: unknown) => {
        console.error('No se pudo registrar el service worker de Panadería.', error);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function dismissInstallPrompt() {
    setDismissed(true);
    setShowIosInstructions(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, 'true');
    } catch (error) {
      console.warn('No se pudo guardar la preferencia de instalación PWA.', error);
    }
  }

  async function installApp() {
    if (!installPrompt) return;
    setInstallError(false);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === 'accepted') setIsInstalled(true);
      else dismissInstallPrompt();
    } catch (error) {
      console.error('No se pudo iniciar la instalación de Panadería.', error);
      setInstallError(true);
    }
  }

  const canShowInstaller = !isInstalled && !dismissed && (isIos || installPrompt !== null);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-[60] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:max-w-sm">
      {isOffline && (
        <p role="status" className="pointer-events-auto w-full rounded-2xl border border-[#f0e3d0] bg-[#fffdf9] px-4 py-3 text-sm text-[#5b4337] shadow-lg">
          Sin conexión. Catálogo, pedidos y pagos requieren Internet.
        </p>
      )}

      {canShowInstaller && (
        <section className="pointer-events-auto relative w-full rounded-2xl border border-[#f0e3d0] bg-[#fffdf9] p-4 pr-12 text-[#2a1d18] shadow-lg" aria-label="Instalar aplicación">
          {isIos ? (
            <>
              {showIosInstructions ? (
                <div>
                  <h2 className="font-semibold">Añadir Panadería a inicio</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5b4337]">
                    En Safari, toca <strong>Compartir</strong>, elige <strong>Añadir a pantalla de inicio</strong> y confirma con <strong>Añadir</strong>.
                  </p>
                  <button type="button" onClick={dismissInstallPrompt} className="mt-3 min-h-11 rounded-full border border-[#d9b98f] px-4 text-sm font-medium text-[#5b4337]">
                    Entendido
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Instala Panadería en tu pantalla de inicio.</p>
                  <button type="button" onClick={() => setShowIosInstructions(true)} className="min-h-11 shrink-0 rounded-full bg-[#b7653e] px-4 text-sm font-semibold text-white">
                    Cómo instalar
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Instala Panadería en este dispositivo.</p>
              <button type="button" onClick={installApp} className="min-h-11 shrink-0 rounded-full bg-[#b7653e] px-4 text-sm font-semibold text-white">
                Instalar
              </button>
            </div>
          )}
          {installError && <p role="alert" className="mt-2 text-sm text-[#9d4c2a]">No se pudo iniciar la instalación. Inténtalo de nuevo.</p>}
          <button type="button" onClick={dismissInstallPrompt} aria-label="Cerrar aviso de instalación" className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-lg text-[#5b4337]">
            ×
          </button>
        </section>
      )}
    </div>
  );
}
