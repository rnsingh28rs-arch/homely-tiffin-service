import React, { useState, useEffect } from 'react';
import { getSiteConfig, saveSiteConfig, SiteConfig } from '../../utils/siteConfigStore';

interface SuperAdminPanelProps {
  onClose?: () => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onClose }) => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    setConfig(getSiteConfig());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.superAdminPin) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Galat PIN! Super Admin PIN enter karein.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteConfig(config);
    setSaveMessage('Saari settings aur prices successfully live save ho gayi hain!');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handlePriceChange = (field: keyof SiteConfig['prices'], value: string) => {
    const num = parseFloat(value) || 0;
    setConfig((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [field]: num,
      },
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold border border-amber-500/30">
              👑
            </div>
            <h2 className="text-2xl font-bold">Super Admin Portal</h2>
            <p className="text-slate-400 text-sm mt-1">Master PIN daal kar access karein</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Super Admin PIN (Default: 6655)
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN enter karein"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-xl tracking-widest focus:outline-none focus:border-amber-500"
                autoFocus
              />
              {pinError && <p className="text-red-400 text-xs mt-2 text-center">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Unlock Full Control Center
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-xl transition"
              >
                Website Par Wapas Jayein
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold">
                👑 Super Admin Master
              </span>
              <h1 className="text-2xl font-black">Bring My Bite Control Center</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">Live Pricing, Packages, Payments, Images & Security PINs</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
            >
              Lock Panel
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition"
              >
                Go to Website
              </button>
            )}
          </div>
        </div>

        {saveMessage && (
          <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-medium">
            ✅ {saveMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Section 1: Business & Payment Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              💳 Business & Payment Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">UPI ID (VPA)</label>
                <input
                  type="text"
                  value={config.upiId}
                  onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">WhatsApp Number</label>
                <input
                  type="text"
                  value={config.whatsappNumber}
                  onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Display Phone</label>
                <input
                  type="text"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Support Email</label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Delivery Charge (₹)</label>
                <input
                  type="number"
                  value={config.prices.deliveryCharge}
                  onChange={(e) => handlePriceChange('deliveryCharge', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Complete Meal Pricing */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              💰 Live Meal & Subscription Pricing (₹)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase">🌱 Pure Veg</span>
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Daily Meal (₹)</label>
                    <input
                      type="number"
                      value={config.prices.vegDaily}
                      onChange={(e) => handlePriceChange('vegDaily', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Monthly Plan (₹)</label>
                    <input
                      type="number"
                      value={config.prices.vegMonthly}
                      onChange={(e) => handlePriceChange('vegMonthly', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-yellow-400 uppercase">🍳 Egg Special</span>
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Daily Meal (₹)</label>
                    <input
                      type="number"
                      value={config.prices.eggDaily}
                      onChange={(e) => handlePriceChange('eggDaily', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Monthly Plan (₹)</label>
                    <input
                      type="number"
                      value={config.prices.eggMonthly}
                      onChange={(e) => handlePriceChange('eggMonthly', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-rose-400 uppercase">🍗 Non-Veg</span>
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Daily Meal (₹)</label>
                    <input
                      type="number"
                      value={config.prices.nonVegDaily}
                      onChange={(e) => handlePriceChange('nonVegDaily', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Monthly Plan (₹)</label>
                    <input
                      type="number"
                      value={config.prices.nonVegMonthly}
                      onChange={(e) => handlePriceChange('nonVegMonthly', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-indigo-400 uppercase">🍱 Trial Meal</span>
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Trial Meal Single (₹)</label>
                    <input
                      type="number"
                      value={config.prices.trialMeal}
                      onChange={(e) => handlePriceChange('trialMeal', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Slots & Locations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              🚚 Delivery Timing & Gate Locations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Lunch Delivery Window</label>
                <input
                  type="text"
                  value={config.deliverySlots.lunchTime}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliverySlots: { ...config.deliverySlots, lunchTime: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Dinner Delivery Window</label>
                <input
                  type="text"
                  value={config.deliverySlots.dinnerTime}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliverySlots: { ...config.deliverySlots, dinnerTime: e.target.value },
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Covered Gates / Colleges</label>
                <input
                  type="text"
                  value={config.deliveryLocations}
                  onChange={(e) => setConfig({ ...config, deliveryLocations: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Images & Branding URLs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              🖼️ Live Photos & QR Code URLs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">UPI QR Code Image URL</label>
                <input
                  type="text"
                  value={config.upiQrImage}
                  onChange={(e) => setConfig({ ...config, upiQrImage: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Hero Banner Photo URL</label>
                <input
                  type="text"
                  value={config.heroBannerImage}
                  onChange={(e) => setConfig({ ...config, heroBannerImage: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Thali Feature Photo URL</label>
                <input
                  type="text"
                  value={config.thaliImage}
                  onChange={(e) => setConfig({ ...config, thaliImage: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Hero Tagline</label>
                <input
                  type="text"
                  value={config.heroTagline}
                  onChange={(e) => setConfig({ ...config, heroTagline: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Security PINs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              🔒 Security & Portal PINs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Super Admin PIN</label>
                <input
                  type="text"
                  value={config.superAdminPin}
                  onChange={(e) => setConfig({ ...config, superAdminPin: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Admin Panel PIN</label>
                <input
                  type="text"
                  value={config.adminPin}
                  onChange={(e) => setConfig({ ...config, adminPin: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Manager PIN</label>
                <input
                  type="text"
                  value={config.managerPin}
                  onChange={(e) => setConfig({ ...config, managerPin: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Kitchen Display PIN</label>
                <input
                  type="text"
                  value={config.kitchenPin}
                  onChange={(e) => setConfig({ ...config, kitchenPin: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Sticky Submit Bar */}
          <div className="sticky bottom-4 bg-slate-900/95 backdrop-blur border border-slate-800 p-4 rounded-2xl flex justify-end shadow-2xl">
            <button
              type="submit"
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 text-base"
            >
              💾 Save All Live Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
