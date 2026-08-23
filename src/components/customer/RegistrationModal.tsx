import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';
import { createOrder, OrderItem, CityLocation } from '../../utils/orderStore';

export const RegistrationModal: React.FC = () => {
  const { isRegistrationOpen, closeRegistration } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<CityLocation>('Greater Noida');
  const [areaLocation, setAreaLocation] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [mapLocationUrl, setMapLocationUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // 3 Core Monthly Plans
  const [planType, setPlanType] = useState<'veg' | 'egg' | 'nonVeg'>('veg');
  const [mealSlot, setMealSlot] = useState<'Lunch' | 'Dinner' | 'Both (Lunch & Dinner)'>('Both (Lunch & Dinner)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentSlip, setPaymentSlip] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Flow State
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [submittedOrder, setSubmittedOrder] = useState<OrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const resetAndClose = useCallback(() => {
    setStep('details');
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
    closeRegistration();
  }, [closeRegistration]);

  // Global ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        resetAndClose();
      }
    };
    if (isRegistrationOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isRegistrationOpen, resetAndClose]);

  if (!isRegistrationOpen) return null;

  // Ultra-Fast Canvas Client-Side Compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      setSlipFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 700;
          const MAX_HEIGHT = 700;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
          setPaymentSlip(compressedBase64);
          setIsCompressing(false);
          setErrorMessage('');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const getSelectedPlan = () => {
    switch (planType) {
      case 'veg':
        return {
          title: 'Pure Veg Monthly Subscription',
          price: config.packages?.veg?.monthlyPrice || 2999,
          items: config.packages?.veg?.itemsIncluded || '4 Butter Rotis + Dal Tadka + Sabzi + Rice + Salad & Pickle',
        };
      case 'egg':
        return {
          title: 'Egg Special Monthly Subscription',
          price: config.packages?.egg?.monthlyPrice || 3499,
          items: config.packages?.egg?.itemsIncluded || '2-Egg Rich Curry + 4 Rotis + Rice + Dal + Salad',
        };
      case 'nonVeg':
        return {
          title: 'Non-Veg Special Monthly Subscription',
          price: config.packages?.nonVeg?.monthlyPrice || 4199,
          items: config.packages?.nonVeg?.itemsIncluded || 'Homestyle Chicken Curry (3 Pcs) + 4 Rotis + Rice + Salad',
        };
    }
  };

  const currentPlan = getSelectedPlan();
  const totalAmount = currentPlan.price;

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI UTR Number!');
      return;
    }

    const compiledAddress = `Area/Gate: ${areaLocation} | Room/Flat: ${addressDetails} (Start Date: ${startDate})${
      mapLocationUrl ? ` | 📍 Live Pin: ${mapLocationUrl}` : ''
    }`;

    const order = createOrder({
      customerName,
      phone,
      city,
      address: compiledAddress,
      mealPlan: `${currentPlan.title}`,
      planType: 'Monthly',
      slot: mealSlot,
      mealAmount: totalAmount,
      deliveryCharge: 0,
      amount: totalAmount,
      estimatedTime: 'Daily Scheduled',
      utrNumber: utrNumber.trim(),
      paymentSlip,
    });

    setSubmittedOrder(order);
    setStep('success');
  };

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={resetAndClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#15231B] border-2 border-[#2B4534] rounded-3xl p-5 sm:p-8 text-[#FAF7F2] shadow-2xl my-auto select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Working High-Visibility ✕ Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-11 h-11 rounded-full bg-[#0F1A13] hover:bg-rose-600/30 text-white border border-[#243B2D] hover:border-rose-500/50 flex items-center justify-center text-xl font-black transition-all duration-200 z-50 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
        >
          ✕
        </button>

        {step === 'details' && (
          <div>
            <div className="text-center mb-5 pr-8">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black rounded-full uppercase">
                📅 30-Day Monthly Subscription
              </span>
              <h2 className="text-2xl font-black text-white mt-1.5">Subscribe to Monthly Tiffin</h2>
              <p className="text-emerald-300/60 text-xs">Fresh meals delivered daily to your campus / hostel gate</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customerName || !phone || !areaLocation || !addressDetails) {
                  setErrorMessage('Please fill Name, Phone, Area/Gate and Room/Flat details!');
                  return;
                }
                setErrorMessage('');
                setStep('payment');
              }}
              className="space-y-4"
            >
              {/* 3 Core Monthly Plans */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5">1. Select Monthly Plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlanType('veg')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      planType === 'veg'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-lg ring-1 ring-emerald-400'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-300">🌱 Pure Veg</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages?.veg?.monthlyPrice || 2999}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">30 Days • Daily Meal</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType('egg')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      planType === 'egg'
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-lg ring-1 ring-amber-400'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-300">🍳 Egg Special</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages?.egg?.monthlyPrice || 3499}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">High-Protein Combo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType('nonVeg')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      planType === 'nonVeg'
                        ? 'bg-rose-500/20 border-rose-400 text-white font-bold shadow-lg ring-1 ring-rose-400'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-rose-300">🍗 Non-Veg</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages?.nonVeg?.monthlyPrice || 4199}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Chicken Special Plan</div>
                  </button>
                </div>

                <div className="mt-2 p-2.5 bg-[#0F1A13] border border-[#243B2D] rounded-xl text-[11px] text-emerald-200/80">
                  <span className="font-bold text-white">Daily Menu Includes:</span> {currentPlan.items}
                </div>
              </div>

              {/* Slot & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Meal Preference</label>
                  <select
                    value={mealSlot}
                    onChange={(e) => setMealSlot(e.target.value as any)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="Both (Lunch & Dinner)">🍱 Lunch + 🌙 Dinner (Both Meals)</option>
                    <option value="Lunch">🍱 Only Lunch</option>
                    <option value="Dinner">🌙 Only Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Service Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-sm text-white font-bold outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 3-Tier Address Details */}
              <div className="space-y-2 bg-[#0F1A13] p-3 rounded-2xl border border-[#243B2D]">
                <span className="text-xs font-bold text-amber-300">📍 Daily Delivery Address</span>
                <input
                  type="text"
                  required
                  placeholder="Gate / Landmark (e.g. Galgotias Gate 2 / Sharda Gate 3)"
                  value={areaLocation}
                  onChange={(e) => setAreaLocation(e.target.value)}
                  className="w-full bg-[#18271E] border border-[#2B4534] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Hostel Name / Room No. / Flat Details"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  className="w-full bg-[#18271E] border border-[#2B4534] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {errorMessage && <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>}

              {/* Total & Proceed */}
              <div className="pt-2 border-t border-[#243B2D] flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Monthly Total</span>
                  <span className="text-2xl font-black text-amber-400">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2 text-sm cursor-pointer"
                >
                  Proceed to Payment ➔
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: UPI PAYMENT & COMPRESSED SLIP */}
        {step === 'payment' && (
          <div>
            <div className="text-center mb-4 pr-8">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black rounded-full uppercase">
                💳 Step 2: Subscription UPI Payment
              </span>
              <h2 className="text-xl font-black text-white mt-1">Pay ₹{totalAmount} via UPI</h2>
              <p className="text-emerald-300/60 text-xs">Scan the QR code and enter 12-digit UTR below</p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 mb-4">
              <img
                src={config.upiQrImage}
                alt="UPI QR Code"
                className="w-28 h-28 object-cover rounded-xl border border-amber-500/30 bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=' +
                    config.upiId +
                    '&pn=BringMyBite&am=' +
                    totalAmount;
                }}
              />
              <div className="text-center sm:text-left space-y-1 flex-1">
                <div className="text-xs text-slate-400">Merchant UPI ID:</div>
                <div className="text-sm font-mono font-bold text-amber-300 bg-[#18271E] px-3 py-1.5 rounded-lg border border-[#243B2D] flex items-center justify-between">
                  <span>{config.upiId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(config.upiId);
                      alert('UPI ID Copied!');
                    }}
                    className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1">
                  12-Digit UPI Ref / UTR Number (Mandatory) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={22}
                  placeholder="e.g. 423871982341 (GooglePay/PhonePe receipt)"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-[#0F1A13] border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  📸 Upload Payment Receipt / Screenshot
                </label>
                <div className="border border-[#2B4534] rounded-2xl p-3 bg-[#0F1A13]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                  {isCompressing && (
                    <p className="text-[10px] text-amber-300 font-bold mt-1 animate-pulse">⚡ Optimizing photo...</p>
                  )}
                  {paymentSlip && (
                    <div className="mt-2.5 flex items-center justify-between p-2 bg-[#18271E] rounded-xl border border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <img src={paymentSlip} alt="Slip" className="w-10 h-10 object-cover rounded-lg" />
                        <span className="text-xs text-emerald-200 truncate max-w-[180px]">
                          {slipFileName || 'Receipt Attached ✅'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSlip('');
                          setSlipFileName('');
                        }}
                        className="text-xs text-rose-400 font-bold px-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-3 bg-[#0F1A13] hover:bg-[#1f3527] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span>✅</span>
                  <span>Submit Subscription</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && submittedOrder && (
          <div className="text-center py-3 space-y-4">
            <div className="w-14 h-14 bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
              📋
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Subscription Registered!</h2>
              <p className="text-emerald-300/80 text-xs mt-1">
                Subscription ID: <span className="font-mono font-bold text-amber-300">{submittedOrder.id}</span>
              </p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Status:</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-[10px]">
                  🟡 Pending Admin Approval
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plan:</span>
                <span className="text-white font-bold">{submittedOrder.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <span className="text-amber-400 font-black">₹{submittedOrder.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR:</span>
                <span className="font-mono text-white">{submittedOrder.utrNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20I%20have%20registered%20for%20Monthly%20Subscription.%0ASubscription%20ID:%20${submittedOrder.id}%0APlan:%20${submittedOrder.mealPlan}%0AAmount:%20₹${submittedOrder.amount}%0AUTR:%20${submittedOrder.utrNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>💬</span>
                <span>Send Receipt on WhatsApp</span>
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
