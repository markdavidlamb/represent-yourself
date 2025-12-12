"use client";

/**
 * Claude Auth Gate
 *
 * Provides OAuth authentication with Claude (like Claude Code).
 * Falls back to API key if OAuth fails.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LogIn,
  CheckCircle,
  Shield,
  Zap,
  ExternalLink,
  Clipboard,
  RefreshCw,
  Key,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  isOAuthAuthenticated,
  clearTokens,
} from "@/lib/claude-oauth";

// Storage key for API key fallback
const API_KEY_STORAGE = "anthropic_api_key";

interface ClaudeOAuthGateProps {
  children: React.ReactNode;
}

type AuthMode = "welcome" | "oauth-pending" | "api-key-fallback";

export const ClaudeOAuthGate: React.FC<ClaudeOAuthGateProps> = ({ children }) => {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [authMode, setAuthMode] = React.useState<AuthMode>("welcome");
  const [authCode, setAuthCode] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isExchanging, setIsExchanging] = React.useState(false);

  // Check auth status on mount
  React.useEffect(() => {
    const hasOAuth = isOAuthAuthenticated();
    const hasApiKey = localStorage.getItem(API_KEY_STORAGE);
    if (hasOAuth || hasApiKey) {
      setIsAuthed(true);
    }
    setIsLoading(false);
  }, []);

  // Handle OAuth connect click
  const handleOAuthConnect = async () => {
    setError(null);
    try {
      const { url } = await getAuthorizationUrl();

      // Open in system browser - try multiple methods
      let opened = false;

      // Try Electron API first
      if (typeof window !== "undefined" && window.electronAPI?.openExternal) {
        try {
          await window.electronAPI.openExternal(url);
          opened = true;
        } catch (e) {
          console.error("Electron openExternal failed:", e);
        }
      }

      // Fallback to window.open
      if (!opened) {
        const newWindow = window.open(url, "_blank");
        if (!newWindow) {
          // If popup blocked, show the URL to copy
          setError(`Please open this URL manually: ${url}`);
          return;
        }
      }

      setAuthMode("oauth-pending");
    } catch (err) {
      console.error("OAuth start error:", err);
      setError("Failed to start authentication. Please try again.");
    }
  };

  // Handle OAuth code submission
  const handleCodeSubmit = async () => {
    if (!authCode.trim()) {
      setError("Please enter the authorization code");
      return;
    }

    setIsExchanging(true);
    setError(null);

    try {
      await exchangeCodeForTokens(authCode.trim());
      setIsAuthed(true);
      setAuthCode("");
      setAuthMode("welcome");
    } catch (err: any) {
      console.error("OAuth exchange error:", err);
      // Show error but offer API key fallback
      setError(
        `OAuth failed: ${err.message || "Unknown error"}. You can use an API key instead.`
      );
    } finally {
      setIsExchanging(false);
    }
  };

  // Handle paste for auth code
  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        // Strip any fragment identifier from the code
        const cleanCode = text.trim().split("#")[0];
        setAuthCode(cleanCode);
      }
    } catch {
      // User will type manually
    }
  };

  // Handle API key fallback
  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }
    if (!apiKey.startsWith("sk-ant-")) {
      setError("API key should start with sk-ant-");
      return;
    }
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    setIsAuthed(true);
    setApiKey("");
    setAuthMode("welcome");
  };

  // Handle paste for API key
  const handlePasteApiKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setApiKey(text.trim());
      }
    } catch {
      // User will type manually
    }
  };

  // Switch to API key fallback mode
  const switchToApiKeyMode = () => {
    setAuthMode("api-key-fallback");
    setError(null);
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
          key={authMode}
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

              {authMode === "welcome" && (
                <>
                  {/* Welcome content */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Sign in with Claude</h3>
                        <p className="text-sm text-white/60 mt-1">
                          Quick one-click authentication with your Claude account.
                          No API key needed.
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
                    onClick={handleOAuthConnect}
                  >
                    <LogIn className="w-5 h-5" />
                    Sign in with Claude
                  </Button>

                  <button
                    onClick={switchToApiKeyMode}
                    className="w-full mt-4 text-sm text-white/50 hover:text-white/70 flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Use API key instead
                  </button>
                </>
              )}

              {authMode === "oauth-pending" && (
                <>
                  {/* OAuth code input */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Browser opened - sign in with Claude</span>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm text-white/70">
                      <p className="font-medium text-white">After signing in:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Click "Allow" to authorize the app</li>
                        <li>Copy the authorization code shown</li>
                        <li>Paste it below</li>
                      </ol>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        placeholder="Paste authorization code here..."
                        className="w-full pl-4 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                      />
                      <button
                        onClick={handlePasteCode}
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
                        setAuthMode("welcome");
                        setAuthCode("");
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700"
                      onClick={handleCodeSubmit}
                      disabled={isExchanging || !authCode.trim()}
                    >
                      {isExchanging ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 flex gap-4 justify-center">
                    <button
                      onClick={handleOAuthConnect}
                      className="text-sm text-white/50 hover:text-white/70 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open sign in page again
                    </button>
                    <button
                      onClick={switchToApiKeyMode}
                      className="text-sm text-white/50 hover:text-white/70 flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Use API key
                    </button>
                  </div>
                </>
              )}

              {authMode === "api-key-fallback" && (
                <>
                  {/* API Key input */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm text-white/70">
                      <p className="font-medium text-white">Get an API key:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to console.anthropic.com</li>
                        <li>Sign in or create an account</li>
                        <li>Navigate to API Keys</li>
                        <li>Create a new key and copy it</li>
                      </ol>
                    </div>

                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-ant-api03-..."
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                      />
                      <button
                        onClick={handlePasteApiKey}
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
                        setAuthMode("welcome");
                        setApiKey("");
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700"
                      onClick={handleApiKeySubmit}
                      disabled={!apiKey.trim()}
                    >
                      Connect
                    </Button>
                  </div>

                  <button
                    onClick={() => {
                      window.open("https://console.anthropic.com/settings/keys", "_blank");
                    }}
                    className="w-full mt-4 text-sm text-white/50 hover:text-white/70 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Anthropic Console
                  </button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Features preview */}
          {authMode === "welcome" && (
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
