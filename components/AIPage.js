'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Loader2, Bot, User, Image, 
  Brain, Code, Zap, Star, Cpu, Sparkles, HardDrive, Rocket,
  Copy, CheckCircle, Download, Settings, Trash2, ChevronDown,
  AlertTriangle, RefreshCw, Edit3, Check, X, Home, Plus,
  Menu, ChevronLeft, Search, Archive, Clock, Bookmark
} from 'lucide-react';

export default function EnhancedAIPage({ onNavigateHome, setActiveCategory }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
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
  const [chatMessages, setChatMessages] = useState({}); // Store messages for each chat
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // ALL AVAILABLE MODELS
  const models = [
    // OpenAI Models
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: Brain, color: 'green', type: 'text' },
    { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', icon: Zap, color: 'blue', type: 'text' },
    { id: 'o3-mini', name: 'o3-mini', provider: 'OpenAI', icon: Star, color: 'yellow', type: 'text' },
    
    // Claude Models  
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', icon: Sparkles, color: 'orange', type: 'text' },
    { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', icon: Star, color: 'pink', type: 'text' },
    
    // Grok Models (xAI)
    { id: 'x-ai/grok-4', name: 'Grok 4', provider: 'xAI', icon: HardDrive, color: 'cyan', type: 'text' },
    { id: 'x-ai/grok-3', name: 'Grok 3', provider: 'xAI', icon: Zap, color: 'teal', type: 'text' },
    
    // OpenRouter Models
    { id: 'openrouter:meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', icon: Bot, color: 'emerald', type: 'text' },
    { id: 'openrouter:deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', icon: Code, color: 'purple', type: 'text' },
    { id: 'openrouter:anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: Sparkles, color: 'orange', type: 'text' },
    
    // Image Generation
    { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', icon: Image, color: 'violet', type: 'image' },
  ];

  // Quick Prompts for new conversations
  const quickPrompts = [
    { text: "Explain quantum computing in simple terms", icon: Brain, model: 'gpt-4o' },
    { text: "Write Python code for data analysis", icon: Code, model: 'openrouter:deepseek/deepseek-r1' },
    { text: "Create a business strategy", icon: Zap, model: 'claude-opus-4' },
    { text: "Generate: A futuristic city at sunset", icon: Image, model: 'dall-e-3', isImage: true },
  ];

  useEffect(() => {
    checkPuterConnection();
    
    // Initialize with demo chats
    const demoChats = [
      {
        id: '1',
        title: 'Python Data Analysis',
        model: 'openrouter:deepseek/deepseek-r1',
        lastMessage: 'Can you help me analyze this dataset?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        messageCount: 8,
        pinned: true
      },
      {
        id: '2',
        title: 'Quantum Computing Basics',
        model: 'gpt-4o',
        lastMessage: 'Explain quantum entanglement',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        messageCount: 12,
        pinned: false
      },
      {
        id: '3',
        title: 'Logo Design Ideas',
        model: 'dall-e-3',
        lastMessage: 'Create a modern tech company logo',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        messageCount: 5,
        pinned: false
      }
    ];
    
    setChats(demoChats);
    
    // Check for quick prompt from Home page
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

    if (messages.length === 0) {
      startNewChat();
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (editingMessage && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [editingMessage]);

  const startNewChat = () => {
    // Save current chat messages before starting new one
    if (currentChatId && messages.length > 1) {
      setChatMessages(prev => ({
        ...prev,
        [currentChatId]: [...messages]
      }));
    }

    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([{
      id: Date.now(),
      speaker: 'assistant',
      text: '🚀 Welcome! How can I help you today?',
      model: selectedModel,
      timestamp: new Date()
    }]);
    setShowChatList(false);
  };

  const loadChat = (chatId) => {
    // Save current chat messages before switching
    if (currentChatId && messages.length > 1) {
      setChatMessages(prev => ({
        ...prev,
        [currentChatId]: [...messages]
      }));
    }

    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setSelectedModel(chat.model);
      
      // Load actual saved messages or create initial message
      const savedMessages = chatMessages[chatId];
      if (savedMessages && savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        setMessages([{
          id: Date.now(),
          speaker: 'assistant',
          text: '👋 Welcome back to this chat! How can I help you today?',
          model: chat.model,
          timestamp: new Date()
        }]);
      }
      setShowChatList(false);
    }
  };

  const deleteChat = (chatId) => {
    // Remove chat messages from storage
    setChatMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[chatId];
      return newMessages;
    });
    
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  const pinChat = (chatId) => {
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, pinned: !c.pinned } : c
    ));
  };

  const updateChatTitle = (chatId, newTitle) => {
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, title: newTitle } : c
    ));
  };

  const handleNavigateHome = () => {
    console.log('Home button clicked - navigating to home');
    
    // First try the setActiveCategory prop (from Layout)
    if (setActiveCategory) {
      console.log('Using setActiveCategory to go home');
      setActiveCategory('home');
      return;
    }
    
    // Then try onNavigateHome callback
    if (onNavigateHome) {
      console.log('Using onNavigateHome callback');
      onNavigateHome();
      return;
    }
    
    // Fallback for debugging
    console.log('No navigation method available - check parent component props');
  };

  const sendMessage = async (messageText = input, isImageGeneration = false) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      speaker: 'user',
      text: messageText.trim(),
      timestamp: new Date(),
      type: isImageGeneration ? 'image-request' : 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Check Puter availability
    if (!puterReady || !window.puter) {
      const errorMsg = {
        id: Date.now() + 1,
        speaker: 'assistant',
        text: '❌ AI service not ready. Please wait a moment and try again.\n\n🔄 Make sure you have internet connection.',
        model: selectedModel,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMsg]);
      setLoading(false);
      checkPuterConnection();
      return;
    }

    try {
      let finalResponse = '';
      let responseType = 'text';
      
      if (isImageGeneration || selectedModel === 'dall-e-3') {
        // Image Generation
        try {
          const imageElement = await window.puter.ai.txt2img(messageText);
          const imageMessage = {
            id: Date.now() + 1,
            speaker: 'assistant',
            text: `🎨 Generated image: "${messageText}"`,
            image: imageElement.src,
            model: selectedModel,
            timestamp: new Date(),
            type: 'image'
          };
          setMessages(prev => [...prev, imageMessage]);
          finalResponse = imageMessage.text;
          responseType = 'image';
        } catch (imgError) {
          throw new Error(`Image generation failed: ${imgError.message}`);
        }
      } else {
        // Text Generation with Streaming
        try {
          const response = await window.puter.ai.chat(messageText, { 
            model: selectedModel, 
            stream: true 
          });

          let fullText = '';
          const assistantMessage = {
            id: Date.now() + 1,
            speaker: 'assistant',
            text: '',
            model: selectedModel,
            timestamp: new Date(),
            streaming: true
          };

          setMessages(prev => [...prev, assistantMessage]);

          for await (const chunk of response) {
            if (chunk?.text) {
              fullText += chunk.text;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.speaker === 'assistant') {
                  lastMessage.text = fullText;
                }
                return newMessages;
              });
            }
          }

          // Finalize message
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.speaker === 'assistant') {
              lastMessage.streaming = false;
            }
            return newMessages;
          });
          
          finalResponse = fullText;
          responseType = 'text';
        } catch (textError) {
          throw new Error(`Chat failed: ${textError.message}`);
        }
      }

      // Update chat in list if it's a new chat
      if (currentChatId && !chats.find(c => c.id === currentChatId)) {
        const chatTitle = messageText.slice(0, 40) + (messageText.length > 40 ? '...' : '');
        const newChat = {
          id: currentChatId,
          title: chatTitle,
          model: selectedModel,
          lastMessage: messageText,
          timestamp: new Date(),
          messageCount: 2,
          pinned: false
        };
        setChats(prev => [newChat, ...prev]);
      } else if (currentChatId) {
        // Update existing chat's last message and timestamp
        setChats(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { 
                ...chat, 
                lastMessage: messageText,
                timestamp: new Date(),
                messageCount: messages.length + 1
              }
            : chat
        ));
      }

      // Auto-save messages to storage
      setTimeout(() => {
        if (currentChatId && finalResponse) {
          setChatMessages(prev => ({
            ...prev,
            [currentChatId]: [...messages, userMessage, {
              id: Date.now() + 1,
              speaker: 'assistant',
              text: finalResponse,
              image: responseType === 'image' ? messages[messages.length - 1]?.image : undefined,
              model: selectedModel,
              timestamp: new Date(),
              type: responseType
            }]
          }));
        }
      }, 100);

    } catch (error) {
      console.error('AI Error:', error);
      
      // Detailed error message
      let errorText = '❌ Sorry, I encountered an error:\n\n';
      
      if (error.message.includes('Network')) {
        errorText += '🌐 Network issue - Check your internet connection';
      } else if (error.message.includes('rate limit')) {
        errorText += '⏱️ Rate limit reached - Please wait a moment';
      } else if (error.message.includes('model')) {
        errorText += `🤖 Model "${selectedModel}" might be unavailable - Try a different model`;
      } else {
        errorText += `🔧 Technical error: ${error.message}\n\n💡 Try:\n• Refreshing the page\n• Using a different model\n• Checking your connection`;
      }

      const errorMsg = {
        id: Date.now() + 1,
        speaker: 'assistant',
        text: errorText,
        model: selectedModel,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
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

  const clearChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      speaker: 'assistant',
      text: '👋 Chat cleared! Ready for a fresh conversation. How can I help you?',
      model: selectedModel,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Update chat messages in storage
    if (currentChatId) {
      setChatMessages(prev => ({
        ...prev,
        [currentChatId]: [welcomeMessage]
      }));
    }
  };

  const startEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditText(message.text);
  };

  const saveEditMessage = () => {
    if (!editText.trim()) return;
    
    const updatedMessages = messages.map(msg => 
      msg.id === editingMessage 
        ? { ...msg, text: editText.trim(), edited: true }
        : msg
    );
    
    setMessages(updatedMessages);
    
    // Update chat messages in storage
    if (currentChatId) {
      setChatMessages(prev => ({
        ...prev,
        [currentChatId]: updatedMessages
      }));
    }
    
    setEditingMessage(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentModel = models.find(m => m.id === selectedModel);
      sendMessage(input, currentModel?.type === 'image');
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditMessage();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const currentModel = models.find(m => m.id === selectedModel);
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.pinned);
  const unpinnedChats = filteredChats.filter(c => !c.pinned);

  const checkPuterConnection = () => {
    // Check if Puter.js is loaded
    if (typeof window !== 'undefined' && window.puter) {
      setPuterReady(true);
      setConnectionError('');
    } else {
      setPuterReady(false);
      setConnectionError('Puter.js not loaded. Please refresh the page.');
      
      // Retry after 2 seconds
      setTimeout(() => {
        if (window.puter) {
          setPuterReady(true);
          setConnectionError('');
        }
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white z-50">
      
      {/* Chat List Sidebar */}
      {showChatList && (
        <div className="w-80 bg-black/95 backdrop-blur-xl border-r border-white/20 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chats</h2>
              <button
                onClick={() => setShowChatList(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <ChevronLeft size={18} />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
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
              onClick={startNewChat}
              className="w-full flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 
                       rounded-lg transition-colors">
              <Plus size={18} />
              New Chat
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Bookmark size={14} />
                  Pinned
                </h3>
                {pinnedChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    models={models}
                    isActive={currentChatId === chat.id}
                    onSelect={() => loadChat(chat.id)}
                    onDelete={() => deleteChat(chat.id)}
                    onPin={() => pinChat(chat.id)}
                    onRename={(newTitle) => updateChatTitle(chat.id, newTitle)}
                  />
                ))}
              </div>
            )}

            {/* Recent Chats */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Clock size={14} />
                Recent
              </h3>
              {unpinnedChats.length > 0 ? (
                unpinnedChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    models={models}
                    isActive={currentChatId === chat.id}
                    onSelect={() => loadChat(chat.id)}
                    onDelete={() => deleteChat(chat.id)}
                    onPin={() => pinChat(chat.id)}
                    onRename={(newTitle) => updateChatTitle(chat.id, newTitle)}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header - Adjusted for notch */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 pt-12 pb-4 px-4">
          <div className="flex items-center justify-between mb-3">
            {/* Left Side - Menu + Home + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChatList(!showChatList)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 
                         transition-colors">
                <Menu size={20} className="text-gray-300" />
              </button>
              
              <button
                onClick={handleNavigateHome}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 
                         transition-colors">
                <Home size={20} className="text-gray-300" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold">AI Chat</h1>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    puterReady ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>{puterReady ? 'Connected • Free AI' : 'Connecting...'}</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={startNewChat}
                className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors">
                <Plus size={18} />
              </button>
              
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Settings size={18} />
              </button>
              
              <button
                onClick={clearChat}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Connection Error Alert */}
          {connectionError && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-sm text-red-200">{connectionError}</span>
            </div>
          )}

          {/* Current Model Display */}
          <div className="flex items-center gap-3 text-sm bg-white/5 rounded-lg p-3">
            {currentModel && (
              <>
                <currentModel.icon size={16} className={`text-${currentModel.color}-400`} />
                <div className="flex-1">
                  <div className="text-white font-medium">{currentModel.name}</div>
                  <div className="text-xs text-gray-400">{currentModel.provider}</div>
                </div>
                {currentModel.type === 'image' && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    IMAGE
                  </span>
                )}
              </>
            )}
          </div>

          {/* Model Selector */}
          {showModelSelector && (
            <div className="mt-3 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
              {['OpenAI', 'Anthropic', 'xAI', 'Meta', 'DeepSeek'].map(provider => (
                <div key={provider} className="p-3">
                  <h3 className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                    {provider}
                  </h3>
                  {models.filter(m => m.provider === provider).map(model => {
                    const Icon = model.icon;
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelSelector(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors
                          ${selectedModel === model.id ? 'bg-white/20 border-l-4 border-blue-500' : ''}`}>
                        <Icon size={16} className={`text-${model.color}-400`} />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <span>{model.provider}</span>
                            {model.type === 'image' && (
                              <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-xs">
                                IMG
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Chat Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${
              message.speaker === 'user' ? 'flex-row-reverse' : ''
            }`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${message.speaker === 'user' 
                  ? 'bg-blue-600' 
                  : message.error 
                    ? 'bg-red-600' 
                    : 'bg-gray-700'}`}>
                {message.speaker === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Message Content */}
              <div className={`max-w-[85%] ${message.speaker === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.speaker === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-md'
                    : message.error
                      ? 'bg-red-500/20 border border-red-500/30 text-red-200 rounded-tl-md'
                      : 'bg-white/10 border border-white/20 text-white rounded-tl-md'
                } backdrop-blur-sm relative group`}>
                  
                  {/* Edit Mode */}
                  {editingMessage === message.id ? (
                    <div className="space-y-3">
                      <textarea
                        ref={editInputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 
                                 text-white placeholder-gray-400 resize-none focus:outline-none 
                                 focus:border-blue-500 min-h-[60px]"
                        placeholder="Edit your message..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditMessage}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 
                                   rounded-lg text-sm transition-colors">
                          <Check size={12} />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 
                                   rounded-lg text-sm transition-colors">
                          <X size={12} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Message Content */}
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.text}
                        {message.edited && (
                          <span className="text-xs text-gray-400 ml-2">(edited)</span>
                        )}
                      </div>
                      
                      {/* Image Content */}
                      {message.image && (
                        <div className="mt-3">
                          <img 
                            src={message.image} 
                            alt="Generated image" 
                            className="max-w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>
                      )}
                      
                      {/* Streaming Indicator */}
                      {message.streaming && (
                        <div className="flex items-center gap-2 mt-2 text-gray-400">
                          <Loader2 size={12} className="animate-spin" />
                          <span className="text-sm">
                            {currentModel?.type === 'image' ? 'Generating image...' : 'Thinking...'}
                          </span>
                        </div>
                      )}

                      {/* Message Actions */}
                      <div className={`flex items-center justify-between mt-2 pt-2 border-t border-white/10 
                        opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <div className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {message.speaker === 'user' && (
                            <button
                              onClick={() => startEditMessage(message)}
                              className="p-1.5 rounded hover:bg-white/20 transition-colors">
                              <Edit3 size={12} />
                            </button>
                          )}
                          
                          {message.speaker === 'assistant' && !message.streaming && (
                            <button
                              onClick={() => copyToClipboard(message.text)}
                              className="p-1.5 rounded hover:bg-white/20 transition-colors">
                              {copied === message.text ? (
                                <CheckCircle size={12} className="text-green-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Prompts - Only show for new conversations */}
          {messages.length <= 1 && (
            <div className="grid grid-cols-1 gap-3 mt-6">
              <h3 className="text-sm font-medium text-gray-400 px-1">Quick Start</h3>
              {quickPrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (prompt.model) setSelectedModel(prompt.model);
                      sendMessage(prompt.text, prompt.isImage);
                    }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 
                             border border-white/10 hover:border-white/20 transition-all text-left">
                    <Icon size={18} className="text-blue-400 flex-shrink-0" />
                    <div>
                      <span className="block">{prompt.text}</span>
                      {prompt.model && (
                        <div className="text-sm text-gray-400 mt-1">
                          {models.find(m => m.id === prompt.model)?.name}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed Bottom Input */}
        <div className="bg-black/95 backdrop-blur-xl border-t border-white/20 p-4">
          <div className="flex items-center gap-3">
            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentModel?.type === 'image' 
                    ? 'Describe the image you want...' 
                    : 'Type your message...'
                }
                disabled={loading || !puterReady}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                         text-white placeholder-gray-400 focus:outline-none 
                         focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              {/* Model Type Indicator */}
              <div className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currentModel?.type === 'image' ? '🎨' : '💬'}
              </div>
            </div>
            
            {/* Send Button */}
            <button
              onClick={() => sendMessage(input, currentModel?.type === 'image')}
              disabled={loading || !input.trim() || !puterReady}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl 
                       transition-colors">
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : currentModel?.type === 'image' ? (
                <Image size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center mt-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              puterReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-xs text-gray-400">
              {puterReady ? 'AI Ready' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ChatItem component for the sidebar
function ChatItem({ chat, models, isActive, onSelect, onDelete, onPin, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [showActions, setShowActions] = useState(false);
  
  const model = models.find(m => m.id === chat.model);
  const Icon = model?.icon || MessageCircle;

  const handleRename = () => {
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div
      className={`group relative mb-2 rounded-lg transition-all ${
        isActive ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'hover:bg-white/5'
      }`}
    >
      <div
        onClick={onSelect}
        className="flex items-center gap-3 p-3 cursor-pointer"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Chat Icon */}
        <div className="flex-shrink-0">
          <Icon size={16} className={`text-${model?.color || 'gray'}-400`} />
          {chat.pinned && (
            <Bookmark size={12} className="text-yellow-400 absolute -mt-2 ml-2" />
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
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-full bg-transparent border-b border-blue-500 focus:outline-none
                       text-sm font-medium text-white"
              autoFocus
            />
          ) : (
            <h4 className="text-sm font-medium text-white truncate">
              {chat.title}
            </h4>
          )}
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-400 truncate flex-1 mr-2">
              {chat.lastMessage}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{chat.messageCount}</span>
              <span>•</span>
              <span>{formatTimestamp(chat.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={`p-1 rounded hover:bg-white/20 transition-colors ${
                chat.pinned ? 'text-yellow-400' : 'text-gray-400'
              }`}
            >
              <Bookmark size={12} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 rounded hover:bg-white/20 transition-colors text-gray-400"
            >
              <Edit3 size={12} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this chat?')) {
                  onDelete();
                }
              }}
              className="p-1 rounded hover:bg-red-500/20 transition-colors text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}