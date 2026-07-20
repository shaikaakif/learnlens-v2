'use client';

import { useEffect, useRef } from 'react';
import { logClientEvent } from '@/app/actions/analytics';

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function AnalyticsTracker() {
  const trackedAppOpen = useRef(false);

  useEffect(() => {
    // 1. Track App Open once per session
    if (!trackedAppOpen.current) {
      trackedAppOpen.current = true;
      const deviceType = getDeviceType();
      logClientEvent('app_open', deviceType).catch(() => {});
    }

    // 2. Track PWA Installation
    const handleAppInstalled = () => {
      const deviceType = getDeviceType();
      logClientEvent('pwa_install', deviceType).catch(() => {});
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null; // Silent component
}
