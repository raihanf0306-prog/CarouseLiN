import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Shield, Zap, Crosshair, Terminal, Activity, Cpu } from 'lucide-react';

// Web Audio API Retro Sound Synthesizer (Zero external dependencies)
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const setGameSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const isGameSoundEnabled = () => soundEnabled;

export const playGameSound = (type: 'blip' | 'confirm' | 'powerup' | 'cancel' | 'laser') => {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'blip') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'confirm') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.06);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'powerup') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'cancel') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'laser') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(990, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    // AudioContext autoplay restrictions are handled gracefully
  }
};

// 4 Corner Tactical L-Brackets with crosshairs for PC Game HUD
export const GameCornerReticles: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCoordinates?: boolean;
}> = ({ size = 'md', className = '', showCoordinates = false }) => {
  const bracketSize = size === 'sm' ? 'w-2 h-2 border-2' : size === 'lg' ? 'w-4 h-4 border-2 md:border-[3px]' : 'w-3 h-3 border-2';

  return (
    <>
      {/* Top Left */}
      <div className={`absolute -top-1 -left-1 ${bracketSize} border-t-[#1455D9] border-l-[#1455D9] dark:border-t-[#38BDF8] dark:border-l-[#38BDF8] border-r-0 border-b-0 pointer-events-none z-20 ${className}`}>
        {showCoordinates && <span className="absolute -top-3 left-0 font-pixel text-[6px] text-[#1455D9] dark:text-[#38BDF8] select-none">[0,0]</span>}
      </div>
      {/* Top Right */}
      <div className={`absolute -top-1 -right-1 ${bracketSize} border-t-[#1455D9] border-r-[#1455D9] dark:border-t-[#38BDF8] dark:border-r-[#38BDF8] border-l-0 border-b-0 pointer-events-none z-20 ${className}`}>
        {showCoordinates && <span className="absolute -top-3 right-0 font-pixel text-[6px] text-[#1455D9] dark:text-[#38BDF8] select-none">[1,0]</span>}
      </div>
      {/* Bottom Left */}
      <div className={`absolute -bottom-1 -left-1 ${bracketSize} border-b-[#1455D9] border-l-[#1455D9] dark:border-b-[#38BDF8] dark:border-l-[#38BDF8] border-r-0 border-t-0 pointer-events-none z-20 ${className}`}>
        {showCoordinates && <span className="absolute -bottom-3 left-0 font-pixel text-[6px] text-[#1455D9] dark:text-[#38BDF8] select-none">[0,1]</span>}
      </div>
      {/* Bottom Right */}
      <div className={`absolute -bottom-1 -right-1 ${bracketSize} border-b-[#1455D9] border-r-[#1455D9] dark:border-b-[#38BDF8] dark:border-r-[#38BDF8] border-l-0 border-t-0 pointer-events-none z-20 ${className}`}>
        {showCoordinates && <span className="absolute -bottom-3 right-0 font-pixel text-[6px] text-[#1455D9] dark:text-[#38BDF8] select-none">[1,1]</span>}
      </div>
    </>
  );
};

