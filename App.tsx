
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage, EmotionState, AuraResponse, LocalBundle } from './types';
import { sendMessageToAura, getQueryResponse } from './services/novaService';
import EmotionFace from './components/EmotionFace';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import ActionButton from './components/ActionButton';
import { LOCAL_BUNDLE_CONFIG } from './constants';

const getMoodClass = (label: EmotionState['label']): string => {
  switch (label) {
    case 'happy': return 'mood-happy';
    case 'sad': return 'mood-sad';
    case 'angry': return 'mood-angry';
    case 'surprised': return 'mood-surprised';
    case 'thinking': return 'mood-thinking';
    case 'sleepy': return 'mood-sleepy';
    case 'neutral':
    default:
      return 'mood-neutral';
  }
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>({
    label: 'sleepy',
    animation_hint: 'none'
  });
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [backgroundClass, setBackgroundClass] = useState('mood-sleepy');
  const [localConfig, setLocalConfig] = useState<LocalBundle | null>(null);

  const previousEmotionRef = useRef<EmotionState | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const idleStateRef = useRef({ nextIdleActionIndex: 0 });

  // --- Local Response Generation ---
  const generateLocalResponse = (message: string): Omit<ChatMessage, 'id' | 'sender'> | null => {
    const cleanedMessage = message.toLowerCase().trim().replace(/[.,!?]/g, '');

    // Greetings
    if (['hi', 'hello', 'hey', 'yo', 'greetings'].some(term => cleanedMessage.startsWith(term))) {
      return {
        message: "Hey there! So happy to chat with you! 😊",
        emotion: { label: 'happy', animation_hint: 'bounce' },
        mode: 'local',
        actions: localConfig?.default_actions,
      };
    }

    // Gratitude
    if (['thanks', 'thank you', 'thx', 'ty'].includes(cleanedMessage)) {
      return {
        message: "You're so welcome! Let me know if you need anything else! 😄",
        emotion: { label: 'happy', animation_hint: 'giggle' },
        mode: 'local',
        actions: localConfig?.default_actions,
      };
    }
    
    // Farewells
    if (['bye', 'goodbye', 'see you', 'cya'].includes(cleanedMessage)) {
        return {
            message: "Bye bye! Come back soon, I'll miss you! 🥺",
            emotion: { label: 'sad', animation_hint: 'none' },
            mode: 'local',
        };
    }
    
    // Well-being
    if (['how are you', 'how are you doing', 'hows it going'].includes(cleanedMessage)) {
        return {
            message: "I'm doing great, thanks for asking! It's always a good day when I get to chat with you.",
            emotion: { label: 'happy', animation_hint: 'bounce' },
            mode: 'local',
            actions: localConfig?.default_actions,
        }
    }

    // From default actions
    if (cleanedMessage === 'cheer me up') {
        return {
            message: "Of course! Remember, you're awesome and you can do anything you set your mind to! Here's a little dance to make you smile! 💃",
            emotion: { label: 'happy', animation_hint: 'bounce' },
            mode: 'local',
            actions: [{title: "Thanks!", payload: "Thanks!"}, {title: "Surprise me", payload: "Surprise me"}],
        }
    }
      
    if (cleanedMessage === 'surprise me') {
        const surprises = [
            { msg: "Boo! Did you know a group of flamingos is called a flamboyance? Pretty cool, right?!", emotion: { label: 'surprised', animation_hint: 'recoil' } as EmotionState },
            { msg: "Poof! Imagine a tiny elephant the size of a teacup. Cute, isn't it? 🐘", emotion: { label: 'surprised', animation_hint: 'recoil' } as EmotionState },
            { msg: "Did you know that otters hold hands when they sleep so they don't float away? 🦦", emotion: { label: 'happy', animation_hint: 'giggle' } as EmotionState },
        ];
        const surprise = surprises[Math.floor(Math.random() * surprises.length)];
        return {
            message: surprise.msg,
            emotion: surprise.emotion,
            mode: 'local',
            actions: localConfig?.default_actions,
        }
    }

    return null; // No local response found
  };


  // --- Idle Timer Logic ---
  const scheduleNextIdleAction = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!localConfig?.idle_tokens) return;

    const idleActions = Object.entries(localConfig.idle_tokens)
      .map(([key, value]) => ({
        delay: parseInt(key.replace('::idle::', ''), 10),
        response: value
      }))
      .sort((a, b) => a.delay - b.delay);

    const currentIndex = idleStateRef.current.nextIdleActionIndex;
    if (currentIndex >= idleActions.length) {
       idleStateRef.current.nextIdleActionIndex = 0; // Loop back
       scheduleNextIdleAction();
       return;
    }

    const nextAction = idleActions[currentIndex];
    const lastActionDelay = currentIndex > 0 ? idleActions[currentIndex - 1].delay : 0;
    const timeoutDelay = (nextAction.delay - lastActionDelay) * 1000;

    idleTimerRef.current = window.setTimeout(() => {
      if (isLoading) return; // Don't interrupt if loading

      const idleMessage: ChatMessage = {
        id: Date.now(),
        sender: 'aura',
        mode: 'local',
        ...nextAction.response,
      };
      setMessages(prev => [...prev, idleMessage]);
      setCurrentEmotion(nextAction.response.emotion);
      idleStateRef.current.nextIdleActionIndex += 1;
      scheduleNextIdleAction();
    }, timeoutDelay);
  }, [localConfig, isLoading]);

  const resetIdleTimer = useCallback(() => {
    idleStateRef.current.nextIdleActionIndex = 0;
    scheduleNextIdleAction();
  }, [scheduleNextIdleAction]);

  useEffect(() => {
    if (localConfig) {
      resetIdleTimer();
    }
    return () => {
        if(idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }
  }, [localConfig, resetIdleTimer]);


  // Update background mood when emotion changes
  useEffect(() => {
    setBackgroundClass(getMoodClass(currentEmotion.label));
  }, [currentEmotion]);

  // Welcome sequence on initial load
  useEffect(() => {
    const bootstrapTimer = setTimeout(() => {
        // Set local config from constants file
        setLocalConfig(LOCAL_BUNDLE_CONFIG);

        // Create a static welcome message
        const welcomeMessage: ChatMessage = {
            id: Date.now(),
            sender: 'aura',
            message: "Hey! I'm Aura. So excited to chat with you! 😊",
            emotion: { label: 'happy', animation_hint: 'bounce' },
            mode: 'local',
            actions: LOCAL_BUNDLE_CONFIG.default_actions
        };

        setMessages([welcomeMessage]);
        setCurrentEmotion(welcomeMessage.emotion!);
    }, 800);
    
    return () => clearTimeout(bootstrapTimer);
  }, []); 

  // Logic to handle user typing
  useEffect(() => {
    if (!localConfig?.typing_tokens) return;

    if (isTyping) {
        resetIdleTimer();
      if (currentEmotion.label !== 'thinking') {
        previousEmotionRef.current = currentEmotion;
        const typingStartResponse = localConfig.typing_tokens['::typing::start'];
        if (typingStartResponse) {
          setCurrentEmotion(typingStartResponse.emotion);
        }
      }
    } else {
      if (previousEmotionRef.current && currentEmotion.label === 'thinking') {
        setCurrentEmotion(previousEmotionRef.current);
        previousEmotionRef.current = null;
      }
    }
  }, [isTyping, currentEmotion, localConfig, resetIdleTimer]);


  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    resetIdleTimer();
    setIsTyping(false);
    previousEmotionRef.current = null;
    
    const newUserMessage: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        message: userMessage,
    };
    
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages); // Update UI with user message
    
    const localResponse = generateLocalResponse(userMessage);
    if (localResponse) {
        setCurrentEmotion({ label: 'thinking', animation_hint: 'none' });
        setTimeout(() => {
            const newAuraMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: 'aura',
                ...localResponse,
            };
            setMessages(prev => [...prev, newAuraMessage]);
            setCurrentEmotion(localResponse.emotion!);
            resetIdleTimer();
        }, 750); // A short delay for a more natural feel
        return; // Done, no API call needed
    }
    
    setIsLoading(true);
    setCurrentEmotion({ label: 'thinking', animation_hint: 'none' });

    try {
      // Use the up-to-date message history for the API call
      const auraResponse = await sendMessageToAura(currentMessages);
      
      const responseMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'aura',
        ...auraResponse
      };

      if (auraResponse.mode === 'query' && auraResponse.query) {
        setMessages(prev => [...prev, responseMessage]); // Add "Let me check..."
        setCurrentEmotion(auraResponse.emotion);
        
        const queryResult = await getQueryResponse(auraResponse.query);
        const finalMessage: ChatMessage = {
            id: Date.now() + 2,
            sender: 'aura',
            message: queryResult,
            emotion: { label: 'neutral', animation_hint: 'recoil' },
            mode: 'local'
        };
        setMessages(prev => [...prev, finalMessage]);
        setCurrentEmotion(finalMessage.emotion);

      } else {
         setMessages(prev => [...prev, responseMessage]);
         setCurrentEmotion(auraResponse.emotion);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "I'm sorry, I encountered an error and couldn't process your request. Please try again.";
      const errorResponse: Omit<AuraResponse, 'mode'> = {
        message: errorMessage,
        emotion: { label: 'sad', animation_hint: 'shake' },
      };
      const errorAuraMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'aura',
        mode: 'local',
        ...errorResponse
      };
      setMessages(prev => [...prev, errorAuraMessage]);
      setCurrentEmotion(errorResponse.emotion);
    } finally {
      setIsLoading(false);
      resetIdleTimer();
    }
  };


  const handleTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };
  
  const lastAuraMessage = [...messages].reverse().find(m => m.sender === 'aura');
  const actionsToShow = !isLoading ? (lastAuraMessage?.actions ?? localConfig?.default_actions) : [];

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
          
          {actionsToShow && actionsToShow.length > 0 && (
            <div className="px-6 pb-3 pt-0 flex flex-wrap gap-2 animate-pop-in">
                {actionsToShow.map((action) => (
                    <ActionButton 
                        key={action.title} 
                        title={action.title} 
                        onClick={() => handleSuggestedPrompt(action.payload)} 
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
