import { useEffect, useState } from 'react';
import type { Lang } from '../lib/translations';

/**
 * Persistent EN/VI toggle, top-right, visible at all scroll positions.
 *
 * Switches copy and the conversion funnel (cal.com for EN, Zalo for VI).
 * It never switches price — there is one public price for everyone.
 *
 * Persists via the `lang` URL query param and a localStorage cache; other
 * components react by listening for the window 'langchange' event.
 */
export default function LanguageToggle() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    // Prefer URL param, then localStorage, then default 'en'.
    const url = new URL(window.location.href);
    const param = url.searchParams.get('lang');
    const stored =
      (typeof localStorage !== 'undefined' &&
        (localStorage.getItem('nhi-lang') as Lang | null)) ||
      null;
    const initial: Lang =
      param === 'vi' || param === 'en'
        ? (param as Lang)
        : stored === 'vi' || stored === 'en'
          ? (stored as Lang)
          : 'en';
    setLang(initial);
    document.documentElement.lang = initial;
  }, []);

  const toggle = () => {
    const newLang: Lang = lang === 'en' ? 'vi' : 'en';
    setLang(newLang);
    document.documentElement.lang = newLang;
    try {
      localStorage.setItem('nhi-lang', newLang);
    } catch {
      /* localStorage may be unavailable; ignore */
    }

    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);
    window.history.replaceState({}, '', url);

    // Notify other components (BookingSection, etc.)
    window.dispatchEvent(
      new CustomEvent('langchange', { detail: { lang: newLang } })
    );
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-16 right-3 z-50 flex items-center gap-1.5 rounded-full border border-[#B9C4D0]/30 bg-[#0E1420]/80 px-3 py-1.5 font-mono text-xs tracking-wider backdrop-blur-sm transition-colors hover:border-[#FFB25E]/50"
      aria-label="Toggle language"
    >
      <span className={lang === 'en' ? 'text-[#FFB25E]' : 'text-[#B9C4D0]'}>
        EN
      </span>
      <span className="text-[#B9C4D0]/40">/</span>
      <span className={lang === 'vi' ? 'text-[#FFB25E]' : 'text-[#B9C4D0]'}>
        VI
      </span>
    </button>
  );
}
