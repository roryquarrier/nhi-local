import { useEffect, useState } from 'react';
import {
  COPY,
  zaloDeepLink,
  PRICING,
  type Lang,
  type ServicePricing,
} from '../lib/translations';

const CAL_LINKS: Record<ServicePricing['id'], string> = {
  sup: 'rory-quarrier-nsavjf/sup',
  surf: 'rory-quarrier-nsavjf/surf',
  freedive: 'rory-quarrier-nsavjf/dive',
};

/** cal.com embed queue API — see the "sup" namespace initialised in Layout.astro. */
type CalApi = (action: string, config?: unknown) => void;

/**
 * Open the cal.com booking popup for the "sup" namespace.
 *
 * The embed exposes `modal({ calLink, config })` — there is no `open` action,
 * which is why the previous `Cal.ns.sup('open', {})` call silently did nothing.
 * `Cal.ns.sup` exists synchronously (it is a queue stub) even before
 * embed.js finishes loading, so the call is safe at any time.
 */
function openCal(calLink: string) {
  const cal = (window as unknown as { Cal?: { ns?: Record<string, CalApi> } }).Cal;
  try {
    if (cal?.ns?.sup) {
      cal.ns.sup('modal', { calLink, config: { layout: 'month_view' } });
      return;
    }
  } catch {
    /* fall through to the direct link */
  }
  window.open(`https://cal.com/${calLink}`, '_blank', 'noopener,noreferrer');
}

/**
 * Booking section — language-aware.
 *
 * EN: a single "Book with cal.com" button opens the cal.com popup.
 * VI: cal.com popup *and* a Zalo deep link, because discounts are negotiated
 *     over Zalo — both funnels have to stay reachable.
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

  const openZalo = () => {
    window.open(zaloDeepLink('vi'), '_blank', 'noopener,noreferrer');
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

      {/* CTA — EN has one funnel (cal.com); VI has both, Zalo carrying the discount. */}
      <div className="mx-auto mt-10 max-w-2xl">
        {lang === 'vi' ? (
          <>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openCal(CAL_LINKS[selected])}
                className="inline-flex items-center gap-2 rounded-full bg-tungsten px-8 py-4 font-semibold text-dawn transition-[transform] duration-150 ease-out hover:scale-[1.02] active:scale-95"
              >
                Đặt trực tuyến
              </button>
              <button
                onClick={openZalo}
                className="inline-flex items-center gap-2 rounded-full border border-tungsten px-8 py-4 font-semibold text-tungsten transition-colors duration-150 ease-out hover:bg-tungsten hover:text-dawn"
              >
                Đặt qua Zalo
              </button>
            </div>
            <p className="mt-4 text-sm text-sea">Giảm giá khi đặt qua Zalo</p>
          </>
        ) : (
          <button
            onClick={() => openCal(CAL_LINKS[selected])}
            className="inline-flex items-center gap-2 rounded-full bg-tungsten px-8 py-4 font-semibold text-dawn transition-[transform] duration-150 ease-out hover:scale-[1.02] active:scale-95"
          >
            {t.booking.bookCta}
          </button>
        )}
      </div>
    </section>
  );
}
