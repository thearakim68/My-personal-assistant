export type EmotionLabel = 
  'happy' | 'sad' | 'angry' | 'surprised' | 'thinking' | 'sleepy' | 'neutral' | 
  'confused' | 'excited' | 'shy' | 'curious' | 'embarrassed' | 'proud' | 'playful' | 
  'giggling' | 'crying' | 'frustrated' | 'determined' | 'joyful' | 'worried' | 
  'guilty' | 'relieved' | 'nervous' | 'hopeful' | 'affectionate' | 'bashful' | 
  'mischievous' | 'amazed' | 'lonely' | 'ecstatic' | 'listening';

export type AnimationHint = 'bounce' | 'recoil' | 'shake' | 'none';

export interface EmotionState {
  label: EmotionLabel;
  confidence: number;
  animation_hint: AnimationHint;
}

export interface AuraResponse {
  message: string;
  emotion: EmotionState;
}

export interface ChatMessage extends AuraResponse {
  id: number;
  sender: 'user' | 'aura';
}