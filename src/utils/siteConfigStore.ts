export interface SiteConfig {
  superAdminPin: string;
  adminPin: string;
  kitchenPin: string;
  upiId: string;
  upiQrImage: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  heroTagline: string;
  prices: {
    dailyStandard: number;
    dailyMini: number;
    monthlyStandard: number;
    monthlyMini: number;
    trialMeal: number;
  };
}

export const DEFAULT_CONFIG: SiteConfig = {
  superAdminPin: "6655",
  adminPin: "6655",
  kitchenPin: "1234",
  upiId: "bringmybite@upi",
  upiQrImage: "https://images.unsplash.com/photo-1556742049-0a67e5572263?w=500&auto=format&fit=crop&q=60",
  whatsappNumber: "919999999999",
  phone: "+91 99999 99999",
  email: "support@bringmybite.com",
  heroTagline: "Ghar Jaisa Swad, Roz Aapke Ghar Tak",
  prices: {
    dailyStandard: 120,
    dailyMini: 90,
    monthlyStandard: 3200,
    monthlyMini: 2500,
    trialMeal: 99,
  },
};

const CONFIG_KEY = "bmb_live_site_config_v2";

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
