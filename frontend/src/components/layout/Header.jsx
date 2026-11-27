import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Accessibility,
  Building2,
  AlertOctagon,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function Header({ setMobileOpen }) {
  const {
    currentFloor,
    setCurrentFloor,
    allFloors,
    accessibleOnly,
    setAccessibleOnly,
    allLocations,
    navigateToLocation,
    triggerEmergencyEvacuation
  } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = searchQuery.trim()
    ? allLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.room_number?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelectLocation = (loc) => {
    setSearchQuery('');
    setDropdownOpen(false);
    navigateToLocation(loc.id);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu button & brand badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Campus Navigation Active</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Where would you like to go? (e.g. Cardiology, Dr. Sarah, X-Ray, ICU)"
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-xl border border-transparent focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {dropdownOpen && filteredLocations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
                Matching Hospital Destinations
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full text-left p-3 hover:bg-teal-50/60 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100/60 text-teal-700 flex items-center justify-center font-bold text-xs group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-teal-900">
                          {loc.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>{loc.department || 'Facility'}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-600">Floor {loc.floor}</span>
                          {loc.room_number && (
                            <>
                              <span>•</span>
                              <span>Room {loc.room_number}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wheelchair Accessible quick toggle */}
          <button
            onClick={() => setAccessibleOnly(!accessibleOnly)}
            title={accessibleOnly ? "Wheelchair mode ON (stairs excluded)" : "Wheelchair mode OFF"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              accessibleOnly
                ? 'bg-teal-50 text-teal-700 border-teal-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200/70'
            }`}
          >
            <Accessibility className={`w-4 h-4 ${accessibleOnly ? 'text-teal-600' : 'text-slate-500'}`} />
            <span className="hidden md:inline">
              {accessibleOnly ? 'Wheelchair Friendly' : 'Standard Route'}
            </span>
          </button>

          {/* Floor selector pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            {allFloors.map((fl) => (
              <button
                key={fl.floor_number}
                onClick={() => setCurrentFloor(fl.floor_number)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentFloor === fl.floor_number
                    ? 'bg-hospital-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fl.short_code}
              </button>
            ))}
          </div>

          {/* Quick SOS Emergency Hotline Button */}
          <button
            onClick={() => triggerEmergencyEvacuation('er')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all shadow-xs"
            title="Immediate Medical Emergency Assistance"
          >
            <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="hidden sm:inline">Emergency ER</span>
          </button>
        </div>
      </div>
    </header>
  );
}

