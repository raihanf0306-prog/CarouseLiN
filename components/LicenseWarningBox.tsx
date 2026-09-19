import React, { useState } from 'react';
import { ShieldAlert, Lock, Check, Copy } from 'lucide-react';

interface LicenseWarningBoxProps {
  className?: string;
  appName?: string;
  showCopyNotice?: boolean;
}

export const LicenseWarningBox: React.FC<LicenseWarningBoxProps> = ({
  className = '',
  appName = 'CarouselIN',
  showCopyNotice = true,
}) => {
  const [copied, setCopied] = useState(false);

  const noticeText = `PERINGATAN LISENSI RESMI // USER ONLY PROTOCOL
APLIKASI INI DIKHUSUSKAN UNTUK PENGGUNA AKHIR (USER ONLY)
Aplikasi ${appName} dirancang & dibangun oleh Rei. Aplikasi ini berstatus USER ONLY dan TIDAK BOLEH DIPERJUALBELIKAN, DIKOMERSIALKAN ULANG, MAUPUN DIEDIT/DIMODIFIKASI tanpa izin tertulis dari pembuat.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="license-warning-box" className={`w-full max-w-7xl mx-auto ${className}`}>
      {/* Outer Retro Blueprint Warning Frame */}
      <div className="relative group">
        
        {/* Main Box */}
        <div className="relative z-10 w-full bg-[#06142E] dark:bg-[#050E23] border-2 border-[#F59E0B] p-4 sm:p-5 md:p-6 rounded-[2px] shadow-[4px_4px_0px_rgba(245,158,11,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          
          {/* Top-Right Technical Corner Bracket (from screenshot) */}
          <div className="absolute top-2 right-2 font-mono text-sm text-[#F59E0B] font-bold select-none pointer-events-none opacity-90">
            ┐
          </div>

          {/* Bottom-Left Technical Square Tick (from screenshot) */}
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#F59E0B] select-none pointer-events-none" />

          {/* Left Icon + Middle Information */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 md:gap-5 flex-1 min-w-0">
            
            {/* Left Golden Yellow Icon Badge */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#F59E0B] flex items-center justify-center rounded-[3px] shrink-0 shadow-[2px_2px_0px_#071B4D]">
              <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#06142E] stroke-[2.4]" />
            </div>

            {/* Text & Content Block */}
            <div className="flex-1 min-w-0 space-y-1">
              
              {/* Badge & Monospace Protocol Header */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#F59E0B] text-[#06142E] font-mono font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-[1px] tracking-wider uppercase shadow-xs">
                  PERINGATAN LISENSI RESMI
                </span>
                <span className="text-[#F59E0B] font-mono font-bold text-[10px] sm:text-[11px] tracking-wider uppercase">
                  // USER ONLY PROTOCOL
                </span>
              </div>

              {/* Main Headline Title */}
              <h4 className="text-white font-black text-sm sm:text-base md:text-lg tracking-tight uppercase font-sans pt-0.5 leading-snug">
                APLIKASI INI DIKHUSUSKAN UNTUK PENGGUNA AKHIR (USER ONLY)
              </h4>

              {/* Description Paragraph with Highlights */}
              <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal pt-0.5">
                Aplikasi{' '}
                <strong className="text-white font-extrabold underline decoration-[#F59E0B] decoration-2 underline-offset-2">
                  {appName}
                </strong>{' '}
                dirancang &amp; dibangun oleh{' '}
                <strong className="text-white font-extrabold underline decoration-[#F59E0B] decoration-2 underline-offset-2">
                  Rei
                </strong>
                . Aplikasi ini berstatus{' '}
                <strong className="text-[#FACC15] font-black">
                  USER ONLY
                </strong>{' '}
                dan{' '}
                <strong className="text-[#FACC15] font-black underline decoration-[#F59E0B] decoration-2 underline-offset-2">
                  TIDAK BOLEH DIPERJUALBELIKAN, DIKOMERSIALKAN ULANG, MAUPUN DIEDIT/DIMODIFIKASI
                </strong>{' '}
                tanpa izin tertulis dari pembuat.
              </p>
            </div>
          </div>

          {/* Right Action / Security Pill Badge */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center pt-2 md:pt-0">
            <div
              className="flex items-center gap-2 px-3.5 py-2 border-2 border-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 transition-all rounded-[2px] font-mono text-[10px] sm:text-[11px] font-black text-[#FACC15] uppercase tracking-wider shadow-[2px_2px_0px_rgba(245,158,11,0.2)] select-none"
              title="Hak Cipta & Lisensi Dilindungi: User Only"
            >
              <Lock className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />
              <span className="whitespace-nowrap">NON-COMMERCIAL / PROTECTED</span>
            </div>

            {showCopyNotice && (
              <button
                id="license-copy-btn"
                onClick={handleCopy}
                className="hidden sm:flex items-center justify-center p-2 border border-[#F59E0B]/40 bg-[#06142E] hover:bg-[#F59E0B]/20 text-[#FACC15] rounded-[2px] transition-all"
                title={copied ? 'Disalin!' : 'Salin Klausul Lisensi'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Secondary Bottom Double-Border Blueprint Accent (from screenshot) */}
        <div className="relative w-full flex items-center mt-1 select-none pointer-events-none">
          <div className="w-2 h-2 border-b-2 border-l-2 border-[#F59E0B] shrink-0 -mt-1" />
          <div className="h-[2px] bg-[#F59E0B] flex-1 ml-1" />
        </div>

      </div>
    </div>
  );
};
