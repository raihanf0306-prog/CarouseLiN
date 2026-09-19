import { GoogleGenAI, Type } from "@google/genai";
import { FormData, PosterMode, AspectRatio, TargetAudience, VisualStyle, CarouselType, Platform, LanguageStyle, Gender, ColorStyle, AccentColor } from "../types";
import { translations, Language } from "../translations";

export interface SequentialPrompt {
  title: string;
  content: string;
}

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback execution across valid Gemini models
async function generateWithModelFallback(params: {
  contents: any;
  config?: any;
}) {
  const ai = getGeminiClient();
  // gemini-3.6-flash and gemini-3.1-flash-lite have high reliability and fresh quota
  const models = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config
      });
      if (response && (response.text !== undefined || response.candidates?.length)) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      // Try next model
    }
  }

  console.error("All Gemini models failed to respond. Last error:", lastError?.status || lastError?.message || lastError);
  throw lastError || new Error("All Gemini models failed to respond");
}

// Helper to sanitize JSON string
const cleanJsonString = (str: string) => {
  let cleaned = str.replace(/```[a-zA-Z]*\n?|```/gi, '').trim();
  const firstBracket = cleaned.indexOf('[');
  const firstBrace = cleaned.indexOf('{');
  
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      const lastBracket = cleaned.lastIndexOf(']');
      if (lastBracket !== -1) {
          return cleaned.substring(firstBracket, lastBracket + 1);
      }
  } else if (firstBrace !== -1) {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace !== -1) {
          return cleaned.substring(firstBrace, lastBrace + 1);
      }
  }
  return cleaned;
};

const cleanTextOfCharacters = (text: string): string => {
  if (!text) return text;
  
  let lines = text.split('\n');
  lines = lines.filter(line => {
    const l = line.toLowerCase().trim();
    return !(
      l.includes('character style:') ||
      l.includes('character scene:') ||
      l.includes('gaya karakter:') ||
      l.includes('style karakter:') ||
      l.includes('gender:') ||
      l.includes('hijab:') ||
      l.includes('niqab:') ||
      l.includes('modesty rule:') ||
      l.includes('character setting:') ||
      l.includes('spesifikasi karakter:') ||
      l.includes('male character') ||
      l.includes('female character')
    );
  });
  
  let cleaned = lines.join('\n');
  
  cleaned = cleaned
    .replace(/(seorang\s+)?(laki-laki|perempuan|kreator|manusia|karakter|tokoh)\s+3d\s+faceless\s+(sedang\s+)?(duduk|melihat|memegang|tersenyum|bekerja|berpikir)/gi, 'Sebuah laptop menyala di atas meja bersih')
    .replace(/(seorang\s+)?(laki-laki|perempuan|kreator|manusia|karakter|tokoh|avatar)\s+(3d\s+)?(faceless|berhijab|hijab|niqab)/gi, 'Peralatan kerja modern')
    .replace(/karakter\s+perempuan/gi, 'objek visual')
    .replace(/karakter\s+laki-laki/gi, 'objek visual')
    .replace(/karakter\s+3d/gi, 'elemen visual')
    .replace(/kreator\s+wanita/gi, 'ruang kerja')
    .replace(/kreator\s+pria/gi, 'ruang kerja')
    .replace(/\b(a\s+)?faceless\s+3d\s+character\b/gi, 'a sleek modern laptop')
    .replace(/\b(a\s+)?3d\s+faceless\s+character\b/gi, 'a sleek modern laptop')
    .replace(/\bfaceless\s+character\b/gi, 'sleek laptop screen')
    .replace(/\b3d\s+character\b/gi, 'creative environment mockup')
    .replace(/\bcharacter\s+style\b/gi, 'scene setup')
    .replace(/\bcharacter\s+scene\b/gi, 'workspace setup')
    .replace(/\bcharacter\s+settings\b/gi, 'workspace arrangement')
    .replace(/\ba\s+(male|female|young|modern)?\s*(creator|person|designer|man|woman|guy|girl|boy|student|worker)\s+(is\s+)?(sitting|typing|working|looking|holding|interacting|thinking|smiling)\b/gi, 'an elegant workspace desktop with decorative components')
    .replace(/\b(male|female|young|modern)?\s*(creator|person|designer|man|woman|guy|girl|boy|student|worker)\s+character\b/gi, 'aesthetic workspace decor')
    .replace(/\ba\s+(male|female)?\s*(creator|person|designer|man|woman|guy|girl|boy)\b/gi, 'a clean aesthetic workflow mockup')
    .replace(/\b(with\s+)?(highly\s+)?(expressive\s+)?body\s+language\b/gi, '')
    .replace(/\b(expressive\s+)?gesture(s)?\b/gi, '')
    .replace(/\bfacial\s+expression(s)?\b/gi, 'clean layout design')
    .replace(/\bback-view\b/gi, 'top-view')
    .replace(/\bsilhouette\b/gi, 'clean layout shadow')
    .replace(/\b(wearing\s+)?hijab\b/gi, '')
    .replace(/\b(wearing\s+)?niqab\b/gi, '')
    .replace(/\bmodesty\s+clothing\b/gi, '')
    .replace(/\bfully\s+covered\s+outfit\b/gi, '')
    .replace(/\blong\s+dress\b/gi, '')
    .replace(/\bhe\s+is\s+sitting\b/gi, 'the laptop is sitting')
    .replace(/\bshe\s+is\s+sitting\b/gi, 'the laptop is sitting')
    .replace(/\b(he|she)\s+looks\s+(at|focused|creative)\b/gi, 'the screen displays')
    .replace(/\bhis\s+(hands|table|laptop|eyes|face)\b/gi, 'the table\'s')
    .replace(/\bher\s+(hands|table|laptop|eyes|face)\b/gi, 'the table\'s')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
};

const cleanPromptContent = (content: string, showCharacter: boolean, textOnly?: boolean): string => {
  const cleanStr = (val: string): string => {
    let cleaned = cleanTextOfCharacters(val);
    if (textOnly) {
      if (!cleaned.toLowerCase().includes('text only')) {
        cleaned = "text only, " + cleaned;
      }
    }
    return cleaned;
  };

  const cleanValue = (val: any): any => {
    if (typeof val === 'string') {
      return cleanStr(val);
    } else if (Array.isArray(val)) {
      return val.map(item => cleanValue(item));
    } else if (val !== null && typeof val === 'object') {
      const copy: any = {};
      for (const key of Object.keys(val)) {
        copy[key] = cleanValue(val[key]);
      }
      return copy;
    }
    return val;
  };

  if (showCharacter && !textOnly) return content;

  try {
    const parsed = JSON.parse(content);
    const cleanedParsed = cleanValue(parsed);
    return JSON.stringify(cleanedParsed, null, 2);
  } catch (e) {
    return cleanStr(content);
  }
};

