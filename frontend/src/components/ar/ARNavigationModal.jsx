import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Compass,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  CornerUpRight,
  CornerUpLeft,
  Building,
  CheckCircle2,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  ChevronLeft,
  ChevronRight,
  Footprints,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigation } from '../../context/NavigationContext';

export default function ARNavigationModal() {
  const {
    arModeActive,
    setArModeActive,
    currentRoute,
    activeStepIndex,
    setActiveStepIndex,
    speakInstruction,
    setCurrentFloor
  } = useNavigation();

  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [compassHeading, setCompassHeading] = useState(42);
  const [audioMuted, setAudioMuted] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const steps = currentRoute?.steps || [];
  const totalSteps = steps.length;
  const currentStep = steps[activeStepIndex] || null;
  const progressPercent = totalSteps > 1 ? Math.round((activeStepIndex / (totalSteps - 1)) * 100) : 100;

  // Speak instruction whenever step changes
  useEffect(() => {
    if (arModeActive && currentStep && !audioMuted) {
      speakInstruction(currentStep.instruction);
      if (currentStep.floor !== undefined) {
        setCurrentFloor(currentStep.floor);
      }
      // If reached destination, trigger celebration confetti!
      if (currentStep.direction === 'destination' || activeStepIndex === totalSteps - 1) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [activeStepIndex, arModeActive, audioMuted]);

  // Camera stream management
  useEffect(() => {
    if (arModeActive && useRealCamera) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Real camera not accessible, falling back to simulated viewport:', err);
          setCameraError('Camera access unavailable. Using simulated hospital corridor.');
          setUseRealCamera(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [arModeActive, useRealCamera]);

  if (!arModeActive || !currentRoute) return null;

  const handleNextStep = () => {
    if (activeStepIndex < totalSteps - 1) {
      setActiveStepIndex(activeStepIndex + 1);
      setCompassHeading((prev) => (prev + 35) % 360);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
      setCompassHeading((prev) => (prev - 35 + 360) % 360);
    }
  };

  const renderDirectionVisual = () => {
    if (!currentStep) return null;
    const dir = currentStep.direction;

    switch (dir) {
      case 'straight':
        return (
          <div className="flex flex-col items-center animate-bounce">
            <div className="w-24 h-24 rounded-full bg-teal-500/80 border-4 border-white flex items-center justify-center text-white shadow-2xl shadow-teal-500/50">
              <ArrowUp className="w-14 h-14" />
            </div>
            <span className="mt-2 text-sm font-black tracking-widest text-teal-300 uppercase drop-shadow-md">
              Go Straight
            </span>
          </div>
        );
      case 'slight_right':
      case 'turn_right':
      case 'sharp_right':
        return (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-24 h-24 rounded-full bg-teal-500/80 border-4 border-white flex items-center justify-center text-white shadow-2xl shadow-teal-500/50">
              <CornerUpRight className="w-14 h-14" />
            </div>
            <span className="mt-2 text-sm font-black tracking-widest text-teal-300 uppercase drop-shadow-md">
              Turn Right
            </span>
          </div>
        );
      case 'slight_left':
      case 'turn_left':
      case 'sharp_left':
        return (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-24 h-24 rounded-full bg-teal-500/80 border-4 border-white flex items-center justify-center text-white shadow-2xl shadow-teal-500/50">
              <CornerUpLeft className="w-14 h-14" />
            </div>
            <span className="mt-2 text-sm font-black tracking-widest text-teal-300 uppercase drop-shadow-md">
              Turn Left
            </span>
          </div>
        );
      case 'elevator_up':
      case 'elevator_down':
        return (
          <div className="flex flex-col items-center animate-bounce">
            <div className="w-24 h-24 rounded-full bg-amber-500/80 border-4 border-white flex items-center justify-center text-white shadow-2xl shadow-amber-500/50">
              <Building className="w-14 h-14" />
            </div>
            <span className="mt-2 text-sm font-black tracking-widest text-amber-300 uppercase drop-shadow-md">
              Take Elevator
            </span>
          </div>
        );
      case 'destination':
        return (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-24 h-24 rounded-full bg-green-500/90 border-4 border-white flex items-center justify-center text-white shadow-2xl shadow-green-500/50">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            <span className="mt-2 text-sm font-black tracking-widest text-green-300 uppercase drop-shadow-md">
              Destination Arrived
            </span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center animate-bounce">
            <div className="w-24 h-24 rounded-full bg-teal-500/80 border-4 border-white flex items-center justify-center text-white shadow-2xl">
              <ArrowUp className="w-14 h-14" />
            </div>
            <span className="mt-2 text-sm font-black tracking-widest text-teal-300 uppercase">
              Follow Path
            </span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden animate-in fade-in duration-200">
      {/* Background: Real Camera Video or Realistic Simulated Hospital 3D Corridor */}
      <div className="absolute inset-0 z-0">
        {useRealCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center overflow-hidden">
            {/* Perspective 3D Corridor Grid simulation */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(13, 148, 136, 0.4) 0%, transparent 60%), linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 60px 60px, 60px 60px',
                perspective: '600px',
                transform: 'rotateX(45deg)'
              }}
            />

            {/* Simulated Architectural Corridor Walls */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black/80 to-transparent pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />

            {/* Visual Horizon Line */}
            <div className="w-full h-0.5 bg-teal-500/20 absolute top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* AR Viewfinder Overlay Header */}
      <div className="relative z-10 p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
            <Compass className="w-5 h-5 text-teal-400 animate-spin" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>AR WAYFINDING HUD • {compassHeading}° N</span>
            </div>
            <div className="text-base font-extrabold text-white">
              To: {currentRoute.destination?.name}
            </div>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Toggle Real vs Simulated Camera */}
          <button
            onClick={() => setUseRealCamera(!useRealCamera)}
            className={`p-2.5 rounded-xl border transition-all ${
              useRealCamera
                ? 'bg-teal-500 text-slate-950 border-teal-300 font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="Toggle Real Camera Feed"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Toggle Audio Guidance */}
          <button
            onClick={() => {
              setAudioMuted(!audioMuted);
              if (audioMuted && currentStep) speakInstruction(currentStep.instruction);
            }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            title={audioMuted ? "Unmute Voice Guidance" : "Mute Voice Guidance"}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-300" />}
          </button>

          {/* Close AR View */}
          <button
            onClick={() => setArModeActive(false)}
            className="p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-900/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main AR Directional Overlay (Center Display) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Large Floating 3D Direction Arrow */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          {renderDirectionVisual()}
        </div>

        {/* Primary Instruction HUD Banner */}
        <div className="max-w-xl w-full bg-black/75 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-2 text-white">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-center gap-2">
            <span>Floor {currentStep?.floor ?? 0}</span>
            <span>•</span>
            <span>Step {activeStepIndex + 1} of {totalSteps}</span>
            {currentStep?.distance_meters > 0 && (
              <>
                <span>•</span>
                <span>In {currentStep.distance_meters.toFixed(0)} meters</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-snug drop-shadow-sm">
            {currentStep?.instruction}
          </h2>
        </div>
      </div>

      {/* Bottom Walking Controls & Progress HUD */}
      <div className="relative z-10 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-4">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-teal-400" />
              Progress
            </span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-300 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Navigation Controls (Simulator Buttons) */}
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handlePrevStep}
            disabled={activeStepIndex === 0}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold border border-white/20 shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              setActiveStepIndex(0);
              speakInstruction("Restarting route navigation.");
            }}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            title="Restart Route"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleNextStep}
            disabled={activeStepIndex === totalSteps - 1}
            className="flex-1 py-3 px-4 rounded-2xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-40 disabled:pointer-events-none text-slate-950 text-xs font-extrabold shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

