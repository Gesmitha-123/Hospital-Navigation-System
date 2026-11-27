import React from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  DoorOpen,
  HeartPulse,
  PhoneCall,
  Accessibility,
  ArrowRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function EmergencyView() {
  const {
    triggerEmergencyEvacuation,
    sourceLocation,
    allLocations,
    accessibleOnly,
    setAccessibleOnly,
    setActiveTab
  } = useNavigation();

  const currentLocObj = allLocations.find(l => l.id === sourceLocation) || {
    name: 'Main Entrance Foyer',
    floor: 0
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Urgent Warning Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-red-500/20">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase backdrop-blur-sm">
            <Flame className="w-4 h-4 animate-bounce" />
            <span>Emergency Evacuation Protocol</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-black leading-tight">
            Hospital Emergency & Evacuation Routes
          </h1>

          <p className="text-red-100 text-xs lg:text-sm leading-relaxed">
            In the event of a fire, medical trauma, code red, or structural alert, follow the illuminated exit signs and your generated path immediately.
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-white bg-black/20 p-2.5 rounded-2xl w-fit">
            <MapPin className="w-4 h-4 text-red-300" />
            <span>Current Registered Origin: {currentLocObj.name} (Floor {currentLocObj.floor})</span>
          </div>
        </div>
      </div>

      {/* Immediate Emergency Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nearest Emergency Exit */}
        <div className="bg-white rounded-3xl p-6 border-2 border-red-200 hover:border-red-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Nearest Emergency Fire Exit
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Fastest clear pathway to an external assembly area and fire-rated stairwell.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerEmergencyEvacuation('exit')}
            className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md transition-all uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <span>Evacuate to Nearest Exit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Emergency Room / Trauma Center */}
        <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 hover:border-rose-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Emergency Room (ER) & Trauma
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Direct route to resuscitation rooms, critical care trauma team, and ambulance intake.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerEmergencyEvacuation('er')}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-md transition-all uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <span>Navigate to ER Trauma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Accessible Evacuation */}
        <div className="bg-white rounded-3xl p-6 border-2 border-teal-200 hover:border-teal-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Accessibility className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Barrier-Free Accessible Exit
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Routes via elevators and ground ramp exits only. Completely excludes staircases.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setAccessibleOnly(true);
              triggerEmergencyEvacuation('exit');
            }}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md transition-all uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <span>Accessible Evacuation Route</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Guidelines Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 space-y-4">
        <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>Emergency Guidelines for Patients and Visitors</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Remain Calm & Walk</span>
            </div>
            <p>Do not run or push. Leave personal belongings behind. Follow the illuminated floor pathways.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Listen for Audio PA Broadcasts</span>
            </div>
            <p>Hospital incident commanders issue real-time voice instructions across overhead speaker systems.</p>
          </div>
        </div>

        {/* Emergency Dispatch Hotline */}
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-900 font-bold">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-600" />
            <span>Hospital Emergency Dispatch Hotline: Ext. 911 / (555) 019-9911</span>
          </div>
          <span className="text-[11px] bg-red-200 text-red-800 px-2 py-0.5 rounded-md">24/7 Monitored</span>
        </div>
      </div>
    </div>
  );
}

