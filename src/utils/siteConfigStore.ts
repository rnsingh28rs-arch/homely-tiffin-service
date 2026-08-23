export interface DynamicDish {
  id: string;
  name: string;
  category: "Veg" | "Egg" | "Non-Veg";
  price: number;
  items: string;
  imageUrl?: string;
  badge?: string;
  isAvailable: boolean;
}

export interface SiteConfig {
  brandName: string;
  legalEntityName: string;
  fssaiNumber: string;
  gstNumber: string;
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

  // ONLY 3 CORE THALIS (NO EXTRA DUMMY ITEMS)
  dishes: DynamicDish[];

  // ONLY 3 MONTHLY PACKAGES
  packages: {
    veg: { dailyPrice: number; monthlyPrice: number; description: string; itemsIncluded: string };
    egg: { dailyPrice: number; monthlyPrice: number; description: string; itemsIncluded: string };
    nonVeg: { dailyPrice: number; monthlyPrice: number; description: string; itemsIncluded: string };
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

export const DEFAULT_CONFIG: SiteConfig = {
  brandName: "Bring My Bite",
  legalEntityName: "Bring My Bite Food & Hospitality Services",
  fssaiNumber: "22724923000542",
  gstNumber: "09AAFCB1234F1Z5",
  phone: "+91 9004848984",
  whatsappNumber: "919004848984",
  email: "support@bringmybite.com",
  kitchenAddress: "Knowledge Park III, Near Galgotias Campus, Greater Noida, UP - 201310",

  bankAccountName: "Bring My Bite Foods",
  bankAccountNumber: "900484898401",
  bankIfscCode: "UTIB0000123",
  bankName: "Axis Bank",
  bankBranch: "Greater Noida Alpha 1 Branch",
  upiId: "9004848984@axisbank",
  upiQrImage: "https://images.unsplash.com/photo-1556742049-0a67e5572263?w=500&auto=format&fit=crop&q=60",

  heroBadge: "🔥 #1 Student & Office Tiffin Service in Greater Noida",
  heroHeadline: "Homely Food. Delivered with Care.",
  heroTagline: "Premium hygienic tiffin service for Students & Working Professionals.",
  heroBannerImage: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=1920&auto=format&fit=crop&q=80",
  thaliImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",

  // STRICTLY 3 DISHES ONLY
  dishes: [
    {
      id: "dish-veg",
      name: "Pure Veg Thali",
      category: "Veg",
      price: 80,
      items: "4 Soft Tawa Rotis + Seasonal Dal + Green Sabzi + Steamed Rice + Salad & Pickle",
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
      badge: "Best Seller ⭐",
      isAvailable: true,
    },
    {
      id: "dish-egg",
      name: "Egg Delight Thali",
      category: "Egg",
      price: 100,
      items: "2-Egg Rich Homestyle Curry + 4 Rotis + Steamed Rice + Yellow Dal + Fresh Salad",
      imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
      badge: "High Protein 💪",
      isAvailable: true,
    },
    {
      id: "dish-nonveg",
      name: "Chicken Curry Thali",
      category: "Non-Veg",
      price: 120,
      items: "Desi Chicken Curry (3 Pcs) + 4 Rotis + Steamed Rice + Salad & Raita",
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
      badge: "Chef Special 🍗",
      isAvailable: true,
    },
  ],

  // STRICTLY 3 PACKAGES ONLY
  packages: {
    veg: {
      dailyPrice: 80,
      monthlyPrice: 2400,
      description: "Shuddh Shakahari Ghar Ka Khana",
      itemsIncluded: "4 Butter Tawa Rotis + Dal Tadka + Seasonal Sabzi + Jeera Rice + Salad & Pickle",
    },
    egg: {
      dailyPrice: 100,
      monthlyPrice: 2999,
      description: "High-Protein Double Egg Curry Combo",
      itemsIncluded: "2-Egg Rich Curry + 4 Soft Rotis + Steamed Rice + Dal + Fresh Salad",
    },
    nonVeg: {
      dailyPrice: 120,
      monthlyPrice: 3599,
      description: "Desi Style Special Chicken Thali",
      itemsIncluded: "Homestyle Chicken Curry (3 Pcs) + 4 Rotis + Rice + Salad & Raita",
    },
  },

  deliverySlots: {
    lunchTime: "12:30 PM - 02:00 PM",
    dinnerTime: "07:30 PM - 09:30 PM",
  },
  deliveryLocations: "Galgotias University (Gate 1 & 2), Sharda University, Bennett University, Knowledge Park Hostels, Pari Chowk, Sector 62",

  superAdminPin: "6655",
  adminPin: "6655",
  managerPin: "4433",
  kitchenPin: "1234",
};

// New version key clears all old dummy entries from browser memory
const CONFIG_KEY = "bmb_live_site_config_v10_strict_clean";

export const getSiteConfig = (): SiteConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveSiteConfig = (newConfig: SiteConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  window.dispatchEvent(new Event("bmb_config_updated"));
};
