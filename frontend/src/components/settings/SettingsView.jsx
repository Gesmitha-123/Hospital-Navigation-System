import React, { useState, useEffect } from 'react';
import {
  Settings,
  Accessibility,
  Volume2,
  VolumeX,
  Sparkles,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Sliders,
  Footprints
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import * as api from '../../services/api';

export default function SettingsView() {
  const {
    accessibleOnly,
    setAccessibleOnly,
    selectedAlgorithm,
    setSelectedAlgorithm,
    voiceGuidanceEnabled,
    setVoiceGuidanceEnabled,
    highContrast,
    setHighContrast,
    showToast
  } = useNavigation();

  const [walkingSpeed, setWalkingSpeed] = useState('normal'); // 'slow' | 'normal' | 'brisk'
  const [backendHealth, setBackendHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [pingMs, setPingMs] = useState(null);

  const checkHealth = async () => {
    setCheckingHealth(true);
    const start = performance.now();
    try {
      const data = await api.checkBackendHealth();
      const latency = Math.round(performance.now() - start);
      setBackendHealth(data);
      setPingMs(latency);
    } catch (err) {
      setBackendHealth({ status: 'unhealthy', error: err.message });
      setPingMs(null);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
        <h2 className="text-xl font-bold text-hospital-navy flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600" />
          <span>Navigation System Settings & Preferences</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Customize indoor wayfinding accessibility, turn audio guidance on/off, and verify backend connection status.
        </p>
      </div>

      {/* Accessibility Preferences */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
        <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-teal-600" />
          <span>Accessibility & Wayfinding Mode</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {/* Wheelchair Accessible Mode */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-800">Wheelchair-Accessible Routes Only</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Automatically avoids staircases, escalators, and steep connections. Forces elevator paths.
              </div>
            </div>
            <button
              onClick={() => {
                setAccessibleOnly(!accessibleOnly);
                showToast(`Wheelchair mode ${!accessibleOnly ? 'enabled' : 'disabled'}`, 'info');
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                accessibleOnly ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  accessibleOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Guidance / Audio Readout */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-800">Spoken Voice Guidance (Text-to-Speech)</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Speaks turn-by-turn navigation instructions aloud when walking through AR steps.
              </div>
            </div>
            <button
              onClick={() => {
                setVoiceGuidanceEnabled(!voiceGuidanceEnabled);
                showToast(`Voice guidance ${!voiceGuidanceEnabled ? 'enabled' : 'disabled'}`, 'info');
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                voiceGuidanceEnabled ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  voiceGuidanceEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Walking Pace Profile */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-800">Estimated Walking Pace</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Adjusts estimated walking times based on physical mobility.
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {['slow', 'normal', 'brisk'].map((p) => (
                <button
                  key={p}
                  onClick={() => setWalkingSpeed(p)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    walkingSpeed === p
                      ? 'bg-hospital-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pathfinding Algorithm Default */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
        <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-600" />
          <span>Default Pathfinding Algorithm</span>
        </h3>
        <p className="text-xs text-slate-500">
          Choose the default heuristic engine used when calculating routes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'astar', name: 'A* Algorithm', label: 'Optimal Euclidean Distance' },
            { id: 'bfs', name: 'Breadth-First Search', label: 'Minimal Edge Hops' },
            { id: 'ao_star', name: 'AO* Search', label: 'Clinical Prerequisite Decomposition' }
          ].map((algo) => (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgorithm(algo.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedAlgorithm === algo.id
                  ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-sm text-hospital-navy">{algo.name}</div>
              <div className="text-[11px] text-slate-500 mt-1">{algo.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Backend & Database Diagnostics */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-600" />
            <span>FastAPI & Database Diagnostics</span>
          </h3>
          <button
            onClick={checkHealth}
            disabled={checkingHealth}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-400 font-semibold">FastAPI Engine</div>
            <div className="font-bold text-sm text-green-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{backendHealth?.status === 'healthy' ? 'Online & Healthy' : 'Checking...'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-400 font-semibold">Database Storage</div>
            <div className="font-bold text-sm text-hospital-navy flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-600" />
              <span>{backendHealth?.database || 'hospital_nav (PostgreSQL / SQLite)'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-400 font-semibold">API Latency</div>
            <div className="font-bold text-sm text-teal-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-teal-600" />
              <span>{pingMs !== null ? `${pingMs} ms` : 'Testing...'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

