import { GoogleGenAI, Modality } from "@google/genai";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const stripBase64 = (base64: string) => base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

const getMimeType = (base64: string) => {
  if (base64.startsWith('data:image/jpeg')) return 'image/jpeg';
  if (base64.startsWith('data:image/webp')) return 'image/webp';
  return 'image/png';
};

export const validateImageContent = async (base64Image: string, expectedType: 'pet' | 'human'): Promise<boolean> => {
  const ai = getAiClient();
  const prompt = expectedType === 'pet' 
    ? "Is there an animal in this image? Answer YES or NO."
    : "Is there a person in this image? Answer YES or NO.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: stripBase64(base64Image), mimeType: getMimeType(base64Image) } },
          { text: prompt }
        ]
      }
    });
    
    const text = response.text?.trim().toUpperCase();
    return text?.includes('YES') ?? true;
  } catch (error) {
    console.warn("Validation skipped due to API error:", error);
    return true; // Fail open if API errors to avoid blocking user
  }
};

export const generatePetPortrait = async (
  petImages: string[],
  humanImages: string[],
  promptModifier: string
): Promise<string> => {
  const ai = getAiClient();
  
  const parts: any[] = [];

  // Add all pet images
  petImages.forEach(img => {
    parts.push({
        inlineData: {
            data: stripBase64(img),
            mimeType: getMimeType(img),
        }
    });
  });

  // Add all human images
  humanImages.forEach(img => {
    parts.push({
        inlineData: {
            data: stripBase64(img),
            mimeType: getMimeType(img),
        }
    });
  });

  const hasHumans = humanImages.length > 0;

  // CONSTRUCTION OF THE MASTER PROMPT
  let finalPrompt = `ACT AS AN EXPERT DIGITAL ARTIST SPECIALIZING IN PHOTOREALISTIC COMPOSITING.\n\n`;
  
  if (hasHumans) {
     finalPrompt += `TASK: Composite the uploaded pet(s) AND human(s) together into a new scene based on the description below.\n`;
  } else {
     finalPrompt += `TASK: Create a portrait of the uploaded PET(S) ONLY in a new scene based on the description below.\n`;
  }

  finalPrompt += `CRITICAL REQUIREMENTS:\n`;
  
  if (hasHumans) {
      finalPrompt += `1. **STRICT FACE IDENTITY (MOST IMPORTANT)**: The human face(s) in the output MUST be identical to the uploaded human photos. Preserve the exact facial structure, nose shape, eyes, mouth, and age. Do not genericize or "beautify" the face. It must look like the EXACT same person.\n`;
      finalPrompt += `2. **INTIMATE INTERACTION**: The human and pet must be interacting closely (e.g., hugging, cheek-to-cheek, holding hands/paws, sitting on lap) to create an emotional connection.\n`;
      finalPrompt += `3. **REALISTIC SCALE**: Maintain realistic size proportions between the human and the pet.\n`;
  } else {
      finalPrompt += `1. **SOLO PET PORTRAIT (STRICT)**: The image must ONLY contain the specific pet uploaded.\n`;
      finalPrompt += `   - **NO HUMANS**: Do NOT generate any humans, owners, hands, arms, or legs. Even if the theme description mentions a human (e.g. "holding the pet"), IGNORE the human part and REMOVE the owner/hands completely. Apply the background and lighting to the pet alone.\n`;
      finalPrompt += `   - **NO EXTRA ANIMALS**: Do NOT add other pets or animals not present in the source image.\n`;
      finalPrompt += `2. **SUBJECT FOCUS**: The pet must be the main focus.\n`;
  }

  finalPrompt += `3. **PET AUTHENTICITY**: The pet must look exactly like the specific breed and individual animal uploaded.\n`;
  
  finalPrompt += `4. **STRICT VERTICAL COMPOSITION (3:4)**:\n`;
  finalPrompt += `   - **FULL BLEED**: The image must completely fill the 3:4 vertical canvas. NO black bars, NO white borders, NO empty space at top or bottom.\n`;
  finalPrompt += `   - **IGNORE INPUT ASPECT RATIO**: Even if the uploaded photo is wide (landscape/4:3/16:9), you MUST generate a tall (vertical) image by CROPPING the sides or extending the background vertically. Do NOT fit the whole landscape image into the frame.\n`;
  finalPrompt += `   - **FRAMING**: Use a close-up or mid-shot to ensure the subjects fill the frame. \n\n`;

  finalPrompt += `THEME & SCENE DESCRIPTION:\n${promptModifier}\n\n`;
  
  finalPrompt += `OUTPUT SPECS: Photorealistic, 8k resolution, highly detailed texture, Vertical 3:4 Aspect Ratio, Fill the frame, No Borders.`;

  parts.push({ text: finalPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { responseModalities: [Modality.IMAGE] },
    });

    const generatedParts = response.candidates?.[0]?.content?.parts;
    const imagePart = generatedParts?.find(p => p.inlineData);
    
    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
};

export const refineImage = async (
  originalGeneratedImage: string,
  instruction: string
): Promise<string> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: stripBase64(originalGeneratedImage),
              mimeType: 'image/png',
            },
          },
          {
            text: `Edit this image based on the following instruction: "${instruction}". \nIMPORTANT: Maintain the identity of the subjects (humans/pets) EXACTLY as they are. Ensure the result remains a high-quality VERTICAL 3:4 portrait that FILLS THE CANVAS completely (no borders, no black bars). If the current image has borders, REMOVE THEM. Do not add new subjects unless requested.`,
          },
        ],
      },
      config: { responseModalities: [Modality.IMAGE] },
    });

    const generatedParts = response.candidates?.[0]?.content?.parts;
    const imagePart = generatedParts?.find(p => p.inlineData);
    
    if (imagePart && imagePart.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error("No refined image generated.");
  } catch (error) {
    console.error("Refinement Error:", error);
    throw error;
  }
};