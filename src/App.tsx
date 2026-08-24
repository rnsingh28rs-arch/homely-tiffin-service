import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/common/TopBar';
import { TodayMenuTicker } from './components/common/TodayMenuTicker';
import { LiveActiveOrderBar } from './components/customer/LiveActiveOrderBar';
import { ChatBox } from './components/common/ChatBox';
import { HeroBanner } from './components/customer/HeroBanner';
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

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A261E] flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      <LiveActiveOrderBar />
      <TopBar />
      <TodayMenuTicker />
      <main className="flex-1">
        <HeroBanner />
        <LowerFeaturesGrid />
        <PackagesSection />
      </main>
      <Footer />
      <InstantOrderModal />
      <RegistrationModal />
      <RenewalModal />
      <TrackOrderModal isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />
      <ChatBox />
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
