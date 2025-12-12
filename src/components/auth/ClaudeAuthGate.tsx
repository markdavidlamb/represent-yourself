"use client";

/**
 * Claude Auth Gate
 *
 * This component blocks access to the entire app until the user has
 * authenticated with Claude. The app is AI-first and cannot function
 * without an authenticated Claude session.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LogIn,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

interface ClaudeAuthGateProps {
  children: React.ReactNode;
}

export const ClaudeAuthGate: React.FC<ClaudeAuthGateProps> = ({ children }) => {
  const [isElectron, setIsElectron] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showingClaudeLogin, setShowingClaudeLogin] = React.useState(false);
  const [authCheckInterval, setAuthCheckInterval] = React.useState<NodeJS.Timeout | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Check if running in Electron and get auth status
  React.useEffect(() => {
    const hasElectronAPI = typeof window !== "undefined" && window.electronAPI?.claudeCheckAuth;
    setIsElectron(!!hasElectronAPI);

    if (hasElectronAPI) {
      checkAuthStatus();

      // Listen for auth changes
      window.electronAPI.onClaudeAuthChanged((authenticated) => {
        setIsAuthenticated(authenticated);
        if (authenticated) {
          setShowingClaudeLogin(false);
          // Stop checking when authenticated
          if (authCheckInterval) {
            clearInterval(authCheckInterval);
            setAuthCheckInterval(null);
          }
        }
      });
    } else {
      // In browser mode, we can't enforce auth but still track it
      setIsLoading(false);
    }

    return () => {
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    if (!window.electronAPI?.claudeCheckAuth) return;

    setIsLoading(true);
    try {
      const authenticated = await window.electronAPI.claudeCheckAuth();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show Claude login view
  const showClaudeLogin = async () => {
    if (!window.electronAPI?.claudeShow || !containerRef.current) return;

    // Calculate bounds for the BrowserView
    const rect = containerRef.current.getBoundingClientRect();
    await window.electronAPI.claudeShow({
      x: Math.round(rect.left + 40),
      y: Math.round(rect.top + 200),
      width: Math.round(rect.width - 80),
      height: Math.round(rect.height - 240),
    });

    setShowingClaudeLogin(true);

    // Start polling for auth status while login is showing
    const interval = setInterval(async () => {
      const authenticated = await window.electronAPI.claudeCheckAuth();
      if (authenticated) {
        setIsAuthenticated(true);
        setShowingClaudeLogin(false);
        clearInterval(interval);
        await window.electronAPI.claudeHide();
      }
    }, 2000);
    setAuthCheckInterval(interval);
  };

  // Hide Claude login
  const hideClaudeLogin = async () => {
    if (!window.electronAPI?.claudeHide) return;
    await window.electronAPI.claudeHide();
    setShowingClaudeLogin(false);

    if (authCheckInterval) {
      clearInterval(authCheckInterval);
      setAuthCheckInterval(null);
    }
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
          <p className="text-white/80 text-lg font-medium">Initializing AI...</p>
        </div>
      </div>
    );
  }

  // Browser mode - show warning but allow access (limited functionality)
  if (!isElectron) {
    return (
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm z-50">
          <AlertCircle className="inline w-4 h-4 mr-2" />
          Limited mode: For full AI features, please use the desktop app
        </div>
        <div className="pt-10">{children}</div>
      </div>
    );
  }

  // Authenticated - render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated - show auth gate
  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={showingClaudeLogin ? "login" : "welcome"}
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

              {showingClaudeLogin ? (
                <>
                  {/* Login in progress */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-200/30 border-t-primary-400 animate-spin mx-auto mb-4" />
                    <p className="text-white/80">
                      Sign in to Claude below...
                    </p>
                    <p className="text-sm text-white/50 mt-2">
                      Use your free or Pro Claude account
                    </p>
                  </div>

                  {/* Placeholder for BrowserView */}
                  <div className="h-[400px] rounded-lg bg-white/5 border border-white/10 mb-6">
                    {/* Claude BrowserView renders here via Electron */}
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={hideClaudeLogin}
                  >
                    Cancel
                  </Button>
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
                        <h3 className="font-medium text-white">AI-First Legal Help</h3>
                        <p className="text-sm text-white/60 mt-1">
                          Every feature is powered by Claude AI - from document analysis
                          to strategy recommendations.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Unlimited Power</h3>
                        <p className="text-sm text-white/60 mt-1">
                          Works best with Claude Pro or Max subscription for
                          comprehensive case analysis.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sign in button */}
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700"
                    onClick={showClaudeLogin}
                  >
                    <LogIn className="w-5 h-5" />
                    Sign in with Claude
                  </Button>

                  <p className="text-xs text-white/40 text-center mt-4">
                    Sign in with Google, Apple, or email. Free accounts welcome.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Features preview */}
          {!showingClaudeLogin && (
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
