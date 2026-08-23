import React, { useState, useEffect } from 'react';
import { getSiteConfig, saveSiteConfig, SiteConfig, DEFAULT_CONFIG } from '../../utils/siteConfigStore';

interface SuperAdminPanelProps {
  onClose?: () => void;
}

type TabType = 'brand' | 'pricing' | 'banking' | 'banners' | 'operations' | 'security';

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onClose }) => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('brand');
  const [saveToast, setSaveToast] = useState<string>('');
  const [showPins, setShowPins] = useState<boolean>(false);

  useEffect(() => {
    setConfig(getSiteConfig());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.superAdminPin) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Super Admin PIN. Default is 6655.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteConfig(config);
    setSaveToast('Saari details & prices website par live save ho gayi hain!');
    setTimeout(() => setSaveToast(''), 4000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Kya aap saari settings default value par reset karna chahte hain?')) {
      setConfig(DEFAULT_CONFIG);
      saveSiteConfig(DEFAULT_CONFIG);
      setSaveToast('Settings reset to default!');
      setTimeout(() => setSaveToast(''), 4000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111A14] flex items-center justify-center p-4 text-[#FAF7F2]">
        <div className="max-w-md w-full bg-[#18261E] border border-[#D97706]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#D97706]/10 rounded-full blur-2xl"></div>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#B45309] to-[#F59E0B] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-[#D97706]/20">
              👑
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Super Admin Portal</h2>
            <p className="text-emerald-300/70 text-xs mt-1">Master Control Center • Bring My Bite</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Enter Master PIN (Default: 6655)
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3.5 bg-[#0F1A13] border border-[#23382B] focus:border-[#F59E0B] rounded-2xl text-white text-center text-2xl tracking-[0.4em] outline-none transition"
                autoFocus
              />
              {pinError && <p className="text-rose-400 text-xs font-medium mt-2 text-center">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:brightness-110 text-[#111A14] font-black rounded-2xl shadow-xl shadow-[#D97706]/25 transition"
            >
              Unlock Control Center
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#0F1A13] hover:bg-[#23382B] text-emerald-200/80 text-xs font-semibold rounded-xl transition"
              >
                Back to Website
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1712] text-[#FAF7F2] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#15231B] border-b border-[#243B2D] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#D97706] to-[#F59E0B] rounded-xl flex items-center justify-center text-xl shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">Bring My Bite Master CMS</h1>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-full uppercase">
                  Super Admin Live
                </span>
              </div>
              <p className="text-emerald-300/60 text-xs">Dynamic pricing, compliance, media, UPI & security controls</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              type="button"
              className="px-3.5 py-2 bg-[#203326] hover:bg-[#2a4533] text-emerald-200 text-xs font-semibold rounded-xl transition"
            >
              Reset Defaults
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition"
            >
              Lock
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] text-xs font-black rounded-xl shadow-md transition"
              >
                View Live Site ↗
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-2.5 border-t border-[#1F3326] scrollbar-none">
          {[
            { id: 'brand', label: '🏢 Brand & Legal (FSSAI/GST)', icon: '🏛️' },
            { id: 'pricing', label: '🍱 Meal Plans & Subscriptions', icon: '💰' },
            { id: 'banking', label: '💳 Banking & UPI QR', icon: '🏦' },
            { id: 'banners', label: '🎨 Banners & Images', icon: '🖼️' },
            { id: 'operations', label: '🚚 Gates & Timings', icon: '⏰' },
            { id: 'security', label: '🔒 Staff Access PINs', icon: '🔑' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] shadow-md'
                  : 'bg-[#18271E] text-emerald-200/80 hover:bg-[#23382B]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {saveToast && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-3">
            <span className="text-base">✅</span>
            <span>{saveToast}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: BRAND & LEGAL (FSSAI, GST, CONTACTS) */}
          {activeTab === 'brand' && (
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                  🏛️ Brand Identity & Government Compliance
                </h3>
                <p className="text-emerald-300/60 text-xs mt-0.5">Website footer, invoice headers aur legal disclaimer data</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Brand Display Name</label>
                  <input
                    type="text"
                    value={config.brandName}
                    onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Legal Company Name</label>
                  <input
                    type="text"
                    value={config.legalEntityName}
                    onChange={(e) => setConfig({ ...config, legalEntityName: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">FSSAI License Number</label>
                  <input
                    type="text"
                    value={config.fssaiNumber}
                    onChange={(e) => setConfig({ ...config, fssaiNumber: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">GST Registration No.</label>
                  <input
                    type="text"
                    value={config.gstNumber}
                    onChange={(e) => setConfig({ ...config, gstNumber: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Customer Support Phone</label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">WhatsApp Order Number</label>
                  <input
                    type="text"
                    value={config.whatsappNumber}
                    onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Official Support Email</label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Kitchen / Headquarters Address</label>
                  <input
                    type="text"
                    value={config.kitchenAddress}
                    onChange={(e) => setConfig({ ...config, kitchenAddress: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEAL PLANS & PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Veg Package */}
                <div className="bg-[#15231B] border border-emerald-500/30 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/40">
                      🌱 Pure Veg Plan
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">Daily Meal Price (₹)</label>
                    <input
                      type="number"
                      value={config.packages.veg.dailyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            veg: { ...config.packages.veg, dailyPrice: parseFloat(e.target.value) || 0 },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">Monthly Subscription (₹)</label>
                    <input
                      type="number"
                      value={config.packages.veg.monthlyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            veg: { ...config.packages.veg, monthlyPrice: parseFloat(e.target.value) || 0 },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={config.packages.veg.description}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            veg: { ...config.packages.veg, description: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">Items Included</label>
                    <textarea
                      rows={2}
                      value={config.packages.veg.itemsIncluded}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            veg: { ...config.packages.veg, itemsIncluded: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white resize-none"
                    />
                  </div>
                </div>

                {/* Egg Package */}
                <div className="bg-[#15231B] border border-amber-500/30 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full border border-amber-500/40">
                      🍳 Egg Special Plan
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">Daily Meal Price (₹)</label>
                    <input
                      type="number"
                      value={config.packages.egg.dailyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            egg: { ...config.packages.egg, dailyPrice: parseFloat(e.target.value) || 0 },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">Monthly Subscription (₹)</label>
                    <input
                      type="number"
                      value={config.packages.egg.monthlyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            egg: { ...config.packages.egg, monthlyPrice: parseFloat(e.target.value) || 0 },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={config.packages.egg.description}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            egg: { ...config.packages.egg, description: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">Items Included</label>
                    <textarea
                      rows={2}
                      value={config.packages.egg.itemsIncluded}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            egg: { ...config.packages.egg, itemsIncluded: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white resize-none"
                    />
                  </div>
                </div>

                {/* Non-Veg Package */}
                <div className="bg-[#15231B] border border-rose-500/30 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-300 font-bold text-xs rounded-full border border-rose-500/40">
                      🍗 Non-Veg Plan
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-300 mb-1">Daily Meal Price (₹)</label>
                    <input
                      type="number"
                      value={config.packages.nonVeg.dailyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            nonVeg: { ...config.packages.nonVeg, dailyPrice: parseFloat(e.target.value) || 0 },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-300 mb-1">Monthly Subscription (₹)</label>
                    <input
                      type="number"
                      value={config.packages.nonVeg.monthlyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            nonVeg: { ...config.packages.nonVeg, monthlyPrice: parseFloat(e.target.value) || 0 },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-300 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={config.packages.nonVeg.description}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            nonVeg: { ...config.packages.nonVeg, description: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-300 mb-1">Items Included</label>
                    <textarea
                      rows={2}
                      value={config.packages.nonVeg.itemsIncluded}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: {
                            ...config.packages,
                            nonVeg: { ...config.packages.nonVeg, itemsIncluded: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Extra: Trial & Delivery Charges */}
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-indigo-300 mb-1.5">Trial Meal Rate (₹)</label>
                  <input
                    type="number"
                    value={config.packages.trial.price}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        packages: {
                          ...config.packages,
                          trial: { ...config.packages.trial, price: parseFloat(e.target.value) || 0 },
                        },
                      })
                    }
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Delivery Charge per Order (₹)</label>
                  <input
                    type="number"
                    value={config.deliveryCharge}
                    onChange={(e) => setConfig({ ...config, deliveryCharge: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={config.freeDeliveryAbove}
                    onChange={(e) => setConfig({ ...config, freeDeliveryAbove: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-white font-bold text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANKING & UPI QR */}
          {activeTab === 'banking' && (
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                  🏦 Bank Account & UPI Payment Destination
                </h3>
                <p className="text-emerald-300/60 text-xs mt-0.5">Yeh account customer order modal aur checkout screen me show hota hai</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">UPI ID (VPA)</label>
                  <input
                    type="text"
                    value={config.upiId}
                    onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Account Beneficiary Name</label>
                  <input
                    type="text"
                    value={config.bankAccountName}
                    onChange={(e) => setConfig({ ...config, bankAccountName: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Bank Account Number</label>
                  <input
                    type="text"
                    value={config.bankAccountNumber}
                    onChange={(e) => setConfig({ ...config, bankAccountNumber: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    value={config.bankIfscCode}
                    onChange={(e) => setConfig({ ...config, bankIfscCode: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={config.bankName}
                    onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Branch</label>
                  <input
                    type="text"
                    value={config.bankBranch}
                    onChange={(e) => setConfig({ ...config, bankBranch: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">UPI QR Code Image URL</label>
                  <input
                    type="text"
                    value={config.upiQrImage}
                    onChange={(e) => setConfig({ ...config, upiQrImage: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                  {config.upiQrImage && (
                    <div className="mt-3 flex items-center gap-4 p-3 bg-[#0F1A13] border border-[#243B2D] rounded-2xl w-fit">
                      <img
                        src={config.upiQrImage}
                        alt="QR Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-emerald-500/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                        }}
                      />
                      <div className="text-xs text-emerald-200/70">
                        <p className="font-bold text-white">Live QR Preview</p>
                        <p className="text-[11px]">UPI: {config.upiId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BANNERS & MEDIA */}
          {activeTab === 'banners' && (
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                  🖼️ Homepage Banners & Showcase Media
                </h3>
                <p className="text-emerald-300/60 text-xs mt-0.5">Hero top text, badges and dish photos across the website</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Hero Top Badge Text</label>
                  <input
                    type="text"
                    value={config.heroBadge}
                    onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Hero Main Headline</label>
                  <input
                    type="text"
                    value={config.heroHeadline}
                    onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Hero Sub-Tagline</label>
                  <textarea
                    rows={2}
                    value={config.heroTagline}
                    onChange={(e) => setConfig({ ...config, heroTagline: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Hero Banner Image URL</label>
                  <input
                    type="text"
                    value={config.heroBannerImage}
                    onChange={(e) => setConfig({ ...config, heroBannerImage: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Main Showcase Thali Image URL</label>
                  <input
                    type="text"
                    value={config.thaliImage}
                    onChange={(e) => setConfig({ ...config, thaliImage: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Veg Thali Card Photo URL</label>
                  <input
                    type="text"
                    value={config.vegThaliImage}
                    onChange={(e) => setConfig({ ...config, vegThaliImage: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Non-Veg Thali Card Photo URL</label>
                  <input
                    type="text"
                    value={config.nonVegThaliImage}
                    onChange={(e) => setConfig({ ...config, nonVegThaliImage: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OPERATIONS & GATES */}
          {activeTab === 'operations' && (
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                  🚚 Delivery Gates & Shift Timings
                </h3>
                <p className="text-emerald-300/60 text-xs mt-0.5">Meal delivery windows, cutoff times and covered institutions</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Lunch Delivery Window</label>
                  <input
                    type="text"
                    value={config.deliverySlots.lunchTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        deliverySlots: { ...config.deliverySlots, lunchTime: e.target.value },
                      })
                    }
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Lunch Booking Cutoff Time</label>
                  <input
                    type="text"
                    value={config.deliverySlots.lunchCutoff}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        deliverySlots: { ...config.deliverySlots, lunchCutoff: e.target.value },
                      })
                    }
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Dinner Delivery Window</label>
                  <input
                    type="text"
                    value={config.deliverySlots.dinnerTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        deliverySlots: { ...config.deliverySlots, dinnerTime: e.target.value },
                      })
                    }
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Dinner Booking Cutoff Time</label>
                  <input
                    type="text"
                    value={config.deliverySlots.dinnerCutoff}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        deliverySlots: { ...config.deliverySlots, dinnerCutoff: e.target.value },
                      })
                    }
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Covered Colleges / Hostels / Gates</label>
                  <textarea
                    rows={2}
                    value={config.deliveryLocations}
                    onChange={(e) => setConfig({ ...config, deliveryLocations: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-emerald-200 mb-1.5">Order Form Confirmation Note</label>
                  <input
                    type="text"
                    value={config.orderFormNote}
                    onChange={(e) => setConfig({ ...config, orderFormNote: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY PINS */}
          {activeTab === 'security' && (
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                    🔒 Portal Passcodes & Access Control PINs
                  </h3>
                  <p className="text-emerald-300/60 text-xs mt-0.5">Staff aur administrative workspaces ke authentication PINs</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPins(!showPins)}
                  className="px-3 py-1.5 bg-[#203326] text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/20"
                >
                  {showPins ? '🙈 Hide PINs' : '👁️ Reveal PINs'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div className="bg-[#0F1A13] p-4 rounded-2xl border border-amber-500/40">
                  <span className="text-xs font-bold text-amber-300 uppercase">👑 Super Admin PIN</span>
                  <input
                    type={showPins ? 'text' : 'password'}
                    value={config.superAdminPin}
                    onChange={(e) => setConfig({ ...config, superAdminPin: e.target.value })}
                    className="mt-2 w-full bg-[#18271E] border border-amber-500/40 rounded-xl px-3 py-2 text-center text-amber-300 font-mono font-black text-lg outline-none"
                  />
                  <p className="text-[10px] text-emerald-300/50 mt-1 text-center">Master full access</p>
                </div>

                <div className="bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D]">
                  <span className="text-xs font-bold text-emerald-200 uppercase">💼 Admin Panel PIN</span>
                  <input
                    type={showPins ? 'text' : 'password'}
                    value={config.adminPin}
                    onChange={(e) => setConfig({ ...config, adminPin: e.target.value })}
                    className="mt-2 w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-center text-white font-mono font-bold text-lg outline-none"
                  />
                  <p className="text-[10px] text-emerald-300/50 mt-1 text-center">Orders & daily stats</p>
                </div>

                <div className="bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D]">
                  <span className="text-xs font-bold text-emerald-200 uppercase">📋 Manager PIN</span>
                  <input
                    type={showPins ? 'text' : 'password'}
                    value={config.managerPin}
                    onChange={(e) => setConfig({ ...config, managerPin: e.target.value })}
                    className="mt-2 w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-center text-white font-mono font-bold text-lg outline-none"
                  />
                  <p className="text-[10px] text-emerald-300/50 mt-1 text-center">Deliveries & attendance</p>
                </div>

                <div className="bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D]">
                  <span className="text-xs font-bold text-emerald-200 uppercase">👨‍🍳 Kitchen/Chef PIN</span>
                  <input
                    type={showPins ? 'text' : 'password'}
                    value={config.kitchenPin}
                    onChange={(e) => setConfig({ ...config, kitchenPin: e.target.value })}
                    className="mt-2 w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-center text-white font-mono font-bold text-lg outline-none"
                  />
                  <p className="text-[10px] text-emerald-300/50 mt-1 text-center">Live kitchen display</p>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Floating Save Bar */}
          <div className="sticky bottom-6 bg-[#15231B]/95 backdrop-blur-md border border-[#2B4534] p-4 rounded-3xl shadow-2xl flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-300/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Changes reflect instantly on live website upon save</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:brightness-110 text-[#111A14] font-black rounded-2xl shadow-xl shadow-[#D97706]/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <span>💾</span>
              <span>Save & Publish Live Changes</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
