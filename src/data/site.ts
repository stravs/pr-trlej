export const site = {
  name: "Pr' Trlej",
  legalName: "Slovenian Traditional Guest House",
  type: "Tourist farm & guesthouse",
  tagline: "A family farm stay under Dobrča, near Bled",
  description:
    "A small, family-run tourist farm on the sunny side of the Alps, between Begunje and Tržič. Rooms, apartments and suites with terraces, homemade food from the farm, animals for the children, and a covered garage for motorcyclists.",
  address: "Srednja vas 6",
  city: "Begunje na Gorenjskem",
  region: "Gorenjska",
  country: "Slovenia",
  coordinates: { lat: 46.363868, lng: 14.236697 },
  phone: "+386 40 463 563",
  email: "pr.trlej@gmail.com",
  website: "https://www.trlej.com",
  bookingUrl: "https://www.booking.com/hotel/si/pr-trlej.html",
  airbnbUrl: "https://www.airbnb.com/rooms/572883962123153467",
  facebookUrl: "https://www.facebook.com/Slovenian-Traditional-Guest-House-157700614920394/",
  hosts: "Ana, Toni & Špela",
};

// Public Bentral embed configuration; source matches each official widget.
const BENTRAL_KEY = '7c4581e7d351f54637a9bbbff8a00e80';

export const buildings = {
  guesthouse: {
    id: '5f7a55304e775f4d',
    key: BENTRAL_KEY,
    name: 'Slovenian traditional guesthouse',
    short: 'Guesthouse',
    source: 'kmetije',
  },
  farm: {
    id: '5f7a55334d415f4d',
    key: BENTRAL_KEY,
    name: 'Farm Stay Trlej',
    short: 'Farm stay',
    source: 'kmetije',
  },
  // Official campstarshine.si pitch-page widgets, checked 2026-11-11.
  camping: {
    id: '5f7a45784e515f4e',
    key: BENTRAL_KEY,
    name: 'Camp Starshine camping',
    short: 'Camping',
    source: 'web',
  },
} as const;

export const campingPitches = [
  { slug: 'tent', name: 'Tent', unit: '5f5459334d44634d' },
  { slug: 'campervan', name: 'Camper', unit: '5f5459334d44594d' },
] as const;

export type Building = keyof typeof buildings;

export function bentralBookingUrl(building: Building, pitchUnit?: string): string {
  const b = buildings[building];
  return `https://www.bentral.com/service/embed/booking.html?id=${b.id}&lang=en&key=${b.key}&source=${b.source}&width=full${building === 'camping' && pitchUnit ? `&unit=${encodeURIComponent(pitchUnit)}` : ''}`;
}

export const highlights = [
  { label: '49 beds', note: '12 units across house & farm' },
  { label: '12 km to Bled', note: 'by road' },
  { label: 'Farm animals', note: 'ponies, horses & more' },
  { label: 'Homemade breakfast', note: '€15 / person' },
  { label: 'Free parking', note: 'cars, coaches & bikes' },
  { label: 'Motorcycle garage', note: 'covered & free' },
];

export type Unit = {
  slug: string;
  name: string;
  building: Building;
  group: 'apartments' | 'suites' | 'rooms';
  type: string;
  bathroom: 'Private' | 'Shared';
  outdoor?: string;
  bedrooms?: number;
  beds: string;
  sleeps: string;
  capacity: number;
  pets: boolean;
  description: string;
  images: string[];
  featured?: boolean;
  bentral: { unit: string };
};

