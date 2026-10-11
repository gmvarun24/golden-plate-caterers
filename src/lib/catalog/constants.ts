/** Shared catalogue enums — used by Payload collections, the public data layer and Zod schemas. */
export const DIETS = ['veg', 'non-veg', 'jain', 'mixed'] as const
export type Diet = (typeof DIETS)[number]

/** Dish-level diet (a single dish is never "mixed"). */
export const DISH_DIETS = ['veg', 'non-veg', 'jain'] as const
export type DishDiet = (typeof DISH_DIETS)[number]

export const DIET_LABELS: Record<Diet, string> = {
  veg: 'Veg',
  'non-veg': 'Non-veg',
  jain: 'Jain',
  mixed: 'Veg & non-veg',
}

export const ADDON_PRICING_TYPES = ['per_plate', 'flat'] as const
export type AddOnPricingType = (typeof ADDON_PRICING_TYPES)[number]

export const ADDON_CATEGORIES = [
  { value: 'live-counter', label: 'Live counter' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'service-staff', label: 'Service staff' },
  { value: 'decor', label: 'Decor' },
  { value: 'transport', label: 'Transport' },
  { value: 'banana-leaf', label: 'Banana-leaf service' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'other', label: 'Other' },
] as const
export type AddOnCategory = (typeof ADDON_CATEGORIES)[number]['value']

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'lost', label: 'Lost' },
] as const
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]['value']
