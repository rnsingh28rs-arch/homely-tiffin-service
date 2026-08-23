import React, { useState, useEffect, useRef } from 'react';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';
import { getStoredOrders, OrderItem } from '../../utils/orderStore';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: { label: string; action: string }[];
  orderCard?: OrderItem;
}

export const ChefChatBot: React.FC = () => {
  const { openInstantOrder, openRegistration } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [isOpen, setIsOpen] = useState(false);
  const [isWaving, setIsWaving] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Initial Chef Greeting with Animated Avatar
  useEffect(() => {
    if (messages.length === 0) {
      const initialMsg: Message = {
        id: 'msg-init',
        sender: 'bot',
        text: `Namaste ji! 🙏 Main hoon **Chef Bitey** 👨‍🍳 Bring My Bite ka AI Kitchen Assistant!\n\nAaj kitchen me fresh aur pure desi ghee/mustard oil ka khana ban raha hai. Main aapki kya madad kar sakta hoon?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: [
          { label: '🍛 Aaj Ka Live Menu & Rates', action: 'menu' },
          { label: '🔍 Track My Order Status', action: 'track' },
          { label: '📅 30-Day Monthly Tiffin Plans', action: 'subscriptions' },
          { label: '🚚 Delivery Areas & 30 Min ETA', action: 'delivery' },
          { label: '💬 Talk on WhatsApp', action: 'whatsapp' },
        ],
      };
      setMessages([initialMsg]);
    }
  }, []);

  const handleBotResponse = (userInput: string, actionType?: string) => {
    setIsTyping(true);
    const query = (actionType || userInput).toLowerCase();

    setTimeout(() => {
      let botReplyText = '';
      let options: { label: string; action: string }[] | undefined = undefined;
      let matchedOrder: OrderItem | undefined = undefined;

      const activeDishes = (config.dishes || []).filter((d) => d.isAvailable);

      if (query.includes('menu') || query.includes('khana') || query.includes('rate') || query.includes('dish') || query.includes('thali')) {
        const dishList = activeDishes.map((d) => `• **${d.name}** (${d.category}): ₹${d.price}\n  _${d.items}_`).join('\n\n');
        botReplyText = `🍱 **Aaj Ka Freshly Cooked Menu:**\n\n${dishList}\n\n👉 Aap niche diye gaye button se direct plate book kar sakte hain!`;
        options = [
          { label: '⚡ Book Instant Thali Now', action: 'open_instant_modal' },
          { label: '📅 View Monthly Subscriptions', action: 'subscriptions' },
        ];
      } else if (query.includes('track') || query.includes('status') || query.includes('kahan pahucha') || query.includes('bmb-')) {
        const allOrders = getStoredOrders();
        const cleanQuery = userInput.replace(/[^0-9]/g, '');

        const found = allOrders.find(
          (o) =>
            o.id.toLowerCase() === userInput.trim().toLowerCase() ||
            (cleanQuery.length >= 6 && o.phone.includes(cleanQuery))
        );

        if (found) {
          matchedOrder = found;
          botReplyText = `✅ **Order Mil Gaya!**\n\n🆔 **Order ID:** ${found.id}\n🍱 **Meal:** ${found.mealPlan}\n📍 **Status:** ${
            found.status === 'pending'
              ? '🟡 Verification Pending (Admin checking UTR)'
              : found.status === 'approved'
              ? '🟢 Approved & Cooking 🍳'
              : found.status === 'out_for_delivery'
              ? '🚚 Out for Delivery to your gate'
              : found.status === 'delivered'
              ? '✅ Delivered'
              : '🔴 Declined'
          }\n⏱️ **ETA:** ${found.estimatedTime || '30 Mins'}`;
          options = [
            { label: '💬 WhatsApp Support for this Order', action: 'whatsapp' },
            { label: '🍛 Order Another Meal', action: 'open_instant_modal' },
          ];
        } else {
          botReplyText = `🔍 Apna 10-digit **Mobile Number** ya **Order ID (jaise BMB-123456)** yahan type karein, main turant live status check karke batata hoon.`;
        }
      } else if (query.includes('subscription') || query.includes('monthly') || query.includes('package') || query.includes('mahina')) {
        botReplyText = `📅 **30-Day Monthly Tiffin Subscriptions:**\n\n🌱 **Pure Veg Plan:** ₹${config.packages?.veg?.monthlyPrice || 2999} / Month\n🍳 **Egg Special Plan:** ₹${config.packages?.egg?.monthlyPrice || 3499} / Month\n🍗 **Chicken Special Plan:** ₹${config.packages?.nonVeg?.monthlyPrice || 4199} / Month\n\nRoz lunch aur dinner aapke college gate/hostel par garam deliver hota hai!`;
        options = [
          { label: '📝 Register Monthly Plan', action: 'open_reg_modal' },
          { label: '🍛 Order Daily Single Plate', action: 'open_instant_modal' },
        ];
      } else if (query.includes('delivery') || query.includes('time') || query.includes('location') || query.includes('gate') || query.includes('noida')) {
        botReplyText = `🚚 **Delivery Areas & Timings:**\n\n⚡ **Greater Noida:** 30 Mins Express Delivery (₹0 Free Delivery) across Galgotias Gate 1 & 2, Sharda Gate 3, Bennett & Knowledge Park Hostels.\n\n🚚 **Noida (Sector 1-150):** 45 Mins Scheduled Delivery (+₹25 Distance Share 50% Off).\n\n🍱 **Lunch Shift:** ${config.deliverySlots?.lunchTime || '12:30 PM - 02:00 PM'}\n🌙 **Dinner Shift:** ${config.deliverySlots?.dinnerTime || '07:30 PM - 09:30 PM'}`;
        options = [
          { label: '⚡ Order for Greater Noida (30 Mins)', action: 'open_instant_modal' },
          { label: '💬 Contact Kitchen Team', action: 'whatsapp' },
        ];
      } else if (query.includes('whatsapp') || query.includes('call') || query.includes('phone') || query.includes('help')) {
        botReplyText = `📞 **Official Support Desk:**\n\nCalling: **${config.phone}**\nWhatsApp: **+${config.whatsappNumber}**\n\nKitchen Address: ${config.kitchenAddress}`;
        options = [
          { label: '💬 Open WhatsApp Business Chat', action: 'direct_whatsapp' },
        ];
      } else if (query === 'open_instant_modal') {
        openInstantOrder();
        botReplyText = 'Thali booking form screen par open kar diya gaya hai! 🍱';
      } else if (query === 'open_reg_modal') {
        openRegistration();
        botReplyText = 'Monthly registration form screen par open kar diya gaya hai! 📅';
      } else {
        botReplyText = `Aapka sawaal samajh gaya ji! Kitchen me sabhi meals daily fresh cook hoti hain. Kya aap **Aaj Ka Menu** dekhna chahte hain ya **Order Track** karna chahte hain?`;
        options = [
          { label: '🍛 Aaj Ka Menu', action: 'menu' },
          { label: '🔍 Track Order', action: 'track' },
          { label: '💬 Chat on WhatsApp', action: 'whatsapp' },
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'bot',
          text: botReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options,
          orderCard: matchedOrder,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');

    setMessages((prev) => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    handleBotResponse(userText);
  };

  const handleOptionClick = (action: string) => {
    if (action === 'open_instant_modal') {
      openInstantOrder();
      setIsOpen(false);
      return;
    }
    if (action === 'open_reg_modal') {
      openRegistration();
      setIsOpen(false);
      return;
    }
    if (action === 'direct_whatsapp' || action === 'whatsapp') {
      const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20I%20want%20to%20order%20meals.`, '_blank');
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    handleBotResponse('', action);
  };

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Animated Chef Trigger Button */}
      {!isOpen && (
        <div className="relative group">
          {/* Animated Greeting Bubble */}
          {isWaving && (
            <div className="absolute -top-12 right-0 bg-[#15231B] text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-2xl text-[11px] font-bold shadow-2xl flex items-center gap-1.5 whitespace-nowrap animate-bounce">
              <span>👋</span>
              <span>Chef Bitey se baat karein!</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWaving(false);
                }}
                className="text-slate-400 hover:text-white ml-1 text-[10px]"
              >
                ✕
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsWaving(false);
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#B45309] via-[#D97706] to-[#F59E0B] text-white flex items-center justify-center text-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-amber-300 cursor-pointer"
            aria-label="Open AI Chef Chat"
          >
            <span className="relative">
              👨‍🍳
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </span>
          </button>
        </div>
      )}

      {/* Main Chef Chat Drawer Window (100% Mobile & Desktop Responsive) */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[540px] max-h-[85vh] bg-[#111A14] border border-[#2B4534] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#FAF7F2] animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header with Animated Chef Avatar */}
          <div className="bg-[#15231B] p-3.5 px-4 border-b border-[#243B2D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Head-Lifting Animated Chef Icon */}
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-2xl shadow-md transform hover:-translate-y-1 transition duration-300">
                👨‍🍳
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#15231B] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">Chef Bitey</h3>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-black rounded-md uppercase">
                    AI Kitchen
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/80 font-medium">Ready to take your order 24/7</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20I%20need%20assistance.`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                title="Direct WhatsApp"
              >
                <span>💬</span>
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#0F1A13] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs scrollbar-none">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-md whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-br-none'
                      : 'bg-[#18271E] border border-[#243B2D] text-emerald-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}

                  {/* Optional Interactive Order Card */}
                  {msg.orderCard && (
                    <div className="mt-2.5 p-2.5 bg-[#0F1A13] border border-emerald-500/40 rounded-xl text-[11px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Bill:</span>
                        <span className="font-bold text-amber-300">₹{msg.orderCard.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Delivery Gate:</span>
                        <span className="font-medium text-white truncate max-w-[150px]">{msg.orderCard.address}</span>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-500 px-1 mt-0.5">{msg.timestamp}</span>

                {/* Quick Action Chips */}
                {msg.options && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleOptionClick(opt.action)}
                        className="px-2.5 py-1 rounded-xl bg-[#18271E] hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm text-left"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 bg-[#18271E] px-3 py-2 rounded-2xl w-fit border border-[#243B2D]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] text-emerald-300 ml-1">Chef Bitey is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-[#15231B] border-t border-[#243B2D] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything or enter Phone / Order ID..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-[#0F1A13] border border-[#243B2D] focus:border-amber-500 rounded-2xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md hover:brightness-110 transition cursor-pointer shrink-0"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
