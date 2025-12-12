"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Scale,
  Mail,
  MessageSquare,
  ListOrdered,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  Download,
  Copy,
  Eye,
  Edit3,
  Loader2,
  Settings,
} from "lucide-react";
import { generateLegalDocument, hasApiKey, getProvider, PROVIDERS } from "@/lib/ai-service";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Document templates
const documentTemplates = [
  {
    id: "affidavit",
    name: "Affidavit / Affirmation",
    description: "A sworn statement of facts you personally know to be true",
    icon: <Scale className="w-6 h-6" />,
    helpText: "Best for: Presenting evidence, supporting applications, proving service",
    sections: ["Title", "Introduction", "Facts", "Conclusion", "Signature"],
    estimatedTime: "15-30 min",
  },
  {
    id: "submission",
    name: "Written Submission",
    description: "Structured legal arguments for the court",
    icon: <FileText className="w-6 h-6" />,
    helpText: "Best for: Hearings, making legal arguments, citing case law",
    sections: ["Introduction", "Background", "Issues", "Arguments", "Conclusion"],
    estimatedTime: "30-60 min",
  },
  {
    id: "skeleton",
    name: "Skeleton Argument",
    description: "Concise outline of your key legal points",
    icon: <ListOrdered className="w-6 h-6" />,
    helpText: "Best for: Complex hearings, appeals, summarizing arguments",
    sections: ["Issues", "Key Authorities", "Arguments", "Conclusions"],
    estimatedTime: "20-40 min",
  },
  {
    id: "letter",
    name: "Letter to Court",
    description: "Formal correspondence with the court registry",
    icon: <Mail className="w-6 h-6" />,
    helpText: "Best for: Requests, notifications, administrative matters",
    sections: ["Salutation", "Body", "Request", "Closing"],
    estimatedTime: "10-15 min",
  },
  {
    id: "response",
    name: "Response / Reply",
    description: "Respond to opponent's submissions or applications",
    icon: <MessageSquare className="w-6 h-6" />,
    helpText: "Best for: Opposing applications, replying to claims",
    sections: ["Introduction", "Response to Points", "Counter-Arguments", "Conclusion"],
    estimatedTime: "30-45 min",
  },
];

// Wizard steps
type Step = "select-type" | "case-info" | "gather-facts" | "ai-draft" | "review-edit" | "export";

interface WizardState {
  step: Step;
  documentType: string | null;
  caseInfo: {
    caseNumber: string;
    court: string;
    yourRole: string;
    opposingParty: string;
  };
  facts: string[];
  keyPoints: string[];
  generatedDraft: string;
  isGenerating: boolean;
}

interface DocumentDraftingProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
  onComplete?: (document: { type: string; content: string }) => void;
  onCancel?: () => void;
}

