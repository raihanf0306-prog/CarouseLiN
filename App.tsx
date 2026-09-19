
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LicenseWarningBox } from './components/LicenseWarningBox';
import { Button, Input, Select, TextArea, SelectGroup } from './components/UI';
import { ArrowRight, ArrowLeft, Wand2, Copy, RefreshCw, CheckCircle, User, Image as ImageIcon, Mail, AlertTriangle, Sparkles, LayoutTemplate, Palette, BookOpen, Zap, ShieldAlert, GalleryHorizontal, Upload, ListOrdered, Check, SlidersHorizontal, Workflow, Heart, Loader2, Hash, Languages, Grid, Tag, Type, Target, MessageSquare, CheckSquare, FileText, Maximize, Globe, Sliders, Send, Bookmark, Monitor, Layers, FileDown, Instagram, Phone, ExternalLink, Lock } from 'lucide-react';
import { AppStep, PosterMode, FormData, INITIAL_DATA, AspectRatio, Gender, TargetAudience, VisualStyle, CarouselType, Platform, LanguageStyle, Genre, HookType, ColorStyle, AccentColor } from './types';
import { generateAutoFillContent, generateSequentialPrompts, SequentialPrompt } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';
import { translations, getTranslatedLabels } from './translations'; 
import { GoogleGenAI } from '@google/genai';
import { GameCornerReticles, PixelMatrixCluster, GameTechRuler, GameHazardTape, playGameSound, RetroBlueDecorBoxes } from './components/GameUiElements';

// Helper to convert camelCase to snake_case for translation keys
const camelCaseToSnakeCase = (name: string) => {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase();
};

// --- SMART PRESET LIBRARY ---
// Moved inside App component to support translations

// Updated UploadBox component to handle multiple file previews and removal
interface UploadBoxProps {
  title: string;
  category: string;
  files: Array<File | null>;
  onFilesChange: (category: string, files: Array<File | null>) => void;
}

