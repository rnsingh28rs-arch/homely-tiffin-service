export interface SiteConfig {
  // Brand & Legal Compliance
  brandName: string;
  legalEntityName: string;
  fssaiNumber: string;
  gstNumber: string;
  phone: string; // Calling Number (e.g. +91 9004848984)
  whatsappNumber: string; // WhatsApp Business Number (e.g. 9193XXXXXXXX)
  email: string;
  kitchenAddress: string;

  // Banner & Media
  heroBadge: string;
  heroHeadline: string;
  heroTagline: string;
  heroBannerImage: string;
  thaliImage: string;
  vegThaliImage: string;
  nonVegThaliImage: string;

  // Banking & Payments
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankName: string;
  bankBranch: string;
  upiId: string;
  upiQrImage: string;

  // Single Thalis / Instant Order Meals
  singleThalis: {
    miniVeg: {
      name: string;
      price: number;
      items: string;
    };
    standardVeg: {
      name: string;
      price: number;
      items: string;
    };
    eggSpecial: {
      name: string;
      price: number;
      items: string;
    };
    chickenSpecial: {
      name: string;
      price: number;
      items: string;
    };
  };

  // Subscriptions & Monthly Packages
  packages: {
    veg: {
      dailyPrice: number;
      monthlyPrice: number;
      description: string;
      itemsIncluded: string;
    };
    egg: {
      dailyPrice: number;
      monthlyPrice: number;
      description: string;
      itemsIncluded: string;
    };
    nonVeg: {
      dailyPrice: number;
      monthlyPrice: number;
      description: string;
      itemsIncluded: string;
    };
    trial: {
      price: number;
      description: string;
    };
  };

  // Delivery & Operations
  deliveryCharge: number;
  freeDeliveryAbove: number;
  deliverySlots: {
    lunchTime: string;
    dinnerTime: string;
    lunchCutoff: string;
    dinnerCutoff: string;
  };
  deliveryLocations: string;

  // Form & Website Disclaimers
  orderFormNote: string;
  registrationDisclaimer: string;

  // Security Access PINs
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
  whatsappNumber: "919300000000", // Yahan Super Admin panel se apna 93... WhatsApp Business number save karein
  email: "support@bringmybite.com",
  kitchenAddress: "Knowledge Park III, Near Galgotias Campus, Greater Noida, UP - 201310",

  heroBadge: "🔥 #1 Student & Office Tiffin Service in Greater Noida",
  heroHeadline: "Ghar Jaisa Swad, Roz Aapke Gate Par",
  heroTagline: "Fresh, hygienic & authentic North Indian homemade meals cooked daily with premium ingredients and zero preservatives.",
  heroBannerImage: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=1200&auto=format&fit=crop&q=80",
  thaliImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
  vegThaliImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
  nonVegThaliImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",

  bankAccountName: "Bring My Bite Foods",
  bankAccountNumber: "900484898401",
  bankIfscCode: "UTIB0000123",
  bankName: "Axis Bank",
  bankBranch: "Greater Noida Alpha 1 Branch",
  upiId: "9004848984@axisbank",
  upiQrImage: "https://images.unsplash.com/photo-1556742049-0a67e5572263?w=500&auto=format&fit=crop&q=60",

  singleThalis: {
    miniVeg: {
      name: "Mini Daily Veg Thali",
      price: 89,
      items: "3 Tawa Rotis + Dal Tadka + Seasonal Sabzi + Salad",
    },
    standardVeg: {
      name: "Standard North Indian Thali",
      price: 110,
      items: "4 Butter Rotis + Paneer/Special Sabzi + Dal Fry + Jeera Rice + Salad & Pickle",
    },
    eggSpecial: {
      name: "High-Protein Double Egg Thali",
      price: 130,
      items: "2-Egg Curry + 4 Butter Rotis + Steamed Rice + Dal + Salad",
    },
    chickenSpecial: {
      name: "Homestyle Chicken Special Thali",
      price: 160,
      items: "Desi Chicken Curry (3 Pcs) + 4 Rotis + Steamed Rice + Raita & Salad",
    },
  },

  packages: {
    veg: {
      dailyPrice: 110,
      monthlyPrice: 2999,
      description: "Shuddh Shakahari Ghar Ka Khana",
      itemsIncluded: "4 Butter Tawa Rotis + Dal Tadka + Seasonal Sabzi + Jeera Rice + Salad & Pickle",
    },
    egg: {
      dailyPrice: 130,
      monthlyPrice: 3499,
      description: "High-Protein Double Egg Curry Combo",
      itemsIncluded: "2-Egg Rich Curry + 4 Soft Rotis + Steamed Rice + Dal + Fresh Salad",
    },
    nonVeg: {
      dailyPrice: 160,
      monthlyPrice: 4199,
      description: "Desi Style Special Chicken Thali",
      itemsIncluded: "Homestyle Chicken Curry (3 Pcs) + 4 Rotis + Rice + Salad & Raita",
    },
    trial: {
      price: 99,
      description: "Single Meal Taste Experience (Zero Commitment)",
    },
  },

  deliveryCharge: 0,
  freeDeliveryAbove: 0,
  deliverySlots: {
    lunchTime: "12:30 PM - 02:00 PM",
    dinnerTime: "07:30 PM - 09:30 PM",
    lunchCutoff: "10:30 AM",
    dinnerCutoff: "05:30 PM",
  },
  deliveryLocations: "Galgotias University (Gate 1 & 2), Sharda University, Bennett University, Knowledge Park Hostels, Pari Chowk",

  orderFormNote: "Payment confirmation ke baad 15 minute ke andar WhatsApp par order token bheja jata hai.",
  registrationDisclaimer: "By registering you agree to daily meal delivery cutoff timings.",

  superAdminPin: "6655",
  adminPin: "6655",
  managerPin: "4433",
  kitchenPin: "1234",
};

const CONFIG_KEY = "bmb_live_site_config_v5";

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
