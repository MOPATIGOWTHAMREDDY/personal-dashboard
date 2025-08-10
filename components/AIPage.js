// components/AIPage.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Loader2, Bot, User, Image as ImageIcon, 
  Brain, Code, Zap, Star, Cpu, Sparkles, HardDrive, Rocket,
  Copy, CheckCircle, Download, Settings, Trash2, ChevronDown,
  AlertTriangle, RefreshCw
} from 'lucide-react';

export default function AIPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [copied, setCopied] = useState('');
  const [puterReady, setPuterReady] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  const containerRef = useRef(null);

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
    { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', icon: ImageIcon, color: 'violet', type: 'image' },
  ];

  // Quick Prompts
  const quickPrompts = [
    { text: "Explain quantum computing in simple terms", icon: Brain, model: 'gpt-4o' },
    { text: "Write Python code for data analysis", icon: Code, model: 'openrouter:deepseek/deepseek-r1' },
    { text: "Create a business strategy", icon: Zap, model: 'claude-opus-4' },
    { text: "Generate: A futuristic city at sunset", icon: ImageIcon, model: 'dall-e-3', isImage: true },
  ];

  useEffect(() => {
    checkPuterConnection();
    
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
      setMessages([{
        id: Date.now(),
        speaker: 'assistant',
        text: '🚀 Welcome!',
        model: selectedModel,
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

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
        } catch (textError) {
          throw new Error(`Chat failed: ${textError.message}`);
        }
      }
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
    setMessages([{
      id: Date.now(),
      speaker: 'assistant',
      text: '👋 Chat cleared! Ready for a fresh conversation. How can I help you?',
      model: selectedModel,
      timestamp: new Date()
    }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentModel = models.find(m => m.id === selectedModel);
      sendMessage(input, currentModel?.type === 'image');
    }
  };

  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircle className="text-blue-400" size={28} />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                puterReady ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Assistant</h1>
              <p className="text-xs text-gray-400">
                {puterReady ? 'Connected • Free AI via Puter.js' : 'Connecting...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!puterReady && (
              <button
                onClick={checkPuterConnection}
                className="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 transition-colors">
                <RefreshCw size={18} />
              </button>
            )}
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
          <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-sm text-red-200">{connectionError}</span>
          </div>
        )}

        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="w-full flex items-center justify-between p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors">
            <div className="flex items-center gap-2">
              {currentModel && (
                <>
                  <currentModel.icon size={18} className={`text-${currentModel.color}-400`} />
                  <span className="font-medium">{currentModel.name}</span>
                  <span className="text-xs text-gray-400">({currentModel.provider})</span>
                </>
              )}
            </div>
            <ChevronDown size={18} className={`transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
          </button>

          {/* Model Dropdown */}
          {showModelSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-10 max-h-80 overflow-y-auto">
              {['OpenAI', 'Anthropic', 'xAI', 'Meta', 'DeepSeek'].map(provider => (
                <div key={provider} className="p-2">
                  <h3 className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
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
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span>{model.provider}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs
                              ${model.type === 'image' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-blue-500/20 text-blue-300'}`}>
                              {model.type}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-3 max-w-[85%] ${message.speaker === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${message.speaker === 'user' 
                  ? 'bg-blue-600' 
                  : message.error 
                    ? 'bg-red-600' 
                    : 'bg-gray-700'}`}>
                {message.speaker === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Content */}
              <div className={`rounded-2xl p-4 ${message.speaker === 'user' 
                ? 'bg-blue-600 text-white' 
                : message.error 
                  ? 'bg-red-500/20 border border-red-500/30' 
                  : 'bg-white/10 border border-white/20'
                } backdrop-blur-sm`}>
                
                {/* Text Content */}
                <div className="whitespace-pre-wrap">{message.text}</div>
                
                {/* Image Content */}
                {message.image && (
                  <div className="mt-3">
                    <img 
                      src={message.image} 
                      alt="Generated image" 
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => copyToClipboard(message.image)}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-xs transition-colors">
                        Copy URL
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Streaming Indicator */}
                {message.streaming && (
                  <div className="flex items-center gap-1 mt-2 text-gray-400">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-xs">
                      {currentModel?.type === 'image' ? 'Generating image...' : 'Thinking...'}
                    </span>
                  </div>
                )}

                {/* Message Footer */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {message.speaker === 'assistant' && message.model && (
                      <>
                        <span>{models.find(m => m.id === message.model)?.name}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  
                  {message.speaker === 'assistant' && !message.streaming && !message.image && (
                    <button
                      onClick={() => copyToClipboard(message.text)}
                      className="p-1 rounded hover:bg-white/20 transition-colors">
                      {copied === message.text ? (
                        <CheckCircle size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
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
                  <Icon size={20} className="text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="text-sm">{prompt.text}</span>
                    {prompt.model && (
                      <div className="text-xs text-gray-400 mt-1">
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

      {/* Input Area - Fixed at Bottom */}
      <div className="fixed bottom-20 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentModel?.type === 'image' ? 'Describe the image you want to generate...' : 'Ask me anything...'}
              disabled={loading || !puterReady}
              rows={1}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 pr-12
                       text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ maxHeight: '120px' }}
            />
            
            {/* Model Type Indicator */}
            <div className="absolute bottom-2 right-12 text-xs text-gray-500">
              {currentModel?.type === 'image' ? '🎨 Image' : '💬 Text'}
            </div>
          </div>
          
          <button
            onClick={() => sendMessage(input, currentModel?.type === 'image')}
            disabled={loading || !input.trim() || !puterReady}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white p-3 rounded-2xl transition-colors flex items-center justify-center
                     min-w-[48px] h-12">
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : currentModel?.type === 'image' ? (
              <ImageIcon size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
          <span>
            {puterReady ? 'Free AI • No API Keys • Powered by Puter.js' : 'Connecting to AI service...'}
          </span>
        </div>
      </div>
    </div>
  );
}