export const units: Unit[] = [
  // ---- Main guesthouse (private bathrooms) ----
  {
    slug: 'double-room-terrace',
    name: 'Double room with terrace',
    building: 'guesthouse',
    group: 'rooms',
    type: 'Double room',
    bathroom: 'Private',
    outdoor: 'Terrace',
    bedrooms: 1,
    beds: '1 double bed',
    sleeps: '2 guests',
    capacity: 2,
    pets: true,
    description: 'Double room with a private bathroom and terrace. Two of these rooms are available.',
    images: ['DSC1886-HDR.jpg', 'DSC1891-HDR.jpg', 'DSC1896-HDR.jpg', 'DSC1906-HDR.jpg', 'DSC1921-HDR.jpg', 'DSC1911-HDR.jpg'],
    featured: true,
    bentral: { unit: '5f4459354d515f4f' },
  },
  {
    slug: 'double-room-terrace-2',
    name: 'Double room with terrace (2nd)',
    building: 'guesthouse',
    group: 'rooms',
    type: 'Double room',
    bathroom: 'Private',
    outdoor: 'Terrace',
    bedrooms: 1,
    beds: '1 double bed',
    sleeps: '2 guests',
    capacity: 2,
    pets: true,
    description: 'The second double room with terrace. Same layout; can take an infant bed.',
    images: ['DSC1886-HDR.jpg', 'DSC1891-HDR.jpg', 'DSC1896-HDR.jpg', 'DSC1906-HDR.jpg', 'DSC1921-HDR.jpg', 'DSC1911-HDR.jpg'],
    bentral: { unit: '5f4459354e515f4f' },
  },
  {
    slug: 'apartment-liza',
    name: 'Two-bedroom apartment Liza',
    building: 'guesthouse',
    group: 'apartments',
    type: 'Apartment · 2 bedrooms',
    bathroom: 'Private',
    outdoor: 'Terrace',
    bedrooms: 2,
    beds: '2 bedrooms',
    sleeps: 'Up to 6 guests',
    capacity: 6,
    pets: true,
    description: 'Two-bedroom apartment with its own terrace and valley views. Self-catering, with space for a family or group.',
    images: ['DSC1570-HDR.jpg', 'DSC1550-HDR.jpg', 'DSC1725-HDR.jpg', 'DSC1535-HDR.jpg', 'DSC1560-HDR.jpg', 'DSC1595-HDR.jpg'],
    featured: true,
    bentral: { unit: '5f4459354d415f4f' },
  },
  {
    slug: 'apartment-spelca',
    name: 'Apartment Špelca',
    building: 'guesthouse',
    group: 'apartments',
    type: 'Apartment',
    bathroom: 'Private',
    outdoor: 'Balcony, own entrance',
    beds: 'Apartment',
    sleeps: 'Up to 4 guests',
    capacity: 4,
    pets: true,
    description: 'Apartment with a balcony and its own entrance — the most private option, named after one of the hosts.',
    images: ['DSC1745-HDR.jpg', 'DSC1760-HDR.jpg', 'DSC1755-HDR.jpg', 'DSC1740-HDR.jpg', 'DSC1765-HDR.jpg', 'DSC1786-HDR-2.jpg'],
    featured: true,
    bentral: { unit: '5f4459354d775f4f' },
  },
  {
    slug: 'apartment-nagelj',
    name: 'Apartment Nagelj',
    building: 'guesthouse',
    group: 'apartments',
    type: 'Apartment · 2 bedrooms',
    bathroom: 'Private',
    outdoor: 'Big terrace',
    bedrooms: 2,
    beds: '2 bedrooms',
    sleeps: 'Up to 7 guests',
    capacity: 7,
    pets: true,
    description: 'The largest apartment: two bedrooms and a big terrace, built for families or groups.',
    images: ['DSC1445-HDR.jpg', 'DSC1465-HDR.jpg', 'DSC1385-HDR.jpg', 'DSC1455-HDR.jpg', 'DSC1515-HDR-1.jpg', 'DSC1520-HDR.jpg'],
    featured: true,
    bentral: { unit: '5f4459354e675f4f' },
  },
  {
    slug: 'suite-nik',
    name: 'Suite Nik',
    building: 'guesthouse',
    group: 'suites',
    type: 'Suite · 3 bedrooms',
    bathroom: 'Private',
    outdoor: 'Balcony',
    bedrooms: 3,
    beds: '3 bedrooms',
    sleeps: 'Up to 6 guests',
    capacity: 6,
    pets: true,
    description: 'Three-bedroom suite with a balcony, for families or groups who want to stay together.',
    images: ['DSC1871-HDR-2.jpg', 'DSC1841-HDR-1.jpg', 'DSC1836-HDR-1.jpg', 'DSC1851-HDR-1.jpg', 'DSC1786-HDR-1.jpg'],
    featured: true,
    bentral: { unit: '5f4459354d675f4f' },
  },
  {
    slug: 'two-bedroom-suite',
    name: 'Two-bedroom suite',
    building: 'guesthouse',
    group: 'suites',
    type: 'Suite · 2 bedrooms',
    bathroom: 'Private',
    outdoor: 'Balcony',
    bedrooms: 2,
    beds: '2 bedrooms',
    sleeps: 'Up to 6 guests',
    capacity: 6,
    pets: true,
    description: 'Two-bedroom suite with a balcony and a living corner — the middle option between rooms and the largest suites.',
    images: ['DSC1640-HDR-1.jpg', 'DSC1645-HDR-1.jpg', 'DSC1660-HDR-2.jpg', 'DSC1665-HDR-1.jpg', 'DSC1690-HDR-1.jpg', 'DSC1695-HDR-1.jpg'],
    bentral: { unit: '5f4459354e415f4f' },
  },
  {
    slug: 'family-suite-kitchen',
    name: 'Family suite with kitchen',
    building: 'guesthouse',
    group: 'suites',
    type: 'Suite · kitchen & terrace',
    bathroom: 'Private',
    outdoor: 'Terrace',
    beds: 'Family suite',
    sleeps: 'Up to 4 guests',
    capacity: 4,
    pets: true,
    description: 'Family suite with its own kitchen and terrace — self-catering with a private outdoor space.',
    images: ['DSC1665-HDR-1.jpg'],
    bentral: { unit: '5f5449354e6a554d' },
  },
  // ---- Farm Stay wing (shared bathrooms) ----
  {
    slug: 'family-room-t',
    name: 'Family room with shared bathroom',
    building: 'farm',
    group: 'rooms',
    type: 'Family room',
    bathroom: 'Shared',
    beds: '1 bunk + 1 sofa + 1 double bed',
    sleeps: 'Up to 5 guests',
    capacity: 5,
    pets: false,
    description: 'Family room in the farm-stay wing, with a shared bathroom. Simpler and more affordable.',
    images: ['DSC1946-HDR.jpg', 'DSC1956-HDR.jpg', 'DSC1971-HDR.jpg', 'DSC2041-HDR.jpg'],
    bentral: { unit: '5f44637a4d515f4f' },
  },
  {
    slug: 'quadruple-room-j',
    name: 'Quadruple room with shared bathroom',
    building: 'farm',
    group: 'rooms',
    type: 'Quadruple room',
    bathroom: 'Shared',
    beds: '1 bunk + 1 double bed',
    sleeps: 'Up to 4 guests',
    capacity: 4,
    pets: false,
    description: 'Quadruple room with a shared bathroom, good for families or friends on a budget.',
    images: ['DSC1981-HDR.jpg', 'DSC1986-HDR.jpg', 'DSC1996-HDR.jpg', 'DSC2041-HDR.jpg', 'DSC2051-HDR.jpg', 'DSC2052-HDR.jpg'],
    bentral: { unit: '5f44637a4d775f4f' },
  },
  {
    slug: 'twin-room-l',
    name: 'Twin room with shared bathroom',
    building: 'farm',
    group: 'rooms',
    type: 'Twin room',
    bathroom: 'Shared',
    beds: '2 single beds',
    sleeps: '2 guests',
    capacity: 2,
    pets: false,
    description: 'Twin room with two single beds and a shared bathroom.',
    images: ['DSC2004-HDR.jpg', 'DSC2041-HDR.jpg', 'DSC2016-HDR.jpg', 'DSC2026-HDR.jpg', 'DSC2051-HDR.jpg', 'DSC2052-HDR.jpg', 'NBP5926.jpg'],
    bentral: { unit: '5f44637a4d675f4f' },
  },
  {
    slug: 'single-room-shared',
    name: 'Single room with shared bathroom',
    building: 'farm',
    group: 'rooms',
    type: 'Single room',
    bathroom: 'Shared',
    beds: '1 single bed',
    sleeps: '1 guest',
    capacity: 1,
    pets: true,
    description: 'The most compact room: one single bed with a shared bathroom. Pets allowed.',
    images: ['DSC2004-HDR.jpg'],
    bentral: { unit: '5f5441784d544d4d' },
  },
];

