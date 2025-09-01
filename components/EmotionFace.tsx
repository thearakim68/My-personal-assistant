
import React, { useState, useEffect } from 'react';
import type { EmotionState, EmotionLabel } from '../types';

interface EmotionFaceProps {
  emotionState: EmotionState;
}

const EMOTION_COLORS: { [key in EmotionLabel]: { grad: [string, string] } } = {
  happy:        { grad: ['#fef08a', '#fde047'] }, // yellow-200 -> 300
  sad:          { grad: ['#93c5fd', '#60a5fa'] }, // blue-300 -> 400
  angry:        { grad: ['#f87171', '#dc2626'] }, // red-400 -> 600
  surprised:    { grad: ['#d8b4fe', '#c084fc'] }, // purple-300 -> 400
  thinking:     { grad: ['#bae6fd', '#7dd3fc'] }, // sky-200 -> 300
  sleepy:       { grad: ['#cbd5e1', '#94a3b8'] }, // slate-300 -> 400
  neutral:      { grad: ['#f3f4f6', '#e5e7eb'] }, // gray-100 -> 200
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

  switch (emotion) {
    case 'happy':
      return <g><BlinkingEyes /><path d="M 35,65 Q 50,75 65,65" style={featureStyle} /></g>;
      
    case 'sad':
      return <g><BlinkingEyes /><path d="M 35,70 Q 50,60 65,70" style={featureStyle} /></g>;

    case 'angry':
      return (
        <g>
          <path d="M 30,45 L 42,42" style={featureStyle} />
          <path d="M 70,45 L 58,42" style={featureStyle} />
          <BlinkingEyes />
          <path d="M 35,70 Q 50,65 65,70" style={featureStyle} />
        </g>
      );

    case 'surprised':
      return <g><BlinkingEyes /><circle cx="50" cy="68" r="8" style={featureStyle} /></g>;

    case 'thinking':
      return <g><BlinkingEyes /><path d="M 38,68 L 62,68" style={featureStyle} /></g>;

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
  if (emotionState.label === 'happy' && emotionState.animation_hint === 'none') return 'animate-bounce';

  // 2. Then, check for animation hints from the model
  switch (emotionState.animation_hint) {
    case 'shake': return 'animate-shake';
    case 'recoil': return 'animate-recoil';
    case 'bounce': return 'animate-bounce';
    case 'giggle': return 'animate-giggle';
    case 'none':
    default:
      // 3. Fallback to a default, gentle animation if no specific one applies
      return 'animate-breathe';
  }
};


const EmotionFace: React.FC<EmotionFaceProps> = ({ emotionState }) => {
  const [gradient, setGradient] = useState(EMOTION_COLORS.sleepy.grad);

  useEffect(() => {
    const newColor = EMOTION_COLORS[emotionState.label] ?? EMOTION_COLORS.neutral;
    setGradient(newColor.grad);
  }, [emotionState.label]);
  
  const animationClass = getAnimationClass(emotionState);
  
  // Custom animation styles for more control
  const animationStyles: { [key: string]: React.CSSProperties } = {
      'animate-breathe': { animation: 'body-breathe-gentle 4s ease-in-out infinite' },
      'animate-shake': { animation: 'body-shake 0.5s ease-in-out' },
      'animate-recoil': { animation: 'pop-in 0.4s cubic-bezier(0.25, 1, 0.5, 1)' },
      'animate-bounce': { animation: 'body-bounce 0.8s ease-in-out' },
      'animate-giggle': { animation: 'body-giggle 0.6s ease-in-out' },
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
                </g>
            </svg>
        </div>
    </div>
  );
};

export default EmotionFace;