const UploadBox: React.FC<UploadBoxProps> = ({ title, category, files, onFilesChange }) => {
  const { t } = useLanguage();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State to store object URLs associated with files for proper cleanup
  const [fileObjectUrls, setFileObjectUrls] = useState<Array<string | null>>(files.map(file => file ? URL.createObjectURL(file) : null));

  // Update object URLs when the `files` prop changes from the parent
  useEffect(() => {
    setFileObjectUrls(prevUrls => {
      const newUrls: (string | null)[] = [];
      const urlsToRevoke: string[] = [...prevUrls.filter(Boolean) as string[]]; 

      files.forEach((file, index) => {
        if (file) {
          const oldFileIndex = files.findIndex((oldFile, oldIdx) => oldFile === file && prevUrls[oldIdx] !== null);
          if (oldFileIndex !== -1) {
            newUrls[index] = prevUrls[oldFileIndex];
            const revokeIndex = urlsToRevoke.indexOf(prevUrls[oldFileIndex]!);
            if (revokeIndex > -1) urlsToRevoke.splice(revokeIndex, 1);
          } else {
            newUrls[index] = URL.createObjectURL(file);
          }
        } else {
          newUrls[index] = null;
        }
      });

      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
      return newUrls;
    });
  }, [files]); 

  // Cleanup effect for when the component unmounts
  useEffect(() => {
    return () => {
      fileObjectUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [fileObjectUrls]); 

  const currentFileCount = files.filter(f => f !== null).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0] || null;
    const newFiles = [...files];

    if (newFiles[index] && fileObjectUrls[index]) {
      URL.revokeObjectURL(fileObjectUrls[index]!);
    }

    newFiles[index] = file;
    onFilesChange(category, newFiles); 
    e.target.value = ''; 
  };

  const removeImage = (index: number) => {
    if (fileObjectUrls[index]) {
      URL.revokeObjectURL(fileObjectUrls[index]!); 
    }
    const newFiles = [...files];
    newFiles[index] = null;
    const filteredFiles = newFiles.filter(f => f !== null);
    onFilesChange(category, [...filteredFiles, null, null].slice(0, 3)); 
  };

  const triggerUpload = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  return (
    <div className="bg-white dark:bg-[#07132B] border-2 border-[#1455D9] p-5 rounded-[2px] shadow-[4px_4px_0px_#071B4D] dark:shadow-[4px_4px_0px_#020714] hover:border-[#1D6BFF] transition-all group relative">
      <div className="flex justify-between items-center mb-3.5 border-b-2 border-[#1455D9]/20 dark:border-[#1D6BFF]/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[9px] text-[#1455D9] dark:text-blue-400">&#9658;</span>
          <span className="font-tech font-black text-xs uppercase tracking-wider text-[#071B4D] dark:text-white">{title}</span>
        </div>
        <span className="bg-[#EAF3FF] dark:bg-[#0B2D78] text-[#1455D9] dark:text-blue-300 text-[9px] font-pixel px-2 py-0.5 border border-[#1455D9]/40 rounded-[2px] shadow-[1px_1px_0px_#071B4D] dark:shadow-[1px_1px_0px_black]">
          SLOT {currentFileCount}/3
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5"> 
        {files.map((file, index) => (
          <div
            key={index}
            className="relative w-full h-24 border-2 border-dashed border-[#1455D9]/40 dark:border-[#1D6BFF]/40 bg-[#F5F9FF] dark:bg-[#0B1E48]/50 flex flex-col items-center justify-center text-[#0B2D78]/70 dark:text-blue-300/70 gap-1 cursor-pointer group/slot hover:border-[#1455D9] hover:bg-blue-50/70 dark:hover:bg-[#0B2D78]/60 transition-all overflow-hidden rounded-[2px]"
            onClick={() => !file && triggerUpload(index)} 
          >
            <input
              type="file"
              ref={el => fileInputRefs.current[index] = el}
              onChange={(e) => handleFileChange(e, index)}
              className="hidden"
              accept="image/*"
              disabled={!!file} 
            />
            {file && fileObjectUrls[index] ? (
              <>
                <img
                  src={fileObjectUrls[index]!} 
                  alt={`Preview ${index}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }} 
                  className="absolute top-1 right-1 w-5 h-5 bg-[#071B4D] hover:bg-red-600 text-white flex items-center justify-center font-pixel text-[9px] transition-all z-10 border border-white/40 rounded-[2px] shadow-[1px_1px_0px_black]"
                  aria-label={t('remove_image_alt_text')} 
                >
                  &times;
                </button>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-[#1455D9] dark:text-[#1D6BFF] group-hover/slot:-translate-y-0.5 transition-transform" />
                <span className="text-[8px] font-pixel text-[#1455D9] dark:text-blue-400 uppercase tracking-widest">{t('box_click')}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const DisclaimerFooter = ({ className = 'mt-8 sm:mt-10' }: { className?: string }) => (
  <div className={`w-full ${className}`}>
    <LicenseWarningBox appName="CarouselIN" />
  </div>
);

// --- FORM HELPERS ---

const FormSection = ({ title, icon: Icon, children, subtitle }: { title: string, icon: any, children: React.ReactNode, subtitle?: string }) => (
  <div className="bg-white dark:bg-[#07132B] border-2 border-[#1455D9] rounded-[2px] p-6 md:p-8 shadow-[5px_5px_0px_#071B4D] dark:shadow-[5px_5px_0px_#020714] transition-all mb-8 relative group">
    {/* PC Game Tactical L-Brackets on All 4 Corners */}
    <GameCornerReticles size="md" />

    {/* Top Game Tech Ruler */}
    <div className="mb-4">
      <GameTechRuler label="SUB_ROUTINE" className="opacity-70" />
    </div>

    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#1455D9]/20 dark:border-[#1D6BFF]/20">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-[#1455D9] text-white rounded-[2px] border-2 border-[#071B4D] dark:border-[#38BDF8] shadow-[2px_2px_0px_#071B4D] shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-[#071B4D] dark:text-white font-retro leading-none mb-1">{title}</h3>
          {subtitle && <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B2D78]/80 dark:text-blue-300/80">{subtitle}</p>}
        </div>
      </div>

      {/* Decorative Checkered Pixel Boxes & Status Badge */}
      <div className="flex items-center gap-3">
        <PixelMatrixCluster pattern="3x3" className="hidden sm:grid" />
        <span className="hidden sm:inline-block font-pixel text-[8px] text-[#1455D9] dark:text-[#38BDF8] uppercase tracking-widest border border-[#1455D9]/40 dark:border-[#38BDF8]/40 bg-[#EAF3FF] dark:bg-[#0B2D78]/50 px-2 py-1 rounded-[1px]">
          [SYS_OK // 0x2A]
        </span>
      </div>
    </div>
    {children}

    {/* Bottom Game Ruler Line */}
    <div className="mt-6 pt-3 border-t border-[#1455D9]/15 dark:border-blue-500/20 flex items-center justify-between font-mono text-[8px] text-[#1455D9]/60 dark:text-blue-400/60 select-none">
      <span>[STATUS: READY]</span>
      <div className="flex items-center gap-1 font-pixel text-[7px]">
        <span>■ ■ ■ ■ □ □</span>
      </div>
      <span>[CRC_VALID]</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.MENU);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [generatedPrompts, setGeneratedPrompts] = useState<SequentialPrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<{
    char: Array<File | null>;
    logo: Array<File | null>;
    ref: Array<File | null>;
    theme: Array<File | null>;
    attr: Array<File | null>;
  }>({
    char: [null, null, null],
    logo: [null, null, null],
    ref: [null, null, null],
    theme: [null, null, null],
    attr: [null, null, null],
  });
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const { language, t } = useLanguage();

  const PRESET_LIBRARY: Record<string, Partial<FormData>> = React.useMemo(() => ({
    // --- CAROUSEL PRESETS ---
    'carousel_edu_general': {
      mode: PosterMode.CAROUSEL,
      carouselType: CarouselType.MASALAH_SOLUSI_KESIMPULAN, 
      platform: Platform.INSTAGRAM_CAROUSEL,
      languageStyle: LanguageStyle.RELAXED, 
      topic: 'Sejarah Indonesia',
      title: t('preset_carousel_edu_general_title'),
      material: 'Slide 1: Latar Belakang Penjajahan\nSlide 2: Pergerakan Nasional\nSlide 3: Proklamasi 17 Agustus 1945\nSlide 4: Tokoh Proklamator\nSlide 5: Makna Kemerdekaan',
      slideCount: '5 Slides',
      cta: 'Pelajari lebih lanjut sejarah kita!',
      ctaActive: true, 
      funFact: '', 
      funFactActive: false,
      visualTheme: 'Nuansa Merah Putih, Semangat Nasional, Ilustrasi Vintage',
      visualStyle: VisualStyle.VECTOR,
      targetAudience: TargetAudience.MAHASISWA,
      size: AspectRatio.R_1_1,
    },
    'carousel_commercial_umkm_promo': {
      mode: PosterMode.CAROUSEL,
      carouselType: CarouselType.HOOK_ISI_PENUTUP, 
      platform: Platform.INSTAGRAM_CAROUSEL,
      languageStyle: LanguageStyle.STORYTELLING, 
      topic: 'Promosi Produk Kopi',
      title: 'KOPI NIKMAT PAGI HARI',
      material: 'Slide 1: Intro Produk & Branding\nSlide 2: Varian Rasa (Hazelnut, Vanilla, Original)\nSlide 3: Cara Penyajian Mudah\nSlide 4: Testimoni Pelanggan\nSlide 5: Promo Spesial Hari Ini',
      slideCount: '5 Slides',
      cta: 'Order Sekarang via WhatsApp!',
      ctaActive: true, 
      funFact: 'Did you know that coffee beans are actually seeds of a fruit?', 
      funFactActive: true, 
      socialAccount: '@kopi_nikmat_id',
      visualTheme: 'Minimalis Modern, Kopi Aesthetic, Warna Coklat & Beige',
      visualStyle: VisualStyle.PHOTOREALISTIC,
      targetAudience: TargetAudience.PEBISNIS,
      size: AspectRatio.R_1_1,
    },
  }), [t]);
  const {
    genderLabels,
    targetAudienceLabels,
    visualStyleLabels,
    visualThemeLabels,
    carouselTypeLabels,
    platformLabels, 
    languageStyleLabels, 
    genreLabels,
    hookTypeLabels,
    colorStyleLabels,
    accentColorLabels,
  } = getTranslatedLabels(language);

  const updateData = (key: keyof FormData, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleAssetFilesChange = (category: string, files: Array<File | null>) => {
    setUploadedAssets(prev => ({
      ...prev,
      [category]: files,
    }));
  };

  const handleCopy = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isCarousel = formData.mode === PosterMode.CAROUSEL;

  const handlePresetChange = (presetKey: string) => {
    updateData('preset', presetKey);
    if (presetKey && PRESET_LIBRARY[presetKey]) {
      setFormData(prev => ({ ...prev, ...PRESET_LIBRARY[presetKey], preset: presetKey }));
      setUploadedAssets({
        char: [null, null, null],
        logo: [null, null, null],
        ref: [null, null, null],
        attr: [null, null, null],
      });
    }
  };


  const autoFill = async (context: any = 'topic') => {
    setIsAutofilling(true);
    try {
      const generatedData = await generateAutoFillContent(
        formData.mode || PosterMode.CAROUSEL,
        { 
          ...formData, 
          targetAudience: formData.targetAudience as TargetAudience, 
          carouselType: formData.carouselType as CarouselType,
          platform: formData.platform as Platform, 
          languageStyle: formData.languageStyle as LanguageStyle, 
        }, 
        context,
        language
      );
      if (generatedData) {
        if (context === 'funFact') {
          updateData('funFact', generatedData.funFact || '');
        } else if (context === 'cta') {
          updateData('cta', generatedData.cta || '');
        } else {
          setFormData(prev => ({ ...prev, ...generatedData }));
        }
      }
    } catch (e) {
      console.error(e);
      if (isCarousel) {
        if (context === 'topic') updateData('topic', t('fallback_carousel_topic'));
        if (context === 'title') updateData('title', t('fallback_carousel_title'));
        if (context === 'material') updateData('material', t('fallback_carousel_material'));
        if (context === 'cta' && formData.ctaActive) updateData('cta', t('fallback_carousel_cta'));
        if (context === 'funFact' && formData.funFactActive) {
          updateData('funFact', formData.topic ? t('ph_fun_fact_topic_auto_fill').replace('{topic}', formData.topic) : t('ph_fun_fact_default_auto_fill'));
        }
        updateData('carouselType', formData.carouselType || CarouselType.POSTER_DAKWAH);
        updateData('slideCount', formData.slideCount || `5 ${t('label_slides')}`);
        updateData('platform', formData.platform || Platform.INSTAGRAM_CAROUSEL);
        updateData('languageStyle', formData.languageStyle || LanguageStyle.RELAXED); 
        updateData('size', AspectRatio.R_1_1);
        updateData('visualTheme', t('fallback_carousel_theme'));
      }
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleGeneratePrompts = async () => {
    setIsGenerating(true);
    setStep(AppStep.RESULT);
    try {
      // Add theme info to a copy of formData if theme images exist
      const themeCount = uploadedAssets.theme.filter(f => f !== null).length;
      let enrichedFormData = { ...formData };
      if (themeCount > 0) {
        const themeContext = `[MANDATORY VISUAL STYLE REFERENCE]: User has provided ${themeCount} style/theme reference images. Strictly follow the visual aesthetic, lighting, color palette, and overall theme from these images in your visual descriptions.`;
        enrichedFormData.additionalPrompt = enrichedFormData.additionalPrompt 
          ? `${enrichedFormData.additionalPrompt}\n\n${themeContext}`
          : themeContext;
      }

      const result = await generateSequentialPrompts(enrichedFormData, language);
      setGeneratedPrompts(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case AppStep.MENU:
        return (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-12 animate-fade-in relative z-10 flex flex-col items-center text-center space-y-8">
            
            {/* Tactical PC Game Ruler Header */}
            <div className="w-full max-w-4xl">
              <GameTechRuler label="MISSION_BRIEF // GRID 01" />
            </div>

            {/* TOP / MIDDLE: Badges, Technical Label, Headline, Subheadline, CTA */}
            <div className="flex flex-col items-center text-center space-y-6 max-w-5xl mx-auto relative pt-4 pb-2 w-full">
              
              {/* Decorative Flanking Retro Blue Boxes (Desktop & Tablet) */}
              <div className="hidden xl:block absolute -left-12 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                <RetroBlueDecorBoxes position="left" />
              </div>
              <div className="hidden xl:block absolute -right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                <RetroBlueDecorBoxes position="right" />
              </div>

              {/* Ambient Retro Blue Floating Pixel Squares */}
              <div className="absolute top-0 left-6 sm:left-16 pointer-events-none select-none opacity-80 hidden sm:flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#1455D9] border border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
                <span className="w-4 h-4 bg-[#38BDF8] border-2 border-[#071B4D] shadow-[2px_2px_0px_#071B4D]" />
                <span className="w-2 h-2 bg-[#1D6BFF]" />
              </div>

              <div className="absolute top-0 right-6 sm:right-16 pointer-events-none select-none opacity-80 hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#1D6BFF]" />
                <span className="w-4 h-4 bg-[#1455D9] border-2 border-[#38BDF8] shadow-[2px_2px_0px_#071B4D]" />
                <span className="w-3 h-3 bg-[#38BDF8] border border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
              </div>

              {/* Retro Tech Badges + Decorative Pixel Checkers */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 animate-fade-in">
                <PixelMatrixCluster pattern="2x2" className="mr-1 hidden sm:grid" />
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EAF3FF] dark:bg-[#0B2D78] border border-[#1455D9] rounded-[2px] shadow-[2px_2px_0px_rgba(20,85,217,0.3)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#1455D9] dark:text-[#38BDF8]" />
                  <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-[#0B2D78] dark:text-blue-200">AI POWERED</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EAF3FF] dark:bg-[#0B2D78] border border-[#1455D9] rounded-[2px] shadow-[2px_2px_0px_rgba(20,85,217,0.3)]">
                  <Zap className="w-3.5 h-3.5 text-[#1455D9] dark:text-[#38BDF8]" />
                  <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-[#0B2D78] dark:text-blue-200">FAST WORKFLOW</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EAF3FF] dark:bg-[#0B2D78] border border-[#1455D9] rounded-[2px] shadow-[2px_2px_0px_rgba(20,85,217,0.3)]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1455D9] dark:text-[#38BDF8]" />
                  <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-[#0B2D78] dark:text-blue-200">RETRO DIGITAL</span>
                </div>
                <PixelMatrixCluster pattern="2x2" className="ml-1 hidden sm:grid" />
              </div>

              {/* Technical Label */}
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#1455D9] dark:text-[#38BDF8] uppercase tracking-widest bg-[#EAF3FF]/90 dark:bg-[#0B2D78]/60 px-3.5 py-1 border-l-3 border-[#1455D9] dark:border-[#38BDF8]">
                <span>[ IDEAS IN // CAROUSELS OUT ]</span>
                <span className="text-[9px] font-pixel text-[#1455D9] dark:text-[#38BDF8]">&#9658;</span>
              </div>

              {/* Headline with Retro Blue Decorative Boxes around it */}
              <div className="relative inline-block my-1 px-4">
                {/* Left decorative stepped retro blue pixel blocks */}
                <div className="absolute -left-5 sm:-left-10 md:-left-14 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-1 items-end pointer-events-none select-none">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-[#38BDF8] border border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
                    <span className="w-3.5 h-3.5 bg-[#1D6BFF] border-2 border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
                  </div>
                  <div className="flex items-center gap-1 mr-1">
                    <span className="w-5 h-5 bg-[#1455D9] border-2 border-[#071B4D] dark:border-[#38BDF8] shadow-[2px_2px_0px_#071B4D] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-[#38BDF8]" />
                    </span>
                    <span className="w-3 h-3 bg-[#0B2D78] border border-[#38BDF8]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-[#60A5FA]" />
                    <span className="w-3 h-3 bg-blue-400/80 border border-[#071B4D]" />
                    <span className="w-1.5 h-1.5 bg-[#1455D9]" />
                  </div>
                </div>

                {/* Right decorative stepped retro blue pixel blocks */}
                <div className="absolute -right-5 sm:-right-10 md:-right-14 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-1 items-start pointer-events-none select-none">
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 bg-[#1D6BFF] border-2 border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
                    <span className="w-2.5 h-2.5 bg-[#38BDF8] border border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
                  </div>
                  <div className="flex items-center gap-1 ml-1">
                    <span className="w-3 h-3 bg-[#0B2D78] border border-[#38BDF8]" />
                    <span className="w-5 h-5 bg-[#1455D9] border-2 border-[#071B4D] dark:border-[#38BDF8] shadow-[2px_2px_0px_#071B4D] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-[#38BDF8]" />
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#1455D9]" />
                    <span className="w-3 h-3 bg-blue-400/80 border border-[#071B4D]" />
                    <span className="w-2 h-2 bg-[#60A5FA]" />
                  </div>
                </div>

                <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.93] font-retro text-[#071B4D] dark:text-white">
                  BRING YOUR IDEAS<br />
                  <span className="text-[#1455D9] dark:text-[#38BDF8]">INTO CAROUSEL.</span>
                </h2>
              </div>

              {/* Subheadline with Retro Blue Decorative Mini Boxes */}
              <div className="relative flex flex-col items-center">
                <p className="text-[#071B4D]/80 dark:text-slate-300 font-medium text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
                  Transform your ideas into scroll-stopping carousels.
                </p>

                {/* Retro Blue Decorative Box Underline Cluster */}
                <div className="flex items-center justify-center gap-1.5 mt-3 pointer-events-none select-none">
                  <span className="w-1.5 h-1.5 bg-[#1455D9]" />
                  <span className="w-2 h-2 bg-[#1D6BFF]" />
                  <span className="w-3 h-3 bg-[#38BDF8] border border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
                  <span className="w-5 h-2 bg-[#1455D9] border border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
                  <span className="w-3 h-3 bg-[#38BDF8] border border-[#071B4D] shadow-[1px_1px_0px_#071B4D]" />
                  <span className="w-2 h-2 bg-[#1D6BFF]" />
                  <span className="w-1.5 h-1.5 bg-[#1455D9]" />
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-3">
                <button
                  onClick={() => {
                    playGameSound('confirm');
                    updateData('mode', PosterMode.CAROUSEL);
                    setStep(AppStep.INFO);
                  }}
                  className="group relative px-8 sm:px-10 py-4 bg-[#1455D9] hover:bg-[#1D6BFF] text-white font-tech font-black text-sm md:text-base uppercase tracking-wider border-2 border-[#0B2D78] dark:border-[#38BDF8] shadow-[5px_5px_0px_#071B4D] dark:shadow-[5px_5px_0px_#030C22] rounded-[2px] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#071B4D] transition-all flex items-center gap-3 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    START CREATING
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </button>
              </div>

              {/* Technical Mini Sub-Ruler */}
              <div className="w-full max-w-xl pt-2">
                <GameTechRuler label="SYS_COORD: 1080x1350" />
              </div>
            </div>

            {/* PC Game Hazard Tape Line */}
            <div className="w-full max-w-5xl">
              <GameHazardTape label="CAROUSEL SHOWCASE // 5-SLIDE PROTOCOL" />
            </div>

            {/* BOTTOM: FLOATING CAROUSEL POSTER SHOWCASE */}
            <div className="w-full pt-2 relative">
              
              {/* Showcase Technical Header & Specs */}
              <div className="w-full flex items-center justify-between border-b-2 border-[#1455D9]/30 pb-2.5 mb-6 px-1 font-mono text-[10px] sm:text-xs">
                <div className="flex items-center gap-2 text-[#0B2D78] dark:text-blue-300 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#1455D9] animate-ping" />
                  [ CAROUSEL SHOWCASE // 5-SLIDE COHERENT OUTPUT ]
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[#071B4D]/70 dark:text-blue-200/80 font-medium">
                  <span>FORMAT: 1080x1350 (4:5)</span>
                  <span>&bull;</span>
                  <span>STYLE: RETRO BLUE DIGITAL</span>
                </div>
              </div>

              {/* Horizontal Floating Poster Stack Container */}
              <div className="relative w-full overflow-x-auto no-scrollbar pb-8 pt-3 px-2">
                <div className="min-w-max lg:min-w-0 flex items-center justify-start lg:justify-center gap-3.5 sm:gap-4 lg:gap-5 mx-auto">
                  
                  {/* POSTER 01: BUILD YOUR PERSONAL BRAND (WITH FACELESS CREATOR) */}
                  <div
                    onClick={() => {
                      updateData('mode', PosterMode.CAROUSEL);
                      setStep(AppStep.INFO);
                    }}
                    className="w-[240px] sm:w-[260px] md:w-[275px] h-[370px] sm:h-[400px] bg-[#1455D9] text-white border-2 border-[#0B2D78] rounded-[2px] p-4 sm:p-5 shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#030C22] flex flex-col justify-between text-left shrink-0 transform -rotate-2 hover:rotate-0 hover:-translate-y-3 hover:shadow-[10px_10px_0px_#071B4D] transition-all duration-300 relative group cursor-pointer overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/20 pb-2">
                      <span className="bg-[#0B2D78] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-[1px]">
                        SLIDE 01 // 05
                      </span>
                      <span className="font-mono text-[9px] text-blue-200 font-bold">
                        COVER
                      </span>
                    </div>

                    {/* Faceless Creator Visual Block */}
                    <div className="relative w-full h-32 sm:h-36 rounded-[2px] overflow-hidden border border-white/30 shadow-inner my-1 bg-[#0B2D78]">
                      <img
                        src="/faceless_creator_brand.jpg"
                        alt="Faceless Creator Persona"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-[#0B2D78]/90 backdrop-blur-xs text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded-[1px] border border-white/20">
                        [ FACELESS // CREATOR ]
                      </div>
                      <div className="absolute bottom-1 right-1.5 text-[8px] font-mono font-bold text-white/80 bg-black/40 px-1 rounded-[1px]">
                        1:1 RATIO
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1 py-1">
                      <h3 className="font-retro font-black text-xl sm:text-2xl leading-[1.0] uppercase tracking-tight text-white">
                        BUILD YOUR<br />
                        <span className="text-blue-200">PERSONAL BRAND</span>
                      </h3>
                      <p className="text-[10.5px] text-blue-100 font-medium leading-tight">
                        Transform raw knowledge into magnetic multi-slide stories.
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[9px] font-mono font-bold text-blue-200">
                      <span>@carouselin</span>
                      <span className="flex items-center gap-1 text-white">SWIPE &rarr;</span>
                    </div>

                    {/* Watermark */}
                    <div className="absolute right-2 bottom-6 opacity-10 pointer-events-none font-mono text-6xl font-black text-white select-none">
                      01
                    </div>
                  </div>

                  {/* POSTER 02: 3 CONTENT PILLARS TO START (WITH FACELESS DESK CREATOR) */}
                  <div
                    onClick={() => {
                      updateData('mode', PosterMode.CAROUSEL);
                      setStep(AppStep.INFO);
                    }}
                    className="w-[240px] sm:w-[260px] md:w-[275px] h-[370px] sm:h-[400px] bg-white dark:bg-[#071B4D] text-[#071B4D] dark:text-white border-2 border-[#1455D9] rounded-[2px] p-4 sm:p-5 shadow-[6px_6px_0px_#0B2D78] dark:shadow-[6px_6px_0px_#030C22] flex flex-col justify-between text-left shrink-0 transform rotate-1 hover:rotate-0 hover:-translate-y-3 hover:shadow-[10px_10px_0px_#0B2D78] transition-all duration-300 relative group cursor-pointer overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#1455D9]/20 pb-2">
                      <span className="bg-[#1455D9] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-[1px]">
                        SLIDE 02 // 05
                      </span>
                      <span className="font-mono text-[9px] text-[#1455D9] dark:text-blue-300 font-bold">
                        FRAMEWORK
                      </span>
                    </div>

                    {/* Faceless Creator at Desk */}
                    <div className="relative w-full h-28 sm:h-32 rounded-[2px] overflow-hidden border border-[#1455D9]/30 shadow-inner my-1 bg-[#EAF3FF] dark:bg-[#092257]">
                      <img
                        src="/faceless_creator_desk.jpg"
                        alt="Faceless Creator Working"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-[#1455D9] text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded-[1px]">
                        WORKFLOW
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5 py-1">
                      <h3 className="font-retro font-black text-lg sm:text-xl leading-[1.05] uppercase tracking-tight text-[#071B4D] dark:text-white">
                        3 CONTENT <span className="text-[#1455D9] dark:text-[#1D6BFF]">PILLARS</span>
                      </h3>
                      <div className="space-y-1 font-mono text-[10px] text-[#071B4D]/80 dark:text-slate-300 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#1455D9]">&bull;</span> 01 Industry Breakdowns
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#1455D9]">&bull;</span> 02 Actionable Playbooks
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#1455D9]">&bull;</span> 03 Real Client Proof
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-[#1455D9]/20 flex items-center justify-between text-[9px] font-mono font-bold text-[#0B2D78] dark:text-blue-200">
                      <span>CAROUSELIN</span>
                      <span>PART 02</span>
                    </div>

                    {/* Watermark */}
                    <div className="absolute right-2 bottom-6 opacity-5 dark:opacity-15 pointer-events-none font-mono text-6xl font-black text-[#1455D9] select-none">
                      02
                    </div>
                  </div>

                  {/* POSTER 03: TURN IDEAS INTO IMPACT (Center Hero Card) */}
                  <div
                    onClick={() => {
                      updateData('mode', PosterMode.CAROUSEL);
                      setStep(AppStep.INFO);
                    }}
                    className="w-[245px] sm:w-[265px] md:w-[280px] h-[370px] sm:h-[400px] bg-[#071B4D] text-white border-2 border-[#1D6BFF] rounded-[2px] p-4 sm:p-5 shadow-[8px_8px_0px_#1455D9] dark:shadow-[8px_8px_0px_#0B2D78] flex flex-col justify-between text-left shrink-0 transform -rotate-0.5 hover:rotate-0 hover:-translate-y-4 hover:shadow-[12px_12px_0px_#1455D9] transition-all duration-300 relative group cursor-pointer z-10 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#1D6BFF]/40 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#1455D9] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-[1px]">
                          SLIDE 03 // 05
                        </span>
                        <span className="font-mono text-[9px] text-yellow-300 font-bold">
                          [ KEY INSIGHT ]
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-blue-300 font-bold">
                        IMPACT
                      </span>
                    </div>

                    {/* Content */}
                    <div className="my-auto space-y-3 py-1">
                      <span className="inline-block px-2 py-0.5 bg-[#1455D9]/40 border border-[#1D6BFF] text-blue-200 font-mono text-[9px] font-bold uppercase rounded-[1px]">
                        CORE PRINCIPLE
                      </span>
                      <h3 className="font-retro font-black text-3xl sm:text-4xl leading-[0.96] uppercase tracking-tight text-white">
                        TURN IDEAS<br />
                        <span className="text-[#1D6BFF]">INTO</span><br />
                        IMPACT
                      </h3>
                      <div className="p-2.5 bg-white/5 border-l-2 border-[#1D6BFF] rounded-[1px] text-[11px] text-blue-100 font-medium leading-relaxed">
                        &ldquo;Clarity beats complexity every single time on social media.&rdquo;
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-[#1D6BFF]/40 flex items-center justify-between text-[9px] font-mono font-bold text-blue-200">
                      <span>READABILITY: 100%</span>
                      <span className="text-yellow-300">SAVE POST 🔖</span>
                    </div>

                    {/* Watermark */}
                    <div className="absolute right-2 bottom-6 opacity-10 pointer-events-none font-mono text-7xl font-black text-blue-300 select-none">
                      03
                    </div>
                  </div>

                  {/* POSTER 04: CONTENT THAT CONNECTS (WITH FACELESS PRESENTER) */}
                  <div
                    onClick={() => {
                      updateData('mode', PosterMode.CAROUSEL);
                      setStep(AppStep.INFO);
                    }}
                    className="w-[240px] sm:w-[260px] md:w-[275px] h-[370px] sm:h-[400px] bg-[#EAF3FF] dark:bg-[#092257] text-[#071B4D] dark:text-white border-2 border-[#1455D9] rounded-[2px] p-4 sm:p-5 shadow-[6px_6px_0px_#0B2D78] dark:shadow-[6px_6px_0px_#030C22] flex flex-col justify-between text-left shrink-0 transform rotate-2 hover:rotate-0 hover:-translate-y-3 hover:shadow-[10px_10px_0px_#0B2D78] transition-all duration-300 relative group cursor-pointer overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#1455D9]/20 pb-2">
                      <span className="bg-[#1455D9] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-[1px]">
                        SLIDE 04 // 05
                      </span>
                      <span className="font-mono text-[9px] text-[#1455D9] dark:text-blue-300 font-bold">
                        ENGAGEMENT
                      </span>
                    </div>

                    {/* Faceless Presenter Visual */}
                    <div className="relative w-full h-28 sm:h-32 rounded-[2px] overflow-hidden border border-[#1455D9]/30 shadow-inner my-1 bg-[#1455D9]">
                      <img
                        src="/faceless_creator_speak.jpg"
                        alt="Faceless Creator Presenting"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-[#0B2D78]/90 text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded-[1px] border border-white/20">
                        [ AUDIO / VOICE ]
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1 py-1">
                      <h3 className="font-retro font-black text-lg sm:text-xl leading-[1.05] uppercase tracking-tight text-[#071B4D] dark:text-white">
                        CONTENT <span className="text-[#1455D9] dark:text-[#1D6BFF]">THAT</span> CONNECTS
                      </h3>
                      <p className="text-[10px] text-[#071B4D]/80 dark:text-slate-300 font-medium leading-snug">
                        Hook fast, deliver undeniable value, and close with a clear CTA.
                      </p>
                      <div className="pt-0.5 flex items-center gap-1 font-mono text-[9px] text-[#1455D9] dark:text-blue-300 font-bold">
                        <span>METRIC:</span>
                        <span className="bg-[#1455D9]/15 dark:bg-[#1455D9]/30 px-1 py-0.5 rounded-[1px]">+320% RETENTION</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-[#1455D9]/20 flex items-center justify-between text-[9px] font-mono font-bold text-[#0B2D78] dark:text-blue-200">
                      <span>SLIDE 04</span>
                      <span>SHARE POST ↗</span>
                    </div>

                    {/* Watermark */}
                    <div className="absolute right-2 bottom-6 opacity-5 dark:opacity-15 pointer-events-none font-mono text-6xl font-black text-[#1455D9] select-none">
                      04
                    </div>
                  </div>

                  {/* POSTER 05: YOUR NEXT BIG IDEA */}
                  <div
                    onClick={() => {
                      updateData('mode', PosterMode.CAROUSEL);
                      setStep(AppStep.INFO);
                    }}
                    className="w-[240px] sm:w-[260px] md:w-[275px] h-[370px] sm:h-[400px] bg-[#0B2D78] text-white border-2 border-[#1455D9] rounded-[2px] p-4 sm:p-5 shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#030C22] flex flex-col justify-between text-left shrink-0 transform -rotate-1.5 hover:rotate-0 hover:-translate-y-3 hover:shadow-[10px_10px_0px_#071B4D] transition-all duration-300 relative group cursor-pointer overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/20 pb-2">
                      <span className="bg-[#1455D9] text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-[1px]">
                        SLIDE 05 // 05
                      </span>
                      <span className="font-mono text-[9px] text-blue-200 font-bold">
                        CALL TO ACTION
                      </span>
                    </div>

                    {/* Content */}
                    <div className="my-auto space-y-2.5 py-1">
                      <span className="inline-block px-2 py-0.5 bg-white/15 border border-white/30 text-white font-mono text-[9px] font-bold uppercase rounded-[1px]">
                        READY TO PUBLISH
                      </span>
                      <h3 className="font-retro font-black text-2xl sm:text-3xl leading-[1.0] uppercase tracking-tight text-white">
                        YOUR NEXT<br />
                        <span className="text-[#1D6BFF]">BIG IDEA</span><br />
                        STARTS HERE
                      </h3>
                      <div className="p-2.5 bg-[#1455D9]/50 border border-blue-400/40 rounded-[1px] font-mono text-[10px] text-white font-bold flex items-center justify-between">
                        <span>GENERATE NOW</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1 font-mono text-[9px] text-blue-200">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>5 Coherent Visual Slides</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Ready-to-use Midjourney Prompts</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[9px] font-mono font-bold text-blue-200">
                      <span>CAROUSELIN</span>
                      <span className="text-emerald-400">READY &bull; 60 SEC</span>
                    </div>

                    {/* Watermark */}
                    <div className="absolute right-2 bottom-6 opacity-10 pointer-events-none font-mono text-6xl font-black text-white select-none">
                      05
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Showcase Ticker */}
              <div className="text-center font-mono text-[10px] sm:text-[11px] text-[#0B2D78]/70 dark:text-blue-300/70 pt-2 flex items-center justify-center gap-2">
                <span>&larr; SWIPE / HOVER TO EXPLORE COHERENT CAROUSEL OUTPUT &rarr;</span>
              </div>

            </div>

            {/* Warning Box on First Page (Halaman Pertama) */}
            <DisclaimerFooter className="w-full mt-8 sm:mt-10" />

          </div>
        );

      case AppStep.INFO:
        let titleLabel = t('label_title');
        let titlePlaceholder = t('ph_title_poster'); 

        if (isCarousel) {
            titleLabel = t('label_title');
            titlePlaceholder = t('ph_title_carousel');
        }

        const filteredPresets = Object.keys(PRESET_LIBRARY)
          .filter(key => PRESET_LIBRARY[key].mode === formData.mode)
          .map(key => ({ label: PRESET_LIBRARY[key].title || key, value: key }));

        const slideCountOptions = Array.from({ length: 15 }, (_, i) => {
          const count = i + 1;
          return {
            label: `${count} ${t('label_slides')}`,
            value: `${count} ${t('label_slides')}`,
          };
        });

        const platformOptions = Object.values(Platform).map(type => ({
          label: platformLabels[type],
          value: type,
        }));

        const languageStyleOptions = Object.values(LanguageStyle).map(type => ({
          label: languageStyleLabels[type],
          value: type,
        }));

        const genreOptions = Object.values(Genre).map(type => ({
          label: genreLabels[type],
          value: type,
        }));

        const hookTypeOptions = Object.values(HookType).map(type => ({
          label: hookTypeLabels[type],
          value: type,
        }));


        return (
          <div className="max-w-5xl mx-auto px-4 w-full py-6 md:py-8 animate-fade-in">
            {/* Retro Game Arcade Terminal Container */}
            <div className="bg-[#0B2D78] text-white p-5 md:p-6 border-2 border-[#1455D9] shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#020714] rounded-t-[2px] relative z-10 transition-all">
              {/* PC Game Tactical Corner Reticles */}
              <GameCornerReticles size="md" showCoordinates />

              {/* Arcade Stage Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-blue-400/30 pb-4 mb-4">
                <button 
                  type="button"
                  onClick={() => {
                    playGameSound('cancel');
                    setStep(AppStep.MENU);
                  }}
                  className="bg-[#071B4D] hover:bg-[#1455D9] text-white border-2 border-blue-400/40 px-3.5 py-1.5 font-pixel text-[9px] uppercase rounded-[2px] transition-all flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#071B4D] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> {t('back')}
                </button>
                
                {/* Retro Game Stage HUD */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="bg-[#1D6BFF] text-white px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-white/30 shadow-[2px_2px_0px_#071B4D] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    STG 1: {t('step_info')}
                  </span>
                  <span className="text-blue-300 font-pixel text-[9px]">&gt;</span>
                  <span className="bg-[#071B4D]/80 text-blue-300/70 px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-blue-400/20">
                    STG 2: {t('step_upload')}
                  </span>
                  <span className="text-blue-300 font-pixel text-[9px]">&gt;</span>
                  <span className="bg-[#071B4D]/80 text-blue-300/70 px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-blue-400/20">
                    STG 3: {t('step_result')}
                  </span>
                </div>
              </div>

              {/* Stage Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-[#071B4D] text-[#38BDF8] font-pixel text-[8px] sm:text-[9px] uppercase tracking-widest border border-blue-400/30 mb-2">
                    <PixelMatrixCluster pattern="2x2" className="inline-grid" />
                    <span>MISSION STAGE 01 // INTEL CONFIG</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-retro tracking-tight leading-tight">
                    {formData.mode || 'CAROUSEL'} QUEST WORKSPACE
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-200/90 font-mono mt-1">
                    {t('step_info_desc') || 'Konfigurasi topik, genre, audiens, dan susunan slide konten carousel Anda.'}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="flex items-center justify-between sm:justify-end gap-3 text-[9px] font-pixel text-blue-200 uppercase tracking-wider mb-1.5">
                    <span>EXP GAUGE</span>
                    <span className="text-emerald-400 font-bold">LVL 1 (33%)</span>
                  </div>
                  <div className="w-36 sm:w-44 h-3 bg-[#071B4D] rounded-[2px] overflow-hidden border-2 border-blue-400/50 p-0.5 shadow-[1px_1px_0px_#071B4D]">
                    <div className="h-full bg-gradient-to-r from-[#1455D9] to-[#1D6BFF] w-1/3 shadow-[0_0_6px_rgba(29,107,255,0.8)]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Hazard Divider Tape */}
            <GameHazardTape label="STAGE 01 // PARAMETER CONFIGURATION" />

            {/* Main Mission Parameters Deck */}
            <div className="bg-white/95 dark:bg-[#07132B]/95 border-2 border-[#1455D9] border-t-0 p-6 md:p-8 shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#020714] rounded-b-[2px] relative z-20 transition-colors">

              {/* --- SECTION 1: CAROUSEL OPTIONS --- */}
              {isCarousel && (
                <FormSection title={t('section_carousel')} icon={Grid} subtitle={t('section_carousel_desc') || "Atur struktur dasar carousel Anda"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <Select 
                            label={t('label_platform')}
                            value={Object.values(Platform).includes(formData.platform as Platform) ? formData.platform : Platform.CUSTOM}
                            onChange={e => updateData('platform', e.target.value)}
                            options={platformOptions}
                            className="bg-white dark:bg-slate-800"
                        />
                        {(!Object.values(Platform).includes(formData.platform as Platform) || formData.platform === Platform.CUSTOM) && (
                          <Input 
                            label=""
                            placeholder={t('ph_platform')}
                            value={formData.platform === Platform.CUSTOM ? '' : formData.platform} 
                            onChange={e => updateData('platform', e.target.value)}
                            className="mt-3"
                          />
                        )}
                    </div>
                    <div>
                        <Select 
                            label={t('label_slide_count')} 
                            value={formData.slideCount} 
                            onChange={e => updateData('slideCount', e.target.value)} 
                            options={slideCountOptions}
                            className="bg-white dark:bg-slate-800" 
                        />
                    </div>

                    <div>
                        <Select 
                            label={t('label_language_style')}
                            value={Object.values(LanguageStyle).includes(formData.languageStyle as LanguageStyle) ? formData.languageStyle : LanguageStyle.CUSTOM}
                            onChange={e => updateData('languageStyle', e.target.value)}
                            options={languageStyleOptions}
                            className="bg-white dark:bg-slate-800"
                        />
                        {(!Object.values(LanguageStyle).includes(formData.languageStyle as LanguageStyle) || formData.languageStyle === LanguageStyle.CUSTOM) && (
                          <Input 
                            label=""
                            placeholder={t('ph_language_style')}
                            value={formData.languageStyle === LanguageStyle.CUSTOM ? '' : formData.languageStyle}
                            onChange={e => updateData('languageStyle', e.target.value)}
                            className="mt-3"
                          />
                        )}
                    </div>

                    <div>
                        <Select 
                            label={t('label_genre', true) || 'Kategori / Genre'}
                            value={Object.values(Genre).includes(formData.genre as Genre) ? formData.genre : Genre.CUSTOM}
                            onChange={e => updateData('genre', e.target.value)}
                            options={genreOptions}
                            className="bg-white dark:bg-slate-800"
                        />
                        {(!Object.values(Genre).includes(formData.genre as Genre) || formData.genre === Genre.CUSTOM) && (
                          <Input 
                            label=""
                            placeholder={t('ph_genre_custom', true) || 'Ketik Genre Custom'}
                            value={formData.genre === Genre.CUSTOM ? '' : formData.genre}
                            onChange={e => updateData('genre', e.target.value)}
                            className="mt-3"
                          />
                        )}
                    </div>
                    <div>
                        <Select 
                            label={t('label_hook_type', true) || 'Jenis Hook'}
                            value={Object.values(HookType).includes(formData.hookType as HookType) ? formData.hookType : HookType.CUSTOM}
                            onChange={e => updateData('hookType', e.target.value)}
                            options={hookTypeOptions}
                            className="bg-white dark:bg-slate-800"
                        />
                        {(!Object.values(HookType).includes(formData.hookType as HookType) || formData.hookType === HookType.CUSTOM) && (
                          <Input 
                            label=""
                            placeholder={t('ph_hook_custom', true) || 'Ketik Hook Custom'}
                            value={formData.hookType === HookType.CUSTOM ? '' : formData.hookType}
                            onChange={e => updateData('hookType', e.target.value)}
                            className="mt-3"
                          />
                        )}
                    </div>
                    <div>
                        <Select 
                            label={t('label_visual_mode_option') || 'Pilihan Tampilan / Karakter'}
                            value={formData.characterOption || (formData.showCharacter ? 'character' : 'text_only')}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'character') {
                                setFormData(prev => ({ ...prev, showCharacter: true, textOnly: false, characterOption: 'character' }));
                              } else if (val === 'character_reference') {
                                setFormData(prev => ({ ...prev, showCharacter: true, textOnly: false, characterOption: 'character_reference' }));
                              } else {
                                setFormData(prev => ({ ...prev, showCharacter: false, textOnly: true, characterOption: 'text_only' }));
                              }
                            }}
                            options={[
                              { label: t('opt_show_character') || 'Tampilkan karakter ( animasi faceless )', value: 'character' },
                              { label: t('opt_character_reference') || 'Karakter Referensi', value: 'character_reference' },
                              { label: t('opt_text_only') || 'Tanpa Karakter (Text Only)', value: 'text_only' }
                            ]}
                            className="bg-white dark:bg-slate-800 font-bold"
                        />
                    </div>

                    {/* Target Audiens: Tepat di bawah kolom Jenis Hook dan Pilihan Tampilan / Karakter */}
                    <div className="md:col-span-2">
                        <Select 
                            label={t('label_audience')}
                            value={Object.values(TargetAudience).includes(formData.targetAudience as TargetAudience) ? formData.targetAudience : TargetAudience.CUSTOM}
                            onChange={e => updateData('targetAudience', e.target.value)}
                            options={Object.values(TargetAudience).map(t => ({ label: targetAudienceLabels[t], value: t }))}
                            className="bg-white dark:bg-slate-800 font-bold"
                        />
                        {(!Object.values(TargetAudience).includes(formData.targetAudience as TargetAudience) || formData.targetAudience === TargetAudience.CUSTOM) && (
                          <Input 
                            label=""
                            placeholder="Ketik Target Audiens Custom (misal: Gen Z, Mahasiswa, Pebisnis Pemula, Ibu Rumah Tangga, dll)"
                            value={formData.targetAudience === TargetAudience.CUSTOM ? '' : formData.targetAudience}
                            onChange={e => updateData('targetAudience', e.target.value)}
                            className="mt-3"
                          />
                        )}
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-1.5 flex items-center gap-1.5">
                          <span>🎯</span>
                          <span>Bahasa & pemilihan kata hook akan otomatis disesuaikan secara spesifik dengan target audiens ini.</span>
                        </p>
                    </div>
                  </div>
                </FormSection>
              )}

              {/* --- SECTION 2: CONTENT & MATERIAL --- */}
              <FormSection title={t('section_content')} icon={FileText} subtitle={t('section_content_desc') || "Kelola pesan dan data yang ingin Anda bagikan"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  <div className="relative">
                    <div className="flex justify-between items-center mb-0.5">
                       <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">{t('label_topic')}</label>
                       <button onClick={() => autoFill('topic')} disabled={isAutofilling} className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center gap-1 hover:underline disabled:opacity-50">
                         {isAutofilling ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />} {t('btn_autofill')}
                       </button>
                    </div>
                    <Input 
                      label="" 
                      placeholder={t('ph_topic')} 
                      value={formData.topic}
                      onChange={e => updateData('topic', e.target.value)}
                      className="font-bold uppercase placeholder:font-normal placeholder:normal-case"
                    />
                  </div>
                  <div className="relative">
                    <div className="flex justify-between items-center mb-0.5">
                       <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">{titleLabel}</label>
                       <button onClick={() => autoFill('title')} disabled={isAutofilling} className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center gap-1 hover:underline disabled:opacity-50">
                         {isAutofilling ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />} {t('btn_autofill')}
                       </button>
                    </div>
                    <Input 
                      label="" 
                      placeholder={titlePlaceholder}
                      value={formData.title}
                      onChange={e => updateData('title', e.target.value)}
                      className="font-bold uppercase placeholder:font-normal placeholder:normal-case"
                    />
                  </div>

                  {!isCarousel && (
                    <div className="md:col-span-2">
                       <Select 
                          label={t('label_audience')}
                          value={formData.targetAudience}
                          onChange={e => updateData('targetAudience', e.target.value)}
                          options={Object.values(TargetAudience).map(t => ({ label: targetAudienceLabels[t], value: t }))}
                          className="bg-white dark:bg-slate-800"
                        />
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">{t('label_material')}</label>
                    <button onClick={() => autoFill('material')} disabled={isAutofilling} className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center gap-1 hover:underline disabled:opacity-50">
                       {isAutofilling ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />} {t('btn_autofill')}
                    </button>
                  </div>
                  <TextArea 
                    label=""
                    placeholder={t('ph_material')}
                    value={formData.material}
                    onChange={e => updateData('material', e.target.value)}
                    className="min-h-[200px] text-base"
                  />
                </div>

                <div className="mb-8">
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="ctaActive" checked={formData.ctaActive} onChange={e => updateData('ctaActive', e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                          <label htmlFor="ctaActive" className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 cursor-pointer">{t('label_cta_activate')}</label>
                        </div>
                        {formData.ctaActive && (
                          <button onClick={() => autoFill('cta')} disabled={isAutofilling} className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center gap-1 hover:underline disabled:opacity-50">
                            {isAutofilling ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />} {t('btn_autofill')}
                          </button>
                        )}
                      </div>
                      <Input label="" placeholder={t('ph_cta')} value={formData.cta} onChange={e => updateData('cta', e.target.value)} disabled={!formData.ctaActive} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="funFactActive" checked={formData.funFactActive} onChange={e => updateData('funFactActive', e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                      <label htmlFor="funFactActive" className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 cursor-pointer">{t('label_fun_fact_activate')}</label>
                    </div>
                    {formData.funFactActive && (
                      <button onClick={() => autoFill('funFact')} disabled={isAutofilling} className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center gap-1 hover:underline disabled:opacity-50">
                        {isAutofilling ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />} {t('btn_autofill')}
                      </button>
                    )}
                  </div>
                  <TextArea label="" placeholder={t('ph_fun_fact')} value={formData.funFact} onChange={e => updateData('funFact', e.target.value)} disabled={!formData.funFactActive} rows={2} />
                </div>
              </FormSection>

              {/* --- SECTION 3: VISUAL & DESIGN --- */}
              <FormSection title={t('section_visual')} icon={Palette} subtitle={t('section_visual_desc') || "Kustomisasi estetika dan brand identity"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  <Input label={t('label_identity')} placeholder={t('ph_identity')} value={formData.socialAccount} onChange={e => updateData('socialAccount', e.target.value)} />
                  <Input label={t('label_watermark')} placeholder={t('ph_watermark')} value={formData.watermark} onChange={e => updateData('watermark', e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-8">
                  <Select 
                     label={isCarousel ? t('label_paper_size') : t('label_aspect_ratio')}
                     value={formData.size}
                     onChange={e => updateData('size', e.target.value)}
                     options={
                        isCarousel
                       ? [
                           { label: AspectRatio.A4, value: AspectRatio.A4 },
                           { label: AspectRatio.F4, value: AspectRatio.F4 },
                           { label: AspectRatio.A3, value: AspectRatio.A3 },
                           { label: AspectRatio.R_9_16, value: AspectRatio.R_9_16 },
                           { label: AspectRatio.R_1_1, value: AspectRatio.R_1_1 },
                           { label: AspectRatio.R_4_5, value: AspectRatio.R_4_5 },
                         ]
                       : Object.values(AspectRatio).map(r => ({ label: r, value: r })) 
                     }
                  />
                  <Select 
                     label={t('label_visual_style')}
                     value={formData.visualStyle}
                     onChange={e => updateData('visualStyle', e.target.value)}
                     options={Object.values(VisualStyle)
                       .filter(v => ![
                         VisualStyle.EXPRESSIVE_EDU_ILLUSTRATION, 
                         VisualStyle.SERENE_3D_EDU_VISUAL, 
                         VisualStyle.CINEMATIC_INFOGRAPHIC_FLOW, 
                         VisualStyle.SOFT_EMPATHY_ILLUSTRATION,
                       ].includes(v))
                       .map(v => ({ label: visualStyleLabels[v], value: v }))
                     }
                  />
                  <Select 
                     label={t('label_color_style')}
                     value={Object.values(ColorStyle).includes(formData.colorStyle as ColorStyle) ? formData.colorStyle : ColorStyle.CUSTOM}
                     onChange={e => updateData('colorStyle', e.target.value)}
                     options={Object.values(ColorStyle).map(v => ({ label: colorStyleLabels[v], value: v }))}
                  />
                  {(!Object.values(ColorStyle).includes(formData.colorStyle as ColorStyle) || formData.colorStyle === ColorStyle.CUSTOM) && (
                    <div className="flex gap-2 mt-2 animate-fade-in">
                      <Input label="" placeholder={t('color_custom')} value={formData.colorStyle === ColorStyle.CUSTOM ? '' : formData.colorStyle} onChange={e => updateData('colorStyle', e.target.value)} />
                    </div>
                  )}

                  <Select 
                     label={t('label_accent_color')}
                     value={Object.values(AccentColor).includes(formData.accentColor as AccentColor) ? formData.accentColor : AccentColor.CUSTOM}
                     onChange={e => updateData('accentColor', e.target.value)}
                     options={Object.values(AccentColor).map(v => ({ label: accentColorLabels[v], value: v }))}
                  />
                  {(!Object.values(AccentColor).includes(formData.accentColor as AccentColor) || formData.accentColor === AccentColor.CUSTOM) && (
                    <div className="flex gap-2 mt-2 animate-fade-in">
                      <Input label="" placeholder={t('accent_custom')} value={formData.accentColor === AccentColor.CUSTOM ? '' : formData.accentColor} onChange={e => updateData('accentColor', e.target.value)} />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Select 
                      label={t('label_visual_theme')}
                      value={Object.keys(visualThemeLabels).includes(formData.visualTheme) ? formData.visualTheme : 'custom'}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'custom') updateData('visualTheme', 'Custom Theme');
                        else updateData('visualTheme', val);
                      }}
                      options={[...Object.entries(visualThemeLabels).map(([value, label]) => ({ label, value })), { label: 'Custom', value: 'custom' }]}
                    />
                    {(!Object.keys(visualThemeLabels).includes(formData.visualTheme) || formData.visualTheme === 'Custom Theme') && (
                      <div className="flex gap-2 mt-2 animate-fade-in">
                        <Input label="" placeholder={t('ph_visual_theme')} value={formData.visualTheme === 'Custom Theme' ? '' : formData.visualTheme} onChange={e => updateData('visualTheme', e.target.value)} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <UploadBox 
                    title={t('label_theme_reference')} 
                    category="theme" 
                    files={uploadedAssets.theme} 
                    onFilesChange={handleAssetFilesChange} 
                  />
                </div>
              </FormSection>

              {/* --- SECTION 4: ADDITIONAL ELEMENTS --- */}
              <FormSection title={t('section_additional')} icon={Sliders} subtitle={t('section_additional_desc') || "Tambahan detail dan instruksi khusus AI"}>
                <div className="mb-8">
                   <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 ml-1">{t('label_ai_instruct')}</label>
                   <TextArea 
                      label=""
                      placeholder={t('ph_ai_instruct')}
                      value={formData.additionalPrompt}
                      onChange={e => updateData('additionalPrompt', e.target.value)}
                      rows={3}
                   />
                </div>
              </FormSection>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-[#1455D9]/20 dark:border-blue-500/20 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(AppStep.MENU)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0B2D78] hover:bg-[#1455D9] text-white border-2 border-[#071B4D] shadow-[3px_3px_0px_#071B4D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-[2px] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> {t('back')}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep(AppStep.VISUAL)}
                  disabled={!formData.topic || !formData.title}
                  className="w-full sm:w-auto bg-[#1455D9] hover:bg-[#1D6BFF] text-white border-2 border-[#071B4D] shadow-[4px_4px_0px_#071B4D] dark:border-blue-400 dark:shadow-[4px_4px_0px_#020714] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-mono font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded-[2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  <span>{t('btn_next_assets')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <DisclaimerFooter />
            </div>
          </div>
        );

      case AppStep.VISUAL:
        return (
          <div className="max-w-5xl mx-auto px-4 w-full py-6 md:py-8 animate-fade-in">
            {/* Retro Game Arcade Terminal Container */}
            <div className="bg-[#0B2D78] text-white p-5 md:p-6 border-2 border-[#1455D9] shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#020714] rounded-t-[2px] relative z-10 transition-all">
              {/* PC Game Tactical Corner Reticles */}
              <GameCornerReticles size="md" showCoordinates />

              {/* Arcade Stage Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-blue-400/30 pb-4 mb-4">
                <button 
                  type="button"
                  onClick={() => {
                    playGameSound('cancel');
                    setStep(AppStep.INFO);
                  }}
                  className="bg-[#071B4D] hover:bg-[#1455D9] text-white border-2 border-blue-400/40 px-3.5 py-1.5 font-pixel text-[9px] uppercase rounded-[2px] transition-all flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#071B4D] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> {t('back')}
                </button>
                
                {/* Retro Game Stage HUD */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="bg-[#071B4D] text-emerald-300 px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1">
                    <span>&#10003;</span> STG 1
                  </span>
                  <span className="text-blue-300 font-pixel text-[9px]">&gt;</span>
                  <span className="bg-[#1D6BFF] text-white px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-white/30 shadow-[2px_2px_0px_#071B4D] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    STG 2: {t('step_upload')}
                  </span>
                  <span className="text-blue-300 font-pixel text-[9px]">&gt;</span>
                  <span className="bg-[#071B4D]/80 text-blue-300/70 px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-blue-400/20">
                    STG 3: {t('step_result')}
                  </span>
                </div>
              </div>

              {/* Stage Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-[#071B4D] text-[#38BDF8] font-pixel text-[8px] sm:text-[9px] uppercase tracking-widest border border-blue-400/30 mb-2">
                    <PixelMatrixCluster pattern="2x2" className="inline-grid" />
                    <span>MISSION STAGE 02 // VISUAL LOADOUT</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-retro tracking-tight leading-tight">
                    {formData.mode || 'CAROUSEL'} VISUAL LAB
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-200/90 font-mono mt-1">
                    {t('desc_visual_upload')}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="flex items-center justify-between sm:justify-end gap-3 text-[9px] font-pixel text-blue-200 uppercase tracking-wider mb-1.5">
                    <span>EXP GAUGE</span>
                    <span className="text-emerald-400 font-bold">LVL 2 (66%)</span>
                  </div>
                  <div className="w-36 sm:w-44 h-3 bg-[#071B4D] rounded-[2px] overflow-hidden border-2 border-blue-400/50 p-0.5 shadow-[1px_1px_0px_#071B4D]">
                    <div className="h-full bg-gradient-to-r from-[#1455D9] to-[#1D6BFF] w-2/3 shadow-[0_0_6px_rgba(29,107,255,0.8)]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Hazard Divider Tape */}
            <GameHazardTape label="STAGE 02 // ASSET LOADOUT & PERSONA" />

            {/* Main Visual Bay Deck */}
            <div className="bg-white/95 dark:bg-[#07132B]/95 border-2 border-[#1455D9] border-t-0 p-6 md:p-8 shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#020714] rounded-b-[2px] relative z-20 transition-colors">
              
              {/* Faceless Character Persona Selector Card (Retro Hero Class Select) */}
              <div className="bg-white dark:bg-[#07132B] border-2 border-[#1455D9] p-6 mb-7 rounded-[2px] shadow-[4px_4px_0px_#071B4D] dark:shadow-[4px_4px_0px_#020714] flex flex-col md:flex-row items-center justify-between gap-6 transition-all relative">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-[#1455D9] text-white rounded-[2px] border-2 border-[#071B4D] dark:border-blue-400 shadow-[2px_2px_0px_#071B4D] shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-tech font-black text-base md:text-lg uppercase tracking-tight text-[#071B4D] dark:text-white mb-1">
                      {t('label_show_char')}
                    </h4>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B2D78]/80 dark:text-blue-300/80">
                      Pilih ilustrasi persona faceless konsisten atau murni teks/infografis
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, showCharacter: false, textOnly: true, characterOption: 'text_only' }))}
                    className={`px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider rounded-[2px] border-2 transition-all cursor-pointer ${!formData.showCharacter ? 'bg-[#1455D9] text-white border-[#071B4D] shadow-[2px_2px_0px_#071B4D]' : 'bg-slate-100 dark:bg-[#0B1E48] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#1455D9]'}`}
                  >
                    {t('btn_no_faceless')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, showCharacter: true, textOnly: false, characterOption: prev.characterOption === 'character_reference' ? 'character_reference' : 'character' }))}
                    className={`px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider rounded-[2px] border-2 transition-all cursor-pointer ${formData.showCharacter ? 'bg-[#1455D9] text-white border-[#071B4D] shadow-[2px_2px_0px_#071B4D]' : 'bg-slate-100 dark:bg-[#0B1E48] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#1455D9]'}`}
                  >
                    &#9658; {t('btn_yes')}
                  </button>
                </div>
              </div>

              {formData.showCharacter && (
                <div className="mb-7 p-6 sm:p-7 bg-white dark:bg-[#07132B] border-2 border-[#1455D9] rounded-[2px] shadow-[4px_4px_0px_#071B4D] dark:shadow-[4px_4px_0px_#020714] animate-fade-in relative">
                  <div className="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-[#1455D9]/20 dark:border-[#1D6BFF]/20">
                    <span className="font-pixel text-[9px] text-[#1455D9] dark:text-blue-400">&#9658;</span>
                    <span className="font-tech font-black text-xs uppercase tracking-wider text-[#071B4D] dark:text-white">
                      KONFIGURASI PERSONA FACELESS
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Select 
                      label={t('label_gender')}
                      value={formData.gender || Gender.MALE}
                      onChange={e => updateData('gender', e.target.value)}
                      options={Object.values(Gender).map(g => ({ label: genderLabels[g], value: g }))}
                    />
                    
                    {formData.gender !== Gender.MALE && (
                      <Select 
                        label={t('label_hijab')}
                        value={formData.hijab ? 'Ya' : 'Tidak'}
                        onChange={e => {
                          const val = e.target.value === 'Ya';
                          updateData('hijab', val);
                          if (!val) updateData('niqab', false);
                        }}
                        options={[
                          { label: t('opt_no'), value: 'Tidak' },
                          { label: t('opt_yes'), value: 'Ya' }
                        ]}
                      />
                    )}

                    {formData.gender !== Gender.MALE && formData.hijab && (
                      <Select 
                        label={t('label_niqab')}
                        value={formData.niqab ? 'Ya' : 'Tidak'}
                        onChange={e => updateData('niqab', e.target.value === 'Ya')}
                        options={[
                          { label: t('opt_no'), value: 'Tidak' },
                          { label: t('opt_yes'), value: 'Ya' }
                        ]}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Upload Boxes Grid (Equipment Bays) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <UploadBox title={t('box_char_photo')} category="char" files={uploadedAssets.char} onFilesChange={handleAssetFilesChange} />
                <UploadBox title={t('box_logo')} category="logo" files={uploadedAssets.logo} onFilesChange={handleAssetFilesChange} />
                <UploadBox title={t('box_ref')} category="ref" files={uploadedAssets.ref} onFilesChange={handleAssetFilesChange} />
                <UploadBox title={t('box_theme_style')} category="theme" files={uploadedAssets.theme} onFilesChange={handleAssetFilesChange} />
                <UploadBox title={t('box_attr')} category="attr" files={uploadedAssets.attr} onFilesChange={handleAssetFilesChange} />
              </div>

              {/* Navigation Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-[#1455D9]/20 dark:border-blue-500/20 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(AppStep.INFO)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0B2D78] hover:bg-[#1455D9] text-white border-2 border-[#071B4D] shadow-[3px_3px_0px_#071B4D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-[2px] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> {t('back')}
                </button>

                <button 
                  type="button"
                  onClick={handleGeneratePrompts}
                  className="w-full sm:w-auto bg-[#1455D9] hover:bg-[#1D6BFF] text-white border-2 border-[#071B4D] shadow-[4px_4px_0px_#071B4D] dark:border-blue-400 dark:shadow-[4px_4px_0px_#020714] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-mono font-black text-sm uppercase tracking-wider px-8 py-3.5 rounded-[2px] transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>{t('btn_generate_prompt')}</span>
                </button>
              </div>

              <DisclaimerFooter />
            </div>
          </div>
        );

      case AppStep.RESULT:
        return (
          <div className="max-w-5xl mx-auto px-4 w-full py-6 md:py-8 animate-fade-in">
            {/* Retro Game Arcade Terminal Container */}
            <div className="bg-[#0B2D78] text-white p-5 md:p-6 border-2 border-[#1455D9] shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#020714] rounded-t-[2px] relative z-10 transition-all">
              {/* PC Game Tactical Corner Reticles */}
              <GameCornerReticles size="md" showCoordinates />

              {/* Arcade Stage Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-blue-400/30 pb-4 mb-4">
                <button 
                  type="button"
                  onClick={() => {
                    playGameSound('cancel');
                    setStep(AppStep.VISUAL);
                  }}
                  className="bg-[#071B4D] hover:bg-[#1455D9] text-white border-2 border-blue-400/40 px-3.5 py-1.5 font-pixel text-[9px] uppercase rounded-[2px] transition-all flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#071B4D] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> {t('back')}
                </button>
                
                {/* Retro Game Stage HUD */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="bg-[#071B4D] text-emerald-300 px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1">
                    <span>&#10003;</span> STG 1
                  </span>
                  <span className="text-blue-300 font-pixel text-[9px]">&gt;</span>
                  <span className="bg-[#071B4D] text-emerald-300 px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1">
                    <span>&#10003;</span> STG 2
                  </span>
                  <span className="text-blue-300 font-pixel text-[9px]">&gt;</span>
                  <span className="bg-[#1D6BFF] text-white px-2.5 py-1 rounded-[2px] font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider border border-white/30 shadow-[2px_2px_0px_#071B4D] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    STG 3: {t('step_result')}
                  </span>
                </div>
              </div>

              {/* Stage Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-[#071B4D] text-[#38BDF8] font-pixel text-[8px] sm:text-[9px] uppercase tracking-widest border border-blue-400/30 mb-2">
                    <PixelMatrixCluster pattern="2x2" className="inline-grid" />
                    <span>MISSION COMPLETE // PROMPT REWARDS UNLOCKED</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-retro tracking-tight leading-tight">
                    {t('step_result')}
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-200/90 font-mono mt-1">
                    {t('desc_prompts_generated') || 'Setiap kartu slide siap disalin untuk generator AI pilihan Anda.'}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="flex items-center justify-between sm:justify-end gap-3 text-[9px] font-pixel text-blue-200 uppercase tracking-wider mb-1.5">
                    <span>EXP GAUGE</span>
                    <span className="text-emerald-400 font-bold">MAX (100%)</span>
                  </div>
                  <div className="w-36 sm:w-44 h-3 bg-[#071B4D] rounded-[2px] overflow-hidden border-2 border-blue-400/50 p-0.5 shadow-[1px_1px_0px_#071B4D]">
                    <div className="h-full bg-emerald-500 w-full shadow-[0_0_6px_rgba(16,185,129,0.8)]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Hazard Divider Tape */}
            <GameHazardTape label="MISSION COMPLETE // 5-SLIDE PROTOCOL DELIVERED" />

            {/* Main Result Deck */}
            <div className="bg-white/95 dark:bg-[#07132B]/95 border-2 border-[#1455D9] border-t-0 p-6 md:p-8 shadow-[6px_6px_0px_#071B4D] dark:shadow-[6px_6px_0px_#020714] rounded-b-[2px] relative z-20 transition-colors">
                
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#1455D9]/20 rounded-none"></div>
                    <Loader2 className="w-16 h-16 animate-spin text-[#1455D9] absolute top-0 left-0" />
                  </div>
                  <p className="font-pixel text-[10px] uppercase tracking-widest text-[#1455D9] dark:text-blue-400 animate-pulse">{t('msg_engineering_prompts')}</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    {generatedPrompts.map((p, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#07132B] border-2 border-[#1455D9] p-6 md:p-8 rounded-[2px] shadow-[5px_5px_0px_#071B4D] dark:shadow-[5px_5px_0px_#020714] transition-all group relative">
                        {/* PC Game Tactical Corner Reticles on each Prompt Card */}
                        <GameCornerReticles size="md" />

                        {/* Top Tech Ruler */}
                        <div className="mb-4">
                          <GameTechRuler label={`CARTRIDGE 0${idx + 1} // 1:1`} className="opacity-80" />
                        </div>

                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-2 border-[#1455D9]/20 dark:border-[#1D6BFF]/20 pb-4">
                           <div className="flex items-center gap-3.5">
                             <div className="bg-[#1455D9] text-white w-9 h-9 flex items-center justify-center font-pixel font-bold rounded-[2px] border-2 border-[#071B4D] shadow-[2px_2px_0px_#071B4D] text-xs shrink-0">
                               #{idx + 1}
                             </div>
                             <div>
                               <h4 className="text-[#071B4D] dark:text-white font-tech font-black text-lg md:text-xl uppercase tracking-tight leading-none mb-1">
                                 {p.title}
                               </h4>
                               <div className="flex items-center gap-2">
                                 <PixelMatrixCluster pattern="2x2" className="inline-grid" />
                                 <span className="font-pixel text-[8px] text-[#1455D9] dark:text-blue-400 uppercase tracking-widest">[STAGE PROMPT CARTRIDGE]</span>
                               </div>
                             </div>
                           </div>
                           <div className="flex gap-2">
                             <Button 
                               onClick={() => {
                                 playGameSound('powerup');
                                 handleCopy(p.content, idx);
                               }} 
                               variant="outline" 
                               className="px-4 py-2"
                               icon={copiedId === idx ? CheckCircle : Copy}
                             >
                               {copiedId === idx ? t('btn_copied') : t('btn_copy')}
                             </Button>
                           </div>
                         </div>
                            <div className="mt-2 text-sans select-none">
                              {(() => {
                                try {
                                  const parsed = JSON.parse(p.content);
                                  const totalSlides = generatedPrompts.length;
                                  const slideNum = idx + 1;
                                  const isCover = slideNum === 1 || (parsed.jenis_slide || '').toLowerCase().includes('cover') || (parsed.jenis_halaman || '').toLowerCase().includes('cover');
                                  const isLast = slideNum === totalSlides || (parsed.jenis_slide || '').toLowerCase().includes('penutup') || (parsed.jenis_slide || '').toLowerCase().includes('cta') || (parsed.jenis_halaman || '').toLowerCase().includes('penutup') || (parsed.jenis_halaman || '').toLowerCase().includes('cta');
                                  
                                  const formatPoints = (text: string) => {
                                    if (!text) return [];
                                    return text.split(/\n| - | • | \d+\./).map(x => x.trim()).filter(Boolean);
                                  };
                                  const points = formatPoints(parsed.isi_materi || "");

                                  const is9_16 = formData.size === '9:16 (Story/Reels)';
                                  const sizeClass = is9_16 ? 'max-w-[280px] aspect-[9/16]' : 'max-w-[340px] aspect-[4/5]';

                                  return (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans text-slate-700 dark:text-slate-200">
                                      {/* LEFT COLUMN: Instagram Mobile-Optimized Slide Mockup Canvas */}
                                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200/40 dark:border-slate-800/60">
                                        <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-1">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                                            LIVE WORKSPACE PREVIEW
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, showCharacter: !prev.showCharacter }))}
                                            className={`text-[9px] font-mono font-bold px-2 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                                              formData.showCharacter
                                                ? 'bg-[#1455D9] text-white border-[#0B2D78] shadow-sm'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#1455D9]'
                                            }`}
                                            title="Toggle tampilan visual faceless persona"
                                          >
                                            <User className="w-3 h-3" />
                                            <span>{formData.showCharacter ? 'FACELESS: ON' : 'FACELESS: OFF'}</span>
                                          </button>
                                        </div>
                                        
                                        {/* Mockup Frame representing Instagram Viewport */}
                                        <div id={`mockup-slide-${idx}`} className={`w-full ${sizeClass} bg-[#121318] bg-[radial-gradient(#252836_1px,transparent_1px)] [background-size:16px_16px] text-white rounded-[2rem] shadow-2xl overflow-hidden relative border border-slate-800 flex flex-col justify-between p-7 select-none transition-all group-hover:shadow-blue-500/10`}>
                                          
                                          {/* TOP PROFILE BAR */}
                                          <div className="flex justify-between items-center z-10 select-none">
                                            <div className="flex items-center gap-2">
                                              <div className="w-7 h-7 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center p-[1px] shadow-sm">
                                                <div className="w-full h-full bg-[#121318] rounded-full flex items-center justify-center">
                                                  <span className="text-[8px] font-black uppercase tracking-tighter text-yellow-500">
                                                    {(formData.socialAccount || 'c').replace(/[@]/g, '').slice(0, 2)}
                                                  </span>
                                                </div>
                                              </div>
                                              <span className="text-[10px] font-bold text-slate-300 tracking-wide font-mono">
                                                {formData.socialAccount || '@creator'}
                                              </span>
                                            </div>
                                            
                                            {/* Slide indicators capsule */}
                                            <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
                                              {slideNum}/{totalSlides}
                                            </span>
                                          </div>

                                          {/* CENTER CONTENT CONTAINER (Spacious negative space margin boundaries) */}
                                          <div className="flex-1 flex flex-col justify-center my-4 z-10 relative font-sans">
                                            {isCover ? (
                                              /* COVER VIEW: Extra bolder large title typography */
                                              <div className="space-y-4 text-left font-sans">
                                                <div className="space-y-2">
                                                  <div className="bg-yellow-400 text-[#121318] text-[9px] font-black px-2.5 py-0.5 rounded-md inline-block uppercase tracking-widest leading-none font-sans">
                                                    {formData.topic || 'AESTHETIC COVER'}
                                                  </div>
                                                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-[1.1] text-white">
                                                    {parsed.judul_utama || formData.title}
                                                  </h2>
                                                </div>
                                                {parsed.sub_judul && (
                                                  <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed font-sans">
                                                    {parsed.sub_judul}
                                                  </p>
                                                )}
                                              </div>
                                            ) : isLast ? (
                                              /* CTA VIEW: CTA content, engagement indicators, comments box */
                                              <div className="space-y-4 text-left font-sans">
                                                <div className="bg-emerald-400 text-[#121318] text-[9px] font-black px-2.5 py-0.5 rounded-md inline-block uppercase tracking-widest leading-none font-sans">
                                                  CLOSING ENFORCING
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white mb-2 font-sans">
                                                  {parsed.call_to_action || parsed.cta_headline || formData.cta || 'Komen "MAU" di Bawah!'}
                                                </h3>
                                                {parsed.fun_fact ? (
                                                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed bg-white/5 border border-white/10 p-2.5 rounded-xl font-sans">
                                                    💡 <strong>Fun Fact:</strong> {parsed.fun_fact}
                                                  </p>
                                                ) : (
                                                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed bg-white/5 border border-white/10 p-2.5 rounded-xl font-sans">
                                                    📲 Swipe untuk konten edukatif lainnya. Jangan lupa share & simpan postingan ini ya!
                                                  </p>
                                                )}
                                              </div>
                                            ) : (
                                              /* CONTENT VIEW: Scaled up bullet points, spacious line height */
                                              <div className="space-y-3.5 text-left font-sans flex-1 flex flex-col justify-center">
                                                {points.length > 0 ? (
                                                  <div className="space-y-2.5 font-sans">
                                                    {points.map((pt, pIdx) => (
                                                      <div key={pIdx} className="flex items-start gap-2 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] p-2.5 rounded-xl transition-all">
                                                        <CheckSquare className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs sm:text-sm text-slate-100 font-extrabold leading-relaxed text-left">
                                                          {pt}
                                                        </p>
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <p className="text-xs sm:text-sm text-slate-100 font-extrabold leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
                                                    {parsed.isi_materi}
                                                  </p>
                                                )}
                                              </div>
                                            )}

                                            {/* PROPORSIONAL SUPPORTIVE CHARACTER (Faceless Creator Visual Art) */}
                                            {formData.showCharacter && (
                                              <div className="absolute right-[-10px] bottom-[-16px] scale-[0.85] rotate-1 opacity-95 transition-transform group-hover:scale-[0.90] origin-bottom-right z-0 select-none pointer-events-none">
                                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#0B2D78]">
                                                  <img
                                                    src={idx % 3 === 0 ? "/faceless_creator_brand.jpg" : idx % 3 === 1 ? "/faceless_creator_desk.jpg" : "/faceless_creator_speak.jpg"}
                                                    alt="Faceless Character Illustration"
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-cover object-top filter contrast-105"
                                                  />
                                                  <div className="absolute top-1 left-1 bg-[#0B2D78]/90 backdrop-blur-xs text-white text-[7px] font-mono font-black px-1.5 py-0.5 rounded-[2px] border border-white/20 uppercase">
                                                    FACELESS
                                                  </div>
                                                  <div className="absolute bottom-1 right-1 bg-black/60 text-blue-200 text-[6px] font-mono px-1 rounded-[2px]">
                                                    Scale: 85%
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* BOTTOM AREA AND SWIPE ORNAMENT MOCKUP */}
                                          <div className="flex justify-between items-center border-t border-slate-800/85 pt-3 z-10 select-none">
                                            <div className="flex items-center gap-2.5 text-slate-400">
                                              <Heart className="w-3.5 h-3.5 hover:text-red-500 cursor-pointer transition-colors" />
                                              <MessageSquare className="w-3.5 h-3.5 hover:text-blue-400 cursor-pointer transition-colors" />
                                              <Send className="w-3.5 h-3.5 hover:text-emerald-400 cursor-pointer transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-1 font-sans">
                                              {slideNum < totalSlides && (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[8px] font-black font-mono tracking-widest text-slate-400 uppercase">Swipe</span>
                                                  <ArrowRight className="w-2.5 h-2.5 text-blue-400 animate-bounce" />
                                                </div>
                                              )}
                                              <Bookmark className="w-3.5 h-3.5 text-slate-400 ml-2 cursor-pointer hover:text-yellow-500 transition-colors" />
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="text-center mt-3 text-[10px] font-bold text-slate-500 tracking-wide font-mono">
                                          Instagram Post Size Ratio: <span className="text-slate-800 dark:text-slate-300 font-black">{formData.size}</span>
                                        </div>
                                      </div>

                                      {/* RIGHT COLUMN: Technical Prompts & Control Panel Details */}
                                      <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                                        <div className="space-y-4">
                                          <div className="flex flex-wrap items-center gap-2 font-sans opacity-95">
                                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest">
                                              {parsed.jenis_slide || parsed.jenis_halaman || `${slideNum===1 ? 'Cover Carousel':'Isi Carousel'}`}
                                            </span>
                                            {parsed.tema_gaya && (
                                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1 rounded-xl">
                                                🎨 {parsed.tema_gaya}
                                              </span>
                                            )}
                                          </div>

                                          {/* MAIN WRITTEN DIALOG BLOCK */}
                                          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2 font-sans">
                                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                                {t('label_script_dialog') || 'Slide Copywriting & Script'}
                                              </h5>
                                              <Button 
                                                onClick={() => navigator.clipboard.writeText(parsed.isi_materi || parsed.judul_utama || "")} 
                                                variant="outline" 
                                                className="h-7 rounded-lg text-[9px] font-black tracking-widest uppercase hover:bg-slate-50 border-slate-200"
                                              >
                                                Salin Copy
                                              </Button>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed pt-1 whitespace-pre-line">
                                              {parsed.isi_materi || parsed.judul_utama || "No written text available."}
                                            </p>
                                          </div>

                                          {/* METADATA DESIGN SPECIFICATION BADGES */}
                                          {parsed.konsep_slide && (
                                            <div className="bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-3 font-sans">
                                              <h5 className="text-[9px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1.5">
                                                <Sliders className="w-3.5 h-3.5" />
                                                Spesifikasi Komposisi & Desain
                                              </h5>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-medium">
                                                {parsed.konsep_slide && <div><strong>Konsep Ilustrasi:</strong> <span className="text-slate-800 dark:text-slate-200">{parsed.konsep_slide}</span></div>}
                                                {parsed.mood_desain && <div><strong>Mood:</strong> <span className="text-slate-800 dark:text-slate-200">{parsed.mood_desain}</span></div>}
                                                {parsed.rekomendasi_font && <div><strong>Aesthetic Font:</strong> <span className="text-slate-800 dark:text-slate-200">{parsed.rekomendasi_font}</span></div>}
                                                {parsed.palet_warna && <div><strong>Palet Warna:</strong> <span className="text-slate-800 dark:text-slate-200">{parsed.palet_warna}</span></div>}
                                              </div>
                                            </div>
                                          )}

                                          {/* PROMPT BOX SECTION FOR TARGET AI GENERATOR */}
                                          <div className="space-y-2 font-sans">
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 flex items-center gap-1.5">
                                              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                                              {t('label_visual_prompt') || 'AI IMAGE GENERATION PROMPT (MIDJOURNEY COHERENT)'}
                                            </h5>
                                            
                                            <div className="bg-[#121318] text-slate-300 font-mono text-[11px] p-4 rounded-2xl leading-relaxed border border-slate-800 break-words relative max-h-[160px] overflow-y-auto custom-scrollbar shadow-inner select-text">
                                              {parsed.deskripsi_visual || parsed.visual_description}
                                            </div>
                                          </div>
                                        </div>

                                        {/* EXPANDABLE NEGATIVE PROMPT CONTAINER */}
                                        {parsed.negative_prompt && (
                                          <div className="bg-red-50/30 dark:bg-red-950/10 border border-red-200/40 p-3 rounded-xl text-[10px] text-slate-500 mt-2 font-sans col-span-12">
                                            <strong>Negative Prompt:</strong> {Array.isArray(parsed.negative_prompt) ? parsed.negative_prompt.join(", ") : parsed.negative_prompt}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                } catch (e) {
                                  // Fallback presentation in case it is purely narrative markdown instead of formatted structured JSON
                                  return (
                                    <div className="font-sans space-y-4">
                                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 font-sans">
                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest font-sans animate-pulse">
                                          Narrative Slide Output
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed select-text bg-white dark:bg-slate-900 border border-slate-200 p-5 rounded-2xl shadow-sm">
                                        {p.content}
                                      </p>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center mt-10 gap-4 pt-6 border-t-2 border-[#1455D9]/20 dark:border-blue-500/20">
                      <Button onClick={() => setStep(AppStep.INFO)} variant="secondary" icon={RefreshCw} className="w-full sm:w-auto px-6 py-3.5">
                        {t('btn_repair')}
                      </Button>
                      <Button onClick={handleGeneratePrompts} variant="primary" icon={Sparkles} className="w-full sm:w-auto px-7 py-3.5">
                        {t('btn_regenerate')}
                      </Button>
                      <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                        <Button variant="success" icon={ImageIcon} className="w-full px-7 py-3.5">
                          {t('btn_open_gemini')}
                        </Button>
                      </a>
                    </div>
                  </div>
                )}

                <DisclaimerFooter />
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      {renderStep()}
    </Layout>
  );
};
