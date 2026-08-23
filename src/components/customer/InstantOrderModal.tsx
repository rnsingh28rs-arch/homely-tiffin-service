import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig, DynamicDish } from '../../utils/siteConfigStore';
import { createOrder, OrderItem, CityLocation } from '../../utils/orderStore';

export const InstantOrderModal: React.FC = () => {
  const { isInstantOrderOpen, closeInstantOrder } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<CityLocation>('Greater Noida');
  
  // 3-Tier Location
  const [areaLocation, setAreaLocation] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [mapLocationUrl, setMapLocationUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Category Filter & Selected Dynamic Dish
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedDishId, setSelectedDishId] = useState<string>('');
  const [slot, setSlot] = useState<'Lunch' | 'Dinner'>('Lunch');
  const [quantity, setQuantity] = useState(1);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentSlip, setPaymentSlip] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');

  // Flow State
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [submittedOrder, setSubmittedOrder] = useState<OrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const syncConfig = () => {
    const current = getSiteConfig();
    setConfig(current);
    if (!selectedDishId && current.dishes && current.dishes.length > 0) {
      setSelectedDishId(current.dishes[0].id);
    }
  };

  useEffect(() => {
    syncConfig();
    window.addEventListener('bmb_config_updated', syncConfig);
    return () => window.removeEventListener('bmb_config_updated', syncConfig);
  }, []);

  if (!isInstantOrderOpen) return null;

  const resetAndClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setStep('form');
    setCustomerName('');
    setPhone('');
    setAreaLocation('');
    setAddressDetails('');
    setMapLocationUrl('');
    setCity('Greater Noida');
    setUtrNumber('');
    setPaymentSlip('');
    setSlipFileName('');
    setSubmittedOrder(null);
    setErrorMessage('');
    closeInstantOrder();
  };

  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your device browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapLocationUrl(`https://www.google.com/maps?q=${latitude},${longitude}`);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setAreaLocation(data.address?.suburb || data.address?.neighbourhood || data.address?.road || 'Current GPS Area');
          }
        } catch {
          // fallback
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        alert('Please allow Location Permission in your browser to fetch GPS pin.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Find currently selected dynamic dish
  const availableDishes = (config.dishes || []).filter((d) => d.isAvailable);
  const filteredDishes = availableDishes.filter((d) => (categoryFilter === 'All' ? true : d.category === categoryFilter));
  const activeDish = availableDishes.find((d) => d.id === selectedDishId) || availableDishes[0] || {
    id: 'default',
    name: 'Standard North Indian Thali',
    price: 110,
    items: '4 Butter Rotis + Sabzi + Dal Fry + Jeera Rice + Salad',
    category: 'Veg',
  };

  const mealSubtotal = activeDish.price * quantity;
  const deliveryCharge = city === 'Noida' ? 25 : 0;
  const estimatedTime = city === 'Noida' ? '45 Mins' : '30 Mins';
  const totalAmount = mealSubtotal + deliveryCharge;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('Screenshot size must be under 8MB!');
        return;
      }
      setSlipFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPaymentSlip(reader.result as string);
          setErrorMessage('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI UTR / Transaction ID!');
      return;
    }

    const compiledAddress = `Area/Gate: ${areaLocation} | Room/Flat: ${addressDetails}${
      mapLocationUrl ? ` | 📍 Live Pin: ${mapLocationUrl}` : ''
    }`;

    const order = createOrder({
      customerName,
      phone,
      city,
      address: compiledAddress,
      mealPlan: `${activeDish.name} (x${quantity})`,
      planType: 'Daily',
      slot,
      mealAmount: mealSubtotal,
      deliveryCharge,
      amount: totalAmount,
      estimatedTime,
      utrNumber: utrNumber.trim(),
      paymentSlip,
    });

    setSubmittedOrder(order);
    setStep('success');
  };

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={resetAndClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Working Modal Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-[#0F1A13] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-[#243B2D] hover:border-rose-500/40 flex items-center justify-center text-lg font-bold transition shadow-lg z-30 cursor-pointer"
        >
          ✕
        </button>

        {/* STEP 1: ORDER DETAILS FORM */}
        {step === 'form' && (
          <div>
            <div className="text-center mb-6 pr-6">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full uppercase">
                ⚡ Instant Meal Booking
              </span>
              <h2 className="text-2xl font-black text-white mt-2">Order Fresh Homestyle Meal</h2>
              <p className="text-emerald-300/60 text-xs mt-1">
                30 Mins (Greater Noida) • 45 Mins (Noida)
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customerName || !phone || !areaLocation || !addressDetails) {
                  setErrorMessage('Please fill in Name, Phone, Area/Gate and Flat/Room Address!');
                  return;
                }
                setErrorMessage('');
                setStep('payment');
              }}
              className="space-y-4"
            >
              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-2">
                  📍 1. Select Delivery Location
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCity('Greater Noida')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      city === 'Greater Noida'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-300">🏢 Greater Noida</div>
                    <div className="text-[11px] text-amber-300 font-bold mt-0.5">⚡ 30 Mins Delivery</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">Free Delivery (₹0)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCity('Noida')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      city === 'Noida'
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-300">🌆 Noida (Extended)</div>
                    <div className="text-[11px] text-white font-bold mt-0.5">🚚 45 Mins Delivery</div>
                    <div className="text-[10px] text-amber-400 font-semibold">+₹25 Distance Share (50% Off)</div>
                  </button>
                </div>
              </div>

              {/* Dynamic Dish Selection (Loaded Live from Super Admin) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-300 uppercase">2. Select Dish or Combo</label>
                  {/* Category Filter Pills */}
                  <div className="flex gap-1 overflow-x-auto text-[10px]">
                    {['All', 'Veg', 'Egg', 'Non-Veg', 'Rice Combo'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded-full font-bold transition ${
                          categoryFilter === cat ? 'bg-amber-500 text-slate-950' : 'bg-[#0F1A13] text-slate-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-none">
                  {filteredDishes.map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => setSelectedDishId(dish.id)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        selectedDishId === dish.id || (!selectedDishId && dish.id === activeDish.id)
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-md'
                          : 'bg-[#0F1A13] border-[#243B2D] text-slate-300 hover:border-[#375a43]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 w-full">
                        <div className="text-xs font-bold truncate">{dish.name}</div>
                        {dish.badge && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                            {dish.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-amber-400 font-black text-sm mt-1">₹{dish.price}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-2.5 p-2.5 bg-[#0F1A13] border border-[#243B2D] rounded-xl text-[11px] text-emerald-200/80">
                  <span className="font-bold text-white">Includes:</span> {activeDish.items}
                </div>
              </div>

              {/* Slot & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Delivery Slot</label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value as 'Lunch' | 'Dinner')}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="Lunch">🍱 Lunch ({config.deliverySlots?.lunchTime || '12:30 PM - 02:00 PM'})</option>
                    <option value="Dinner">🌙 Dinner ({config.deliverySlots?.dinnerTime || '07:30 PM - 09:30 PM'})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Quantity (Thalis)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-sm text-white font-bold text-center outline-none"
                  />
                </div>
              </div>

              {/* Customer Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Mobile Number (Calling & WA) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* 3-Tier Location & Address System */}
              <div className="space-y-3 pt-1 bg-[#0F1A13] p-3.5 rounded-2xl border border-[#243B2D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                    <span>📍</span> Delivery Location Details
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectGPSLocation}
                    disabled={isLocating}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>🛰️</span>
                    <span>{isLocating ? 'Detecting GPS...' : 'Fetch Live GPS Pin'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    University / Gate / Landmark / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Galgotias Gate 1 / Sharda Gate 3 / Pari Chowk"
                    value={areaLocation}
                    onChange={(e) => setAreaLocation(e.target.value)}
                    className="w-full bg-[#18271E] border border-[#2B4534] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Room No. / Hostel Name / Flat & Floor Details *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Hostel Room 302 / Flat 401 Tower B"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className="w-full bg-[#18271E] border border-[#2B4534] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                {mapLocationUrl && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-[11px] text-emerald-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <span>✅</span> Live GPS Pin Linked
                    </span>
                    <a href={mapLocationUrl} target="_blank" rel="noreferrer" className="underline text-amber-300 font-bold">
                      Open Map Pin ↗
                    </a>
                  </div>
                )}
              </div>

              {errorMessage && <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>}

              {/* Pricing Breakdown & Next Step */}
              <div className="pt-3 border-t border-[#243B2D] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">
                    Meal: ₹{mealSubtotal} {deliveryCharge > 0 && `+ ₹${deliveryCharge} (Noida Share)`}
                  </div>
                  <div className="text-2xl font-black text-amber-400">₹{totalAmount}</div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2 text-sm cursor-pointer"
                >
                  Pay via UPI & Enter UTR ➔
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: UPI PAYMENT & RELIABLE SLIP UPLOAD */}
        {step === 'payment' && (
          <div>
            <div className="text-center mb-5 pr-6">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full uppercase">
                💳 Step 2: UPI Verification ({city})
              </span>
              <h2 className="text-xl font-black text-white mt-1">Pay ₹{totalAmount} via UPI</h2>
              <p className="text-emerald-300/60 text-xs">Estimated Delivery Time: {estimatedTime}</p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 mb-5">
              <img
                src={config.upiQrImage}
                alt="UPI QR Code"
                className="w-32 h-32 object-cover rounded-xl border border-amber-500/30 bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=' +
                    config.upiId +
                    '&pn=BringMyBite&am=' +
                    totalAmount;
                }}
              />
              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="text-xs text-slate-400">Official Merchant UPI ID:</div>
                <div className="text-sm font-mono font-bold text-amber-300 bg-[#18271E] px-3 py-1.5 rounded-lg border border-[#243B2D] flex items-center justify-between">
                  <span>{config.upiId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(config.upiId);
                      alert('UPI ID Copied to Clipboard!');
                    }}
                    className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[11px] text-emerald-300/70">
                  Scan and pay from Google Pay, PhonePe, Paytm or any UPI App.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1">
                  12-Digit UPI Ref / UTR Number (Mandatory) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={22}
                  placeholder="e.g. 423871982341 (From Payment Receipt)"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-[#0F1A13] border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1.5">
                  📸 Upload Payment Screenshot / Slip (Optional)
                </label>
                <div className="border border-[#2B4534] rounded-2xl p-3 bg-[#0F1A13]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="instant-order-slip-file"
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                  {paymentSlip && (
                    <div className="mt-3 flex items-center justify-between p-2.5 bg-[#18271E] rounded-xl border border-emerald-500/30">
                      <div className="flex items-center gap-3">
                        <img src={paymentSlip} alt="Slip" className="w-12 h-12 object-cover rounded-lg border border-emerald-500/40" />
                        <span className="text-xs text-emerald-200 font-semibold truncate max-w-[200px]">
                          {slipFileName || 'Slip Attached ✅'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSlip('');
                          setSlipFileName('');
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 cursor-pointer"
                      >
                        Remove ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-1/3 py-3 bg-[#0F1A13] hover:bg-[#1f3527] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span>✅</span>
                  <span>Submit Order</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS & CONFIRMATION */}
        {step === 'success' && submittedOrder && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
              ⏳
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Order Received Successfully!</h2>
              <p className="text-emerald-300/80 text-xs mt-1">
                Order ID: <span className="font-mono font-bold text-amber-300">{submittedOrder.id}</span>
              </p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-[10px]">
                  🟡 Pending Admin Verification
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Zone:</span>
                <span className="text-white font-bold">{submittedOrder.city} ({submittedOrder.estimatedTime})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Meal Ordered:</span>
                <span className="text-white font-bold">{submittedOrder.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Bill:</span>
                <span className="text-amber-400 font-black">₹{submittedOrder.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR / Ref:</span>
                <span className="font-mono text-white">{submittedOrder.utrNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20I%20have%20placed%20an%20order.%0AOrder%20ID:%20${submittedOrder.id}%0AArea:%20${submittedOrder.city}%20(${submittedOrder.estimatedTime})%0AAmount:%20₹${submittedOrder.amount}%0AUTR:%20${submittedOrder.utrNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>💬</span>
                <span>Send Slip on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3 bg-[#0F1A13] hover:bg-[#1a2c20] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
