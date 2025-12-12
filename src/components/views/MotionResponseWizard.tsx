"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FileText,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Download,
  Eye,
  Lightbulb,
  Target,
  Scale,
  Clock,
  Calendar,
  Info,
  HelpCircle,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  Users,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput, TextArea } from "../ui/Input";
import { Badge, StatusBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
type MotionType =
  | "summary_judgment"
  | "dismiss"
  | "strike"
  | "compel"
  | "protective_order"
  | "default_judgment"
  | "stay"
  | "other";

interface FactualClaim {
  id: string;
  claim: string;
  theirEvidence: string;
  disputed: boolean;
  yourResponse: string;
  yourEvidence: string;
}

interface LegalArgument {
  id: string;
  argument: string;
  yourCounter: string;
  authorities: string[];
}

interface MotionResponse {
  motionType: MotionType;
  motionTitle: string;
  filedBy: string;
  receivedDate: Date | null;
  responseDeadline: Date | null;
  hearingDate: Date | null;
  factualClaims: FactualClaim[];
  legalArguments: LegalArgument[];
  proceduralDefects: string[];
  additionalArguments: string[];
  reliefRequested: string;
}

// Motion types with descriptions
const motionTypes: { type: MotionType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: "summary_judgment",
    label: "Summary Judgment",
    description: "They want to win without a trial, claiming no genuine dispute exists",
    icon: <Scale className="w-5 h-5" />,
  },
  {
    type: "dismiss",
    label: "Motion to Dismiss",
    description: "They want the case thrown out for legal defects",
    icon: <X className="w-5 h-5" />,
  },
  {
    type: "strike",
    label: "Motion to Strike",
    description: "They want parts of your filing removed",
    icon: <Trash2 className="w-5 h-5" />,
  },
  {
    type: "compel",
    label: "Motion to Compel",
    description: "They want the court to force you to provide discovery",
    icon: <Target className="w-5 h-5" />,
  },
  {
    type: "default_judgment",
    label: "Default Judgment",
    description: "They claim you failed to respond and want to win automatically",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    type: "stay",
    label: "Motion for Stay",
    description: "They want to pause the case for some reason",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    type: "protective_order",
    label: "Protective Order",
    description: "They want to limit what information can be disclosed",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    type: "other",
    label: "Other Motion",
    description: "A different type of motion not listed above",
    icon: <FileText className="w-5 h-5" />,
  },
];

// Summary Judgment specific guidance
const summaryJudgmentGuide = {
  legalStandard: `Summary Judgment should be denied unless there is NO genuine dispute of material fact AND the moving party is entitled to judgment as a matter of law. The court must view all facts in the light most favorable to the non-moving party (you).`,
  yourGoal: `You don't need to prove your case. You just need to show that genuine factual disputes exist that require a trial to resolve.`,
  keyStrategies: [
    "Identify disputed facts - any genuine dispute defeats summary judgment",
    "Point out credibility issues - if the case depends on who to believe, that requires a trial",
    "Show their evidence has gaps - they must prove their entitlement, not you",
    "Argue you need discovery - if you haven't had adequate discovery, say so",
    "Challenge their legal theory - even if facts are undisputed, their legal argument may be wrong",
  ],
  commonMistakes: [
    "Arguing the merits of your whole case instead of focusing on disputed issues",
    "Making assertions without supporting evidence or affidavits",
    "Missing the response deadline (this can be fatal)",
    "Not filing a proper opposing affidavit with your version of facts",
    "Admitting facts that are actually disputed",
  ],
};