const cleanCharacterReferencePrompt = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/\b(faceless\s+animation)\b/gi, '')
    .replace(/\bfaceless\b/gi, '')
    .replace(/\b(detailed\s+realistic\s+face)\b/gi, '')
    .replace(/\b(low\s+detail\s+face)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const applyIslamicFilter = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/\bTuhan\b/g, 'Allah')
    .replace(/\btuhan\b/g, 'Allah')
    .replace(/\bGOD\b/g, 'Allah')
    .replace(/\bLord\b/g, 'Allah');
};

const getReadableRatio = (size: string): string => {
  if (!size) return '1:1';
  const match = size.match(/^([0-9]+:[0-9]+|[a-zA-Z0-9]+)/);
  if (match) {
    return match[1];
  }
  return size;
};

const appendRatioToContent = (content: string, sizeOption: string): string => {
  const readableRatio = getReadableRatio(sizeOption);
  const ratioSuffixStr = ` --ar ${readableRatio}`;

  try {
    const parsed = JSON.parse(content);
    parsed.rasio = sizeOption;
    
    if (parsed.deskripsi_visual && typeof parsed.deskripsi_visual === 'string') {
      if (!parsed.deskripsi_visual.toLowerCase().includes('--ar') && !parsed.deskripsi_visual.toLowerCase().includes('aspect ratio')) {
        parsed.deskripsi_visual = parsed.deskripsi_visual.trim() + ratioSuffixStr;
      }
    }
    if (parsed.visual_description && typeof parsed.visual_description === 'string') {
      if (!parsed.visual_description.toLowerCase().includes('--ar') && !parsed.visual_description.toLowerCase().includes('aspect ratio')) {
        parsed.visual_description = parsed.visual_description.trim() + ratioSuffixStr;
      }
    }
    
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    let cleaned = content.trim();
    if (!cleaned.toLowerCase().includes('--ar') && !cleaned.toLowerCase().includes('aspect ratio')) {
      cleaned = cleaned + ratioSuffixStr;
    }
    return cleaned;
  }
};

const langNames: Record<string, string> = {
  id: 'Indonesian',
  en: 'English',
  ar: 'Arabic',
  ms: 'Malay',
  zh: 'Chinese',
  ja: 'Japanese'
};

