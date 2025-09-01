
import React, { useState, useEffect } from 'react';
import type { EmotionState, EmotionLabel } from '../types';

interface EmotionFaceProps {
  emotionState: EmotionState;
}

// A polished, vibrant color palette using two-tone gradients for depth.
const EMOTION_COLORS: { [key in EmotionLabel]?: { grad: [string, string] } } = {
  // Joyful (Warm & Vibrant)
  happy:        { grad: ['#fef08a', '#fde047'] }, // yellow-200 -> 300
  excited:      { grad: ['#fb923c', '#f97316'] }, // orange-400 -> 500
  joyful:       { grad: ['#f87171', '#ef4444'] }, // red-400 -> 500
  ecstatic:     { grad: ['#e879f9', '#d946ef'] }, // fuchsia-400 -> 500
  playful:      { grad: ['#f9a8d4', '#f472b6'] }, // pink-300 -> 400
  giggling:     { grad: ['#f0abfc', '#ec4899'] }, // fuchsia-300 -> 400
  proud:        { grad: ['#fbbf24', '#f59e0b'] }, // amber-400 -> 500
  relieved:     { grad: ['#bef264', '#a3e635'] }, // lime-300 -> 400
  hopeful:      { grad: ['#86efac', '#4ade80'] }, // green-300 -> 400
  
  // Somber (Cool & Deep)
  sad:          { grad: ['#93c5fd', '#60a5fa'] }, // blue-300 -> 400
  crying:       { grad: ['#60a5fa', '#3b82f6'] }, // blue-400 -> 500
  lonely:       { grad: ['#a5b4fc', '#6366f1'] }, // indigo-300 -> 500
  guilty:       { grad: ['#c4b5fd', '#818cf8'] }, // indigo-300 -> 400
  
  // Intense (Sharp & Saturated)
  angry:        { grad: ['#f87171', '#dc2626'] }, // red-400 -> 600
  frustrated:   { grad: ['#ef4444', '#b91c1c'] }, // red-500 -> 700
  
  // Awkward/Surprised (Pinks & Purples)
  surprised:    { grad: ['#d8b4fe', '#c084fc'] }, // purple-300 -> 400
  amazed:       { grad: ['#c084fc', '#a855f7'] }, // purple-400 -> 600
  shy:          { grad: ['#fce7f3', '#fbcfe8'] }, // pink-100 -> 200
  embarrassed:  { grad: ['#fecdd3', '#fda4af'] }, // rose-200 -> 300
  bashful:      { grad: ['#fee2e2', '#fecaca'] }, // red-100 -> 200
  affectionate: { grad: ['#fda4af', '#fb7185'] }, // rose-300 -> 400
  
  // Cognitive (Greens & Teals)
  thinking:     { grad: ['#bae6fd', '#7dd3fc'] }, // sky-200 -> 300
  curious:      { grad: ['#67e8f9', '#22d3ee'] }, // cyan-300 -> 400
  determined:   { grad: ['#5eead4', '#14b8a6'] }, // teal-300 -> 500
  worried:      { grad: ['#fef08a', '#facc15'] }, // yellow-200 -> 400
  nervous:      { grad: ['#fde047', '#eab308'] }, // yellow-300 -> 500
  confused:     { grad: ['#c4b5fd', '#a78bfa'] }, // violet-300 -> 400
  
  // Other
  neutral:      { grad: ['#f3f4f6', '#e5e7eb'] }, // gray-100 -> 200
  sleepy:       { grad: ['#cbd5e1', '#94a3b8'] }, // slate-300 -> 400
  mischievous:  { grad: ['#a78bfa', '#8b5cf6'] }, // violet-400 -> 500
  listening:    { grad: ['#99f6e4', '#2dd4bf'] }, // teal-200 -> 400
};

const FEATURE_COLOR = '#1f2937'; // gray-800

