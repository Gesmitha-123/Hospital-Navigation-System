import React, { useState } from 'react';
import { useNavigation } from './context/NavigationContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import RoutePlanner from './components/navigation/RoutePlanner';
import HospitalMap from './components/map/HospitalMap';
import MultiFloorGuide from './components/navigation/MultiFloorGuide';
import QRScannerView from './components/qr/QRScannerView';
import EmergencyView from './components/emergency/EmergencyView';
import AboutView from './components/about/AboutView';
import SettingsView from './components/settings/SettingsView';
import AlgorithmComparisonModal from './components/navigation/AlgorithmComparisonModal';
import ARNavigationModal from './components/ar/ARNavigationModal';
import { CheckCircle2, AlertCircle, Info, Flame } from 'lucide-react';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeTab, toast } = useNavigation();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'find-location':
        return <RoutePlanner />;
      case 'map':
        return <HospitalMap />;
      case 'floor-nav':
        return <MultiFloorGuide />;
      case 'qr-scanner':
        return <QRScannerView />;
      case 'emergency':
        return <EmergencyView />;
      case 'about':
        return <AboutView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'emergency':
        return <Flame className="w-4 h-4 text-red-400 animate-bounce" />;
      default:
        return <Info className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Persistent Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Sticky Header */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
                toast.type === 'emergency'
                  ? 'bg-red-950 text-white border-red-500 shadow-red-900/50'
                  : toast.type === 'error'
                  ? 'bg-slate-900 text-white border-red-500/50'
                  : toast.type === 'success'
                  ? 'bg-slate-900 text-white border-emerald-500/50'
                  : 'bg-hospital-navy text-white border-teal-500/50'
              }`}
            >
              {getToastIcon(toast.type)}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Algorithm Comparison Modal */}
        <AlgorithmComparisonModal />

        {/* Simulated AR Navigation Modal */}
        <ARNavigationModal />
      </div>
    </div>
  );
}
