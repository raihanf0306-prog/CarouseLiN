
export enum AppStep {
  LANDING = 'LANDING',
  MENU = 'MENU',
  INFO = 'INFO',
  VISUAL = 'VISUAL',
  RESULT = 'RESULT',
}

export enum PosterMode {
  CAROUSEL = 'Carousel', 
}

export enum CarouselType {
  POSTER_DAKWAH = 'Poster Dakwah',
  HOOK_ISI_PENUTUP = 'Hook → Isi → Penutup',
  MASALAH_SOLUSI_KESIMPULAN = 'Masalah → Solusi → Kesimpulan',
  STEP_BY_STEP = 'Step-by-Step',
  CERITA_BERURUTAN = 'Cerita Berurutan',
  TANYA_JAWAB = 'Tanya → Jawab',
  FAKTA_PENJELASAN = 'Fakta → Penjelasan',
  CHECKLIST_LIST = 'Checklist / List',
  STORYTELLING = 'Storytelling',
  EDUKASI_BERTAHAP = 'Edukasi Bertahap',
}

export enum Platform {
  INSTAGRAM_CAROUSEL = 'Instagram Carousel',
  FACEBOOK_CAROUSEL = 'Facebook Carousel',
  LINKEDIN_CAROUSEL = 'LinkedIn Carousel',
  CUSTOM = 'Custom',
}

export enum LanguageStyle {
  RELAXED = 'Santai', // Renamed from EDUCATIVE_RELAXED
  INSTRUCTIVE = 'Instruktif', // New
  STORYTELLING = 'Storytelling', // Renamed from CREATIVE_STORY
  FORMAL_ACADEMIC = 'Formal Akademik',
  MOTIVATIONAL_INSPIRATIONAL = 'Motivasi & Inspiratif',
  CHILD_FRIENDLY = 'Ramah Anak',
  CUSTOM = 'Custom',
}

export enum Genre {
  EDUCATION = 'Edukasi',
  BUSINESS = 'Bisnis & UMKM',
  TECHNOLOGY = 'Teknologi',
  HEALTH_FITNESS = 'Kesehatan & Fitness',
  LIFESTYLE = 'Lifestyle',
  MOTIVATION = 'Motivasi',
  ENTERTAINMENT = 'Hiburan',
  RELIGION = 'Religi',
  FOOD_BEVERAGE = 'Food & Beverage',
  TRAVEL = 'Travel',
  CUSTOM = 'Custom',
}

export enum HookType {
  POSITIVE = '1️⃣ Positive Hook',
  NEGATIVE = '2️⃣ Negative Hook',
  PENASARAN = '3️⃣ Penasaran Hook',
  EMOTIONAL = '4️⃣ Emotional Hook',
  RELATABLE = '5️⃣ Relatable Hook',
  CONTROVERSIAL = '6️⃣ Controversial Hook',
  KHAWATIR = '7️⃣ Hook Khawatir',
  INSPIRATIONAL = '8️⃣ Inspirational Hook',
  SECRET = '9️⃣ Secret Hook',
  URGENCY = '🔟 Urgency Hook',
  AUTHORITY = '1️⃣1️⃣ Authority Hook',
  HUMOR = '1️⃣2️⃣ Humor Hook',
  CHALLENGE = '1️⃣3️⃣ Challenge Hook',
  FOMO = '1️⃣4️⃣ FOMO Hook',
  CUSTOM = '1️⃣5️⃣ Custom Hook',
}

export enum Gender {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan',
  MIXED = 'Campuran',
}

export enum AspectRatio {
  R_9_16 = '9:16 (Story/Reels)',
  R_1_1 = '1:1 (Square)',
  R_4_5 = '4:5 (IG Feed)',
  R_3_4 = '3:4 (Portrait)',
  R_16_9 = '16:9 (Landscape)',
  A4 = 'A4 (Print)',
  F4 = 'F4 (Print)',
  A3 = 'A3 (Print)',
  // ENV_SMALL = 'Amplop Kecil (7x10cm)', // Removed
  // ENV_LARGE = 'Amplop Besar (Uang Utuh)', // Removed
}