const BlinkingEyes: React.FC = () => (
  <g className="origin-center [animation:blink_5s_ease-in-out_infinite]">
    {/* Main eye shape */}
    <ellipse cx="37" cy="48" rx="4.5" ry="5.5" fill={FEATURE_COLOR} />
    <ellipse cx="63" cy="48" rx="4.5" ry="5.5" fill={FEATURE_COLOR} />
    {/* Glossy highlight */}
    <circle cx="39" cy="46" r="1.5" fill="white" fillOpacity="0.9" />
    <circle cx="65" cy="46" r="1.5" fill="white" fillOpacity="0.9" />
  </g>
);

const FaceFeatures: React.FC<{ emotion: EmotionLabel }> = ({ emotion }) => {
  const featureStyle: React.CSSProperties = {
    fill: 'none',
    stroke: FEATURE_COLOR,
    strokeWidth: 4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    transition: 'all 0.4s ease',
  };
  const blushStyle: React.CSSProperties = {
      fill: '#fda4af', // rose-300
      opacity: 0.6
  };

  switch (emotion) {
    // --- Happy Family ---
    case 'happy': case 'proud': case 'relieved': case 'affectionate':
      return <g><BlinkingEyes /><path d="M 35,65 Q 50,75 65,65" style={featureStyle} /></g>;
    case 'joyful': case 'ecstatic':
      return <g><BlinkingEyes /><path d="M 30,62 Q 50,80 70,62" style={featureStyle} /></g>;
    case 'giggling':
      return <g><BlinkingEyes /><path d="M 30,62 Q 50,70 70,62" style={{...featureStyle, animation: 'body-wiggle 0.5s infinite'}} /></g>;

    // --- Sad Family ---
    case 'sad': case 'lonely': case 'guilty':
      return <g><BlinkingEyes /><path d="M 35,70 Q 50,60 65,70" style={featureStyle} /></g>;
    case 'crying':
      return (
        <g>
          <BlinkingEyes />
          <path d="M 35,72 Q 50,62 65,72" style={featureStyle} />
          <path d="M 38,55 Q 36,65 40,65" style={{...featureStyle, stroke: '#60a5fa', strokeWidth: 3}} />
          <path d="M 62,55 Q 64,65 60,65" style={{...featureStyle, stroke: '#60a5fa', strokeWidth: 3}} />
        </g>
      );

    // --- Intense/Angry Family ---
    case 'angry': case 'frustrated':
      return (
        <g>
          <path d="M 30,45 L 42,42" style={featureStyle} />
          <path d="M 70,45 L 58,42" style={featureStyle} />
          <BlinkingEyes />
          <path d="M 35,70 Q 50,65 65,70" style={featureStyle} />
        </g>
      );

    // --- Surprised Family ---
    case 'surprised': case 'amazed':
      return <g><BlinkingEyes /><circle cx="50" cy="68" r="8" style={featureStyle} /></g>;

    // --- Shy/Embarrassed Family ---
    case 'shy': case 'embarrassed': case 'bashful':
      return (
        <g>
          <BlinkingEyes />
          <path d="M 40,65 Q 50,68 60,65" style={featureStyle} />
          <ellipse cx="28" cy="58" rx="8" ry="4" style={blushStyle} />
          <ellipse cx="72" cy="58" rx="8" ry="4" style={blushStyle} />
        </g>
      );

    // --- Thinking Family ---
    case 'thinking': case 'curious': case 'confused':
      return <g><BlinkingEyes /><path d="M 38,68 L 62,68" style={featureStyle} /></g>;
    case 'determined':
      return (
        <g>
          <path d="M 30,42 L 42,45" style={featureStyle} />
          <path d="M 70,42 L 58,45" style={featureStyle} />
          <BlinkingEyes />
          <path d="M 38,68 L 62,68" style={featureStyle} />
        </g>
      );

    // --- Worried Family ---
    case 'worried': case 'nervous':
       return (
        <g>
          <g style={{ animation: 'eye-twitch 3s infinite' }}><BlinkingEyes /></g>
          <path d="M 38,68 C 45,72 55,64 62,68" style={featureStyle} />
        </g>
      );

    // --- Playful Family ---
    case 'playful': case 'mischievous':
      return (
        <g>
          <BlinkingEyes />
          <path d="M 35,62 Q 50,75 65,62" style={featureStyle} />
        </g>
      );
    
    // --- Listening ---
    case 'listening':
       return (
        <g>
          <BlinkingEyes />
          <path d="M 38,68 L 62,68" style={featureStyle} />
          <g style={{ opacity: 0.1, animation: 'pulse-earmuffs 2s infinite ease-in-out' }}>
            <circle cx="15" cy="50" r="10" fill="currentColor" />
            <circle cx="85" cy="50" r="10" fill="currentColor" />
          </g>
        </g>
      );
      
    // --- Hopeful ---
    case 'hopeful':
      return (
        <g>
          <BlinkingEyes />
          <path d="M 38,65 Q 50,70 62,65" style={featureStyle} />
        </g>
      );

    // --- Sleepy / Neutral ---
    case 'sleepy':
      return (
        <g>
           <path d="M 32,50 C 35,55 42,55 45,50" style={featureStyle} />
           <path d="M 55,50 C 58,55 65,55 68,50" style={featureStyle} />
           <path d="M 38,68 L 62,68" style={featureStyle} />
        </g>
      );
    case 'neutral':
    default:
      return <g><BlinkingEyes /><path d="M 38,68 L 62,68" style={featureStyle} /></g>;
  }
};

