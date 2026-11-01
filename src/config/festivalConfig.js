/**
 * Configurable Festival Configuration & Default Seed Data
 * Uses VITE_DIWALI_DATE environment variable if provided, otherwise dynamically
 * resolves to the upcoming Maha Deepavali celebration date.
 */

const UPCOMING_DIWALI_DATES = [
  '2026-11-08T00:00:00+05:30', // Diwali 2026 (Lakshmi Puja)
  '2027-10-29T00:00:00+05:30', // Diwali 2027
  '2028-10-17T00:00:00+05:30', // Diwali 2028
  '2029-11-05T00:00:00+05:30', // Diwali 2029
];

export function getConfigurableDiwaliDate(customOverride = null) {
  if (customOverride) {
    const parsedCustom = new Date(customOverride);
    if (!Number.isNaN(parsedCustom.getTime())) {
      return parsedCustom;
    }
  }

  const envDate = import.meta.env?.VITE_DIWALI_DATE;
  if (envDate) {
    const parsedEnv = new Date(envDate);
    if (!Number.isNaN(parsedEnv.getTime()) && parsedEnv.getTime() > Date.now()) {
      return parsedEnv;
    }
  }

  const now = Date.now();
  for (const dateStr of UPCOMING_DIWALI_DATES) {
    const target = new Date(dateStr);
    if (target.getTime() > now) {
      return target;
    }
  }

  // Fallback: 7 days from now if all preset dates have passed
  return new Date(now + 7 * 24 * 60 * 60 * 1000);
}

export const FESTIVAL_PRESET_DATES = [
  { label: 'Diwali 2026 (Nov 8, 2026)', value: '2026-11-08T00:00:00+05:30' },
  { label: 'Dhanteras 2026 (Nov 6, 2026)', value: '2026-11-06T00:00:00+05:30' },
  { label: 'Choti Diwali 2026 (Nov 7, 2026)', value: '2026-11-07T00:00:00+05:30' },
  { label: 'Govardhan Puja (Nov 9, 2026)', value: '2026-11-09T00:00:00+05:30' },
  { label: 'Bhai Dooj (Nov 10, 2026)', value: '2026-11-10T00:00:00+05:30' },
  { label: 'Diwali 2027 (Oct 29, 2027)', value: '2027-10-29T00:00:00+05:30' },
];

export const DEFAULT_GREETING_TEMPLATES = [
  {
    id: 'tpl-royal-gold-en',
    title: 'Royal Golden Blessings',
    category: 'royal',
    language: 'en',
    greeting_text: 'May this Diwali bring happiness, prosperity and endless blessings to your life!',
    image_url: '/templates/royal-gold.svg',
    accent_color: '#FFD700',
    bg_theme: 'royal-purple',
    is_active: true,
  },
  {
    id: 'tpl-lakshmi-prosperity-en',
    title: 'Lakshmi Prosperity Radiance',
    category: 'prosperity',
    language: 'en',
    greeting_text: 'May the divine light of Diwali spread peace, wealth, joy, and good health in your home.',
    image_url: '/templates/lakshmi-lotus.svg',
    accent_color: '#FF8C00',
    bg_theme: 'crimson-palace',
    is_active: true,
  },
  {
    id: 'tpl-million-diyas-en',
    title: 'Festival of Million Diyas',
    category: 'traditional',
    language: 'en',
    greeting_text: 'Let every clay diya you light tonight reflect warmth, love, and new beginnings for your family.',
    image_url: '/templates/million-diyas.svg',
    accent_color: '#FFD700',
    bg_theme: 'midnight-indigo',
    is_active: true,
  },
  {
    id: 'tpl-sacred-sanskriti-en',
    title: 'Sacred Sanskriti Shimmer',
    category: 'spiritual',
    language: 'en',
    greeting_text: 'Wishing you a sparkling Festival of Lights filled with sweet moments and cherished memories!',
    image_url: '/templates/sanskriti-mandala.svg',
    accent_color: '#FFF4DC',
    bg_theme: 'emerald-gold',
    is_active: true,
  },
  {
    id: 'tpl-shubh-deepavali-hi',
    title: 'शुभ दीपावली मंगलकामना',
    category: 'traditional',
    language: 'hi',
    greeting_text: 'आपको और आपके परिवार को दीपावली की हार्दिक शुभकामनाएं!',
    image_url: '/templates/hindi-shubh.svg',
    accent_color: '#FFD700',
    bg_theme: 'royal-purple',
    is_active: true,
  },
  {
    id: 'tpl-sukh-samriddhi-hi',
    title: 'सुख, समृद्धि और वैभव',
    category: 'prosperity',
    language: 'hi',
    greeting_text: 'दीपों का यह पावन त्योहार आपके जीवन में सुख, शांति, समृद्धि और अनंत खुशियां लेकर आए। शुभ दिवाली!',
    image_url: '/templates/hindi-lakshmi.svg',
    accent_color: '#FF8C00',
    bg_theme: 'crimson-palace',
    is_active: true,
  },
  {
    id: 'tpl-parivar-utsav-hi',
    title: 'जगमगाती खुशियों का पर्व',
    category: 'family',
    language: 'hi',
    greeting_text: 'माँ लक्ष्मी और भगवान गणेश की कृपा से आपका घर हमेशा खुशियों और उजालों से जगमगाता रहे।',
    image_url: '/templates/hindi-parivar.svg',
    accent_color: '#FFD700',
    bg_theme: 'midnight-indigo',
    is_active: true,
  },
  {
    id: 'tpl-prem-prakash-hi',
    title: 'प्रेम और प्रकाश का उत्सव',
    category: 'modern',
    language: 'hi',
    greeting_text: 'हर दिया आपके आंगन में नई उम्मीद, मधुर मुस्कान और सुनहरा कल लेकर आए। दीपावली की मंगलकामनाएं!',
    image_url: '/templates/hindi-prakash.svg',
    accent_color: '#FFF4DC',
    bg_theme: 'saffron-royal',
    is_active: true,
  },
];

export const CARD_BACKGROUNDS = [
  {
    id: 'royal-purple',
    name: 'Royal Palace Purple',
    primary: '#160B2D',
    secondary: '#29104A',
    tertiary: '#0D0618',
    border: '#FFD700',
    glow: '#FF8C00',
  },
  {
    id: 'crimson-palace',
    name: 'Udaipur Crimson & Gold',
    primary: '#3A081E',
    secondary: '#6B0F2B',
    tertiary: '#1B030E',
    border: '#FFD700',
    glow: '#FFA500',
  },
  {
    id: 'midnight-indigo',
    name: 'Midnight Celestial Indigo',
    primary: '#0B1338',
    secondary: '#192766',
    tertiary: '#05081C',
    border: '#FFD700',
    glow: '#FF8C00',
  },
  {
    id: 'emerald-gold',
    name: 'Jaipur Emerald Jewel',
    primary: '#072A24',
    secondary: '#0E4B3E',
    tertiary: '#041714',
    border: '#FFD700',
    glow: '#FFD700',
  },
  {
    id: 'saffron-royal',
    name: 'Sacred Marigold Saffron',
    primary: '#421804',
    secondary: '#7C2D12',
    tertiary: '#1F0A02',
    border: '#FFD700',
    glow: '#FFF4DC',
  },
];

