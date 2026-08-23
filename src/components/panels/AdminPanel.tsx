import React, { useState, useEffect } from 'react';
import { getSiteConfig } from '../../utils/siteConfigStore';
import { getStoredOrders, updateOrderStatus, OrderItem, OrderStatus } from '../../utils/orderStore';
import { getStoredFundRequests, updateFundRequestStatus, FundRequest } from '../../utils/inventoryStore';
import { getStoredStaff, addStaffMember, updateStaffStatus, deleteStaffMember, getStoredSalaryLedger, recordSalaryPayment, StaffMember, SalaryPayment } from '../../utils/staffStore';
import { QuickCalculator } from '../common/QuickCalculator';

type AdminMainTab = 'orders' | 'staffPayroll' | 'groceryClearance' | 'analytics' | 'subscribers' | 'delivery';

export const AdminPanel: React.FC = () => {
  const [config] = useState(getSiteConfig());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  // Navigation & State
  const [activeMainTab, setActiveMainTab] = useState<AdminMainTab>('orders');
  const [orders, setOrders] = useState<OrderItem[]>(getStoredOrders());
  const [fundRequests, setFundRequests] = useState<FundRequest[]>(getStoredFundRequests());
  const [staffList, setStaffList] = useState<StaffMember[]>(getStoredStaff());
  const [salaryLedger, setSalaryLedger] = useState<SalaryPayment[]>(getStoredSalaryLedger());

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'out_for_delivery' | 'rejected'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);

  // Hiring Form Modal State
  const [showHireModal, setShowHireModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffMember['role']>('Head Chef');
  const [newStaffIdProof, setNewStaffIdProof] = useState('');
  const [newStaffSalaryType, setNewStaffSalaryType] = useState<'monthly' | 'daily'>('monthly');
  const [newStaffBaseSalary, setNewStaffBaseSalary] = useState<number>(15000);
  const [newStaffShift, setNewStaffShift] = useState<StaffMember['shift']>('Full Day (8 AM - 8 PM)');
  const [newStaffHub, setNewStaffHub] = useState('Central Kitchen, KP-3');

  // Salary Pay Modal State
  const [payingStaff, setPayingStaff] = useState<StaffMember | null>(null);
  const [daysWorkedInput, setDaysWorkedInput] = useState<number>(30);
  const [advanceDeductionInput, setAdvanceDeductionInput] = useState<number>(0);
  const [paymentModeInput, setPaymentModeInput] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');

  const refreshAllData = () => {
    setOrders(getStoredOrders());
    setFundRequests(getStoredFundRequests());
    setStaffList(getStoredStaff());
    setSalaryLedger(getStoredSalaryLedger());
  };

  useEffect(() => {
    refreshAllData();
    window.addEventListener('bmb_orders_updated', refreshAllData);
    window.addEventListener('bmb_inventory_updated', refreshAllData);
    window.addEventListener('bmb_staff_updated', refreshAllData);
    window.addEventListener('bmb_payroll_updated', refreshAllData);
    return () => {
      window.removeEventListener('bmb_orders_updated', refreshAllData);
      window.removeEventListener('bmb_inventory_updated', refreshAllData);
      window.removeEventListener('bmb_staff_updated', refreshAllData);
      window.removeEventListener('bmb_payroll_updated', refreshAllData);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.adminPin || pinInput === config.superAdminPin || pinInput === '6655') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN! Enter 6655.');
    }
  };

  const handleStatusChange = (orderId: string, status: OrderStatus, reason?: string) => {
    updateOrderStatus(orderId, status, reason);
    setActionMessage(`Order ${orderId} marked as ${status.toUpperCase()}!`);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const handleReject = (orderId: string) => {
    const reason = window.prompt('Enter exact reason for declining order:', 'Payment UTR verification failed / Fake UTR');
    if (reason !== null) {
      handleStatusChange(orderId, 'rejected', reason || 'Payment unverified');
    }
  };

  // Staff Hiring Handler
  const handleHireStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffPhone || !newStaffIdProof) {
      alert('Please fill all mandatory staff details!');
      return;
    }
    const created = addStaffMember({
      name: newStaffName.trim(),
      phone: newStaffPhone.trim(),
      role: newStaffRole,
      idProof: newStaffIdProof.trim(),
      joiningDate: new Date().toISOString().split('T')[0],
      salaryType: newStaffSalaryType,
      baseSalary: Number(newStaffBaseSalary),
      shift: newStaffShift,
      hubLocation: newStaffHub.trim(),
      status: 'active',
    });

    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffIdProof('');
    setShowHireModal(false);
    setActionMessage(`New staff member "${created.name}" hired as ${created.role}!`);
    setTimeout(() => setActionMessage(''), 3500);
  };

  // Salary Payment Handler
  const handleRecordSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingStaff) return;

    const base = payingStaff.salaryType === 'monthly' ? payingStaff.baseSalary : payingStaff.baseSalary * daysWorkedInput;
    const net = Math.max(0, base - advanceDeductionInput);

    recordSalaryPayment({
      staffId: payingStaff.id,
      staffName: payingStaff.name,
      staffRole: payingStaff.role,
      monthYear: new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
      daysWorked: daysWorkedInput,
      baseSalary: base,
      advanceDeducted: advanceDeductionInput,
      netPaid: net,
      paymentMode: paymentModeInput,
    });

    setPayingStaff(null);
    setActionMessage(`Salary of ₹${net} recorded as PAID to ${payingStaff.name}!`);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const approvedOrders = orders.filter((o) => o.status === 'approved');
  const declinedOrders = orders.filter((o) => o.status === 'rejected');
  const outOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const filteredOrders = orders.filter((o) => (filterStatus === 'all' ? true : o.status === filterStatus));
  const pendingFunds = fundRequests.filter((f) => f.status === 'pending');

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#15231B] border border-[#243B2D] rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-amber-500/30">
            💼
          </div>
          <h2 className="text-2xl font-black text-white">Staff & Admin Login</h2>
          <p className="text-emerald-300/60 text-xs mt-1">Enter Master PIN to access Orders & Operations Desk</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              maxLength={8}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-3.5 bg-[#0F1A13] border border-[#243B2D] focus:border-amber-500 rounded-2xl text-white text-center text-2xl tracking-[0.4em] outline-none"
              autoFocus
            />
            {pinError && <p className="text-rose-400 text-xs font-bold">{pinError}</p>}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-2xl shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              Unlock Admin Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* Header Bar */}
      <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
              💼
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Operations & Clearance Desk</h1>
              <p className="text-emerald-300/60 text-xs">
                Real-time Orders, Second-Precision Timestamping, Mandi Clearances & Staff Payroll
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🧮</span> {showCalculator ? 'Hide Calc' : 'Calculator'}
          </button>
          <button
            type="button"
            onClick={refreshAllData}
            className="px-3.5 py-2 bg-[#0F1A13] hover:bg-[#203326] text-emerald-200 text-xs font-bold rounded-xl border border-[#243B2D] transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh
          </button>
          <a
            href="#superadmin"
            className="px-3.5 py-2 bg-[#18271E] hover:bg-[#243B2D] text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition flex items-center gap-1.5"
          >
            <span>👑</span> Super Admin
          </a>
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition cursor-pointer"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Floating Inbuilt Calculator */}
      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-50 shadow-2xl">
          <QuickCalculator onClose={() => setShowCalculator(false)} />
        </div>
      )}

      {actionMessage && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <span>⚡</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Feature Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#243B2D]">
        {[
          { id: 'orders', label: `📦 Orders Desk (${orders.length})`, badge: pendingOrders.length > 0 ? `🔴 ${pendingOrders.length}` : undefined },
          { id: 'staffPayroll', label: `👥 Staff & Payroll Hub (${staffList.length})` },
          { id: 'groceryClearance', label: `💰 Grocery & Mandi Funds (${fundRequests.length})`, badge: pendingFunds.length > 0 ? `⚡ ${pendingFunds.length}` : undefined },
          { id: 'analytics', label: '📊 Live Revenue & Profit' },
          { id: 'subscribers', label: `👥 Subscribers Directory` },
          { id: 'delivery', label: '🚚 Delivery Fleet Dispatch' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveMainTab(tab.id as AdminMainTab)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === tab.id
                ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black shadow-lg'
                : 'bg-[#15231B] text-slate-300 hover:bg-[#1f3527] border border-[#243B2D]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: ORDERS RECEIVED DESK */}
      {activeMainTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: `All Orders (${orders.length})` },
              { id: 'pending', label: `🟡 Pending Approval (${pendingOrders.length})` },
              { id: 'approved', label: `🟢 Approved (${approvedOrders.length})` },
              { id: 'out_for_delivery', label: `🚚 Out for Delivery (${outOrders.length})` },
              { id: 'rejected', label: `🔴 Declined / Rejected (${declinedOrders.length})` },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setFilterStatus(sub.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterStatus === sub.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#0F1A13] text-slate-400 border border-[#243B2D]'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-12 text-center text-slate-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm font-bold text-white">No orders in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const cleanPhone = order.phone.replace(/[^0-9]/g, '');

                const approveWaMsg = `🧾 *BRING MY BITE • OFFICIAL ORDER INVOICE* %0A━━━━━━━━━━━━━━━━━━━━━━━%0A🆔 *Order ID:* ${order.id}%0A👤 *Customer:* ${order.customerName}%0A📞 *Mobile:* ${order.phone}%0A⏱️ *Order Time:* ${order.formattedTimestamp}%0A📍 *Delivery Zone:* ${order.city || 'Greater Noida'} (${order.estimatedTime || '30 Mins ETA'})%0A🏢 *Gate/Address:* ${order.address}%0A━━━━━━━━━━━━━━━━━━━━━━━%0A🍱 *Meal Plan:* ${order.mealPlan}%0A⏰ *Slot:* ${order.slot}%0A💰 *Total Amount:* ₹${order.amount}.00%0A💳 *Payment Status:* VERIFIED ✅ (UTR: ${order.utrNumber})%0A━━━━━━━━━━━━━━━━━━━━━━━%0A👨‍🍳 *Status:* Kitchen is preparing your fresh meal! Delivery boy will arrive at your gate shortly.%0A📞 *Helpdesk:* ${config.phone}`;

                const rejectWaMsg = `⚠️ *BRING MY BITE • PAYMENT DECLINE ALERT* %0A━━━━━━━━━━━━━━━━━━━━━━━%0A🆔 *Order ID:* ${order.id}%0A👤 *Customer:* ${order.customerName}%0A⏱️ *Attempt Time:* ${order.formattedTimestamp}%0A❌ *Status:* Payment Unverified / Declined%0A❗ *Decline Reason:* ${order.rejectionReason || 'UTR number does not match banking records'}%0A━━━━━━━━━━━━━━━━━━━━━━━%0A📸 *Action Required:* Please reply directly to this WhatsApp message with your UPI payment screenshot to verify & unlock your meal order.%0A📞 *Support:* ${config.phone}`;

                return (
                  <div
                    key={order.id}
                    className={`bg-[#15231B] border rounded-3xl p-6 transition shadow-lg ${
                      order.status === 'pending'
                        ? 'border-amber-500/50 bg-[#18291f]'
                        : order.status === 'approved'
                        ? 'border-emerald-500/30'
                        : order.status === 'out_for_delivery'
                        ? 'border-sky-500/30'
                        : 'border-rose-500/40 bg-rose-950/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-sm">{order.id}</span>
                          <span className="px-2.5 py-0.5 bg-[#0F1A13] border border-[#2B4534] text-emerald-300 font-mono text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <span>⏱️</span> {order.formattedTimestamp}
                          </span>
                          <span className="px-2 py-0.5 bg-[#0F1A13] border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold">
                            📍 {order.city || 'Greater Noida'} • {order.estimatedTime || '30 Mins'}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                : order.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : order.status === 'out_for_delivery'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {order.status === 'pending' && '🟡 Pending'}
                            {order.status === 'approved' && '🟢 Approved'}
                            {order.status === 'out_for_delivery' && '🚚 Out for Delivery'}
                            {order.status === 'rejected' && '🔴 Declined'}
                          </span>
                        </div>

                        <div className="text-base font-black text-white pt-0.5">
                          {order.customerName}{' '}
                          <span className="text-xs font-normal text-emerald-300/80 font-mono">({order.phone})</span>
                        </div>

                        <div className="text-xs text-slate-300">
                          📍 <span className="text-white font-medium">{order.address}</span> • 🍱{' '}
                          <span className="text-amber-300 font-bold">{order.mealPlan}</span>
                        </div>

                        {order.status === 'rejected' && order.rejectionReason && (
                          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-bold">
                            ❗ Decline Reason: {order.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Payment Verification Box */}
                      <div className="bg-[#0F1A13] border border-[#243B2D] p-3.5 rounded-2xl flex items-center gap-4 min-w-[280px]">
                        <div className="space-y-0.5 flex-1">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">UTR / Ref Number</div>
                          <div className="text-xs font-mono font-bold text-amber-300 select-all">{order.utrNumber}</div>
                          <div className="text-sm font-black text-white pt-1">
                            ₹{order.amount}{' '}
                            {order.deliveryCharge > 0 && (
                              <span className="text-[10px] text-amber-300 font-normal">(+₹{order.deliveryCharge} Noida)</span>
                            )}
                          </div>
                        </div>

                        {order.paymentSlip ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(order.paymentSlip)}
                            className="group relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40 hover:scale-105 transition cursor-pointer"
                            title="Click to Zoom Screenshot"
                          >
                            <img src={order.paymentSlip} alt="Slip" className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition">
                              🔍 Zoom
                            </span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No Slip</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(order.id, 'approved')}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
                            >
                              ✅ Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(order.id)}
                              className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 transition cursor-pointer"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}

                        {order.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl transition cursor-pointer"
                          >
                            🚚 Dispatch
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${cleanPhone}?text=${
                            order.status === 'rejected' ? rejectWaMsg : approveWaMsg
                          }`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-[#203326] hover:bg-[#2c4734] text-emerald-200 text-xs font-bold rounded-xl border border-emerald-500/30 transition flex items-center gap-1.5"
                        >
                          <span>💬</span>
                          <span>{order.status === 'rejected' ? 'Send Decline Alert' : 'Send WhatsApp Bill'}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STAFF HIRING & HR PAYROLL MANAGEMENT */}
      {activeMainTab === 'staffPayroll' && (
        <div className="space-y-6">
          <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                  👥 Kitchen Staff, Riders & Payroll Management
                </h3>
                <p className="text-xs text-emerald-300/60 mt-0.5">
                  Hire chefs/helpers/riders, calculate monthly/daily salaries, deduct advances & record payments
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHireModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>➕</span> Hire New Staff Member
              </button>
            </div>

            {/* Staff List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0F1A13] text-amber-400 uppercase text-[10px] border-b border-[#243B2D]">
                  <tr>
                    <th className="p-3">Staff Name & ID</th>
                    <th className="p-3">Role / Designation</th>
                    <th className="p-3">Salary Structure</th>
                    <th className="p-3">Assigned Shift & Hub</th>
                    <th className="p-3">Govt ID Proof</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243B2D]">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-[#18271E] transition">
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{staff.name}</div>
                        <div className="text-[11px] font-mono text-emerald-300">{staff.phone} • {staff.id}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg font-bold text-[10px]">
                          {staff.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        ₹{staff.baseSalary.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({staff.salaryType === 'monthly' ? '/ Month' : '/ Day'})
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-white font-medium">{staff.shift}</div>
                        <div className="text-[10px] text-slate-400">{staff.hubLocation}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">{staff.idProof}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            staff.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {staff.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setPayingStaff(staff)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                        >
                          💵 Pay Salary
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStaffMember(staff.id)}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Salary Payment History Ledger */}
          <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
            <h4 className="text-sm font-black text-amber-300 mb-3">📜 Released Salary & Payroll Ledger</h4>
            {salaryLedger.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No salary disbursements recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0F1A13] text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Staff Name</th>
                      <th className="p-2.5">Month</th>
                      <th className="p-2.5">Days Worked</th>
                      <th className="p-2.5">Advance Deducted</th>
                      <th className="p-2.5">Net Amount Paid</th>
                      <th className="p-2.5">Mode</th>
                      <th className="p-2.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#243B2D]">
                    {salaryLedger.map((pay) => (
                      <tr key={pay.id}>
                        <td className="p-2.5 font-bold text-white">{pay.staffName} ({pay.staffRole})</td>
                        <td className="p-2.5 font-semibold text-amber-300">{pay.monthYear}</td>
                        <td className="p-2.5">{pay.daysWorked} Days</td>
                        <td className="p-2.5 text-rose-400 font-mono">-₹{pay.advanceDeducted}</td>
                        <td className="p-2.5 font-black text-emerald-400 font-mono text-sm">₹{pay.netPaid.toLocaleString()}</td>
                        <td className="p-2.5">{pay.paymentMode}</td>
                        <td className="p-2.5 font-mono text-slate-400 text-[11px]">{pay.paidAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: HIRE NEW STAFF */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#243B2D] pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <span>➕</span> Hire New Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setShowHireModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-[#0F1A13] px-2.5 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleHireStaffSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Number"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Role / Designation *</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Head Chef">👨‍🍳 Head Chef</option>
                    <option value="Assistant Cook">🍳 Assistant Cook</option>
                    <option value="Kitchen Helper">🥣 Kitchen Helper</option>
                    <option value="Packaging Staff">📦 Packaging Staff</option>
                    <option value="Delivery Rider">🛵 Delivery Rider</option>
                    <option value="Store Manager">📋 Store Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Salary Type *</label>
                  <select
                    value={newStaffSalaryType}
                    onChange={(e) => setNewStaffSalaryType(e.target.value as any)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="monthly">Monthly Fixed</option>
                    <option value="daily">Daily Wage Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Base Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newStaffBaseSalary}
                    onChange={(e) => setNewStaffBaseSalary(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Govt ID / Aadhaar Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AADHAAR-1234-5678-9012"
                  value={newStaffIdProof}
                  onChange={(e) => setNewStaffIdProof(e.target.value)}
                  className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Work Shift</label>
                  <select
                    value={newStaffShift}
                    onChange={(e) => setNewStaffShift(e.target.value as any)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Full Day (8 AM - 8 PM)">Full Day (8 AM - 8 PM)</option>
                    <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                    <option value="Evening (2 PM - 10 PM)">Evening (2 PM - 10 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Assigned Hub</label>
                  <input
                    type="text"
                    value={newStaffHub}
                    onChange={(e) => setNewStaffHub(e.target.value)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHireModal(false)}
                  className="px-4 py-2 bg-[#0F1A13] text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 text-xs font-black rounded-xl shadow-lg cursor-pointer"
                >
                  Confirm Hiring ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SALARY PAYMENT & ADVANCE DEDUCTION */}
      {payingStaff && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#243B2D] pb-3">
              <h3 className="text-base font-black text-amber-300">
                💵 Pay Salary to {payingStaff.name}
              </h3>
              <button
                type="button"
                onClick={() => setPayingStaff(null)}
                className="text-slate-400 hover:text-white text-xs bg-[#0F1A13] px-2.5 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordSalarySubmit} className="space-y-3.5">
              <div className="p-3 bg-[#0F1A13] rounded-2xl border border-[#243B2D] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Designation:</span>
                  <span className="font-bold text-white">{payingStaff.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Salary Rate:</span>
                  <span className="font-mono font-bold text-amber-400">
                    ₹{payingStaff.baseSalary} ({payingStaff.salaryType})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Days Worked</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={daysWorkedInput}
                    onChange={(e) => setDaysWorkedInput(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-300 mb-1">Advance to Deduct (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={advanceDeductionInput}
                    onChange={(e) => setAdvanceDeductionInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-rose-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Payment Mode</label>
                <select
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value as any)}
                  className="w-full bg-[#0F1A13] border border-[#243B2D] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="UPI">Direct UPI Transfer</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Bank Transfer">NEFT / IMPS Bank Transfer</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-200">Net Payable Amount:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ₹{Math.max(
                    0,
                    (payingStaff.salaryType === 'monthly' ? payingStaff.baseSalary : payingStaff.baseSalary * daysWorkedInput) -
                      advanceDeductionInput
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingStaff(null)}
                  className="px-4 py-2 bg-[#0F1A13] text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg cursor-pointer"
                >
                  ✅ Confirm & Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: GROCERY CLEARANCE */}
      {activeMainTab === 'groceryClearance' && (
        <div className="space-y-6">
          <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
            <h3 className="text-lg font-black text-amber-300 mb-4">🛒 Daily Mandi Grocery Clearance</h3>
            <div className="space-y-4">
              {fundRequests.map((req) => (
                <div key={req.id} className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-[#243B2D] pb-2">
                    <span className="font-mono font-bold text-amber-400">{req.id} • {req.formattedTimestamp}</span>
                    <span className="text-base font-black text-amber-300">Total: ₹{req.totalBudget}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {req.items.map((i) => `${i.name} (${i.qty} ${i.unit} @ ₹${i.ratePerUnit})`).join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIALS & ANALYTICS */}
      {activeMainTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-[#15231B] border border-amber-500/30 p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Sales (GMV)</span>
              <div className="text-3xl font-black text-amber-400 mt-2">
                ₹{orders.filter((o) => o.status !== 'rejected').reduce((s, o) => s + o.amount, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-[#15231B] border border-rose-500/30 p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Payroll Released</span>
              <div className="text-3xl font-black text-rose-400 mt-2">
                ₹{salaryLedger.reduce((s, p) => s + p.netPaid, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUBSCRIBERS */}
      {activeMainTab === 'subscribers' && (
        <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
          <h3 className="text-lg font-black text-amber-300 mb-4">👥 Active Monthly Subscribers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0F1A13] text-amber-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Order Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243B2D]">
                {orders.filter((o) => o.planType === 'Monthly' && o.status !== 'rejected').map((sub) => (
                  <tr key={sub.id}>
                    <td className="p-3 font-bold text-white">{sub.customerName} ({sub.phone})</td>
                    <td className="p-3 text-amber-300">{sub.mealPlan}</td>
                    <td className="p-3 font-bold">₹{sub.amount}</td>
                    <td className="p-3 font-mono text-slate-400">{sub.formattedTimestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: DELIVERY */}
      {activeMainTab === 'delivery' && (
        <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
          <h3 className="text-base font-black text-amber-300 mb-3">🏢 Delivery Gates & University Hubs</h3>
          <p className="text-xs text-slate-300">Galgotias University (Gate 1 & 2), Sharda University, Bennett University, Knowledge Park Hostels.</p>
        </div>
      )}

      {/* Screenshot Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#15231B] border border-[#243B2D] rounded-3xl p-4 text-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-600 text-white font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-white mb-3">📸 Payment Screenshot</h3>
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-[#243B2D]">
              <img src={previewImage} alt="Full Slip" className="w-full object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