const getAnimationClass = (emotionState: EmotionState): string => {
  // 1. Emotion-specific animations take top priority
  if (emotionState.label === 'giggling') return 'animate-giggle';
  if (['excited', 'joyful'].includes(emotionState.label)) return 'animate-bounce';

  // 2. Then, check for animation hints from the model
  switch (emotionState.animation_hint) {
    case 'shake': return 'animate-shake';
    case 'recoil': return 'animate-recoil';
    case 'bounce': return 'animate-bounce'; // Allow model to trigger bounce too
    case 'none':
    default:
      // 3. Fallback to a default, gentle animation if no specific one applies
      return 'animate-breathe';
  }
};


const EmotionFace: React.FC<EmotionFaceProps> = ({ emotionState }) => {
  const [gradient, setGradient] = useState(EMOTION_COLORS.sleepy!.grad);

  useEffect(() => {
    const newColor = EMOTION_COLORS[emotionState.label] ?? EMOTION_COLORS.neutral!;
    setGradient(newColor.grad);
  }, [emotionState.label]);
  
  const animationClass = getAnimationClass(emotionState);
  
  // Custom animation styles for more control
  const animationStyles: { [key: string]: React.CSSProperties } = {
      'animate-breathe': { animation: 'body-breathe-gentle 4s ease-in-out infinite' },
      'animate-shake': { animation: 'body-shake 0.5s ease-in-out' },
      'animate-recoil': { animation: 'pop-in 0.4s cubic-bezier(0.25, 1, 0.5, 1)' },
      'animate-giggle': { animation: 'body-giggle 0.6s ease-in-out infinite' },
      'animate-bounce': { animation: 'body-bounce 0.8s ease-in-out' },
  };

  return (
    <div className="relative w-48 h-48 animate-zoom-in">
        <div style={animationStyles[animationClass]} className="w-full h-full">
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color: gradient[1] }}>
                <defs>
                    <radialGradient id="faceGradient">
                    <stop offset="0%" stopColor={gradient[0]} />
                    <stop offset="100%" stopColor={gradient[1]} />
                    </radialGradient>
                </defs>
                <g>
                    <circle cx="50" cy="50" r="48" fill="url(#faceGradient)" stroke={gradient[1]} strokeWidth="3" />
                    <FaceFeatures emotion={emotionState.label} />
                    {['playful', 'mischievous'].includes(emotionState.label) && (
                        <g transform="translate(42, 70)" className="origin-center [animation:tongue-peek_5s_ease-in-out_infinite]">
                            <path d="M 0 0 C 3 -2, 5 -2, 8 0 L 4 8 Z" fill="#f472b6" />
                        </g>
                    )}
                </g>
            </svg>
        </div>
        {emotionState.label === 'listening' && (
             <div 
                className="absolute inset-0 rounded-full border-2 border-cyan-300" 
                style={{ animation: 'pulse-halo 2s infinite ease-out' }}
                aria-hidden="true"
            />
        )}
    </div>
  );
};

export default EmotionFace;
