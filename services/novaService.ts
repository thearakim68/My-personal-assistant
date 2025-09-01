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
  let jsonString: string | undefined;
  let lastError: any = null;

  // Step 1: Get response from API with retries for retriable errors
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
      
      jsonString = response.text.trim();
      lastError = null; // Clear error on success
      break; // Exit loop successfully
    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');

      if (isRateLimitError && attempt < MAX_RETRIES) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Rate limit hit. Retrying in ${delayMs}ms... (Attempt ${attempt}/${MAX_RETRIES})`);
        await delay(delayMs);
      } else {
        break; // Non-retriable error or max retries hit
      }
    }
  }

  // Step 2: Handle API call failures after all retries
  if (lastError) {
    console.error('Error processing Aura response after all retries:', lastError);
    const finalErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    
    if (finalErrorMessage.includes('429') || finalErrorMessage.includes('RESOURCE_EXHAUSTED')) {
      return {
        message: "I'm feeling a little overwhelmed right now. Please wait a moment before trying again.",
        emotion: { label: 'worried', confidence: 1.0, animation_hint: 'shake' },
      };
    }
    
    // Generic API/network error
    return {
      message: "I'm sorry, I encountered a technical glitch. Please try again shortly.",
      emotion: { label: 'sad', confidence: 1.0, animation_hint: 'shake' },
    };
  }

  // Step 3: Parse the successful response
  if (jsonString) {
      try {
        const parsedResponse: AuraResponse = JSON.parse(jsonString);
        return parsedResponse;
      } catch (jsonError) {
        console.error("Failed to parse JSON response from Aura:", jsonString, jsonError);
        return {
          message: "I seem to be having trouble forming my thoughts right now. Could you please try rephrasing your question?",
          emotion: { label: 'confused', confidence: 1.0, animation_hint: 'shake' },
        };
      }
  }

  // Fallback in case jsonString is somehow not set without an error
  return {
    message: "I'm sorry, I received an empty response. Could you try again?",
    emotion: { label: 'confused', confidence: 1.0, animation_hint: 'shake' },
  };
}