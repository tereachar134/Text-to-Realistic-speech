
import { GoogleGenAI, Modality } from "@google/genai";

export const generateSpeech = async (text: string, voiceName: string): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    return base64Audio || null;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to generate speech. Please check your API key and network connection.");
  }
};
