/**
 * Smart AI App Launch Utility for LearnLens AI
 * Handles clipboard prompt copying, platform detection, native app intent launching,
 * external browser fallback, and lightweight toast notifications.
 */

export interface PlatformInfo {
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  isStandalone: boolean;
}

export function detectPlatform(): PlatformInfo {
  if (typeof window === 'undefined') {
    return { isAndroid: false, isIOS: false, isDesktop: true, isStandalone: false };
  }

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isDesktop = !isAndroid && !isIOS;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as unknown as { standalone?: boolean }).standalone));

  return { isAndroid, isIOS, isDesktop, isStandalone };
}

export async function copyPromptToClipboard(promptText: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(promptText);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API write failed, trying fallback:', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = promptText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error('Fallback copy failed:', fallbackErr);
    return false;
  }
}

export async function openAITutor(
  provider: 'chatgpt' | 'gemini',
  prompt: string,
  onToast?: (message: string) => void
): Promise<void> {
  const providerName = provider === 'chatgpt' ? 'ChatGPT' : 'Gemini';

  // 1. Copy prompt to clipboard
  const copied = await copyPromptToClipboard(prompt);
  if (copied && onToast) {
    onToast(`Prompt copied. Opening ${providerName}...`);
  } else if (onToast) {
    onToast(`Opening ${providerName}...`);
  }

  // 2. Platform detection
  const { isAndroid, isIOS } = detectPlatform();

  const webUrls = {
    chatgpt: 'https://chatgpt.com',
    gemini: 'https://gemini.google.com',
  };

  // Android Intent URLs attempt launching native installed app directly; fallback to HTTPS
  const androidIntents = {
    chatgpt: 'intent://chatgpt.com/#Intent;scheme=https;package=com.openai.chatgpt;S.browser_fallback_url=https%3A%2F%2Fchatgpt.com%2F;end;',
    gemini: 'intent://gemini.google.com/#Intent;scheme=https;package=com.google.android.apps.bard;S.browser_fallback_url=https%3A%2F%2Fgemini.google.com%2F;end;',
  };

  const iosSchemes = {
    chatgpt: 'chatgpt://',
    gemini: 'googleapp://',
  };

  const webUrl = webUrls[provider];

  if (isAndroid) {
    // Attempt launching native Android intent outside PWA window
    try {
      window.location.href = androidIntents[provider];
    } catch {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
  } else if (isIOS) {
    // Attempt iOS scheme then fallback after brief delay if app not installed
    const start = Date.now();
    try {
      window.location.href = iosSchemes[provider];
    } catch {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    }, 1200);
  } else {
    // Desktop / Browser — Open in new tab
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }
}
