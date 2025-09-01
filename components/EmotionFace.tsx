
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
    case 'happy': case 'proud': case 'relieved':
      return <g><BlinkingEyes /><path d="M 40 68 C 45 78, 55 78, 60 68" style={featureStyle} /></g>;
    case 'hopeful':
        return <g><path d="M 32 42 C 37 45, 42 45, 47 42 M 53 42 C 58 45, 63 45, 68 42" style={{...featureStyle, strokeWidth: 3.5}} /><path d="M 40 70 C 45 75, 55 75, 60 70" style={featureStyle} /></g>;
    case 'excited': case 'joyful': case 'ecstatic':
      return <g><path d="M 32 42 C 37 37, 42 37, 47 42 M 53 42 C 58 37, 63 37, 68 42" style={{...featureStyle, strokeWidth: 3.5}} /><path d="M 35 65 C 40 85, 60 85, 65 65 Z" fill={FEATURE_COLOR} /></g>;
    case 'giggling':
      return <g><path d="M 32 45 C 35 40, 40 40, 43 45 M 57 45 C 60 40, 65 40, 68 45" style={featureStyle} /><path d="M 40 65 Q 50 75 60 65 Q 55 70 45 70 Z" fill={FEATURE_COLOR} /></g>;
    case 'playful':
      return <g><BlinkingEyes/><path d="M 40 65 C 45 72, 55 72, 60 65" style={featureStyle}/><path d="M 55 68 C 55 72, 50 75, 47 70" fill="#f472b6"/></g>
    
    // --- Sad Family ---
    case 'sad': case 'lonely': case 'guilty':
      return <g><path d="M 32 50 C 37 48, 42 48, 47 50 M 53 50 C 58 48, 63 48, 68 50" style={featureStyle} /><path d="M 42 72 Q 50 65, 58 72" style={featureStyle} /></g>;
    case 'crying':
      return <g><path d="M 32 54 Q 37.5 48, 43 54 M 57 54 Q 62.5 48, 68 54" style={featureStyle} /><path d="M 40 70 Q 50 65, 60 70" style={featureStyle} /><path d="M 38 58 v 12 M 62 58 v 12" style={{...featureStyle, stroke: '#60a5fa', strokeWidth: 3, animation: 'fall 2s linear infinite'}} /></g>;
      
    // --- Angry Family ---
    case 'angry':
      return <g style={featureStyle}><path d="M 30 45 L 45 52 M 70 45 L 55 52" /><path d="M 40 70 L 60 70" /></g>;
    case 'frustrated':
      return <g style={featureStyle}><path d="M 30 45 L 45 52 M 70 45 L 55 52" /><path d="M 42 72 Q 47 67, 50 72 Q 53 77, 58 72" /></g>;
      
    // --- Surprise/Shy Family ---
    case 'surprised':
      return <g><ellipse cx="38" cy="48" rx="6" ry="7" fill={FEATURE_COLOR} /><ellipse cx="62" cy="48" rx="6" ry="7" fill={FEATURE_COLOR} /><ellipse cx="50" cy="72" rx="8" ry="10" fill={FEATURE_COLOR} /></g>;
    case 'amazed':
       return <g><ellipse cx="38" cy="48" rx="8" ry="9" fill={FEATURE_COLOR} /><ellipse cx="62" cy="48" rx="8" ry="9" fill={FEATURE_COLOR} /><circle cx="38" cy="46" r="2" fill="white" /><circle cx="62" cy="46" r="2" fill="white" /><ellipse cx="50" cy="74" rx="12" ry="14" fill={FEATURE_COLOR} /></g>;
    case 'shy': case 'bashful': case 'embarrassed':
      return <g><ellipse cx="30" cy="62" rx="10" ry="4" style={blushStyle} /><ellipse cx="70" cy="62" rx="10" ry="4" style={blushStyle} /><path d="M 35 50 L 40 54 M 65 50 L 60 54" style={featureStyle} /><path d="M 42 68 Q 50 72, 58 68" style={featureStyle} /></g>;
    case 'affectionate':
      return <g fill={FEATURE_COLOR}><path d="M40 40 C 20 40, 25 60, 40 60 C 55 60, 60 40, 40 40Z" /><path d="M60 40 C 80 40, 75 60, 60 60 C 45 60, 40 40, 60 40Z" /><path d="M 42 70 Q 50 80, 58 70" style={{...featureStyle, fill: 'none'}} /></g>;

    // --- Thinking/Worry Family ---
    case 'thinking':
      return <g><path d="M 30 48 L 45 48 M 60 48 Q 55 48, 55 53" style={featureStyle} /><line x1="42" y1="70" x2="58" y2="70" style={featureStyle} /></g>;
    case 'determined':
      return <g><path d="M 30 50 L 45 45 M 70 50 L 55 45" style={featureStyle} /><line x1="40" y1="70" x2="60" y2="70" style={featureStyle} /></g>;
    case 'curious':
      return <g><ellipse cx="37" cy="45" rx="4.5" ry="5.5" fill={FEATURE_COLOR} /><ellipse cx="63" cy="48" rx="5" ry="6" fill={FEATURE_COLOR} /><circle cx="50" cy="73" r="3" fill={FEATURE_COLOR} /></g>;
    case 'worried': case 'nervous':
      return <g><path d="M 35 52 C 30 46, 45 46, 40 52 M 65 52 C 70 46, 55 46, 60 52" style={featureStyle} /><path d="M 42 72 Q 47 67, 50 72 Q 53 77, 58 72" style={featureStyle} /></g>;
    case 'confused':
      return <g><path d="M 30 48 L 45 48" style={featureStyle} /><ellipse cx="63" cy="52" rx="5" ry="4" fill={FEATURE_COLOR} /><path d="M 42 72 Q 50 65, 58 75" style={{...featureStyle, strokeWidth: 3.5}} /></g>;

    // --- Neutral/Other ---
    case 'mischievous':
      return <g><path d="M 32 45 C 35 38, 40 38, 43 45" style={featureStyle} /><path d="M 57 48 L 68 48" style={featureStyle} /><path d="M 40 65 C 45 75, 60 70, 62 65" style={featureStyle} /></g>;
    case 'sleepy':
      return <g style={{ ...featureStyle, strokeWidth: 3 }}><path d="M 32 50 Q 37.5 55, 43 50" /><path d="M 57 50 Q 62.5 55, 68 50" /></g>;
    case 'listening':
      return <g><ellipse cx="37" cy="48" rx="5.5" ry="6.5" fill={FEATURE_COLOR} /><ellipse cx="63" cy="48" rx="5.5" ry="6.5" fill={FEATURE_COLOR} /></g>;
    default: // Neutral
      return <g><BlinkingEyes /><line x1="42" y1="70" x2="58" y2="70" style={featureStyle} /></g>;
  }
};