// Checkered Decorative Pixel Matrix (Kotak-Kotak Hiasan Game)
export const PixelMatrixCluster: React.FC<{
  pattern?: '2x2' | '3x3' | 'bar' | 'cross';
  className?: string;
}> = ({ pattern = '3x3', className = '' }) => {
  if (pattern === '2x2') {
    return (
      <div className={`grid grid-cols-2 gap-0.5 pointer-events-none select-none ${className}`}>
        <span className="w-1.5 h-1.5 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
        <span className="w-1.5 h-1.5 bg-[#1455D9]/30 dark:bg-[#38BDF8]/30"></span>
        <span className="w-1.5 h-1.5 bg-[#1455D9]/30 dark:bg-[#38BDF8]/30"></span>
        <span className="w-1.5 h-1.5 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
      </div>
    );
  }

  if (pattern === 'bar') {
    return (
      <div className={`flex items-center gap-1 font-mono text-[9px] text-[#1455D9] dark:text-[#38BDF8] pointer-events-none select-none font-bold ${className}`}>
        <span className="w-2 h-2 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
        <span className="w-2 h-2 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
        <span className="w-2 h-2 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
        <span className="w-2 h-2 bg-[#1455D9]/40 dark:bg-[#38BDF8]/40"></span>
        <span className="w-2 h-2 border border-[#1455D9] dark:border-[#38BDF8]"></span>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-0.5 pointer-events-none select-none ${className}`}>
      <span className="w-1.5 h-1.5 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
      <span className="w-1.5 h-1.5 bg-[#1455D9]/40 dark:bg-[#38BDF8]/40"></span>
      <span className="w-1.5 h-1.5 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
      <span className="w-1.5 h-1.5 bg-[#1455D9]/40 dark:bg-[#38BDF8]/40"></span>
      <span className="w-1.5 h-1.5 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
      <span className="w-1.5 h-1.5 bg-[#1455D9]/40 dark:bg-[#38BDF8]/40"></span>
      <span className="w-1.5 h-1.5 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
      <span className="w-1.5 h-1.5 bg-[#1455D9]/40 dark:bg-[#38BDF8]/40"></span>
      <span className="w-1.5 h-1.5 bg-[#1455D9] dark:bg-[#38BDF8]"></span>
    </div>
  );
};

// Retro Blue Box Pixel Cluster Decorations (Hiasan Kotak-Kotak Retro Warna Biru)
export const RetroBlueDecorBoxes: React.FC<{
  position?: 'left' | 'right' | 'corner-tl' | 'corner-tr' | 'corner-bl' | 'corner-br' | 'scatter';
  className?: string;
}> = ({ position = 'left', className = '' }) => {
  if (position === 'left') {
    return (
      <div className={`flex flex-col gap-1.5 select-none pointer-events-none ${className}`}>
        {/* Stepped retro blue pixel blocks */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#38BDF8] border border-[#071B4D] dark:border-[#020714] shadow-[1px_1px_0px_#071B4D]" />
          <div className="w-3.5 h-3.5 bg-[#1D6BFF] border-2 border-[#071B4D] dark:border-blue-400 shadow-[2px_2px_0px_#071B4D]" />
        </div>
        <div className="flex items-center gap-1 ml-2">
          <div className="w-5 h-5 bg-[#1455D9] border-2 border-[#071B4D] dark:border-[#38BDF8] shadow-[2px_2px_0px_#071B4D] flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-[#38BDF8]" />
          </div>
          <div className="w-3 h-3 bg-[#0B2D78] border border-[#38BDF8] shadow-[1px_1px_0px_#071B4D]" />
          <div className="w-2 h-2 bg-[#60A5FA]" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-400/80 border border-[#071B4D]" />
          <div className="w-2 h-2 bg-[#1455D9]" />
          <div className="w-1.5 h-1.5 bg-[#38BDF8]" />
        </div>
      </div>
    );
  }

  if (position === 'right') {
    return (
      <div className={`flex flex-col items-end gap-1.5 select-none pointer-events-none ${className}`}>
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 bg-[#1D6BFF] border-2 border-[#071B4D] dark:border-blue-400 shadow-[2px_2px_0px_#071B4D]" />
          <div className="w-2 h-2 bg-[#38BDF8] border border-[#071B4D] dark:border-[#020714] shadow-[1px_1px_0px_#071B4D]" />
        </div>
        <div className="flex items-center gap-1 mr-2">
          <div className="w-2 h-2 bg-[#60A5FA]" />
          <div className="w-3 h-3 bg-[#0B2D78] border border-[#38BDF8] shadow-[1px_1px_0px_#071B4D]" />
          <div className="w-5 h-5 bg-[#1455D9] border-2 border-[#071B4D] dark:border-[#38BDF8] shadow-[2px_2px_0px_#071B4D] flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-[#38BDF8]" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-[#38BDF8]" />
          <div className="w-2 h-2 bg-[#1455D9]" />
          <div className="w-3 h-3 bg-blue-400/80 border border-[#071B4D]" />
        </div>
      </div>
    );
  }

  // Scatter / ambient layout around headline
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#EAF3FF]/80 dark:bg-[#071B4D]/60 border border-[#1455D9]/40 rounded-[2px]">
        <span className="w-2 h-2 bg-[#1455D9] shadow-[1px_1px_0px_#071B4D]" />
        <span className="w-2 h-2 bg-[#38BDF8]" />
        <span className="w-2 h-2 bg-[#0B2D78]" />
        <span className="w-2 h-2 bg-[#1D6BFF]" />
        <span className="w-2 h-2 bg-[#38BDF8]" />
        <span className="w-2 h-2 bg-[#1455D9]" />
        <span className="w-2 h-2 bg-[#93C5FD]" />
        <span className="w-2 h-2 bg-[#071B4D]" />
      </div>
    </div>
  );
};

// PC Game Technical Measurement Ruler with Tick Marks (Garis-Garis Penggaris Game)
export const GameTechRuler: React.FC<{
  label?: string;
  className?: string;
  inverted?: boolean;
}> = ({ label = 'SYSTEM_GRID', className = '', inverted = false }) => {
  return (
    <div className={`w-full flex items-center gap-2 select-none pointer-events-none font-mono text-[8px] sm:text-[9px] ${className}`}>
      <span className="text-[#1455D9] dark:text-[#38BDF8] font-bold shrink-0">{label}</span>
      <div className="flex-1 flex items-center overflow-hidden">
        <span className="text-[#1455D9]/60 dark:text-[#38BDF8]/60 tracking-tighter whitespace-nowrap overflow-hidden">
          |·|·|·|·|·| 00 |·|·|·|·|·| 25 |·|·|·|·|·| 50 |·|·|·|·|·| 75 |·|·|·|·|·| 100 |·|·|·|·|·| MAX
        </span>
      </div>
      <span className="text-[#1455D9] dark:text-[#38BDF8] font-pixel text-[7px] shrink-0">[+]</span>
    </div>
  );
};

// PC Game Hazard Strip Banner (Garis Garis Hazard Gaming)
export const GameHazardTape: React.FC<{
  label?: string;
  className?: string;
  variant?: 'blue' | 'amber';
}> = ({ label, className = '', variant = 'blue' }) => {
  const stripeClass = variant === 'amber' ? 'game-amber-stripes border-amber-500/50' : 'game-hazard-stripes border-[#1455D9]/50';
  return (
    <div className={`h-4.5 w-full border-y ${stripeClass} flex items-center justify-between px-3 select-none ${className}`}>
      {label ? (
        <span className="bg-[#0B2D78] text-white dark:bg-[#06122C] dark:text-[#38BDF8] px-2 py-0.2 font-pixel text-[7px] uppercase tracking-widest border border-white/20">
          {label}
        </span>
      ) : (
        <span className="text-[7px] font-mono text-transparent">.</span>
      )}
      <span className="font-pixel text-[7px] text-[#1455D9] dark:text-[#38BDF8] tracking-widest">
        // PROTOCOL 2.5 //
      </span>
    </div>
  );
};

// Interactive PC Game Top HUD Telemetry Bar
export const GameHudStatusBar: React.FC<{
  isDarkMode: boolean;
}> = ({ isDarkMode }) => {
  const [sfxOn, setSfxOn] = useState(soundEnabled);
  const [fps, setFps] = useState(60);

  const toggleSfx = () => {
    const next = !sfxOn;
    setSfxOn(next);
    setGameSoundEnabled(next);
    if (next) {
      playGameSound('confirm');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Subtle realistic FPS jitter between 59-60 FPS like PC games
      setFps(Math.floor(Math.random() * 2) + 59);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#05112F] border-b-2 border-[#1455D9] text-white px-3 sm:px-6 py-1 select-none font-mono text-[10px] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-[inset_0_-1px_0_rgba(56,189,248,0.2)]">
      {/* Left: Player ID & Mission Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-400 border border-black animate-pulse"></div>
          <span className="font-pixel text-[8px] text-emerald-300">P1: RAIHAN</span>
        </div>
        <span className="text-blue-400/40">|</span>
        <div className="flex items-center gap-1 text-blue-200">
          <Shield className="w-3 h-3 text-[#38BDF8]" />
          <span className="font-bold text-[9px]">MISSION: ACTIVE</span>
        </div>
        <span className="hidden md:inline text-blue-400/40">|</span>
        <div className="hidden md:flex items-center gap-1 text-blue-300">
          <Crosshair className="w-3 h-3 text-amber-400" />
          <span className="text-[9px]">LOCK-ON: CAROUSEL 5X</span>
        </div>
      </div>

      {/* Middle: Gaming HP & EXP Segment Bars */}
      <div className="hidden lg:flex items-center gap-4 shrink-0">
        {/* HP Bar */}
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7.5px] text-red-400 font-bold">HP</span>
          <div className="flex items-center gap-0.5 p-0.5 bg-black/50 border border-red-500/40 rounded-[1px]">
            <span className="w-1.5 h-2 bg-red-500"></span>
            <span className="w-1.5 h-2 bg-red-500"></span>
            <span className="w-1.5 h-2 bg-red-500"></span>
            <span className="w-1.5 h-2 bg-red-500"></span>
            <span className="w-1.5 h-2 bg-red-500"></span>
            <span className="w-1.5 h-2 bg-red-500"></span>
            <span className="w-1.5 h-2 bg-red-500"></span>
            <span className="w-1.5 h-2 bg-red-500"></span>
          </div>
          <span className="font-mono text-[9px] text-red-300">100%</span>
        </div>

        {/* MP / AI Mana Bar */}
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7.5px] text-[#38BDF8] font-bold">MP</span>
          <div className="flex items-center gap-0.5 p-0.5 bg-black/50 border border-[#38BDF8]/40 rounded-[1px]">
            <span className="w-1.5 h-2 bg-[#38BDF8]"></span>
            <span className="w-1.5 h-2 bg-[#38BDF8]"></span>
            <span className="w-1.5 h-2 bg-[#38BDF8]"></span>
            <span className="w-1.5 h-2 bg-[#38BDF8]"></span>
            <span className="w-1.5 h-2 bg-[#38BDF8]"></span>
            <span className="w-1.5 h-2 bg-[#38BDF8]"></span>
            <span className="w-1.5 h-2 bg-[#38BDF8]"></span>
            <span className="w-1.5 h-2 bg-[#38BDF8]/40"></span>
          </div>
          <span className="font-mono text-[9px] text-blue-200">GEMINI AI</span>
        </div>
      </div>

      {/* Right: Telemetry & Sound Switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden sm:flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded-[1px]">
          <Activity className="w-2.5 h-2.5" />
          <span>{fps} FPS</span>
        </div>

        {/* SFX Game Audio Toggle */}
        <button
          onClick={toggleSfx}
          className={`flex items-center gap-1 px-2 py-0.5 border rounded-[1px] font-pixel text-[7.5px] transition-all cursor-pointer ${
            sfxOn
              ? 'bg-[#1455D9] text-white border-[#38BDF8] shadow-[1px_1px_0px_#071B4D]'
              : 'bg-black/60 text-slate-400 border-slate-600'
          }`}
          title="Toggle PC Game 8-Bit Sound FX"
        >
          {sfxOn ? <Volume2 className="w-2.5 h-2.5 text-white" /> : <VolumeX className="w-2.5 h-2.5" />}
          <span>SFX: {sfxOn ? 'ON' : 'MUTE'}</span>
        </button>
      </div>
    </div>
  );
};
