
import { GoogleGenAI } from "@google/genai";
import { InputImage } from "../types";

const PROMPT_TEMPLATE = `Close-up portrait photo of a highly detailed man with expressive features holding a perfect, polished chrome sphere in his open palm. 
In the reflection of the sphere, we see a clear reflection of the back of another man sitting at a desk, looking at a modern computer monitor. 
The computer monitor displays the very same image of the first man holding the sphere. 
The background environment is a surreal, infinite gallery of massive white marble columns extending into a misty distance. 
Cinematic lighting, hyper-realistic, 8k resolution, recursive composition, Droste effect, profound and philosophical atmosphere.`;

const REFERENCE_PROMPT_TEMPLATE = `Based on the provided image, create a recursive masterpiece. 
The subject in the image should be holding a perfect, polished chrome sphere in their open palm. 
In the reflection of the sphere, we see a clear reflection of the back of a person (matching the subject) sitting at a desk, looking at a modern computer monitor. 
The computer monitor displays the very same image of the subject holding the sphere. 
Place them in an infinite gallery of massive marble columns. 
Maintain the likeness and style of the original image but transform it into this recursive paradox. 
Hyper-realistic, 8k resolution, Droste effect.`;

export async function generateRecursiveImage(inputImage?: InputImage): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const parts: any[] = [];
    
    if (inputImage) {
      parts.push({
        inlineData: {
          data: inputImage.data,
          mimeType: inputImage.mimeType
        }
      });
      parts.push({ text: REFERENCE_PROMPT_TEMPLATE });
    } else {
      parts.push({ text: PROMPT_TEMPLATE });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No image generated in the response parts.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Image data not found in the response.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
}
