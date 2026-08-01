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
 *
 * REDESIGNED: Uniform pricing list — all services equal weight, no hero card.
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

  // Service data mapped by id
  const serviceInfo = {
    sup: services.sup,
    surf: services.surf,
    freedive: services.freedive,
  };

  return (
    <section id="booking" className="section section-wide">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-semibold text-linen sm:text-4xl">
          {t.booking.heading}
        </h2>
        <p className="mt-4 text-lilac max-w-lg">{t.booking.body}</p>
      </div>

      {/* Uniform pricing list — all services equal weight */}
      <div className="mx-auto mt-10 max-w-2xl">
        {PRICING.map((s) => {
          const info = serviceInfo[s.id];
          const isSelected = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`group w-full text-left py-5 border-b transition-colors ${
                isSelected
                  ? 'border-tungsten'
                  : 'border-lilac/20 hover:border-lilac/40'
              }`}
            >
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div className="flex items-baseline gap-3">
                  <h3 className={`text-lg sm:text-xl font-semibold transition-colors ${
                    isSelected ? 'text-tungsten' : 'text-linen group-hover:text-tungsten'
                  }`}>
                    {info.name}
                  </h3>
                  {isSelected && (
                    <span className="text-xs text-sea font-medium">
                      {lang === 'vi' ? 'Đã chọn' : 'Selected'}
                    </span>
                  )}
                </div>
                <span className={`text-lg sm:text-xl tabular-nums transition-colors ${
                  isSelected ? 'text-tungsten' : 'text-lilac'
                }`}>
                  {info.price}
                </span>
              </div>
              <p className="mt-1 text-lilac/80 text-sm max-w-sm">
                {info.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* VI-only Zalo invitation */}
      {lang === 'vi' && services.zaloInvite && (
        <p className="mx-auto mt-6 max-w-2xl text-sm text-sea">
          {services.zaloInvite}
        </p>
      )}

      {/* CTA */}
      <div className="mx-auto mt-10 max-w-2xl">
        <button
          onClick={handleBook}
          className="inline-flex items-center gap-2 rounded-full bg-tungsten px-8 py-4 font-semibold text-dawn transition-[transform] duration-150 ease-out hover:scale-[1.02] active:scale-95"
        >
          {t.booking.bookCta}
        </button>
      </div>
    </section>
  );
}
