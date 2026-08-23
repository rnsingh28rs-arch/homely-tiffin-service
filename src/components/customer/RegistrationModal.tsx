import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';
import { createOrder, OrderItem } from '../../utils/orderStore';

export const RegistrationModal: React.FC = () => {
  const { isRegistrationOpen, closeRegistration } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
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

  // Pricing calculation
  const getSelectedPlan = () => {
    switch (planType) {
      case 'veg':
        return {
          title: 'Pure Veg Monthly Plan',
          price: config.packages.veg.monthlyPrice,
          items: config.packages.veg.itemsIncluded,
        };
      case 'egg':
        return {
          title: 'Egg Special Monthly Plan',
          price: config.packages.egg.monthlyPrice,
          items: config.packages.egg.itemsIncluded,
        };
      case 'nonVeg':
        return {
          title: 'Non-Veg Special Monthly Plan',
          price: config.packages.nonVeg.monthlyPrice,
          items: config.packages.nonVeg.itemsIncluded,
        };
    }
  };

  const currentPlan = getSelectedPlan();
  const totalAmount = currentPlan.price;

  // Handle Slip Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('फाइल का साइज़ 5MB से कम होना चाहिए!');
        return;
      }
      setSlipFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentSlip(reader.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Subscription Order
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('कृपया सही 12-अंकों का UPI UTR / Transaction ID दर्ज करें!');
      return;
    }

    const order = createOrder({
      customerName,
      phone,
      address: `${address} (Start Date: ${startDate})`,
      mealPlan: `${currentPlan.title}`,
      planType: 'Monthly',
      slot: mealSlot,
      amount: totalAmount,
      utrNumber: utrNumber.trim(),
      paymentSlip,
    });

    setSubmittedOrder(order);
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('details');
    setCustomerName('');
    setPhone('');
    setAddress('');
    setUtrNumber('');
    setPaymentSlip('');
    setSlipFileName('');
    setSubmittedOrder(null);
    setErrorMessage('');
    closeRegistration();
  };

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#0F1A13] border border-[#243B2D] text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          ✕
        </button>

        {/* STEP 1: SUBSCRIPTION PACKAGE SELECTION & DETAILS */}
        {step === 'details' && (
          <div>
            <div className="text-center mb-6">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full uppercase">
                📅 Monthly Subscription Booking
              </span>
              <h2 className="text-2xl font-black text-white mt-2">मंथली टिफिन सर्विस रजिस्टर करें</h2>
              <p className="text-emerald-300/60 text-xs mt-1">30 दिन की होमस्टाइल डेली मील डिलीवरी</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customerName || !phone || !address) {
                  setErrorMessage('कृपया नाम, मोबाइल नंबर और पता भरें!');
                  return;
                }
                setErrorMessage('');
                setStep('payment');
              }}
              className="space-y-4"
            >
              {/* Plan Choice */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-2">1. मंथली पैकेज चुनें</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlanType('veg')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      planType === 'veg'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300 hover:border-[#375a43]'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-300">🌱 Pure Veg</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages.veg.monthlyPrice}</div>
                    <div className="text-[10px] text-slate-400 mt-1">30 Din • Roz Lunch/Dinner</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType('egg')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      planType === 'egg'
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300 hover:border-[#375a43]'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-300">🍳 Egg Special</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages.egg.monthlyPrice}</div>
                    <div className="text-[10px] text-slate-400 mt-1">High Protein Combo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType('nonVeg')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      planType === 'nonVeg'
                        ? 'bg-rose-500/20 border-rose-400 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300 hover:border-[#375a43]'
                    }`}
                  >
                    <div className="text-xs font-bold text-rose-300">🍗 Non-Veg</div>
                    <div className="text-lg font-black text-amber-400 mt-1">₹{config.packages.nonVeg.monthlyPrice}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Chicken Special Plan</div>
                  </button>
                </div>

                <div className="mt-2.5 p-2.5 bg-[#0F1A13] border border-[#243B2D] rounded-xl text-[11px] text-emerald-200/80">
                  <span className="font-bold text-white">मेन्यू सामग्री:</span> {currentPlan.items}
                </div>
              </div>

              {/* Slot & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">डिलीवरी स्लॉट</label>
                  <select
                    value={mealSlot}
                    onChange={(e) => setMealSlot(e.target.value as any)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="Both (Lunch & Dinner)">🍱 Lunch + 🌙 Dinner (Both Meals)</option>
                    <option value="Lunch">🍱 Only Lunch ({config.deliverySlots.lunchTime})</option>
                    <option value="Dinner">🌙 Only Dinner ({config.deliverySlots.dinnerTime})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">सर्विस शुरू करने की तारीख</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2.5 text-sm text-white font-bold outline-none"
                  />
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">कस्टमर का नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Amit Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">मोबाइल नंबर (कॉल & WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">कॉलेज / हॉस्टल / रूम डिलीवरी एड्रेस *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Galgotias University Gate 2, Zenith Hostel Room 410"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>
              )}

              {/* Total & Proceed */}
              <div className="pt-3 border-t border-[#243B2D] flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">मंथली टोटल (Total Amount)</span>
                  <span className="text-2xl font-black text-amber-400">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2"
                >
                  Proceed to Payment ➔
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: UPI PAYMENT & UTR / SLIP UPLOAD */}
        {step === 'payment' && (
          <div>
            <div className="text-center mb-5">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
                💳 Step 2: Subscription UPI Payment
              </span>
              <h2 className="text-xl font-black text-white mt-1">₹{totalAmount} का भुगतान करें</h2>
              <p className="text-emerald-300/60 text-xs">QR स्कैन करके पे करें और नीचे UTR नंबर डालें</p>
            </div>

            {/* UPI QR Code Container */}
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
                      alert('UPI ID Copy Ho Gayi!');
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
                  12-Digit UPI Ref / UTR Number (अनिवार्य) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={22}
                  placeholder="उदा. 423871982341 (GooglePay/PhonePe se copy karein)"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-[#0F1A13] border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  📸 पेमेंट रसीद / स्क्रीनशॉट अपलोड करें
                </label>
                <div className="border border-dashed border-[#2B4534] rounded-xl p-3 bg-[#0F1A13] text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="monthly-slip-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="monthly-slip-upload"
                    className="cursor-pointer text-xs text-amber-300 font-bold hover:underline flex items-center justify-center gap-2"
                  >
                    <span>📎</span>
                    <span>{slipFileName ? `चयनित: ${slipFileName}` : 'गैलरी से पेमेंट रसीद चुनें'}</span>
                  </label>
                  {paymentSlip && (
                    <div className="mt-2 flex justify-center">
                      <img
                        src={paymentSlip}
                        alt="Slip Preview"
                        className="h-16 object-cover rounded-lg border border-emerald-500/30"
                      />
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-3 bg-[#0F1A13] hover:bg-[#1f3527] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition"
                >
                  ← वापस जाएं
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>सब्सक्रिप्शन एक्टिवेशन सबमिट करें</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUBMITTED SUCCESS CARD */}
        {step === 'success' && submittedOrder && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
              📋
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">मंथली सब्सक्रिप्शन रिक्वेस्ट दर्ज हुई!</h2>
              <p className="text-emerald-300/80 text-xs mt-1">
                Subscription ID: <span className="font-mono font-bold text-amber-300">{submittedOrder.id}</span>
              </p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">वेरिफिकेशन स्थिति:</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-[10px]">
                  🟡 Pending Admin Approval
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">चुना गया पैकेज:</span>
                <span className="text-white font-bold">{submittedOrder.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">कुल भुगतान:</span>
                <span className="text-amber-400 font-black">₹{submittedOrder.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR नंबर:</span>
                <span className="font-mono text-white">{submittedOrder.utrNumber}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              एडमिन टीम UTR और पेमेंट चेक करके आपका मील कार्ड एक्टिवेट करेगी।
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20Maine%20Monthly%20Subscription%20register%20kiya%20hai.%0ASubscription%20ID:%20${submittedOrder.id}%0APlan:%20${submittedOrder.mealPlan}%0AAmount:%20₹${submittedOrder.amount}%0AUTR:%20${submittedOrder.utrNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>💬</span>
                <span>WhatsApp पर रसीद भेजें</span>
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
