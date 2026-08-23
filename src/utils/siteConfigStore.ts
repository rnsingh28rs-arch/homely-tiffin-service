export interface SiteConfig {
  superAdminPin: string;
  adminPin: string;
  managerPin: string;
  kitchenPin: string;
  upiId: string;
  upiQrImage: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  heroTagline: string;
  heroBannerImage: string;
  thaliImage: string;
  deliverySlots: {
    lunchTime: string;
    dinnerTime: string;
  };
  deliveryLocations: string;
  prices: {
    vegDaily: number;
    vegMonthly: number;
    eggDaily: number;
    eggMonthly: number;
    nonVegDaily: number;
    nonVegMonthly: number;
    trialMeal: number;
    deliveryCharge: number;
  };
}

export const DEFAULT_CONFIG: SiteConfig = {
  superAdminPin: "6655",
  adminPin: "6655",
  managerPin: "4433",
  kitchenPin: "1234",
  upiId: "9004848984@axisbank",
  upiQrImage: "https://images.unsplash.com/photo-1556742049-0a67e5572263?w=500&auto=format&fit=crop&q=60",
  whatsappNumber: "919004848984",
  phone: "+91 9004848984",
  email: "support@bringmybite.com",
  heroTagline: "Ghar Jaisa Swad, Roz Aapke College & Office Gate Tak",
  heroBannerImage: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=1200&auto=format&fit=crop&q=80",
  thaliImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
  deliverySlots: {
    lunchTime: "12:30 PM - 02:00 PM",
    dinnerTime: "07:30 PM - 09:30 PM",
  },
  deliveryLocations: "Galgotias University (Gate 1 & 2), Sharda University, Bennett University, Knowledge Park Hostels",
  prices: {
    vegDaily: 110,
    vegMonthly: 2999,
    eggDaily: 130,
    eggMonthly: 3499,
    nonVegDaily: 160,
    nonVegMonthly: 4199,
    trialMeal: 99,
    deliveryCharge: 0,
  },
};

const CONFIG_KEY = "bmb_live_site_config_v3";

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
