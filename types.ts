
export type EmotionLabel = 'happy' | 'sad' | 'angry' | 'surprised' | 'thinking' | 'sleepy' | 'neutral';

export type AnimationHint = 'bounce' | 'recoil' | 'shake' | 'giggle' | 'none';

export interface EmotionState {
  label: EmotionLabel;
  animation_hint: AnimationHint;
}

export interface Action {
  title: string;
  payload: string;
}

// Defining the structure for idle and typing tokens
export interface LocalResponse {
  message: string;
  emotion: EmotionState;
}

export interface LocalBundle {
    idle_tokens: { [key: string]: LocalResponse };
    typing_tokens: { [key: string]: LocalResponse };
    face_cues: { [key: string]: string };
    default_actions: Action[];
}

export interface AuraResponse {
  mode: 'local' | 'query';
  message: string;
  emotion: EmotionState;
  actions?: Action[];
  query?: string;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'aura';
  message: string;
  // Aura-specific fields are optional for user messages
  mode?: 'local' | 'query';
  emotion?: EmotionState;
  actions?: Action[];
  query?: string;
}
