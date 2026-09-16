/**
 * Bilingual content — EN / VI.
 *
 * Rules:
 * - One public price for everyone. VI shows the same price plus a Zalo invitation.
 * - Vietnamese is written as Vietnamese, not machine-translated. Where the
 *   idiomatic phrasing is uncertain, the value is marked `<!-- TODO: VI review -->`
 *   in the consuming component rather than guessed here.
 * - Unresolved business facts are TODOs in the components, not invented here.
 *
 * SEASON PIVOT (2026-09): surf season is on — surf leads everywhere (title,
 * hero, pricing order, default selection). SUP + freedive stay listed but are
 * demoted with an off-season note; their copy keeps the SUP keywords indexed
 * for the flip back when the flat-water season returns. The return month is
 * deliberately unstated until competitor season data confirms it.
 */

export type Lang = 'en' | 'vi';

export interface ServicePricing {
  id: 'sup' | 'surf' | 'freedive';
  /** Display price — identical for EN and VI. */
  price: string;
  /** 'in' = bookable now, full weight. 'off' = demoted row + season note. */
  season?: 'in' | 'off';
}

export const PRICING: ServicePricing[] = [
  { id: 'surf', price: '$65', season: 'in' },
  { id: 'sup', price: '$15', season: 'off' },
  { id: 'freedive', price: '$65', season: 'off' },
];

/** Zalo deep link for VI booking funnel. */
export const ZALO_LINK = 'https://zalo.me/84905002813';

/** Pre-filled Zalo message (where the URL scheme allows). */
export const ZALO_MESSAGE_EN =
  'Hello Nhi Local, I would like to book a session.';
export const ZALO_MESSAGE_VI =
  'Chào Nhi Local, mình muốn đặt một buổi.';

export function zaloDeepLink(lang: Lang): string {
  const msg = lang === 'vi' ? ZALO_MESSAGE_VI : ZALO_MESSAGE_EN;
  // Zalo supports a ?message query on the /me/<number> deep link in some clients.
  return `${ZALO_LINK}?message=${encodeURIComponent(msg)}`;
}

export interface Copy {
  lang: Lang;
  htmlLang: 'en' | 'vi';
  dir: 'ltr';
  /** Document <title>. */
  title: string;
  description: string;

  nav: {
    book: string;
    blog: string;
  };

  /** Blog chrome only; post copy lives in src/content/blog. */
  blog: {
    title: string;
    back: string;
    minRead: string;
    updated: string;
    newer: string;
    older: string;
    switchLang: string;
  };

  hero: {
    /** Static (fallback) hero copy. */
    staticEyebrow: string;
    staticTitle: string;
    staticSubtitle: string;
    staticCta: string;
    /** Intro-video overlay copy — driven by the video's own currentTime. */
    intro: {
      /** 0%: over the poster, before and during the opening beat. */
      open: string;
      /** ~50%: single mid-beat line. */
      mid: string;
      /** 100%: shown next to the NHI LOCAL wordmark. */
      brandSub: string;
      /** Skip-intro affordance. */
      skip: string;
      /** Replay control, shown after the intro finishes. */
      replay: string;
    };
  };

  services: {
    sup: { name: string; tagline: string; price: string; note?: string };
    surf: { name: string; tagline: string; price: string; note?: string };
    freedive: { name: string; tagline: string; price: string; note?: string };
    /** VI-only Zalo invitation line shown under pricing. */
    zaloInvite?: string;
  };

  booking: {
    heading: string;
    body: string;
    bookCta: string;
    bookVia: string; // "Book via cal.com" / "Đặt qua Zalo"
    availabilityNote: string;
  };

  sections: {
    meetNhi: {
      eyebrow: string;
      title: string;
      body: string;
    };
    media: {
      eyebrow: string;
      title: string;
    };
    howItWorks: {
      eyebrow: string;
      title: string;
      steps: { n: string; title: string; body: string }[];
    };
    meetingPoint: {
      eyebrow: string;
      title: string;
      body: string;
    };
    faq: {
      eyebrow: string;
      title: string;
      items: { q: string; a: string }[];
    };
    footer: {
      tagline: string;
      contact: string;
      socials: string;
      rights: string;
    };
  };
}

