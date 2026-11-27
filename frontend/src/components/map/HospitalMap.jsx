import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Compass,
  Layers,
  MapPin,
  Eye,
  EyeOff,
  Accessibility,
  ArrowRight,
  Flame,
  Stethoscope,
  Clock,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function HospitalMap() {
  const {
    currentFloor,
    setCurrentFloor,
    allFloors,
    allLocations,
    graphData,
    currentRoute,
    sourceLocation,
    setSourceLocation,
    targetLocation,
    setTargetLocation,
    executeRouteCalculation,
    accessibleOnly,
    setActiveTab,
    setArModeActive
  } = useNavigation();

  // Map Pan and Zoom State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer Toggles
  const [showRoomLabels, setShowRoomLabels] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);

  // Selected Node Modal / Popover
  const [selectedNode, setSelectedNode] = useState(null);

  const containerRef = useRef(null);

  // Filter nodes for the current floor
  const floorNodes = allLocations.filter((node) => node.floor === currentFloor);

  // Filter edges that connect nodes on this floor
  const floorNodeIds = new Set(floorNodes.map((n) => n.id));
  const floorEdges = (graphData.edges || []).filter(
    (e) => floorNodeIds.has(e.source) && floorNodeIds.has(e.target)
  );

  // Extract Route points relevant to the current floor
  let routePointsOnFloor = [];
  let routeFloorSegments = [];

  if (currentRoute && currentRoute.path_nodes) {
    routePointsOnFloor = currentRoute.path_nodes.filter((n) => n.floor === currentFloor);

    // Build segments where both consecutive nodes are on this floor
    for (let i = 0; i < currentRoute.path_nodes.length - 1; i++) {
      const u = currentRoute.path_nodes[i];
      const v = currentRoute.path_nodes[i + 1];
      if (u.floor === currentFloor && v.floor === currentFloor) {
        routeFloorSegments.push({ from: u, to: v });
      }
    }
  }

  // Pan Handlers
  const handleMouseDown = (e) => {
    // Only drag with left mouse button
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setScale((prevScale) => Math.min(Math.max(prevScale * zoomFactor, 0.6), 3.0));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Node Click handler
  const handleNodeClick = (node, e) => {
    e.stopPropagation();
    setSelectedNode(node);
  };

  // Quick Action from Node Popover
  const handleSetStart = (nodeId) => {
    setSourceLocation(nodeId);
    if (targetLocation && targetLocation !== nodeId) {
      executeRouteCalculation(nodeId, targetLocation);
    }
    setSelectedNode(null);
  };

  const handleSetDestination = (nodeId) => {
    setTargetLocation(nodeId);
    if (sourceLocation && sourceLocation !== nodeId) {
      executeRouteCalculation(sourceLocation, nodeId);
    }
    setSelectedNode(null);
  };

  // Get color for room categories
  const getCategoryColor = (catId, isEmergency) => {
    if (isEmergency) return '#ef4444';
    switch (catId) {
      case 'reception': return '#0284c7';
      case 'department': return '#0d9488';
      case 'diagnostic': return '#7c3aed';
      case 'pharmacy': return '#16a34a';
      case 'transit': return '#d97706';
      case 'exit': return '#dc2626';
      default: return '#475569';
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-5.5rem)] bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200 select-none">
      {/* Top Map Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Floor Selection Pills */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-lg border border-slate-200/80">
          <div className="flex items-center gap-1">
            {allFloors.map((fl) => {
              const hasRouteOnFloor = currentRoute?.floors_involved?.includes(fl.floor_number);
              return (
                <button
                  key={fl.floor_number}
                  onClick={() => setCurrentFloor(fl.floor_number)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    currentFloor === fl.floor_number
                      ? 'bg-hospital-navy text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{fl.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20">
                    {fl.short_code}
                  </span>
                  {hasRouteOnFloor && (
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layer Toggles & Zoom Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Layer toggles dropdown/pills */}
          <div className="hidden sm:flex items-center bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-lg border border-slate-200/80 text-xs font-semibold text-slate-700">
            <button
              onClick={() => setShowRoomLabels(!showRoomLabels)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                showRoomLabels ? 'bg-slate-100 text-teal-800 font-bold' : 'text-slate-400'
              }`}
            >
              Labels
            </button>
            <button
              onClick={() => setShowCorridors(!showCorridors)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                showCorridors ? 'bg-slate-100 text-teal-800 font-bold' : 'text-slate-400'
              }`}
            >
              Corridors
            </button>
          </div>

          {/* Zoom In, Zoom Out, Reset Buttons */}
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 gap-1">
            <button
              onClick={() => setScale((s) => Math.min(s * 1.2, 3))}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale((s) => Math.max(s * 0.8, 0.6))}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Active Route Banner if Route exists */}
      {currentRoute && (
        <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-lg px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 max-w-3xl w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Navigation className="w-5 h-5 text-teal-600 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Active Route ({currentRoute.algorithm})
                </div>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-teal-700">{currentRoute.source?.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-hospital-navy">{currentRoute.destination?.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">Total Distance</div>
                <div className="text-sm font-extrabold text-teal-700">
                  {currentRoute.total_distance_meters} m ({currentRoute.estimated_walking_time})
                </div>
              </div>

              {/* Start AR Navigation Button */}
              <button
                onClick={() => setArModeActive(true)}
                className="px-4 py-2 bg-hospital-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Compass className="w-4 h-4 text-teal-400" />
                <span>Start AR View</span>
              </button>

              <button
                onClick={() => setActiveTab('find-location')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Directions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG Map Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            {/* Grid Pattern for Architectural Blueprint */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>

            {/* Glowing route filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#0d9488" floodOpacity="0.8" />
            </filter>

            {/* Emergency route filter */}
            <filter id="emergencyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.9" />
            </filter>

            {/* Directional Chevron Marker for Route Flow */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill={currentRoute?.is_emergency ? "#ef4444" : "#0d9488"} />
            </marker>
          </defs>

          {/* Background Blueprint Grid */}
          <rect width="1000" height="800" fill="#f8fafc" />
          <rect width="1000" height="800" fill="url(#grid)" />

          {/* Floor Architectural Perimeter & Rooms */}
          <g id="floor-architectural-zones">
            {/* Outer Wing Boundary */}
            <rect
              x="50"
              y="100"
              width="900"
              height="650"
              rx="24"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="4"
              className="shadow-sm"
            />

            {/* Central Main Atrium / Hallway */}
            <rect
              x="160"
              y="250"
              width="680"
              height="360"
              rx="16"
              fill="#f1f5f9"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Floor Architectural Department Zones based on Current Floor */}
            {currentFloor === 0 && (
              <>
                {/* Reception & Information Wing */}
                <rect x="340" y="450" width="320" height="120" rx="12" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
                <text x="500" y="475" textAnchor="middle" fill="#0369a1" fontSize="12" fontWeight="bold">CENTRAL RECEPTION & TRIAGE</text>
                
                {/* Emergency & Trauma Ward (West) */}
                <rect x="60" y="440" width="220" height="150" rx="12" fill="#fee2e2" stroke="#f87171" strokeWidth="2" />
                <text x="170" y="465" textAnchor="middle" fill="#b91c1c" fontSize="12" fontWeight="bold">EMERGENCY & TRAUMA (24/7)</text>

                {/* Central Pharmacy & Radiology (East) */}
                <rect x="720" y="320" width="220" height="260" rx="12" fill="#dcfce7" stroke="#4ade80" strokeWidth="2" />
                <text x="830" y="340" textAnchor="middle" fill="#15803d" fontSize="12" fontWeight="bold">PHARMACY & RADIOLOGY</text>

                {/* Cafeteria Lounge */}
                <rect x="680" y="620" width="220" height="100" rx="12" fill="#fef9c3" stroke="#facc15" strokeWidth="1.5" />
                <text x="790" y="640" textAnchor="middle" fill="#854d0e" fontSize="11" fontWeight="bold">GARDEN CAFETERIA</text>

                {/* Main Glass Entrance Foyer */}
                <path d="M 420 740 Q 500 710 580 740" fill="none" stroke="#0d9488" strokeWidth="5" strokeLinecap="round" />
                <text x="500" y="755" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="bold">▼ MAIN ENTRANCE FOYER ▼</text>
              </>
            )}

            {currentFloor === 1 && (
              <>
                {/* Cardiology Suite (North-West) */}
                <rect x="120" y="140" width="250" height="150" rx="12" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
                <text x="245" y="165" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="bold">CARDIOLOGY CENTER</text>
                
                {/* Neurology Suite (North-East) */}
                <rect x="630" y="140" width="250" height="150" rx="12" fill="#f3e8ff" stroke="#c084fc" strokeWidth="2" />
                <text x="755" y="165" textAnchor="middle" fill="#7e22ce" fontSize="12" fontWeight="bold">NEUROLOGY DEPARTMENT</text>

                {/* General Medicine OPD (South-West) */}
                <rect x="120" y="480" width="250" height="160" rx="12" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
                <text x="245" y="505" textAnchor="middle" fill="#0369a1" fontSize="12" fontWeight="bold">GENERAL MEDICINE OPD</text>

                {/* Diagnostic Pathology Lab (South-East) */}
                <rect x="630" y="480" width="250" height="160" rx="12" fill="#ede9fe" stroke="#a78bfa" strokeWidth="2" />
                <text x="755" y="505" textAnchor="middle" fill="#6d28d9" fontSize="12" fontWeight="bold">PATHOLOGY & BLOOD LAB</text>

                {/* Central Waiting Concourse */}
                <circle cx="500" cy="400" r="45" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                <text x="500" y="405" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="bold">LEVEL 1 HUB</text>
              </>
            )}

            {currentFloor === 2 && (
              <>
                {/* Intensive Care Unit (ICU) - Sterile Zone */}
                <rect x="120" y="140" width="250" height="160" rx="12" fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
                <text x="245" y="165" textAnchor="middle" fill="#b91c1c" fontSize="12" fontWeight="bold">INTENSIVE CARE UNIT (ICU)</text>
                
                {/* Operation Theatres Complex (OT 1 & 2) */}
                <rect x="630" y="140" width="260" height="160" rx="12" fill="#fef2f2" stroke="#f87171" strokeWidth="2" />
                <text x="760" y="165" textAnchor="middle" fill="#991b1b" fontSize="12" fontWeight="bold">OPERATION THEATRES (OT 1 & 2)</text>

                {/* Orthopedics & Joint Clinic */}
                <rect x="120" y="480" width="250" height="160" rx="12" fill="#ccfbf1" stroke="#2dd4bf" strokeWidth="2" />
                <text x="245" y="505" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="bold">ORTHOPEDICS & REHAB</text>

                {/* Inpatient Private Suites (201-210) */}
                <rect x="630" y="480" width="260" height="160" rx="12" fill="#e0f2fe" stroke="#60a5fa" strokeWidth="2" />
                <text x="760" y="505" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">INPATIENT RECOVERY WARD</text>

                {/* Central Nurse Monitoring Desk */}
                <rect x="420" y="210" width="160" height="60" rx="8" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
                <text x="500" y="245" textAnchor="middle" fill="#1d4ed8" fontSize="11" fontWeight="bold">CENTRAL NURSE DESK</text>
              </>
            )}

            {/* Elevator Shafts (Elevator A and Elevator B) */}
            <g id="elevator-shafts">
              <rect x="335" y="255" width="50" height="50" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
              <text x="360" y="285" textAnchor="middle" fill="#b45309" fontSize="10" fontWeight="bold">LIFT A</text>

              <rect x="615" y="255" width="50" height="50" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
              <text x="640" y="285" textAnchor="middle" fill="#b45309" fontSize="10" fontWeight="bold">LIFT B</text>
            </g>

            {/* Stairwell Enclosures */}
            <g id="stairwell-shafts">
              <rect x="215" y="255" width="50" height="50" rx="8" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
              <line x1="220" y1="265" x2="260" y2="265" stroke="#94a3b8" strokeWidth="2" />
              <line x1="220" y1="275" x2="260" y2="275" stroke="#94a3b8" strokeWidth="2" />
              <line x1="220" y1="285" x2="260" y2="285" stroke="#94a3b8" strokeWidth="2" />
              <line x1="220" y1="295" x2="260" y2="295" stroke="#94a3b8" strokeWidth="2" />
              <text x="240" y="315" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="bold">STAIRS 1</text>

              <rect x="735" y="255" width="50" height="50" rx="8" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
              <line x1="740" y1="265" x2="780" y2="265" stroke="#94a3b8" strokeWidth="2" />
              <line x1="740" y1="275" x2="780" y2="275" stroke="#94a3b8" strokeWidth="2" />
              <line x1="740" y1="285" x2="780" y2="285" stroke="#94a3b8" strokeWidth="2" />
              <line x1="740" y1="295" x2="780" y2="295" stroke="#94a3b8" strokeWidth="2" />
              <text x="760" y="315" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="bold">STAIRS 2</text>
            </g>
          </g>

          {/* Graph Corridors / Edges Layer */}
          {showCorridors && (
            <g id="graph-corridors-layer">
              {floorEdges.map((edge) => {
                const u = allLocations.find((n) => n.id === edge.source);
                const v = allLocations.find((n) => n.id === edge.target);
                if (!u || !v) return null;
                return (
                  <line
                    key={`edge-${edge.id}`}
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#cbd5e1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={edge.is_stairs ? "4 4" : "none"}
                  />
                );
              })}
            </g>
          )}

          {/* Active Route Highlight Layer (Bright Glowing Path) */}
          {routeFloorSegments.length > 0 && (
            <g id="active-navigation-route-layer">
              {routeFloorSegments.map((seg, idx) => (
                <line
                  key={`route-seg-${idx}`}
                  x1={seg.from.x}
                  y1={seg.from.y}
                  x2={seg.to.x}
                  y2={seg.to.y}
                  stroke={currentRoute?.is_emergency ? "#ef4444" : "#0d9488"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  filter={currentRoute?.is_emergency ? "url(#emergencyGlow)" : "url(#glow)"}
                  className="route-path-animated"
                  markerEnd="url(#arrow)"
                />
              ))}
            </g>
          )}

          {/* Location Nodes Layer */}
          <g id="hospital-nodes-layer">
            {floorNodes.map((node) => {
              const isSource = sourceLocation === node.id;
              const isTarget = targetLocation === node.id;
              const isOnRoute = currentRoute?.path_node_ids?.includes(node.id);
              const nodeColor = getCategoryColor(node.category_id, node.is_emergency);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => handleNodeClick(node, e)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing Radar Ring for Source / Destination */}
                  {isSource && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      className="animate-ping"
                      opacity="0.75"
                    />
                  )}
                  {isTarget && (
                    <circle
                      r="24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      className="animate-ping"
                      opacity="0.8"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={isSource || isTarget ? "16" : isOnRoute ? "13" : "10"}
                    fill={isSource ? "#0284c7" : isTarget ? "#ef4444" : nodeColor}
                    stroke="#ffffff"
                    strokeWidth="3"
                    className="transition-transform group-hover:scale-125 shadow-md"
                  />

                  {/* Inner Node Icon or Dot */}
                  {isSource ? (
                    <circle r="5" fill="#ffffff" />
                  ) : isTarget ? (
                    <path
                      d="M -4 -4 L 4 4 M -4 4 L 4 -4"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ) : (
                    <circle r="3" fill="#ffffff" />
                  )}

                  {/* Node Label */}
                  {showRoomLabels && (
                    <g transform="translate(0, 22)">
                      <rect
                        x="-60"
                        y="-10"
                        width="120"
                        height="20"
                        rx="6"
                        fill="#0f2b48"
                        opacity="0.88"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {node.name.length > 18 ? node.name.substring(0, 16) + '...' : node.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Interactive Node Detail Popover */}
      {selectedNode && (
        <div className="absolute top-20 right-6 z-30 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
          <div
            className="p-4 text-white flex items-center justify-between"
            style={{ backgroundColor: getCategoryColor(selectedNode.category_id, selectedNode.is_emergency) }}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                {selectedNode.department || 'Hospital Location'}
              </div>
              <h3 className="font-bold text-base leading-tight">{selectedNode.name}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Floor {selectedNode.floor}
              </span>
              {selectedNode.room_number && (
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-700 font-bold">
                  Room {selectedNode.room_number}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedNode.description || 'Medical facility open for patients and visitors.'}
            </p>

            {/* Accessibility badge */}
            <div className="flex items-center gap-2 pt-1 text-xs font-medium">
              <span className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">
                <Accessibility className="w-3.5 h-3.5" /> Wheelchair Accessible
              </span>
              {selectedNode.is_emergency && (
                <span className="flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-lg">
                  <Flame className="w-3.5 h-3.5" /> Emergency Unit
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleSetStart(selectedNode.id)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
              >
                Set as Start
              </button>
              <button
                onClick={() => handleSetDestination(selectedNode.id)}
                className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors text-center"
              >
                Navigate Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

