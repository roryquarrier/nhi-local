/**
 * Bilingual content — EN / VI.
 *
 * Rules:
 * - One public price for everyone. VI shows the same price plus a Zalo invitation.
 * - Vietnamese is written as Vietnamese, not machine-translated. Where the
 *   idiomatic phrasing is uncertain, the value is marked `<!-- TODO: VI review -->`
 *   in the consuming component rather than guessed here.
 * - Unresolved business facts are TODOs in the components, not invented here.
 */

export type Lang = 'en' | 'vi';

export interface ServicePricing {
  id: 'sup' | 'surf' | 'freedive';
  /** Display price — identical for EN and VI. */
  price: string;
}

export const PRICING: ServicePricing[] = [
  { id: 'sup', price: '300,000₫' },
  { id: 'surf', price: '1,600,000₫' },
  { id: 'freedive', price: '1,500,000₫' },
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
    sup: { name: string; tagline: string; price: string };
    surf: { name: string; tagline: string; price: string };
    freedive: { name: string; tagline: string; price: string };
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
  title: 'Nhi Local — Sunrise SUP on Man Thai Beach',
  description:
    'Stand-up paddleboard, surf, and freedive sessions on Man Thai Beach, Da Nang. Small groups, equipment provided, 60-minute sessions.',
  nav: { book: 'Book' },
  hero: {
    staticEyebrow: 'Man Thai Beach · Da Nang',
    staticTitle: 'Sunrise Paddle.',
    staticSubtitle:
      'SUP, surf, and freedive sessions with Nhi Local. Small groups, equipment provided, 60 minutes on the water.',
    staticCta: 'Book a session',
    intro: {
      open: 'SUP SURF DIVE',
      mid: '',
      brandSub: 'Man Thai Beach · Da Nang',
      skip: 'Skip intro',
      replay: 'Replay intro',
    },
  },
  services: {
    sup: {
      name: 'Stand-Up Paddleboard',
      tagline: 'Gentle dawn sessions on flat water.',
      price: '300,000₫',
    },
    surf: {
      name: 'Surfing',
      tagline: 'Beginner-friendly waves on Man Thai Beach.',
      price: '1,600,000₫',
    },
    freedive: {
      name: 'Freediving',
      tagline: 'Breath-hold sessions for calm water.',
      price: '1,500,000₫',
    },
  },
  booking: {
    heading: 'Book your session',
    body: 'Choose a time and date. Sessions run about 60 minutes; all equipment is provided on the beach.',
    bookCta: 'Book with cal.com',
    bookVia: 'via cal.com',
    availabilityNote:
      'Session times are listed below. Live availability is shown in the booking calendar.',
  },
  sections: {
    meetNhi: {
      eyebrow: 'Meet Nhi',
      title: 'Your guide on the water',
      body: 'Nhi runs every session personally — from the first message to the last stroke back to shore. This is a small, local operation: one instructor, small groups, and the same beach every morning.',
    },
    media: {
      eyebrow: 'On the water',
      title: 'Mornings at Man Thai',
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
          body: 'We meet on Man Thai Beach before dawn. Boards and equipment are ready on the sand.',
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
      title: 'Man Thai Beach, Da Nang',
      body: 'We meet on the sand at Man Thai Beach, on the Son Tra side of Da Nang. The exact pin is confirmed in your booking message.',
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
          a: 'Yes — photo and video services are available, including recording and edited videos or photos. Contact us via messaging for further details.',
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
      tagline: 'Sunrise SUP, surf, and freedive on Man Thai Beach.',
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
  title: 'Nhi Local — Chèo SUP đón bình minh trên Man Thai',
  description:
    'Buổi chèo SUP, lướt ván và lặn tự do trên bãi Man Thái, Đà Nẵng. Nhóm nhỏ, có sẵn thiết bị, mỗi buổi 60 phút.',
  nav: { book: 'Đặt' },
  hero: {
    staticEyebrow: 'Bãi Man Thái · Đà Nẵng',
    staticTitle: 'Chèo SUP Bình Minh.',
    staticSubtitle:
      'Buổi chèo SUP, lướt ván và lặn tự do cùng Nhi Local. Nhóm nhỏ, có sẵn thiết bị, 60 phút trên mặt nước.',
    staticCta: 'Đặt một buổi',
    intro: {
      open: 'SUP SURF DIVE',
      mid: '',
      brandSub: 'Bãi Man Thái · Đà Nẵng',
      skip: 'Bỏ qua',
      replay: 'Xem lại',
    },
  },
  services: {
    sup: {
      name: 'Chèo SUP',
      tagline: 'Buổi chèo nhẹ nhàng đón bình minh trên mặt nước phẳng.',
      price: '300.000₫',
    },
    surf: {
      name: 'Lướt ván',
      tagline: 'Sóng nhỏ thân thiện với người mới bắt đầu tại bãi Man Thái.',
      price: '1.600.000₫',
    },
    freedive: {
      name: 'Lặn tự do',
      tagline: 'Buổi lặn nín thở dành cho mặt nước yên.',
      price: '1.500.000₫',
    },
    zaloInvite: 'Liên hệ Zalo để có giá tốt hơn.',
  },
  booking: {
    heading: 'Đặt buổi của bạn',
    body: 'Chọn ngày và giờ. Mỗi buổi kéo dài khoảng 60 phút; toàn bộ thiết bị được chuẩn bị sẵn trên bãi.',
    bookCta: 'Nhắn tin qua Zalo',
    bookVia: 'qua Zalo',
    availabilityNote:
      'Các khung giờ được liệt kê bên dưới. Lịch trống cụ thể được xác nhận khi nhắn tin đặt.',
  },
  sections: {
    meetNhi: {
      eyebrow: 'Gặp Nhi',
      title: 'Người dẫn bạn trên mặt nước',
      body: 'Nhi trực tiếp phụ trách mọi buổi — từ tin nhắn đầu tiên đến nhát chèo cuối cùng trở vào bờ. Đây là hoạt động nhỏ, địa phương: một huấn luyện viên, nhóm nhỏ, và cùng một bãi biển mỗi sáng.',
    },
    media: {
      eyebrow: 'Trên mặt nước',
      title: 'Những buổi sáng tại Man Thái',
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
          body: 'Chúng mình gặp nhau trên bãi Man Thái trước bình minh. Ván và thiết bị đã sẵn sàng trên cát.',
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
      title: 'Bãi Man Thái, Đà Nẵng',
      body: 'Chúng mình gặp nhau trên cát tại bãi Man Thái, phía Sơn Trà của Đà Nẵng. Tọa độ chính xác sẽ được xác nhận trong tin nhắn đặt của bạn.',
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
          a: 'Có — dịch vụ chụp ảnh và quay video có sẵn, bao gồm thu hình và video/ảnh đã chỉnh sửa. Vui lòng nhắn tin để biết thêm chi tiết.',
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
      tagline: 'Chèo SUP, lướt ván và lặn tự do đón bình minh tại bãi Man Thái.',
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