const EN: Copy = {
  lang: 'en',
  htmlLang: 'en',
  dir: 'ltr',
  title: 'Nhi Local — Surf Lessons on My An Beach, Da Nang',
  description:
    'Beginner-friendly surf lessons on My An Beach, Da Nang — surf season is here. Stand-up paddleboard (SUP) and freedive sessions return to Man Thai Beach when the sea calms. Small groups, equipment provided.',
  nav: { book: 'Book', blog: 'Blog' },
  blog: {
    title: 'Blog',
    back: 'All posts',
    minRead: 'min read',
    updated: 'Updated',
    newer: 'Newer',
    older: 'Older',
    switchLang: 'Switch language',
  },
  hero: {
    staticEyebrow: 'My An Beach · Da Nang',
    staticTitle: 'Surf Season.',
    staticSubtitle:
      'Beginner-friendly surf lessons on My An Beach — small groups, boards provided. SUP and freedive return when the sea calms.',
    staticCta: 'Book a session',
    intro: {
      open: 'SURF · SUP · DIVE',
      mid: '',
      brandSub: 'My An Beach · Da Nang',
      skip: 'Skip intro',
      replay: 'Replay intro',
    },
  },
  services: {
    sup: {
      name: 'Stand-Up Paddleboard',
      tagline: 'Gentle dawn sessions on flat water.',
      price: '$15',
      note: 'Off season now — SUP returns to Man Thai when the sea calms. Message us to plan ahead.',
    },
    surf: {
      name: 'Surfing',
      tagline: 'Beginner-friendly waves on My An Beach.',
      price: '$65',
    },
    freedive: {
      name: 'Freediving',
      tagline: 'Breath-hold sessions for calm water.',
      price: '$65',
      note: 'Off season now — freediving returns with the flat-water season.',
    },
  },
  booking: {
    heading: 'Book your session',
    body: 'Surf is in season now. Pick a date and time — sessions run about 60 minutes, all equipment provided on the beach.',
    bookCta: 'Book online',
    bookVia: 'via cal.com',
    availabilityNote:
      'Session times are listed below. Live availability is shown in the booking calendar.',
  },
  sections: {
    meetNhi: {
      eyebrow: 'Meet Nhi',
      title: 'Your guide on the water',
      body: 'Nhi runs every session personally — from the first message to the last stroke back to shore. This is a small, local operation: one instructor, small groups, and the same stretches of sand every morning.',
    },
    media: {
      eyebrow: 'On the water',
      title: 'Mornings on the water',
    },
    howItWorks: {
      eyebrow: 'How it works',
      title: 'Three steps to the water',
      steps: [
        {
          n: '01',
          title: 'Message to book',
          body: 'Pick a date and time through the booking calendar. You will get a confirmation message back.',
        },
        {
          n: '02',
          title: 'Meet on the beach',
          body: 'We meet on the beach before dawn — My An for surf, Man Thai for SUP. Boards and equipment are ready on the sand.',
        },
        {
          n: '03',
          title: 'Paddle out',
          body: 'A 60-minute session on the water. We land before the beach gets busy.',
        },
      ],
    },
    meetingPoint: {
      eyebrow: 'Meeting point',
      title: 'My An Beach, Da Nang',
      body: 'Surf sessions are on My An Beach, just south of central Da Nang. SUP and freedive sessions are on Man Thai Beach, on the Son Tra side — they return when the flat-water season does. Exact meeting points are confirmed in your booking message.',
    },
    faq: {
      eyebrow: 'Questions',
      title: 'Good to know',
      items: [
        {
          q: 'What is included?',
          a: 'All equipment for your session and a 60-minute time on the water with Nhi.',
        },
        {
          q: 'What should I bring?',
          a: 'Swimwear, a towel, and sunscreen. A hat and a bottle of water are a good idea.',
        },
        {
          q: 'What if the weather is bad?',
          a: 'Weather and cancellation are handled in chat after you book — there is no fixed policy on the page. We will reschedule or refund as needed.',
        },
        {
          q: 'What are the session times?',
          a: 'Sessions run around sunrise. Proposed times are 04:45, 05:30, and 06:15 — confirm the exact slot in the booking calendar.',
        },
        {
          q: 'Is there somewhere to keep valuables?',
          a: 'A lockbox is provided on the beach for phones, wallets, and small valuables. Nhi Local cannot take responsibility for missing items, though no problems have ever occurred.',
        },
        {
          q: 'Do you offer photo and video services?',
          a: 'Photos and videos are included with surf and freedive sessions, but not with SUP. Editing services are available for an additional fee — message us for details.',
        },
        {
          q: 'When does SUP season start?',
          a: 'SUP and freedive run in the flat-water season, roughly spring through summer. Message us and we will let you know as soon as the boards go back on the water.',
        },
        {
          q: 'How big are the groups?',
          a: '<!-- TODO: maximum group size not confirmed -->',
        },
        {
          q: 'Is there an age or swimming requirement?',
          a: '<!-- TODO: age limits and swimming-ability requirements not confirmed, especially for freediving -->',
        },
      ],
    },
    footer: {
      tagline: 'Sunrise surf, SUP, and freedive in Da Nang.',
      contact: 'Contact',
      socials: 'Follow',
      rights: 'All rights reserved.',
    },
  },
};

