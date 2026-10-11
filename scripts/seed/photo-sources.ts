/**
 * Sample photography for the seed catalogue — all from Pexels (https://www.pexels.com/license/):
 * free for commercial use, no attribution required. Each entry keeps its source page so the
 * photographer can be credited or the image swapped later. Replace with your own event
 * photography before launch. Never use images taken from other caterers' websites.
 */
import type { ArtPalette } from './placeholder-art'

type PhotoSource = {
  url: string
  sourceUrl: string
  alt: string
  palette: ArtPalette
}

const pexels = (id: string, ext: 'jpeg' | 'png' = 'jpeg') =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=1800`
const page = (slug: string) => `https://www.pexels.com/photo/${slug}/`

export const PHOTO_SOURCES = {
  // ── Spreads & occasions ──
  bananaLeafMeal: { url: pexels('9266190'), sourceUrl: page('assorted-food-on-a-banana-leaf-9266190'), alt: 'South Indian festive meal served on a banana leaf', palette: 'leaf' },
  sadyaLeaf: { url: pexels('5410418'), sourceUrl: page('sadya-dish-on-banana-leaf-5410418'), alt: 'Kerala sadya with traditional dishes on a banana leaf', palette: 'leaf' },
  leafFeast: { url: pexels('14132112'), sourceUrl: page('close-up-shot-of-a-delicious-cuisine-14132112'), alt: 'Elaborate South Indian feast laid out on a banana leaf', palette: 'leaf' },
  servingThali: { url: pexels('8818723'), sourceUrl: page('a-person-putting-food-on-the-stainless-plate-8818723'), alt: 'Serving a festive vegetarian thali at a family celebration', palette: 'saffron' },
  weddingLeafHands: { url: pexels('12936920'), sourceUrl: page('close-up-of-women-holding-food-on-leaves-on-a-traditional-indian-wedding-12936920'), alt: 'Henna-decorated hands holding wedding food on leaves', palette: 'chili' },
  receptionBuffet: { url: pexels('36916402'), sourceUrl: page('buffet-with-curry-dishes-in-elegant-setting-36916402'), alt: 'Elegant reception buffet with curries in chafing dishes', palette: 'gold' },
  chafingBuffet: { url: pexels('2291367'), sourceUrl: page('assorted-cooked-foods-inside-food-warmers-2291367'), alt: 'Buffet line of hot dishes in polished chafing dishes', palette: 'gold' },
  engagementSetup: { url: pexels('38697701'), sourceUrl: page('traditional-indian-engagement-ceremony-setup-38697701'), alt: 'Engagement ceremony setup with traditional decor and snacks', palette: 'chili' },
  dessertTable: { url: pexels('9784818'), sourceUrl: page('sweets-for-birthday-party-9784818'), alt: 'Birthday dessert table with cakes and sweets', palette: 'saffron' },
  sweetsCandlelight: { url: pexels('37219215'), sourceUrl: page('indian-sweets-with-candlelight-ambiance-37219215'), alt: 'Indian sweets arranged around candlelight', palette: 'saffron' },
  partySnacks: { url: pexels('31177727'), sourceUrl: page('delicious-variety-of-fried-snacks-on-display-31177727'), alt: 'Party platter of samosas and wraps', palette: 'saffron' },
  corporateBuffet: { url: pexels('18749086'), sourceUrl: page('men-in-suits-choosing-food-from-table-18749086'), alt: 'Guests in business attire at a buffet lunch', palette: 'gold' },
  outdoorBuffet: { url: pexels('39388384'), sourceUrl: page('vibrant-outdoor-buffet-with-diverse-cuisine-39388384'), alt: 'Outdoor event buffet being served', palette: 'gold' },
  waiterService: { url: pexels('18326544'), sourceUrl: page('waiter-holding-wooden-tray-with-appetizers-18326544'), alt: 'Server offering appetisers at a banquet', palette: 'gold' },
  floralArch: { url: pexels('12718058'), sourceUrl: page('flowers-arrangement-over-green-banana-leaves-12718058'), alt: 'Marigold and banana-leaf floral decor for a ceremony', palette: 'leaf' },
  // ── Thalis & mains ──
  brassThali: { url: pexels('39044714'), sourceUrl: page('delicious-indian-thali-meal-on-a-brass-plate-39044714'), alt: 'Indian thali with curries on a brass plate', palette: 'gold' },
  vegThali: { url: pexels('32797056'), sourceUrl: page('traditional-indian-vegetarian-thali-meal-32797056'), alt: 'Vegetarian thali with rice, curries and flatbread', palette: 'saffron' },
  chapatiThali: { url: pexels('35008222'), sourceUrl: page('traditional-indian-thali-with-chapati-and-vegetables-35008222'), alt: 'Thali with chapati, dal and vegetables', palette: 'saffron' },
  naanThali: { url: pexels('29148133'), sourceUrl: page('traditional-indian-thali-meal-with-naan-bread-29148133'), alt: 'North Indian meal with naan, curry and rice', palette: 'gold' },
  chickenCurryPot: { url: pexels('34159113'), sourceUrl: page('authentic-kerala-chicken-curry-in-traditional-pot-34159113'), alt: 'Chicken curry served in a clay pot', palette: 'chili' },
  currySpread: { url: pexels('17050759'), sourceUrl: page('curry-meat-based-dishes-served-on-white-plates-17050759'), alt: 'Spread of Indian curries and grills', palette: 'chili' },
  keralaFishMeal: { url: pexels('13243817'), sourceUrl: page('tray-with-rice-and-bowls-of-sauces-13243817'), alt: 'Kerala rice meal with fried fish on a banana leaf', palette: 'leaf' },
  fishCurry: { url: pexels('35532834'), sourceUrl: page('delicious-indian-fish-curry-with-vegetables-35532834'), alt: 'Coastal fish curry with vegetables', palette: 'saffron' },
  grilledFish: { url: pexels('36058197'), sourceUrl: page('delicious-kerala-style-grilled-fish-on-rustic-table-36058197'), alt: 'Kerala-style grilled fish', palette: 'chili' },
  biryaniCopper: { url: pexels('32825913'), sourceUrl: page('authentic-indian-biryani-with-spices-and-condiments-32825913'), alt: 'Biryani served with sides', palette: 'chili' },
  biryaniClose: { url: pexels('7340956'), sourceUrl: page('close-up-photo-of-a-biryani-dish-7340956'), alt: 'Close-up of fragrant biryani', palette: 'chili' },
  // ── Starters, tiffin & counters ──
  tikkaPlatter: { url: pexels('36701469'), sourceUrl: page('delicious-grilled-indian-tikka-platter-36701469'), alt: 'Grilled tikka platter with chutney', palette: 'chili' },
  tandooriChicken: { url: pexels('29699526'), sourceUrl: page('spicy-tandoori-chicken-with-mint-chutney-29699526'), alt: 'Tandoori chicken with mint chutney', palette: 'chili' },
  masalaDosa: { url: pexels('35351659'), sourceUrl: page('authentic-south-indian-dosa-with-chutney-35351659'), alt: 'Crisp dosa with coconut chutney', palette: 'saffron' },
  idliLeaf: { url: pexels('31199041'), sourceUrl: page('traditional-south-indian-idli-with-sambar-and-chutney-31199041'), alt: 'Idli with sambar and chutney on a banana leaf', palette: 'leaf' },
  appam: { url: pexels('39851684'), sourceUrl: page('traditional-south-indian-appam-in-red-plate-39851684'), alt: 'Soft lacy appams', palette: 'saffron' },
  chaat: { url: pexels('34270741'), sourceUrl: page('delicious-indian-street-food-pani-puri-34270741'), alt: 'Pani puri chaat with colourful garnishes', palette: 'saffron' },
  mocktails: { url: pexels('34278808'), sourceUrl: page('colorful-mocktail-display-at-elegant-event-34278808'), alt: 'Signature mocktail bar at an event', palette: 'saffron' },
  coolers: { url: pexels('36880408'), sourceUrl: page('refreshing-lemon-and-mint-beverages-on-tray-36880408'), alt: 'Lemon and mint coolers', palette: 'leaf' },
  filterCoffee: { url: pexels('38201891', 'png'), sourceUrl: page('traditional-south-indian-filter-coffee-in-bengaluru-38201891'), alt: 'South Indian filter coffee in steel tumblers', palette: 'gold' },
  // ── Sweets ──
  gulabJamun: { url: pexels('11887844'), sourceUrl: page('close-up-photo-of-gulab-jamun-11887844'), alt: 'Gulab jamun', palette: 'saffron' },
  rasgulla: { url: pexels('39959153'), sourceUrl: page('delicious-indian-sweets-rasgulla-on-plate-39959153'), alt: 'Saffron rasgulla on a clay plate', palette: 'saffron' },
  halwa: { url: pexels('35782620'), sourceUrl: page('delicious-gajar-ka-halwa-at-buffet-table-35782620'), alt: 'Halwa served at a buffet', palette: 'saffron' },
  festiveSweets: { url: pexels('32044781'), sourceUrl: page('festive-display-of-traditional-sweets-32044781'), alt: 'Festive tray of traditional sweets', palette: 'gold' },
  sweetsTray: { url: pexels('39524786'), sourceUrl: page('traditional-indian-sweets-and-snacks-on-a-tray-39524786'), alt: 'Tray of Indian sweets and snacks', palette: 'gold' },
  jalebi: { url: pexels('39193447'), sourceUrl: page('delicious-jalebi-dessert-with-pistachio-garnish-39193447'), alt: 'Jalebi with pistachio', palette: 'saffron' },
  ladoo: { url: pexels('40000005'), sourceUrl: page('delicious-indian-ladoos-with-saffron-garnish-40000005'), alt: 'Ladoos with saffron and nuts', palette: 'saffron' },
} satisfies Record<string, PhotoSource>

