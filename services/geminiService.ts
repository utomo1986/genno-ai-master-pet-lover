
import { GoogleGenAI, Modality } from "@google/genai";
import type { UploadedFile } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImageContent = async (file: File, contentType: 'pet' | 'owner'): Promise<{ animalType?: string; warning?: string; }> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not set, skipping image validation.");
        return {}; // Gracefully skip validation if API key is not available
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = contentType === 'pet'
        ? "Analisis gambar ini. Hewan spesifik apa yang ada di gambar ini (misalnya, 'seekor anjing golden retriever', 'seekor kucing tabby')? Jika gambar tidak berisi hewan, atau hewan tersebut bukan subjek utama, jawab dengan 'Bukan hewan'. Jawab dengan singkat."
        : "Does this image prominently feature one or more human persons? Please answer with only 'YES' or 'NO'.";

    try {
        const imagePart = await fileToGenerativePart(file);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, { text: prompt }] }],
        });
        
        if (!response.candidates || response.candidates.length === 0) {
            console.warn('Image validation was blocked or returned no content. Assuming valid.');
            return {};
        }

        const resultText = response.text.trim();
        
        if (contentType === 'pet') {
            if (resultText.toLowerCase().includes('bukan hewan')) {
                return { warning: 'Peringatan: Gambar ini mungkin tidak berisi hewan peliharaan.' };
            }
            return { animalType: resultText };
        } else { // owner
             if (resultText.toUpperCase() !== 'YES') {
                return { warning: 'Peringatan: Gambar ini mungkin tidak berisi orang.' };
            }
            return {};
        }

    } catch (error) {
        console.error('Error during image analysis:', error);
        return { warning: 'Tidak dapat menganalisis konten gambar.' };
    }
};

export const generatePetPortrait = async (
  prompt: string,
  images: UploadedFile[],
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (images.length === 0) {
      throw new Error("Please upload at least one image to generate a portrait.");
  }

  const imageParts = await Promise.all(
    images.map(img => fileToGenerativePart(img.file))
  );

  const contents = [{
      parts: [
          ...imageParts,
          { text: prompt },
      ],
  }];

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
          responseModalities: [Modality.IMAGE],
      },
  });

  if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts) {
      if (response.promptFeedback && response.promptFeedback.blockReason) {
          throw new Error(`Pembuatan gambar diblokir karena: ${response.promptFeedback.blockReason}. Harap sesuaikan prompt Anda dan coba lagi.`);
      }
      throw new Error("API tidak mengembalikan gambar yang valid. Permintaan mungkin telah difilter karena alasan keamanan.");
  }

  for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
  }

  throw new Error("Tidak ada gambar yang dihasilkan oleh API.");
};