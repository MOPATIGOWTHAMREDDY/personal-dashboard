import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Loader2, Bot, User, Image, 
  Brain, Code, Zap, Star, Cpu, Sparkles, HardDrive, Rocket,
  Copy, CheckCircle, Download, Settings, Trash2, ChevronDown,
  AlertTriangle, RefreshCw, Edit3, Check, X, Home, Plus,
  Menu, ChevronLeft, Search, Archive, Clock, Bookmark, 
  MoreVertical, Palette, Globe, ArrowRight, ChevronUp,
  FileText, Layers, Mic, Camera, Hash, Activity
} from 'lucide-react';

// Main Chat Interface Component
function ChatInterface({ onNavigateHome, setActiveCategory }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openrouter:openai/gpt-4o');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [copied, setCopied] = useState('');
  const [puterReady, setPuterReady] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showChatList, setShowChatList] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessages, setChatMessages] = useState({});
  const [modelFilter, setModelFilter] = useState('all');
  const [streamingText, setStreamingText] = useState('');
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // ALL OPENROUTER MODELS
  const models = [
    // Featured/Popular Models
    { id: 'openrouter:openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: Brain, color: 'emerald', featured: true },
    { id: 'openrouter:anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', icon: Sparkles, color: 'orange', featured: true },
    { id: 'openrouter:x-ai/grok-3', name: 'Grok 3', provider: 'xAI', icon: Zap, color: 'blue', featured: true },
    { id: 'openrouter:deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', icon: Star, color: 'purple', featured: true },
    { id: 'openrouter:meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', icon: Bot, color: 'green', featured: true },
    { id: 'openrouter:google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', icon: Rocket, color: 'yellow', featured: true },

    // OpenAI Models
    { id: 'openrouter:openai/chatgpt-4o-latest', name: 'ChatGPT-4o Latest', provider: 'OpenAI', icon: Brain, color: 'emerald' },
    { id: 'openrouter:openai/gpt-4.5-preview', name: 'GPT-4.5 Preview', provider: 'OpenAI', icon: Star, color: 'yellow' },
    { id: 'openrouter:openai/gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', icon: Zap, color: 'blue' },
    { id: 'openrouter:openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI', icon: Cpu, color: 'cyan' },
    { id: 'openrouter:openai/gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'OpenAI', icon: Sparkles, color: 'pink' },
    { id: 'openrouter:openai/o3', name: 'o3', provider: 'OpenAI', icon: Star, color: 'red' },
    { id: 'openrouter:openai/o3-mini', name: 'o3 Mini', provider: 'OpenAI', icon: Brain, color: 'orange' },
    { id: 'openrouter:openai/o3-pro', name: 'o3 Pro', provider: 'OpenAI', icon: Rocket, color: 'purple' },
    { id: 'openrouter:openai/o4-mini', name: 'o4 Mini', provider: 'OpenAI', icon: Zap, color: 'indigo' },
    { id: 'openrouter:openai/o1', name: 'o1', provider: 'OpenAI', icon: Bot, color: 'teal' },
    { id: 'openrouter:openai/o1-mini', name: 'o1 Mini', provider: 'OpenAI', icon: Cpu, color: 'lime' },
    { id: 'openrouter:openai/o1-pro', name: 'o1 Pro', provider: 'OpenAI', icon: Star, color: 'amber' },
    { id: 'openrouter:openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', icon: Sparkles, color: 'emerald' },

    // Anthropic Models
    { id: 'openrouter:anthropic/claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', icon: Star, color: 'orange' },
    { id: 'openrouter:anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', icon: Sparkles, color: 'orange' },
    { id: 'openrouter:anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: Brain, color: 'orange' },
    { id: 'openrouter:anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', icon: Zap, color: 'orange' },
    { id: 'openrouter:anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', icon: Bot, color: 'orange' },

    // xAI (Grok) Models
    { id: 'openrouter:x-ai/grok-3-beta', name: 'Grok 3 Beta', provider: 'xAI', icon: Rocket, color: 'blue' },
    { id: 'openrouter:x-ai/grok-3-mini', name: 'Grok 3 Mini', provider: 'xAI', icon: Cpu, color: 'blue' },
    { id: 'openrouter:x-ai/grok-2-1212', name: 'Grok 2', provider: 'xAI', icon: Brain, color: 'blue' },
    { id: 'openrouter:x-ai/grok-vision-beta', name: 'Grok Vision', provider: 'xAI', icon: Image, color: 'blue' },

    // Meta Llama Models
    { id: 'openrouter:meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', icon: Star, color: 'green' },
    { id: 'openrouter:meta-llama/llama-4-scout', name: 'Llama 4 Scout', provider: 'Meta', icon: Search, color: 'green' },
    { id: 'openrouter:meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', icon: Rocket, color: 'green' },
    { id: 'openrouter:meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', icon: Brain, color: 'green' },
    { id: 'openrouter:meta-llama/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', provider: 'Meta', icon: Image, color: 'green' },
    { id: 'openrouter:meta-llama/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', provider: 'Meta', icon: Camera, color: 'green' },

    // Google Models
    { id: 'openrouter:google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', icon: Star, color: 'yellow' },
    { id: 'openrouter:google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', icon: Zap, color: 'yellow' },
    { id: 'openrouter:google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', icon: Brain, color: 'yellow' },
    { id: 'openrouter:google/gemma-3-27b-it', name: 'Gemma 3 27B', provider: 'Google', icon: Bot, color: 'yellow' },

    // DeepSeek Models
    { id: 'openrouter:deepseek/deepseek-r1-0528', name: 'DeepSeek R1-0528', provider: 'DeepSeek', icon: Code, color: 'purple' },
    { id: 'openrouter:deepseek/deepseek-chat-v3-0324', name: 'DeepSeek Chat v3', provider: 'DeepSeek', icon: MessageCircle, color: 'purple' },
    { id: 'openrouter:deepseek/deepseek-prover-v2', name: 'DeepSeek Prover v2', provider: 'DeepSeek', icon: Brain, color: 'purple' },

    // Mistral Models
    { id: 'openrouter:mistralai/magistral-medium-2506', name: 'Magistral Medium', provider: 'Mistral', icon: Star, color: 'red' },
    { id: 'openrouter:mistralai/codestral-2501', name: 'Codestral 2501', provider: 'Mistral', icon: Code, color: 'red' },
    { id: 'openrouter:mistralai/mistral-large-2411', name: 'Mistral Large', provider: 'Mistral', icon: Brain, color: 'red' },
    { id: 'openrouter:mistralai/pixtral-large-2411', name: 'Pixtral Large', provider: 'Mistral', icon: Image, color: 'red' },

    // Qwen Models
    { id: 'openrouter:qwen/qwen3-235b-a22b', name: 'Qwen3 235B', provider: 'Qwen', icon: Rocket, color: 'indigo' },
    { id: 'openrouter:qwen/qwen3-32b', name: 'Qwen3 32B', provider: 'Qwen', icon: Brain, color: 'indigo' },
    { id: 'openrouter:qwen/qwq-32b', name: 'QwQ 32B', provider: 'Qwen', icon: Bot, color: 'indigo' },

    // Perplexity Models
    { id: 'openrouter:perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', icon: Search, color: 'cyan' },
    { id: 'openrouter:perplexity/sonar-reasoning', name: 'Sonar Reasoning', provider: 'Perplexity', icon: Brain, color: 'cyan' },

    // Microsoft Models
    { id: 'openrouter:microsoft/phi-4', name: 'Phi-4', provider: 'Microsoft', icon: Bot, color: 'blue' },
    { id: 'openrouter:microsoft/phi-4-reasoning-plus', name: 'Phi-4 Reasoning+', provider: 'Microsoft', icon: Brain, color: 'blue' },

    // Amazon Models
    { id: 'openrouter:amazon/nova-pro-v1', name: 'Nova Pro v1', provider: 'Amazon', icon: Star, color: 'orange' },
    { id: 'openrouter:amazon/nova-lite-v1', name: 'Nova Lite v1', provider: 'Amazon', icon: Zap, color: 'orange' },

    // Specialized Models
    { id: 'openrouter:nvidia/llama-3.1-nemotron-ultra-253b-v1', name: 'Nemotron Ultra 253B', provider: 'NVIDIA', icon: Rocket, color: 'green' },
    { id: 'openrouter:arcee-ai/maestro-reasoning', name: 'Maestro Reasoning', provider: 'Arcee AI', icon: Brain, color: 'violet' },
    { id: 'openrouter:liquid/lfm-40b', name: 'LFM 40B', provider: 'Liquid', icon: Activity, color: 'teal' },
  ];

  const providers = [...new Set(models.map(m => m.provider))];
  
  const quickPrompts = [
    { text: "Explain quantum computing in simple terms", icon: Brain, model: 'openrouter:openai/gpt-4o', category: 'science' },
    { text: "Write Python code for data analysis", icon: Code, model: 'openrouter:deepseek/deepseek-r1', category: 'coding' },
    { text: "Create a business strategy", icon: Rocket, model: 'openrouter:anthropic/claude-opus-4', category: 'business' },
    { text: "Help me debug this error", icon: AlertTriangle, model: 'openrouter:mistralai/codestral-2501', category: 'coding' },
    { text: "Summarize latest AI trends", icon: Star, model: 'openrouter:perplexity/sonar-pro', category: 'research' },
    { text: "Write a creative story", icon: FileText, model: 'openrouter:anthropic/claude-3.5-sonnet', category: 'creative' },
  ];

  useEffect(() => {
    initializePuter();
    initializeChats();
    
    const savedPrompt = localStorage.getItem('quickPrompt');
    if (savedPrompt) {
      try {
        const prompt = JSON.parse(savedPrompt);
        if (prompt.model) setSelectedModel(prompt.model);
        if (prompt.prompt) setInput(prompt.prompt);
        localStorage.removeItem('quickPrompt');
      } catch (e) {
        console.log('No valid quick prompt found');
      }
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const initializePuter = async () => {
    const checkPuter = () => {
      if (typeof window !== 'undefined' && window.puter?.ai) {
        setPuterReady(true);
        setConnectionError('');
        return true;
      }
      return false;
    };

    if (!checkPuter()) {
      setConnectionError('Loading AI services...');
      let retries = 0;
      const maxRetries = 10;
      
      const retryInterval = setInterval(() => {
        if (checkPuter() || retries >= maxRetries) {
          clearInterval(retryInterval);
          if (retries >= maxRetries) {
            setConnectionError('Failed to load AI services. Please refresh the page.');
          }
        }
        retries++;
      }, 1000);
    }
  };

  const initializeChats = () => {
    const savedChats = localStorage.getItem('aiChatHistory');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);
        
        const savedMessages = localStorage.getItem('aiChatMessages');
        if (savedMessages) {
          setChatMessages(JSON.parse(savedMessages));
        }
        
        if (parsedChats.length > 0) {
          loadChat(parsedChats[0].id);
        } else {
          startNewChat();
        }
      } catch (e) {
        console.error('Error loading chats:', e);
        startNewChat();
      }
    } else {
      startNewChat();
    }
  };

  const saveChatsToStorage = (newChats) => {
    localStorage.setItem('aiChatHistory', JSON.stringify(newChats));
  };

  const saveChatMessagesToStorage = (newChatMessages) => {
    localStorage.setItem('aiChatMessages', JSON.stringify(newChatMessages));
  };

  const startNewChat = () => {
    if (currentChatId && messages.length > 1) {
      const updatedMessages = { ...chatMessages, [currentChatId]: [...messages] };
      setChatMessages(updatedMessages);
      saveChatMessagesToStorage(updatedMessages);
    }

    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([{
      id: Date.now(),
      speaker: 'assistant',
      text: '🚀 Welcome! I have access to hundreds of AI models. How can I help you today?',
      model: selectedModel,
      timestamp: new Date()
    }]);
    setShowChatList(false);
  };

  const loadChat = (chatId) => {
  if (currentChatId && messages.length > 1) {
    const updatedMessages = { ...chatMessages, [currentChatId]: [...messages] };
    setChatMessages(updatedMessages);
    saveChatMessagesToStorage(updatedMessages);
  }

  const chat = chats.find(c => c.id === chatId);
  if (chat) {
    setCurrentChatId(chatId);
    setSelectedModel(chat.model);
    
    const savedMessages = chatMessages[chatId];
    if (savedMessages && savedMessages.length > 0) {
      // ✅ Fix: Convert timestamp strings back to Date objects
      const fixedMessages = savedMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }));
      setMessages(fixedMessages);
    } else {
      setMessages([{
        id: Date.now(),
        speaker: 'assistant',
        text: '👋 Welcome back! How can I continue helping you?',
        model: chat.model,
        timestamp: new Date()
      }]);
    }
    setShowChatList(false);
  }
};


  const deleteChat = (chatId) => {
    const updatedChatMessages = { ...chatMessages };
    delete updatedChatMessages[chatId];
    setChatMessages(updatedChatMessages);
    saveChatMessagesToStorage(updatedChatMessages);
    
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
    
    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        loadChat(updatedChats[0].id);
      } else {
        startNewChat();
      }
    }
  };

  const sendMessage = async (messageText = input, regenerateFromIndex = null) => {
    if (!messageText.trim() && regenerateFromIndex === null) return;
    if (!puterReady) {
      setConnectionError('AI service not ready. Please wait...');
      return;
    }

    let newMessages = [...messages];
    
    // If regenerating, remove messages after the selected index
    if (regenerateFromIndex !== null) {
      newMessages = messages.slice(0, regenerateFromIndex);
      messageText = messages[regenerateFromIndex - 1]?.text || messageText;
    } else {
      // Add user message
      const userMessage = {
        id: Date.now(),
        speaker: 'user',
        text: messageText.trim(),
        timestamp: new Date()
      };
      newMessages = [...newMessages, userMessage];
    }

    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreamingText('');

    try {
      // Create assistant message placeholder
      const assistantMessage = {
        id: Date.now() + 1,
        speaker: 'assistant',
        text: '',
        model: selectedModel,
        timestamp: new Date(),
        streaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      let fullText = '';
      const response = await window.puter.ai.chat(messageText, { 
        model: selectedModel, 
        stream: true 
      });

      for await (const chunk of response) {
        if (chunk?.text) {
          fullText += chunk.text;
          setStreamingText(fullText);
          
          // Update the assistant message in real-time
          setMessages(prev => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage && lastMessage.speaker === 'assistant') {
              lastMessage.text = fullText;
            }
            return updated;
          });
        }
      }

      // Finalize message
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.speaker === 'assistant') {
          lastMessage.streaming = false;
        }
        return updated;
      });

      // Update chat in list
      updateChatInList(messageText, fullText);

    } catch (error) {
      console.error('AI Error:', error);
      
      const errorMsg = {
        id: Date.now() + 1,
        speaker: 'assistant',
        text: `❌ Error: ${error.message}\n\n💡 Try:\n• Different model\n• Refresh page\n• Check connection`,
        model: selectedModel,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setStreamingText('');
    }
  };

  const updateChatInList = (userMessage, assistantResponse) => {
    if (!currentChatId) return;

    const existingChat = chats.find(c => c.id === currentChatId);
    
    if (!existingChat) {
      // Create new chat
      const chatTitle = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
      const newChat = {
        id: currentChatId,
        title: chatTitle,
        model: selectedModel,
        lastMessage: userMessage,
        timestamp: new Date(),
        messageCount: messages.length + 2,
        pinned: false
      };
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      saveChatsToStorage(updatedChats);
    } else {
      // Update existing chat
      const updatedChats = chats.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              lastMessage: userMessage,
              timestamp: new Date(),
              messageCount: messages.length + 2
            }
          : chat
      );
      setChats(updatedChats);
      saveChatsToStorage(updatedChats);
    }

    // Save messages
    setTimeout(() => {
      const updatedChatMessages = {
        ...chatMessages,
        [currentChatId]: [...messages, 
          { id: Date.now(), speaker: 'user', text: userMessage, timestamp: new Date() },
          { id: Date.now() + 1, speaker: 'assistant', text: assistantResponse, model: selectedModel, timestamp: new Date() }
        ]
      };
      setChatMessages(updatedChatMessages);
      saveChatMessagesToStorage(updatedChatMessages);
    }, 100);
  };

  const handleEditMessage = async (messageId, newText) => {
    if (!newText.trim()) return;

    // Find the message index
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Update the message
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      text: newText.trim(),
      edited: true
    };

    // Remove all messages after this one (we'll regenerate)
    const messagesUpToEdit = updatedMessages.slice(0, messageIndex + 1);
    setMessages(messagesUpToEdit);
    
    // If it's a user message, regenerate the AI response
    if (updatedMessages[messageIndex].speaker === 'user') {
      await sendMessage(newText.trim(), messageIndex + 1);
    }

    setEditingMessage(null);
    setEditText('');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const currentModel = models.find(m => m.id === selectedModel);
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModels = modelFilter === 'all' 
    ? models 
    : models.filter(m => m.provider === modelFilter);

  return (
    <div className="fixed inset-0 flex h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      
      {/* Chat Sidebar */}
      <ChatSidebar 
        showChatList={showChatList}
        setShowChatList={setShowChatList}
        chats={filteredChats}
        currentChatId={currentChatId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        models={models}
        onLoadChat={loadChat}
        onDeleteChat={deleteChat}
        onStartNewChat={startNewChat}
        onPinChat={(chatId) => {
          const updatedChats = chats.map(c => 
            c.id === chatId ? { ...c, pinned: !c.pinned } : c
          );
          setChats(updatedChats);
          saveChatsToStorage(updatedChats);
        }}
        onRenameChat={(chatId, newTitle) => {
          const updatedChats = chats.map(c => 
            c.id === chatId ? { ...c, title: newTitle } : c
          );
          setChats(updatedChats);
          saveChatsToStorage(updatedChats);
        }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-black/60 backdrop-blur-xl border-b border-white/10 p-4 pt-safe">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChatList(!showChatList)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors lg:hidden">
                <Menu size={20} />
              </button>
              
              <button
                onClick={() => setActiveCategory?.('home') || onNavigateHome?.()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <Home size={20} />
              </button>
              
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Studio
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${puterReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span>{puterReady ? 'Connected' : 'Connecting...'}</span>
                </div>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-2">
              <button
                onClick={startNewChat}
                className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all">
                <Plus size={18} />
              </button>
              
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Current Model Display */}
          <div className="mt-4 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              {currentModel && (
                <>
                  <div className={`p-2 rounded-lg bg-${currentModel.color}-500/20`}>
                    <currentModel.icon size={20} className={`text-${currentModel.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{currentModel.name}</div>
                    <div className="text-sm text-gray-400">{currentModel.provider}</div>
                  </div>
                  {currentModel.featured && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-full text-xs font-medium">
                      ⭐ FEATURED
                    </span>
                  )}
                </>
              )}
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                <ChevronDown size={16} className={`transform transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Model Selector */}
          {showModelSelector && (
            <div className="mt-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-96 overflow-hidden">
              {/* Model Filter */}
              <div className="p-4 border-b border-white/10">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setModelFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      modelFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}>
                    All Models
                  </button>
                  {providers.map(provider => (
                    <button
                      key={provider}
                      onClick={() => setModelFilter(provider)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        modelFilter === provider ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}>
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Models */}
              {modelFilter === 'all' && (
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <Star size={14} />
                    Featured Models
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {models.filter(m => m.featured).map(model => (
                      <ModelCard key={model.id} model={model} selectedModel={selectedModel} onSelect={setSelectedModel} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Models */}
              <div className="max-h-64 overflow-y-auto">
                {providers.filter(p => modelFilter === 'all' || modelFilter === p).map(provider => {
                  const ProviderIcon = getProviderIcon(provider);
                  return (
                    <div key={provider} className="p-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <ProviderIcon size={14} />
                        {provider}
                      </h3>
                      <div className="space-y-1">
                        {filteredModels.filter(m => m.provider === provider && !m.featured).map(model => (
                          <ModelCard key={model.id} model={model} selectedModel={selectedModel} onSelect={setSelectedModel} compact />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connection Error */}
          {connectionError && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-sm text-red-200">{connectionError}</span>
              <button
                onClick={initializePuter}
                className="ml-auto p-1 rounded-lg hover:bg-red-500/30 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </header>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isEditing={editingMessage === message.id}
              editText={editText}
              setEditText={setEditText}
              onStartEdit={() => {
                setEditingMessage(message.id);
                setEditText(message.text);
              }}
              onSaveEdit={() => handleEditMessage(message.id, editText)}
              onCancelEdit={() => {
                setEditingMessage(null);
                setEditText('');
              }}
              onCopy={() => copyToClipboard(message.text)}
              onRegenerate={() => sendMessage('', index + 1)}
              copied={copied}
              models={models}
            />
          ))}

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="space-y-6 mt-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  What would you like to explore?
                </h2>
                <p className="text-gray-400">Choose from hundreds of AI models for any task</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  const model = models.find(m => m.id === prompt.model);
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedModel(prompt.model);
                        sendMessage(prompt.text);
                      }}
                      className="group p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 
                               border border-white/10 hover:border-white/20 hover:from-white/10 hover:to-white/15
                               transition-all duration-300 text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-${model?.color || 'blue'}-500/20 group-hover:bg-${model?.color || 'blue'}-500/30 transition-colors`}>
                          <Icon size={20} className={`text-${model?.color || 'blue'}-400`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{prompt.text}</div>
                          <div className="text-sm text-gray-400">{model?.name}</div>
                        </div>
                        <ArrowRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 pb-safe">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                disabled={loading || !puterReady}
                rows={input.split('\n').length}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-16
                         text-white placeholder-gray-400 focus:outline-none 
                         focus:border-blue-500 resize-none disabled:opacity-50 
                         min-h-[50px] max-h-32"
              />
              
              {/* Character count */}
              <div className="absolute bottom-2 right-14 text-xs text-gray-500">
                {input.length}
              </div>
            </div>
            
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim() || !puterReady}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed 
                       text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl
                       disabled:hover:shadow-lg">
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${puterReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{puterReady ? 'AI Ready • Free Unlimited Access' : 'Connecting to AI...'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{messages.filter(m => m.speaker === 'user').length} messages</span>
              <span>{models.length} models available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat Sidebar Component
function ChatSidebar({ 
  showChatList, setShowChatList, chats, currentChatId, searchTerm, setSearchTerm,
  models, onLoadChat, onDeleteChat, onStartNewChat, onPinChat, onRenameChat 
}) {
  const pinnedChats = chats.filter(c => c.pinned);
  const unpinnedChats = chats.filter(c => !c.pinned);

  return (
    <div className={`${showChatList ? 'w-80' : 'w-0'} lg:w-80 bg-black/95 backdrop-blur-xl 
                    border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col`}>
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Chat History
          </h2>
          <button
            onClick={() => setShowChatList(false)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors lg:hidden">
            <ChevronLeft size={18} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2
                     text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {/* New Chat Button */}
        <button
          onClick={onStartNewChat}
          className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 
                   hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all shadow-lg">
          <Plus size={18} />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Chats */}
        {pinnedChats.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
              <Bookmark size={14} />
              Pinned ({pinnedChats.length})
            </h3>
            {pinnedChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                models={models}
                isActive={currentChatId === chat.id}
                onSelect={() => onLoadChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
                onPin={() => onPinChat(chat.id)}
                onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
              />
            ))}
          </div>
        )}

        {/* Recent Chats */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Clock size={14} />
            Recent ({unpinnedChats.length})
          </h3>
          {unpinnedChats.length > 0 ? (
            unpinnedChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                models={models}
                isActive={currentChatId === chat.id}
                onSelect={() => onLoadChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
                onPin={() => onPinChat(chat.id)}
                onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs text-gray-600 mt-1">Start a conversation above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual Chat Item Component
function ChatItem({ chat, models, isActive, onSelect, onDelete, onPin, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [showActions, setShowActions] = useState(false);
  
  const model = models.find(m => m.id === chat.model);
  const Icon = model?.icon || MessageCircle;

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const formatTimestamp = (timestamp) => {
  // Ensure timestamp is a Date object
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};


  return (
    <div
      className={`group relative mb-2 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg' 
          : 'hover:bg-white/5 border border-transparent'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div onClick={onSelect} className="flex items-center gap-3 p-3 cursor-pointer">
        {/* Chat Icon */}
        <div className="relative flex-shrink-0">
          <div className={`p-2 rounded-lg bg-${model?.color || 'gray'}-500/20`}>
            <Icon size={16} className={`text-${model?.color || 'gray'}-400`} />
          </div>
          {chat.pinned && (
            <Bookmark size={10} className="absolute -top-1 -right-1 text-yellow-400 fill-current" />
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditTitle(chat.title);
                }
              }}
              className="w-full bg-black/50 border border-blue-500 rounded px-2 py-1 
                       focus:outline-none text-sm font-medium text-white"
              autoFocus
            />
          ) : (
            <h4 className="text-sm font-semibold text-white truncate mb-1">
              {chat.title}
            </h4>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 truncate flex-1 mr-2">
              {chat.lastMessage}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
              <MessageCircle size={10} />
              <span>{chat.messageCount}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">{model?.name || 'Unknown Model'}</span>
            <span className="text-xs text-gray-500">{formatTimestamp(chat.timestamp)}</span>
          </div>
        </div>

        {/* Actions */}
        {(showActions || isActive) && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                chat.pinned 
                  ? 'text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30' 
                  : 'text-gray-400 hover:bg-white/20 hover:text-yellow-400'
              }`}
              title={chat.pinned ? 'Unpin chat' : 'Pin chat'}
            >
              <Bookmark size={12} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-gray-400 hover:text-white"
              title="Rename chat"
            >
              <Edit3 size={12} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${chat.title}"?`)) {
                  onDelete();
                }
              }}
              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400"
              title="Delete chat"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Model Card Component
function ModelCard({ model, selectedModel, onSelect, compact = false }) {
  const Icon = model.icon;
  const isSelected = selectedModel === model.id;

  return (
    <button
      onClick={() => {
        onSelect(model.id);
      }}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
        ${isSelected 
          ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50 shadow-lg' 
          : 'hover:bg-white/10 border border-transparent'
        }`}
    >
      <div className={`p-2 rounded-lg bg-${model.color}-500/20 flex-shrink-0`}>
        <Icon size={compact ? 14 : 16} className={`text-${model.color}-400`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-white truncate ${compact ? 'text-sm' : ''}`}>
          {model.name}
        </div>
        <div className={`text-gray-400 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
          {model.provider}
        </div>
      </div>
      
      {model.featured && !compact && (
        <Star size={12} className="text-yellow-400 fill-current flex-shrink-0" />
      )}
      
      {isSelected && (
        <CheckCircle size={16} className="text-blue-400 flex-shrink-0" />
      )}
    </button>
  );
}

// Message Bubble Component
// Message Bubble Component - FIXED VERSION
function MessageBubble({ 
  message, isEditing, editText, setEditText, onStartEdit, onSaveEdit, onCancelEdit,
  onCopy, onRegenerate, copied, models 
}) {
  const [showActions, setShowActions] = useState(false);
  const model = models.find(m => m.id === message.model);

  // FIXED: Safe timestamp formatting
  const formatMessageTime = (timestamp) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'now';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'now';
    }
  };

  return (
    <div 
      className={`flex items-start gap-4 ${message.speaker === 'user' ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg
        ${message.speaker === 'user' 
          ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
          : message.error 
            ? 'bg-gradient-to-br from-red-600 to-pink-600' 
            : 'bg-gradient-to-br from-gray-700 to-gray-800'
        }`}>
        {message.speaker === 'user' ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className={`max-w-[85%] flex flex-col ${message.speaker === 'user' ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-5 py-4 relative group shadow-lg backdrop-blur-sm
          ${message.speaker === 'user'
            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-md'
            : message.error
              ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-200 rounded-tl-md'
              : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-white rounded-tl-md'
          }`}>
          
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    onSaveEdit();
                  } else if (e.key === 'Escape') {
                    onCancelEdit();
                  }
                }}
                className="w-full bg-black/30 border border-white/30 rounded-lg px-3 py-2 
                         text-white placeholder-gray-400 resize-none focus:outline-none 
                         focus:border-blue-500 min-h-[80px]"
                placeholder="Edit your message... (Ctrl+Enter to save)"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={onSaveEdit}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 
                           rounded-lg text-sm transition-colors font-medium">
                  <Check size={12} />
                  Save & Regenerate
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 
                           rounded-lg text-sm transition-colors">
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Message Text */}
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.text}
                {message.edited && (
                  <span className="inline-flex items-center gap-1 ml-2 text-xs opacity-70">
                    <Edit3 size={10} />
                    edited
                  </span>
                )}
              </div>
              
              {/* Streaming Indicator */}
              {message.streaming && (
                <div className="flex items-center gap-2 mt-3 text-gray-300">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Message Footer */}
        <div className={`flex items-center justify-between mt-2 px-2 ${
          message.speaker === 'user' ? 'flex-row-reverse' : ''
        }`}>
          {/* Timestamp & Model */}
          <div className={`text-xs text-gray-400 flex items-center gap-2 ${
            message.speaker === 'user' ? 'flex-row-reverse' : ''
          }`}>
            <span>{formatMessageTime(message.timestamp)}</span>
            {message.model && model && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <model.icon size={10} className={`text-${model.color}-400`} />
                  <span>{model.name}</span>
                </div>
              </>
            )}
          </div>
          
          {/* Actions */}
          {(showActions || isEditing) && !message.streaming && (
            <div className={`flex items-center gap-1 ${message.speaker === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.speaker === 'user' && (
                <button
                  onClick={onStartEdit}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-gray-400 hover:text-white"
                  title="Edit message">
                  <Edit3 size={12} />
                </button>
              )}
              
              {message.speaker === 'assistant' && (
                <>
                  <button
                    onClick={onCopy}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-gray-400 hover:text-white"
                    title="Copy response">
                    {copied === message.text ? (
                      <CheckCircle size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                  
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-gray-400 hover:text-white"
                    title="Regenerate response">
                    <RefreshCw size={12} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Helper function to get provider icons
function getProviderIcon(provider) {
  const iconMap = {
    'OpenAI': Brain,
    'Anthropic': Sparkles,
    'xAI': Zap,
    'Meta': Bot,
    'Google': Star,
    'DeepSeek': Code,
    'Mistral': Rocket,
    'Qwen': Globe,
    'Perplexity': Search,
    'Microsoft': Cpu,
    'Amazon': HardDrive,
    'NVIDIA': Activity
  };
  return iconMap[provider] || MessageCircle;
}

// Main Export
export default function EnhancedAIChat({ onNavigateHome, setActiveCategory }) {
  const [puterLoaded, setPuterLoaded] = useState(false);

  useEffect(() => {
    // Load Puter.js if not already loaded
    if (typeof window !== 'undefined' && !window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.onload = () => {
        setPuterLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Puter.js');
      };
      document.head.appendChild(script);
    } else if (window.puter) {
      setPuterLoaded(true);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {puterLoaded ? (
        <ChatInterface 
          onNavigateHome={onNavigateHome} 
          setActiveCategory={setActiveCategory} 
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Loading AI Studio</h2>
            <p className="text-gray-400">Connecting to OpenRouter models...</p>
          </div>
        </div>
      )}
    </div>
  );
}