const EmotionOrb: React.FC<{ emotionState: EmotionState; isExiting?: boolean }> = ({ emotionState, isExiting = false }) => {
  const { label } = emotionState;
  const colors = EMOTION_COLORS[label] || EMOTION_COLORS.neutral!;
  const gradientId = `orbGradient-${label}`;

  const getBodyAnimation = () => {
    switch (label) {
      // Gentle, happy movements
      case 'happy': case 'playful': case 'giggling': case 'proud': case 'relieved': case 'hopeful': case 'affectionate':
        return '[animation:body-sway_6s_ease-in-out_infinite]';
      
      // Energetic movements
      case 'excited': case 'joyful': case 'amazed': case 'ecstatic':
        return '[animation:body-wiggle_2.5s_ease-in-out_infinite]';
      
      // Agitated movements
      case 'angry': case 'frustrated':
        return '[animation:body-shake_0.1s_linear_infinite]';
      case 'nervous':
        return '[animation:body-shake_0.3s_linear_infinite]';
        
      // Awkward / shy movements
      case 'confused': case 'shy': case 'bashful': case 'embarrassed':
        return '[animation:body-wiggle_5s_ease-in-out_infinite]';

      // Quick reaction (no scale)
      case 'surprised':
        // A quick, short vibrate/shake that stops
        return '[animation:body-shake_0.2s_linear_3]'; 

      // For sad/sleepy, a very slow breathe is better to show low energy
      case 'sad': case 'sleepy': case 'lonely': case 'guilty': case 'crying':
         return '[animation:body-breathe-gentle_10s_ease-in-out_infinite]';
      
      // Default idle state
      default:
        return '[animation:body-breathe-gentle_8s_ease-in-out_infinite]';
    }
  };

  const bodyPath = "M50,5 C25,5 5,30 5,55 C5,85 25,95 50,95 C75,95 95,85 95,55 C95,30 75,5 50,5 Z";

  return (
    <svg viewBox="0 0 100 100" className={`absolute w-full h-full transition-opacity duration-400 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="40%" r="60%" fx="50%" fy="40%">
          <stop offset="0%" stopColor={colors.grad[0]} />
          <stop offset="100%" stopColor={colors.grad[1]} />
        </radialGradient>
      </defs>
      
      {/* Ground Shadow */}
      <ellipse cx="50" cy="95" rx="30" ry="4" className="fill-black/20" style={{ filter: 'blur(3px)' }} />

      <g className={label === 'sleepy' ? '' : 'animate-zoom-in'}>
        <g className={`origin-bottom ${getBodyAnimation()}`}>
          {/* Main Body with Drop Shadow */}
          <g style={{ filter: `drop-shadow(0px 4px 4px rgba(0,0,0,0.15))` }}>
             <path d={bodyPath} fill={`url(#${gradientId})`} />
             {/* Subtle highlight stroke */}
             <path d={bodyPath} fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          </g>

          <FaceFeatures emotion={label} />
        </g>
        
        {/* VFX Layer - Not affected by body animation */}
        {label === 'thinking' && (
          <circle cx="50" cy="50" r="48" fill="none" stroke="#7dd3fc" strokeWidth="1.5"
            className="origin-center [animation:pulse-halo_2s_ease-out_infinite]"
            strokeDasharray="5 10"
          />
        )}
        {label === 'listening' && (
          <g fill="none" stroke="#2dd4bf" strokeWidth="2.5" className="[animation:pulse-earmuffs_2s_ease-in-out_infinite]">
            <path d="M 15 35 A 20 20 0 0 1 15 65" />
            <path d="M 85 35 A 20 20 0 0 0 85 65" />
          </g>
        )}
      </g>
    </svg>
  );
};

const EmotionFace: React.FC<EmotionFaceProps> = ({ emotionState }) => {
  const [displayEmotion, setDisplayEmotion] = useState(emotionState);
  const [prevEmotion, setPrevEmotion] = useState<EmotionState | null>(null);
  
  useEffect(() => {
    if (emotionState.label !== displayEmotion.label) {
      setPrevEmotion(displayEmotion);
      setDisplayEmotion(emotionState);

      const timer = setTimeout(() => {
        setPrevEmotion(null);
      }, 400); // Duration of the fade-out animation

      return () => clearTimeout(timer);
    }
  }, [emotionState, displayEmotion]);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {prevEmotion && (
        <EmotionOrb
          key={prevEmotion.label}
          emotionState={prevEmotion}
          isExiting={true}
        />
      )}
      <EmotionOrb
        key={displayEmotion.label}
        emotionState={displayEmotion}
        isExiting={false}
      />
    </div>
  );
};

export default EmotionFace;