interface MotionResponseWizardProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const MotionResponseWizard: React.FC<MotionResponseWizardProps> = ({
  onNavigate,
  onAction,
}) => {
  // Wizard steps
  const steps = [
    { id: "select-type", label: "Motion Type", icon: <FileText className="w-4 h-4" /> },
    { id: "analyze", label: "Analyze Motion", icon: <Search className="w-4 h-4" /> },
    { id: "facts", label: "Disputed Facts", icon: <Target className="w-4 h-4" /> },
    { id: "arguments", label: "Counter Arguments", icon: <Scale className="w-4 h-4" /> },
    { id: "defects", label: "Procedural Issues", icon: <AlertCircle className="w-4 h-4" /> },
    { id: "draft", label: "Generate Response", icon: <Sparkles className="w-4 h-4" /> },
  ];

  // State
  const [currentStep, setCurrentStep] = React.useState(0);
  const [response, setResponse] = React.useState<MotionResponse>({
    motionType: "summary_judgment",
    motionTitle: "",
    filedBy: "",
    receivedDate: null,
    responseDeadline: null,
    hearingDate: null,
    factualClaims: [],
    legalArguments: [],
    proceduralDefects: [],
    additionalArguments: [],
    reliefRequested: "",
  });
  const [showHelp, setShowHelp] = React.useState(false);
  const [generatingDraft, setGeneratingDraft] = React.useState(false);
  const [draftGenerated, setDraftGenerated] = React.useState(false);

  // Add factual claim
  const addFactualClaim = () => {
    const newClaim: FactualClaim = {
      id: Date.now().toString(),
      claim: "",
      theirEvidence: "",
      disputed: true,
      yourResponse: "",
      yourEvidence: "",
    };
    setResponse((prev) => ({
      ...prev,
      factualClaims: [...prev.factualClaims, newClaim],
    }));
  };

  // Update factual claim
  const updateFactualClaim = (id: string, updates: Partial<FactualClaim>) => {
    setResponse((prev) => ({
      ...prev,
      factualClaims: prev.factualClaims.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  };

  // Remove factual claim
  const removeFactualClaim = (id: string) => {
    setResponse((prev) => ({
      ...prev,
      factualClaims: prev.factualClaims.filter((c) => c.id !== id),
    }));
  };

  // Add legal argument
  const addLegalArgument = () => {
    const newArg: LegalArgument = {
      id: Date.now().toString(),
      argument: "",
      yourCounter: "",
      authorities: [],
    };
    setResponse((prev) => ({
      ...prev,
      legalArguments: [...prev.legalArguments, newArg],
    }));
  };

  // Update legal argument
  const updateLegalArgument = (id: string, updates: Partial<LegalArgument>) => {
    setResponse((prev) => ({
      ...prev,
      legalArguments: prev.legalArguments.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  };

  // Remove legal argument
  const removeLegalArgument = (id: string) => {
    setResponse((prev) => ({
      ...prev,
      legalArguments: prev.legalArguments.filter((a) => a.id !== id),
    }));
  };

  // Add procedural defect
  const addProceduralDefect = (defect: string) => {
    if (defect && !response.proceduralDefects.includes(defect)) {
      setResponse((prev) => ({
        ...prev,
        proceduralDefects: [...prev.proceduralDefects, defect],
      }));
    }
  };

  // Remove procedural defect
  const removeProceduralDefect = (index: number) => {
    setResponse((prev) => ({
      ...prev,
      proceduralDefects: prev.proceduralDefects.filter((_, i) => i !== index),
    }));
  };

  // Generate draft
  const generateDraft = async () => {
    setGeneratingDraft(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setGeneratingDraft(false);
    setDraftGenerated(true);
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    if (!response.responseDeadline) return null;
    const diff = response.responseDeadline.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysUntilDeadline();

  // Render step content
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "select-type":
        return renderSelectType();
      case "analyze":
        return renderAnalyze();
      case "facts":
        return renderFacts();
      case "arguments":
        return renderArguments();
      case "defects":
        return renderDefects();
      case "draft":
        return renderDraft();
      default:
        return null;
    }
  };

  // Step 1: Select Motion Type
  const renderSelectType = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          What type of motion are you responding to?
        </h2>
        <p className="text-neutral-500">
          Select the motion type to get specific guidance for your response
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {motionTypes.map(({ type, label, description, icon }) => (
          <button
            key={type}
            onClick={() => setResponse((prev) => ({ ...prev, motionType: type }))}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
              response.motionType === type
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                response.motionType === type
                  ? "bg-primary-100 text-primary-600"
                  : "bg-neutral-100 text-neutral-500"
              )}
            >
              {icon}
            </div>
            <div>
              <p
                className={cn(
                  "font-medium",
                  response.motionType === type ? "text-primary-900" : "text-neutral-900"
                )}
              >
                {label}
              </p>
              <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Motion Details */}
      <div className="space-y-4 pt-4 border-t border-neutral-200">
        <Input
          label="Motion Title (as it appears on the filing)"
          placeholder="e.g., Plaintiff's Motion for Summary Judgment"
          value={response.motionTitle}
          onChange={(e) => setResponse((prev) => ({ ...prev, motionTitle: e.target.value }))}
        />
        <Input
          label="Filed By"
          placeholder="e.g., Plaintiff, Third Party"
          value={response.filedBy}
          onChange={(e) => setResponse((prev) => ({ ...prev, filedBy: e.target.value }))}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Date Received"
            type="date"
            value={response.receivedDate?.toISOString().split("T")[0] || ""}
            onChange={(e) =>
              setResponse((prev) => ({
                ...prev,
                receivedDate: e.target.value ? new Date(e.target.value) : null,
              }))
            }
          />
          <Input
            label="Response Deadline"
            type="date"
            value={response.responseDeadline?.toISOString().split("T")[0] || ""}
            onChange={(e) =>
              setResponse((prev) => ({
                ...prev,
                responseDeadline: e.target.value ? new Date(e.target.value) : null,
              }))
            }
          />
          <Input
            label="Hearing Date (if scheduled)"
            type="date"
            value={response.hearingDate?.toISOString().split("T")[0] || ""}
            onChange={(e) =>
              setResponse((prev) => ({
                ...prev,
                hearingDate: e.target.value ? new Date(e.target.value) : null,
              }))
            }
          />
        </div>
      </div>

      {/* Deadline Warning */}
      {daysRemaining !== null && (
        <div
          className={cn(
            "rounded-lg p-4",
            daysRemaining <= 3
              ? "bg-red-50 border border-red-200"
              : daysRemaining <= 7
              ? "bg-amber-50 border border-amber-200"
              : "bg-blue-50 border border-blue-200"
          )}
        >
          <div className="flex items-center gap-3">
            <Clock
              className={cn(
                "w-5 h-5",
                daysRemaining <= 3
                  ? "text-red-600"
                  : daysRemaining <= 7
                  ? "text-amber-600"
                  : "text-blue-600"
              )}
            />
            <div>
              <p
                className={cn(
                  "font-medium",
                  daysRemaining <= 3
                    ? "text-red-900"
                    : daysRemaining <= 7
                    ? "text-amber-900"
                    : "text-blue-900"
                )}
              >
                {daysRemaining <= 0
                  ? "Response is overdue!"
                  : daysRemaining === 1
                  ? "Response due tomorrow!"
                  : `${daysRemaining} days until deadline`}
              </p>
              <p
                className={cn(
                  "text-sm",
                  daysRemaining <= 3
                    ? "text-red-700"
                    : daysRemaining <= 7
                    ? "text-amber-700"
                    : "text-blue-700"
                )}
              >
                {daysRemaining <= 3
                  ? "This is urgent. Prioritize completing your response."
                  : "Make sure to file before the deadline."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: Analyze Motion
  const renderAnalyze = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          Understanding {response.motionType === "summary_judgment" ? "Summary Judgment" : "the Motion"}
        </h2>
        <p className="text-neutral-500">
          Learn what this motion means and how to effectively respond
        </p>
      </div>

      {response.motionType === "summary_judgment" && (
        <>
          {/* Legal Standard */}
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">The Legal Standard</h3>
                  <p className="text-sm text-blue-700">{summaryJudgmentGuide.legalStandard}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Goal */}
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-emerald-900 mb-2">Your Goal</h3>
                  <p className="text-sm text-emerald-700">{summaryJudgmentGuide.yourGoal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Strategies */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Key Strategies
              </h3>
              <ul className="space-y-2">
                {summaryJudgmentGuide.keyStrategies.map((strategy, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {strategy}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Common Mistakes */}
          <Card className="bg-red-50 border-red-100">
            <CardContent className="p-4">
              <h3 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Common Mistakes to Avoid
              </h3>
              <ul className="space-y-2">
                {summaryJudgmentGuide.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {/* Upload Motion for Analysis */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-500" />
            Upload Their Motion (Optional)
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            Upload the motion papers to have AI help identify their key arguments and claims
          </p>
          <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-neutral-600">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-neutral-400 mt-1">PDF, DOCX supported</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 3: Disputed Facts
  const renderFacts = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          Identify Disputed Facts
        </h2>
        <p className="text-neutral-500">
          List the factual claims they make and explain why each is disputed
        </p>
      </div>

      {/* Info box */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium text-blue-900 mb-1">Why this matters:</p>
              <p>
                If you can show ANY genuine dispute of material fact, Summary Judgment
                should be denied. Focus on facts that are important to the outcome of the case.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factual Claims */}
      <div className="space-y-4">
        {response.factualClaims.map((claim, index) => (
          <Card key={claim.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-neutral-900">Factual Claim #{index + 1}</h4>
                <button
                  onClick={() => removeFactualClaim(claim.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <TextArea
                  label="What do they claim?"
                  placeholder="e.g., They claim the contract was signed on March 15, 2022"
                  value={claim.claim}
                  onChange={(e) => updateFactualClaim(claim.id, { claim: e.target.value })}
                  rows={2}
                />

                <TextArea
                  label="What evidence do they cite?"
                  placeholder="e.g., Exhibit A - the signed contract"
                  value={claim.theirEvidence}
                  onChange={(e) => updateFactualClaim(claim.id, { theirEvidence: e.target.value })}
                  rows={2}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Is this fact disputed?
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateFactualClaim(claim.id, { disputed: true })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        claim.disputed
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                      )}
                    >
                      <X className="w-4 h-4" />
                      Disputed
                    </button>
                    <button
                      onClick={() => updateFactualClaim(claim.id, { disputed: false })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        !claim.disputed
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      Undisputed
                    </button>
                  </div>
                </div>

                {claim.disputed && (
                  <>
                    <TextArea
                      label="Your response (why is this disputed?)"
                      placeholder="e.g., The signature appears to be forged. I was out of the country on March 15, 2022."
                      value={claim.yourResponse}
                      onChange={(e) =>
                        updateFactualClaim(claim.id, { yourResponse: e.target.value })
                      }
                      rows={2}
                    />

                    <TextArea
                      label="Your evidence"
                      placeholder="e.g., Passport stamps showing travel dates, bank records showing transactions abroad"
                      value={claim.yourEvidence}
                      onChange={(e) =>
                        updateFactualClaim(claim.id, { yourEvidence: e.target.value })
                      }
                      rows={2}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="secondary"
          className="w-full"
          onClick={addFactualClaim}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Factual Claim
        </Button>
      </div>

      {response.factualClaims.length === 0 && (
        <div className="text-center py-8 bg-neutral-50 rounded-xl">
          <Target className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">
            No factual claims added yet. Click "Add Factual Claim" to start.
          </p>
        </div>
      )}
    </div>
  );

  // Step 4: Counter Arguments
  const renderArguments = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          Counter Their Legal Arguments
        </h2>
        <p className="text-neutral-500">
          Identify their legal arguments and prepare your responses
        </p>
      </div>

      {/* Legal Arguments */}
      <div className="space-y-4">
        {response.legalArguments.map((arg, index) => (
          <Card key={arg.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-neutral-900">Legal Argument #{index + 1}</h4>
                <button
                  onClick={() => removeLegalArgument(arg.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <TextArea
                  label="Their argument"
                  placeholder="e.g., They argue that the statute of limitations has expired"
                  value={arg.argument}
                  onChange={(e) => updateLegalArgument(arg.id, { argument: e.target.value })}
                  rows={2}
                />

                <TextArea
                  label="Your counter-argument"
                  placeholder="e.g., The statute was tolled because of fraudulent concealment"
                  value={arg.yourCounter}
                  onChange={(e) => updateLegalArgument(arg.id, { yourCounter: e.target.value })}
                  rows={3}
                />

                <Input
                  label="Legal authorities (cases, statutes)"
                  placeholder="e.g., Smith v. Jones [2020] HKCA 123"
                  description="Enter case names or statutes that support your position"
                  value={arg.authorities.join(", ")}
                  onChange={(e) =>
                    updateLegalArgument(arg.id, {
                      authorities: e.target.value.split(",").map((a) => a.trim()),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="secondary"
          className="w-full"
          onClick={addLegalArgument}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Legal Argument
        </Button>
      </div>

      {response.legalArguments.length === 0 && (
        <div className="text-center py-8 bg-neutral-50 rounded-xl">
          <Scale className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">
            No legal arguments added yet. Click "Add Legal Argument" to start.
          </p>
        </div>
      )}
    </div>
  );

  // Step 5: Procedural Defects
  const renderDefects = () => {
    const commonDefects = [
      "Motion was not properly served",
      "Motion was filed late / out of time",
      "Required notice was not given",
      "Supporting affidavit is defective",
      "Motion does not comply with court rules",
      "Wrong legal standard applied",
      "Evidence cited is inadmissible",
      "Motion is premature (discovery not complete)",
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Identify Procedural Defects
          </h2>
          <p className="text-neutral-500">
            Check if their motion has any procedural problems that could defeat it
          </p>
        </div>

        {/* Common Defects */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Common Procedural Issues</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Select any that apply to their motion:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonDefects.map((defect) => {
                const isSelected = response.proceduralDefects.includes(defect);
                return (
                  <button
                    key={defect}
                    onClick={() => {
                      if (isSelected) {
                        removeProceduralDefect(response.proceduralDefects.indexOf(defect));
                      } else {
                        addProceduralDefect(defect);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-all",
                      isSelected
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                    )}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    )}
                    {defect}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Defects */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Other Procedural Issues</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Describe another procedural defect..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addProceduralDefect((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <Button variant="secondary" onClick={() => {}}>
                Add
              </Button>
            </div>

            {response.proceduralDefects.filter((d) => !commonDefects.includes(d)).length > 0 && (
              <div className="mt-4 space-y-2">
                {response.proceduralDefects
                  .filter((d) => !commonDefects.includes(d))
                  .map((defect, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                    >
                      <span className="text-sm text-neutral-700">{defect}</span>
                      <button
                        onClick={() => removeProceduralDefect(response.proceduralDefects.indexOf(defect))}
                        className="p-1 rounded hover:bg-red-100 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tip */}
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium text-amber-900 mb-1">Tip:</p>
                <p>
                  Even if procedural defects exist, it's best to also respond on the merits.
                  Courts sometimes overlook minor procedural issues, so don't rely solely on
                  technical objections.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Step 6: Generate Draft
  const renderDraft = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          Generate Your Response
        </h2>
        <p className="text-neutral-500">
          Review your inputs and generate an AI-assisted draft response
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-neutral-900 mb-4">Response Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-500">Motion Type</span>
              <span className="font-medium text-neutral-900">
                {motionTypes.find((m) => m.type === response.motionType)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-500">Disputed Facts</span>
              <span className="font-medium text-neutral-900">
                {response.factualClaims.filter((c) => c.disputed).length} of{" "}
                {response.factualClaims.length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-500">Counter Arguments</span>
              <span className="font-medium text-neutral-900">{response.legalArguments.length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-500">Procedural Defects</span>
              <span className="font-medium text-neutral-900">
                {response.proceduralDefects.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relief Requested */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-neutral-900 mb-3">What relief are you seeking?</h3>
          <TextArea
            placeholder="e.g., The Defendant respectfully requests that the Court deny the Plaintiff's Motion for Summary Judgment in its entirety, with costs."
            value={response.reliefRequested}
            onChange={(e) => setResponse((prev) => ({ ...prev, reliefRequested: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Generate Button */}
      {!draftGenerated ? (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={generateDraft}
          loading={generatingDraft}
          icon={<Sparkles className="w-5 h-5" />}
        >
          {generatingDraft ? "Generating Draft..." : "Generate Response Draft"}
        </Button>
      ) : (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="font-medium text-emerald-900">Draft Generated!</h3>
                <p className="text-sm text-emerald-700">
                  Your response draft is ready for review and editing
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => onAction?.("edit-draft", response)}
                icon={<Edit2 className="w-4 h-4" />}
              >
                Review & Edit Draft
              </Button>
              <Button
                variant="secondary"
                onClick={() => onAction?.("export-draft", response)}
                icon={<Download className="w-4 h-4" />}
              >
                Export as DOCX
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What's Included */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-neutral-900 mb-3">What the AI will generate:</h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              Affirmation in Opposition with your version of facts
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              Written Submissions with legal arguments
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              Statement of disputed and undisputed facts
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              Procedural objections (if any)
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Motion Response Wizard</h1>
            <p className="text-neutral-500 mt-1">
              Build a strong response to oppose their motion
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowHelp(true)}
            icon={<HelpCircle className="w-4 h-4" />}
          >
            Help
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  index === currentStep
                    ? "bg-primary-100 text-primary-700"
                    : index < currentStep
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-neutral-100 text-neutral-500"
                )}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  step.icon
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <Button
            variant="ghost"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <Button
            variant={currentStep === steps.length - 1 ? "primary" : "ghost"}
            disabled={currentStep === steps.length - 1 && !draftGenerated}
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep((prev) => prev + 1);
              } else {
                onAction?.("complete", response);
              }
            }}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {currentStep === steps.length - 1 ? "Complete" : "Next"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
