import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Camera,
  MapPin,
  CheckCircle2,
  Navigation,
  Printer,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import * as api from '../../services/api';

export default function QRScannerView() {
  const {
    handleQRScan,
    sourceLocation,
    setSourceLocation,
    targetLocation,
    executeRouteCalculation,
    setActiveTab,
    allLocations
  } = useNavigation();

  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('simulate'); // 'simulate' | 'camera' | 'printable'
  const [scannedResult, setScannedResult] = useState(null);

  // Load registered checkpoints
  useEffect(() => {
    api.fetchQRCheckpoints()
      .then(setCheckpoints)
      .catch(console.error);
  }, []);

  const handleSimulateScan = async (code) => {
    const res = await handleQRScan(code);
    if (res) {
      setScannedResult(res);
    }
  };

  const handleNavigateFromScanned = (targetId) => {
    if (scannedResult?.current_location?.id) {
      setSourceLocation(scannedResult.current_location.id);
      executeRouteCalculation(scannedResult.current_location.id, targetId);
      setActiveTab('map');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-hospital-navy flex items-center gap-2">
              <QrCode className="w-6 h-6 text-teal-600" />
              <span>QR Code Indoor Positioning</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Scan physical QR stickers installed across walls, lift banks, and clinics to pinpoint your location instantly.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('simulate')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'simulate'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulate Scan
            </button>
            <button
              onClick={() => setActiveSubTab('printable')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'printable'
                  ? 'bg-hospital-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Printable Badges
            </button>
          </div>
        </div>
      </div>

      {/* Subtab: Simulate Scan */}
      {activeSubTab === 'simulate' && (
        <div className="space-y-6">
          {/* Checkpoints Grid */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Physical Checkpoint QR Stickers (Tap to Simulate Scan)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {checkpoints.map((cp) => (
                <div
                  key={cp.code}
                  onClick={() => handleSimulateScan(cp.code)}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer group flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-teal-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                    <QrCode className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">
                      {cp.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {cp.location_name} • Floor {cp.floor}
                    </div>
                    <div className="text-[10px] text-teal-600 font-semibold mt-2 flex items-center gap-1">
                      <span>Simulate Scan</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scanned Location Result Card */}
          {scannedResult && (
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-teal-500 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                      Position Located Successfully
                    </div>
                    <h3 className="text-lg font-black text-hospital-navy">
                      You are at: {scannedResult.current_location?.name}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Floor {scannedResult.current_location?.floor}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                {scannedResult.instruction_tip || 'Your current location has been updated in the navigation engine.'}
              </p>

              {/* Suggested Destinations from this location */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Suggested Destinations from this Checkpoint:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scannedResult.suggested_destinations?.map((sug) => (
                    <button
                      key={sug.id}
                      onClick={() => handleNavigateFromScanned(sug.id)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-left transition-all flex items-center justify-between group"
                    >
                      <span className="text-xs font-bold text-slate-800 group-hover:text-teal-900">
                        {sug.name}
                      </span>
                      <Navigation className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab: Printable Badges */}
      {activeSubTab === 'printable' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-6">
          <div>
            <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
              <Printer className="w-5 h-5 text-teal-600" />
              <span>Hospital Physical QR Code Badges</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Printable QR codes ready to stick on hallway pillars, doorplates, and information desks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {checkpoints.map((cp) => (
              <div
                key={cp.code}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col items-center text-center space-y-3"
              >
                <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200">
                  <img
                    src={`/api/qr/image/${cp.code}`}
                    alt={cp.label}
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm text-hospital-navy">{cp.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{cp.location_name} (Floor {cp.floor})</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">{cp.code}</div>
                </div>

                <a
                  href={`/api/qr/image/${cp.code}`}
                  download={`${cp.code}.png`}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

