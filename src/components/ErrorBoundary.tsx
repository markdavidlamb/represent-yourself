"use client";

import * as React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-950 text-white p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <div className="bg-red-900 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold mb-2">Error:</h2>
              <pre className="text-sm overflow-auto whitespace-pre-wrap break-words">
                {this.state.error?.message || "Unknown error"}
              </pre>
            </div>
            {this.state.error?.stack && (
              <div className="bg-red-900 rounded-lg p-4 mb-4">
                <h2 className="text-xl font-semibold mb-2">Stack trace:</h2>
                <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                  {this.state.error.stack}
                </pre>
              </div>
            )}
            {this.state.errorInfo?.componentStack && (
              <div className="bg-red-900 rounded-lg p-4 mb-4">
                <h2 className="text-xl font-semibold mb-2">Component stack:</h2>
                <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-red-900 px-6 py-2 rounded-lg font-medium hover:bg-red-100"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
