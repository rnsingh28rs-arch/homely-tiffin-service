import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';
import { createOrder, OrderItem } from '../../utils/orderStore';

export const InstantOrderModal: React.FC = () => {
  const { isInstantOrderOpen, closeInstantOrder } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<'mini' | 'standard' | 'egg' | 'chicken'>('standard');
  const [slot, setSlot] = useState<'Lunch' | 'Dinner'>('Lunch');
  const [quantity, setQuantity] = useState(1);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentSlip, setPaymentSlip] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');

  // UI Flow State
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [submittedOrder, setSubmittedOrder] = useState<OrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  if (!isInstantOrderOpen) return null;

  // Meal Info Helper
  const getMealDetails = () => {
    switch (selectedMeal) {
      case 'mini':
        return {
          title: config.singleThalis.miniVeg.name,
          price: config.singleThalis.miniVeg.price,
          items: config.singleThalis.miniVeg.items,
        };
      case 'standard':
        return {
          title: config.singleThalis.standardVeg.name,
          price: config.singleThalis.standardVeg.price,
          items: config.singleThalis.standardVeg.items,
        };
      case 'egg':
        return {
          title: config.singleThalis.eggSpecial.name,
          price: config.singleThalis.eggSpecial.price,
          items: config.singleThalis.eggSpecial.items,
        };
      case 'chicken':
        return {
          title: config.singleThalis.chickenSpecial.name,
          price: config.singleThalis.chickenSpecial.price,
          items: config.singleThalis.chickenSpecial.items,
        };
    }
  };

  const currentMeal = getMealDetails();
  const totalAmount = currentMeal.price * quantity + config.deliveryCharge;

  // Handle Screenshot Upload
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

  // Submit Order
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('कृपया सही 12-अंकों का UTR / UPI Transaction ID दर्ज करें!');
      return;
    }

    const order = createOrder({
      customerName,
      phone,
      address,
      mealPlan: `${currentMeal.title} (x${quantity})`,
      planType: 'Daily',
      slot,
      amount: totalAmount,
      utrNumber: utrNumber.trim(),
      paymentSlip,
    });

    setSubmittedOrder(order);
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('form');
    setCustomerName('');
    setPhone('');
    setAddress('');
    setUtrNumber('');
    setPaymentSlip('');
    setSlipFileName('');
    setSubmittedOrder(null);
    setErrorMessage('');
    closeInstantOrder();
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

        {/* STEP 1: ORDER DETAILS FORM */}
        {step === 'form' && (
          <div>
            <div className="text-center mb-6">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
                ⚡ Instant Meal Booking
              </span>
              <h2 className="text-2xl font-black text-white mt-2">घर जैसा ताज़ा खाना ऑर्डर करें</h2>
              <p className="text-emerald-300/60 text-xs mt-1">अपने कॉलेज गेट/हॉस्टल तक तुरंत डिलीवरी पाएं</p>
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
              {/* Meal Selection */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-2">1. अपनी थाली चुनें</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMeal('mini')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedMeal === 'mini'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300 hover:border-[#375a43]'
                    }`}
                  >
                    <div className="text-xs font-bold">🌱 Mini Veg</div>
                    <div className="text-amber-400 font-black text-sm">₹{config.singleThalis.miniVeg.price}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMeal('standard')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedMeal === 'standard'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300 hover:border-[#375a43]'
                    }`}
                  >
                    <div className="text-xs font-bold">🌟 Standard Veg</div>
                    <div className="text-amber-400 font-black text-sm">₹{config.singleThalis.standardVeg.price}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMeal('egg')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedMeal === 'egg'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300 hover:border-[#375a43]'
                    }`}
                  >
                    <div className="text-xs font-bold">🍳 Double Egg</div>
                    <div className="text-amber-400 font-black text-sm">₹{config.singleThalis.eggSpecial.price}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMeal('chicken')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedMeal === 'chicken'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-[#0F1A13] border-[#243B2D] text-slate-300 hover:border-[#375a43]'
                    }`}
                  >
                    <div className="text-xs font-bold">🍗 Chicken Special</div>
                    <div className="text-amber-400 font-black text-sm">₹{config.singleThalis.chickenSpecial.price}</div>
                  </button>
                </div>

                <div className="mt-2.5 p-2.5 bg-[#0F1A13] border border-[#243B2D] rounded-xl text-[11px] text-emerald-200/80">
                  <span className="font-bold text-white">शामिल सामग्री:</span> {currentMeal.items}
                </div>
              </div>

              {/* Slot & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">डिलीवरी स्लॉट</label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value as 'Lunch' | 'Dinner')}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="Lunch">🍱 Lunch ({config.deliverySlots.lunchTime})</option>
                    <option value="Dinner">🌙 Dinner ({config.deliverySlots.dinnerTime})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">संख्या (Thali Qty)</label>
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

              {/* Customer Info */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">आपका नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">मोबाइल नंबर (कॉल और WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">डिलीवरी लोकेशन / कॉलेज गेट / रूम नंबर *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Galgotias Gate 1, Hostel Room 302"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-rose-400 text-xs font-bold text-center pt-1">{errorMessage}</p>
              )}

              {/* Total & Proceed Button */}
              <div className="pt-3 border-t border-[#243B2D] flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">कुल राशि (Total)</span>
                  <span className="text-2xl font-black text-amber-400">₹{totalAmount}</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2"
                >
                  पेमेंट करें & UTR डालें ➔
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: UPI PAYMENT, UTR & SCREENSHOT UPLOAD */}
        {step === 'payment' && (
          <div>
            <div className="text-center mb-5">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
                💳 Step 2: UPI Scan & Verification
              </span>
              <h2 className="text-xl font-black text-white mt-1">₹{totalAmount} का भुगतान करें</h2>
              <p className="text-emerald-300/60 text-xs">नीचे दिए गए QR कोड को स्कैन करें और UTR नंबर दर्ज करें</p>
            </div>

            {/* QR Code & UPI Box */}
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
                <div className="text-xs text-slate-400">Official UPI ID:</div>
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
                <p className="text-[11px] text-emerald-300/70">
                  Google Pay, PhonePe, Paytm या किसी भी UPI ऐप से स्कैन करके पे करें।
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* UTR Input */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1">
                  12-Digit UPI Ref / UTR Number (अनिवार्य) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={22}
                  placeholder="उदा. 423871982341 (पेमेंट रसीद से देखकर डालें)"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full bg-[#0F1A13] border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  📸 पेमेंट स्क्रीनशॉट / स्लिप अपलोड करें (वैकल्पिक)
                </label>
                <div className="border border-dashed border-[#2B4534] rounded-xl p-3 bg-[#0F1A13] text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="slip-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="slip-upload"
                    className="cursor-pointer text-xs text-amber-300 font-bold hover:underline flex items-center justify-center gap-2"
                  >
                    <span>📎</span>
                    <span>{slipFileName ? `चयनित: ${slipFileName}` : 'गैलरी से स्क्रीनशॉट चुनें'}</span>
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
                  onClick={() => setStep('form')}
                  className="w-1/3 py-3 bg-[#0F1A13] hover:bg-[#1f3527] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition"
                >
                  ← वापस जाएं
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>ऑर्डर सबमिट करें</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: ORDER SUBMITTED & WAITING APPROVAL */}
        {step === 'success' && submittedOrder && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
              ⏳
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">ऑर्डर सफलतापूर्वक प्राप्त हुआ!</h2>
              <p className="text-emerald-300/80 text-xs mt-1">
                Order ID: <span className="font-mono font-bold text-amber-300">{submittedOrder.id}</span>
              </p>
            </div>

            <div className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">स्थिति (Status):</span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-[10px]">
                  🟡 Pending Admin Verification
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">मील प्लान:</span>
                <span className="text-white font-bold">{submittedOrder.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">कुल राशि:</span>
                <span className="text-amber-400 font-black">₹{submittedOrder.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR / Ref No:</span>
                <span className="font-mono text-white">{submittedOrder.utrNumber}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              {config.orderFormNote || 'किचन टीम आपका पेमेंट वेरीफाई करके 10-15 मिनट में डिलीवरी शुरू करेगी।'}
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20Maine%20abhi%20order%20place%20kiya%20hai.%0AOrder%20ID:%20${submittedOrder.id}%0AAmount:%20₹${submittedOrder.amount}%0AUTR:%20${submittedOrder.utrNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>💬</span>
                <span>WhatsApp पर स्लिप शेयर करें</span>
              </a>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3 bg-[#0F1A13] hover:bg-[#1a2c20] text-slate-300 font-bold text-xs rounded-xl border border-[#243B2D] transition"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
