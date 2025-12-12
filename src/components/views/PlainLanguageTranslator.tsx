"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages,
  Upload,
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Volume2,
  BookOpen,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";
import { translateToPlainLanguage, hasApiKey, getProvider, PROVIDERS } from "@/lib/ai-service";

interface TranslationResult {
  plainEnglish: string;
  keyTerms: Array<{ term: string; definition: string }>;
  whatThisMeans: string;
  actionRequired?: string;
}

interface Term {
  term: string;
  definition: string;
  example?: string;
}

// Common legal terms dictionary
const legalTerms: Record<string, Term> = {
  "plaintiff": {
    term: "Plaintiff",
    definition: "The person or company who starts a lawsuit by filing a complaint",
    example: "You are the plaintiff if you filed the lawsuit against someone else",
  },
  "defendant": {
    term: "Defendant",
    definition: "The person or company being sued or accused in court",
    example: "If someone filed a lawsuit against you, you are the defendant",
  },
  "motion": {
    term: "Motion",
    definition: "A formal request asking the court to make a decision about something",
    example: "A 'Motion to Dismiss' asks the judge to throw out the case",
  },
  "summary judgment": {
    term: "Summary Judgment",
    definition: "A request for the court to decide the case without a trial, usually because there's no real disagreement about the important facts",
    example: "The other side may file this if they think they should win without going to trial",
  },
  "discovery": {
    term: "Discovery",
    definition: "The process where both sides share information, documents, and evidence before trial",
    example: "You might receive 'interrogatories' (written questions) or 'document requests'",
  },
  "affidavit": {
    term: "Affidavit",
    definition: "A written statement of facts that you sign and swear is true",
    example: "You sign it in front of a notary or commissioner for oaths",
  },
  "injunction": {
    term: "Injunction",
    definition: "A court order telling someone to do something or stop doing something",
    example: "A restraining order is a type of injunction",
  },
  "subpoena": {
    term: "Subpoena",
    definition: "A legal order requiring someone to appear in court or produce documents",
    example: "If you receive one, you must comply or face penalties",
  },
  "deposition": {
    term: "Deposition",
    definition: "A formal interview under oath where lawyers ask you questions, recorded by a court reporter",
    example: "You answer questions about what you know, and it can be used in court",
  },
  "exhibits": {
    term: "Exhibits",
    definition: "Documents or objects presented as evidence in court",
    example: "Emails, contracts, and photos attached to your filings are exhibits",
  },
  "prima facie": {
    term: "Prima Facie",
    definition: "At first look; evidence that appears sufficient to prove something unless disproven",
    example: "The plaintiff must show a 'prima facie case' - basic evidence supporting their claim",
  },
  "res judicata": {
    term: "Res Judicata",
    definition: "A matter already decided by a court; you can't sue about the same thing twice",
    example: "If you lost a previous case on the same issue, you can't bring it up again",
  },
  "sua sponte": {
    term: "Sua Sponte",
    definition: "When a judge acts on their own initiative without either party asking",
    example: "The judge may dismiss a case 'sua sponte' if it lacks merit",
  },
  "pro se": {
    term: "Pro Se",
    definition: "Representing yourself in court without a lawyer",
    example: "You are a 'pro se litigant' or 'self-represented litigant'",
  },
  "pleadings": {
    term: "Pleadings",
    definition: "The formal documents filed to start and respond to a lawsuit",
    example: "Includes complaints, answers, and counterclaims",
  },
  "jurisdiction": {
    term: "Jurisdiction",
    definition: "The court's authority to hear and decide a case",
    example: "A court must have jurisdiction over both the subject matter and the parties",
  },
  "statute of limitations": {
    term: "Statute of Limitations",
    definition: "The time limit for filing a lawsuit; miss it and you lose the right to sue",
    example: "Personal injury claims often have a 2-3 year limit",
  },
  "burden of proof": {
    term: "Burden of Proof",
    definition: "The responsibility to prove your claims with evidence",
    example: "In civil cases, you must prove your case 'on the balance of probabilities' (more likely than not)",
  },
  "hearsay": {
    term: "Hearsay",
    definition: "Secondhand information; what someone told you, not what you directly witnessed",
    example: "Usually not allowed as evidence unless an exception applies",
  },
  "contempt of court": {
    term: "Contempt of Court",
    definition: "Disobeying a court order or disrespecting the court",
    example: "Can result in fines or even imprisonment",
  },
};

interface PlainLanguageTranslatorProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
  onClose?: () => void;
}

export const PlainLanguageTranslator: React.FC<PlainLanguageTranslatorProps> = ({
  onNavigate,
  onAction,
  onClose,
}) => {
  const [inputText, setInputText] = React.useState("");
  const [translatedText, setTranslatedText] = React.useState("");
  const [translationResult, setTranslationResult] = React.useState<TranslationResult | null>(null);
  const [highlightedTerms, setHighlightedTerms] = React.useState<Term[]>([]);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showGlossary, setShowGlossary] = React.useState(false);
  const [selectedTerm, setSelectedTerm] = React.useState<Term | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const provider = getProvider();
  const providerInfo = PROVIDERS.find((p) => p.id === provider);

  // Find legal terms in text
  const findTermsInText = (text: string): Term[] => {
    const found: Term[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(legalTerms).forEach(([key, term]) => {
      if (lowerText.includes(key.toLowerCase())) {
        found.push(term);
      }
    });

    return found;
  };

  // Translate document using AI
  const translateDocument = async () => {
    if (!inputText.trim()) return;

    if (!hasApiKey()) {
      setError("Please add an API key in Settings before using the translator.");
      return;
    }

    setIsTranslating(true);
    setError(null);
    setHighlightedTerms(findTermsInText(inputText));

    try {
      const result = await translateToPlainLanguage(inputText);
      setTranslationResult(result);
      setTranslatedText(result.plainEnglish);

      // Add AI-detected terms to highlighted terms
      if (result.keyTerms.length > 0) {
        const aiTerms: Term[] = result.keyTerms.map(kt => ({
          term: kt.term,
          definition: kt.definition,
        }));
        setHighlightedTerms(prev => {
          const combined = [...prev];
          aiTerms.forEach(at => {
            if (!combined.find(t => t.term.toLowerCase() === at.term.toLowerCase())) {
              combined.push(at);
            }
          });
          return combined;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to translate document");
      // Fall back to simulated translation
      const simplified = simulateTranslation(inputText);
      setTranslatedText(simplified);
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Languages className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              Plain Language Translator
            </h1>
            <p className="text-sm text-neutral-500">
              Convert complex legal documents into simple, understandable language
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div>
          <Card>
            <CardHeader
              title="Original Document"
              description="Paste legal text or upload a document"
              icon={<FileText className="w-5 h-5" />}
            />
            <CardContent>
              <textarea
                className="w-full h-80 p-4 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Paste legal text here...

Example: 'The Defendant's Motion for Summary Judgment pursuant to Rule 56 is hereby DENIED. The Court finds that genuine issues of material fact exist regarding the Plaintiff's claims of breach of fiduciary duty and constructive fraud. The matter shall proceed to trial as scheduled.'"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="primary"
                  onClick={translateDocument}
                  loading={isTranslating}
                  icon={<Sparkles className="w-4 h-4" />}
                  className="flex-1"
                >
                  {isTranslating ? "Translating..." : "Translate to Plain Language"}
                </Button>
                <Button
                  variant="secondary"
                  icon={<Upload className="w-4 h-4" />}
                >
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detected Legal Terms */}
          {highlightedTerms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900">
                        Legal Terms Detected
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Click on any term to see its explanation:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {highlightedTerms.map((term, i) => (
                          <button
                            key={i}
                            className="px-2.5 py-1 text-sm font-medium bg-white border border-amber-300 rounded-full hover:bg-amber-100 transition-colors"
                            onClick={() => setSelectedTerm(term)}
                          >
                            {term.term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Output Section */}
        <div>
          <Card>
            <CardHeader
              title="Plain Language Version"
              description="Easy-to-understand translation"
              icon={<BookOpen className="w-5 h-5" />}
              action={
                translatedText && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Volume2 className="w-4 h-4" />}
                    >
                      Listen
                    </Button>
                  </div>
                )
              }
            />
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {translatedText ? (
                <div className="max-h-[500px] overflow-y-auto space-y-4">
                  {/* Plain English Translation */}
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                      Plain English Version
                    </h4>
                    <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                      {translatedText}
                    </p>
                  </div>

                  {/* What This Means */}
                  {translationResult?.whatThisMeans && (
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                      <h4 className="text-sm font-medium text-primary-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        What This Means For You
                      </h4>
                      <p className="text-primary-900">
                        {translationResult.whatThisMeans}
                      </p>
                    </div>
                  )}

                  {/* Action Required */}
                  {translationResult?.actionRequired && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="text-sm font-medium text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Action Required
                      </h4>
                      <p className="text-amber-900 font-medium">
                        {translationResult.actionRequired}
                      </p>
                    </div>
                  )}

                  {/* AI-detected Key Terms */}
                  {translationResult?.keyTerms && translationResult.keyTerms.length > 0 && (
                    <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                      <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
                        Key Terms Explained
                      </h4>
                      <div className="space-y-3">
                        {translationResult.keyTerms.map((kt, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Badge variant="default" size="sm" className="flex-shrink-0 mt-0.5">
                              {kt.term}
                            </Badge>
                            <p className="text-sm text-neutral-600">{kt.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 rounded-lg">
                  <Languages className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">
                    Your translated text will appear here
                  </p>
                  <p className="text-xs mt-1">
                    Paste legal text and click "Translate"
                  </p>
                  {hasApiKey() && (
                    <p className="text-xs mt-2 text-primary-500">
                      Powered by {providerInfo?.name || "AI"}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <div className="mt-4">
            <Card variant="outlined">
              <CardContent className="pt-4">
                <h4 className="font-medium text-neutral-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary-500" />
                  Understanding Your Documents
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Pay close attention to any <strong>deadlines</strong> mentioned</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Look for what <strong>action</strong> you need to take</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Note any <strong>consequences</strong> if you don't respond</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>If unsure, use our <strong>Procedure Guide</strong> for next steps</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Legal Glossary Toggle */}
      <div className="mt-8">
        <button
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          onClick={() => setShowGlossary(!showGlossary)}
        >
          <BookOpen className="w-4 h-4" />
          Legal Glossary
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              showGlossary && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {showGlossary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {Object.values(legalTerms).map((term, i) => (
                  <Card
                    key={i}
                    variant="interactive"
                    padding="sm"
                    onClick={() => setSelectedTerm(term)}
                  >
                    <h4 className="font-medium text-neutral-900">{term.term}</h4>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                      {term.definition}
                    </p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Term Detail Modal */}
      <AnimatePresence>
        {selectedTerm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedTerm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6"
            >
              <h3 className="text-lg font-semibold text-neutral-900">
                {selectedTerm.term}
              </h3>
              <p className="mt-3 text-neutral-600">{selectedTerm.definition}</p>
              {selectedTerm.example && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm font-medium text-primary-900">Example:</p>
                  <p className="text-sm text-primary-700 mt-1">
                    {selectedTerm.example}
                  </p>
                </div>
              )}
              <Button
                variant="secondary"
                className="w-full mt-6"
                onClick={() => setSelectedTerm(null)}
              >
                Got it
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simulated translation (in real app, use LLM)
function simulateTranslation(input: string): string {
  // Simple simulation - in real app, this calls Claude/GPT to simplify
  const hasMotion = input.toLowerCase().includes("motion");
  const hasSummaryJudgment = input.toLowerCase().includes("summary judgment");
  const hasDenied = input.toLowerCase().includes("denied");

  if (hasSummaryJudgment && hasDenied) {
    return `WHAT THIS MEANS FOR YOU:

Good news! The other side asked the court to decide the case in their favor without a trial, but the judge said NO.

Here's what happened:
• The other side filed a "Motion for Summary Judgment" - basically asking the judge to end the case early and rule in their favor
• The judge reviewed the evidence and found there are still disputed facts that need to be decided at trial
• Your case will now proceed to trial

WHAT YOU NEED TO DO:
1. Start preparing for trial
2. Gather all your evidence and organize it
3. Identify any witnesses you want to call
4. Check the court calendar for your trial date
5. Consider whether you want to try to settle before trial

IMPORTANT DATES:
• Look for any scheduling orders from the court
• Make sure you don't miss any pre-trial deadlines

This is generally a positive outcome - it means your case has merit and will get a full hearing.`;
  }

  return `WHAT THIS DOCUMENT SAYS:

${input}

---

IN SIMPLER TERMS:

This document contains legal language that may be difficult to understand. Here are the key points:

• Review any deadlines mentioned carefully
• Look for specific actions you need to take
• Note any consequences for not responding
• If you're unsure about anything, consult our Procedure Guide

Would you like help understanding any specific parts of this document?`;
}
