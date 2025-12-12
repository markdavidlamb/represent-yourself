"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Dashboard } from "@/components/views/Dashboard";
import { CaseOverview } from "@/components/views/CaseOverview";
import { DocumentDrafting } from "@/components/views/DocumentDrafting";
import { PlainLanguageTranslator } from "@/components/views/PlainLanguageTranslator";
import { ProcedureGuide } from "@/components/views/ProcedureGuide";
import { DiscoveryHelper } from "@/components/views/DiscoveryHelper";
import { MotionResponseWizard } from "@/components/views/MotionResponseWizard";
import { DeadlineCalculator } from "@/components/views/DeadlineCalculator";
import { TimelineBuilder } from "@/components/views/TimelineBuilder";
import { EvidenceManager } from "@/components/views/EvidenceManager";
import { CaseAnalyzer } from "@/components/views/CaseAnalyzer";
import { LegalGPS } from "@/components/views/LegalGPS";
import { DocumentGenerator } from "@/components/views/DocumentGenerator";
import { OpponentIntelligence } from "@/components/views/OpponentIntelligence";
import { SettlementCalculator } from "@/components/views/SettlementCalculator";
import { HearingSimulator } from "@/components/views/HearingSimulator";
import { BundleGenerator } from "@/components/views/BundleGenerator";
import { RiskScorecard } from "@/components/views/RiskScorecard";
import { SettingsView } from "@/components/views/SettingsView";
import { AIAssistant } from "@/components/views/AIAssistant";
import { CasesView } from "@/components/views/CasesView";
import { ClaudeOAuthGate } from "@/components/auth/ClaudeOAuthGate";
import { CaseOnboarding } from "@/components/onboarding/CaseOnboarding";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { hasCompletedSetup, markSetupComplete, CaseData } from "@/lib/case-store";
import { cn } from "@/lib/utils";

// View type
type ViewId =
  | "dashboard"
  | "cases"
  | "documents"
  | "all-docs"
  | "drafts"
  | "filed"
  | "evidence"
  | "timeline"
  | "deadlines"
  | "inbox"
  | "arguments"
  | "rules"
  | "hearing-prep"
  | "costs"
  | "ai-assistant"
  | "help"
  | "settings"
  | "new-document"
  | "document-drafting"
  | "translator"
  | "procedures"
  | "discovery"
  | "motion-response"
  | "evidence-manager"
  | "case-analyzer"
  | "legal-gps"
  | "doc-generator"
  | "opponent-intel"
  | "settlement"
  | "hearing-sim"
  | "bundles"
  | "risk-score";