const VI: Copy = {
  lang: 'vi',
  htmlLang: 'vi',
  dir: 'ltr',
  title: 'Nhi Local — Lướt ván trên bãi Mỹ An, Đà Nẵng',
  description:
    'Buổi học lướt ván cho người mới trên bãi Mỹ An, Đà Nẵng — đã vào mùa lướt ván. Chèo SUP và lặn tự do trở lại bãi Man Thái khi biển lặng. Nhóm nhỏ, có sẵn thiết bị.',
  nav: { book: 'Đặt', blog: 'Blog' },
  blog: {
    title: 'Blog',
    back: 'Tất cả bài viết',
    minRead: 'phút đọc',
    updated: 'Cập nhật',
    newer: 'Mới hơn',
    older: 'Cũ hơn',
    switchLang: 'Đổi ngôn ngữ',
  },
  hero: {
    staticEyebrow: 'Bãi Mỹ An · Đà Nẵng',
    staticTitle: 'Mùa Lướt Ván.',
    staticSubtitle:
      'Buổi học lướt ván thân thiện với người mới trên bãi Mỹ An — nhóm nhỏ, có sẵn ván. SUP và lặn tự do trở lại khi biển lặng.',
    staticCta: 'Đặt một buổi',
    intro: {
      open: 'SURF · SUP · DIVE',
      mid: '',
      brandSub: 'Bãi Mỹ An · Đà Nẵng',
      skip: 'Bỏ qua',
      replay: 'Xem lại',
    },
  },
  services: {
    sup: {
      name: 'Chèo SUP',
      tagline: 'Buổi chèo nhẹ nhàng đón bình minh trên mặt nước phẳng.',
      price: '$15',
      note: 'Hiện tạm nghỉ — SUP trở lại Man Thái khi biển lặng. Nhắn tin để hẹn trước cho mùa sau.',
    },
    surf: {
      name: 'Lướt ván',
      tagline: 'Sóng nhỏ thân thiện với người mới bắt đầu tại bãi Mỹ An.',
      price: '$65',
    },
    freedive: {
      name: 'Lặn tự do',
      tagline: 'Buổi lặn nín thở dành cho mặt nước yên.',
      price: '$65',
      note: 'Hiện tạm nghỉ — lặn tự do trở lại cùng mùa biển lặng.',
    },
    zaloInvite: 'Liên hệ Zalo để có giá tốt hơn.',
  },
  booking: {
    heading: 'Đặt buổi của bạn',
    body: 'Đang mùa lướt ván. Chọn ngày và giờ — mỗi buổi khoảng 60 phút, toàn bộ thiết bị có sẵn trên bãi.',
    bookCta: 'Nhắn tin qua Zalo',
    bookVia: 'qua Zalo',
    availabilityNote:
      'Các khung giờ được liệt kê bên dưới. Lịch trống cụ thể được xác nhận khi nhắn tin đặt.',
  },
  sections: {
    meetNhi: {
      eyebrow: 'Gặp Nhi',
      title: 'Người dẫn bạn trên mặt nước',
      body: 'Nhi trực tiếp phụ trách mọi buổi — từ tin nhắn đầu tiên đến nhát chèo cuối cùng trở vào bờ. Đây là hoạt động nhỏ, địa phương: một huấn luyện viên, nhóm nhỏ, và những bãi biển quen thuộc mỗi sáng.',
    },
    media: {
      eyebrow: 'Trên mặt nước',
      title: 'Những buổi sáng trên mặt nước',
    },
    howItWorks: {
      eyebrow: 'Cách thức hoạt động',
      title: 'Ba bước ra đến mặt nước',
      steps: [
        {
          n: '01',
          title: 'Nhắn tin để đặt',
          body: 'Chọn ngày và giờ qua lịch đặt. Bạn sẽ nhận được tin nhắn xác nhận.',
        },
        {
          n: '02',
          title: 'Gặp nhau trên bãi',
          body: 'Chúng mình gặp nhau trên bãi trước bình minh — Mỹ An cho lướt ván, Man Thái cho SUP. Ván và thiết bị đã sẵn sàng trên cát.',
        },
        {
          n: '03',
          title: 'Chèo ra khơi',
          body: '60 phút trên mặt nước. Chúng mình vào bờ trước khi bãi đông.',
        },
      ],
    },
    meetingPoint: {
      eyebrow: 'Điểm hẹn',
      title: 'Bãi Mỹ An, Đà Nẵng',
      body: 'Buổi lướt ván trên bãi Mỹ An, ngay phía nam trung tâm Đà Nẵng. Buổi SUP và lặn tự do trên bãi Man Thái, phía Sơn Trà — trở lại cùng mùa biển lặng. Tọa độ chính xác được xác nhận trong tin nhắn đặt của bạn.',
    },
    faq: {
      eyebrow: 'Câu hỏi',
      title: 'Cần biết thêm',
      items: [
        {
          q: 'Bao gồm những gì?',
          a: 'Toàn bộ thiết bị cho buổi của bạn và 60 phút trên mặt nước cùng Nhi.',
        },
        {
          q: 'Mình nên mang theo gì?',
          a: 'Đồ bơi, khăn, và kem chống nắng. Nón và chai nước cũng nên có.',
        },
        {
          q: 'Thời tiết xấu thì sao?',
          a: 'Việc thời tiết và huỷ buổi được xử lý qua tin nhắn sau khi đặt — không có chính sách cố định trên trang. Chúng mình sẽ dời lịch hoặc hoàn tiền khi cần.',
        },
        {
          q: 'Các khung giờ là gì?',
          a: 'Các buổi diễn ra quanh lúc bình minh. Khung giờ đề xuất là 04:45, 05:30 và 06:15 — xác nhận lại giờ chính xác trong lịch đặt.',
        },
        {
          q: 'Có chỗ để đồ giá trị không?',
          a: 'Có một hộp khóa trên bãi để điện thoại, ví và đồ giá trị nhỏ. Nhi Local không chịu trách nhiệm về đồ mất, tuy nhiên chưa từng có vấn đề gì xảy ra.',
        },
        {
          q: 'Có dịch vụ chụp ảnh và quay video không?',
          a: 'Ảnh và video được bao gồm trong buổi lướt ván và lặn tự do, nhưng không bao gồm trong buổi SUP. Dịch vụ chỉnh sửa có sẵn với phí thêm — nhắn tin để biết chi tiết.',
        },
        {
          q: 'Mùa SUP bắt đầu khi nào?',
          a: 'SUP và lặn tự do diễn ra vào mùa biển lặng, khoảng từ xuân đến hè. Nhắn tin cho mình — mình báo ngay khi ván trở lại mặt nước.',
        },
        {
          q: 'Nhóm bao nhiêu người?',
          a: '<!-- TODO: quy mô nhóm tối đa chưa được xác nhận -->',
        },
        {
          q: 'Có yêu cầu về tuổi hoặc biết bơi không?',
          a: '<!-- TODO: giới hạn tuổi và yêu cầu về khả năng bơi chưa được xác nhận, đặc biệt với lặn tự do -->',
        },
      ],
    },
    footer: {
      tagline: 'Lướt ván, chèo SUP và lặn tự do đón bình minh tại Đà Nẵng.',
      contact: 'Liên hệ',
      socials: 'Theo dõi',
      rights: 'Đã đăng ký bản quyền.',
    },
  },
};

export const COPY: Record<Lang, Copy> = { en: EN, vi: VI };

export function copyFor(lang: Lang): Copy {
  return COPY[lang] ?? EN;
}
