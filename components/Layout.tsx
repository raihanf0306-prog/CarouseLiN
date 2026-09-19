
import React, { useState, useEffect, useRef } from 'react';
import { 
  Info, Globe, Sun, Moon, ZoomIn, ZoomOut, X, Check, Star, Zap, Sparkles, 
  Terminal, Minus, Square, ShieldAlert, Instagram, Mail, Phone, ExternalLink, Lock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';
import { LicenseWarningBox } from './LicenseWarningBox';
import { CreatorProfileCard } from './CreatorProfileCard';
import { GameHudStatusBar, GameCornerReticles, playGameSound } from './GameUiElements';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load theme from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Effect to apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleZoomIn = () => {
    playGameSound('blip');
    setZoomLevel(prev => Math.min(prev + 20, 150));
  };

  const handleZoomOut = () => {
    playGameSound('blip');
    setZoomLevel(prev => Math.max(prev - 20, 60));
  };

  const resetZoom = () => {
    playGameSound('confirm');
    setZoomLevel(100);
  };

  const toggleTheme = () => {
    playGameSound('blip');
    setIsDarkMode(!isDarkMode);
  };
  
  const handleLanguageChange = (lang: Language) => {
    playGameSound('confirm');
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'id', label: 'ID', native: 'Bahasa Indonesia' },
    { code: 'en', label: 'EN', native: 'English' },
    { code: 'ar', label: 'AR', native: 'العربية (Arabic)' },
    { code: 'ms', label: 'MS', native: 'Bahasa Melayu' },
    { code: 'zh', label: 'ZH', native: '中文 (Chinese)' },
    { code: 'ja', label: 'JA', native: '日本語 (Japanese)' },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#07132B] text-slate-100 selection:bg-[#1D6BFF]/30 selection:text-[#EAF3FF]' : 'bg-[#F5F9FF] text-[#071B4D] selection:bg-[#1455D9]/20 selection:text-[#0B2D78]'} relative font-sans overflow-x-hidden`}>
      
      {/* Top Retro OS Window Titlebar */}
      <div className="w-full bg-[#0B2D78] text-white px-3 md:px-6 py-1.5 flex items-center justify-between text-[11px] font-mono select-none border-b border-[#1455D9] z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#1D6BFF] inline-block animate-pulse"></span>
          <span className="font-bold tracking-wider">[ CAROUSELIN WORKSTATION v2.5 // DIBUAT OLEH REI ]</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-blue-200">
            <span className="bg-blue-950/80 text-blue-300 px-1.5 py-0.5 rounded-[1px] border border-blue-400/30 font-bold">
              AUTHOR: REI (TIM REI)
            </span>
            <span>|</span>
            <span>SYS: READY</span>
          </div>
          {/* Retro Window Controls: Minimize, Maximize, Close */}
          <div className="flex items-center gap-1.5">
            <button className="w-4 h-4 border border-blue-400/60 bg-blue-900/50 hover:bg-blue-800 flex items-center justify-center text-[9px] text-white cursor-pointer" onClick={() => playGameSound('blip')}>
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button className="w-4 h-4 border border-blue-400/60 bg-blue-900/50 hover:bg-blue-800 flex items-center justify-center text-[9px] text-white cursor-pointer" onClick={() => playGameSound('blip')}>
              <Square className="w-2 h-2" />
            </button>
            <button 
              onClick={() => {
                playGameSound('cancel');
                window.location.reload();
              }}
              className="w-4 h-4 border border-blue-400/60 bg-blue-900/50 hover:bg-red-600 flex items-center justify-center text-[9px] text-white transition-colors cursor-pointer"
              title="Reset Session"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive PC Game Top HUD Telemetry Bar */}
      <GameHudStatusBar isDarkMode={isDarkMode} />

      {/* Main Retro Software Header Bar */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#07132B]/95 backdrop-blur-md border-b-2 border-[#1455D9] px-4 md:px-8 py-3 transition-all duration-200 shadow-[0_4px_12px_rgba(20,85,217,0.08)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 select-none cursor-pointer group" onClick={() => window.location.reload()}>
            {/* Geometric starburst / 8-point retro cross glyph */}
            <div className="w-9 h-9 bg-[#1455D9] flex items-center justify-center border-2 border-[#0B2D78] shadow-[2px_2px_0px_#071B4D] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-tight text-[#071B4D] dark:text-white font-retro">
                  Carousel<span className="text-[#1455D9] dark:text-[#1D6BFF]">IN</span>
                </span>
                <span className="text-[9px] font-mono font-bold bg-[#EAF3FF] dark:bg-[#0B2D78] text-[#1455D9] dark:text-blue-300 px-1.5 py-0.5 border border-[#1455D9]/40 uppercase">
                  AI STUDIO
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 border border-amber-400/40 uppercase">
                  BY REI
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#0B2D78]/70 dark:text-blue-300/70 font-semibold tracking-wide">
                CREATIVE WORKSTATION &bull; DIBUAT OLEH REI
              </span>
            </div>
          </div>

          {/* Quick Toolbar Section */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Creator Badge & Link */}
            <a
              href="https://instagram.com/raihanfirdaus.id"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 border border-[#1455D9]/40 bg-[#EAF3FF] dark:bg-[#0B2D78] px-2.5 py-1 rounded-[2px] text-[10px] font-mono font-bold text-[#1455D9] dark:text-blue-200 hover:bg-[#1455D9] hover:text-white transition-all shadow-[1px_1px_0px_rgba(20,85,217,0.2)]"
              title="Kunjungi Instagram Resmi Rei (@raihanfirdaus.id)"
            >
              <Instagram className="w-3 h-3 text-[#1455D9] dark:text-blue-200 group-hover:text-white" />
              <span>@raihanfirdaus.id</span>
            </a>

            {/* Zoom Controls (Sharp retro box) */}
            <div className="hidden sm:flex items-center border-2 border-[#1455D9]/40 dark:border-[#1D6BFF]/40 bg-white dark:bg-[#0B1E48] rounded-[2px] overflow-hidden text-[#071B4D] dark:text-white font-mono text-xs shadow-[2px_2px_0px_rgba(20,85,217,0.2)]">
              <button 
                onClick={handleZoomOut}
                disabled={zoomLevel <= 60}
                className="px-2 py-1 hover:bg-[#EAF3FF] dark:hover:bg-[#1455D9]/30 border-r border-[#1455D9]/30 transition-colors disabled:opacity-40"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <div onClick={resetZoom} className="px-2 py-1 min-w-[48px] text-center cursor-pointer font-bold hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors" title="Reset Zoom">
                {zoomLevel}%
              </div>
              
              <button 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 150}
                className="px-2 py-1 hover:bg-[#EAF3FF] dark:hover:bg-[#1455D9]/30 border-l border-[#1455D9]/30 transition-colors disabled:opacity-40"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Info / About Button */}
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className="p-2 border-2 border-[#1455D9]/40 dark:border-[#1D6BFF]/40 rounded-[2px] text-[#071B4D] dark:text-white hover:bg-[#EAF3FF] dark:hover:bg-[#0B1E48] shadow-[2px_2px_0px_rgba(20,85,217,0.2)] transition-all bg-white dark:bg-[#07132B]"
              title="Tentang CarouselIN & Lisensi Tim Rei"
            >
              <Info className="w-4 h-4 text-[#1455D9] dark:text-[#1D6BFF]" />
            </button>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 border-2 border-[#1455D9]/40 dark:border-[#1D6BFF]/40 rounded-[2px] text-[#071B4D] dark:text-white hover:bg-[#EAF3FF] dark:hover:bg-[#0B1E48] shadow-[2px_2px_0px_rgba(20,85,217,0.2)] transition-all bg-white dark:bg-[#07132B]"
              title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
            >
              {isDarkMode ? <Moon className="w-4 h-4 text-[#1D6BFF]" /> : <Sun className="w-4 h-4 text-[#1455D9]" />}
            </button>
            
            {/* Language Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="px-2.5 py-1.5 border-2 border-[#1455D9]/40 dark:border-[#1D6BFF]/40 rounded-[2px] text-[#071B4D] dark:text-white font-mono font-bold text-xs flex items-center gap-1.5 hover:bg-[#EAF3FF] dark:hover:bg-[#0B1E48] shadow-[2px_2px_0px_rgba(20,85,217,0.2)] transition-all bg-white dark:bg-[#07132B] uppercase cursor-pointer"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#1455D9] dark:text-[#1D6BFF]" /> {language.toUpperCase()}
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute top-full mt-1.5 right-0 w-52 bg-white dark:bg-[#0B1E48] border-2 border-[#1455D9] rounded-[2px] shadow-[4px_4px_0px_#071B4D] dark:shadow-[4px_4px_0px_#030C22] p-1 z-50 font-tech animate-fade-in">
                  <div className="bg-[#0B2D78] text-white text-[9px] font-mono px-2 py-1 mb-1 font-bold tracking-wider flex items-center justify-between">
                    <span>SELECT LANGUAGE</span>
                    <span className="text-[8px] opacity-75">6 LANGUAGES</span>
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-2.5 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer rounded-[2px] ${language === lang.code ? 'bg-[#1455D9] text-white' : 'text-[#071B4D] dark:text-white hover:bg-[#EAF3FF] dark:hover:bg-[#1455D9]/30'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1 py-0.5 border border-current rounded-[1px] opacity-80">{lang.label}</span>
                        <span>{lang.native}</span>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scale With AI Badge */}
            <div className="hidden lg:flex items-center gap-1.5 border-2 border-[#1455D9]/30 bg-[#EAF3FF] dark:bg-[#0B2D78]/60 px-3 py-1.5 rounded-[2px] shadow-[2px_2px_0px_rgba(20,85,217,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#1455D9] dark:text-[#1D6BFF]" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#0B2D78] dark:text-blue-200">
                TIM REI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container with Zoom Transformation */}
      <main 
        className="flex-grow relative z-10 flex flex-col justify-start origin-top transition-transform duration-200 ease-out"
        style={{ 
          transform: `scale(${zoomLevel / 100})`,
          width: `${100 * (100 / zoomLevel)}%`,
          height: `${100 * (100 / zoomLevel)}%`
        }}
      >
        {children}
      </main>

      {/* Master Global Workstation Footer: Creator Profile & Blueprint Footer */}
      <footer className="relative z-20 w-full border-t-2 border-[#1455D9] bg-white dark:bg-[#060F22] text-[#071B4D] dark:text-slate-200 font-sans transition-colors mt-12">
        {/* Creator & Architect Profile Card (Matching Screenshot) */}
        <div className="w-full bg-[#F5F9FF] dark:bg-[#07132B] px-4 md:px-8 py-6 border-b-2 border-[#1455D9]">
          <CreatorProfileCard />
        </div>

        {/* Main Footer Body (Matching Screenshot) */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: Creator & Brand Info (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1455D9] flex items-center justify-center border-2 border-[#0B2D78] shadow-[2px_2px_0px_#071B4D]">
                  <span className="font-mono text-lg font-bold text-white leading-none">+</span>
                </div>
                <span className="font-retro font-black text-xl sm:text-2xl text-[#071B4D] dark:text-white uppercase tracking-tight">
                  CAROUSEL<span className="text-[#1455D9] dark:text-[#1D6BFF]">IN</span>
                </span>
                <span className="font-mono text-[9px] font-black bg-[#EAF3FF] dark:bg-[#0B2D78] text-[#1455D9] dark:text-blue-300 px-2 py-0.5 border border-[#1455D9]/40 rounded-[1px]">
                  AI CAROUSEL STUDIO
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-[#071B4D]/80 dark:text-slate-300 leading-relaxed max-w-md">
                Platform kecerdasan buatan untuk menghasilkan prompt carousel &amp; komik berkualitas tinggi, mengoptimalkan alur konten visual, dan memaksimalkan retensi audiens.
              </p>

              <div className="pt-1 font-mono text-[10px] sm:text-[11px] text-[#1455D9] dark:text-[#1D6BFF] font-bold">
                &gt;_ CORE ARCHITECTURE: REACT + TAILWIND + GEMINI AI
              </div>
            </div>

            {/* Column 2: Digital Tools Navigation (4 cols) */}
            <div className="md:col-span-4 space-y-3">
              <div className="font-mono text-xs font-black uppercase tracking-wider text-[#0B2D78] dark:text-blue-300 border-b-2 border-[#1455D9]/20 pb-1.5 flex items-center gap-2">
                <span>SEMUA ALAT DIGITAL</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono font-bold text-[#071B4D]/80 dark:text-slate-300">
                <span className="hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors cursor-default">&gt; Tentukan Niche 3-Level</span>
                <span className="hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors cursor-default">&gt; Generator Bio AI</span>
                <span className="hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors cursor-default">&gt; Analisis Profil &amp; Bio</span>
                <span className="hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors cursor-default">&gt; Inspirasi Bio Viral</span>
                <span className="hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors cursor-default">&gt; Bedah Bio</span>
                <span className="hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors cursor-default">&gt; Generator Username</span>
                <span className="hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors cursor-default">&gt; Caption Studio AI</span>
                <span className="hover:text-[#1455D9] dark:hover:text-[#1D6BFF] transition-colors cursor-default">&gt; AI Carousel Studio</span>
              </div>
            </div>

            {/* Column 3: System Status (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <div className="font-mono text-xs font-black uppercase tracking-wider text-[#0B2D78] dark:text-blue-300 border-b-2 border-[#1455D9]/20 pb-1.5 flex items-center gap-2">
                <span>STATUS_SISTEM: AKTIF // 2026.09</span>
              </div>

              <div className="p-3 bg-[#F5F9FF] dark:bg-[#0B1E48] border border-[#1455D9]/30 rounded-[2px] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Creator / Dev:</span>
                  <span className="font-bold text-[#071B4D] dark:text-white">REI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">License:</span>
                  <span className="font-bold text-[#F59E0B]">USER ONLY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">AI Engine:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">READY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Interface:</span>
                  <span className="font-bold text-[#1455D9] dark:text-[#1D6BFF]">RETRO DIGITAL</span>
                </div>
              </div>

              <p className="text-[10px] font-mono text-[#0B2D78]/70 dark:text-blue-300/70 uppercase">
                DIRANCANG UNTUK KREATOR, PROFESIONAL, &amp; PEMILIK BISNIS.
              </p>
            </div>

          </div>

          {/* Bottom Copyright Strip (Matching Screenshot) */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-[#1455D9]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left font-mono text-[11px] text-[#071B4D]/70 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#F59E0B] inline-block" />
              <span>CarouselIN AI System &bull; Dibuat oleh Rei &bull; User Only (Tidak untuk diperjualbelikan/diedit)</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B2D78] dark:text-blue-300">
              /// BLUEPRINT RETRO SYSTEM ///
            </div>
          </div>

        </div>
      </footer>

      {/* About/Info Modal Styled as a Retro Computer Window */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#071B4D]/70 backdrop-blur-xs"
            onClick={() => setIsInfoModalOpen(false)}
          ></div>

          {/* Modal Dialog Window */}
          <div className="bg-white dark:bg-[#07132B] border-2 border-[#1455D9] w-full max-w-2xl shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#030C22] rounded-[2px] relative z-10 max-h-[90vh] overflow-y-auto">
            {/* Window Titlebar */}
            <div className="bg-[#0B2D78] text-white p-3 flex items-center justify-between border-b-2 border-[#1455D9] sticky top-0 z-20">
              <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider">
                <Terminal className="w-4 h-4 text-[#1D6BFF]" />
                <span>[ DIALOG: TENTANG CAROUSELIN // DIBUAT OLEH REI ]</span>
              </div>
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="w-6 h-6 border border-white/40 bg-blue-900/60 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Window Body */}
            <div className="p-6 md:p-8 space-y-6">
               {/* Strict Warning Box in Modal */}
               <div className="border-2 border-[#B91C1C] bg-red-50/70 dark:bg-red-950/30 p-4 rounded-[2px] space-y-2">
                 <div className="flex items-center gap-2 text-[#B91C1C] dark:text-red-400 font-mono text-xs font-black uppercase">
                   <ShieldAlert className="w-4 h-4 shrink-0" />
                   <span>Pemberitahuan Lisensi & Hak Cipta Tim Rei</span>
                 </div>
                 <p className="text-xs text-red-900 dark:text-red-200 font-bold leading-relaxed">
                   Aplikasi ini dibuat oleh <strong>Rei</strong>. Aplikasi ini <strong>TIDAK BOLEH</strong> diperjualbelikan, diedit, atau dibuat/dimodifikasi dalam bentuk apa pun tanpa izin tertulis dari Tim Rei.
                 </p>
                 <div className="pt-2 border-t border-red-200 dark:border-red-900/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                   <div className="text-slate-800 dark:text-slate-200">
                     <strong>WhatsApp:</strong> 0857-1804-8258
                   </div>
                   <div className="text-slate-800 dark:text-slate-200">
                     <strong>Gmail:</strong> muhammadraihanf672@gmail.com
                   </div>
                   <div className="text-slate-800 dark:text-slate-200 col-span-full">
                     <strong>Akun Sosmed:</strong> @raihanfirdaus.id &bull; @ngontenbarengrei &bull; @muslimpreneur.hub
                   </div>
                 </div>
               </div>

               {/* Description */}
               <div className="border-l-4 border-[#1455D9] bg-[#EAF3FF]/50 dark:bg-[#0B1E48]/40 p-4 rounded-[2px]">
                  <h3 className="text-sm font-black uppercase font-tech text-[#0B2D78] dark:text-[#1D6BFF] mb-1">
                    CarouselIN Platform Overview &bull; Created by Rei
                  </h3>
                  <p className="text-sm font-medium text-[#071B4D] dark:text-slate-200 leading-relaxed">
                    {t('about_desc')}
                  </p>
               </div>

               {/* Features */}
               <div className="border-2 border-[#1455D9]/30 dark:border-[#1D6BFF]/30 p-5 rounded-[2px] bg-[#F5F9FF] dark:bg-[#0B1E48]/50">
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-[#0B2D78] dark:text-blue-300">
                    <Star className="w-4 h-4 text-[#1455D9] fill-[#1455D9]" /> {t('about_features')}
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                     {[t('feat_1'), t('feat_2'), t('feat_3'), t('feat_4')].map((feat, idx) => (
                       <li key={idx} className="flex items-start gap-2 text-xs font-bold text-[#071B4D] dark:text-slate-200">
                         <Check className="w-3.5 h-3.5 text-[#1455D9] dark:text-[#1D6BFF] mt-0.5 shrink-0" /> {feat}
                       </li>
                     ))}
                  </ul>
               </div>

               {/* How To Use */}
               <div className="border-2 border-[#1455D9]/30 dark:border-[#1D6BFF]/30 p-5 rounded-[2px]">
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-[#0B2D78] dark:text-blue-300">
                    <Zap className="w-4 h-4 text-[#1455D9]" /> {t('about_howto')}
                  </h3>
                  <div className="space-y-3">
                    {[t('step_1'), t('step_2'), t('step_3'), t('step_4')].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="bg-[#1455D9] text-white w-6 h-6 flex items-center justify-center font-mono font-black text-xs shrink-0 rounded-[2px]">
                          0{idx + 1}
                        </div>
                        <p className="text-xs font-semibold text-[#071B4D] dark:text-slate-200">{step}</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Footer / Action */}
               <div className="border-t-2 border-dashed border-[#1455D9]/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                  <span className="text-xs text-[#0B2D78] dark:text-blue-300 font-bold">
                    {t('version')} &bull; AUTHOR: REI
                  </span>
                  <button 
                    onClick={() => setIsInfoModalOpen(false)}
                    className="w-full sm:w-auto px-8 py-2.5 bg-[#1455D9] hover:bg-[#1D6BFF] text-white font-black text-xs uppercase tracking-wider border-2 border-[#0B2D78] shadow-[3px_3px_0px_#071B4D] rounded-[2px] transition-all"
                  >
                    {t('close')}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
