import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentFloor, setCurrentFloor] = useState(0);
  const [sourceLocation, setSourceLocation] = useState('g_entrance');
  const [targetLocation, setTargetLocation] = useState('f1_cardio');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('astar');
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  const [allFloors, setAllFloors] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  const [currentRoute, setCurrentRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeError, setRouteError] = useState(null);

  const [comparisonData, setComparisonData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [arModeActive, setArModeActive] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const [recentDestinations, setRecentDestinations] = useState([
    { id: 'f1_cardio', name: 'Cardiology Department', floor: 1, department: 'Cardiology' },
    { id: 'g_pharmacy', name: 'Central Pharmacy', floor: 0, department: 'Pharmacy Services' },
    { id: 'g_er', name: 'Emergency Room & Trauma', floor: 0, department: 'Emergency Medicine' },
    { id: 'g_radiology', name: 'Radiology & Imaging', floor: 0, department: 'Medical Imaging' }
  ]);

  const [toast, setToast] = useState(null);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);

  // Show auto-dismissing toast notifications
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial Data Fetch
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [floors, locations, categories, summary, graph] = await Promise.all([
          api.fetchFloors(),
          api.fetchLocations(),
          api.fetchCategories(),
          api.fetchFacilitiesSummary(),
          api.fetchGraph()
        ]);
        setAllFloors(floors);
        setAllLocations(locations);
        setAllCategories(categories);
        setSummaryStats(summary);
        setGraphData(graph);
      } catch (err) {
        console.error('Failed to load hospital data:', err);
        showToast('Unable to connect to hospital navigation server.', 'error');
      }
    }
    loadInitialData();
  }, []);

  // Calculate Route handler
  const executeRouteCalculation = async (src = sourceLocation, tgt = targetLocation, algo = selectedAlgorithm, accessible = accessibleOnly) => {
    if (!src || !tgt) {
      showToast('Please select both starting point and destination.', 'warning');
      return null;
    }
    if (src === tgt) {
      showToast('Starting point and destination are the same location.', 'info');
      return null;
    }

    setIsCalculating(true);
    setRouteError(null);

    try {
      const result = await api.calculateRoute({
        sourceId: src,
        targetId: tgt,
        algorithm: algo,
        accessibleOnly: accessible
      });

      if (!result.success) {
        setRouteError(result.error || 'No valid path found.');
        showToast(result.error || 'Route calculation failed.', 'error');
        setCurrentRoute(null);
        return null;
      }

      setCurrentRoute(result);
      setActiveStepIndex(0);

      // Auto-set the map floor to the starting floor
      if (result.source && result.source.floor !== undefined) {
        setCurrentFloor(result.source.floor);
      }

      // Record in recent destinations
      if (result.destination) {
        setRecentDestinations(prev => {
          const filtered = prev.filter(item => item.id !== result.destination.id);
          const tgtNode = allLocations.find(l => l.id === result.destination.id);
          return [
            {
              id: result.destination.id,
              name: result.destination.name,
              floor: result.destination.floor,
              department: tgtNode?.department || ''
            },
            ...filtered.slice(0, 4)
          ];
        });
      }

      showToast(`Route generated via ${result.algorithm} (${result.total_distance_meters}m, ${result.estimated_walking_time})`, 'success');
      return result;
    } catch (err) {
      console.error('Route error:', err);
      const msg = err.message || 'Route calculation error';
      setRouteError(msg);
      showToast(msg, 'error');
      setCurrentRoute(null);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  // Compare all algorithms simultaneously
  const executeAlgorithmComparison = async (src = sourceLocation, tgt = targetLocation, accessible = accessibleOnly) => {
    setIsComparing(true);
    try {
      const data = await api.compareAlgorithms({
        sourceId: src,
        targetId: tgt,
        accessibleOnly: accessible
      });
      setComparisonData(data.comparison);
      setShowCompareModal(true);
    } catch (err) {
      console.error('Comparison error:', err);
      showToast('Failed to compare algorithms: ' + err.message, 'error');
    } finally {
      setIsComparing(false);
    }
  };

  // Direct 1-Click Quick Navigate to any location
  const navigateToLocation = async (targetId) => {
    setTargetLocation(targetId);
    setActiveTab('find-location');
    await executeRouteCalculation(sourceLocation, targetId, selectedAlgorithm, accessibleOnly);
  };

  // Trigger Emergency Evacuation
  const triggerEmergencyEvacuation = async (targetType = 'exit') => {
    try {
      setIsCalculating(true);
      const res = await api.fetchNearestEmergency({
        currentLocationId: sourceLocation || 'g_entrance',
        targetType,
        accessibleOnly
      });

      // Format as standard route object
      const emergencyRoute = {
        success: true,
        algorithm: 'Emergency A* (Evacuation Protocol)',
        is_emergency: true,
        source: {
          id: sourceLocation,
          name: allLocations.find(l => l.id === sourceLocation)?.name || 'Current Location',
          floor: currentFloor
        },
        destination: res.target,
        total_distance_meters: res.distance_meters,
        total_hops: res.path.length - 1,
        estimated_walking_time: res.estimated_time,
        estimated_seconds: res.estimated_seconds,
        is_accessible: accessibleOnly,
        is_multi_floor: res.floor_transitions.length > 0,
        floors_involved: [...new Set(res.path_nodes.map(n => n.floor))],
        path_node_ids: res.path,
        path_nodes: res.path_nodes,
        steps: res.steps,
        floor_transitions: res.floor_transitions,
        algorithm_stats: {
          name: 'Emergency Priority Routing',
          nodes_visited_count: res.path.length,
          execution_time_ms: 0.1
        }
      };

      setCurrentRoute(emergencyRoute);
      setTargetLocation(res.target.id);
      setActiveStepIndex(0);
      setActiveTab('map');
      showToast(`EMERGENCY: Fastest evacuation route to ${res.target.name} highlighted!`, 'emergency');
    } catch (err) {
      console.error('Emergency route error:', err);
      showToast('Failed to generate emergency evacuation route.', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  // QR Scan handler
  const handleQRScan = async (code) => {
    try {
      const res = await api.scanQRCode(code);
      if (res.success && res.current_location) {
        setSourceLocation(res.current_location.id);
        setCurrentFloor(res.current_location.floor);
        showToast(`Position located: ${res.current_location.name} (${res.checkpoint_label})`, 'success');
        return res;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    }
  };

  // Speech guidance
  const speakInstruction = (text) => {
    if (!voiceGuidanceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <NavigationContext.Provider
      value={{
        activeTab, setActiveTab,
        currentFloor, setCurrentFloor,
        sourceLocation, setSourceLocation,
        targetLocation, setTargetLocation,
        selectedAlgorithm, setSelectedAlgorithm,
        accessibleOnly, setAccessibleOnly,
        allFloors, allLocations, allCategories,
        summaryStats, graphData,
        currentRoute, setCurrentRoute,
        isCalculating, routeError,
        executeRouteCalculation,
        comparisonData, isComparing, showCompareModal, setShowCompareModal,
        executeAlgorithmComparison,
        navigateToLocation,
        triggerEmergencyEvacuation,
        handleQRScan,
        arModeActive, setArModeActive,
        activeStepIndex, setActiveStepIndex,
        recentDestinations,
        toast, showToast,
        highContrast, setHighContrast,
        voiceGuidanceEnabled, setVoiceGuidanceEnabled,
        speakInstruction
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