export type PhotoKey = keyof typeof PHOTO_SOURCES

const PACKAGE_PHOTOS: Record<string, [PhotoKey, PhotoKey]> = {
  'gruhapravesha-sattvik-sadya': ['bananaLeafMeal', 'masalaDosa'],
  'classic-celebration-buffet': ['chafingBuffet', 'tikkaPlatter'],
  'chettinad-feast': ['chickenCurryPot', 'currySpread'],
  'royal-wedding-banquet': ['weddingLeafHands', 'brassThali'],
  'coastal-reception-grand': ['keralaFishMeal', 'grilledFish'],
  'jain-shubh-bhoj': ['vegThali', 'chapatiThali'],
}

const EVENT_PHOTOS: Record<string, PhotoKey> = {
  'house-warming': 'sadyaLeaf',
  wedding: 'leafFeast',
  'wedding-reception': 'receptionBuffet',
  engagement: 'engagementSetup',
  'naming-ceremony': 'servingThali',
  birthday: 'dessertTable',
  anniversary: 'sweetsCandlelight',
  party: 'partySnacks',
  corporate: 'corporateBuffet',
}

/** Add-ons by exact name (seed data). */
const ADDON_PHOTOS: Record<string, PhotoKey> = {
  'Live dosa counter': 'masalaDosa',
  'Chaat counter': 'chaat',
  'Live ice-cream counter': 'dessertTable',
  'Mocktail bar': 'mocktails',
  'Filter coffee station': 'filterCoffee',
  'Paan counter': 'weddingLeafHands',
  'Banana-leaf service': 'bananaLeafMeal',
  'Service staff (team of 6)': 'waiterService',
  'Buffet floral décor': 'floralArch',
  'Transport & setup': 'outdoorBuffet',
}

