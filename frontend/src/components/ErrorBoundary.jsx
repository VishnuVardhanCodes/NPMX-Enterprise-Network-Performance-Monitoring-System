import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Diagnostic Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[500px] w-full flex flex-col items-center justify-center bg-gray-950/50 rounded-3xl border border-red-500/20 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Module Collision Detected</h2>
          <p className="text-gray-400 mb-8 max-w-md text-center">
            A runtime exception occurred in the visualization engine. The telemetry loop has been suspended for safety.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 transition-all font-semibold"
          >
            <RefreshCcw size={18} /> Restart Module
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
