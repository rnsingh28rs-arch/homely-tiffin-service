import React, { useState, useEffect } from 'react';
import { getSiteConfig, saveSiteConfig, SiteConfig, DEFAULT_CONFIG } from '../../utils/siteConfigStore';
import { getStoredOrders, OrderItem } from '../../utils/orderStore';
import { getStoredFundRequests, FundRequest } from '../../utils/inventoryStore';

interface SuperAdminPanelProps {
  onClose?: () => void;
}

type TabType = 'ceoDashboard' | 'brand' | 'singleThalis' | 'pricing' | 'banking' | 'banners' | 'operations' | 'security';

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onClose }) => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [orders, setOrders] = useState<OrderItem[]>(getStoredOrders());
  const [funds, setFunds] = useState<FundRequest[]>(getStoredFundRequests());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('ceoDashboard');
  const [saveToast, setSaveToast] = useState<string>('');
  const [showPins, setShowPins] = useState<boolean>(false);

  useEffect(() => {
    setConfig(getSiteConfig());
    setOrders(getStoredOrders());
    setFunds(getStoredFundRequests());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.superAdminPin || pinInput === '6655') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Super Admin Master PIN. Enter 6655.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteConfig(config);
    setSaveToast('All configurations successfully updated live!');
    setTimeout(() => setSaveToast(''), 4000);
  };

  // CEO Level P&L Calculations
  const grossGMV = orders.filter((o) => o.status !== 'rejected').reduce((s, o) => s + o.amount, 0);
  const totalMandiExpenses = funds.filter((f) => f.status === 'approved').reduce((s, f) => s + f.totalBudget, 0);
  const netProfit = grossGMV - totalMandiExpenses;
  const thaliCount = orders.filter((o) => o.status !== 'rejected').length;
  const costPerThali = thaliCount > 0 ? Math.round(totalMandiExpenses / thaliCount) : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111A14] flex items-center justify-center p-4 text-[#FAF7F2]">
        <div className="max-w-md w-full bg-[#18261E] border border-[#D97706]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#B45309] to-[#F59E0B] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-[#D97706]/20">
              👑
            </div>
            <h2 className="text-2xl font-black text-white">Director & CEO Master Suite</h2>
            <p className="text-emerald-300/70 text-xs mt-1">Super Admin Executive Center • Bring My Bite</p>
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
              className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-2xl shadow-xl hover:brightness-110 transition cursor-pointer"
            >
              Unlock Executive Suite
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#0F1A13] hover:bg-[#23382B] text-emerald-200/80 text-xs font-semibold rounded-xl transition cursor-pointer"
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
                <h1 className="text-lg font-black tracking-tight text-white">Director & CEO Master Suite</h1>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-full uppercase">
                  Super Admin Live
                </span>
              </div>
              <p className="text-emerald-300/60 text-xs">P&L Financials, Unit Economics, CMS & Security PINs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#admin"
              className="px-3.5 py-2 bg-[#18271E] hover:bg-[#243B2D] text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition"
            >
              💼 Open Admin Desk
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Lock
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                Exit to Website ↗
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-2.5 border-t border-[#1F3326] scrollbar-none">
          {[
            { id: 'ceoDashboard', label: '📊 CEO Executive P&L', icon: '💎' },
            { id: 'brand', label: '🏢 WhatsApp Business & Legal', icon: '🏛️' },
            { id: 'singleThalis', label: '🍛 Single Thalis CMS', icon: '🍱' },
            { id: 'pricing', label: '📅 Monthly Subscriptions', icon: '💰' },
            { id: 'banking', label: '💳 Banking & UPI QR', icon: '🏦' },
            { id: 'banners', label: '🎨 Banners & Photos', icon: '🖼️' },
            { id: 'operations', label: '🚚 Gates & Timings', icon: '⏰' },
            { id: 'security', label: '🔒 Staff Access PINs', icon: '🔑' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] shadow-md font-black'
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

        {/* TAB 0: CEO EXECUTIVE FINANCIALS (P&L DASHBOARD) */}
        {activeTab === 'ceoDashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div className="bg-[#15231B] border border-amber-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Gross Verified Revenue</span>
                <div className="text-3xl font-black text-amber-400 mt-2">₹{grossGMV.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-300/70 mt-1">Total revenue collected from meals</p>
              </div>

              <div className="bg-[#15231B] border border-rose-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Kitchen Expense</span>
                <div className="text-3xl font-black text-rose-400 mt-2">₹{totalMandiExpenses.toLocaleString()}</div>
                <p className="text-[11px] text-slate-400 mt-1">Mandi raw materials approved</p>
              </div>

              <div className="bg-[#15231B] border border-emerald-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Net Company Profit (EBITDA)</span>
                <div className="text-3xl font-black text-emerald-400 mt-2">₹{netProfit.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-300 mt-1">Gross revenue minus grocery bills</p>
              </div>

              <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Unit Cost / Thali</span>
                <div className="text-3xl font-black text-white mt-2">₹{costPerThali}</div>
                <p className="text-[11px] text-slate-400 mt-1">Avg raw material cost per plate</p>
              </div>
            </div>

            {/* Quick Executive Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl space-y-3">
                <h3 className="text-sm font-black text-amber-300">📈 Orders Overview</h3>
                <div className="text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                    <span>Total Bookings Placed:</span>
                    <span className="font-bold text-white">{orders.length}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                    <span>Active 30-Day Monthly Subscriptions:</span>
                    <span className="font-bold text-emerald-400">{orders.filter((o) => o.planType === 'Monthly' && o.status !== 'rejected').length}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                    <span>Pending Orders Waiting Admin Action:</span>
                    <span className="font-bold text-amber-400">{orders.filter((o) => o.status === 'pending').length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl space-y-3">
                <h3 className="text-sm font-black text-amber-300">🛒 Mandi Clearance Overview</h3>
                <div className="text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                    <span>Total Expense Requests:</span>
                    <span className="font-bold text-white">{funds.length}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                    <span>Funds Cleared by Admin:</span>
                    <span className="font-bold text-emerald-400">{funds.filter((f) => f.status === 'approved').length}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                    <span>Pending Fund Approvals:</span>
                    <span className="font-bold text-rose-400">{funds.filter((f) => f.status === 'pending').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CMS Configuration Forms */}
        {activeTab !== 'ceoDashboard' && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* TAB 1: BRAND & WHATSAPP BUSINESS */}
            {activeTab === 'brand' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-black text-amber-300">🏛️ WhatsApp Business & Compliance</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 bg-[#0F1A13] p-4 rounded-2xl border-2 border-emerald-500/40">
                    <label className="block text-xs font-black text-emerald-300 uppercase mb-1">
                      💬 Official WhatsApp Business Number (For Order Receiving)
                    </label>
                    <input
                      type="text"
                      value={config.whatsappNumber}
                      onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                      className="w-full bg-[#18271E] border border-emerald-500/50 rounded-xl px-4 py-2.5 text-base text-emerald-200 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Voice Calling Phone</label>
                    <input
                      type="text"
                      value={config.phone}
                      onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1.5">FSSAI License No.</label>
                    <input
                      type="text"
                      value={config.fssaiNumber}
                      onChange={(e) => setConfig({ ...config, fssaiNumber: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1.5">GST Registration No.</label>
                    <input
                      type="text"
                      value={config.gstNumber}
                      onChange={(e) => setConfig({ ...config, gstNumber: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Official Support Email</label>
                    <input
                      type="email"
                      value={config.email}
                      onChange={(e) => setConfig({ ...config, email: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SINGLE THALIS */}
            {activeTab === 'singleThalis' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-black text-amber-300">🍛 Single Thali & Instant Meals CMS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Standard Veg */}
                  <div className="bg-[#0F1A13] border border-amber-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-300 uppercase">Standard Veg Thali</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">₹</span>
                        <input
                          type="number"
                          value={config.singleThalis.standardVeg.price}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              singleThalis: {
                                ...config.singleThalis,
                                standardVeg: { ...config.singleThalis.standardVeg, price: parseFloat(e.target.value) || 0 },
                              },
                            })
                          }
                          className="w-20 bg-[#18271E] border border-[#243B2D] rounded-lg px-2 py-1 text-white font-bold text-sm text-right"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={config.singleThalis.standardVeg.items}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          singleThalis: {
                            ...config.singleThalis,
                            standardVeg: { ...config.singleThalis.standardVeg, items: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#18271E] border border-[#243B2D] rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  {/* Chicken Special */}
                  <div className="bg-[#0F1A13] border border-rose-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-rose-300 uppercase">Chicken Special Thali</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">₹</span>
                        <input
                          type="number"
                          value={config.singleThalis.chickenSpecial.price}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              singleThalis: {
                                ...config.singleThalis,
                                chickenSpecial: { ...config.singleThalis.chickenSpecial, price: parseFloat(e.target.value) || 0 },
                              },
                            })
                          }
                          className="w-20 bg-[#18271E] border border-[#243B2D] rounded-lg px-2 py-1 text-white font-bold text-sm text-right"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={config.singleThalis.chickenSpecial.items}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          singleThalis: {
                            ...config.singleThalis,
                            chickenSpecial: { ...config.singleThalis.chickenSpecial, items: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#18271E] border border-[#243B2D] rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MONTHLY SUBSCRIPTIONS */}
            {activeTab === 'pricing' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-black text-amber-300">📅 Monthly Subscription Rates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-[#0F1A13] p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                    <span className="text-xs font-bold text-emerald-300">🌱 Pure Veg (30 Days)</span>
                    <input
                      type="number"
                      value={config.packages.veg.monthlyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: { ...config.packages, veg: { ...config.packages.veg, monthlyPrice: parseFloat(e.target.value) || 0 } },
                        })
                      }
                      className="w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold text-sm"
                    />
                  </div>

                  <div className="bg-[#0F1A13] p-4 rounded-2xl border border-amber-500/30 space-y-2">
                    <span className="text-xs font-bold text-amber-300">🍳 Egg Special (30 Days)</span>
                    <input
                      type="number"
                      value={config.packages.egg.monthlyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: { ...config.packages, egg: { ...config.packages.egg, monthlyPrice: parseFloat(e.target.value) || 0 } },
                        })
                      }
                      className="w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold text-sm"
                    />
                  </div>

                  <div className="bg-[#0F1A13] p-4 rounded-2xl border border-rose-500/30 space-y-2">
                    <span className="text-xs font-bold text-rose-300">🍗 Non-Veg (30 Days)</span>
                    <input
                      type="number"
                      value={config.packages.nonVeg.monthlyPrice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packages: { ...config.packages, nonVeg: { ...config.packages.nonVeg, monthlyPrice: parseFloat(e.target.value) || 0 } },
                        })
                      }
                      className="w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-white font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BANKING & UPI */}
            {activeTab === 'banking' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-black text-amber-300">🏦 Banking & UPI Destination</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">UPI ID (VPA)</label>
                    <input
                      type="text"
                      value={config.upiId}
                      onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Account Beneficiary</label>
                    <input
                      type="text"
                      value={config.bankAccountName}
                      onChange={(e) => setConfig({ ...config, bankAccountName: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Account Number</label>
                    <input
                      type="text"
                      value={config.bankAccountNumber}
                      onChange={(e) => setConfig({ ...config, bankAccountNumber: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BANNERS */}
            {activeTab === 'banners' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-black text-amber-300">🎨 Banner Headline & Images</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Hero Headline</label>
                    <input
                      type="text"
                      value={config.heroHeadline}
                      onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">UPI QR Image URL</label>
                    <input
                      type="text"
                      value={config.upiQrImage}
                      onChange={(e) => setConfig({ ...config, upiQrImage: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: OPERATIONS */}
            {activeTab === 'operations' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-black text-amber-300">🚚 Delivery Slots & Locations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Lunch Window</label>
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
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Dinner Window</label>
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
                </div>
              </div>
            )}

            {/* TAB 7: SECURITY PINS */}
            {activeTab === 'security' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-amber-300">🔒 Portal Access PINs</h3>
                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="px-3 py-1 bg-[#203326] text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/20 cursor-pointer"
                  >
                    {showPins ? 'Hide' : 'Reveal'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                  <div className="bg-[#0F1A13] p-4 rounded-2xl border border-amber-500/40">
                    <span className="text-xs font-bold text-amber-300 uppercase">Super Admin PIN</span>
                    <input
                      type={showPins ? 'text' : 'password'}
                      value={config.superAdminPin}
                      onChange={(e) => setConfig({ ...config, superAdminPin: e.target.value })}
                      className="mt-2 w-full bg-[#18271E] border border-amber-500/40 rounded-xl px-3 py-2 text-center text-amber-300 font-mono font-black text-lg outline-none"
                    />
                  </div>
                  <div className="bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D]">
                    <span className="text-xs font-bold text-emerald-200 uppercase">Admin Desk PIN</span>
                    <input
                      type={showPins ? 'text' : 'password'}
                      value={config.adminPin}
                      onChange={(e) => setConfig({ ...config, adminPin: e.target.value })}
                      className="mt-2 w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-center text-white font-mono font-bold text-lg outline-none"
                    />
                  </div>
                  <div className="bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D]">
                    <span className="text-xs font-bold text-emerald-200 uppercase">Manager PIN</span>
                    <input
                      type={showPins ? 'text' : 'password'}
                      value={config.managerPin}
                      onChange={(e) => setConfig({ ...config, managerPin: e.target.value })}
                      className="mt-2 w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-center text-white font-mono font-bold text-lg outline-none"
                    />
                  </div>
                  <div className="bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D]">
                    <span className="text-xs font-bold text-emerald-200 uppercase">Kitchen PIN</span>
                    <input
                      type={showPins ? 'text' : 'password'}
                      value={config.kitchenPin}
                      onChange={(e) => setConfig({ ...config, kitchenPin: e.target.value })}
                      className="mt-2 w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3 py-2 text-center text-white font-mono font-bold text-lg outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Save Bar */}
            <div className="sticky bottom-6 bg-[#15231B]/95 backdrop-blur-md border border-[#2B4534] p-4 rounded-3xl shadow-2xl flex items-center justify-between">
              <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-300/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All changes update immediately across the live portal</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-2xl shadow-xl hover:brightness-110 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>💾</span>
                <span>Save Live Configurations</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};