export const photosForPackage = (slug: string): [PhotoKey, PhotoKey] => PACKAGE_PHOTOS[slug] ?? ['chafingBuffet', 'bananaLeafMeal']

export const photoForEvent = (slug: string): PhotoKey => EVENT_PHOTOS[slug] ?? 'receptionBuffet'

export const photoForAddOn = (name: string): PhotoKey => ADDON_PHOTOS[name] ?? 'chafingBuffet'

/** Dish → photo by keyword. Vegetarian dishes only ever map to vegetarian photos. */
export function photoForDish(name: string, diet: 'veg' | 'non-veg' | 'jain' = 'veg'): PhotoKey {
  const n = name.toLowerCase()
  const has = (...words: string[]) => words.some((w) => n.includes(w))
  // Drinks
  if (has('panakam', 'mor', 'badam milk', 'lime soda', 'sherbet', 'coconut water')) return 'coolers'
  // Sweets
  if (has('gulab jamun')) return 'gulabJamun'
  if (has('rasmalai', 'rasgulla')) return 'rasgulla'
  if (has('halwa')) return 'halwa'
  if (has('jalebi')) return 'jalebi'
  if (has('ladoo', 'laddu')) return 'ladoo'
  if (has('obbattu', 'holige', 'mysore pak', 'kesari')) return 'festiveSweets'
  if (has('payasam', 'pradhaman', 'phirni', 'shrikhand', 'kheer', 'ice cream')) return 'sweetsTray'
  // Non-veg
  if (diet === 'non-veg') {
    if (has('biryani')) return n.includes('mutton') ? 'biryaniClose' : 'biryaniCopper'
    if (has('fish fry')) return 'grilledFish'
    if (has('fish', 'prawn')) return 'fishCurry'
    if (has('65', 'chilli', 'pepper chicken', 'sukka', 'amritsari', 'koliwada')) return 'tandooriChicken'
    if (has('butter chicken')) return 'naanThali'
    if (has('rogan', 'mutton')) return 'currySpread'
    return 'chickenCurryPot'
  }
  // Vegetarian / Jain
  if (has('biryani')) return 'biryaniCopper'
  if (has('dosa')) return 'masalaDosa'
  if (has('appam')) return 'appam'
  if (has('idli')) return 'idliLeaf'
  if (has('tikka', 'kebab')) return 'tikkaPlatter'
  if (has('vada', 'bonda', 'gobi', 'corn', 'dhokla', 'mushroom')) return 'partySnacks'
  if (has('naan', 'kulcha', 'jeera rice', 'pulao', 'butter masala')) return 'naanThali'
  if (has('chapati', 'poori', 'parotta', 'thepla', 'dal', 'kadhi', 'gatte')) return 'chapatiThali'
  if (has('rice', 'bath', 'puliyogare', 'avial', 'sagu', 'huli', 'kootu')) return 'leafFeast'
  return diet === 'jain' ? 'vegThali' : 'brassThali'
}
