'use client';

// Thin wrapper around Capacitor so the code still runs in a normal browser.
// All calls are no-ops on web — the same bundle powers the website AND the native apps.

let _cap: any = null;
async function cap() {
  if (_cap) return _cap;
  if (typeof window === 'undefined') return null;
  try {
    const mod = await import('@capacitor/core');
    _cap = mod.Capacitor;
    return _cap;
  } catch {
    return null;
  }
}

export async function isNative(): Promise<boolean> {
  const c = await cap();
  return !!(c && c.isNativePlatform && c.isNativePlatform());
}

export async function getPlatform(): Promise<'ios' | 'android' | 'web'> {
  const c = await cap();
  if (!c) return 'web';
  const p = c.getPlatform ? c.getPlatform() : 'web';
  return (p as any) || 'web';
}

export async function hapticLight() {
  if (!(await isNative())) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

export async function hapticMedium() {
  if (!(await isNative())) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}

export async function hapticSuccess() {
  if (!(await isNative())) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

export async function hapticError() {
  if (!(await isNative())) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Error });
  } catch {}
}

export async function applyStatusBarTheme(theme: 'dark' | 'light') {
  if (!(await isNative())) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color: theme === 'dark' ? '#05060a' : '#f6f7fb' });
  } catch {}
}

export async function hideSplash() {
  if (!(await isNative())) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {}
}

export async function onBackButton(handler: () => boolean) {
  if (!(await isNative())) return () => {};
  try {
    const { App } = await import('@capacitor/app');
    const sub = await App.addListener('backButton', () => {
      const handled = handler();
      if (!handled) App.exitApp();
    });
    return () => sub.remove();
  } catch {
    return () => {};
  }
}

export async function openExternal(url: string) {
  if (!(await isNative())) { window.open(url, '_blank'); return; }
  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } catch { window.open(url, '_blank'); }
}
