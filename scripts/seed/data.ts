/**
 * Seed content: realistic Bengaluru catering data so the UI can be judged with real-looking menus.
 * Prices are whole rupees. Vendor names are fictional and INTERNAL ONLY.
 */
import type { AddOnCategory, AddOnPricingType, Diet, DishDiet } from '../../src/lib/catalog/constants'

export const cuisines = [
  { slug: 'south-indian', name: 'South Indian' },
  { slug: 'udupi', name: 'Udupi' },
  { slug: 'north-indian', name: 'North Indian' },
  { slug: 'chettinad', name: 'Chettinad' },
  { slug: 'kerala', name: 'Kerala' },
  { slug: 'andhra', name: 'Andhra' },
  { slug: 'continental', name: 'Continental' },
] as const
export type CuisineSlug = (typeof cuisines)[number]['slug']

export const eventTypes = [
  {
    slug: 'house-warming',
    name: 'House Warming (Gruhapravesha)',
    tagline: 'Bless the new home with a sattvik feast',
    description:
      'Early-morning pooja breakfasts and traditional banana-leaf lunches for your Gruhapravesha — pure veg, on time, and served with care.',
  },
  {
    slug: 'wedding',
    name: 'Wedding',
    tagline: 'Muhurtham meals worthy of the day',
    description:
      'Grand wedding feasts for 200 to 1,500 guests: South Indian sadyas, North Indian spreads and everything in between, with seamless service.',
  },
  {
    slug: 'wedding-reception',
    name: 'Wedding Reception',
    tagline: 'An evening your guests will talk about',
    description:
      'Reception dinners with live counters, coastal specialities and elegant buffets — wedding reception catering done right.',
  },
  {
    slug: 'engagement',
    name: 'Engagement',
    tagline: 'The first celebration of many',
    description: 'Intimate to grand engagement menus, from nischitartham lunches to evening ring ceremonies.',
  },
  {
    slug: 'naming-ceremony',
    name: 'Naming Ceremony (Namakarana)',
    tagline: 'Welcome the little one with a gentle feast',
    description: 'Light, sattvik menus for Namakarana and cradle ceremonies at home or in a hall.',
  },
  {
    slug: 'birthday',
    name: 'Birthday',
    tagline: 'From first birthdays to sixtieth',
    description: 'Kid-friendly buffets, chaat counters and dessert tables for birthdays of every age.',
  },
  {
    slug: 'anniversary',
    name: 'Anniversary',
    tagline: 'Celebrate the years, beautifully',
    description: 'Elegant anniversary dinners — from a quiet family meal to a 50th with the whole extended family.',
  },
  {
    slug: 'party',
    name: 'Party & Get-together',
    tagline: 'Good food, zero fuss',
    description: 'House parties, alumni meets and festive get-togethers with crowd-pleasing menus.',
  },
  {
    slug: 'corporate',
    name: 'Corporate Events',
    tagline: 'Working lunches to annual days',
    description: 'Reliable corporate catering for offsites, launches, town halls and annual days.',
  },
] as const
export type EventSlug = (typeof eventTypes)[number]['slug']

export const vendors = [
  {
    code: 'V01',
    name: 'Annapoorna Kitchens',
    contactPerson: 'Ravi Shankar',
    phone: '+91 90000 11111',
    email: 'ravi@annapoorna.example',
    notes: 'Specialist in Udupi and traditional veg. Strong for Gruhapravesha and weddings.',
  },
  {
    code: 'V02',
    name: 'Malabar Spice Co.',
    contactPerson: 'Thomas Mathew',
    phone: '+91 90000 22222',
    email: 'thomas@malabarspice.example',
    notes: 'Coastal and Chettinad non-veg. Good live counters.',
  },
] as const

type Dish = {
  name: string
  description: string
  diet: DishDiet
  spice: 0 | 1 | 2 | 3
  cuisine: CuisineSlug
  premium?: number // surcharge per plate if premium by default
  defaultSelected?: boolean
}

