import React, { useState, useEffect } from 'react';
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
  const [address, setAddress] = useState('');
  const [mapLocationUrl, setMapLocationUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [planType, setPlanType] = useState<'veg' | 'egg' | 'nonVeg'>('veg');
  const [mealSlot, setMealSlot] = useState<'Lunch' | 'Dinner' | 'Both (Lunch & Dinner)'>('Both (Lunch & Dinner)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentSlip, setPaymentSlip] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');

  // Flow State
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [submittedOrder, setSubmittedOrder] = useState<OrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  if (!isRegistrationOpen) return null;

  const resetAndClose = () => {
    setStep('details');
    setCustomerName('');
    setPhone('');
    setAddress('');
    setMapLocationUrl('');
    setCity('Greater Noida');
    setUtrNumber('');
    setPaymentSlip('');
    setSlipFileName('');
    setSubmittedOrder(null);
    setErrorMessage('');
    closeRegistration();
  };

  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const gMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setMapLocationUrl(gMapsUrl);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const detectedAddr = data.display_name || `Near (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setAddress(detectedAddr);
        } catch {
          setAddress(`GPS Pin: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        alert('Please allow location permission to auto-detect your delivery address.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('File size must be under 8MB!');
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

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI UTR Number!');
      return;
    }

    const fullAddress = mapLocationUrl
      ? `${address} [📍 Map: ${mapLocationUrl}] (Start Date: ${startDate})`
      : `${address} (Start Date: ${startDate})`;

    const order = createOrder({
      customerName,
      phone,
      city,
      address: fullAddress,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] shadow-2xl my-8">
        
        {/* Working Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#0F1A13] border border-[#243B2D] text-slate-400 hover:text-white flex items-center justify-center transition hover:scale-105"
        >
          ✕
        </button>

        {step === 'details' && (
          <div>
            <div className="text-center mb-6">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full uppercase">
                📅 Monthly Subscription Booking
              </span>
              <h2 className="text-2xl font-black text-white mt-2">Subscribe to 30-Day Tiffin Plan</h2>
              <p className="text-emerald-300/60 text-xs mt-1">Homestyle meals delivered daily to your university / office gate</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customerName || !phone || !address) {
                  setErrorMessage('Please fill in Name, Phone and Delivery Address!');
                  return;
                }
                setErrorMessage('');
                setStep('payment');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-2">1. Select Monthly Plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlanType('veg')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      planType === 'veg'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-300">🌱 Pure Veg</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages?.veg?.monthlyPrice || 2999}</div>
                    <div className="text-[10px] text-slate-400 mt-1">30 Days • Daily Delivery</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType('egg')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      planType === 'egg'
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-300">🍳 Egg Special</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages?.egg?.monthlyPrice || 3499}</div>
                    <div className="text-[10px] text-slate-400 mt-1">High-Protein Combo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType('nonVeg')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      planType === 'nonVeg'
                        ? 'bg-rose-500/20 border-rose-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-rose-300">🍗 Non-Veg</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages?.nonVeg?.monthlyPrice || 4199}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Chicken Special Plan</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Meal Preference</label>
                  <select
                    value={mealSlot}
                    onChange={(e) => setMealSlot(e.target.value as any)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2.5 text-sm text-white outline-none"
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
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2.5 text-sm text-white font-bold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
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
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-emerald-200">College / Hostel / Delivery Address *</label>
                    <button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      disabled={isLocating}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <span>📍</span>
                      <span>{isLocating ? 'Detecting GPS...' : 'Use My Live GPS Location'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Galgotias University Gate 2, Zenith Hostel Room 410"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2 text-sm text-white outline-none resize-none"
                  />
                  {mapLocationUrl && (
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-300">
                      <span>✅ Live GPS Pin attached</span>
                      <a href={mapLocationUrl} target="_blank" rel="noreferrer" className="underline text-amber-300">
                        View on Google Maps ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>}

              <div className="pt-3 border-t border-[#243B2D] flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Monthly Total</span>
                  <span className="text-2xl font-black text-amber-400">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2 text-sm"
                >
                  Proceed to Payment ➔
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div>
            <div className="text-center mb-5">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
                💳 Step 2: Subscription UPI Payment
              </span>
              <h2 className="text-xl font-black text-white mt-1">Pay ₹{totalAmount} via UPI</h2>
              <p className="text-emerald-300/60 text-xs">Scan the QR code and enter 12-digit UTR below</p>
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
                      alert('UPI ID Copied!');
                    }}
                    className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold"
                  >
                    Copy
                  </button>
                </div>
                <div className="text-[11px] text-emerald-300/70">
                  Bank: <span className="text-white font-semibold">{config.bankName}</span> • A/C: <span className="font-mono text-white">{config.bankAccountNumber}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1">
                  12-Digit UPI Ref / UTR Number (Mandatory) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={22}
                  placeholder="e.g. 423871982341 (From GooglePay/PhonePe receipt)"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-[#0F1A13] border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1.5">
                  📸 Upload Payment Receipt / Screenshot
                </label>
                <div className="border border-[#2B4534] rounded-2xl p-4 bg-[#0F1A13]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="monthly-slip-upload-file"
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                  {paymentSlip && (
                    <div className="mt-3 flex items-center justify-between p-2.5 bg-[#18271E] rounded-xl border border-emerald-500/30">
                      <div className="flex items-center gap-3">
                        <img src={paymentSlip} alt="Slip" className="w-12 h-12 object-cover rounded-lg border border-emerald-500/40" />
                        <span className="text-xs text-emerald-200 font-semibold truncate max-w-[200px]">
                          {slipFileName || 'Receipt Attached ✅'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSlip('');
                          setSlipFileName('');
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1"
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
                  onClick={() => setStep('details')}
                  className="w-1/3 py-3 bg-[#0F1A13] hover:bg-[#1f3527] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2 text-sm"
                >
                  <span>✅</span>
                  <span>Submit Subscription</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && submittedOrder && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
              📋
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Subscription Registered!</h2>
              <p className="text-emerald-300/80 text-xs mt-1">
                Subscription ID: <span className="font-mono font-bold text-amber-300">{submittedOrder.id}</span>
              </p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 text-left text-xs space-y-2">
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
                <span className="text-slate-400">UTR / Ref:</span>
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
                className="w-full py-3 bg-[#0F1A13] hover:bg-[#1a2c20] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition"
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
