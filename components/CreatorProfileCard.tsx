import React, { useState } from 'react';
import { User, Phone, Mail, ExternalLink, Copy, Check, Share2 } from 'lucide-react';

interface CreatorProfileCardProps {
  className?: string;
}

export const CreatorProfileCard: React.FC<CreatorProfileCardProps> = ({ className = '' }) => {
  const [copiedWA, setCopiedWA] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyWA = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText('085718048258');
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2000);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText('muhammadraihanf672@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      <div className="relative bg-white dark:bg-[#0B1E48] border-2 border-[#1455D9] rounded-[2px] p-5 sm:p-6 md:p-7 shadow-[4px_4px_0px_#071B4D] dark:shadow-[4px_4px_0px_#030C22] text-[#071B4D] dark:text-white">
        
        {/* Top-Right Technical Corner Bracket */}
        <div className="absolute top-2 right-2 font-mono text-sm text-[#1455D9] dark:text-blue-300 font-bold select-none pointer-events-none opacity-80">
          ┐
        </div>

        {/* Bottom-Left Technical Square Tick */}
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#1455D9] dark:bg-[#1D6BFF] select-none pointer-events-none" />

        {/* Top Row: Avatar, Badges, Title, Contacts */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#1455D9]/20 dark:border-blue-500/20">
          
          {/* Avatar & Title Info */}
          <div className="flex items-start sm:items-center gap-4">
            {/* User Icon Box */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#1455D9] flex items-center justify-center rounded-[2px] shrink-0 shadow-[2px_2px_0px_#071B4D] text-white">
              <User className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#0B2D78] text-white font-mono font-black text-[10px] px-2 py-0.5 rounded-[1px] tracking-wider uppercase">
                  CREATOR &amp; ARCHITECT
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] px-2 py-0.5 rounded-[1px] tracking-wider uppercase flex items-center gap-1">
                  ✓ VERIFIED_DEV
                </span>
              </div>

              {/* Heading */}
              <h3 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-[#071B4D] dark:text-white">
                DIBUAT OLEH: REI
              </h3>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-[#071B4D]/80 dark:text-slate-300 font-medium leading-relaxed">
                Personal Branding Strategist &amp; Creator of BrandIn AI Blueprint System.
              </p>
            </div>
          </div>

          {/* Contact Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            {/* WhatsApp Button */}
            <div className="flex items-center gap-1 w-full">
              <a
                href="https://wa.me/6285718048258?text=Halo%20Rei,%20saya%20ingin%20berdiskusi%20mengenai%20BrandIn%20/%20CarouselIN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-mono text-xs font-black rounded-[2px] border border-emerald-700 shadow-[2px_2px_0px_#14532D] flex items-center justify-between gap-2.5 transition-all"
                title="Buka WhatsApp Resmi Rei"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>WA: 0857-1804-8258</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                onClick={handleCopyWA}
                className="px-2.5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-[2px] border border-emerald-700 shadow-[2px_2px_0px_#14532D] transition-all"
                title={copiedWA ? 'Disalin!' : 'Salin Nomor WA'}
              >
                {copiedWA ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>

            {/* Email Button */}
            <div className="flex items-center gap-1 w-full">
              <a
                href="mailto:muhammadraihanf672@gmail.com"
                className="flex-1 px-4 py-2.5 bg-[#EAB308] hover:bg-[#CA8A04] text-[#071B4D] font-mono text-xs font-black rounded-[2px] border border-yellow-700 shadow-[2px_2px_0px_#713F12] flex items-center justify-between gap-2.5 transition-all"
                title="Kirim Email ke Muhammad Raihan"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">muhammadraihanf672@gmail.com</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
              </a>
              <button
                onClick={handleCopyEmail}
                className="px-2.5 py-2.5 bg-[#CA8A04] hover:bg-[#A16207] text-[#071B4D] rounded-[2px] border border-yellow-700 shadow-[2px_2px_0px_#713F12] transition-all shrink-0"
                title={copiedEmail ? 'Disalin!' : 'Salin Email'}
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-[#071B4D]" />}
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Section: Social Media Handles */}
        <div className="pt-5">
          <div className="flex items-center justify-between text-xs font-mono font-black uppercase text-[#0B2D78] dark:text-blue-300 mb-3">
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#1455D9] dark:text-[#1D6BFF]" />
              AKUN MEDIA SOSIAL RESMI REI:
            </span>
            <span className="text-[10px] text-[#0B2D78]/60 dark:text-blue-300/60 font-bold">
              3 OFFICIAL HANDLES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Handle 01: Personal */}
            <a
              href="https://www.instagram.com/raihanfirdaus.id"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#0B2D78] hover:bg-[#1455D9] text-white rounded-[2px] border border-blue-900 transition-all shadow-[2px_2px_0px_#071B4D] flex items-center justify-between group"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-mono text-[9px] font-bold text-[#FACC15] uppercase tracking-wider">
                  01 // PERSONAL
                </div>
                <div className="font-mono text-xs sm:text-sm font-black truncate group-hover:text-white">
                  @raihanfirdaus.id
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </a>

            {/* Handle 02: Content & Tips */}
            <a
              href="https://www.instagram.com/ngontenbarengrei"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#0B2D78] hover:bg-[#1455D9] text-white rounded-[2px] border border-blue-900 transition-all shadow-[2px_2px_0px_#071B4D] flex items-center justify-between group"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-mono text-[9px] font-bold text-[#FACC15] uppercase tracking-wider">
                  02 // CONTENT &amp; TIPS
                </div>
                <div className="font-mono text-xs sm:text-sm font-black truncate group-hover:text-white">
                  @ngontenbarengrei
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </a>

            {/* Handle 03: Community */}
            <a
              href="https://www.instagram.com/muslimpreneur.hub"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#0B2D78] hover:bg-[#1455D9] text-white rounded-[2px] border border-blue-900 transition-all shadow-[2px_2px_0px_#071B4D] flex items-center justify-between group"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-mono text-[9px] font-bold text-[#FACC15] uppercase tracking-wider">
                  03 // COMMUNITY
                </div>
                <div className="font-mono text-xs sm:text-sm font-black truncate group-hover:text-white">
                  @muslimpreneur.hub
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </a>

          </div>
        </div>

      </div>
    </div>
  );
};
