import React from 'react';
import {
  Layers,
  Building,
  ArrowRight,
  Accessibility,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  Footprints
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function MultiFloorGuide() {
  const {
    allFloors,
    currentFloor,
    setCurrentFloor,
    currentRoute,
    setActiveTab,
    accessibleOnly
  } = useNavigation();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-hospital-navy flex items-center gap-2">
              <Layers className="w-6 h-6 text-teal-600" />
              <span>Multi-Floor Navigation Center</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Transfer between Ground, First, and Second Floors using elevators and stairwells.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('map')}
            className="px-4 py-2 bg-hospital-navy text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-all"
          >
            Open Interactive Map
          </button>
        </div>

        {/* Floor Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {allFloors.map((fl) => (
            <div
              key={fl.floor_number}
              onClick={() => setCurrentFloor(fl.floor_number)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                currentFloor === fl.floor_number
                  ? 'border-teal-500 bg-teal-50/60 shadow-md ring-2 ring-teal-200'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  {fl.short_code}
                </span>
                {currentFloor === fl.floor_number && (
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                    ● Active View
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-hospital-navy mt-3">
                {fl.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                {fl.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Floor Active Route Breakdown */}
      {currentRoute ? (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-hospital-navy">
              Current Route Multi-Floor Breakdown
            </h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl">
              {currentRoute.is_multi_floor ? 'Multi-Floor Route' : 'Single Floor Route'}
            </span>
          </div>

          {/* Floor Transitions Alerts */}
          {currentRoute.floor_transitions && currentRoute.floor_transitions.length > 0 ? (
            <div className="space-y-3">
              {currentRoute.floor_transitions.map((trans, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                        Floor Transition Point #{idx + 1}
                      </div>
                      <div className="text-sm font-bold text-amber-950">
                        {trans.facility}: Transfer from Level {trans.from_floor} to Level {trans.to_floor}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentFloor(trans.to_floor);
                      setActiveTab('map');
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Switch to Floor {trans.to_floor}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              This navigation journey takes place entirely on Level {currentFloor}. No elevator or stair transfer needed.
            </div>
          )}

          {/* Vertical Transit Amenities Comparison */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-sm text-hospital-navy mb-3">
              Vertical Transit Amenities in Hospital
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>Elevator Banks (Lifts A & B)</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Dual high-capacity medical bed and passenger elevators with automated voice announcements and low-reach braille buttons.
                </p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold text-[10px]">
                  Wheelchair Accessible
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>Staircases (Stairs 1 & 2)</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Direct fire exit stairwells with continuous anti-slip nosing and dual handrails. Ideal for quick active visitor transit.
                </p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px]">
                  Excluded in Wheelchair Mode
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/90 text-slate-500 space-y-3">
          <Footprints className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold">No active route selected.</p>
          <button
            onClick={() => setActiveTab('find-location')}
            className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
          >
            Plan a Route
          </button>
        </div>
      )}
    </div>
  );
}

