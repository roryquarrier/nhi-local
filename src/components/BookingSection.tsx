import { useEffect, useState } from 'react';
import {
  COPY,
  zaloDeepLink,
  PRICING,
  type Lang,
  type ServicePricing,
} from '../lib/translations';

/**
 * Booking section — language-aware.
 *
 * EN: cal.com floating popup is already loaded globally in Layout.astro.
 *     An inline "Book with cal.com" button triggers the floating popup namespace.
 * VI: Zalo deep link to https://zalo.me/84905002813 with a pre-filled message.
 *
 * One public price for everyone. VI shows the same prices plus a Zalo
 * invitation ("Liên hệ Zalo để có giá tốt hơn.").
 *
 * Availability dots are intentionally omitted — real cal.com data is not wired
 * and we never display fabricated availability. Session times are shown as
 * plain text.
 */
export default function BookingSection() {
  const [lang, setLang] = useState<Lang>('en');
  const [selected, setSelected] = useState<ServicePricing['id']>('sup');

  useEffect(() => {
    const url = new URL(window.location.href);
    const param = url.searchParams.get('lang');
    if (param === 'vi' || param === 'en') setLang(param as Lang);

    const onLang = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lang: Lang };
      if (detail?.lang) setLang(detail.lang);
    };
    window.addEventListener('langchange', onLang);
    return () => window.removeEventListener('langchange', onLang);
  }, []);

  const t = COPY[lang];
  const services = t.services;

  const handleBook = () => {
    if (lang === 'vi') {
      // VI funnel — Zalo deep link
      window.open(zaloDeepLink('vi'), '_blank', 'noopener,noreferrer');
    } else {
      // EN funnel — trigger the cal.com floating popup for the "sup" namespace.
      // The embed is loaded in Layout.astro; calling Cal.ns.sup('ui', ...)
      // opens the popup. We fall back to the cal.com page if the API is missing.
      const cal = (window as unknown as { Cal?: { ns?: Record<string, { (k: string, v: unknown): void }> } }).Cal;
      if (cal?.ns?.sup) {
        try {
          cal.ns.sup('open', {});
          return;
        } catch {
          /* fall through to direct link */
        }
      }
      window.open('https://cal.com/rory-quarrier-nsavjf/sup', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="booking" className="section section-wide">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-sm tracking-widest text-sea uppercase">
          {lang === 'vi' ? 'Đặt buổi' : 'Booking'}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-linen sm:text-4xl">
          {t.booking.heading}
        </h2>
        <p className="mt-4 text-lilac">{t.booking.body}</p>
      </div>

      {/* Service tiles */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {PRICING.map((s) => {
          const info =
            s.id === 'sup'
              ? services.sup
              : s.id === 'surf'
                ? services.surf
                : services.freedive;
          const isSelected = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`rounded-2xl border p-5 text-left transition-colors ${
                isSelected
                  ? 'border-tungsten bg-coffee/40'
                  : 'border-lilac/20 bg-coffee/10 hover:border-lilac/40'
              }`}
            >
              <h3 className="text-lg font-semibold text-linen">{info.name}</h3>
              <p className="mt-1 text-sm text-lilac">{info.tagline}</p>
              <p className="mt-4 font-mono text-2xl text-tungsten">
                {info.price}
              </p>
            </button>
          );
        })}
      </div>

      {/* VI-only Zalo invitation */}
      {lang === 'vi' && services.zaloInvite && (
        <p className="mt-4 text-center text-sm text-sea">
          {services.zaloInvite}
        </p>
      )}

      {/* Session times — plain text, NO availability dots (no fabricated data). */}
      <div className="mx-auto mt-8 max-w-2xl text-center">
        <p className="font-mono text-xs tracking-widest text-lilac/70 uppercase">
          {lang === 'vi' ? 'Khung giờ' : 'Session times'}
        </p>
        <p className="mt-2 text-lilac">
          04:45 · 05:30 · 06:15
          {/* TODO: session times 04:45 / 05:30 / 06:15 are proposed, not confirmed */}
        </p>
        <p className="mt-3 text-xs text-lilac/60">{t.booking.availabilityNote}</p>
      </div>

      {/* CTA */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={handleBook}
          className="inline-flex items-center gap-2 rounded-full bg-tungsten px-8 py-4 font-semibold text-dawn transition-transform hover:scale-[1.02] active:scale-95"
        >
{t.booking.bookCta}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-lilac/60">{t.booking.bookVia}</p>
    </section>
  );
}
