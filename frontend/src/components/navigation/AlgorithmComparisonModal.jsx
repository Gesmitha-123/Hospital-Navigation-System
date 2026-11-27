import React from 'react';
import {
  X,
  Cpu,
  Sparkles,
  Layers,
  GitBranch,
  CheckCircle2,
  Clock,
  Footprints,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function AlgorithmComparisonModal() {
  const {
    showCompareModal,
    setShowCompareModal,
    comparisonData,
    setSelectedAlgorithm,
    executeRouteCalculation,
    sourceLocation,
    targetLocation
  } = useNavigation();

  if (!showCompareModal || !comparisonData) return null;

  const handleSelectAndApply = (algoKey) => {
    setSelectedAlgorithm(algoKey);
    setShowCompareModal(false);
    executeRouteCalculation(sourceLocation, targetLocation, algoKey);
  };

  const getAlgoDetails = (name) => {
    if (name.includes('A*')) {
      return {
        key: 'astar',
        icon: Sparkles,
        color: 'teal',
        badge: 'Shortest Distance',
        desc: 'Uses Euclidean 3D spatial heuristic h(n) <= h*(n). Guarantees the absolute shortest physical route in meters.'
      };
    } else if (name.includes('BFS') || name.includes('Breadth')) {
      return {
        key: 'bfs',
        icon: Layers,
        color: 'blue',
        badge: 'Fewest Hallway Hops',
        desc: 'Explores level-by-level uniformly. Finds the route with the fewest corridor transitions and room crossings.'
      };
    } else {
      return {
        key: 'ao_star',
        icon: GitBranch,
        color: 'purple',
        badge: 'Clinical Decomposition',
        desc: 'Solves AND-OR problem reduction. Incorporates mandatory pre-consultation steps (Triage, Registration, Billing).'
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-hospital-navy">
                Multi-Algorithm Performance Benchmark
              </h3>
              <p className="text-xs text-slate-500">
                Live comparison between A*, Breadth-First Search (BFS), and AO* Search.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCompareModal(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonData.map((item, idx) => {
              const meta = getAlgoDetails(item.algorithm);
              const Icon = meta.icon;

              return (
                <div
                  key={idx}
                  className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center">
                        <Icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                        {meta.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-hospital-navy">
                        {item.algorithm}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {meta.desc}
                      </p>
                    </div>

                    {/* Metric Cards */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Footprints className="w-3.5 h-3.5" /> Distance:
                        </span>
                        <span className="font-extrabold text-slate-800">
                          {item.distance_meters} m
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" /> Path Hops:
                        </span>
                        <span className="font-bold text-slate-700">
                          {item.hops} segments
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> Nodes Explored:
                        </span>
                        <span className="font-bold text-slate-700">
                          {item.nodes_explored} nodes
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Execution Time:
                        </span>
                        <span className="font-bold text-teal-700">
                          {item.execution_time_ms} ms
                        </span>
                      </div>
                    </div>

                    {/* AO* Specific Clinical Milestones */}
                    {item.is_decomposed && item.milestones?.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">
                          Prerequisite Checkpoints:
                        </div>
                        <div className="space-y-1">
                          {item.milestones.map((m, mIdx) => (
                            <div key={mIdx} className="text-[11px] text-purple-900 bg-purple-50 p-1.5 rounded-lg font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-purple-600 flex-shrink-0" />
                              <span>{m.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelectAndApply(meta.key)}
                    className="mt-5 w-full py-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-800 text-xs font-bold rounded-xl shadow-2xs transition-all text-center"
                  >
                    Select {item.algorithm.split(' ')[0]}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Academic / Demonstration Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-hospital-navy">Academic Evaluation Summary: </span>
              A* is ideal for minimizing walking distance using spatial Euclidean heuristics. BFS minimizes the number of corridor transitions and turns. AO* handles composite clinical goals where visiting a medical specialist requires prior triage registration or token verification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