export const dishes: Dish[] = [
  // Welcome drinks
  { name: 'Panakam', description: 'Jaggery and dry-ginger cooler with cardamom.', diet: 'veg', spice: 0, cuisine: 'udupi', defaultSelected: true },
  { name: 'Neer Mor', description: 'Spiced buttermilk with curry leaves and ginger.', diet: 'veg', spice: 1, cuisine: 'south-indian' },
  { name: 'Badam Milk', description: 'Chilled almond milk with saffron.', diet: 'veg', spice: 0, cuisine: 'south-indian', premium: 25 },
  { name: 'Fresh Lime Soda', description: 'Sweet or salted, with fresh mint.', diet: 'veg', spice: 0, cuisine: 'continental', defaultSelected: true },
  { name: 'Rose Sherbet', description: 'Rose syrup, basil seeds and chilled milk.', diet: 'veg', spice: 0, cuisine: 'north-indian' },
  { name: 'Tender Coconut Water', description: 'Served fresh, in the shell.', diet: 'veg', spice: 0, cuisine: 'kerala', premium: 30 },

  // Veg starters
  { name: 'Maddur Vada', description: 'Crisp onion-semolina fritters from Maddur.', diet: 'veg', spice: 1, cuisine: 'udupi', defaultSelected: true },
  { name: 'Mysore Bonda', description: 'Fluffy fried dumplings with coconut chutney.', diet: 'veg', spice: 1, cuisine: 'udupi' },
  { name: 'Gobi 65', description: 'Spiced cauliflower florets, curry-leaf tempering.', diet: 'veg', spice: 2, cuisine: 'south-indian' },
  { name: 'Dahi Kebab', description: 'Hung-curd kebabs, melt-in-the-mouth.', diet: 'veg', spice: 1, cuisine: 'north-indian', premium: 35 },
  { name: 'Paneer Tikka', description: 'Tandoor-charred cottage cheese with peppers.', diet: 'veg', spice: 2, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Hara Bhara Kebab', description: 'Spinach, peas and potato patties.', diet: 'veg', spice: 1, cuisine: 'north-indian' },
  { name: 'Corn Cheese Balls', description: 'Golden-fried, molten centre.', diet: 'veg', spice: 0, cuisine: 'continental' },
  { name: 'Mushroom Pepper Fry', description: 'Button mushrooms tossed in Chettinad pepper masala.', diet: 'veg', spice: 3, cuisine: 'chettinad' },

  // Non-veg starters
  { name: 'Chicken 65', description: 'The classic — crisp, red, curry-leaf fried.', diet: 'non-veg', spice: 2, cuisine: 'south-indian', defaultSelected: true },
  { name: 'Chettinad Pepper Chicken', description: 'Dry roast with freshly ground black pepper.', diet: 'non-veg', spice: 3, cuisine: 'chettinad' },
  { name: 'Mutton Sukka', description: 'Slow-roasted mutton with coconut and spices.', diet: 'non-veg', spice: 3, cuisine: 'chettinad', premium: 90 },
  { name: 'Fish Amritsari', description: 'Gram-flour battered fish with ajwain.', diet: 'non-veg', spice: 2, cuisine: 'north-indian' },
  { name: 'Prawn Koliwada', description: 'Crisp spiced prawns, Koli style.', diet: 'non-veg', spice: 2, cuisine: 'continental', premium: 110 },
  { name: 'Andhra Chilli Chicken', description: 'Green-chilli fried chicken, fiery and bright.', diet: 'non-veg', spice: 3, cuisine: 'andhra' },
  { name: 'Kerala Fish Fry', description: 'Seer fish in Kerala masala, pan-fried.', diet: 'non-veg', spice: 2, cuisine: 'kerala', premium: 60 },

  // Veg mains
  { name: 'Bisi Bele Bath', description: 'Rice, lentils and vegetables with a spiced tamarind masala.', diet: 'veg', spice: 2, cuisine: 'udupi', defaultSelected: true },
  { name: 'Vegetable Sagu', description: 'Mixed vegetables in a coconut-poppy seed gravy.', diet: 'veg', spice: 1, cuisine: 'udupi' },
  { name: 'Majjige Huli', description: 'Vegetables in a gently spiced yoghurt-coconut curry.', diet: 'veg', spice: 1, cuisine: 'udupi' },
  { name: 'Kootu', description: 'Lentils and vegetables with roasted coconut.', diet: 'veg', spice: 1, cuisine: 'south-indian' },
  { name: 'Avial', description: 'Kerala mixed vegetables in coconut and curd.', diet: 'veg', spice: 0, cuisine: 'kerala' },
  { name: 'Paneer Butter Masala', description: 'Paneer in a silky tomato-butter gravy.', diet: 'veg', spice: 1, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight.', diet: 'veg', spice: 1, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Kadai Vegetable', description: 'Seasonal vegetables with kadai masala.', diet: 'veg', spice: 2, cuisine: 'north-indian' },
  { name: 'Malai Kofta', description: 'Paneer-potato koftas in a rich cashew gravy.', diet: 'veg', spice: 1, cuisine: 'north-indian', premium: 30 },
  { name: 'Dum Aloo Kashmiri', description: 'Baby potatoes in a fennel-yoghurt gravy.', diet: 'veg', spice: 2, cuisine: 'north-indian' },
  { name: 'Mixed Veg Chettinad', description: 'Vegetables in roasted Chettinad masala.', diet: 'veg', spice: 3, cuisine: 'chettinad' },
  { name: 'Gutti Vankaya', description: 'Stuffed baby brinjal, Andhra style.', diet: 'veg', spice: 3, cuisine: 'andhra' },

  // Non-veg mains
  { name: 'Chicken Chettinad', description: 'Chicken in a deep, aromatic Chettinad masala.', diet: 'non-veg', spice: 3, cuisine: 'chettinad', defaultSelected: true },
  { name: 'Butter Chicken', description: 'Tandoori chicken in a velvety makhani gravy.', diet: 'non-veg', spice: 1, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked mutton.', diet: 'non-veg', spice: 2, cuisine: 'north-indian', premium: 80 },
  { name: 'Kerala Fish Curry', description: 'Fish in kodampuli and coconut gravy.', diet: 'non-veg', spice: 2, cuisine: 'kerala', defaultSelected: true },
  { name: 'Andhra Mutton Curry', description: 'Bold Guntur-chilli mutton curry.', diet: 'non-veg', spice: 3, cuisine: 'andhra', premium: 70 },
  { name: 'Malabar Prawn Curry', description: 'Prawns in a coconut-tamarind Malabar curry.', diet: 'non-veg', spice: 2, cuisine: 'kerala', premium: 120 },
  { name: 'Egg Roast', description: 'Kerala egg roast with caramelised onions.', diet: 'non-veg', spice: 2, cuisine: 'kerala' },

  // Rice
  { name: 'Steamed Rice', description: 'Sona masoori rice.', diet: 'veg', spice: 0, cuisine: 'south-indian', defaultSelected: true },
  { name: 'Lemon Rice', description: 'Tangy rice with peanuts and curry leaves.', diet: 'veg', spice: 1, cuisine: 'south-indian' },
  { name: 'Puliyogare', description: 'Temple-style tamarind rice.', diet: 'veg', spice: 2, cuisine: 'udupi', defaultSelected: true },
  { name: 'Coconut Rice', description: 'Fresh coconut, cashews and mild tempering.', diet: 'veg', spice: 0, cuisine: 'south-indian' },
  { name: 'Jeera Rice', description: 'Basmati with cumin and ghee.', diet: 'veg', spice: 0, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Vegetable Pulao', description: 'Fragrant basmati with garden vegetables.', diet: 'veg', spice: 1, cuisine: 'north-indian' },
  { name: 'Ghee Rice', description: 'Kaima rice cooked in ghee with fried onions.', diet: 'veg', spice: 0, cuisine: 'kerala' },
  { name: 'Vegetable Dum Biryani', description: 'Layered basmati and vegetables, sealed and slow-cooked.', diet: 'veg', spice: 2, cuisine: 'andhra', defaultSelected: true },
  { name: 'Chicken Dum Biryani', description: 'Hyderabadi-style dum biryani.', diet: 'non-veg', spice: 2, cuisine: 'andhra', defaultSelected: true },
  { name: 'Mutton Biryani', description: 'Tender mutton, seeraga samba rice, Donne style.', diet: 'non-veg', spice: 2, cuisine: 'south-indian', premium: 120 },

  // Breads
  { name: 'Chapati', description: 'Soft whole-wheat chapatis.', diet: 'veg', spice: 0, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Butter Naan', description: 'Tandoor naan brushed with butter.', diet: 'veg', spice: 0, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Poori', description: 'Puffed, golden pooris.', diet: 'veg', spice: 0, cuisine: 'south-indian' },
  { name: 'Malabar Parotta', description: 'Flaky layered parotta.', diet: 'veg', spice: 0, cuisine: 'kerala' },
  { name: 'Appam', description: 'Lacy fermented rice pancakes.', diet: 'veg', spice: 0, cuisine: 'kerala' },
  { name: 'Neer Dosa', description: 'Delicate Mangalorean rice crêpes.', diet: 'veg', spice: 0, cuisine: 'udupi' },

  // Desserts
  { name: 'Obbattu (Holige)', description: 'Sweet lentil-jaggery flatbread with ghee.', diet: 'veg', spice: 0, cuisine: 'udupi', defaultSelected: true },
  { name: 'Semiya Payasam', description: 'Vermicelli kheer with cardamom and cashews.', diet: 'veg', spice: 0, cuisine: 'south-indian', defaultSelected: true },
  { name: 'Kesari Bath', description: 'Saffron semolina pudding with ghee.', diet: 'veg', spice: 0, cuisine: 'udupi' },
  { name: 'Mysore Pak', description: 'The ghee-rich Mysore classic.', diet: 'veg', spice: 0, cuisine: 'south-indian' },
  { name: 'Elaneer Payasam', description: 'Tender-coconut payasam, served chilled.', diet: 'veg', spice: 0, cuisine: 'kerala', premium: 45 },
  { name: 'Gulab Jamun', description: 'Warm, syrup-soaked khoya dumplings.', diet: 'veg', spice: 0, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Badam Halwa', description: 'Almond halwa slow-cooked in ghee.', diet: 'veg', spice: 0, cuisine: 'south-indian', premium: 40 },
  { name: 'Rasmalai', description: 'Chenna discs in saffron milk.', diet: 'veg', spice: 0, cuisine: 'north-indian', premium: 35 },
  { name: 'Ada Pradhaman', description: 'Rice ada in jaggery and coconut milk.', diet: 'veg', spice: 0, cuisine: 'kerala', premium: 30 },
  { name: 'Vanilla Ice Cream', description: 'With chocolate sauce.', diet: 'veg', spice: 0, cuisine: 'continental' },

  // Jain
  { name: 'Khaman Dhokla', description: 'Steamed gram-flour cake with mustard tempering.', diet: 'jain', spice: 1, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Jain Hara Bhara Kebab', description: 'Spinach and peas, made without potato.', diet: 'jain', spice: 1, cuisine: 'north-indian' },
  { name: 'Jain Paneer Tikka', description: 'Tandoor paneer, no onion or garlic.', diet: 'jain', spice: 2, cuisine: 'north-indian' },
  { name: 'Jain Paneer Butter Masala', description: 'Tomato-cashew gravy, no onion or garlic.', diet: 'jain', spice: 1, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Gatte ki Sabzi', description: 'Gram-flour dumplings in a yoghurt curry.', diet: 'jain', spice: 2, cuisine: 'north-indian' },
  { name: 'Jain Dal Tadka', description: 'Yellow dal with cumin and ghee tempering.', diet: 'jain', spice: 1, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Jain Kadhi', description: 'Gujarati-style sweet and tangy kadhi.', diet: 'jain', spice: 1, cuisine: 'north-indian' },
  { name: 'Jain Vegetable Pulao', description: 'Basmati with peas, beans and capsicum.', diet: 'jain', spice: 0, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Methi Thepla', description: 'Soft fenugreek flatbreads.', diet: 'jain', spice: 0, cuisine: 'north-indian' },
  { name: 'Shrikhand', description: 'Saffron-cardamom hung curd.', diet: 'jain', spice: 0, cuisine: 'north-indian', defaultSelected: true },
  { name: 'Moong Dal Halwa', description: 'Rich, slow-roasted moong dal halwa.', diet: 'jain', spice: 0, cuisine: 'north-indian', premium: 40 },
  { name: 'Phirni', description: 'Ground-rice pudding set in clay pots.', diet: 'jain', spice: 0, cuisine: 'north-indian' },
]

type AddOnSeed = {
  name: string
  description: string
  pricingType: AddOnPricingType
  price: number
  category: AddOnCategory
  isGlobal?: boolean
}

export const addOns: AddOnSeed[] = [
  { name: 'Live dosa counter', description: 'Chef-run counter: masala, ghee roast, set and benne dosa.', pricingType: 'per_plate', price: 60, category: 'live-counter' },
  { name: 'Chaat counter', description: 'Pani puri, sev puri and dahi papdi, made to order.', pricingType: 'per_plate', price: 55, category: 'live-counter' },
  { name: 'Live ice-cream counter', description: 'Cold-stone style with toppings.', pricingType: 'per_plate', price: 50, category: 'desserts' },
  { name: 'Mocktail bar', description: 'Three signature mocktails, served by a bartender.', pricingType: 'per_plate', price: 70, category: 'beverages' },
  { name: 'Filter coffee station', description: 'Kumbakonam degree coffee, served in davara-tumbler.', pricingType: 'per_plate', price: 35, category: 'beverages' },
  { name: 'Paan counter', description: 'Sweet and saada paan, made fresh.', pricingType: 'per_plate', price: 30, category: 'other' },
  { name: 'Banana-leaf service', description: 'Seated service on banana leaf, course by course.', pricingType: 'per_plate', price: 25, category: 'banana-leaf', isGlobal: true },
  { name: 'Service staff (team of 6)', description: 'Uniformed servers for up to 5 hours.', pricingType: 'flat', price: 9000, category: 'service-staff', isGlobal: true },
  { name: 'Buffet floral décor', description: 'Fresh marigold and jasmine styling for the buffet line.', pricingType: 'flat', price: 18000, category: 'decor', isGlobal: true },
  { name: 'Transport & setup', description: 'Delivery and setup at your venue.', pricingType: 'flat', price: 3000, category: 'transport', isGlobal: true },
]

type SectionSeed = { title: string; description?: string; min: number; max: number; dishes: string[] }

type PackageSeed = {
  slug: string
  title: string
  diet: Diet
  vendor: 'V01' | 'V02'
  eventTypes: EventSlug[]
  cuisines: CuisineSlug[]
  shortDescription: string
  description: string[]
  minGuests: number
  maxGuests: number
  tiers: [number, number, number][] // [min, max, price]
  costPricePerPlate: number
  featured?: boolean
  popularity: number
  sections: SectionSeed[]
  addOns: string[]
  palette: 'gold' | 'leaf' | 'chili' | 'saffron'
}

export const packages: PackageSeed[] = [
  {
    slug: 'gruhapravesha-sattvik-sadya',
    title: 'Gruhapravesha Sattvik Sadya',
    diet: 'veg',
    vendor: 'V01',
    eventTypes: ['house-warming', 'naming-ceremony'],
    cuisines: ['udupi', 'south-indian'],
    shortDescription: 'A traditional Udupi-style banana-leaf feast for your Gruhapravesha — no onion, no garlic, all heart.',
    description: [
      'Our most-loved menu for house-warmings: a sattvik Udupi spread prepared without onion or garlic, served on banana leaf or as a buffet.',
      'Start with panakam and Maddur vade, move through bisi bele bath and majjige huli, and finish with warm obbattu and payasam.',
    ],
    minGuests: 50,
    maxGuests: 600,
    tiers: [[50, 149, 520], [150, 299, 480], [300, 600, 450]],
    costPricePerPlate: 330,
    featured: true,
    popularity: 90,
    palette: 'leaf',
    sections: [
      { title: 'Welcome drink', min: 1, max: 1, dishes: ['Panakam', 'Neer Mor', 'Badam Milk'] },
      { title: 'Starters', min: 2, max: 2, dishes: ['Maddur Vada', 'Mysore Bonda', 'Gobi 65', 'Dahi Kebab'] },
      { title: 'Mains', min: 2, max: 3, dishes: ['Bisi Bele Bath', 'Vegetable Sagu', 'Majjige Huli', 'Kootu', 'Avial'] },
      { title: 'Rice & breads', min: 2, max: 2, dishes: ['Steamed Rice', 'Lemon Rice', 'Puliyogare', 'Coconut Rice', 'Poori'] },
      { title: 'Desserts', min: 1, max: 2, dishes: ['Obbattu (Holige)', 'Semiya Payasam', 'Kesari Bath', 'Mysore Pak', 'Elaneer Payasam'] },
    ],
    addOns: ['Live dosa counter', 'Filter coffee station'],
  },
  {
    slug: 'classic-celebration-buffet',
    title: 'Classic Celebration Buffet',
    diet: 'mixed',
    vendor: 'V02',
    eventTypes: ['birthday', 'party', 'corporate', 'anniversary'],
    cuisines: ['north-indian', 'continental'],
    shortDescription: 'Crowd-pleasing North Indian and continental favourites for birthdays, parties and office celebrations.',
    description: [
      'A generous, easy-going buffet that keeps every age group happy — tikkas and kebabs, rich gravies, fragrant rice and warm naan.',
      'Mix veg and non-veg starters freely, and add a chaat or ice-cream counter for the kids.',
    ],
    minGuests: 30,
    maxGuests: 300,
    tiers: [[30, 99, 420], [100, 199, 380], [200, 300, 350]],
    costPricePerPlate: 250,
    featured: true,
    popularity: 85,
    palette: 'saffron',
    sections: [
      { title: 'Starters', description: 'Mix veg and non-veg.', min: 2, max: 3, dishes: ['Paneer Tikka', 'Hara Bhara Kebab', 'Corn Cheese Balls', 'Chicken 65', 'Fish Amritsari', 'Prawn Koliwada'] },
      { title: 'Mains', min: 3, max: 3, dishes: ['Paneer Butter Masala', 'Dal Makhani', 'Kadai Vegetable', 'Butter Chicken', 'Malai Kofta'] },
      { title: 'Rice', min: 1, max: 1, dishes: ['Jeera Rice', 'Vegetable Pulao', 'Chicken Dum Biryani'] },
      { title: 'Breads', min: 1, max: 2, dishes: ['Butter Naan', 'Chapati', 'Poori'] },
      { title: 'Desserts', min: 1, max: 2, dishes: ['Gulab Jamun', 'Vanilla Ice Cream', 'Rasmalai'] },
    ],
    addOns: ['Chaat counter', 'Live ice-cream counter', 'Mocktail bar'],
  },
  {
    slug: 'chettinad-feast',
    title: 'Chettinad Feast',
    diet: 'non-veg',
    vendor: 'V02',
    eventTypes: ['party', 'anniversary', 'engagement'],
    cuisines: ['chettinad', 'south-indian'],
    shortDescription: 'Bold, pepper-forward Chettinad cooking — slow roasts, deep gravies and biryani for the spice-lovers.',
    description: [
      'Freshly ground masalas, kalpasi and marathi mokku: the Chettinad kitchen at its most generous.',
      'Ideal for evening parties and engagement dinners where the food is the conversation.',
    ],
    minGuests: 50,
    maxGuests: 400,
    tiers: [[50, 149, 780], [150, 400, 720]],
    costPricePerPlate: 520,
    popularity: 70,
    palette: 'chili',
    sections: [
      { title: 'Starters', min: 2, max: 2, dishes: ['Chettinad Pepper Chicken', 'Mushroom Pepper Fry', 'Mutton Sukka', 'Chicken 65'] },
      { title: 'Mains', min: 2, max: 3, dishes: ['Chicken Chettinad', 'Mixed Veg Chettinad', 'Andhra Mutton Curry', 'Egg Roast', 'Kootu'] },
      { title: 'Rice & breads', min: 2, max: 2, dishes: ['Chicken Dum Biryani', 'Mutton Biryani', 'Steamed Rice', 'Malabar Parotta'] },
      { title: 'Desserts', min: 1, max: 2, dishes: ['Semiya Payasam', 'Kesari Bath', 'Elaneer Payasam'] },
    ],
    addOns: ['Live dosa counter', 'Paan counter'],
  },
  {
    slug: 'royal-wedding-banquet',
    title: 'Royal Wedding Banquet',
    diet: 'veg',
    vendor: 'V01',
    eventTypes: ['wedding', 'wedding-reception', 'engagement'],
    cuisines: ['south-indian', 'north-indian'],
    shortDescription: 'A grand vegetarian wedding spread uniting South and North — the banquet your families will remember.',
    description: [
      'Built for muhurtham lunches and reception dinners of 200 to 1,500 guests, with a menu that honours both sides of the family.',
      'Pair it with banana-leaf service for the wedding lunch and live counters for the evening.',
    ],
    minGuests: 200,
    maxGuests: 1500,
    tiers: [[200, 499, 1150], [500, 899, 1050], [900, 1500, 980]],
    costPricePerPlate: 760,
    featured: true,
    popularity: 95,
    palette: 'gold',
    sections: [
      { title: 'Welcome drinks', min: 1, max: 2, dishes: ['Badam Milk', 'Rose Sherbet', 'Tender Coconut Water', 'Fresh Lime Soda'] },
      { title: 'Starters', min: 3, max: 3, dishes: ['Paneer Tikka', 'Dahi Kebab', 'Hara Bhara Kebab', 'Maddur Vada', 'Corn Cheese Balls'] },
      { title: 'Mains', min: 3, max: 4, dishes: ['Paneer Butter Masala', 'Malai Kofta', 'Dal Makhani', 'Bisi Bele Bath', 'Avial', 'Dum Aloo Kashmiri', 'Gutti Vankaya'] },
      { title: 'Rice', min: 2, max: 2, dishes: ['Vegetable Dum Biryani', 'Ghee Rice', 'Puliyogare', 'Jeera Rice'] },
      { title: 'Breads', min: 1, max: 2, dishes: ['Butter Naan', 'Malabar Parotta', 'Poori', 'Appam'] },
      { title: 'Desserts', min: 2, max: 3, dishes: ['Badam Halwa', 'Rasmalai', 'Obbattu (Holige)', 'Gulab Jamun', 'Ada Pradhaman', 'Mysore Pak'] },
    ],
    addOns: ['Live dosa counter', 'Chaat counter', 'Paan counter', 'Filter coffee station'],
  },
  {
    slug: 'coastal-reception-grand',
    title: 'Coastal Reception Grand',
    diet: 'non-veg',
    vendor: 'V02',
    eventTypes: ['wedding-reception', 'wedding', 'engagement'],
    cuisines: ['kerala', 'andhra'],
    shortDescription: 'Seafood-led Kerala and Andhra classics for a reception that feels like a coastal evening.',
    description: [
      'Seer fish fry, Malabar prawn curry and ghee rice, balanced with appam, neer dosa and vegetarian favourites.',
      'Our premium reception menu, best with the mocktail bar and floral buffet styling.',
    ],
    minGuests: 150,
    maxGuests: 1000,
    tiers: [[150, 399, 1500], [400, 699, 1400], [700, 1000, 1320]],
    costPricePerPlate: 980,
    popularity: 75,
    palette: 'gold',
    sections: [
      { title: 'Starters', min: 2, max: 3, dishes: ['Kerala Fish Fry', 'Prawn Koliwada', 'Andhra Chilli Chicken', 'Chicken 65', 'Gobi 65'] },
      { title: 'Mains', min: 3, max: 4, dishes: ['Kerala Fish Curry', 'Malabar Prawn Curry', 'Andhra Mutton Curry', 'Chicken Chettinad', 'Avial', 'Egg Roast'] },
      { title: 'Rice & breads', min: 2, max: 3, dishes: ['Ghee Rice', 'Mutton Biryani', 'Appam', 'Neer Dosa', 'Malabar Parotta', 'Steamed Rice'] },
      { title: 'Desserts', min: 1, max: 2, dishes: ['Ada Pradhaman', 'Elaneer Payasam', 'Gulab Jamun'] },
    ],
    addOns: ['Mocktail bar', 'Live ice-cream counter'],
  },
  {
    slug: 'jain-shubh-bhoj',
    title: 'Jain Shubh Bhoj',
    diet: 'jain',
    vendor: 'V01',
    eventTypes: ['house-warming', 'naming-ceremony', 'anniversary'],
    cuisines: ['north-indian'],
    shortDescription: 'A fully Jain menu — no onion, garlic or root vegetables — prepared in a dedicated kitchen.',
    description: [
      'Every dish is prepared without onion, garlic, potato or other root vegetables, with separate utensils.',
      'Dhokla, gatte ki sabzi, kadhi and shrikhand — comforting, festive and true to tradition.',
    ],
    minGuests: 30,
    maxGuests: 400,
    tiers: [[30, 99, 650], [100, 199, 600], [200, 400, 560]],
    costPricePerPlate: 410,
    popularity: 60,
    palette: 'saffron',
    sections: [
      { title: 'Starters', min: 2, max: 2, dishes: ['Khaman Dhokla', 'Jain Hara Bhara Kebab', 'Jain Paneer Tikka'] },
      { title: 'Mains', min: 2, max: 3, dishes: ['Jain Paneer Butter Masala', 'Gatte ki Sabzi', 'Jain Dal Tadka', 'Jain Kadhi'] },
      { title: 'Rice & breads', min: 2, max: 2, dishes: ['Jain Vegetable Pulao', 'Methi Thepla', 'Chapati', 'Steamed Rice'] },
      { title: 'Desserts', min: 1, max: 2, dishes: ['Shrikhand', 'Moong Dal Halwa', 'Phirni'] },
    ],
    addOns: ['Filter coffee station'],
  },
]

export const siteSettings = {
  hero: {
    eyebrow: 'Event catering',
    headline: 'Every occasion, served *in gold*.',
    subheadline:
      'From Gruhapravesha breakfasts to wedding receptions for a thousand — curated menus you can shape plate by plate, with a live price as you go.',
  },
  finalCta: {
    headline: 'Let’s plan your menu *together*.',
    body: 'Call, WhatsApp or send an enquiry — we reply within one business day.',
  },
  whyChooseUs: [
    { title: 'One brand, one promise', body: 'Every event is planned, tasted and quality-checked by our team. You deal with one name from first call to last plate.' },
    { title: 'Menus you can shape', body: 'Pick dishes section by section, swap in premium favourites and see your indicative price update as you go.' },
    { title: 'Clear, honest pricing', body: 'Per-plate prices by guest count, every add-on itemised. No online payment — we confirm everything with you on a call.' },
    { title: 'End to end', body: 'Homes to convention halls — setup, service and clean-up handled.' },
  ],
  faq: [
    { question: 'How is the price calculated?', answer: 'Each package has a per-plate price that drops as your guest count grows. Premium dishes and per-plate add-ons are added per guest; flat add-ons such as service staff are added once. The total you see is an indicative estimate — we confirm the final price on a call.' },
    { question: 'Do I pay online?', answer: 'No. There is no online payment. Send an enquiry, we call you to finalise the menu and details, and payment is agreed directly with our team.' },
    { question: 'What is the minimum number of guests?', answer: 'Most menus start at 30–50 guests; wedding menus start at 150–200. Each package shows its guest range.' },
    { question: 'Can you do Jain or no-onion-no-garlic food?', answer: 'Yes. Our Jain menu is prepared without onion, garlic or root vegetables, and our Gruhapravesha menu is fully sattvik.' },
    { question: 'How far in advance should I book?', answer: 'For weddings, 4–8 weeks ahead is ideal. For house-warmings and parties, a week is usually enough — but call us even if it is sooner.' },
  ],
  testimonials: [
    { quote: 'The Gruhapravesha lunch was exactly like home — the obbattu disappeared in minutes. They arrived at 6 am for the pooja breakfast without a single reminder.', name: 'Lakshmi R.', occasion: 'House Warming', area: 'Jayanagar' },
    { quote: 'We had 650 guests at our reception and the coastal menu was the talk of the evening. Service was quiet, quick and very professional.', name: 'Arjun & Meera', occasion: 'Wedding Reception', area: 'Whitefield' },
    { quote: 'Being able to choose dishes and see the price change made it so easy to decide as a family. No surprises on the final bill.', name: 'Priya S.', occasion: 'Naming Ceremony', area: 'HSR Layout' },
    { quote: 'Our annual day lunch for 250 people ran like clockwork. The live dosa counter was a huge hit.', name: 'Kiran M.', occasion: 'Corporate', area: 'Outer Ring Road' },
  ],
}