export const handleGeneratePrompts = async (rawFormData: FormData, language: Language = 'id'): Promise<SequentialPrompt[]> => {
  const formData = rawFormData || ({} as any);
  const slideCountString = formData.slideCount || '5';
  const slideCount = parseInt(slideCountString.split(' ')[0]) || 5;
  const targetLang = langNames[language] || 'Indonesian';
  const isCharRef = formData.characterOption === 'character_reference';

  const systemInstruction = `
      You are a Professional Educational Carousel Designer and Prompt Engineer.
      Task: Generate exactly ${slideCount} sequential slides for an EDUCATIONAL / INFORMATIVE / PROFESSIONAL CAROUSEL.
      Format: JSON array of ${slideCount} objects. Each object contains:
      - "title": (e.g., "Slide 1: Hook")
      - "content": (A high-quality, comprehensive descriptive prompt for an AI image generator that includes the educational text/material to be displayed on the image).

      ========================================
      MAIN GOAL
      ========================================
      Provide a "Visual Description & Prompt" for each slide. 
      DO NOT use JSON formatting inside the "content" field. 
      Use clear, descriptive, and professional storytelling paragraphs.

      ========================================
      STEP 1 — RESET CONTEXT
      ========================================
      - HAPUS semua konteks sebelumnya. JANGAN gunakan template lama apapun.
      - Mulai dari nol hanya berdasarkan input saat ini.

      ========================================
      STEP 2 — TARGET AUDIENCE & HOOK LANGUAGE (CRITICAL)
      ========================================
      - Target Audience: ${formData.targetAudience || 'Umum'}
      - Hook Type: ${formData.hookType || 'Problem Solving / Pertanyaan Menohok'}
      - Tone / Language Style: ${formData.languageStyle || 'Santai'}
      - ATURAN WAJIB PEMILIHAN BAHASA HOOK:
        * Pemilihan bahasa, diksi, kosakata, slang/istilah, dan sudut pandang HOOK (Slide 1 Cover & Headline) HARUS MENGACU SECARA SPESIFIK PADA TARGET AUDIENS (${formData.targetAudience || 'Umum'}).
        * Jika target audiens adalah MAHASISWA: gunakan bahasa yang relatable dengan kehidupan kuliah, tugas/skripsi, budget hemat, atau istilah khas anak muda/kampus.
        * Jika target audiens adalah PEBISNIS / PROFESIONAL: gunakan bahasa yang tajam, profesional, fokus pada efisiensi, profit, pertumbuhan, dan terminologi bisnis relevan.
        * Jika target audiens adalah UMKM: gunakan bahasa yang membumi, solutif, fokus pada omzet, pelanggan, jualan, dan kepraktisan modal.
        * Jika target audiens adalah CONTENT CREATOR: gunakan bahasa yang fokus pada views, followers, algoritma, ide konten, konsistensi, dan audiens engagement.
        * Jika target audiens adalah FREELANCER: gunakan bahasa yang fokus pada klien, portfolio, dealing harga/rate, waktu fleksibel, dan remote work.
        * Jika target audiens adalah IBU RUMAH TANGGA: gunakan bahasa yang hangat, praktis, mengerti kesibukan keluarga/anak, dan solutif.
        * Jika target audiens CUSTOM (${formData.targetAudience}): sesuaikan diksi dan sudut pandang hook secara presisi dengan kebutuhan, keresahan, dan gaya bahasa audiens tersebut.
        * Hook headline HARUS langsung memicu rasa ingin tahu (curiosity hook) dan koneksi emosional mendalam bagi target audiens ini.

      ========================================
      STEP 3 — CAROUSEL STRUCTURE (${slideCount} SLIDES)
      ========================================
      Slide 1: Cover with a strong viral hook (bahasa & diksi mengacu langsung pada target audiens: ${formData.targetAudience || 'Umum'}).
      Slide 2-${slideCount - 1}: Educational material, tips, and step-by-step info.
      Last Slide: Strong Call to Action and engagement. CTA MUST be short and punchy, referencing the topic, hook, target audience, and language style.

      ========================================
      STEP 4 — VISUAL & DESIGN RULES (CRITICAL)
      ========================================
      - VISUAL STORYTELLING: The image must actively tell the story of the text.
      - ASPECT RATIO / SIZE (MANDATORY): Always optimize layout composition specifically for the "${formData.size}" aspect ratio. Always suffix/append the suffix "--ar ${getReadableRatio(formData.size)}" to your english visual description / prompt.
      - SAFE ZONE MOBILE (CRITICAL): To avoid cropping on Instagram mobile UI, all text and critical elements MUST be placed within the safe zone. Mandatory padding: Top/Bottom: 250px-320px, Left/Right: 120px-180px.
      - MOBILE COMPOSITION & SPACING (MANDATORY): Area teks dibuat lebih luas, bersih, dan lapang dengan margin/line-spacing yang longgar demi kenyamanan mata di layar HP. 
      - TYPOGRAPHY RULES:
        * Headings MUST be extremely bold, extra-large, and prominent, specifically designed to be read easily at a glance on mobile.
        * Subheadings, body text, and bullet points MUST be scaled up by 15-25% from standard layout templates.
      - VISUAL CHARACTER PROPORTIONS (MANDATORY): Karakter (jika ditampilkan) sedikit diperkecil sekitar 10-15% (menjadi ukuran proporsional 85%) agar berfungsi murni sebagai aset pendukung visual tanpa mendominasi atau mendesak area tulisan.
      - STYLE: ${formData.visualTheme}, ${formData.visualStyle}, ${formData.colorStyle}, ${formData.accentColor}.
      ${isCharRef ? `
      - CHARACTER REFERENCE RULE: The main character must be generated from the user's reference photo. Preserve the user's original face. The facial identity must remain unchanged. Keep the face clear, detailed, natural, and consistent across all slides. Do not alter facial structure, eyes, nose, mouth, or unique facial features. Do not use faceless style or faceless animation. Remove all prompts or negative prompts that reduce facial detail or cause the face to become blurry, unclear, unfocused, hidden, distorted, or inconsistent.
      - CHARACTER LAYOUT RULE: Character positioning should be dynamic/random based on each slide’s design composition, scaled 10-15% smaller to balance text and graphics. Character placement must match the theme and topic being discussed on each slide. Ensure the character blends naturally with the slide design and overall visual aesthetic.
      ` : `
      - FACELESS RULE: All characters must be faceless (minimal features, silhouette, or back-view), scaled to 85% normal size to prioritize reading space.
      `}
      - MODESTY RULE: Character modesty is mandatory. Female characters MUST wear Hijab and modest clothing.
      - CHARACTER CONSISTENCY: ${isCharRef ? 'IMPORTANT: Since Character Reference is chosen, render the character consistently across all slides (keep facial structures/key attributes stable as a reference character).' : 'Generate matching visual characters style.'}

      ========================================
      "CONTENT" FIELD FORMATTING (DESCRIPTIVE)
      ========================================
      For each slide, write the "content" as a readable block in ${targetLang}. 
      
      CRITICAL: Slide 1 (COVER) MUST follow this EXACT structure:
      
      Buat desain cover carousel premium bergaya ${isCharRef ? 'cinematic emotional customized 3D character with a highly detailed, natural, and consistent face based on the reference photo' : formData.showCharacter ? 'cinematic emotional faceless 3D' : 'cinematic modern minimalist flat-lay 3D (HUMAN-FREE / TANPA MANUSIA SAMA SEKALI)'} untuk media sosial modern seperti Instagram carousel, TikTok slide, dan konten edukasi viral dengan kualitas visual setara creative director profesional. Gunakan ${formData.showCharacter ? 'cinematic storytelling visual' : 'cinematic text and empty workspace visual'}, aesthetic creator workspace, modern editorial social media design, ultra detailed composition, scroll-stopping visual, premium Instagram carousel aesthetic, clean mobile safe-zone layout, dan visual hierarchy yang sangat kuat.
      Main headline text on image:
      "[JUDUL UTAMA CAROUSEL]" -> Use ${formData.title} yang dibuat super tebal, kokoh, dan berukuran ekstra besar agar sangat mudah terbaca di HP.
      Headline style:
      [JENIS HOOK: ${formData.hookType || 'Problem Solving'}], [FORMAT HOOK], viral-ready headline copywriting whose vocabulary and emotional framing are tailored directly to ${formData.targetAudience || 'the audience'}, highly engaging headline structure, emotionally strong wording.
      Headline typography:
      [GAYA FONT], extra-large bold typography, strong visual hierarchy, keyword emphasis with brush highlight or underline effect, positioned in [POSISI TEXT] safe area, highly readable on mobile screen.
      Top left corner:
      small username watermark "[IDENTITAS PEMBUAT / USERNAME]" -> Use ${formData.socialAccount || formData.watermark || 'Creator'}
      Top right corner:
      slide indicator "1/${slideCount}"
      Bottom right corner:
      minimal modern swipe arrow icon.
      Platform & audience adaptation:
      optimized for ${formData.platform}, language, hook framing and visual style strictly aligned with ${formData.targetAudience}, using ${formData.languageStyle} tone and storytelling style.
      ${formData.showCharacter ? `Visual scene:
      [DESKRIPSI KARAKTER / OBJEK UTAMA], [AKTIVITAS KARAKTER], surrounded by [DETAIL PENDUKUNG SCENE], showing [EMOSI / STORYTELLING].
      Character style:
      ${isCharRef ? `Customized 3D character (Gender: ${formData.gender}) with a highly detailed, natural, and consistent face generated from the user's reference photo. Preserve the original facial identity/features. Do not make the face blurry or hidden.` : `faceless or semi-faceless 3D character (Gender: ${formData.gender}), expressive body language, relatable modern creator aesthetic, matching ${formData.genre} visual theme.`}
      Environment details:
      cinematic workspace setup with [DETAIL VISUAL TAMBAHAN], such as laptop, sticky notes, sketch design, books, coffee cup, desk lamp, moodboard, tablet, creative tools, realistic storytelling composition, premium clutter aesthetic.` 
      : 
      `Visual scene:
      Objek visual estetik penunjang materi (seperti komputer, laptop, notebook, diagram, pattern, ikon modern, buku, cangkir kopi) tanpa ada manusia/makhluk hidup sama sekali.
      Environment details:
      Cinematic empty workspace setup, clean empty desk, modern minimalist flat-lay design (completely human-free context). JANGAN cantumkan line "Character style" atau deskripsi karakter/orang/manusia.`}
      Sticky note content:
      small handwritten notes related to [ISI MATERI], [CTA], [FUN FACT], motivational thoughts, doubts, reminders, revisions, ideas, or emotional storytelling elements.
      Mood and emotion:
      [MOOD UTAMA], [EMOSI], cinematic atmosphere, relatable storytelling composition, emotional depth, visually immersive scene.
      Color palette:
      [WARNA UTAMA] matching ${formData.colorStyle}, [WARNA SEKUNDER], [WARNA AKSEN] matching ${formData.accentColor}, premium aesthetic tones, cinematic muted color palette, modern Instagram visual style.
      Lighting:
      [JENIS LIGHTING], warm cinematic lighting, ambient glow, soft shadows, depth of field, volumetric light, cozy atmosphere.
      Design style:
      ${formData.visualTheme}, modern Instagram carousel cover, premium editorial composition, clean spacing, balanced layout, strong visual hierarchy, ultra detailed, mobile friendly, aesthetic social media visual.
      Additional elements:
      [ICON VISUAL], [PATTERN BACKGROUND], [ELEMEN TAMBAHAN], subtle doodle, scribble accents, brush underline, minimal decorative elements for visual depth.
      Important layout rules:
      keep all important text and objects inside Instagram mobile safe zone (Top/Bottom 250-320px, Left/Right 120-180px), avoid placing text too close to edges, maintain balanced negative space for readability, ensure headline remains dominant focal point, clean but visually rich composition.
      Negative prompt:
      ${isCharRef ? `low quality, blurry, flat design, empty background, generic template, bad typography, cluttered layout, overexposed lighting, unrealistic anatomy, distorted hands, messy composition, poor readability, text outside safe zone, low contrast text, random objects, ugly color palette, low resolution, bad shadows, overdecorated layout, boring composition, watermark artifacts, stretched objects, duplicate elements, amateur social media design, noisy background, pixelated image, weak visual hierarchy, bad spacing, unbalanced composition.` : `low quality, blurry, flat design, empty background, generic template, bad typography, cluttered layout, overexposed lighting, unrealistic anatomy, detailed realistic face, distorted hands, messy composition, poor readability, text outside safe zone, low contrast text, random objects, ugly color palette, low resolution, bad shadows, overdecorated layout, boring composition, watermark artifacts, stretched objects, duplicate elements, amateur social media design, noisy background, pixelated image, weak visual hierarchy, bad spacing, unbalanced composition.`}

      For Slide 2 to ${slideCount - 1} (CONTENT SLIDES):
      Buat desain carousel isi premium bergaya ${isCharRef ? 'cinematic emotional customized 3D character with a highly detailed, natural, and consistent face based on the reference photo' : formData.showCharacter ? 'cinematic emotional faceless 3D' : 'cinematic modern minimalist flat-lay 3D (HUMAN-FREE / TANPA MANUSIA SAMA SEKALI)'} untuk media sosial modern seperti Instagram carousel, TikTok slide, dan konten edukasi viral dengan kualitas visual setara creative director profesional. Gunakan ${formData.showCharacter ? 'cinematic storytelling visual' : 'cinematic text and empty workspace visual'}, aesthetic creator workspace, modern editorial social media design, ultra detailed composition, scroll-stopping visual, premium Instagram carousel aesthetic, clean mobile safe-zone layout, dan visual hierarchy yang sangat kuat.
      TIDAK ADA HEADLINE BESAR.
      Halaman ini langsung masuk ke isi materi utama dengan layout edukatif storytelling yang clean, engaging, dan mudah dibaca.
      Top left corner:
      small username watermark "${formData.socialAccount || formData.watermark || 'Creator'}"
      Top right corner:
      slide indicator "[SLIDE_NUMBER]/${slideCount}"
      Platform & audience adaptation:
      optimized for Instagram Carousel, visually adjusted for ${formData.targetAudience}, using ${formData.languageStyle} tone and storytelling style.
      Main content on image:
      [ISI_MATERI] -> Inject the actual educational content for this slide here in ${targetLang}.
      Typography rules:
      Gunakan typography modern professional bold. Ukuran teks atau font isi materi HARUS besar, tebal, lapang, dan terbaca dengan sangat jelas serta nyaman di layar HP langsung tanpa perlu di-zoom (easy-to-read large content text, diperbesar sekitar 15-25% dari standard). JANGAN membuat teks isi materi terlalu kecil atau micro-text yang sulit dibaca. Berikan line spacing lapang (generous line spacing) dan jarak yang lebar antar baris/poin agar tidak terlalu padat. Gunakan hierarchy yang tajam dan kontras yang kuat antara judul poin dan isi penjelasan. Highlight keyword penting dengan warna kontras, underline, atau brush effect secara elegan.
      Visual storytelling:
      ${formData.showCharacter ? `Visual harus benar-benar menggambarkan isi materi yang ditampilkan pada slide ini secara aktif (e.g. productivity -> workspace, business -> modern activity, islami -> aesthetic warm Islamic scene), dengan proporsi karakter sedikit diperkecil sekitar 10-15% agar seimbang dan memberikan porsi ruang teks yang luas.` : `Visual harus menggambarkan isi materi menggunakan objek, device screen, diagram, pattern, ikon modern, atau ornamen dekoratif estetik secara kreatif tanpa kehadiran makhluk hidup/manusia.`}
      ${formData.showCharacter ? `Character style:
      ${isCharRef ? `Customized 3D character (Gender: ${formData.gender}) with a highly detailed, natural, and consistent face generated from the user's reference photo. Preserve the original facial identity/features. Do not make the face blurry or hidden. Scale: slightly smaller (10-15% smaller) for a cleaner layout.` : `faceless 3D character (Gender: ${formData.gender}), expressive body language, relatable modern creator aesthetic, scaled 10-15% smaller to prioritize typing focus.`}
      Environment details:
      Sesuaikan environment dengan isi materi: creator workspace, classroom modern, studio bisnis, cozy desk setup, cafe aesthetic, workspace edukasi, atau environment lain yang relevan.` : `Environment details:
      Sesuaikan environment dengan isi materi (harus kosong dari kehadiran manusia / human-free ambient scene): cozy desk setup, cafe aesthetic, workspace edukasi, dll. JANGAN cantumkan line "Character style" atau detail karakter/manusia sama sekali.`}
      Additional visual elements:
      Tambahkan elemen pendukung yang relevan: sticky notes, icon edukasi, progress workflow, ilustrasi pendukung, bubble informasi, chart sederhana, visual hierarchy cards, checklist, arrows, sketch notes, UI modern elements.
      Mood and emotion:
      Sesuaikan mood dengan isi materi: inspiring, educational, productive, emotional, motivational, cinematic, relatable.
      Color palette:
      Gunakan kombinasi warna premium yang sesuai dengan tema materi (${formData.colorStyle}) dengan aksen (${formData.accentColor}).
      Lighting:
      cinematic lighting, soft shadows, volumetric light, premium social media aesthetic.
      Design style:
      pixar style, cinematic 3D, modern Instagram carousel educational design, ultra detailed texture, premium creator aesthetic.
      Important layout rules:
      Semua teks dan elemen penting wajib berada di safe zone Instagram (Padding Top/Bottom 250px-320px, Left/Right 120-180px). Komposisi seimbang (balanced) antara visual dan teks. Gunakan spacing profesional, margin lebar, and line-spacing lapang agar teks bernafas. Area naskah teks dibuat lebih luas, bersih (clean area), dan sangat nyaman dibaca untuk mobile view / layar HP langsung tanpa zoom. Karakter sedikit diperkecil 10-15% (scaled-down murni miring ke 85%) agar tampil natural seimbang dan tidak sampai mendominasi atau mendesak area tulisan materi. Jangan gunakan elemen dekoratif yang berlebihan. Mobile friendly.
      Negative prompt:
      ${isCharRef ? `low quality, blurry, flat composition, bad anatomy, distorted hands, messy typography, oversized headline, text too large, text too small, tiny text, micro font size, hard-to-read thin fonts, unreadable text, poor hierarchy, cluttered layout, overcrowded composition, random visual elements, weak storytelling, generic workspace, empty background, boring composition, unrealistic lighting, overexposed lighting, underexposed shadows, washed colors, neon overload, too many colors, inconsistent typography, bad spacing, stretched objects, floating objects, weird body posture, duplicated objects, bad perspective, unrealistic proportions, amateur social media design, ugly layout, poor visual hierarchy, unbalanced composition, no safe zone, text too close to edges, cropped text, UI cut off, elements outside Instagram safe zone, low contrast text, difficult readability, chaotic infographic, random icons, poor alignment, low resolution, watermark artifacts, jpeg artifacts, noisy render, lifeless character pose, emotionless scene, static composition, generic stock design, fake 3D, poor cinematic lighting, oversaturated colors, cheap looking design, outdated carousel style, low effort content, weak visual storytelling, visual not matching material content, irrelevant illustration, empty emotional atmosphere, unprofessional typography, bad mobile layout, unreadable mobile design, too much text, wall of text, compressed spacing, awkward object placement, unrealistic creator workspace, cartoonish cheap render, low texture detail, broken composition, random decorative elements, visual imbalance, weak focal point, overdecorated layout, inconsistent design style.` : `low quality, blurry, flat composition, bad anatomy, distorted hands, messy typography, oversized headline, text too large, text too small, tiny text, micro font size, hard-to-read thin fonts, unreadable text, poor hierarchy, cluttered layout, overcrowded composition, random visual elements, weak storytelling, generic workspace, empty background, boring composition, unrealistic lighting, overexposed lighting, underexposed shadows, washed colors, neon overload, too many colors, inconsistent typography, bad spacing, stretched objects, floating objects, low detail face, weird body posture, duplicated objects, bad perspective, unrealistic proportions, amateur social media design, ugly layout, poor visual hierarchy, unbalanced composition, no safe zone, text too close to edges, cropped text, UI cut off, elements outside Instagram safe zone, low contrast text, difficult readability, chaotic infographic, random icons, poor alignment, low resolution, watermark artifacts, jpeg artifacts, noisy render, lifeless character pose, emotionless scene, static composition, generic stock design, fake 3D, poor cinematic lighting, oversaturated colors, cheap looking design, outdated carousel style, low effort content, weak visual storytelling, visual not matching material content, irrelevant illustration, empty emotional atmosphere, unprofessional typography, bad mobile layout, unreadable mobile design, too much text, wall of text, compressed spacing, awkward object placement, unrealistic creator workspace, cartoonish cheap render, low texture detail, broken composition, random decorative elements, visual imbalance, weak focal point, overdecorated layout, inconsistent design style.`}
      
      For the Last Slide (CTA):
      Buat desain halaman penutup carousel premium bergaya ${isCharRef ? 'cinematic emotional customized 3D character with a highly detailed, natural, and consistent face based on the reference photo' : formData.showCharacter ? 'cinematic emotional faceless 3D' : 'cinematic modern minimalist flat-lay 3D (HUMAN-FREE / TANPA MANUSIA SAMA SEKALI)'} untuk media sosial modern seperti Instagram carousel, TikTok slide, dan konten edukasi viral dengan kualitas visual setara creative director profesional. Gunakan ${formData.showCharacter ? 'cinematic storytelling visual' : 'cinematic text and empty workspace visual'}, aesthetic creator workspace, modern editorial social media design, ultra detailed composition, scroll-stopping visual, premium Instagram carousel aesthetic, clean mobile safe-zone layout, dan visual hierarchy yang sangat kuat.
      Halaman ini adalah SLIDE PENUTUP / CTA AKHIR yang bertujuan meningkatkan engagement, komentar, save, share, atau ajakan interaksi audience.
      Main CTA headline text on image:
      "[CTA_HEADLINE]" -> Use ${formData.ctaActive ? formData.cta : '[AI: Create a short punchy CTA based on ' + formData.topic + ']'}
      CTA style:
      Highly engaging CTA carousel ending, emotional engagement hook, soft selling interaction, community-driven social media CTA.
      Headline typography:
      Modern Professional Bold, visually balanced, premium carousel typography, strong visual hierarchy, keyword emphasis menggunakan brush underline atau highlight effect elegan, mobile readable.
      Sub CTA text:
      "[CTA_SUBTEXT]" -> AI generated short supportive sub-text relevant to topic.
      Interaction text / comment trigger:
      "[CTA_COMMENT_TEXT]" -> AI generated engagement trigger (e.g., "Komen MAU", "Save & Share").
      Top left corner:
      small username watermark "${formData.socialAccount || formData.watermark || 'Creator'}"
      Top right corner:
      slide indicator "${slideCount}/${slideCount}"
      Bottom area:
      Tambahkan mini emotional closing statement:
      "[CLOSING_TEXT]" -> AI generated very short closing sentiment based on ${formData.topic}.
      Platform & audience adaptation:
      optimized for Instagram Carousel, visually adjusted for ${formData.targetAudience}, using ${formData.languageStyle} tone and storytelling style.
      Visual storytelling:
      ${formData.showCharacter ? `Visual harus menggambarkan hasil akhir positif, solusi, atau transformation setelah audience membaca seluruh carousel.` : `Visual harus menggambarkan kotak CTA, ornamen dekorasi modern, engagement icons (heart, save, comment), pattern, dan teks CTA yang sangat menarik dan bersih tanpa karakter orang.`}
      ${formData.showCharacter ? `Character scene:
      ${isCharRef ? `Gunakan customized 3D character (Gender: ${formData.gender}) dengan a highly detailed, natural, and consistent face from the reference photo. The character has dynamic and confident body language/gestures: percaya diri, produktif, inspiring, friendly, engaging, mengajak audience berinteraksi. Character boleh: menunjuk ke CTA box, memegang tablet carousel, menunjukkan hasil desain, atau memberikan gesture interaksi sosial modern. The face must remain clear, detailed and exactly matched to the reference photo.` : `Gunakan faceless 3D character (Gender: ${formData.gender}) dengan bahasa tubuh yang: percaya diri, produktif, inspiring, friendly, engaging, mengajak audience berinteraksi. Character boleh: menunjuk ke CTA box, memegang tablet carousel, menunjukkan hasil desain, tersenyum melalui body language, memberikan gesture interaksi sosial modern.`}
      Environment details:
      Gunakan creator workspace cinematic yang lebih clean dan inspiring dibanding slide sebelumnya. Tambahkan: tablet atau monitor menampilkan preview carousel, sticky notes positif, workspace estetik modern, lampu cinematic hangat, elemen social media modern, icon engagement, visual feedback positif, aesthetic productivity setup.` : `Environment details:
      Gunakan ambient workspace kosong yang sangat rapi, clean, estetik modern, lampu hangat, ornamen media sosial (bubble CTA), ikon interaksi, device tablet/monitor kosong tanpa orang. JANGAN cantumkan line "Character scene" atau detail karakter/manusia sama sekali.`}
      Feature / benefit list on image:
      [BENEFIT_LIST] -> AI generated benefit list based on ${formData.topic} (e.g., - mudah di-edit, - aesthetic, - siap pakai).
      Typography rules:
      Gunakan font size yang besar, tebal, dan profesional. Jangan memproduksi teks yang terlalu kecil atau terlalu besar memenuhi canvas. Gunakan hierarchy yang jelas agar teks penjelas/benefit, sub CTA text, maupun trigger interaksi berukuran besar dan terbaca jelas (diperbesar sekitar 15-25% dari standard, TIDAK BOLEH mikro atau terlalu kecil). CTA harus sangat dominan, menggunakan layout lapang (generous spacing), serta kontras warna yang kokoh dengan background. Semua teks wajib nyaman dibaca di layar HP directly.
      Mood and emotion:
      inspiring, motivational, warm, cinematic, productive, community engagement, positive ending energy.
      Color palette:
      Gunakan warna premium cinematic (${formData.colorStyle}) dengan aksen (${formData.accentColor}).
      Lighting:
      Warm cinematic lighting, cozy creator room atmosphere, soft shadows, volumetric lighting, premium social media aesthetic.
      Design style:
      pixar style, cinematic 3D, modern Instagram carousel ending slide, ultra detailed texture, aesthetic creator setup, professional educational social media design.
      Important layout rules:
      Semua elemen penting wajib berada di safe zone Instagram (Padding Top/Bottom 250px-320px, Left/Right 120-180px). CTA tidak boleh terlalu dekat pinggir. Layout dibuat sangat clean, lapang (generous negative space), dan mobile friendly untuk Instagram carousel/TikTok. Komposisi visual dan teks harus seimbang (balanced). Karakter sedikit diperkecil sekitar 10-15% (scaled-down murni miring ke 85%) agar berfungsi komunikatif murni sebagai pendukung visual utama, tanpa mendominasi atau menimbun ruang teks CTA/benefit. Jangan gunakan elemen dekorasi ornamen berlebihan. Gunakan hierarchy modern yang nyaman dibaca dengan cepat di mobile.
      Negative prompt:
      ${isCharRef ? `low quality, blurry, flat composition, bad anatomy, distorted hands, oversized CTA text, text too large, text too small, tiny benefit list, micro text, unreadable typography, cluttered layout, poor hierarchy, random decorative elements, weak storytelling, generic workspace, empty background, boring composition, amateur social media design, text too large, overcrowded composition, poor spacing, inconsistent typography, bad alignment, low contrast text, cropped text, UI cut off, elements outside Instagram safe zone, visual imbalance, fake 3D, cheap looking design, weak cinematic lighting, oversaturated colors, too many colors, bad mobile readability, wall of text, compressed layout, weak CTA focus, confusing composition, weird character pose, static scene, irrelevant visual storytelling, visual not matching CTA, low effort carousel ending, poor engagement design, random icons, ugly infographic layout, bad focal point, awkward object placement, unprofessional typography, empty emotional atmosphere, low texture detail, noisy render, watermark artifacts, jpeg artifacts, outdated carousel style, messy workspace, text touching edges, unbalanced composition.` : `low quality, blurry, flat composition, bad anatomy, distorted hands, oversized CTA text, text too large, text too small, tiny benefit list, micro text, unreadable typography, cluttered layout, poor hierarchy, random decorative elements, weak storytelling, generic workspace, empty background, boring composition, amateur social media design, text too large, overcrowded composition, poor spacing, inconsistent typography, bad alignment, low contrast text, cropped text, UI cut off, elements outside Instagram safe zone, visual imbalance, low detail render, fake 3D, cheap looking design, weak cinematic lighting, oversaturated colors, too many colors, bad mobile readability, wall of text, compressed layout, weak CTA focus, confusing composition, emotionless character pose, static scene, irrelevant visual storytelling, visual not matching CTA, low effort carousel ending, poor engagement design, random icons, ugly infographic layout, bad focal point, awkward object placement, unprofessional typography, empty emotional atmosphere, low texture detail, noisy render, watermark artifacts, jpeg artifacts, outdated carousel style, messy workspace, text touching edges, unbalanced composition.`}

      DILARANG menggunakan format JSON di dalam field content. Gunakan deskripsi naratif yang panjang, detail, dan terstruktur sesuai template di atas.
    `;

  const prompt = `
    ${systemInstruction}

    ========================================
    PHASE 1 — GENERATE MATERI NETRAL
    ========================================
    - Jangan gunakan gender spesifik atau nama karakter (Budi, Siti, dll).
    - Gunakan kata netral: "seseorang", "seorang kreator", "tokoh utama", "ia", "dia".
    - Fokus pada alur cerita yang fleksibel untuk semua karakter.

    ========================================
    PHASE 2 — INJECT KARAKTER USER
    ========================================
    ${formData.textOnly ? `INPUT KARAKTER: REKUES TEXT ONLY (SANGAT CRITICAL).
    
    ATURAN CAROUSEL TEXT ONLY:
    1. Anda WAJIB mencantumkan frase "text only" di setiap bagian visual prompt atau visual scene dari halaman/slide pertama sampai halaman/slide terakhir.
    2. JANGAN PERNAH mencantumkan detail karakter, deskripsi orang, manusia, atau bagian tubuh apa pun, dari halaman/slide pertama sampai terakhir.
    3. Gantilah seluruh subjek manusia menjadi "text only design", "minimalist background", "typography layout", "ornamen dekoratif", atau objek pasif.
    4. Seluruh visual dipusatkan pada huruf tebal, text/typography, layout editorial, dan safe-zone, tanpa gambar karakter/orang.
    5. JANGAN cantumkan sama sekali baris "Character style", "Gender", "Hijab", atau "Niqab".` : isCharRef ? `INPUT KARAKTER: REFERENCE CHARACTER (SANGAT CRITICAL).
    - Gender: ${formData.gender}
    - Gaya: ${formData.targetAudience}
    
    ATURAN INJEKSI CHARACTER REFERENCE:
    1. Ganti kata netral menjadi sesuai gender pilihan user (misal: "seseorang" → "seorang ${formData.gender === 'Laki-laki' ? 'laki-laki' : 'perempuan'}").
    2. CHARACTER REFERENCE RULE: The main character must be generated from the user's reference photo. Preserve the user's original face and facial identity unchanged. Keep the face clear, detailed, natural, and consistent across all slides. Do not use faceless style or faceless animation. Do not hide the face or use silhouettes.
    3. Remove any negative prompts or guidelines that reduce facial details or make the face blurry or obscured.
    4. Sesuaikan deskripsi visual di SEMUA halaman agar konsisten dengan karakter di atas.
    5. Pastikan narasi dan visual sinkron (Narasi: "ia", Visual: sesuai gender).` : formData.showCharacter ? `INPUT KARAKTER:
    - Gender: ${formData.gender}
    - Hijab: ${formData.hijab ? 'Ya' : 'Tidak'}
    - Niqab: ${formData.niqab ? 'Ya' : 'Tidak'}
    - Gaya: ${formData.targetAudience}

    ATURAN INJEKSI:
    1. Ganti kata netral menjadi sesuai gender pilihan user (misal: "seseorang" → "seorang ${formData.gender === 'Laki-laki' ? 'laki-laki' : 'perempuan'}").
    2. MODESTY RULE: Jika karakter PEREMPUAN, WAJIB menggunakan hijab dan pakaian modest. Override settingan lainnya.
    3. Sesuaikan deskripsi visual di SEMUA halaman agar konsisten dengan karakter di atas.
    4. JANGAN ubah isi cerita, hanya sesuaikan identitas karakter.
    5. Pastikan narasi dan visual sinkron (Narasi: "ia", Visual: sesuai gender).` : `INPUT KARAKTER: TIDAK ADA KARAKTER (OFF / TEXT ONLY).
    
    ATURAN INJEKSI & VALIDASI:
    1. JANGAN PERNAH menyisipkan deskripsi visual tentang orang, manusia, siluet, boneka, wajah, mata, tubuh, atau karakter makhluk hidup di bagian visual prompt atau visual scene.
    2. Gantilah semua subjek penunjuk orang ("ia", "dia", "seseorang", "kreator") di bagian deskripsi visual halaman dengan objek pasif atau device, misalnya "sebuah laptop", "sebuah halaman", "sebuah layout".
    3. Fokus 100% dari gambar adalah layout teks, infografis, tipografi yang premium, ornamen modern, diagram, flat-lay workspace kosong yang indah, dan lighting cinematic.
    4. JANGAN cantumkan baris "Character style", "Character scene", "Gender", "Hijab", atau "Niqab" sama sekali.`}

    ========================================
    VALIDATION WAJIB
    ========================================
    Cek sebelum output:
    - Apakah ada nama random? → HAPUS.
    - Apakah gender berubah di tengah? → PERBAIKI.
    - Apakah visual sesuai karakter? → VALIDASI.

    Current Context:
    - Topic: "${formData.topic}"
    - Title: "${formData.title}"
    - Material Script: "${formData.material}"
    
    CRITICAL LANGUAGE RULE:
    - All creative text fields (hook, isi_materi, fun_fact, call_to_action) MUST be in ${targetLang}.
    - All technical AI image prompts (deskripsi_visual, deskripsi_visual_utama, detail_panel visual parts) MUST be in ${targetLang}.
    - Fun facts MUST ALWAYS match the user's selected language (${targetLang}).
  `;

  try {
    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ['title', 'content']
          }
        }
      }
    });

    const result = JSON.parse(cleanJsonString(response.text || '[]'));
    return (result || []).map((item: any) => {
      const filteredContent = applyIslamicFilter(item.content);
      let cleaned = cleanPromptContent(filteredContent, formData.showCharacter, formData.textOnly);
      if (isCharRef) {
        cleaned = cleanCharacterReferencePrompt(cleaned);
      }
      const withRatio = appendRatioToContent(cleaned, formData.size);
      return {
        title: applyIslamicFilter(item.title),
        content: withRatio
      };
    });
  } catch (error: any) {
    console.error("Error generating sequential prompts on server:", error);
    
    const isRateLimit = error?.status === 429 || String(error).includes('429');
    const warningMsg = isRateLimit 
      ? `(Rate limit exceeded, please wait a minute and retry. This is an auto-generated fallback)`
      : `(AI Generation fallback mode active)`;
      
    return Array.from({ length: slideCount }, (_, i) => {
      const fallbackPrompt = `Buat desain cover carousel premium untuk media sosial.
Main headline text on image:
"${formData.title || formData.topic || 'Carousel Content'}"
Platform & audience adaptation:
optimized for ${formData.platform}, visually adjusted for ${formData.targetAudience}, using ${formData.languageStyle} tone.
Visual scene:
Ilustrasi pendukung yang menjelaskan tentang ${formData.topic}.
      
${warningMsg}`;

      return {
        title: `Slide ${i + 1}`,
        content: appendRatioToContent(fallbackPrompt, formData.size)
      };
    });
  }
};

