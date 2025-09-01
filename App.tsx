
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage, EmotionState, AuraResponse, EmotionLabel } from './types';
import { sendMessageToAura } from './services/novaService';
import EmotionFace from './components/EmotionFace';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import ActionButton from './components/ActionButton';

const getMoodClass = (label: EmotionLabel): string => {
  if (['happy', 'excited', 'joyful', 'ecstatic', 'playful', 'giggling', 'proud', 'relieved', 'hopeful', 'affectionate'].includes(label)) {
    return 'mood-happy';
  }
  if (['sad', 'crying', 'lonely', 'guilty'].includes(label)) {
    return 'mood-sad';
  }
  if (['angry', 'frustrated'].includes(label)) {
    return 'mood-angry';
  }
  if (['surprised', 'amazed'].includes(label)) {
    return 'mood-surprised';
  }
  if (['thinking', 'curious', 'determined', 'listening', 'nervous', 'worried', 'confused'].includes(label)) {
    return 'mood-thinking';
  }
  if (['sleepy'].includes(label)) {
    return 'mood-sleepy';
  }
  return 'mood-neutral'; // Default for neutral, shy, etc.
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>({
    label: 'sleepy',
    confidence: 1.0,
    animation_hint: 'none'
  });
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [backgroundClass, setBackgroundClass] = useState('mood-sleepy');
  const previousEmotionRef = useRef<EmotionState | null>(null);

  const suggestedPrompts = [
    "How do I reset my password?",
    "Tell me a fun fact.",
    "What can you do?",
  ];

  // Update background mood when emotion changes
  useEffect(() => {
    setBackgroundClass(getMoodClass(currentEmotion.label));
  }, [currentEmotion]);
  
  // Welcome sequence on initial load
  useEffect(() => {
    // Aura "wakes up"
    const wakeUpTimer = setTimeout(() => {
      setCurrentEmotion({ label: 'curious', confidence: 1.0, animation_hint: 'recoil' });
    }, 800);
    
    // Aura gives welcome message
    const welcomeTimer = setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: Date.now(),
        sender: 'aura',
        message: "Hello! I'm your support assistant. How can I help you today?",
        emotion: {
          label: 'happy',
          confidence: 0.9,
          animation_hint: 'bounce'
        }
      };
      setCurrentEmotion(welcomeMessage.emotion);
      setMessages([welcomeMessage]);
    }, 2200); // Wait for wake up animation to complete

    return () => {
      clearTimeout(wakeUpTimer);
      clearTimeout(welcomeTimer);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Logic to handle user typing
  useEffect(() => {
    if (isTyping) {
      if (currentEmotion.label !== 'listening') {
        previousEmotionRef.current = currentEmotion;
        setCurrentEmotion({ label: 'listening', confidence: 1.0, animation_hint: 'none' });
      }
    } else {
      if (previousEmotionRef.current && currentEmotion.label === 'listening') {
        setCurrentEmotion(previousEmotionRef.current);
        previousEmotionRef.current = null;
      }
    }
  }, [isTyping, currentEmotion]);


  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsTyping(false); 
    previousEmotionRef.current = null; 

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: userMessage,
      emotion: { label: 'neutral', confidence: 1.0, animation_hint: 'none' },
    };
    
    // The full history is the current messages plus the new user message.
    const fullHistory = [...messages, newUserMessage];
    setMessages(fullHistory);
    setIsLoading(true);
    setCurrentEmotion({ label: 'thinking', confidence: 1.0, animation_hint: 'none' });

    try {
      // Pass the history *before* the new message, and the new message itself.
      const auraResponse = await sendMessageToAura(messages, userMessage);
      const newAuraMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'aura',
        ...auraResponse,
      };
      setMessages(prev => [...prev, newAuraMessage]);
      setCurrentEmotion(auraResponse.emotion);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse: AuraResponse = {
        message: "I'm sorry, I encountered an error and couldn't process your request. Please try again.",
        emotion: { label: 'sad', confidence: 1.0, animation_hint: 'shake' },
      };
      const errorAuraMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'aura',
        ...errorResponse
      };
      setMessages(prev => [...prev, errorAuraMessage]);
      setCurrentEmotion(errorResponse.emotion);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className={`flex h-screen w-full items-center justify-center p-4 font-sans bg-gradient-to-br from-gray-900 via-slate-900 to-black bg-mood-container ${backgroundClass}`}>
      <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden lg:h-[90vh] lg:max-h-[700px] lg:flex-row rounded-2xl bg-slate-800/50 shadow-2xl shadow-cyan-400/10 backdrop-blur-xl border border-slate-700/50">
        {/* Left Pane: Emotion Face */}
        <div className="flex flex-col items-center justify-center bg-black/20 p-6 lg:w-1/3">
          <EmotionFace emotionState={currentEmotion} />
        </div>

        {/* Right Pane: Chat */}
        <div className="flex flex-1 flex-col bg-chat-gradient backdrop-blur-lg">
          <ChatWindow messages={messages} isLoading={isLoading} />
          
          {messages.length <= 1 && !isLoading && (
            <div className="px-6 pb-3 pt-0 flex flex-wrap gap-2 animate-pop-in">
                {suggestedPrompts.map((prompt) => (
                    <ActionButton 
                        key={prompt} 
                        title={prompt} 
                        onClick={() => handleSuggestedPrompt(prompt)} 
                    />
                ))}
            </div>
          )}

          <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} onTyping={handleTyping} />
        </div>
      </div>
    </div>
  );
};

export default App;
