"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  FileText,
  Scale,
  Calendar,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  FolderOpen,
  Clock,
  Users,
  Gavel,
  TrendingUp,
  Target,
  Upload,
} from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import { loadCaseData, CaseData } from "@/lib/case-store";

interface CasesViewProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export const CasesView: React.FC<CasesViewProps> = ({ onNavigate, onAction }) => {
  // Load case data from localStorage (AI-generated from uploaded documents)
  const [caseData, setCaseData] = React.useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const data = loadCaseData();
    setCaseData(data);
    setIsLoading(false);
  }, []);

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [copiedPrompt, setCopiedPrompt] = React.useState<string | null>(null);
  const [showContext, setShowContext] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Initialize welcome message when case data loads
  React.useEffect(() => {
    if (caseData?.case?.caseNumber) {
      setMessages([{
        id: "welcome",
        role: "system",
        content: `Welcome to your case assistant for **${caseData.case.caseNumber}**. I can help you understand your case, prepare documents, and answer legal questions. Click a quick action or type your question below.`,
        timestamp: new Date(),
      }]);
    } else {
      setMessages([{
        id: "welcome",
        role: "system",
        content: `Welcome to your case assistant. Upload your case documents to get started, and I'll help you understand your case, prepare documents, and answer legal questions.`,
        timestamp: new Date(),
      }]);
    }
  }, [caseData]);

  // Calculate days until hearing
  const nextHearingDate = caseData?.nextHearing?.date ? new Date(caseData.nextHearing.date) : null;
  const today = new Date();
  const daysUntilHearing = nextHearingDate
    ? Math.ceil((nextHearingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dynamic prompts based on case data
  const quickPrompts = caseData?.case?.caseNumber ? [
    {
      id: "status",
      label: "Case Status",
      icon: Scale,
      prompt: `Give me a brief status update on case ${caseData.case.caseNumber}. What are the key pending matters and when is the next hearing?`,
    },
    {
      id: "hearing",
      label: "Hearing Prep",
      icon: Calendar,
      prompt: caseData.nextHearing?.date
        ? `Help me prepare for the ${new Date(caseData.nextHearing.date).toLocaleDateString()} hearing. What matters will be heard and what should I focus on?`
        : `Help me prepare for my next court hearing. What should I focus on?`,
    },
    {
      id: "strengths",
      label: "My Strengths",
      icon: TrendingUp,
      prompt: `What are my strongest arguments and evidence in this case? Identify my key advantages.`,
    },
    {
      id: "weaknesses",
      label: "Address Weaknesses",
      icon: AlertCircle,
      prompt: `What are the potential weaknesses in my case and how should I address them?`,
    },
    {
      id: "strategy",
      label: "Case Strategy",
      icon: Target,
      prompt: `Help me develop a litigation strategy for ${caseData.case.caseNumber}. What should be my priorities?`,
    },
    {
      id: "timeline",
      label: "Case Timeline",
      icon: Clock,
      prompt: `Create a chronological timeline of key events in ${caseData.case.caseNumber}, highlighting important deadlines and court decisions.`,
    },
  ] : [
    {
      id: "upload",
      label: "Upload Documents",
      icon: Upload,
      prompt: `I need help getting started. What documents should I upload first?`,
    },
    {
      id: "explain",
      label: "Explain Process",
      icon: Scale,
      prompt: `Explain how self-representation works. What are the key things I need to know?`,
    },
  ];

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Copy to clipboard and prompt to open Claude
    navigator.clipboard.writeText(inputValue);

    // Add assistant response
    const assistantMessage: ChatMessage = {
      id: `assist-${Date.now()}`,
      role: "assistant",
      content: `I've copied your question to the clipboard. Click "Open Claude AI" to chat with Claude about your case. You can paste your question there for a detailed response.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    setInputValue("");
  };

  const handleQuickPrompt = (prompt: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(prompt);

    // Add to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: `assist-${Date.now()}`,
      role: "assistant",
      content: `I've copied this prompt to your clipboard. Click "Open Claude AI" below to get a detailed answer from Claude.`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
  };

  const openClaudeAI = () => {
    window.open("https://claude.ai/new", "_blank");
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-neutral-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Case Assistant</h1>
                <p className="text-sm text-neutral-500">
                  {caseData?.case?.caseNumber
                    ? `${caseData.case.caseNumber} - Chat with AI about your case`
                    : 'Chat with AI about your legal matters'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowContext(!showContext)}
                className="gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                {showContext ? "Hide" : "Show"} Context
              </Button>
              <Button onClick={openClaudeAI} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Open Claude AI
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-3 bg-neutral-100 border-b border-neutral-200 overflow-x-auto">
          <div className="flex gap-2">
            {quickPrompts.map((item) => (
              <button
                key={item.id}
                onClick={() => handleQuickPrompt(item.prompt)}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all whitespace-nowrap"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary-600 text-white"
                        : message.role === "system"
                        ? "bg-gradient-to-br from-slate-800 to-slate-700 text-white"
                        : "bg-white border border-neutral-200 text-neutral-800"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={cn(
                        "text-xs mt-2 block",
                        message.role === "user"
                          ? "text-primary-200"
                          : message.role === "system"
                          ? "text-slate-400"
                          : "text-neutral-400"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 bg-white border-t border-neutral-200">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about your case, documents, or legal strategy..."
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()} className="gap-2">
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 text-center">
              Questions are copied to clipboard. Click "Open Claude AI" to get detailed answers.
            </p>
          </div>
        </div>
      </div>

      {/* Context Sidebar */}
      <AnimatePresence>
        {showContext && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-neutral-200 bg-white overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              {/* Case Summary - only show if case data exists */}
              {caseData?.case?.caseNumber ? (
                <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-5 h-5" />
                    <span className="font-semibold">{caseData.case.caseNumber}</span>
                  </div>
                  <p className="text-sm text-slate-300">{caseData.case.court}</p>
                  {daysUntilHearing !== null && nextHearingDate && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Next Hearing</span>
                        <span className={cn("font-semibold", daysUntilHearing <= 30 ? "text-red-400" : "text-white")}>
                          {daysUntilHearing} days
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {nextHearingDate.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-5 h-5" />
                    <span className="font-semibold">No Case Loaded</span>
                  </div>
                  <p className="text-sm text-slate-300">Upload documents to get started</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full gap-2"
                    onClick={() => onAction?.("upload-evidence")}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Documents
                  </Button>
                </div>
              )}

              {/* Pending Matters - only show if data exists */}
              {caseData?.nextHearing?.matters && caseData.nextHearing.matters.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    Matters at Hearing
                  </h3>
                  <div className="space-y-2">
                    {caseData.nextHearing.matters.map((matter, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-neutral-700 p-2 bg-neutral-50 rounded-lg">
                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium">
                          {i + 1}
                        </div>
                        <span>{matter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parties - only show if data exists */}
              {caseData?.parties && (caseData.parties.plaintiffs?.length > 0 || caseData.parties.defendants?.length > 0) && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    Parties
                  </h3>
                  <div className="space-y-2 text-sm">
                    {caseData.parties.plaintiffs?.length > 0 && (
                      <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                        <div className="font-medium text-red-800">Plaintiffs</div>
                        {caseData.parties.plaintiffs.map((p, i) => (
                          <div key={i} className="text-red-700 text-xs mt-1">
                            {p.name} {p.jurisdiction ? `(${p.jurisdiction})` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                    {caseData.parties.defendants?.length > 0 && (
                      <div className="p-2 bg-primary-50 rounded-lg border border-primary-100">
                        <div className="font-medium text-primary-800">You ({caseData.parties.defendants[0]?.designation || 'Defendant'})</div>
                        <div className="text-primary-700 text-xs mt-1">
                          {caseData.parties.defendants[0]?.name}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Your Strengths - only show if data exists */}
              {caseData?.yourStrengths && caseData.yourStrengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Your Strengths
                  </h3>
                  <ul className="space-y-1">
                    {caseData.yourStrengths.slice(0, 3).map((strength, i) => (
                      <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Their Weaknesses - only show if data exists */}
              {caseData?.theirWeaknesses && caseData.theirWeaknesses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-600" />
                    Their Weaknesses
                  </h3>
                  <ul className="space-y-1">
                    {caseData.theirWeaknesses.slice(0, 3).map((weakness, i) => (
                      <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  Quick Links
                </h3>
                <div className="space-y-1">
                  {[
                    { label: "View Documents", view: "documents" },
                    { label: "Case Timeline", view: "timeline" },
                    { label: "Deadlines", view: "deadlines" },
                    { label: "Draft Document", view: "document-drafting" },
                  ].map((link) => (
                    <button
                      key={link.view}
                      onClick={() => onNavigate?.(link.view)}
                      className="w-full flex items-center justify-between p-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Library */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-primary-600" />
                  Copy Prompts
                </h3>
                <div className="space-y-1">
                  {quickPrompts.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleCopyPrompt(item.prompt, item.id)}
                      className="w-full flex items-center justify-between p-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-neutral-400" />
                        {item.label}
                      </span>
                      {copiedPrompt === item.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