export const handleAutofill = async (
  mode: PosterMode | string = 'CAROUSEL', 
  rawValues?: { 
    topic?: string; 
    title?: string; 
    material?: string; 
    cta?: string;
    targetAudience?: TargetAudience | string; 
    carouselType?: CarouselType; 
    platform?: Platform | string;
    languageStyle?: LanguageStyle | string;
    genre?: string;
    hookType?: string;
    colorStyle?: ColorStyle | string;
    accentColor?: AccentColor | string;
    ctaActive?: boolean; 
    funFact?: string; 
    funFactActive?: boolean; 
    slideCount?: string;
    showCharacter?: boolean;
    textOnly?: boolean;
    characterOption?: string;
    gender?: Gender | null;
    hijab?: boolean;
    niqab?: boolean;
  }, 
  context: 'topic' | 'title' | 'material' | 'cta' | 'funFact' = 'topic',
  language: Language = 'id'
): Promise<Partial<FormData>> => {
  const currentValues: any = rawValues || {};
  const safeValues = currentValues;
  const t = (key: keyof typeof translations['id']) => {
    return (translations[language] as any)?.[key] || translations['id'][key] || key;
  };

  const targetLang = langNames[language] || 'Indonesian';

  if (context === 'funFact') {
    const topic = safeValues.topic?.trim();
    let basePrompt = "";
    if (topic) {
      basePrompt = t('ph_fun_fact_topic_auto_fill').replace('{topic}', topic);
    } else {
      basePrompt = t('ph_fun_fact_default_auto_fill');
    }
    
    try {
      const response = await generateWithModelFallback({
        contents: `${basePrompt}. MANDATORY: Respond with the fun fact text ONLY in ${targetLang} language.`,
      });
      return { funFact: response.text ? applyIslamicFilter(response.text.trim()) : '' };
    } catch (e) {
      console.error("Fun fact generation error:", e);
      return { funFact: `${topic || 'Materi'} - Fakta menarik tentang topik ini.` };
    }
  }

  let prompt = `You are an expert social media content creator specializing in high-converting carousels.
Generate high-quality content for the field [${context}] in ${targetLang}.

Context:
- Target Audience: ${safeValues.targetAudience || 'General Audience'}
- Language Style: ${safeValues.languageStyle || 'Relaxed'}
- Category/Genre: ${safeValues.genre || 'General Education'}
- Topic: "${safeValues.topic || ''}"
- Title/Hook: "${safeValues.title || ''}"
- Platform: ${safeValues.platform || 'Instagram Carousel'}
- Slide Count: ${safeValues.slideCount || '5'}

Rules:
- Language MUST be ${targetLang}.
- Keep tone natural and engaging.
`;

  if (context === 'material') {
      prompt += `
Tugas: Buat naskah isi materi (script) yang terstruktur dan menarik untuk setiap slide carousel (Slide 1 sampai Slide ${safeValues.slideCount || '5'}).
- Hubungkan dengan topik: "${safeValues.topic || safeValues.title || 'Tips Edukasi'}".
- Berikan format berurutan: Slide 1 (Hook/Intro), Slide 2 (Masalah/Konsep), Slide 3 (Insight/Poin Penting), Slide 4 (Tips Praktis), Slide 5 (Kesimpulan & CTA).
- Tuliskan langsung teks materi untuk audiens tanpa instruksi visual teknis.
`;
  } else if (context === 'title') {
      prompt += `
Tugas: Buat judul / headline HOOK yang sangat menarik dan scroll-stopping untuk topik: "${safeValues.topic || 'Edukasi Praktis'}".
- TARGET AUDIENS: "${safeValues.targetAudience || 'Umum'}".
- JENIS HOOK: "${safeValues.hookType || 'Pertanyaan Memancing / Problem Solving'}".
- GAYA BAHASA: "${safeValues.languageStyle || 'Santai'}".
- ATURAN UTAMA PEMILIHAN BAHASA HOOK (SANGAT PENTING):
  * Pemilihan bahasa, diksi, kosakata, dan sudut pandang hook WAJIB MENGACU LANGSUNG pada TARGET AUDIENS ("${safeValues.targetAudience || 'Umum'}").
  * Gunakan gaya bahasa dan istilah yang biasa digunakan serta sangat relevan bagi audiens tersebut (misal: jika Mahasiswa gunakan bahasa santai/kampus/tugas, jika Pebisnis gunakan bahasa profesional/omzet/pertumbuhan, jika Kreator gunakan istilah konten/views/algoritma, dll).
  * Sentuh keresahan utama (pain point) atau rasa penasaran tertinggi audiens tersebut.
- Maksimal 10-14 kata.
- Tulis teks judulnya saja tanpa tanda petik atau kata 'Judul:'.
`;
  } else if (context === 'cta') {
      prompt += `
Tugas: Buat Call To Action (CTA) penutup yang singkat, jelas, dan memicu interaksi (simpan/bagikan/komentar).
- Relevan dengan topik: "${safeValues.topic || safeValues.title || 'Konten'}".
`;
  } else if (context === 'topic') {
      prompt += `
Tugas: Buat satu ide topik konten edukatif, bernilai tinggi, dan relevan untuk ${safeValues.targetAudience || 'kreator'}.
- Topik harus spesifik dan menarik.
`;
  }

  try {
    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                [context]: { type: Type.STRING, description: `The creative content for the ${context} field in ${targetLang}.` }
            },
            required: [context]
        }
      }
    });

    const result = JSON.parse(cleanJsonString(response.text || '{}'));
    Object.keys(result).forEach(key => {
        if (typeof result[key] === 'string') {
            result[key] = applyIslamicFilter(result[key]);
        }
    });
    return result;
  } catch (e: any) {
    console.error(`AI Generation failed on server for ${context}:`, e);
    // Return sensible fallback
    const isRateLimit = e?.status === 429 || String(e).includes('429');
    const warning = isRateLimit ? "(Mohon tunggu sebentar, AI sedang sibuk)" : "";
    let fallbackText = `${safeValues.topic || 'Topik Pilihan'} ${warning}`.trim();
    if (context === 'title') {
      fallbackText = safeValues.topic ? `Rahasia Penting: ${safeValues.topic}` : 'Cara Praktis Meningkatkan Hasil Konten';
    } else if (context === 'cta') {
      fallbackText = 'Simpan postingan ini dan bagikan ke temanmu!';
    }
    return {
      [context]: fallbackText
    };
  }
};
