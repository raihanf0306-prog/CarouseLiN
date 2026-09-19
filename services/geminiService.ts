import { FormData, PosterMode, TargetAudience, CarouselType, Platform, LanguageStyle, Gender, ColorStyle, AccentColor } from "../types";
import { Language } from "../translations";

export interface SequentialPrompt {
  title: string;
  content: string;
}

export const generateSequentialPrompts = async (formData: FormData, language: Language = 'id'): Promise<SequentialPrompt[]> => {
  try {
    const response = await fetch('/api/generate-prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ formData, language })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.prompts && Array.isArray(data.prompts)) {
      return data.prompts;
    }
    throw new Error('Invalid response structure from server');
  } catch (error: any) {
    console.error("Client Error generating sequential prompts:", error);
    const slideCountString = formData.slideCount || '5';
    const slideCount = parseInt(slideCountString.split(' ')[0]) || 5;
    const slideWord: Record<Language, string> = {
      id: 'Slide',
      en: 'Slide',
      ms: 'Slaid',
      ar: 'شريحة',
      zh: '幻灯片',
      ja: 'スライド'
    };
    const sWord = slideWord[language] || 'Slide';

    const fallbackTemplates: Record<Language, (i: number) => string> = {
      id: (i) => `Buat desain carousel edukasi untuk: ${formData.title || formData.topic || 'Konten Edukasi'}\nPlatform: ${formData.platform || 'Instagram'}\nTarget: ${formData.targetAudience || 'Umum'}\n\n(Auto prompt --ar ${formData.size || '1:1'})`,
      en: (i) => `Create an educational carousel design for: ${formData.title || formData.topic || 'Educational Content'}\nPlatform: ${formData.platform || 'Instagram'}\nAudience: ${formData.targetAudience || 'General'}\n\n(Auto prompt --ar ${formData.size || '1:1'})`,
      ms: (i) => `Cipta reka bentuk carousel pendidikan untuk: ${formData.title || formData.topic || 'Kandungan Pendidikan'}\nPlatform: ${formData.platform || 'Instagram'}\nSasaran: ${formData.targetAudience || 'Umum'}\n\n(Auto prompt --ar ${formData.size || '1:1'})`,
      ar: (i) => `إنشاء تصميم كاروسيل تعليمي لـ: ${formData.title || formData.topic || 'محتوى تعليمي'}\nالمنصة: ${formData.platform || 'Instagram'}\nالجمهور: ${formData.targetAudience || 'عام'}\n\n(Auto prompt --ar ${formData.size || '1:1'})`,
      zh: (i) => `为以下内容创建教育轮播图设计：${formData.title || formData.topic || '教育内容'}\n发布平台：${formData.platform || 'Instagram'}\n受众群体：${formData.targetAudience || '通用'}\n\n(Auto prompt --ar ${formData.size || '1:1'})`,
      ja: (i) => `教育カルーセルデザインを作成：${formData.title || formData.topic || '教育コンテンツ'}\nプラットフォーム：${formData.platform || 'Instagram'}\n対象：${formData.targetAudience || '一般'}\n\n(Auto prompt --ar ${formData.size || '1:1'})`,
    };

    return Array.from({ length: slideCount }, (_, i) => ({
      title: `${sWord} ${i + 1}`,
      content: (fallbackTemplates[language] || fallbackTemplates.id)(i)
    }));
  }
};

