import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';
import { createOrder, OrderItem, CityLocation } from '../../utils/orderStore';

export const RenewalModal: React.FC = () => {
  const { isRenewalOpen, closeRenewal } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  // Form Fields
  const [existingSubscriptionId, setExistingSubscriptionId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<CityLocation>('Greater Noida');
  const [areaLocation, setAreaLocation] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [mapLocationUrl, setMapLocationUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const [renewalPlan, setRenewalPlan] = useState<'veg' | 'egg' | 'nonVeg'>('veg');
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

  if (!isRenewalOpen) return null;

  const resetAndClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setStep('details');
    setExistingSubscriptionId('');
    setCustomerName('');
    setPhone('');
    setAreaLocation('');
    setAddressDetails('');
    setMapLocationUrl('');
    setUtrNumber('');
    setPaymentSlip('');
    setSlipFileName('');
    setSubmittedOrder(null);
    setErrorMessage('');
    closeRenewal();
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
        setMapLocationUrl(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Please allow Location Permission to fetch GPS pin.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getPlanPrice = () => {
    switch (renewalPlan) {
      case 'veg':
        return { name: 'Veg Monthly Renewal', price: config.packages?.veg?.monthlyPrice || 2999 };
      case 'egg':
        return { name: 'Egg Special Renewal', price: config.packages?.egg?.monthlyPrice || 3499 };
      case 'nonVeg':
        return { name: 'Non-Veg Special Renewal', price: config.packages?.nonVeg?.monthlyPrice || 4199 };
    }
  };

  const currentPlan = getPlanPrice();
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
      setErrorMessage('Please enter a valid 12-digit UPI UTR!');
      return;
    }

    const compiledAddress = `Existing ID: ${existingSubscriptionId || 'N/A'} | Area: ${areaLocation} | Room: ${addressDetails}${
      mapLocationUrl ? ` | 📍 Map: ${mapLocationUrl}` : ''
    }`;

    const order = createOrder({
      customerName,
      phone,
      city,
      address: compiledAddress,
      mealPlan: currentPlan.name,
      planType: 'Monthly',
      slot: 'Both (Lunch & Dinner)',
      mealAmount: totalAmount,
      deliveryCharge: 0,
      amount: totalAmount,
      estimatedTime: 'Plan Renewed',
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
        {/* Working Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-[#0F1A13] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-[#243B2D] hover:border-rose-500/40 flex items-center justify-center text-lg font-bold transition shadow-lg z-30 cursor-pointer"
        >
          ✕
        </button>

        {step === 'details' && (
          <div>
            <div className="text-center mb-6 pr-6">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full uppercase">
                🔄 Subscription Plan Renewal
              </span>
              <h2 className="text-2xl font-black text-white mt-2">Renew Your Tiffin Plan</h2>
              <p className="text-emerald-300/60 text-xs mt-1">Extend your meal delivery without any interruption</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customerName || !phone) {
                  setErrorMessage('Please fill in Name and Mobile Number!');
                  return;
                }
                setErrorMessage('');
                setStep('payment');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-2">Select Renewal Plan</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRenewalPlan('veg')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      renewalPlan === 'veg'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-emerald-300">🌱 Veg</div>
                    <div className="text-base font-black text-amber-400 mt-1">₹{config.packages?.veg?.monthlyPrice || 2999}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalPlan('egg')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      renewalPlan === 'egg'
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-amber-300">🍳 Egg</div>
                    <div className="text-base font-black text-amber-400 mt-1">₹{config.packages?.egg?.monthlyPrice || 3499}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalPlan('nonVeg')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      renewalPlan === 'nonVeg'
                        ? 'bg-rose-500/20 border-rose-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-rose-300">🍗 Non-Veg</div>
                    <div className="text-base font-black text-amber-400 mt-1">₹{config.packages?.nonVeg?.monthlyPrice || 4199}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">Previous Subscription ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BMB-102934"
                  value={existingSubscriptionId}
                  onChange={(e) => setExistingSubscriptionId(e.target.value)}
                  className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs font-bold text-emerald-200 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* 3-Tier Location */}
              <div className="space-y-3 pt-1 bg-[#0F1A13] p-3.5 rounded-2xl border border-[#243B2D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase">📍 Delivery Gate Details</span>
                  <button
                    type="button"
                    onClick={handleDetectGPSLocation}
                    disabled={isLocating}
                    className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold"
                  >
                    {isLocating ? 'Locating...' : '🛰️ GPS Pin'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Gate / Landmark (e.g. Galgotias Gate 1)"
                  value={areaLocation}
                  onChange={(e) => setAreaLocation(e.target.value)}
                  className="w-full bg-[#18271E] border border-[#2B4534] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Room / Hostel / Flat Details"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  className="w-full bg-[#18271E] border border-[#2B4534] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {errorMessage && <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>}

              <div className="pt-3 border-t border-[#243B2D] flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Renewal Total</span>
                  <span className="text-2xl font-black text-amber-400">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition cursor-pointer"
                >
                  Pay & Renew ➔
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div>
            <div className="text-center mb-5 pr-6">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full uppercase">
                💳 Renewal Payment
              </span>
              <h2 className="text-xl font-black text-white mt-1">Pay ₹{totalAmount} via UPI</h2>
              <p className="text-emerald-300/60 text-xs">Scan QR and enter 12-digit UTR below</p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 mb-5">
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
                <div className="text-sm font-mono font-bold text-amber-300 bg-[#18271E] px-3 py-1 rounded-lg border border-[#243B2D]">
                  {config.upiId}
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
                  placeholder="e.g. 423871982341"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-[#0F1A13] border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1.5">📸 Upload Payment Receipt</label>
                <div className="border border-[#2B4534] rounded-2xl p-3 bg-[#0F1A13]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="renewal-slip-upload-file"
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                  {paymentSlip && (
                    <div className="mt-3 flex items-center justify-between p-2 bg-[#18271E] rounded-xl border border-emerald-500/30">
                      <span className="text-xs text-emerald-200 truncate">{slipFileName || 'Slip Attached ✅'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSlip('');
                          setSlipFileName('');
                        }}
                        className="text-xs text-rose-400 font-bold px-2"
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
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span>✅</span>
                  <span>Submit Renewal</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && submittedOrder && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
              🔄
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Renewal Request Received!</h2>
              <p className="text-emerald-300/80 text-xs mt-1">
                Renewal ID: <span className="font-mono font-bold text-amber-300">{submittedOrder.id}</span>
              </p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-[10px]">
                  🟡 Pending Admin Verification
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plan:</span>
                <span className="text-white font-bold">{submittedOrder.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-amber-400 font-black">₹{submittedOrder.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR:</span>
                <span className="font-mono text-white">{submittedOrder.utrNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20I%20have%20submitted%20a%20Renewal%20request.%0ARenewal%20ID:%20${submittedOrder.id}%0AAmount:%20₹${submittedOrder.amount}%0AUTR:%20${submittedOrder.utrNumber}`}
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
