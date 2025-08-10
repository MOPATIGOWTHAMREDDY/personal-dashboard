import React, { useState, useEffect, useRef } from 'react';

const PuterClaudeChat = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-nano'); // Default as per docs
  const [isStreaming, setIsStreaming] = useState(false);
  const [puterLoaded, setPuterLoaded] = useState(false);
  const [error, setError] = useState('');
  const responseRef = useRef(null);

  // Load Puter.js script
  useEffect(() => {
    if (window.puter) {
      setPuterLoaded(true);
      console.log('✅ Puter.js already loaded');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.onload = () => {
      setPuterLoaded(true);
      console.log('✅ Puter.js loaded successfully');
    };
    script.onerror = () => {
      setError('❌ Failed to load Puter.js library');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Handle regular (non-streaming) chat - Following documentation pattern
  const handleRegularChat = async () => {
    if (!message.trim() || !puterLoaded) return;

    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      console.log('🚀 Sending message:', message);
      console.log('📋 Using model:', selectedModel);
      
      // Use the exact API format from documentation
      const result = await window.puter.ai.chat(message, { model: selectedModel });
      
      console.log('📦 API Response:', result);

      // According to docs, response should be directly usable
      if (typeof result === 'string') {
        setResponse(result);
      } else if (result && typeof result === 'object') {
        // Handle object responses - look for common properties
        const responseText = result.message?.content?.[0]?.text || 
                           result.message?.content || 
                           result.content || 
                           result.text ||
                           JSON.stringify(result, null, 2);
        setResponse(responseText);
      } else {
        setResponse('Received unexpected response format');
        console.warn('Unexpected response:', result);
      }

    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Handle error according to the pattern seen in your logs
      let errorMessage = 'Unknown error occurred';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error.error) {
        errorMessage = error.error.message || JSON.stringify(error.error);
      }
      
      setError(`API Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle streaming chat - Following documentation example
  const handleStreamingChat = async () => {
    if (!message.trim() || !puterLoaded) return;

    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      console.log('🌊 Starting streaming for:', message);
      console.log('📋 Using model:', selectedModel);
      
      // Use exact streaming format from documentation
      const result = await window.puter.ai.chat(message, { 
        model: selectedModel, 
        stream: true 
      });

      console.log('📦 Streaming object:', result);

      let accumulatedResponse = '';
      
      // Follow the documentation pattern: for await (const part of result)
      if (result && typeof result[Symbol.asyncIterator] === 'function') {
        for await (const part of result) {
          console.log('🔄 Stream part:', part);
          // Documentation shows part?.text pattern
          if (part?.text) {
            accumulatedResponse += part.text;
            setResponse(accumulatedResponse);
          }
        }
      } else {
        throw new Error('Streaming response is not iterable');
      }

      console.log('✅ Streaming completed');

    } catch (error) {
      console.error('❌ Streaming Error:', error);
      
      let errorMessage = 'Streaming failed';
      if (error.message) {
        errorMessage = error.message;
      }
      
      setError(`Streaming Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll response area
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStreaming) {
      handleStreamingChat();
    } else {
      handleRegularChat();
    }
  };

  const clearChat = () => {
    setMessage('');
    setResponse('');
    setError('');
  };

  // Simple connection test using documentation example
  const testConnection = async () => {
    if (!puterLoaded) {
      setError('Puter.js not loaded yet');
      return;
    }

    setError('Testing connection...');

    try {
      // Use the simplest example from documentation
      const result = await window.puter.ai.chat('What is life?');
      console.log('✅ Connection test result:', result);
      setError('✅ Connection successful! API is working.');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setError(`Connection failed: ${error.message || 'Unknown error'}`);
    }
  };

  if (!puterLoaded && !error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <span className="text-lg text-gray-600">Loading Puter.js...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center">
          <span className="mr-3 text-5xl">🤖</span>
          Puter.js AI Chat
        </h1>
        <p className="text-lg text-gray-600">Free access to multiple AI models</p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          No API keys • User pays model
        </div>
      </div>

      {/* Debug Panel */}
      <div className="bg-white/90 backdrop-blur rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <button 
            onClick={testConnection}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            🔧 Test Connection
          </button>
          <div className="text-sm text-gray-600">
            Status: <span className={`font-medium ${puterLoaded ? 'text-green-600' : 'text-red-600'}`}>
              {puterLoaded ? '✅ Ready' : '❌ Loading'}
            </span>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white/90 backdrop-blur rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model:
            </label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="gpt-4.1-nano">GPT-4.1 Nano (Default)</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="claude-sonnet-4">Claude Sonnet 4</option>
              <option value="claude-opus-4">Claude Opus 4</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="deepseek-chat">DeepSeek Chat</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isStreaming}
                onChange={(e) => setIsStreaming(e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">🌊 Stream Response</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Try: 'What is life?' or 'Explain quantum computing simply'"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-24 bg-white"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button 
            type="submit" 
            disabled={isLoading || !message.trim() || !puterLoaded}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                🤔 AI Thinking...
              </>
            ) : (
              '💭 Send Message'
            )}
          </button>
          
          <button 
            type="button" 
            onClick={clearChat}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className={`rounded-xl p-4 mb-6 border ${
          error.includes('✅') 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            <span className="text-xl mr-3">
              {error.includes('✅') ? '✅' : '⚠️'}
            </span>
            <div>
              <h3 className={`font-semibold mb-1 ${
                error.includes('✅') ? 'text-green-800' : 'text-red-800'
              }`}>
                {error.includes('✅') ? 'Success' : 'Error'}
              </h3>
              <p className={`text-sm ${
                error.includes('✅') ? 'text-green-700' : 'text-red-700'
              }`}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="bg-white/90 backdrop-blur rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🤖</span>
            <h3 className="text-lg font-semibold text-gray-800">AI Response:</h3>
          </div>
          <div 
            ref={responseRef}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto whitespace-pre-wrap text-gray-800 leading-relaxed"
          >
            {response}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Powered by{' '}
          <a 
            href="https://developer.puter.com" 
            className="text-blue-500 hover:text-blue-600 underline" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Puter
          </a>
        </p>
      </div>
    </div>
  );
};

export default PuterClaudeChat;
