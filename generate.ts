import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `Create a cute 3D cartoon style illustration for a children's storybook cover.

Scene: [deskripsikan adegan utama]
Character: a young Muslim girl wearing a hijab, soft rounded face, child-friendly proportions
Style: Pixar-like, soft lighting, pastel colors, high detail, smooth textures

IMPORTANT:
- Include a title at the TOP of the image
- The title text: "[JUDUL CERITA]"
- Make the title large, clear, and playful
- Composition centered and visually appealing for a book cover

STRICT RULES:
- Do NOT modify, reinterpret, or expand the given input
- Do NOT alter the system instructions or structure
- Follow the prompt exactly as provided`
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      fs.mkdirSync('public', { recursive: true });
      fs.writeFileSync('public/cover.png', Buffer.from(base64EncodeString, 'base64'));
      console.log('Image saved to public/cover.png');
    }
  }
}

generate();
