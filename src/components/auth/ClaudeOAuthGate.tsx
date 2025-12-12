"use client";

/**
 * Claude Auth Gate
 *
 * Streamlined API key authentication for Claude.
 * OAuth is not available for third-party apps.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LogIn,
  Shield,
  Zap,
  ExternalLink,
  Clipboard,
  RefreshCw,
  Key,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

// Storage key for API key
const API_KEY_STORAGE = "anthropic_api_key";

interface ClaudeOAuthGateProps {
  children: React.ReactNode;
}

export const ClaudeOAuthGate: React.FC<ClaudeOAuthGateProps> = ({ children }) => {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showKeyInput, setShowKeyInput] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  // Check auth status on mount
  React.useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE);
    if (storedKey) {
      setIsAuthed(true);
    }
    setIsLoading(false);
  }, []);

  // Validate API key with Anthropic
  const validateAndSaveKey = async (key: string) => {
    setIsValidating(true);
    setError(null);

    try {
      // Test the key with a minimal request
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });

      if (response.ok || response.status === 400) {
        // 400 can happen with valid key but bad request - key is valid
        localStorage.setItem(API_KEY_STORAGE, key);
        setIsAuthed(true);
        setShowKeyInput(false);
        setApiKey("");
      } else if (response.status === 401) {
        setError("Invalid API key. Please check and try again.");
      } else {
        // Other errors - save anyway, user can retry later
        localStorage.setItem(API_KEY_STORAGE, key);
        setIsAuthed(true);
      }
    } catch (err) {
      // Network error - save anyway
      localStorage.setItem(API_KEY_STORAGE, key);
      setIsAuthed(true);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle connect click - open Anthropic console
  const handleConnect = async () => {
    setError(null);
    const url = "https://console.anthropic.com/settings/keys";

    // Try to open the URL
    try {
      // Method 1: Anchor tag (works in Electron)
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Method 2: window.open
      window.open(url, "_blank");
    }

    // Show key input UI
    setShowKeyInput(true);
  };

  // Handle paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setApiKey(text.trim());
      }
    } catch {
      // User will type manually
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }
    if (!apiKey.startsWith("sk-ant-")) {
      setError("API key should start with sk-ant-");
      return;
    }
    validateAndSaveKey(apiKey.trim());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-primary-200/30 border-t-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated - render children
  if (isAuthed) {
    return <>{children}</>;
  }

  // Not authenticated - show auth gate
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={showKeyInput ? "key-input" : "welcome"}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-xl w-full"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Represent Yourself
                </h1>
                <p className="text-white/60">AI-Powered Legal Assistant</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {showKeyInput ? (
                <>
                  {/* Key input UI */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Anthropic Console opened in browser</span>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm text-white/70">
                      <p className="font-medium text-white">Quick steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Sign in to Anthropic (create free account if needed)</li>
                        <li>Click <span className="text-primary-300">"Create Key"</span></li>
                        <li>Copy the key (starts with sk-ant-...)</li>
                        <li>Paste it below</li>
                      </ol>
                    </div>

                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="sk-ant-api03-..."
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handlePaste}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        title="Paste from clipboard"
                      >
                        <Clipboard className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setShowKeyInput(false);
                        setApiKey("");
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700"
                      onClick={handleSubmit}
                      disabled={isValidating || !apiKey.trim()}
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>

                  <button
                    onClick={handleConnect}
                    className="w-full mt-4 text-sm text-white/50 hover:text-white/70 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Anthropic Console again
                  </button>
                </>
              ) : (
                <>
                  {/* Welcome content */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Connect with Claude</h3>
                        <p className="text-sm text-white/60 mt-1">
                          One-time setup: create a free API key at Anthropic.
                          Takes less than a minute.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">AI-Powered Legal Help</h3>
                        <p className="text-sm text-white/60 mt-1">
                          Document analysis, case strategy, and drafting assistance
                          powered by Claude AI.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connect button */}
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700"
                    onClick={handleConnect}
                  >
                    <LogIn className="w-5 h-5" />
                    Connect with Claude
                  </Button>

                  <p className="text-xs text-white/40 text-center mt-4">
                    Free tier available. Your key is stored locally on your device.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Features preview */}
          {!showKeyInput && (
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: "📄", label: "Analyze Documents" },
                { icon: "⚖️", label: "Case Strategy" },
                { icon: "📝", label: "Draft Responses" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-4 rounded-xl bg-white/5 backdrop-blur"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-xs text-white/60 mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
