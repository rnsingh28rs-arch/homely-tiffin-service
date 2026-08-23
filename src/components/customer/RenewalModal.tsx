import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';
import { createOrder, OrderItem } from '../../utils/orderStore';

export const RenewalModal: React.FC = () => {
  const { isRenewalOpen, closeRenewal } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  // Form Fields
  const [existingSubscriptionId, setExistingSubscriptionId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
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

  const getPlanPrice = () => {
    switch (renewalPlan) {
      case 'veg':
        return { name: 'Veg Monthly Renewal', price: config.packages.veg.monthlyPrice };
      case 'egg':
        return { name: 'Egg Special Renewal', price: config.packages.egg.monthlyPrice };
      case 'nonVeg':
        return { name: 'Non-Veg Special Renewal', price: config.packages.nonVeg.monthlyPrice };
    }
  };

  const currentPlan = getPlanPrice();
  const totalAmount = currentPlan.price;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('फाइल साइज़ 5MB से कम होना चाहिए!');
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

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('कृपया सही 12-अंकों का UPI UTR दर्ज करें!');
      return;
    }

    const order = createOrder({
      customerName,
      phone,
      address: `Existing ID: ${existingSubscriptionId || 'N/A'} (Renewal Order)`,
      mealPlan: currentPlan.name,
      planType: 'Monthly',
      slot: 'Both (Lunch & Dinner)',
      amount: totalAmount,
      utrNumber: utrNumber.trim(),
      paymentSlip,
    });

    setSubmittedOrder(order);
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('details');
    setExistingSubscriptionId('');
    setCustomerName('');
    setPhone('');
    setUtrNumber('');
    setPaymentSlip('');
    setSlipFileName('');
    setSubmittedOrder(null);
    setErrorMessage('');
    closeRenewal();
  };

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#0F1A13] border border-[#243B2D] text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          ✕
        </button>

        {step === 'details' && (
          <div>
            <div className="text-center mb-6">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full uppercase">
                🔄 Subscription Plan Renewal
              </span>
              <h2 className="text-2xl font-black text-white mt-2">अपना टिफिन प्लान रिन्यू करें</h2>
              <p className="text-emerald-300/60 text-xs mt-1">अगले महीने की डिलीवरी बिना रुकावट जारी रखें</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customerName || !phone) {
                  setErrorMessage('कृपया नाम और मोबाइल नंबर भरें!');
                  return;
                }
                setErrorMessage('');
                setStep('payment');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-2">रिन्यू करने के लिए प्लान चुनें</label>
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
                    <div className="text-[11px] font-bold text-emerald-300">🌱 Pure Veg</div>
                    <div className="text-base font-black text-amber-400 mt-1">₹{config.packages.veg.monthlyPrice}</div>
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
                    <div className="text-[11px] font-bold text-amber-300">🍳 Egg Special</div>
                    <div className="text-base font-black text-amber-400 mt-1">₹{config.packages.egg.monthlyPrice}</div>
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
                    <div className="text-base font-black text-amber-400 mt-1">₹{config.packages.nonVeg.monthlyPrice}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">पिछला Subscription ID / Token (वैकल्पिक)</label>
                <input
                  type="text"
                  placeholder="उदा. BMB-102934"
                  value={existingSubscriptionId}
                  onChange={(e) => setExistingSubscriptionId(e.target.value)}
                  className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">आपका नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">मोबाइल नंबर *</label>
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

              {errorMessage && (
                <p className="text-rose-400 text-xs font-bold text-center">{errorMessage}</p>
              )}

              <div className="pt-3 border-t border-[#243B2D] flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">रिन्यूअल राशि (Renewal Fee)</span>
                  <span className="text-2xl font-black text-amber-400">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition"
                >
                  पेमेंट करें ➔
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div>
            <div className="text-center mb-5">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
                💳 Renewal Payment
              </span>
              <h2 className="text-xl font-black text-white mt-1">₹{totalAmount} का भुगतान करें</h2>
              <p className="text-emerald-300/60 text-xs">QR स्कैन करें और UTR नंबर डालकर सबमिट करें</p>
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
                  12-Digit UPI Ref / UTR Number (अनिवार्य) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={22}
                  placeholder="उदा. 423871982341"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-[#0F1A13] border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  📸 पेमेंट रसीद अपलोड करें
                </label>
                <div className="border border-dashed border-[#2B4534] rounded-xl p-3 bg-[#0F1A13] text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="renewal-slip-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="renewal-slip-upload"
                    className="cursor-pointer text-xs text-amber-300 font-bold hover:underline flex items-center justify-center gap-2"
                  >
                    <span>📎</span>
                    <span>{slipFileName ? `चयनित: ${slipFileName}` : 'स्क्रीनशॉट चुनें'}</span>
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
                  ← Back
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>रिन्यूअल सबमिट करें</span>
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
              <h2 className="text-2xl font-black text-white">रिन्यूअल रिक्वेस्ट प्राप्त हुई!</h2>
              <p className="text-emerald-300/80 text-xs mt-1">
                Renewal ID: <span className="font-mono font-bold text-amber-300">{submittedOrder.id}</span>
              </p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">स्थिति:</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-[10px]">
                  🟡 Pending Admin Verification
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">रिन्यू किया गया प्लान:</span>
                <span className="text-white font-bold">{submittedOrder.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">राशि:</span>
                <span className="text-amber-400 font-black">₹{submittedOrder.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR:</span>
                <span className="font-mono text-white">{submittedOrder.utrNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20Maine%20Renewal%20Request%20submit%20kiya%20hai.%0ARenewal%20ID:%20${submittedOrder.id}%0AAmount:%20₹${submittedOrder.amount}%0AUTR:%20${submittedOrder.utrNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>💬</span>
                <span>WhatsApp पर स्लिप भेजें</span>
              </a>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3 bg-[#0F1A13] hover:bg-[#1a2c20] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
