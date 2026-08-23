import React, { useState, useEffect, useRef } from 'react';
import { getSiteConfig, saveSiteConfig, SiteConfig, DynamicDish, DEFAULT_CONFIG } from '../../utils/siteConfigStore';
import { getStoredOrders, OrderItem } from '../../utils/orderStore';
import { getStoredFundRequests, FundRequest } from '../../utils/inventoryStore';
import { getStoredSalaryLedger, SalaryPayment } from '../../utils/staffStore';

interface SuperAdminPanelProps {
  onClose?: () => void;
}

type TabType = 'pnlDashboard' | 'dishesManager' | 'subscriptions' | 'banking' | 'brand' | 'banners' | 'operations' | 'security';

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onClose }) => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [orders, setOrders] = useState<OrderItem[]>(getStoredOrders());
  const [funds, setFunds] = useState<FundRequest[]>(getStoredFundRequests());
  const [salaryLedger, setSalaryLedger] = useState<SalaryPayment[]>(getStoredSalaryLedger());
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('pnlDashboard');
  const [saveToast, setSaveToast] = useState<string>('');
  const [showPins, setShowPins] = useState<boolean>(false);

  // New Dish Modal State
  const [showNewDishModal, setShowNewDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCat, setNewDishCat] = useState<DynamicDish['category']>('Veg');
  const [newDishPrice, setNewDishPrice] = useState<number>(99);
  const [newDishItems, setNewDishItems] = useState('');
  const [newDishImg, setNewDishImg] = useState('');
  const [newDishBadge, setNewDishBadge] = useState('New Special 🔥');

  const tabScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConfig(getSiteConfig());
    setOrders(getStoredOrders());
    setFunds(getStoredFundRequests());
    setSalaryLedger(getStoredSalaryLedger());
  }, []);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabScrollRef.current) {
      tabScrollRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      });
    }
  };

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
    setSaveToast('All configurations & dynamic dishes updated live!');
    setTimeout(() => setSaveToast(''), 4000);
  };

  // Add Dynamic Dish
  const handleCreateNewDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim() || !newDishItems.trim() || newDishPrice <= 0) {
      alert('Please fill all dish fields properly!');
      return;
    }

    const created: DynamicDish = {
      id: 'dish-' + Date.now(),
      name: newDishName.trim(),
      category: newDishCat,
      price: Number(newDishPrice),
      items: newDishItems.trim(),
      imageUrl: newDishImg.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      badge: newDishBadge.trim() || undefined,
      isAvailable: true,
    };

    const updatedDishes = [...(config.dishes || []), created];
    const updatedConfig = { ...config, dishes: updatedDishes };
    setConfig(updatedConfig);
    saveSiteConfig(updatedConfig);

    // Reset Form
    setNewDishName('');
    setNewDishItems('');
    setNewDishPrice(99);
    setNewDishImg('');
    setShowNewDishModal(false);
    setSaveToast(`New Dish "${created.name}" created and connected live to Customer Order Form!`);
    setTimeout(() => setSaveToast(''), 4000);
  };

  const handleDeleteDish = (dishId: string) => {
    if (window.confirm('Are you sure you want to delete this dish from the live menu?')) {
      const updated = config.dishes.filter((d) => d.id !== dishId);
      const updatedConfig = { ...config, dishes: updated };
      setConfig(updatedConfig);
      saveSiteConfig(updatedConfig);
      setSaveToast('Dish removed from live menu!');
      setTimeout(() => setSaveToast(''), 4000);
    }
  };

  const handleToggleDishAvailability = (dishId: string) => {
    const updated = config.dishes.map((d) => (d.id === dishId ? { ...d, isAvailable: !d.isAvailable } : d));
    const updatedConfig = { ...config, dishes: updated };
    setConfig(updatedConfig);
    saveSiteConfig(updatedConfig);
  };

  // Full P&L Analytics (Revenue - Mandi Expenses - Staff Payroll)
  const grossGMV = orders.filter((o) => o.status !== 'rejected').reduce((s, o) => s + o.amount, 0);
  const totalMandiExpenses = funds.filter((f) => f.status === 'approved').reduce((s, f) => s + f.totalBudget, 0);
  const totalPayrollPaid = salaryLedger.reduce((s, p) => s + p.netPaid, 0);
  const totalExpenses = totalMandiExpenses + totalPayrollPaid;
  const netPureProfit = grossGMV - totalExpenses;
  const totalThalis = orders.filter((o) => o.status !== 'rejected').length;
  const costPerThali = totalThalis > 0 ? Math.round(totalExpenses / totalThalis) : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111A14] flex items-center justify-center p-4 text-[#FAF7F2]">
        <div className="max-w-md w-full bg-[#18261E] border border-[#D97706]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#B45309] to-[#F59E0B] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-[#D97706]/20">
              👑
            </div>
            <h2 className="text-2xl font-black text-white">Super Admin Control Center</h2>
            <p className="text-emerald-300/70 text-xs mt-1">Master Authentication Required</p>
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
              Unlock Master Center
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
      <header className="bg-[#15231B] border-b border-[#243B2D] sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#D97706] to-[#F59E0B] rounded-xl flex items-center justify-center text-xl shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">Super Admin Control Center</h1>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-full uppercase">
                  Live Master
                </span>
              </div>
              <p className="text-emerald-300/60 text-xs">P&L Financials, Dynamic Combos, Banking, Staff & Security</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#admin"
              className="px-3.5 py-2 bg-[#18271E] hover:bg-[#243B2D] text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <span>💼</span> Admin Desk
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

        {/* Tab Navigation with Left & Right Scroll Buttons */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex items-center border-t border-[#1F3326]">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScrollTabs('left')}
            className="p-2 text-amber-400 hover:text-white bg-[#0F1A13] hover:bg-[#203326] border border-[#243B2D] rounded-xl text-xs font-bold mr-1 z-10 transition cursor-pointer shadow-md"
            title="Scroll Left"
          >
            ◀
          </button>

          {/* Scrollable Container */}
          <div
            ref={tabScrollRef}
            className="flex-1 flex gap-2 overflow-x-auto py-2.5 scrollbar-none scroll-smooth"
          >
            {[
              { id: 'pnlDashboard', label: '📊 Financial P&L & Profit', icon: '💰' },
              { id: 'dishesManager', label: `🍛 Dynamic Menu (${config.dishes?.length || 0})`, icon: '🍱' },
              { id: 'subscriptions', label: '📅 Monthly Subscriptions', icon: '📋' },
              { id: 'banking', label: '🏦 Bank Account & UPI QR', icon: '💳' },
              { id: 'brand', label: '🏢 WhatsApp & Compliance', icon: '🏛️' },
              { id: 'banners', label: '🎨 Banners & Image Specs', icon: '🖼️' },
              { id: 'operations', label: '🚚 Delivery Gates', icon: '⏰' },
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

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScrollTabs('right')}
            className="p-2 text-amber-400 hover:text-white bg-[#0F1A13] hover:bg-[#203326] border border-[#243B2D] rounded-xl text-xs font-bold ml-1 z-10 transition cursor-pointer shadow-md"
            title="Scroll Right"
          >
            ▶
          </button>
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

        {/* TAB 0: EXECUTIVE FINANCIAL P&L */}
        {activeTab === 'pnlDashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div className="bg-[#15231B] border border-amber-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Gross Sales (GMV)</span>
                <div className="text-3xl font-black text-amber-400 mt-2">₹{grossGMV.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-300/70 mt-1">Total revenue collected from meals</p>
              </div>

              <div className="bg-[#15231B] border border-rose-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Mandi + Payroll Expense</span>
                <div className="text-3xl font-black text-rose-400 mt-2">₹{totalExpenses.toLocaleString()}</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mandi: ₹{totalMandiExpenses} • Staff: ₹{totalPayrollPaid}
                </p>
              </div>

              <div className="bg-[#15231B] border border-emerald-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Net Company Profit</span>
                <div className="text-3xl font-black text-emerald-400 mt-2">₹{netPureProfit.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-300 mt-1">Revenue minus all operational costs</p>
              </div>

              <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Expense / Thali</span>
                <div className="text-3xl font-black text-white mt-2">₹{costPerThali}</div>
                <p className="text-[11px] text-slate-400 mt-1">Avg cost per plate served</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: DYNAMIC DISHES & COMBOS ENGINE (CONNECTED TO CUSTOMER ORDER FORM) */}
        {activeTab === 'dishesManager' && (
          <div className="space-y-6">
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                    🍛 Dynamic Menu & Combos Engine
                  </h3>
                  <p className="text-xs text-emerald-300/70 mt-0.5">
                    Any dish added here updates immediately on the Live Customer Instant Order Form!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewDishModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>➕</span> Add New Dish / Combo
                </button>
              </div>

              {/* Dynamic Dishes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {config.dishes?.map((dish) => (
                  <div
                    key={dish.id}
                    className={`bg-[#0F1A13] border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition ${
                      dish.isAvailable ? 'border-[#243B2D]' : 'border-rose-500/30 opacity-60'
                    }`}
                  >
                    <div>
                      {dish.imageUrl && (
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-full h-36 object-cover rounded-xl border border-[#243B2D] mb-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-[#18271E] text-amber-300 border border-amber-500/30">
                          {dish.category}
                        </span>
                        {dish.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300">
                            {dish.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-white mt-1.5">{dish.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{dish.items}</p>
                    </div>

                    <div className="pt-3 border-t border-[#1F3326] flex items-center justify-between">
                      <span className="text-base font-black text-amber-400">₹{dish.price}</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleDishAvailability(dish.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            dish.isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {dish.isAvailable ? '✅ Live' : '❌ Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDish(dish.id)}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal to Add New Dish */}
            {showNewDishModal && (
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                <div className="relative max-w-lg w-full bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-[#243B2D] pb-3">
                    <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                      <span>➕</span> Create New Dish or Rice Combo
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowNewDishModal(false)}
                      className="text-slate-400 hover:text-white text-xs bg-[#0F1A13] px-2.5 py-1 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateNewDish} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Dish / Combo Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amritsari Chole Chawal Combo"
                        value={newDishName}
                        onChange={(e) => setNewDishName(e.target.value)}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Category *</label>
                        <select
                          value={newDishCat}
                          onChange={(e) => setNewDishCat(e.target.value as any)}
                          className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                        >
                          <option value="Veg">🌱 Pure Veg</option>
                          <option value="Egg">🍳 Egg Special</option>
                          <option value="Non-Veg">🍗 Non-Veg Special</option>
                          <option value="Rice Combo">🍚 Rice Combo Bowl</option>
                          <option value="Snacks/Addon">🍟 Snacks / Addon</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Selling Price (₹) *</label>
                        <input
                          type="number"
                          required
                          min="10"
                          value={newDishPrice}
                          onChange={(e) => setNewDishPrice(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Contents & Description (What's in the box) *
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. 1 Bowl Spicy Chole + Steamed Jeera Rice + Onion Salad + Pickle"
                        value={newDishItems}
                        onChange={(e) => setNewDishItems(e.target.value)}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Dish Photo URL (Recommended Size: 600x600 px)
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/... (Square 1:1 image)"
                        value={newDishImg}
                        onChange={(e) => setNewDishImg(e.target.value)}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Display Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. Best Seller ⭐ / Chef Special / High Protein"
                        value={newDishBadge}
                        onChange={(e) => setNewDishBadge(e.target.value)}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewDishModal(false)}
                        className="px-4 py-2 bg-[#0F1A13] text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 text-xs font-black rounded-xl shadow-lg cursor-pointer"
                      >
                        Save & Publish to Menu ➔
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OTHER CONFIG TABS */}
        {activeTab !== 'pnlDashboard' && activeTab !== 'dishesManager' && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* TAB 2: BANKING DETAILS & UPI */}
            {activeTab === 'banking' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-black text-amber-300">🏦 Official Banking & UPI QR Suite</h3>
                  <p className="text-xs text-emerald-300/60 mt-0.5">Customer payments and checkout screen banking info</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Primary UPI ID (VPA) *</label>
                    <input
                      type="text"
                      value={config.upiId}
                      onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Account Beneficiary Name *</label>
                    <input
                      type="text"
                      value={config.bankAccountName}
                      onChange={(e) => setConfig({ ...config, bankAccountName: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Bank Account Number *</label>
                    <input
                      type="text"
                      value={config.bankAccountNumber}
                      onChange={(e) => setConfig({ ...config, bankAccountNumber: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">IFSC Code *</label>
                    <input
                      type="text"
                      value={config.bankIfscCode}
                      onChange={(e) => setConfig({ ...config, bankIfscCode: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Bank Name & Branch</label>
                    <input
                      type="text"
                      value={config.bankName}
                      onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Branch Location</label>
                    <input
                      type="text"
                      value={config.bankBranch}
                      onChange={(e) => setConfig({ ...config, bankBranch: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D]">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {config.upiQrImage && (
                        <img
                          src={config.upiQrImage}
                          alt="QR Code"
                          className="w-24 h-24 object-cover rounded-xl border border-amber-500/40 bg-white p-1"
                        />
                      )}
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-amber-300 mb-1">
                          UPI QR Code Image URL (Recommended Size: 500x500 px Square)
                        </label>
                        <input
                          type="text"
                          value={config.upiQrImage}
                          onChange={(e) => setConfig({ ...config, upiQrImage: e.target.value })}
                          className="w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Google Pay / PhonePe merchant QR image URL to display on customer checkout screen.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BANNERS & IMAGE RESOLUTION GUIDELINES */}
            {activeTab === 'banners' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-black text-amber-300">🎨 Banners & Image Size Guidelines</h3>
                  <p className="text-xs text-emerald-300/60 mt-0.5">Strict pixel dimensions to keep photos sharp & responsive</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2 bg-[#0F1A13] p-4 rounded-2xl border border-amber-500/30">
                    <span className="text-xs font-bold text-amber-400 block mb-1">📐 Recommended Image Dimensions:</span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• <strong>Hero Top Banner:</strong> <span className="font-mono text-emerald-300">1920 x 800 px</span> (Landscape 16:9 / 21:9 - Clear food visual)</li>
                      <li>• <strong>Thalis & Combo Dishes:</strong> <span className="font-mono text-emerald-300">600 x 600 px</span> (Square 1:1 ratio - WebP/JPG format)</li>
                      <li>• <strong>UPI QR Image:</strong> <span className="font-mono text-emerald-300">500 x 500 px</span> (High resolution white background)</li>
                    </ul>
                  </div>

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
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Hero Headline</label>
                    <input
                      type="text"
                      value={config.heroHeadline}
                      onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">Hero Banner Image URL (1920x800 px)</label>
                    <input
                      type="text"
                      value={config.heroBannerImage}
                      onChange={(e) => setConfig({ ...config, heroBannerImage: e.target.value })}
                      className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MONTHLY SUBSCRIPTION PACKAGES */}
            {activeTab === 'subscriptions' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-black text-amber-300">📅 Monthly 30-Day Subscriptions</h3>
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

            {/* TAB 5: BRAND & WHATSAPP */}
            {activeTab === 'brand' && (
              <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-black text-amber-300">🏛️ WhatsApp Business & Compliance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 bg-[#0F1A13] p-4 rounded-2xl border border-emerald-500/40">
                    <label className="block text-xs font-black text-emerald-300 uppercase mb-1">
                      💬 Official WhatsApp Business Number (For Orders & Alerts)
                    </label>
                    <input
                      type="text"
                      value={config.whatsappNumber}
                      onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                      className="w-full bg-[#18271E] border border-emerald-500/50 rounded-xl px-4 py-2 text-sm text-emerald-200 font-mono font-bold outline-none"
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
                  <h3 className="text-base font-black text-amber-300">🔒 Portal Security PINs</h3>
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
