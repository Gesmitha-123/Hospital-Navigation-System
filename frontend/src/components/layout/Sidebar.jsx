import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  Map as MapIcon,
  Layers,
  QrCode,
  AlertTriangle,
  Info,
  Settings,
  ShieldAlert,
  Accessibility,
  Building2,
  ChevronRight,
  HeartPulse
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const {
    activeTab,
    setActiveTab,
    currentFloor,
    setCurrentFloor,
    allFloors,
    accessibleOnly,
    setAccessibleOnly,
    triggerEmergencyEvacuation
  } = useNavigation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'find-location', label: 'Find Location', icon: Navigation },
    { id: 'map', label: 'Hospital Map', icon: MapIcon },
    { id: 'floor-nav', label: 'Floor Navigation', icon: Layers },
    { id: 'qr-scanner', label: 'QR Scanner', icon: QrCode },
    { id: 'emergency', label: 'Emergency Routes', icon: AlertTriangle, emergency: true },
    { id: 'about', label: 'About Hospital', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-hospital-navy text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <HeartPulse className="w-6 h-6 animate-pulse text-teal-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight flex items-center gap-1.5">
                St. Jude <span className="text-teal-400 font-extrabold">HPNS</span>
              </h1>
              <p className="text-xs text-slate-300 font-medium">Smart Indoor Wayfinding</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Floor Quick Switcher Widget */}
        <div className="px-5 py-3.5 bg-black/20 border-b border-white/5">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-teal-300 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Active Level
            </span>
            <span className="text-slate-400">Level {currentFloor}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-white/5">
            {allFloors.map((fl) => (
              <button
                key={fl.floor_number}
                onClick={() => setCurrentFloor(fl.floor_number)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentFloor === fl.floor_number
                    ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {fl.short_code}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? item.emergency
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 font-semibold'
                    : item.emergency
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive
                        ? item.emergency
                          ? 'text-white'
                          : 'text-slate-950 font-bold'
                        : item.emergency
                        ? 'text-red-400'
                        : 'text-teal-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.emergency && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                )}
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Accessibility & Emergency Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/70 space-y-3">
          {/* Wheelchair Accessible Route Switch */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center space-x-2.5">
              <Accessibility className={`w-4 h-4 ${accessibleOnly ? 'text-teal-300' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-slate-200">Wheelchair Mode</span>
            </div>
            <button
              type="button"
              onClick={() => setAccessibleOnly(!accessibleOnly)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                accessibleOnly ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  accessibleOnly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Emergency Assistance Button */}
          <button
            onClick={() => triggerEmergencyEvacuation('exit')}
            className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-900/50 transition-all uppercase tracking-wide group"
          >
            <ShieldAlert className="w-4 h-4 group-hover:animate-bounce" />
            <span>Emergency Evacuation</span>
          </button>
        </div>
      </aside>
    </>
  );
}

