import { GoogleGenAI, Type, Content } from '@google/genai';
import { AURA_SYSTEM_INSTRUCTION } from '../constants';
import type { AuraResponse, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
    },
    emotion: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        animation_hint: { type: Type.STRING },
      },
      required: ['label', 'confidence', 'animation_hint']
    },
  },
  required: ['message', 'emotion']
};

const MAX_RETRIES = 4;
const INITIAL_DELAY_MS = 5000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function sendMessageToAura(history: ChatMessage[], newMessage: string): Promise<AuraResponse> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const contents: Content[] = history.map(msg => ({
        role: msg.sender === 'aura' ? 'model' : 'user',
        parts: [{ text: msg.message }]
      }));
      contents.push({ role: 'user', parts: [{ text: newMessage }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: AURA_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });
      
      const jsonString = response.text.trim();
      const parsedResponse: AuraResponse = JSON.parse(jsonString);
      return parsedResponse; // Success!
    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');

      if (isRateLimitError && attempt < MAX_RETRIES) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Rate limit hit. Retrying in ${delayMs}ms... (Attempt ${attempt}/${MAX_RETRIES})`);
        await delay(delayMs);
      } else {
        // Not a rate limit error, or final attempt failed. Break loop.
        break;
      }
    }
  }

  // If we exit the loop, it means all retries have failed.
  console.error('Error processing Aura response after all retries:', lastError);

  const finalErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
  const isFinalRateLimitError = finalErrorMessage.includes('429') || finalErrorMessage.includes('RESOURCE_EXHAUSTED');
  
  if (isFinalRateLimitError) {
    return {
      message: "I'm feeling a little overwhelmed right now. Please wait a moment before trying again.",
      emotion: {
        label: 'worried',
        confidence: 1.0,
        animation_hint: 'shake'
      },
    };
  }

  // Generic fallback for other errors
  return {
    message: "I'm sorry, I encountered a technical glitch. Please try again shortly.",
    emotion: {
      label: 'sad',
      confidence: 1.0,
      animation_hint: 'shake'
    },
  };
}