export enum VisualStyle {
  AUTO = 'AUTO',
  REALISTIC = 'REALISTIC',
  PHOTOREALISTIC = 'PHOTOREALISTIC',
  THREE_D = 'THREE_D',
  THREE_D_INDOOR = 'THREE_D_INDOOR',
  THREE_D_OUTDOOR = 'THREE_D_OUTDOOR',
  VECTOR = 'VECTOR',
  WATERCOLOR = 'WATERCOLOR',
  PAPER_CRAFT = 'PAPER_CRAFT',
  PIXEL_ART = 'PIXEL_ART',
  EXPRESSIVE_EDU_ILLUSTRATION = 'EXPRESSIVE_EDU_ILLUSTRATION',
  SERENE_3D_EDU_VISUAL = 'SERENE_3D_EDU_VISUAL',
  CINEMATIC_INFOGRAPHIC_FLOW = 'CINEMATIC_INFOGRAPHIC_FLOW',
  SOFT_EMPATHY_ILLUSTRATION = 'SOFT_EMPATHY_ILLUSTRATION',
}

export enum ColorStyle {
  CINEMATIC_DARK = 'Cinematic Gelap',
  SOFT_PASTEL = 'Pastel Lembut',
  MODERN_MINIMALIST = 'Minimalis Modern',
  BRIGHT_CREATOR = 'Creator Cerah',
  LUXURY_ELEGANT = 'Elegan Mewah',
  EARTH_TONE = 'Earth Tone / Nuansa Bumi',
  PROFESSIONAL_BLUE = 'Biru Profesional',
  MONOCHROME = 'Monokrom',
  ELEGANT_ISLAMIC = 'Islami Elegan',
  FOOD_CAFE = 'Food & Cafe / Kuliner & Cafe',
  SOFT_FEMININE = 'Feminim Lembut',
  FUTURISTIC_TECH = 'Futuristik Teknologi',
  AUTO = 'Otomatis AI ✨',
  CUSTOM = 'Custom Sendiri 🎨',
}

export enum AccentColor {
  ORANGE = 'Orange',
  GOLD = 'Gold',
  BLUE = 'Blue',
  GREEN = 'Green',
  PINK = 'Pink',
  PURPLE = 'Purple',
  RED = 'Red',
  AUTO = 'Otomatis AI ✨',
  CUSTOM = 'custom',
}

export enum TargetAudience {
  CONTENT_CREATOR = 'CONTENT_CREATOR',
  PEBISNIS = 'PEBISNIS',
  UMKM = 'UMKM',
  FREELANCER = 'FREELANCER',
  MAHASISWA = 'MAHASISWA',
  IBU_RUMAH_TANGGA = 'IBU_RUMAH_TANGGA',
  CUSTOM = 'CUSTOM'
}

export interface FormData {
  mode: PosterMode | null;
  // Main Fields
  preset: string;
  targetAudience: string;
  topic: string;
  title: string;
  material: string;
  cta: string;
  ctaActive: boolean; 
  funFact: string; 
  funFactActive: boolean; 
  
  // Specific for Carousel
  carouselType?: CarouselType;
  slideCount?: string;
  platform?: Platform | string; 
  languageStyle?: LanguageStyle | string; 
  genre?: Genre | string;
  hookType?: HookType | string;

  // Identity
  socialAccount: string;
  watermark: string;
  
  // Advanced
  size: string;
  visualStyle: string;
  visualTheme: string;
  colorStyle: ColorStyle | string;
  accentColor: AccentColor | string;
  additionalPrompt: string;
  
  // Character (Step 2)
  showCharacter: boolean;
  textOnly: boolean;
  characterOption?: string;
  gender: Gender | null;
  hijab: boolean;
  niqab: boolean;
}

export const INITIAL_DATA: FormData = {
  mode: null,
  preset: '',
  targetAudience: TargetAudience.CONTENT_CREATOR,
  topic: '',
  title: '',
  material: '',
  cta: '',
  ctaActive: false, 
  funFact: '', 
  funFactActive: false, 
  socialAccount: '',
  watermark: '',
  carouselType: CarouselType.POSTER_DAKWAH, 
  slideCount: '5 Slides',
  platform: Platform.INSTAGRAM_CAROUSEL,
  languageStyle: LanguageStyle.RELAXED, 
  genre: Genre.EDUCATION,
  hookType: HookType.POSITIVE,
  size: AspectRatio.R_9_16,
  visualStyle: VisualStyle.AUTO,
  visualTheme: 'auto',
  colorStyle: ColorStyle.AUTO,
  accentColor: AccentColor.AUTO,
  additionalPrompt: '',
  showCharacter: true,
  textOnly: false,
  characterOption: 'faceless',
  gender: Gender.MALE,
  hijab: false,
  niqab: false,
};