// Sample nightly room rates captured from the Bentral calculation widget for 3-night stays.
// low = 1–4 Dec 2026, high = 1–4 Jul 2027. Room rate only; tax, registration and meals are extra.
export const nightlyRates: Record<string, { low: number; high: number }> = {
  'double-room-terrace': { low: 99, high: 139 },
  'double-room-terrace-2': { low: 104, high: 139 },
  'apartment-liza': { low: 149, high: 229 },
  'suite-nik': { low: 159, high: 269 },
  'apartment-spelca': { low: 124, high: 199 },
  'two-bedroom-suite': { low: 164, high: 259 },
  'apartment-nagelj': { low: 164, high: 240 },
  'family-suite-kitchen': { low: 100, high: 149 },
  'family-room-t': { low: 144, high: 199 },
  'twin-room-l': { low: 84, high: 119 },
  'quadruple-room-j': { low: 139, high: 189 },
  'single-room-shared': { low: 79, high: 109 },
};

export const priceNote =
  'Sample nightly rates for 3-night stays, captured from the booking system (Dec 2026 vs Jul 2027). Short stays may carry a surcharge; service prices are current; the final price is shown in the booking widget.';

export function priceRange(slug: string): string | undefined {
  const r = nightlyRates[slug];
  return r ? `from €${r.low} / night` : undefined;
}

