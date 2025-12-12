"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Sparkles,
  MessageSquare,
  RefreshCw,
  ArrowLeft,
  LogOut,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onNavigate }) => {
  const [isElectron, setIsElectron] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showClaude, setShowClaude] = React.useState(false);
  const [claudeUrl, setClaudeUrl] = React.useState("");
  const [copiedPrompt, setCopiedPrompt] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Check if running in Electron
  React.useEffect(() => {
    const hasElectronAPI = typeof window !== "undefined" && window.electronAPI?.claudeCheckAuth;
    setIsElectron(!!hasElectronAPI);

    if (hasElectronAPI) {
      // Check initial auth status
      checkAuthStatus();

      // Listen for auth changes
      window.electronAPI.onClaudeAuthChanged((authenticated) => {
        setIsAuthenticated(authenticated);
        setIsLoading(false);
      });

      // Listen for URL changes
      window.electronAPI.onClaudeUrlChanged((url) => {
        setClaudeUrl(url);
      });
    } else {
      setIsLoading(false);
    }
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

  // Show Claude BrowserView
  const showClaudeView = async () => {
    if (!window.electronAPI?.claudeShow || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    await window.electronAPI.claudeShow({
      x: Math.round(rect.left),
      y: Math.round(rect.top) + 60, // Account for header
      width: Math.round(rect.width),
      height: Math.round(rect.height) - 60,
    });

    setShowClaude(true);
  };

  // Hide Claude BrowserView
  const hideClaudeView = async () => {
    if (!window.electronAPI?.claudeHide) return;
    await window.electronAPI.claudeHide();
    setShowClaude(false);
  };

  // Handle logout
  const handleLogout = async () => {
    if (!window.electronAPI?.claudeLogout) return;
    await window.electronAPI.claudeLogout();
    setIsAuthenticated(false);
    setShowClaude(false);
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (!window.electronAPI?.claudeReload) return;
    await window.electronAPI.claudeReload();
  };

  // Handle back
  const handleBack = async () => {
    if (!window.electronAPI?.claudeGoBack) return;
    await window.electronAPI.claudeGoBack();
  };

  // Handle prompt copy
  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  // Open in external browser (fallback for non-Electron)
  const handleOpenExternal = () => {
    window.open("https://claude.ai", "_blank");
  };

  const legalPrompts = [
    {
      id: "explain",
      title: "Explain a Document",
      prompt: "Please explain this legal document in plain English: [paste your document]",
      icon: "📄",
    },
    {
      id: "draft",
      title: "Draft a Response",
      prompt: "Help me draft a response to a court filing. The situation is: [describe your case]",
      icon: "✍️",
    },
    {
      id: "procedure",
      title: "Understand Procedure",
      prompt: "Explain the court procedure for [your jurisdiction] when [describe what you need to do]",
      icon: "📋",
    },
    {
      id: "deadlines",
      title: "Calculate Deadlines",
      prompt: "Help me calculate court deadlines. The relevant date is [date] and I need to file [document type]",
      icon: "📅",
    },
    {
      id: "hearing",
      title: "Prepare for Hearing",
      prompt: "Help me prepare for a hearing about [describe the hearing]. What should I expect and prepare?",
      icon: "⚖️",
    },
    {
      id: "analyze",
      title: "Analyze Arguments",
      prompt: "Analyze the strengths and weaknesses of this legal argument: [describe the argument]",
      icon: "🔍",
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Non-Electron fallback (browser)
  if (!isElectron) {
    return (
      <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">AI Legal Assistant</h1>
            <p className="text-sm text-neutral-500">Powered by Claude</p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-primary-50 to-indigo-50 border-primary-100 mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Chat with Claude AI
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto mb-6">
              Get AI-powered help understanding legal documents, drafting responses,
              and navigating court procedures.
            </p>
            <Button size="lg" onClick={handleOpenExternal} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Open Claude AI
              <ExternalLink className="w-4 h-4" />
            </Button>
            <p className="text-xs text-neutral-500 mt-4">
              Opens in your browser. Sign in with your Claude account.
            </p>
          </CardContent>
        </Card>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-2">
            Suggested Prompts
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
          {legalPrompts.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:border-primary-300 hover:shadow-md transition-all group"
              onClick={() => handleCopyPrompt(item.prompt, item.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                      {item.prompt}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-primary-600">
                      {copiedPrompt === item.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to copy
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Electron: Claude embedded view
  return (
    <div
      ref={containerRef}
      className="flex flex-col h-[calc(100vh-2rem)] max-w-6xl mx-auto p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Claude AI Assistant</h1>
            <div className="flex items-center gap-2 text-xs">
              {isAuthenticated ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Signed in</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-600">Sign in required</span>
                </>
              )}
            </div>
          </div>
        </div>

        {showClaude && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={hideClaudeView}>
              Back to Prompts
            </Button>
          </div>
        )}

        {!showClaude && (
          <Button onClick={showClaudeView} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {isAuthenticated ? "Open Claude" : "Sign in to Claude"}
          </Button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {showClaude ? (
          <motion.div
            key="claude-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative"
          >
            {/* Placeholder - BrowserView is rendered by Electron on top */}
            <Card className="w-full h-full bg-neutral-100 border-neutral-200">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4" />
                  <p className="text-neutral-600">
                    {isAuthenticated ? "Loading Claude..." : "Sign in to Claude to continue"}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="prompts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-primary-50 to-indigo-50 border-primary-100 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {isAuthenticated ? "Ready to help with your case" : "Sign in to get started"}
                    </h2>
                    <p className="text-neutral-600 text-sm mt-1">
                      {isAuthenticated
                        ? "Claude can help you understand documents, draft responses, and navigate procedures."
                        : "Sign in with your free or paid Claude account to chat with AI about your legal questions."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompts */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">
                Suggested Prompts
              </h3>
              <p className="text-sm text-neutral-500">
                {isAuthenticated
                  ? "Click to copy, then paste in Claude"
                  : "Sign in first, then use these prompts"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {legalPrompts.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "transition-all group",
                    isAuthenticated
                      ? "cursor-pointer hover:border-primary-300 hover:shadow-md"
                      : "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() => isAuthenticated && handleCopyPrompt(item.prompt, item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                          {item.prompt}
                        </p>
                        {isAuthenticated && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-primary-600">
                            {copiedPrompt === item.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to copy
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> AI responses are for guidance only. Always verify important legal
                information with qualified professionals or official court resources.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
