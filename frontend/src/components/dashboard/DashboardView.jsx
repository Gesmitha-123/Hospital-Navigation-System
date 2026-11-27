import React, { useState } from 'react';
import {
  Navigation,
  Search,
  Building2,
  Users,
  Layers,
  ShieldAlert,
  MapPin,
  Clock,
  ArrowRight,
  Flame,
  Stethoscope,
  Pill,
  Microscope,
  Utensils,
  Coffee,
  CheckCircle2,
  Sparkles,
  Accessibility,
  Compass
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function DashboardView() {
  const {
    summaryStats,
    allFloors,
    recentDestinations,
    navigateToLocation,
    triggerEmergencyEvacuation,
    setCurrentFloor,
    setActiveTab,
    allLocations
  } = useNavigation();

  const [dashboardSearch, setDashboardSearch] = useState('');

  // Quick Facilities Navigation Cards
  const quickActions = [
    {
      id: 'g_er',
      title: 'Emergency Trauma',
      subtitle: '24/7 Acute Care',
      floor: 0,
      icon: Flame,
      color: 'bg-red-500 text-white',
      badge: 'Urgent'
    },
    {
      id: 'g_pharmacy',
      title: 'Central Pharmacy',
      subtitle: 'Prescription Refills',
      floor: 0,
      icon: Pill,
      color: 'bg-emerald-500 text-white',
      badge: 'Open 24/7'
    },
    {
      id: 'g_reception',
      title: 'Main Reception',
      subtitle: 'Registration & Tokens',
      floor: 0,
      icon: Users,
      color: 'bg-sky-500 text-white',
      badge: 'GF Foyer'
    },
    {
      id: 'f1_cardio',
      title: 'Cardiology Dept',
      subtitle: 'Heart OPD & ECG',
      floor: 1,
      icon: Stethoscope,
      color: 'bg-teal-600 text-white',
      badge: 'Room 102'
    },
    {
      id: 'f1_lab',
      title: 'Pathology Lab',
      subtitle: 'Blood Samples & Tests',
      floor: 1,
      icon: Microscope,
      color: 'bg-purple-600 text-white',
      badge: 'Room 110'
    },
    {
      id: 'g_cafeteria',
      title: 'Garden Cafeteria',
      subtitle: 'Meals & Coffee',
      floor: 0,
      icon: Coffee,
      color: 'bg-amber-500 text-white',
      badge: 'East Wing'
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!dashboardSearch.trim()) return;
    const match = allLocations.find(l =>
      l.name.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
      l.department?.toLowerCase().includes(dashboardSearch.toLowerCase())
    );
    if (match) {
      navigateToLocation(match.id);
    } else {
      setActiveTab('find-location');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-hospital-navy via-slate-900 to-teal-900 text-white p-8 lg:p-10 shadow-xl border border-white/10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Hospital Indoor Wayfinding</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Welcome to St. Jude Memorial Hospital
          </h1>

          <p className="text-slate-300 text-sm lg:text-base leading-relaxed font-normal">
            Find your way easily to departments, consultation clinics, laboratories, inpatient wards, and emergency facilities with smart multi-floor wayfinding.
          </p>

          {/* Quick Hero Search */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center max-w-lg">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                placeholder="Where would you like to go? (e.g. Cardiology, X-Ray)"
                className="w-full pl-12 pr-28 py-3.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 rounded-2xl border border-white/20 focus:border-teal-400 focus:outline-none transition-all placeholder:text-slate-400 text-sm font-medium shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Go
              </button>
            </div>
          </form>
        </div>

        {/* Decorative Watermark Graphics */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Building2 className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Hospital Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
              Full Map
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-hospital-navy">
              {summaryStats?.total_floors || 3} Levels
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              Ground, 1st & 2nd Floors
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5 text-sky-600" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full">
              Specialties
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-hospital-navy">
              {summaryStats?.total_departments || 14} Departments
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              Clinical & Diagnostic Wings
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
              Indoor POIs
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-hospital-navy">
              {summaryStats?.total_locations || 30}+ Rooms
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              Lifts, Rooms & Corridors
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Accessibility className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              100% Barrier-Free
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-hospital-navy">
              Wheelchair Ready
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              Dual Lifts & Ramp Corridors
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-hospital-navy flex items-center gap-2">
            <Navigation className="w-5 h-5 text-teal-600" />
            <span>Quick Facilities Navigation</span>
          </h2>
          <button
            onClick={() => setActiveTab('map')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>Explore Full Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => navigateToLocation(action.id)}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${action.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                      <span>Floor {action.floor}</span>
                      <span>•</span>
                      <span>{action.badge}</span>
                    </div>
                    <div className="text-base font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                      {action.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {action.subtitle}
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-teal-50 text-slate-400 group-hover:text-teal-600 flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floor Overview Selector Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-hospital-navy flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-600" />
          <span>Hospital Multi-Floor Overview</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allFloors.map((floor) => (
            <div
              key={floor.floor_number}
              onClick={() => {
                setCurrentFloor(floor.floor_number);
                setActiveTab('map');
              }}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
                  Level {floor.floor_number}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {floor.location_count || 10} Locations
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-hospital-navy group-hover:text-teal-700 transition-colors">
                {floor.name}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {floor.description}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>View Floor Blueprint</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Destinations and Emergency Evacuation Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Destinations */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Recent & Popular Destinations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => navigateToLocation(dest.id)}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-teal-50/60 border border-slate-200/70 hover:border-teal-300 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-teal-900">
                    {dest.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {dest.department || 'Clinical Unit'} • Floor {dest.floor}
                  </div>
                </div>
                <Navigation className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Assistance Card */}
        <div className="bg-red-500 rounded-3xl p-6 text-white shadow-xl shadow-red-500/20 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span className="font-extrabold text-sm uppercase tracking-wider">
                Emergency Assistance
              </span>
            </div>
            <h3 className="text-xl font-black leading-tight">
              Instant Evacuation & Trauma Routing
            </h3>
            <p className="text-xs text-red-100 leading-relaxed">
              Find nearest fire exits, acute trauma resuscitation bays, or defibrillators immediately.
            </p>
          </div>

          <button
            onClick={() => triggerEmergencyEvacuation('exit')}
            className="w-full py-3 bg-white hover:bg-red-50 text-red-600 text-xs font-black rounded-xl shadow-md uppercase tracking-wider transition-all"
          >
            Find Nearest Emergency Exit
          </button>
        </div>
      </div>
    </div>
  );
}