export const DocumentDrafting: React.FC<DocumentDraftingProps> = ({
  onNavigate,
  onAction,
  onComplete,
  onCancel,
}) => {
  const [state, setState] = React.useState<WizardState>({
    step: "select-type",
    documentType: null,
    caseInfo: {
      caseNumber: "",
      court: "",
      yourRole: "Plaintiff",
      opposingParty: "",
    },
    facts: [""],
    keyPoints: [""],
    generatedDraft: "",
    isGenerating: false,
  });

  const steps: { id: Step; label: string }[] = [
    { id: "select-type", label: "Document Type" },
    { id: "case-info", label: "Case Details" },
    { id: "gather-facts", label: "Your Facts" },
    { id: "ai-draft", label: "AI Drafting" },
    { id: "review-edit", label: "Review & Edit" },
    { id: "export", label: "Export" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === state.step);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setState((s) => ({ ...s, step: steps[nextIndex].id }));
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setState((s) => ({ ...s, step: steps[prevIndex].id }));
    }
  };

  const selectDocumentType = (typeId: string) => {
    setState((s) => ({ ...s, documentType: typeId }));
    goNext();
  };

  const updateCaseInfo = (field: keyof WizardState["caseInfo"], value: string) => {
    setState((s) => ({
      ...s,
      caseInfo: { ...s.caseInfo, [field]: value },
    }));
  };

  const addFact = () => {
    setState((s) => ({ ...s, facts: [...s.facts, ""] }));
  };

  const updateFact = (index: number, value: string) => {
    setState((s) => ({
      ...s,
      facts: s.facts.map((f, i) => (i === index ? value : f)),
    }));
  };

  const removeFact = (index: number) => {
    setState((s) => ({
      ...s,
      facts: s.facts.filter((_, i) => i !== index),
    }));
  };

  const [error, setError] = React.useState<string | null>(null);

  const generateDraft = async () => {
    // Check for API key
    if (!hasApiKey()) {
      setError("Please add an API key in Settings before generating documents.");
      return;
    }

    setState((s) => ({ ...s, isGenerating: true }));
    setError(null);

    try {
      const documentType = state.documentType as "affidavit" | "submission" | "skeleton" | "letter" | "response";
      const draft = await generateLegalDocument(
        documentType,
        state.caseInfo,
        state.facts
      );

      setState((s) => ({
        ...s,
        isGenerating: false,
        generatedDraft: draft,
        step: "review-edit",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate document");
      setState((s) => ({ ...s, isGenerating: false }));
    }
  };

  const selectedTemplate = documentTemplates.find((t) => t.id === state.documentType);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    index < currentStepIndex
                      ? "bg-primary-600 text-white"
                      : index === currentStepIndex
                      ? "bg-primary-100 text-primary-700 ring-2 ring-primary-600"
                      : "bg-neutral-100 text-neutral-400"
                  )}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium hidden sm:block",
                    index <= currentStepIndex ? "text-neutral-900" : "text-neutral-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    index < currentStepIndex ? "bg-primary-600" : "bg-neutral-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Select Document Type */}
          {state.step === "select-type" && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                What type of document do you need?
              </h2>
              <p className="text-neutral-500 mb-6">
                Select the type of legal document you want to create. We'll guide you through each step.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    className={cn(
                      "flex flex-col items-start p-5 rounded-xl border-2 text-left",
                      "transition-all duration-200",
                      "hover:border-primary-300 hover:bg-primary-50/50",
                      state.documentType === template.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 bg-white"
                    )}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectDocumentType(template.id)}
                  >
                    <div className="flex items-start gap-4 w-full">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">{template.name}</h3>
                        <p className="text-sm text-neutral-500 mt-1">{template.description}</p>
                        <p className="text-xs text-primary-600 mt-2">{template.helpText}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="default" size="sm">
                            <Clock className="w-3 h-3 mr-1" />
                            {template.estimatedTime}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Case Information */}
          {state.step === "case-info" && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Tell us about your case
              </h2>
              <p className="text-neutral-500 mb-6">
                This information will be used in the document header.
              </p>

              <Card>
                <CardContent className="space-y-4 pt-4">
                  <Input
                    label="Case Number"
                    placeholder="e.g., HCA 1646/2023"
                    value={state.caseInfo.caseNumber}
                    onChange={(e) => updateCaseInfo("caseNumber", e.target.value)}
                    description="Found on your court documents"
                  />

                  <Input
                    label="Court"
                    placeholder="e.g., High Court of Hong Kong"
                    value={state.caseInfo.court}
                    onChange={(e) => updateCaseInfo("court", e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Your Role in the Case
                    </label>
                    <div className="flex gap-3">
                      {["Plaintiff", "Defendant", "Applicant", "Respondent"].map((role) => (
                        <button
                          key={role}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            state.caseInfo.yourRole === role
                              ? "bg-primary-100 text-primary-700 ring-2 ring-primary-500"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                          )}
                          onClick={() => updateCaseInfo("yourRole", role)}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Opposing Party Name(s)"
                    placeholder="e.g., Liquidity Technologies Ltd"
                    value={state.caseInfo.opposingParty}
                    onChange={(e) => updateCaseInfo("opposingParty", e.target.value)}
                    description="The other side in your case"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Gather Facts */}
          {state.step === "gather-facts" && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                {selectedTemplate?.id === "affidavit"
                  ? "What facts do you want to state?"
                  : "What are your key points?"}
              </h2>
              <p className="text-neutral-500 mb-6">
                {selectedTemplate?.id === "affidavit"
                  ? "List the facts you personally know. Each fact should be something you witnessed or did yourself."
                  : "List the main points or arguments you want to make in this document."}
              </p>

              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {state.facts.map((fact, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm font-medium text-neutral-400">
                          {index + 1}.
                        </span>
                        <Input
                          placeholder={
                            selectedTemplate?.id === "affidavit"
                              ? "e.g., On 15 January 2024, I received an email from..."
                              : "e.g., The plaintiff failed to provide evidence of..."
                          }
                          value={fact}
                          onChange={(e) => updateFact(index, e.target.value)}
                          className="flex-1"
                        />
                        {state.facts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFact(index)}
                            className="text-neutral-400 hover:text-error-main"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={addFact}
                    icon={<span className="text-lg">+</span>}
                  >
                    Add Another Point
                  </Button>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Tips for strong points:</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• Be specific with dates, names, and amounts</li>
                          <li>• For affidavits: Only state what you personally know</li>
                          <li>• Reference any documents or evidence you have</li>
                          <li>• Keep each point focused on one topic</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: AI Drafting */}
          {state.step === "ai-draft" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-primary-200">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Ready to generate your {selectedTemplate?.name}?
              </h2>
              <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                Our AI will create a professionally formatted draft based on your inputs.
                You can edit everything in the next step.
              </p>

              {/* Show current AI provider */}
              <div className="mb-6 flex items-center justify-center gap-2 text-sm">
                <span className="text-neutral-400">Powered by</span>
                <Badge variant="primary" size="sm">
                  {PROVIDERS.find(p => p.id === getProvider())?.name || "Claude"}
                </Badge>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                  <div className="flex items-start gap-2 text-left">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                      {!hasApiKey() && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          icon={<Settings className="w-4 h-4" />}
                          onClick={() => onNavigate?.("settings")}
                        >
                          Go to Settings
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!hasApiKey() && !error && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                  <div className="flex items-start gap-2 text-left">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">API Key Required</p>
                      <p className="text-sm text-amber-700">
                        Add your Claude or OpenAI API key in Settings to enable AI document generation.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        icon={<Settings className="w-4 h-4" />}
                        onClick={() => onNavigate?.("settings")}
                      >
                        Go to Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                onClick={generateDraft}
                loading={state.isGenerating}
                disabled={!hasApiKey()}
                icon={state.isGenerating ? undefined : <Sparkles className="w-5 h-5" />}
              >
                {state.isGenerating ? "Generating Draft..." : "Generate Draft with AI"}
              </Button>

              {state.isGenerating && (
                <div className="mt-8">
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing your inputs and creating document...</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">
                    This may take 15-30 seconds depending on document complexity
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review & Edit */}
          {state.step === "review-edit" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Review Your {selectedTemplate?.name}
                  </h2>
                  <p className="text-neutral-500">
                    Edit the draft below. Click on any section to modify it.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                    Preview
                  </Button>
                  <Button variant="ghost" size="sm" icon={<Copy className="w-4 h-4" />}>
                    Copy
                  </Button>
                </div>
              </div>

              <Card className="min-h-[500px]">
                <CardContent className="pt-4">
                  <textarea
                    className="w-full min-h-[450px] p-4 font-mono text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={state.generatedDraft}
                    onChange={(e) =>
                      setState((s) => ({ ...s, generatedDraft: e.target.value }))
                    }
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: Export */}
          {state.step === "export" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-200">
                <Check className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Your document is ready!
              </h2>
              <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                Choose how you want to save or share your {selectedTemplate?.name?.toLowerCase()}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                <Button
                  variant="secondary"
                  className="flex-col h-auto py-6"
                  onClick={() => downloadAsText(state.generatedDraft, `${selectedTemplate?.name || "document"}.txt`)}
                >
                  <FileText className="w-8 h-8 mb-2" />
                  <span className="font-medium">Word (.docx)</span>
                  <span className="text-xs text-neutral-500 mt-1">Editable format</span>
                </Button>

                <Button
                  variant="secondary"
                  className="flex-col h-auto py-6"
                  onClick={() => downloadAsText(state.generatedDraft, `${selectedTemplate?.name || "document"}.txt`)}
                >
                  <FileText className="w-8 h-8 mb-2" />
                  <span className="font-medium">PDF</span>
                  <span className="text-xs text-neutral-500 mt-1">For filing</span>
                </Button>

                <Button
                  variant="secondary"
                  className="flex-col h-auto py-6"
                  onClick={() => {
                    navigator.clipboard.writeText(state.generatedDraft);
                    alert("Document copied to clipboard! Paste into Google Docs.");
                  }}
                >
                  <Copy className="w-8 h-8 mb-2" />
                  <span className="font-medium">Copy to Clipboard</span>
                  <span className="text-xs text-neutral-500 mt-1">Paste anywhere</span>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
        <Button
          variant="ghost"
          onClick={state.step === "select-type" ? onCancel : goBack}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          {state.step === "select-type" ? "Cancel" : "Back"}
        </Button>

        {state.step !== "select-type" &&
          state.step !== "ai-draft" &&
          state.step !== "export" && (
            <Button
              variant="primary"
              onClick={goNext}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue
            </Button>
          )}
      </div>
    </div>
  );
};

// Helper function to download text as a file
function downloadAsText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Mock draft generator (replace with actual LLM call)
function generateMockDraft(
  templateName: string,
  state: WizardState
): string {
  const { caseInfo, facts } = state;

  return `IN THE ${caseInfo.court.toUpperCase() || "HIGH COURT"}
CASE NO: ${caseInfo.caseNumber || "[CASE NUMBER]"}

BETWEEN:
  ${caseInfo.yourRole.toUpperCase()} - [YOUR NAME]

AND:
  ${caseInfo.opposingParty || "[OPPOSING PARTY]"} - ${caseInfo.yourRole === "Plaintiff" ? "Defendant" : "Plaintiff"}

${templateName.toUpperCase()}

I, [YOUR FULL NAME], of [YOUR ADDRESS], do solemnly and sincerely affirm as follows:

1. I am the ${caseInfo.yourRole} in these proceedings and I make this ${templateName.toLowerCase()} in support of [STATE PURPOSE].

2. The facts deposed to herein are within my own knowledge, save where otherwise stated, and are true to the best of my knowledge, information and belief.

BACKGROUND

3. ${facts[0] || "[State the first fact]"}

${facts
  .slice(1)
  .map((fact, i) => `${i + 4}. ${fact || "[Additional fact]"}`)
  .join("\n\n")}

CONCLUSION

${facts.length + 4}. For the reasons set out above, I respectfully ask this Honourable Court to [STATE RELIEF SOUGHT].

Affirmed at [LOCATION]
this [DAY] day of [MONTH] [YEAR]

Before me,

______________________
[Commissioner for Oaths / Notary Public]

______________________
[YOUR SIGNATURE]
[YOUR NAME]
${caseInfo.yourRole}`;
}
