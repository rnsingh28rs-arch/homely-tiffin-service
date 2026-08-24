export interface DynamicDish {
  id: string;
  name: string;
  category: "Veg" | "Egg" | "Non-Veg";
  price: number;
  items: string;
  imageUrl: string;
  badge?: string;
  isAvailable: boolean;
}

export interface SiteConfig {
  brandName: string;
  parentEntity: string;
  legalEntityName: string;
  fssaiNumber: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  kitchenAddress: string;

  bankAccountName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankName: string;
  bankBranch: string;
  upiId: string;
  upiQrImage: string;

  heroBadge: string;
  heroHeadline: string;
  heroTagline: string;
  heroBannerImage: string;
  thaliImage: string;

  audienceCopy: {
    students: { title: string; desc: string; punchline: string };
    corporate: { title: string; desc: string; punchline: string };
    wfh: { title: string; desc: string; punchline: string };
  };

  cookCostAnalysis: {
    maidCookSalary: number;
    groceryGasCost: number;
    headacheFactor: string;
    bmbPlanSavings: string;
  };

  dishes: DynamicDish[];

  packages: {
    veg: { dailyPrice: number; monthlyPrice: number; description: string; itemsIncluded: string; imageUrl?: string };
    egg: { dailyPrice: number; monthlyPrice: number; description: string; itemsIncluded: string; imageUrl?: string };
    nonVeg: { dailyPrice: number; monthlyPrice: number; description: string; itemsIncluded: string; imageUrl?: string };
  };

  deliverySlots: {
    lunchTime: string;
    dinnerTime: string;
  };
  deliveryLocations: string;

  superAdminPin: string;
  adminPin: string;
  managerPin: string;
  kitchenPin: string;
}

export const VEG_IMG = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80";
export const EGG_IMG = "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80";
export const CHICKEN_IMG = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80";

