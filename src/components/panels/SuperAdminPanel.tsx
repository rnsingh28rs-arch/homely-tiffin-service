import React, { useState, useEffect, useRef } from 'react';
import { getSiteConfig, saveSiteConfig, SiteConfig, DynamicDish, DEFAULT_CONFIG } from '../../utils/siteConfigStore';
import { getStoredOrders, OrderItem } from '../../utils/orderStore';
import { getStoredFundRequests, FundRequest } from '../../utils/inventoryStore';
import { getStoredSalaryLedger, SalaryPayment } from '../../utils/staffStore';

interface SuperAdminPanelProps {
  onClose?: () => void;
}

type TabType = 'dishesManager' | 'pnlDashboard' | 'subscriptions' | 'banking' | 'brand' | 'banners' | 'operations' | 'security';

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onClose }) => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [orders, setOrders] = useState<OrderItem[]>(getStoredOrders());
  const [funds, setFunds] = useState<FundRequest[]>(getStoredFundRequests());
  const [salaryLedger, setSalaryLedger] = useState<SalaryPayment[]>(getStoredSalaryLedger());
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('dishesManager');
  const [saveToast, setSaveToast] = useState<string>('');
  const [showPins, setShowPins] = useState<boolean>(false);

  // Edit Existing Dish Modal State
  const [editingDish, setEditingDish] = useState<DynamicDish | null>(null);

  // Add New Dish Modal State
  const [showNewDishModal, setShowNewDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCat, setNewDishCat] = useState<DynamicDish['category']>('Veg');
  const [newDishPrice, setNewDishPrice] = useState<number>(80);
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

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveSiteConfig(config);
    setSaveToast('✅ Saari Details, Rates aur Phone Number permanently save ho gaye!');
    setTimeout(() => setSaveToast(''), 4000);
  };

  // Direct Inline Price Change Handler (Instantly updates without closing card)
  const handleInlinePriceChange = (dishId: string, newPrice: number) => {
    const updatedDishes = config.dishes.map((d) =>
      d.id === dishId ? { ...d, price: newPrice } : d
    );
    const updatedConfig = { ...config, dishes: updatedDishes };
    setConfig(updatedConfig);
    saveSiteConfig(updatedConfig);
  };

  // Full Dish Edit Save Handler
  const handleUpdateDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;

    const updatedDishes = config.dishes.map((d) =>
      d.id === editingDish.id ? editingDish : d
    );
    const updatedConfig = { ...config, dishes: updatedDishes };
    setConfig(updatedConfig);
    saveSiteConfig(updatedConfig);
    setEditingDish(null);
    setSaveToast(`✅ Dish "${editingDish.name}" updated successfully with new rate ₹${editingDish.price}!`);
    setTimeout(() => setSaveToast(''), 4000);
  };

  // Create New Dish
  const handleCreateNewDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim() || !newDishItems.trim() || newDishPrice <= 0) {
      alert('Kripya saare fields sahi se bharein!');
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

    setNewDishName('');
    setNewDishItems('');
    setNewDishPrice(80);
    setNewDishImg('');
    setShowNewDishModal(false);
    setSaveToast(`✅ New Dish "${created.name}" (₹${created.price}) added to live menu!`);
    setTimeout(() => setSaveToast(''), 4000);
  };

  // Delete Dish
  const handleDeleteDish = (dishId: string) => {
    if (window.confirm('Kya aap sach me is dish ko menu se hatana chahte hain?')) {
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

  const grossGMV = orders.filter((o) => o.status !== 'rejected').reduce((s, o) => s + o.amount, 0);
  const totalMandiExpenses = funds.filter((f) => f.status === 'approved').reduce((s, f) => s + f.totalBudget, 0);
  const totalPayrollPaid = salaryLedger.reduce((s, p) => s + p.netPaid, 0);
  const totalExpenses = totalMandiExpenses + totalPayrollPaid;
  const netPureProfit = grossGMV - totalExpenses;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111A14] flex items-center justify-center p-4 text-[#FAF7F2]">
        <div className="max-w-md w-full bg-[#18261E] border border-[#D97706]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#B45309] to-[#F59E0B] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg">
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
              Unlock Control Center
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
              <p className="text-emerald-300/60 text-xs">Live Rate Editor, Dish Photos, WhatsApp Phone & Accounts</p>
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

        {/* Tab Navigation with Scroll Arrows */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex items-center border-t border-[#1F3326]">
          <button
            type="button"
            onClick={() => handleScrollTabs('left')}
            className="p-2 text-amber-400 hover:text-white bg-[#0F1A13] hover:bg-[#203326] border border-[#243B2D] rounded-xl text-xs font-bold mr-1 z-10 transition cursor-pointer"
          >
            ◀
          </button>

          <div
            ref={tabScrollRef}
            className="flex-1 flex gap-2 overflow-x-auto py-2.5 scrollbar-none scroll-smooth"
          >
            {[
              { id: 'dishesManager', label: `🍛 Dishes & Rate Editor (${config.dishes?.length || 0})`, icon: '🍱' },
              { id: 'brand', label: '🏢 WhatsApp Phone & Legal', icon: '🏛️' },
              { id: 'subscriptions', label: '📅 Monthly Subscriptions', icon: '📋' },
              { id: 'banking', label: '🏦 Bank Account & UPI QR', icon: '💳' },
              { id: 'pnlDashboard', label: '📊 Financial P&L & Profit', icon: '💰' },
              { id: 'banners', label: '🎨 Banners & Photos', icon: '🖼️' },
              { id: 'operations', label: '🚚 Delivery Gates', icon: '⏰' },
              { id: 'security', label: '🔒 Security PINs', icon: '🔑' },
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

          <button
            type="button"
            onClick={() => handleScrollTabs('right')}
            className="p-2 text-amber-400 hover:text-white bg-[#0F1A13] hover:bg-[#203326] border border-[#243B2D] rounded-xl text-xs font-bold ml-1 z-10 transition cursor-pointer"
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

        {/* TAB 1: DISHES MANAGER WITH INLINE RATE EDIT & FULL EDIT POPUP */}
        {activeTab === 'dishesManager' && (
          <div className="space-y-6">
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                    🍛 Live Dishes & Pricing Editor
                  </h3>
                  <p className="text-xs text-emerald-300/70 mt-0.5">
                    Aap yahin se dish ka rate type karke badal sakte hain ya <strong>"✏️ Edit Details"</strong> daba kar photo/description update kar sakte hain!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewDishModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>➕</span> Add New Dish
                </button>
              </div>

              {/* Dishes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.dishes?.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-[#0F1A13] border-2 border-[#243B2D] hover:border-amber-500/40 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition"
                  >
                    <div>
                      {/* Dish Photo Thumbnail */}
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-3 bg-[#18271E]">
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-black/75 text-amber-300 backdrop-blur">
                          {dish.category}
                        </span>
                        {dish.badge && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500 text-slate-950 shadow">
                            {dish.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-white">{dish.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{dish.items}</p>
                    </div>

                    {/* Direct Price Edit & Action Buttons */}
                    <div className="pt-3 border-t border-[#1F3326] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Live Selling Rate (₹):</label>
                        <div className="flex items-center gap-1 bg-[#18271E] border border-amber-500/50 rounded-xl px-2.5 py-1">
                          <span className="text-amber-400 font-black text-sm">₹</span>
                          <input
                            type="number"
                            min="10"
                            value={dish.price}
                            onChange={(e) => handleInlinePriceChange(dish.id, parseFloat(e.target.value) || 0)}
                            className="w-16 bg-transparent text-white font-black text-base outline-none text-right font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingDish(dish)}
                          className="flex-1 py-2 bg-[#203326] hover:bg-[#2c4734] text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>✏️</span> Edit Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleDishAvailability(dish.id)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                            dish.isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                          title="Toggle Live Availability"
                        >
                          {dish.isAvailable ? '✅ Live' : '❌ Off'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDish(dish.id)}
                          className="px-2.5 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition"
                          title="Delete Dish"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MODAL: EDIT EXISTING DISH (NAME, PRICE, PHOTO & ITEMS) */}
            {editingDish && (
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                <div className="relative max-w-lg w-full bg-[#15231B] border-2 border-amber-500/50 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-[#243B2D] pb-3">
                    <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                      <span>✏️</span> Edit Dish: {editingDish.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingDish(null)}
                      className="text-slate-400 hover:text-white text-xs bg-[#0F1A13] px-2.5 py-1 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleUpdateDishSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Dish Name *</label>
                      <input
                        type="text"
                        required
                        value={editingDish.name}
                        onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Category *</label>
                        <select
                          value={editingDish.category}
                          onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value as any })}
                          className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                        >
                          <option value="Veg">🌱 Pure Veg</option>
                          <option value="Egg">🍳 Egg Special</option>
                          <option value="Non-Veg">🍗 Non-Veg</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-1">Selling Rate (₹) *</label>
                        <input
                          type="number"
                          required
                          min="10"
                          value={editingDish.price}
                          onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-[#0F1A13] border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Items Included / Menu Description *</label>
                      <textarea
                        rows={2}
                        required
                        value={editingDish.items}
                        onChange={(e) => setEditingDish({ ...editingDish, items: e.target.value })}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Dish Photo URL</label>
                      <input
                        type="text"
                        value={editingDish.imageUrl}
                        onChange={(e) => setEditingDish({ ...editingDish, imageUrl: e.target.value })}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={editingDish.badge || ''}
                        onChange={(e) => setEditingDish({ ...editingDish, badge: e.target.value })}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingDish(null)}
                        className="px-4 py-2 bg-[#0F1A13] text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 text-xs font-black rounded-xl shadow-lg cursor-pointer"
                      >
                        Update Dish ➔
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: ADD NEW DISH */}
            {showNewDishModal && (
              <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                <div className="relative max-w-md w-full bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-[#243B2D] pb-3">
                    <h3 className="text-base font-black text-amber-300">➕ Add New Dish</h3>
                    <button
                      type="button"
                      onClick={() => setShowNewDishModal(false)}
                      className="text-slate-400 hover:text-white text-xs bg-[#0F1A13] px-2.5 py-1 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateNewDish} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Dish Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Special Paneer Thali"
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
                          <option value="Non-Veg">🍗 Non-Veg</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Selling Rate (₹) *</label>
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
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Items Included (Description) *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. 4 Butter Rotis + Dal + Paneer + Rice + Salad"
                        value={newDishItems}
                        onChange={(e) => setNewDishItems(e.target.value)}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Photo URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newDishImg}
                        onChange={(e) => setNewDishImg(e.target.value)}
                        className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
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
                        Save & Add to Menu ➔
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BRAND & WHATSAPP PHONE */}
        {activeTab === 'brand' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-black text-amber-300">🏛️ WhatsApp Phone Number & Legal</h3>
                <p className="text-xs text-emerald-300/60 mt-0.5">Yahan aapka phone number permanent save rahega</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-[#0F1A13] p-4 rounded-2xl border-2 border-emerald-500/50">
                  <label className="block text-xs font-black text-emerald-300 uppercase mb-1">
                    💬 WhatsApp Business Number (Without + or spaces)
                  </label>
                  <input
                    type="text"
                    value={config.whatsappNumber}
                    onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                    className="w-full bg-[#18271E] border border-emerald-500/50 rounded-xl px-4 py-2.5 text-base text-emerald-200 font-mono font-bold outline-none"
                  />
                  <p className="text-[11px] text-emerald-300/60 mt-1">Example: 919004848984</p>
                </div>

                <div className="bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D]">
                  <label className="block text-xs font-bold text-emerald-200 mb-1">
                    📞 Voice Calling Display Phone
                  </label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="w-full bg-[#18271E] border border-[#243B2D] rounded-xl px-4 py-2.5 text-base text-white font-mono font-bold outline-none"
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

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  💾 Save WhatsApp & Phone Number
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: BANKING */}
        {activeTab === 'banking' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-black text-amber-300">🏦 Banking & UPI QR Suite</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">UPI ID (VPA) *</label>
                  <input
                    type="text"
                    value={config.upiId}
                    onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Beneficiary Name</label>
                  <input
                    type="text"
                    value={config.bankAccountName}
                    onChange={(e) => setConfig({ ...config, bankAccountName: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={config.bankAccountNumber}
                    onChange={(e) => setConfig({ ...config, bankAccountNumber: e.target.value })}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  💾 Save Bank Details
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 4: SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <form onSubmit={handleSave} className="space-y-6">
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

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  💾 Save Monthly Plans
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 5: P&L DASHBOARD */}
        {activeTab === 'pnlDashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div className="bg-[#15231B] border border-amber-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Gross Sales (GMV)</span>
                <div className="text-3xl font-black text-amber-400 mt-2">₹{grossGMV.toLocaleString()}</div>
              </div>
              <div className="bg-[#15231B] border border-rose-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Expenses</span>
                <div className="text-3xl font-black text-rose-400 mt-2">₹{totalExpenses.toLocaleString()}</div>
              </div>
              <div className="bg-[#15231B] border border-emerald-500/40 p-6 rounded-3xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Net Profit</span>
                <div className="text-3xl font-black text-emerald-400 mt-2">₹{netPureProfit.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY */}
        {activeTab === 'security' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-amber-300">🔒 Security Access PINs</h3>
                <button
                  type="button"
                  onClick={() => setShowPins(!showPins)}
                  className="px-3 py-1 bg-[#203326] text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/20"
                >
                  {showPins ? 'Hide' : 'Reveal'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  💾 Save PINs
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};
