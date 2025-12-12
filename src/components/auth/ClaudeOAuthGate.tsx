"use client";

/**
 * Claude OAuth Gate
 *
 * Provides click-to-auth authentication with Claude accounts.
 * Users sign in with their Claude account (Free/Pro/Max) - no API keys needed.
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
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  isAuthenticated,
  signOut,
  getAccessToken,
} from "@/lib/claude-oauth";

interface ClaudeOAuthGateProps {
  children: React.ReactNode;
}

export const ClaudeOAuthGate: React.FC<ClaudeOAuthGateProps> = ({ children }) => {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [authCode, setAuthCode] = React.useState("");
  const [authState, setAuthState] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isExchanging, setIsExchanging] = React.useState(false);

  // Check auth status on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      // Check if we have stored tokens
      if (isAuthenticated()) {
        // Verify token is still valid by trying to get it
        const token = await getAccessToken();
        setIsAuthed(!!token);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Handle sign in click
  const handleSignIn = async () => {
    try {
      setError(null);
      const authUrl = await getAuthorizationUrl();

      // Extract state from URL for later verification
      const url = new URL(authUrl);
      const state = url.searchParams.get("state") || "";
      setAuthState(state);

      // Open auth URL in system browser
      if (typeof window !== "undefined" && window.electronAPI?.openExternal) {
        await window.electronAPI.openExternal(authUrl);
      } else {
        window.open(authUrl, "_blank");
      }

      // Show code input UI
      setShowCodeInput(true);
    } catch (err) {
      setError("Failed to start sign in flow");
      console.error("Sign in error:", err);
    }
  };

  // Handle code submission
  const handleSubmitCode = async () => {
    if (!authCode.trim()) {
      setError("Please enter the authorization code");
      return;
    }

    setIsExchanging(true);
    setError(null);

    try {
      const result = await exchangeCodeForTokens(authCode.trim(), authState);

      if (result.success) {
        setIsAuthed(true);
        setShowCodeInput(false);
        setAuthCode("");
      } else {
        setError(result.error || "Failed to complete sign in");
      }
    } catch (err) {
      setError("Failed to exchange code for token");
      console.error("Code exchange error:", err);
    } finally {
      setIsExchanging(false);
    }
  };

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Try to extract code from URL or just use the text
      if (text.includes("code=")) {
        const url = new URL(text);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (code) {
          setAuthCode(code);
          if (state) setAuthState(state);
        }
      } else {
        setAuthCode(text.trim());
      }
    } catch (err) {
      console.error("Paste error:", err);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
    setIsAuthed(false);
    setShowCodeInput(false);
    setAuthCode("");
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
          key={showCodeInput ? "code-input" : "welcome"}
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
                <p className="text-white/60">
                  AI-Powered Legal Assistant
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {showCodeInput ? (
                <>
                  {/* Code input UI */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Browser opened - sign in with Claude</span>
                    </div>

                    <p className="text-white/60 text-sm">
                      After signing in, copy the authorization code from the page and paste it below:
                    </p>

                    <div className="relative">
                      <input
                        type="text"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        placeholder="Paste authorization code here..."
                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        setShowCodeInput(false);
                        setAuthCode("");
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700"
                      onClick={handleSubmitCode}
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

                  <button
                    onClick={handleSignIn}
                    className="w-full mt-4 text-sm text-white/50 hover:text-white/70 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open sign in page again
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
                        <h3 className="font-medium text-white">Sign in with Claude</h3>
                        <p className="text-sm text-white/60 mt-1">
                          Use your existing Claude account - Free, Pro, or Max.
                          No API keys needed.
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

                  {/* Sign in button */}
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700"
                    onClick={handleSignIn}
                  >
                    <LogIn className="w-5 h-5" />
                    Sign in with Claude
                  </Button>

                  <p className="text-xs text-white/40 text-center mt-4">
                    Sign in with your Google, Apple, or email account.
                    Works with any Claude subscription.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Features preview */}
          {!showCodeInput && (
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