export default function Home() {
  // State
  const [activeView, setActiveView] = React.useState<ViewId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [setupComplete, setSetupComplete] = React.useState<boolean | null>(null);

  // Check if setup is complete on mount
  React.useEffect(() => {
    setSetupComplete(hasCompletedSetup());
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = (caseData: CaseData) => {
    markSetupComplete();
    setSetupComplete(true);
    // Navigate to dashboard after setup
    setActiveView("dashboard");
  };

  // Handle navigation
  const handleNavigate = (view: string) => {
    setActiveView(view as ViewId);
  };

  // Handle actions from components
  const handleAction = (action: string, data?: any) => {
    console.log("Action:", action, data);

    switch (action) {
      case "new-document":
      case "new-doc":
      case "new-affidavit":
        setActiveView("document-drafting");
        break;
      case "analyze-doc":
        setActiveView("evidence-manager");
        break;
      case "upload-evidence":
        setActiveView("evidence-manager");
        break;
      case "ai-help":
      case "ai-chat":
        setActiveView("ai-assistant");
        break;
      case "new-case":
        setActiveView("cases");
        break;
      case "upload":
        setActiveView("evidence-manager");
        break;
      default:
        console.log("Unhandled action:", action);
    }
  };

  // Handle command palette selection
  const handleCommandSelect = (item: any) => {
    switch (item.id) {
      case "new-case":
        setActiveView("cases");
        break;
      case "new-doc":
        setActiveView("document-drafting");
        break;
      case "analyze":
        setActiveView("evidence-manager");
        break;
      case "ai-chat":
        setActiveView("ai-assistant");
        break;
      case "nav-cases":
        setActiveView("cases");
        break;
      case "nav-docs":
        setActiveView("documents");
        break;
      case "nav-timeline":
        setActiveView("timeline");
        break;
      case "nav-deadlines":
        setActiveView("deadlines");
        break;
      case "nav-inbox":
        setActiveView("inbox");
        break;
      case "nav-arguments":
        setActiveView("arguments");
        break;
      case "nav-settings":
        setActiveView("settings");
        break;
      case "tpl-affidavit":
      case "tpl-submission":
      case "tpl-skeleton":
      case "tpl-letter":
      case "tpl-notice":
        setActiveView("document-drafting");
        break;
      default:
        console.log("Command:", item.id);
    }
  };

  // Handle sidebar item selection
  const handleSidebarSelect = (id: string) => {
    switch (id) {
      case "new-document":
        setActiveView("document-drafting");
        break;
      case "ai-assistant":
        setActiveView("ai-assistant");
        break;
      default:
        setActiveView(id as ViewId);
    }
  };

  // Render current view
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <CaseOverview onNavigate={handleNavigate} onAction={handleAction} />;
      case "document-drafting":
      case "new-document":
      case "drafts":
        return <DocumentDrafting onNavigate={handleNavigate} onAction={handleAction} />;
      case "translator":
        return <PlainLanguageTranslator onNavigate={handleNavigate} onAction={handleAction} />;
      case "rules":
      case "procedures":
        return <ProcedureGuide onNavigate={handleNavigate} onAction={handleAction} />;
      case "discovery":
      case "inbox":
        return <DiscoveryHelper onNavigate={handleNavigate} onAction={handleAction} />;
      case "motion-response":
      case "hearing-prep":
        return <MotionResponseWizard onNavigate={handleNavigate} onAction={handleAction} />;
      case "deadlines":
      case "costs":
        return <DeadlineCalculator onNavigate={handleNavigate} onAction={handleAction} />;
      case "timeline":
        return <TimelineBuilder onNavigate={handleNavigate} onAction={handleAction} />;
      case "evidence":
      case "evidence-manager":
      case "documents":
      case "all-docs":
      case "filed":
        return <EvidenceManager onNavigate={handleNavigate} onAction={handleAction} />;
      case "case-analyzer":
        return <CaseAnalyzer onNavigate={handleNavigate} onAction={handleAction} />;
      case "legal-gps":
        return <LegalGPS onNavigate={handleNavigate} onAction={handleAction} />;
      case "doc-generator":
        return <DocumentGenerator onNavigate={handleNavigate} onAction={handleAction} />;
      case "opponent-intel":
        return <OpponentIntelligence onNavigate={handleNavigate} onAction={handleAction} />;
      case "settlement":
        return <SettlementCalculator onNavigate={handleNavigate} onAction={handleAction} />;
      case "hearing-sim":
        return <HearingSimulator onNavigate={handleNavigate} onAction={handleAction} />;
      case "bundles":
        return <BundleGenerator onNavigate={handleNavigate} onAction={handleAction} />;
      case "risk-score":
        return <RiskScorecard onNavigate={handleNavigate} onAction={handleAction} />;
      case "cases":
        return <CasesView onNavigate={handleNavigate} onAction={handleAction} />;
      case "arguments":
        return (
          <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Argument Mapper</h1>
            <p className="text-neutral-500">
              Map your arguments against theirs. Feature coming soon.
            </p>
          </div>
        );
      case "ai-assistant":
        return <AIAssistant onNavigate={handleNavigate} onAction={handleAction} />;
      case "help":
        return (
          <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Help & Guide</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "Getting Started",
                  description: "Learn the basics of using Represent Yourself",
                  icon: "🚀",
                },
                {
                  title: "Understanding Court Procedures",
                  description: "Step-by-step guides for common procedures",
                  icon: "📋",
                  onClick: () => setActiveView("procedures"),
                },
                {
                  title: "Drafting Documents",
                  description: "How to create legal documents with AI",
                  icon: "📝",
                  onClick: () => setActiveView("document-drafting"),
                },
                {
                  title: "Managing Evidence",
                  description: "Organize and bundle your exhibits",
                  icon: "📁",
                  onClick: () => setActiveView("evidence-manager"),
                },
                {
                  title: "Timeline & Deadlines",
                  description: "Track important dates and events",
                  icon: "📅",
                  onClick: () => setActiveView("deadlines"),
                },
                {
                  title: "Legal Terminology",
                  description: "Translate legal jargon to plain English",
                  icon: "🔤",
                  onClick: () => setActiveView("translator"),
                },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={item.onClick}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200 text-left hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="font-medium text-neutral-900">{item.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case "settings":
        return <SettingsView />;
      default: {
        const view = activeView as string;
        return (
          <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-4">
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </h1>
            <p className="text-neutral-500">This view is coming soon.</p>
          </div>
        );
      }
    }
  };

  // Loading state while checking setup status
  if (setupComplete === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200/30 border-t-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ClaudeOAuthGate>
        {/* Show onboarding if setup not complete */}
        {!setupComplete ? (
          <CaseOnboarding onComplete={handleOnboardingComplete} />
        ) : (
          <div className="flex h-screen bg-neutral-50">
            {/* Sidebar */}
            <Sidebar
              activeItem={activeView}
              onItemSelect={handleSidebarSelect}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Command Palette */}
            <CommandPalette
              open={commandPaletteOpen}
              onOpenChange={setCommandPaletteOpen}
              onSelect={handleCommandSelect}
            />
          </div>
        )}
      </ClaudeOAuthGate>
    </ErrorBoundary>
  );
}
