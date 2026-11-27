import React from 'react';
import {
  Navigation,
  MapPin,
  ArrowRight,
  Accessibility,
  Compass,
  Cpu,
  GitBranch,
  Layers,
  Clock,
  Footprints,
  Sparkles,
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  CornerUpRight,
  CornerUpLeft,
  Building,
  CheckCircle2,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function RoutePlanner() {
  const {
    sourceLocation,
    setSourceLocation,
    targetLocation,
    setTargetLocation,
    selectedAlgorithm,
    setSelectedAlgorithm,
    accessibleOnly,
    setAccessibleOnly,
    allLocations,
    currentRoute,
    isCalculating,
    routeError,
    executeRouteCalculation,
    executeAlgorithmComparison,
    isComparing,
    setArModeActive,
    activeStepIndex,
    setActiveStepIndex,
    speakInstruction,
    setCurrentFloor,
    setActiveTab
  } = useNavigation();

  const handleSwap = () => {
    const temp = sourceLocation;
    setSourceLocation(targetLocation);
    setTargetLocation(temp);
    if (targetLocation && temp) {
      executeRouteCalculation(targetLocation, temp);
    }
  };

  const getStepIcon = (direction) => {
    switch (direction) {
      case 'straight':
        return <ArrowUp className="w-5 h-5 text-teal-600" />;
      case 'slight_right':
      case 'turn_right':
      case 'sharp_right':
        return <CornerUpRight className="w-5 h-5 text-teal-600" />;
      case 'slight_left':
      case 'turn_left':
      case 'sharp_left':
        return <CornerUpLeft className="w-5 h-5 text-teal-600" />;
      case 'elevator_up':
      case 'elevator_down':
        return <Building className="w-5 h-5 text-amber-600" />;
      case 'stairs_up':
      case 'stairs_down':
        return <Layers className="w-5 h-5 text-slate-600" />;
      case 'destination':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <MapPin className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Route Configuration Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-hospital-navy flex items-center gap-2">
              <Navigation className="w-6 h-6 text-teal-600" />
              <span>Hospital Route Finder</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Calculate the most suitable, shortest, or accessible indoor pathway.
            </p>
          </div>

          {/* Wheelchair Mode Toggle */}
          <button
            onClick={() => setAccessibleOnly(!accessibleOnly)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              accessibleOnly
                ? 'bg-teal-50 text-teal-700 border-teal-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
            }`}
          >
            <Accessibility className={`w-4 h-4 ${accessibleOnly ? 'text-teal-600' : 'text-slate-500'}`} />
            <span>Wheelchair Route (Avoid Stairs)</span>
          </button>
        </div>

        {/* Source and Destination Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Source Location */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Starting Location
            </label>
            <select
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            >
              <optgroup label="Ground Floor (Level 0)">
                {allLocations.filter(l => l.floor === 0).map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.room_number ? `(${loc.room_number})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="First Floor (Level 1)">
                {allLocations.filter(l => l.floor === 1).map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.room_number ? `(${loc.room_number})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Second Floor (Level 2)">
                {allLocations.filter(l => l.floor === 2).map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.room_number ? `(${loc.room_number})` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center pt-5">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-600 border border-slate-200 shadow-xs transition-all transform hover:rotate-180"
              title="Swap Start and Destination"
            >
              <ArrowRight className="w-4 h-4 md:rotate-90" />
            </button>
          </div>

          {/* Destination Location */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Destination
            </label>
            <select
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            >
              <optgroup label="Ground Floor (Level 0)">
                {allLocations.filter(l => l.floor === 0).map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.room_number ? `(${loc.room_number})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="First Floor (Level 1)">
                {allLocations.filter(l => l.floor === 1).map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.room_number ? `(${loc.room_number})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Second Floor (Level 2)">
                {allLocations.filter(l => l.floor === 2).map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.room_number ? `(${loc.room_number})` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Algorithm Selection Segmented Control */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Navigation Algorithm
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <button
              onClick={() => setSelectedAlgorithm('astar')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedAlgorithm === 'astar'
                  ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-hospital-navy flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" /> A* Algorithm
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Optimal Distance
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Euclidean spatial heuristic h(n) for shortest physical path.
              </p>
            </button>

            <button
              onClick={() => setSelectedAlgorithm('bfs')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedAlgorithm === 'bfs'
                  ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-hospital-navy flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" /> BFS Search
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Fewest Hops
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Traverses level-by-level to minimize hallway turns and stops.
              </p>
            </button>

            <button
              onClick={() => setSelectedAlgorithm('ao_star')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedAlgorithm === 'ao_star'
                  ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-hospital-navy flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-teal-600" /> AO* Search
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Clinical AND-OR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                AND-OR decomposition for triage, tokens, and registration checkpoints.
              </p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => executeAlgorithmComparison()}
            disabled={isComparing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>{isComparing ? 'Comparing...' : 'Compare All 3 Algorithms'}</span>
          </button>

          <button
            onClick={() => executeRouteCalculation()}
            disabled={isCalculating}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-bold shadow-lg shadow-teal-600/30 transition-all flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>{isCalculating ? 'Computing Route...' : 'Find Route'}</span>
          </button>
        </div>
      </div>

      {/* Route Error Display */}
      {routeError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{routeError}</span>
        </div>
      )}

      {/* Generated Route Details and Turn-by-Turn Card */}
      {currentRoute && currentRoute.success && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-6">
          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5" /> Total Distance
              </div>
              <div className="text-lg font-extrabold text-hospital-navy">
                {currentRoute.total_distance_meters} m
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Walking Time
              </div>
              <div className="text-lg font-extrabold text-teal-700">
                {currentRoute.estimated_walking_time}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Hallway Hops
              </div>
              <div className="text-lg font-extrabold text-hospital-navy">
                {currentRoute.total_hops} segments
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Runtime
              </div>
              <div className="text-lg font-extrabold text-slate-700">
                {currentRoute.algorithm_stats?.execution_time_ms} ms
              </div>
            </div>
          </div>

          {/* AO* Milestones Banner if applicable */}
          {currentRoute.algorithm_stats?.and_or_decomposition?.is_decomposed && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-purple-600" />
                AO* Clinical Workflow Decomposition
              </h4>
              <p className="text-xs text-purple-700 mb-3">
                This consultation requires clinical milestones before arriving at the department.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {currentRoute.algorithm_stats.and_or_decomposition.milestones.map((ms, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold text-purple-900 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{ms.label}</span>
                    <span className="text-[10px] text-purple-500 font-normal">({ms.name})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start AR Experience & View on Map controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-hospital-navy to-slate-900 text-white">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-400 animate-spin" />
                <span>Simulated AR Camera Wayfinding</span>
              </h3>
              <p className="text-xs text-slate-300">
                Overlay directional arrows and guidance right on your camera feed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('map');
                  if (currentRoute.source?.floor !== undefined) {
                    setCurrentFloor(currentRoute.source.floor);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                View on 2D Map
              </button>
              <button
                onClick={() => setArModeActive(true)}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2"
              >
                <span>Launch AR View</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Turn-by-Turn Instruction Sequence */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-hospital-navy flex items-center gap-2">
                <span>Step-by-Step Walking Directions</span>
                <span className="text-xs font-normal text-slate-500">
                  ({currentRoute.steps?.length || 0} steps)
                </span>
              </h3>
            </div>

            <div className="space-y-3">
              {currentRoute.steps?.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    speakInstruction(step.instruction);
                    if (step.floor !== undefined) {
                      setCurrentFloor(step.floor);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    activeStepIndex === idx
                      ? 'border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-200'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        step.direction === 'destination'
                          ? 'bg-green-100 text-green-700'
                          : step.is_transition
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-800'
                      }`}
                    >
                      {getStepIcon(step.direction)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                        <span>Step {step.step_number}</span>
                        <span>•</span>
                        <span>Floor {step.floor}</span>
                        {step.distance_meters > 0 && (
                          <>
                            <span>•</span>
                            <span>{step.distance_meters.toFixed(1)} m</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-teal-900">
                        {step.instruction}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakInstruction(step.instruction);
                    }}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                    title="Read Instruction Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