// Maximum children allowed per unit, from the booking system's unit data.
export const childrenCapacity: Record<string, number> = {
  'double-room-terrace': 1,
  'double-room-terrace-2': 1,
  'apartment-liza': 5,
  'suite-nik': 5,
  'apartment-spelca': 3,
  'two-bedroom-suite': 5,
  'apartment-nagelj': 6,
  'family-suite-kitchen': 3,
  'family-room-t': 4,
  'twin-room-l': 1,
  'quadruple-room-j': 3,
  'single-room-shared': 0,
};

export function childrenLabel(slug: string): string {
  const n = childrenCapacity[slug];
  return n == null ? '' : n === 0 ? 'Adults only' : `Up to ${n} ${n === 1 ? 'child' : 'children'}`;
}

export const propertyImages = [
  { src: '20231001_121558.jpg', alt: 'Horse and rider in a meadow' },
  { src: 'DSC1465-HDR.jpg', alt: 'Bedroom with wooden furniture and red-and-white bedding' },
  { src: 'FB_IMG_1632400464689.jpg', alt: 'Lake Bled and the surrounding countryside' },
  { src: 'spela.jpg', alt: 'Guests with motorcycles outside the guesthouse' },
  { src: 'camp-bled.jpg', alt: 'Camping area near Bled' },
  { src: 'dobleda.jpg', alt: 'Lake Bled, the island church and castle' },
  { src: '1-1.jpg', alt: 'The guesthouse balconies and outdoor terrace' },
  { src: '2-1.jpg', alt: 'The guesthouse exterior and entrance' },
];

export const amenities = [
  'Free Wi-Fi',
  'Free private parking',
  'On-site restaurant',
  'Bar',
  'Garden & terrace',
  'Children’s playground & trampoline',
  'Farm animals',
  'Massage on request',
  'Pets on request (extra charge)',
  'Family rooms',
  'Non-smoking rooms',
  'Room service',
];

// Current prices from the Bentral booking system (supersede the old official-site list).
export const servicePrices = [
  { item: 'Breakfast', price: '€15 / person / night' },
  { item: 'Half board', price: '€45 / person / night' },
  { item: 'Dinner (Večerja)', price: '€30' },
  { item: 'Tourist tax — adults', price: '€2.50 / person / night' },
  { item: 'Tourist tax — children', price: '€1.25 / person / night' },
  { item: 'Registration fee', price: '€1 / person' },
  { item: 'Final cleaning (house)', price: '€100 / one-time' },
  { item: 'Pets (house)', price: '€20 / pet / night' },
  { item: 'Baby cot', price: '€10 / night' },
];

export const distances = [
  { place: 'Begunje centre', km: '3 km' },
  { place: 'Lake Bled', km: '12 km' },
  { place: 'Bled Castle', km: '13 km' },
  { place: 'Ljubljana Jože Pučnik Airport', km: '30 km' },
  { place: 'Kranjska Gora', km: '38 km' },
  { place: 'Klagenfurt Airport', km: '49 km' },
];

export const farmAnimals = [
  '2 ponies',
  '2 horses',
  'Rabbits',
  '2 cats',
  'Guinea pigs',
  'Chickens',
  'Cows & calves',
  'Donkeys',
];

export const farmProduce = [
  'Honey',
  'Salami & sausages',
  'Apple juice',
  'Mint juice',
  'Marmalade & jams',
  'Fruit & vegetables',
  'Pork',
  'Vinegar & brandy',
];

export const motorcycleFeatures = [
  'Free covered garage for bikes',
  'Daily washing & maintenance possible',
  'Tools & tips for minor repairs',
  'Van support in rain or breakdown',
  'Drying room & lockable parking',
  'Toni plans routes — Three Countries Tour (SI–AT–IT in a day)',
  'Biker brochures & tour maps',
];

export const activities = [
  { title: 'Hiking', body: 'The Dobrča route starts at the farm: 17 km, 838 m of climb, about 4 hours.' },
  { title: 'Cycling', body: 'Mountain biking routes around Dobrča and the Gorenjska balcony.' },
  { title: 'Paragliding', body: 'Launches at Dobrča, Begunje, Begunjščica and Sveti Peter.' },
  { title: 'Skiing', body: 'Ski slopes, ice rinks and sledding nearby; Planica and Pokljuka a short drive away.' },
  { title: 'Water', body: 'Swim in the Sava, Lake Bled or Bohinj, or in the pools at Tržič and Radovljica.' },
  { title: 'Culture', body: 'Avsenik museum, Kamen Castle, the Beekeeping Museum and the Museum of Hostages.' },
];

export const dobrocaHike = {
  route: 'Na Dobrčo (1,634 m)',
  length: '17 km',
  gain: '838 m',
  time: '4 hours',
  start: 'Pr’ Trlej, 640 m',
  top: 'Koča na Dobrči, 1,478 m',
  difficulty: 'Demanding',
  surface: '98% gravel, 2% asphalt',
};