export const generateAutoFillContent = async (
  mode: PosterMode | string, 
  currentValues: { 
    topic: string; 
    title: string; 
    material: string; 
    cta: string;
    targetAudience?: TargetAudience | string; 
    carouselType?: CarouselType; 
    platform?: Platform | string;
    languageStyle?: LanguageStyle | string;
    genre?: string;
    hookType?: string;
    colorStyle?: ColorStyle | string;
    accentColor?: AccentColor | string;
    ctaActive: boolean; 
    funFact: string; 
    funFactActive: boolean; 
    slideCount?: string;
    showCharacter: boolean;
    textOnly?: boolean;
    characterOption?: string;
    gender: Gender | null;
    hijab: boolean;
    niqab: boolean;
  }, 
  context: 'topic' | 'title' | 'material' | 'cta' | 'funFact' = 'topic',
  language: Language = 'id'
): Promise<Partial<FormData>> => {
  try {
    const response = await fetch('/api/autofill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mode, currentValues, context, language })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.data) {
      return data.data;
    }
    return {};
  } catch (error: any) {
    console.error(`Client Error autofilling ${context}:`, error);
    const localizedTopics: Record<Language, string[]> = {
      id: [
        '5 Kebiasaan Produktif Content Creator Sukses',
        'Strategi Bangun Personal Branding di Era AI',
        'Cara Bikin Carousel Edukatif yang Ramai Interaksi',
        'Tips Manajemen Waktu untuk Pekerja Kreatif'
      ],
      en: [
        '5 Habits of Highly Productive Creators',
        'Personal Branding Strategies in the AI Era',
        'How to Create High-Converting Educational Carousels',
        'Time Management Mastery for Creative Professionals'
      ],
      ms: [
        '5 Tabiat Produktif Pencipta Kandungan Berjaya',
        'Strategi Bina Jenama Peribadi di Era AI',
        'Cara Cipta Carousel Pendidikan yang Menarik Interaksi',
        'Tip Pengurusan Masa untuk Penggiat Kreatif'
      ],
      ar: [
        '5 عادات لرواد وصناع المحتوى الأكثر إنتاجية',
        'استراتيجيات بناء العلامة التجارية الشخصية في عصر الذكاء الاصطناعي',
        'كيفية تصميم كاروسيل تعليمي يجذب تفاعلاً عالياً',
        'نصائح فعالة لإدارة الوقت للمبدعين'
      ],
      zh: [
        '高效内容创作者的 5 个关键习惯',
        'AI 时代的个人品牌打造策略',
        '如何制作高互动率的教育轮播图',
        '创意工作者的时间管理秘诀'
      ],
      ja: [
        '生産性の高いクリエイターの5つの習慣',
        'AI時代におけるパーソナルブランディング戦略',
        '反響を生む教育カルーセルの作り方',
        'クリエイターのためのタイムマネジメント術'
      ]
    };

    if (context === 'topic') {
      const list = localizedTopics[language] || localizedTopics.id;
      return { topic: list[Math.floor(Math.random() * list.length)] };
    }
    if (context === 'title') {
      const aud = currentValues.targetAudience ? ` untuk ${currentValues.targetAudience}` : '';
      const titles: Record<Language, string> = {
        id: currentValues.topic ? `3 Langkah Praktis: ${currentValues.topic}${aud}` : `Rahasia Sukses Konten Edukasi${aud}`,
        en: currentValues.topic ? `3 Practical Steps: ${currentValues.topic}${aud}` : `Practical Guide to Impactful Content${aud}`,
        ms: currentValues.topic ? `3 Langkah Praktikal: ${currentValues.topic}${aud}` : `Panduan Praktikal Kandungan${aud}`,
        ar: currentValues.topic ? `3 خطوات عملية: ${currentValues.topic}` : 'دليل عملي لتعزيز جودة المحتوى التعليمي',
        zh: currentValues.topic ? `3个实用步骤：${currentValues.topic}` : '提升教育内容影响力的实用指南',
        ja: currentValues.topic ? `3つの実践ステップ：${currentValues.topic}` : '教育コンテンツの成果を高める実践ガイド'
      };
      return { title: titles[language] || titles.id };
    }
    if (context === 'material') {
      const topicName = currentValues.topic || currentValues.title || 'Edukasi';
      const materials: Record<Language, string> = {
        id: `Slide 1: ${currentValues.title || topicName}\nIngin hasil konten lebih optimal dan menghemat waktu? Simak tips praktis berikut!\n\nSlide 2: Tantangan Terbesar\nBanyak kreator terjebak pada proses teknis yang rumit sehingga kehilangan konsistensi posting.\n\nSlide 3: Kunci Utama\nFokus pada struktur pesan yang jelas: Hook menarik, isi berbobot, dan ajakan interaksi yang tegas.\n\nSlide 4: 3 Langkah Taktis\n1. Tentukan satu pesan inti tiap postingan\n2. Gunakan visual kontras dan mudah dibaca\n3. Sederhanakan alur kalimat agar cepat dipahami\n\nSlide 5: Kesimpulan\nKonsistensi dan pesan yang jelas adalah kunci utama pertumbuhan konten. Mulai terapkan di postingan berikutnya!`,
        en: `Slide 1: ${currentValues.title || topicName}\nWant to optimize your content workflow and save hours? Check out these actionable tips!\n\nSlide 2: The Core Challenge\nMany creators get lost in complex technical details and struggle with posting consistency.\n\nSlide 3: The Key Principle\nFocus on a clear structure: strong hook, high-value insights, and a direct call to action.\n\nSlide 4: 3 Actionable Steps\n1. Define one single key takeaway per carousel\n2. Prioritize high contrast and readable typography\n3. Keep sentence structure simple and punchy\n\nSlide 5: Summary\nClarity and consistency drive sustainable audience growth. Apply this on your next post!`,
        ms: `Slaid 1: ${currentValues.title || topicName}\nIngin hasil kandungan lebih optimum dan menjimatkan masa? Fahami tip praktikal berikut!\n\nSlaid 2: Cabaran Utama\nRamai pencipta terperangkap dalam proses teknikal rumit sehingga hilang konsistensi posting.\n\nSlaid 3: Kunci Kejayaan\nFokus pada struktur mesej yang jelas: Hook menarik, isi bernilai, dan seruan bertindak yang tegas.\n\nSlaid 4: 3 Langkah Praktikal\n1. Tetapkan satu mesej teras setiap posting\n2. Gunakan visual kontras dan mudah dibaca\n3. Permudahkan ayat agar cepat difahami\n\nSlaid 5: Kesimpulan\nKonsistensi dan kejelasan adalah kunci perkembangan kandungan. Mulakan pada posting seterusnya!`,
        ar: `شريحة 1: ${currentValues.title || topicName}\nهل ترغب في تحسين محتواك وتوفير ساعات من العمل؟ إليك هذه النصائح العملية!\n\nشريحة 2: التحدي الأكبر\nيقع الكثيرون في فخ التفاصيل التقنية المعقدة مما يؤثر على استمرارية النشر.\n\nشريحة 3: المبدأ الجوهري\nركز على هيكل واضح: عنصر جذب قوي، قيمة معرفية حقيقية، ودعوة تفاعل واضحة.\n\nشريحة 4: 3 خطوات تنفيذية\n1. حدد فكرة رئيسية واحدة لكل منشور\n2. اعتمد تبايناً بصرياً وخطاً واضحاً ومريحاً للقراءة\n3. بسط الصياغة لتصل الفكرة سريعاً\n\nشريحة 5: الخلاصة\nالوضوح والاستمرارية هما سر نجاح المحتوى. ابدأ بتطبيقها في منشورك القادم!`,
        zh: `幻灯片 1: ${currentValues.title || topicName}\n想让内容产出更高效、更具影响力？掌握以下实用技巧！\n\n幻灯片 2: 核心挑战\n许多创作者沉迷于繁琐的制作流程，难以保持持续发布的节奏。\n\n幻灯片 3: 成功法则\n专注清晰的结构：抓人眼球的 Hook、干货满满的核心内容与明确的互动行动呼吁。\n\n幻灯片 4: 3个执行要点\n1. 每个轮播图只讲透一个核心要点\n2. 采用高对比度、手机端大字号清晰排版\n3. 语言精炼易懂，减少认知负担\n\n幻灯片 5: 总结\n清晰度与持续性是内容成长的双引擎。在下一篇内容中立即运用吧！`,
        ja: `スライド 1: ${currentValues.title || topicName}\nコンテンツの成果を高め、制作時間を短縮したい方へ。今すぐ使える実践のコツを解説！\n\nスライド 2: 最大の課題\n多くのクリエイターが複雑な作業に時間を取られ、継続的な投稿を維持できなくなります。\n\nスライド 3: 成功の原則\nシンプルな構成に集中：魅力的なフック、価値ある要点、そして明確なアクション促進。\n\nスライド 4: 3つの実践ポイント\n1. 1投稿につき伝えたいメッセージを1つに絞る\n2. スマホで読みやすいコントラストと文字サイズを徹底する\n3. 短く明快な文章でテンポよく伝える\n\nスライド 5: まとめ\n明快さと継続力こそが成長のカギです。次の投稿から早速取り入れてみましょう！`
      };
      return { material: materials[language] || materials.id };
    }
    if (context === 'cta') {
      const ctas: Record<Language, string> = {
        id: 'Simpan postingan ini untuk dipelajari nanti dan bagikan ke rekanmu!',
        en: 'Save this post for later reference and share it with your network!',
        ms: 'Simpan hantaran ini untuk rujukan nanti dan kongsikan kepada rakan anda!',
        ar: 'احفظ هذا المنشور للرجوع إليه لاحقاً وشاركه مع زملائك!',
        zh: '收藏本篇内容随时复习，并分享给有需要的朋友！',
        ja: '後で見返せるように保存して、仲間にもシェアしてください！'
      };
      return { cta: ctas[language] || ctas.id };
    }
    if (context === 'funFact') {
      const facts: Record<Language, string> = {
        id: `${currentValues.topic || 'Topik'} - Fakta menarik: Carousel edukatif memiliki tingkat simpan (save rate) 3x lebih tinggi dibanding postingan gambar tunggal.`,
        en: `${currentValues.topic || 'Topic'} - Fun Fact: Educational carousels generate up to 3x higher save rates compared to single image posts.`,
        ms: `${currentValues.topic || 'Topik'} - Fakta Menarik: Carousel pendidikan memperoleh kadar simpanan 3x lebih tinggi berbanding imej tunggal.`,
        ar: `${currentValues.topic || 'الموضوع'} - حقيقة ممتعة: تحقق منشورات الكاروسيل التعليمية معدل حفظ أعلى بثلاثة أضعاف مقارنة بالمنشورات أحادية الصورة.`,
        zh: `${currentValues.topic || '主题'} - 趣味事实：教育类轮播图的收藏率平均为单图帖子的 3 倍以上。`,
        ja: `${currentValues.topic || 'トピック'} - 豆知識：教育型カルーセルは、1枚画像投稿に比べて保存率が約3倍高くなります。`
      };
      return { funFact: facts[language] || facts.id };
    }
    return {
      [context]: currentValues.topic || 'Edu'
    };
  }
};
