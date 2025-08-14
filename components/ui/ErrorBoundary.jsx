import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CinemaStream Error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center p-6">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <AlertTriangle size={64} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-gray-400">
                CinemaStream encountered an unexpected error. Don't worry, your data is safe!
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-300 text-sm font-mono">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                <RefreshCw size={18} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-white/20"
              >
                <Home size={18} />
                <span>Go Home</span>
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-gray-400 cursor-pointer hover:text-white text-sm">
                  Show Error Details (Dev Mode)
                </summary>
                <div className="mt-2 p-4 bg-black/50 rounded-lg">
                  <pre className="text-xs text-red-300 overflow-auto max-h-40">
                    {this.state.error && this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;