
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { playGameSound } from './GameUiElements';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  isLoading?: boolean;
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading, 
  icon: Icon, 
  onClick,
  ...props 
}) => {
  const baseStyle = "relative inline-flex items-center justify-center px-5 py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider rounded-[2px] transition-all duration-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none font-mono cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none group overflow-hidden";
  
  const variants = {
    primary: "bg-[#1455D9] hover:bg-[#1D6BFF] text-white border-2 border-[#071B4D] shadow-[3px_3px_0px_#071B4D] dark:border-[#38BDF8] dark:shadow-[3px_3px_0px_#020714]",
    secondary: "bg-[#0B2D78] hover:bg-[#1455D9] text-white border-2 border-[#071B4D] shadow-[3px_3px_0px_#071B4D] dark:border-blue-500/60 dark:shadow-[3px_3px_0px_#020714]",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-[#064e3b] shadow-[3px_3px_0px_#064e3b]",
    outline: "bg-white dark:bg-[#071536] text-[#1455D9] dark:text-blue-300 border-2 border-[#1455D9] hover:bg-blue-50 dark:hover:bg-[#0B2D78]/60 shadow-[3px_3px_0px_#1455D9] dark:shadow-[3px_3px_0px_#020714]",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playGameSound(variant === 'primary' || variant === 'success' ? 'confirm' : 'blip');
    if (onClick) onClick(e);
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} onClick={handleClick} {...props}>
      {/* Mini PC Game Corner Notch Accents */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white/60 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-white/60 pointer-events-none" />
      
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4" />
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => (
  <div className="w-full relative">
    {label && (
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B2D78] dark:text-blue-300">
          <span className="text-[#1455D9] dark:text-[#38BDF8] font-pixel text-[9px]">&#9658;</span>
          {label}
        </label>
        <span className="font-pixel text-[7px] text-[#1455D9]/50 dark:text-[#38BDF8]/50">[IN_VAL]</span>
      </div>
    )}
    <div className="relative">
      <input
        id={id}
        className={`appearance-none block w-full px-3.5 py-2.5 border-2 border-[#1455D9]/40 dark:border-blue-500/40 rounded-[2px] shadow-[2px_2px_0px_rgba(20,85,217,0.15)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1455D9] dark:focus:border-[#38BDF8] focus:shadow-[3px_3px_0px_#1455D9] text-sm bg-white dark:bg-[#06122C] text-[#071B4D] dark:text-white transition-all font-mono ${className}`}
        {...props}
      />
      {/* PC Game input corner notches */}
      <span className="absolute top-0 right-0 w-1 h-1 bg-[#1455D9]/60 dark:bg-[#38BDF8]/60 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-1 h-1 bg-[#1455D9]/60 dark:bg-[#38BDF8]/60 pointer-events-none" />
    </div>
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, className = '', ...props }) => (
  <div className="w-full relative">
    {label && (
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B2D78] dark:text-blue-300">
          <span className="text-[#1455D9] dark:text-[#38BDF8] font-pixel text-[9px]">&#9658;</span>
          {label}
        </label>
        <span className="font-pixel text-[7px] text-[#1455D9]/50 dark:text-[#38BDF8]/50">[TXT_BLOCK]</span>
      </div>
    )}
    <div className="relative">
      <textarea
        id={id}
        rows={4}
        className={`appearance-none block w-full px-3.5 py-2.5 border-2 border-[#1455D9]/40 dark:border-blue-500/40 rounded-[2px] shadow-[2px_2px_0px_rgba(20,85,217,0.15)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1455D9] dark:focus:border-[#38BDF8] focus:shadow-[3px_3px_0px_#1455D9] text-sm bg-white dark:bg-[#06122C] text-[#071B4D] dark:text-white transition-all resize-none font-mono ${className}`}
        {...props}
      />
      <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#1455D9] dark:border-[#38BDF8] pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#1455D9] dark:border-[#38BDF8] pointer-events-none" />
    </div>
  </div>
);

interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
}

export const Select: React.FC<SelectProps> = ({ label, id, options, groups, className = '', ...props }) => (
  <div className="w-full relative">
    {label && (
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B2D78] dark:text-blue-300">
          <span className="text-[#1455D9] dark:text-[#38BDF8] font-pixel text-[9px]">&#9658;</span>
          {label}
        </label>
        <span className="font-pixel text-[7px] text-[#1455D9]/50 dark:text-[#38BDF8]/50">[SELECT_MOD]</span>
      </div>
    )}
    <div className="relative">
      <select
        id={id}
        className={`appearance-none block w-full pl-3.5 pr-9 py-2.5 text-sm border-2 border-[#1455D9]/40 dark:border-blue-500/40 focus:outline-none focus:border-[#1455D9] dark:focus:border-[#38BDF8] focus:shadow-[3px_3px_0px_#1455D9] rounded-[2px] bg-white dark:bg-[#06122C] text-[#071B4D] dark:text-white transition-all cursor-pointer font-mono shadow-[2px_2px_0px_rgba(20,85,217,0.15)] ${className}`}
        {...props}
      >
        {groups ? (
          groups.map((group, idx) => (
            <optgroup key={idx} label={group.label} className="bg-white dark:bg-[#06122C] text-[#071B4D] dark:text-blue-300 font-bold">
              {group.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#06122C] text-[#071B4D] dark:text-white font-normal">
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))
        ) : (
          options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#06122C] text-[#071B4D] dark:text-white">
              {opt.label}
            </option>
          ))
        )}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#1455D9] dark:text-[#38BDF8] font-pixel text-[10px]">
        &#9660;
      </div>
      <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#1455D9] dark:border-[#38BDF8] pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#1455D9] dark:border-[#38BDF8] pointer-events-none" />
    </div>
  </div>
);
