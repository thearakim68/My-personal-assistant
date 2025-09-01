
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
    mode: { type: Type.STRING },
    message: { type: Type.STRING },
    emotion: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING },
        animation_hint: { type: Type.STRING },
      },
      required: ['label', 'animation_hint']
    },
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          payload: { type: Type.STRING },
        },
        required: ['title', 'payload']
      }
    },
    query: { type: Type.STRING },
  },
  required: ['mode', 'message', 'emotion']
};


const MAX_RETRIES = 4;
const INITIAL_DELAY_MS = 5000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function sendMessageToAura(history: ChatMessage[]): Promise<AuraResponse> {
  let jsonString: string | undefined;
  let lastError: any = null;

  // Step 1: Get response from API with retries for retriable errors
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const contents: Content[] = history.map(msg => ({
            role: msg.sender === 'aura' ? 'model' : 'user',
            parts: [{ text: msg.message }]
      }));

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
      throw new Error("I'm feeling a little overwhelmed right now. Please wait a moment before trying again.");
    }
    
    // Generic API/network error
    throw new Error("I'm sorry, I encountered a technical glitch. Please try again shortly.");
  }

  // Step 3: Parse the successful response
  if (jsonString) {
      try {
        const parsedResponse: AuraResponse = JSON.parse(jsonString);
        return parsedResponse;
      } catch (jsonError) {
        console.error("Failed to parse JSON response from Aura:", jsonString, jsonError);
        throw new Error("I seem to be having trouble forming my thoughts right now. Could you please try rephrasing your question?");
      }
  }

  // Fallback in case jsonString is somehow not set without an error
  throw new Error("I'm sorry, I received an empty response. Could you try again?");
}

export async function getQueryResponse(query: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: query,
        });
        return response.text;
    } catch(error) {
        console.error("Error fetching query response:", error);
        return "I'm sorry, I couldn't find an answer to that. There might have been a problem with the search.";
    }
}
