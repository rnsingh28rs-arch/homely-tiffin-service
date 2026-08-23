import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/common/TopBar';
import { TodayMenuTicker } from './components/common/TodayMenuTicker';
import { LiveActiveOrderBar } from './components/customer/LiveActiveOrderBar';
import { ChefChatBot } from './components/common/ChefChatBot';
import { Hero } from './components/customer/Hero';
import { LowerFeaturesGrid } from './components/customer/LowerFeaturesGrid';
import { PackagesSection } from './components/customer/PackagesSection';
import { Footer } from './components/common/Footer';
import { InstantOrderModal } from './components/customer/InstantOrderModal';
import { RegistrationModal } from './components/customer/RegistrationModal';
import { RenewalModal } from './components/customer/RenewalModal';
import { TrackOrderModal } from './components/customer/TrackOrderModal';
import { StaffNavBar } from './components/panels/StaffNavBar';
import { AdminPanel } from './components/panels/AdminPanel';
import { ManagerPanel } from './components/panels/ManagerPanel';
import { ChefPanel } from './components/panels/ChefPanel';
import { SuperAdminPanel } from './components/panels/SuperAdminPanel';

const MainLayout: React.FC = () => {
  const { activeRole, setActiveRole } = useApp();
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash);
      if (hash === '#superadmin') {
        setActiveRole('superadmin');
      } else if (hash === '#admin') {
        setActiveRole('admin');
      } else if (hash === '#manager') {
        setActiveRole('manager');
      } else if (hash === '#chef') {
        setActiveRole('chef');
      } else {
        setActiveRole('customer');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveRole]);

  // Full Screen Super Admin View
  if (activeRole === 'superadmin' || currentHash === '#superadmin') {
    return (
      <SuperAdminPanel
        onClose={() => {
          setActiveRole('customer');
          window.location.hash = '';
        }}
      />
    );
  }

  // Staff Internal Panel Views (Admin, Manager, Chef)
  if (activeRole !== 'customer') {
    return (
      <div className="min-h-screen bg-[#0E1712] text-[#FAF7F2] flex flex-col font-sans">
        <StaffNavBar />
        <main className="flex-1">
          {activeRole === 'admin' && <AdminPanel />}
          {activeRole === 'manager' && <ManagerPanel />}
          {activeRole === 'chef' && <ChefPanel />}
        </main>
        <Footer />
      </div>
    );
  }

  // Public Customer Facing Website Layout
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A261E] flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Live Active Order Floating Banner (Auto Detected) */}
      <LiveActiveOrderBar />

      {/* 2. Top Header Bar */}
      <TopBar />

      {/* 3. Running Menu & Rates Ticker */}
      <TodayMenuTicker />

      {/* 4. Hero Showcase Section */}
      <main className="flex-1">
        <Hero />
        {/* 5. Dynamic Dishes & Rice Combos Grid */}
        <LowerFeaturesGrid />
        {/* 6. 30-Day Monthly Packages Section */}
        <PackagesSection />
      </main>

      {/* 7. Public Footer */}
      <Footer />

      {/* 8. Customer Booking & Tracking Modals */}
      <InstantOrderModal />
      <RegistrationModal />
      <RenewalModal />
      <TrackOrderModal isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />

      {/* 9. Animated Chef AI Chatbot (Chef Bitey) */}
      <ChefChatBot />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