export const DEFAULT_CONFIG: SiteConfig = {
  brandName: "BRING MY BITE",
  parentEntity: "Shree Foods",
  legalEntityName: "Bring My Bite (By Shree Foods)",
  fssaiNumber: "22724923000542",
  phone: "+91 9315075165",
  whatsappNumber: "919315075165",
  email: "support@bringmybite.com",
  kitchenAddress: "Greater Noida, Uttar Pradesh - 201310",

  bankAccountName: "Bring My Bite",
  bankAccountNumber: "931507516501",
  bankIfscCode: "UTIB0000123",
  bankName: "Axis Bank",
  bankBranch: "Greater Noida Branch",
  upiId: "9315075165@axisbank",
  upiQrImage: "https://images.unsplash.com/photo-1556742049-0a67e5572263?w=500&auto=format&fit=crop&q=60",

  heroBadge: "🔥 #1 Student & Office Homely Tiffin in Greater Noida & Noida",
  heroHeadline: "Homely Food. Delivered with Care.",
  heroTagline: "Authentic, hygienic home-style daily meals. Zero maid tantrums, zero utensil washing (bartan ka jhanjhat khatam).",
  heroBannerImage: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=1920&auto=format&fit=crop&q=80",
  thaliImage: VEG_IMG,

  audienceCopy: {
    students: {
      title: "For Students & Hostellers / Flatmates",
      desc: "Late-night assignment crunch or early 8 AM classes — say goodbye to messy hostel food and washing greasy utensils in cold water.",
      punchline: "Fresh homestyle meals at your hostel gate right on time. (Bartan dhone ki koi chinta nahi!)",
    },
    corporate: {
      title: "For Corporate Offices & Bulk Teams",
      desc: "Timely hot lunch drop with specialized steam-sealed packaging, consolidated invoice, and customized team batches.",
      punchline: "Fuel your workforce with fresh, non-greasy home food every single afternoon.",
    },
    wfh: {
      title: "For Work-From-Home & Busy Professionals",
      desc: "No more bargaining with unpredictable cooks or running to the grocery store during meetings. Healthy daily nutrition on autopilot.",
      punchline: "Spend your free hours resting, not cooking and cleaning dishes.",
    },
  },

  cookCostAnalysis: {
    maidCookSalary: 2000,
    groceryGasCost: 3500,
    headacheFactor: "Random Maid Absences + Utensil Scrubbing Fatigue",
    bmbPlanSavings: "Save ₹1,800+ Every Month with 100% Guaranteed Reliability",
  },

  dishes: [
    {
      id: "dish-veg",
      name: "Veg Classic Thali",
      category: "Veg",
      price: 80,
      items: "4 Butter Tawa Rotis + Seasonal Dal Fry + Green Sabzi + Steamed Rice + Salad & Pickle",
      imageUrl: VEG_IMG,
      badge: "Pure Homestyle 🌱",
      isAvailable: true,
    },
    {
      id: "dish-egg",
      name: "Egg Delight Thali",
      category: "Egg",
      price: 100,
      items: "2-Egg Rich Homestyle Curry + 4 Soft Rotis + Steamed Rice + Yellow Dal + Fresh Salad",
      imageUrl: EGG_IMG,
      badge: "High Protein 💪",
      isAvailable: true,
    },
    {
      id: "dish-nonveg",
      name: "Non-Veg Club (Chicken Curry)",
      category: "Non-Veg",
      price: 120,
      items: "Desi Chicken Curry (3 Tender Pcs) + 4 Soft Rotis + Steamed Rice + Raita & Salad",
      imageUrl: CHICKEN_IMG,
      badge: "Chef Special 🍗",
      isAvailable: true,
    },
  ],

  packages: {
    veg: {
      dailyPrice: 80,
      monthlyPrice: 2400,
      description: "Shuddh Shakahari Homestyle 30-Day Subscription",
      itemsIncluded: "4 Butter Tawa Rotis + Seasonal Dal + Green Sabzi + Steamed Rice + Salad & Pickle",
      imageUrl: VEG_IMG,
    },
    egg: {
      dailyPrice: 100,
      monthlyPrice: 2999,
      description: "High-Protein Double Egg Curry 30-Day Plan",
      itemsIncluded: "2-Egg Rich Curry + 4 Soft Rotis + Steamed Rice + Yellow Dal + Fresh Salad",
      imageUrl: EGG_IMG,
    },
    nonVeg: {
      dailyPrice: 120,
      monthlyPrice: 3599,
      description: "Desi Style Chicken Special 30-Day Plan",
      itemsIncluded: "Homestyle Chicken Curry (3 Pcs) + 4 Rotis + Steamed Rice + Raita & Salad",
      imageUrl: CHICKEN_IMG,
    },
  },

  deliverySlots: {
    lunchTime: "12:30 PM - 02:00 PM",
    dinnerTime: "07:30 PM - 09:30 PM",
  },
  deliveryLocations: "Operating in Greater Noida and Noida (Galgotias Gate 1 & 2, Sharda, Bennett, Knowledge Park Hostels, Pari Chowk & Sector 62)",

  superAdminPin: "6655",
  adminPin: "6655",
  managerPin: "4433",
  kitchenPin: "1234",
};

const BMB_STORAGE_KEY = "bmb_clean_production_v910";

export const formatIndianWhatsAppNumber = (rawPhone: string): string => {
  const digits = rawPhone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.substring(1);
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits.length > 0 ? digits : '919315075165';
};

export const getSiteConfig = (): SiteConfig => {
  try {
    const saved = localStorage.getItem(BMB_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(BMB_STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(saved);
    if (!parsed.dishes || parsed.dishes.length === 0) {
      parsed.dishes = DEFAULT_CONFIG.dishes;
    }
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveSiteConfig = (newConfig: SiteConfig): void => {
  localStorage.setItem(BMB_STORAGE_KEY, JSON.stringify(newConfig));
  window.dispatchEvent(new Event("bmb_config_updated"));
};
