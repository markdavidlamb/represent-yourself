"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  MapPin,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Clock,
  AlertTriangle,
  FileText,
  Gavel,
  Users,
  Scale,
  MessageSquare,
  Calendar,
  Target,
  Flag,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Play,
  Pause,
  SkipForward,
  Info,
  ExternalLink,
  Download,
  Sparkles,
  Compass,
  Route,
  Milestone,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
type CaseType = "civil" | "commercial" | "family" | "employment" | "personal-injury";
type PartyRole = "plaintiff" | "defendant" | "applicant" | "respondent";
type StageStatus = "completed" | "current" | "upcoming" | "blocked";

interface CaseStage {
  id: string;
  name: string;
  description: string;
  status: StageStatus;
  substeps: SubStep[];
  estimatedDuration?: string;
  courtRule?: string;
  tips?: string[];
  documents?: string[];
  deadline?: Date;
}

interface SubStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  actionUrl?: string;
  documentTemplate?: string;
}

interface CaseInfo {
  caseNumber: string;
  court: string;
  caseType: CaseType;
  role: PartyRole;
  currentStage: string;
  filedDate?: Date;
  nextHearing?: Date;
}

interface LegalGPSProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

// Litigation stages for civil cases in HK
const litigationStages: CaseStage[] = [
  {
    id: "pre-action",
    name: "Pre-Action",
    description: "Before filing court proceedings",
    status: "completed",
    estimatedDuration: "2-4 weeks",
    tips: [
      "Send a letter before action to give opponent chance to settle",
      "Gather all relevant documents and evidence",
      "Consider mediation before litigation",
    ],
    documents: ["Letter Before Action", "Document Checklist"],
    substeps: [
      { id: "pa-1", name: "Identify your cause of action", description: "Determine legal basis for your claim", completed: true },
      { id: "pa-2", name: "Gather evidence", description: "Collect documents, photos, witness details", completed: true },
      { id: "pa-3", name: "Send letter before action", description: "Formal demand to opponent", completed: true },
      { id: "pa-4", name: "Consider pre-action protocol", description: "Follow required pre-action steps", completed: true },
    ],
  },
  {
    id: "commencement",
    name: "Commencement",
    description: "Filing the lawsuit",
    status: "completed",
    estimatedDuration: "1-2 weeks",
    courtRule: "O.5, O.6 RHC",
    tips: [
      "Ensure correct court is chosen based on claim value",
      "Pay court fees when filing",
      "Keep copies of all filed documents",
    ],
    documents: ["Writ of Summons", "Statement of Claim", "Court Fee Receipt"],
    substeps: [
      { id: "com-1", name: "Prepare Writ of Summons", description: "Initial court document starting proceedings", completed: true, documentTemplate: "writ" },
      { id: "com-2", name: "Draft Statement of Claim", description: "Set out your case in detail", completed: true, documentTemplate: "soc" },
      { id: "com-3", name: "File at court registry", description: "Submit documents and pay fees", completed: true },
      { id: "com-4", name: "Serve on defendant", description: "Deliver documents to other party", completed: true },
    ],
  },
  {
    id: "pleadings",
    name: "Pleadings",
    description: "Exchange of formal statements",
    status: "current",
    estimatedDuration: "4-8 weeks",
    courtRule: "O.18 RHC",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    tips: [
      "Respond to every allegation - admit, deny, or require proof",
      "Raise all your defenses in the Defence",
      "Consider making a counterclaim if you have one",
    ],
    documents: ["Defence", "Reply", "Counterclaim (if any)"],
    substeps: [
      { id: "pl-1", name: "Acknowledgment of Service", description: "Defendant confirms receipt", completed: true },
      { id: "pl-2", name: "Defence filed", description: "Defendant's response to claim", completed: true },
      { id: "pl-3", name: "Reply to Defence", description: "Plaintiff's response to defence", completed: false, documentTemplate: "reply" },
      { id: "pl-4", name: "Close of pleadings", description: "All statements exchanged", completed: false },
    ],
  },
  {
    id: "interlocutory",
    name: "Interlocutory Applications",
    description: "Pre-trial applications and hearings",
    status: "upcoming",
    estimatedDuration: "2-6 months",
    courtRule: "Various",
    tips: [
      "Only make applications that are necessary",
      "Be prepared for costs consequences",
      "Consider whether issues can be agreed with opponent",
    ],
    documents: ["Summons", "Supporting Affirmation", "Skeleton Argument"],
    substeps: [
      { id: "int-1", name: "Discovery", description: "Exchange of documents", completed: false },
      { id: "int-2", name: "Interrogatories", description: "Written questions (if needed)", completed: false },
      { id: "int-3", name: "Interlocutory applications", description: "Pre-trial motions", completed: false },
      { id: "int-4", name: "Case management conference", description: "Court review of progress", completed: false },
    ],
  },
  {
    id: "discovery",
    name: "Discovery",
    description: "Document exchange process",
    status: "upcoming",
    estimatedDuration: "4-8 weeks",
    courtRule: "O.24 RHC",
    tips: [
      "List all relevant documents, even unfavorable ones",
      "Keep privileged documents separate",
      "Review opponent's list carefully",
    ],
    documents: ["List of Documents", "Discovery Affirmation"],
    substeps: [
      { id: "disc-1", name: "Automatic discovery", description: "Exchange lists of documents", completed: false },
      { id: "disc-2", name: "Review opponent's documents", description: "Analyze what they disclosed", completed: false },
      { id: "disc-3", name: "Specific discovery (if needed)", description: "Request additional documents", completed: false },
      { id: "disc-4", name: "Inspection of documents", description: "View originals if required", completed: false },
    ],
  },
  {
    id: "pre-trial",
    name: "Pre-Trial Preparation",
    description: "Getting ready for trial",
    status: "upcoming",
    estimatedDuration: "2-4 weeks",
    courtRule: "O.34, O.38 RHC",
    tips: [
      "Prepare witness statements early",
      "Organize your trial bundle logically",
      "Practice your oral submissions",
    ],
    documents: ["Witness Statements", "Trial Bundle", "Opening Submission"],
    substeps: [
      { id: "pt-1", name: "Witness statements", description: "Prepare written evidence", completed: false, documentTemplate: "witness" },
      { id: "pt-2", name: "Expert reports (if any)", description: "Obtain expert evidence", completed: false },
      { id: "pt-3", name: "Trial bundle preparation", description: "Compile documents for trial", completed: false },
      { id: "pt-4", name: "Pre-trial review", description: "Final court conference", completed: false },
    ],
  },
  {
    id: "trial",
    name: "Trial",
    description: "The court hearing",
    status: "upcoming",
    estimatedDuration: "1-5 days",
    tips: [
      "Arrive early and dress appropriately",
      "Address the judge as 'My Lord/Lady' or 'Your Honour'",
      "Be respectful even when cross-examined",
    ],
    substeps: [
      { id: "tr-1", name: "Opening statements", description: "Outline your case", completed: false },
      { id: "tr-2", name: "Plaintiff's evidence", description: "Present your witnesses", completed: false },
      { id: "tr-3", name: "Defendant's evidence", description: "Their witnesses", completed: false },
      { id: "tr-4", name: "Closing submissions", description: "Final arguments", completed: false },
      { id: "tr-5", name: "Judgment", description: "Court's decision", completed: false },
    ],
  },
  {
    id: "post-trial",
    name: "Post-Trial",
    description: "After judgment",
    status: "upcoming",
    estimatedDuration: "Variable",
    courtRule: "O.59 RHC",
    tips: [
      "Appeal deadline is usually 28 days",
      "Consider costs implications",
      "Enforcement may require further applications",
    ],
    documents: ["Notice of Appeal", "Grounds of Appeal", "Enforcement Application"],
    substeps: [
      { id: "post-1", name: "Costs assessment", description: "Determine legal costs", completed: false },
      { id: "post-2", name: "Appeal (if applicable)", description: "Challenge the decision", completed: false },
      { id: "post-3", name: "Enforcement", description: "Collect judgment amount", completed: false },
    ],
  },
];

export const LegalGPS: React.FC<LegalGPSProps> = ({
  onNavigate,
  onAction,
}) => {
  const [caseInfo, setCaseInfo] = React.useState<CaseInfo>({
    caseNumber: "HCA 1646/2023",
    court: "High Court of Hong Kong",
    caseType: "commercial",
    role: "defendant",
    currentStage: "pleadings",
    filedDate: new Date("2023-08-15"),
    nextHearing: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
  });

  const [stages, setStages] = React.useState<CaseStage[]>(litigationStages);
  const [expandedStage, setExpandedStage] = React.useState<string | null>("pleadings");
  const [showSetup, setShowSetup] = React.useState(false);

  const currentStage = stages.find((s) => s.status === "current");
  const completedStages = stages.filter((s) => s.status === "completed").length;
  const totalStages = stages.length;
  const progressPercent = Math.round((completedStages / totalStages) * 100);

  const toggleSubstep = (stageId: string, substepId: string) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              substeps: stage.substeps.map((sub) =>
                sub.id === substepId ? { ...sub, completed: !sub.completed } : sub
              ),
            }
          : stage
      )
    );
  };

  const getStageIcon = (stage: CaseStage) => {
    switch (stage.id) {
      case "pre-action":
        return MessageSquare;
      case "commencement":
        return FileText;
      case "pleadings":
        return Scale;
      case "interlocutory":
        return Gavel;
      case "discovery":
        return BookOpen;
      case "pre-trial":
        return Target;
      case "trial":
        return Users;
      case "post-trial":
        return Flag;
      default:
        return Circle;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Legal GPS
            </h1>
            <p className="text-neutral-500">
              Your step-by-step guide through litigation
            </p>
          </div>
        </div>
      </div>

      {/* Case Summary Bar */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
                  Case Number
                </p>
                <p className="font-semibold text-neutral-900">{caseInfo.caseNumber}</p>
              </div>
              <div className="h-10 w-px bg-emerald-200" />
              <div>
                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
                  Your Role
                </p>
                <p className="font-semibold text-neutral-900 capitalize">{caseInfo.role}</p>
              </div>
              <div className="h-10 w-px bg-emerald-200" />
              <div>
                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
                  Court
                </p>
                <p className="font-semibold text-neutral-900">{caseInfo.court}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSetup(!showSetup)}
            >
              Edit Case Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <Route className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">
                    {progressPercent}%
                  </span>
                  <span className="text-sm text-neutral-500">
                    ({completedStages}/{totalStages} stages)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">You Are Here</p>
                <p className="text-xl font-bold text-blue-900">
                  {currentStage?.name || "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={currentStage?.deadline ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" : ""}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                currentStage?.deadline ? "bg-amber-100" : "bg-neutral-100"
              )}>
                <Calendar className={cn(
                  "w-7 h-7",
                  currentStage?.deadline ? "text-amber-600" : "text-neutral-600"
                )} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">
                  {caseInfo.nextHearing ? "Next Hearing" : "No Upcoming Deadlines"}
                </p>
                {caseInfo.nextHearing && (
                  <p className="text-xl font-bold text-neutral-900">
                    {caseInfo.nextHearing.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Stage Highlight */}
      {currentStage && (
        <Card className="mb-8 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary">Current Stage</Badge>
                  {currentStage.deadline && (
                    <Badge variant="warning">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.ceil(
                        (currentStage.deadline.getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days remaining
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  {currentStage.name}
                </h2>
                <p className="text-blue-700 mb-4">{currentStage.description}</p>

                {/* Next Action */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                    Your Next Action
                  </h3>
                  {currentStage.substeps
                    .filter((s) => !s.completed)
                    .slice(0, 1)
                    .map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-neutral-900">
                            {step.name}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {step.description}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          icon={<Play className="w-4 h-4" />}
                          onClick={() => {
                            if (step.documentTemplate) {
                              onAction?.("new-document", { template: step.documentTemplate });
                            }
                          }}
                        >
                          Start
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Milestone className="w-5 h-5 text-neutral-600" />
          Your Litigation Journey
        </h2>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-neutral-200" />

          {/* Stages */}
          {stages.map((stage, index) => {
            const StageIcon = getStageIcon(stage);
            const isExpanded = expandedStage === stage.id;
            const completedSubsteps = stage.substeps.filter((s) => s.completed).length;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Stage Header */}
                <div
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all",
                    stage.status === "current"
                      ? "bg-blue-50 border border-blue-200"
                      : stage.status === "completed"
                      ? "hover:bg-neutral-50"
                      : "opacity-60 hover:opacity-80"
                  )}
                  onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                      stage.status === "completed"
                        ? "bg-emerald-100"
                        : stage.status === "current"
                        ? "bg-blue-100 ring-4 ring-blue-200"
                        : "bg-neutral-100"
                    )}
                  >
                    {stage.status === "completed" ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <StageIcon
                        className={cn(
                          "w-8 h-8",
                          stage.status === "current"
                            ? "text-blue-600"
                            : "text-neutral-400"
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={cn(
                          "font-semibold",
                          stage.status === "completed"
                            ? "text-emerald-700"
                            : stage.status === "current"
                            ? "text-blue-900"
                            : "text-neutral-600"
                        )}
                      >
                        {stage.name}
                      </h3>
                      {stage.status === "current" && (
                        <Badge variant="primary" size="sm">
                          Current
                        </Badge>
                      )}
                      {stage.courtRule && (
                        <Badge variant="default" size="sm">
                          {stage.courtRule}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 mb-2">
                      {stage.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      {stage.estimatedDuration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {stage.estimatedDuration}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {completedSubsteps}/{stage.substeps.length} steps
                      </span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="pt-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-20"
                    >
                      <div className="p-4 space-y-4">
                        {/* Substeps */}
                        <div className="space-y-2">
                          {stage.substeps.map((substep) => (
                            <div
                              key={substep.id}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border",
                                substep.completed
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-white border-neutral-200"
                              )}
                            >
                              <button
                                className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                                  substep.completed
                                    ? "bg-emerald-500 text-white"
                                    : "border-2 border-neutral-300 hover:border-emerald-500"
                                )}
                                onClick={() => toggleSubstep(stage.id, substep.id)}
                              >
                                {substep.completed && (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "font-medium text-sm",
                                    substep.completed
                                      ? "text-emerald-700 line-through"
                                      : "text-neutral-900"
                                  )}
                                >
                                  {substep.name}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {substep.description}
                                </p>
                              </div>
                              {substep.documentTemplate && !substep.completed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<FileText className="w-4 h-4" />}
                                  onClick={() =>
                                    onAction?.("new-document", {
                                      template: substep.documentTemplate,
                                    })
                                  }
                                >
                                  Draft
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Tips */}
                        {stage.tips && stage.tips.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h4 className="font-medium text-amber-900 flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4" />
                              Tips for this stage
                            </h4>
                            <ul className="space-y-1">
                              {stage.tips.map((tip, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-amber-800 flex items-start gap-2"
                                >
                                  <span className="text-amber-500 mt-1">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Documents */}
                        {stage.documents && stage.documents.length > 0 && (
                          <div>
                            <h4 className="font-medium text-neutral-700 text-sm mb-2">
                              Documents for this stage:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {stage.documents.map((doc) => (
                                <Badge key={doc} variant="default" size="sm">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {doc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-medium text-neutral-900">Quick Actions</h3>
              <p className="text-sm text-neutral-500">
                Common tasks for your current stage
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => onAction?.("new-document")}
              >
                Draft Document
              </Button>
              <Button
                variant="secondary"
                icon={<Calendar className="w-4 h-4" />}
                onClick={() => onNavigate?.("deadlines")}
              >
                View Deadlines
              </Button>
              <Button
                variant="secondary"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={() => onNavigate?.("case-analyzer")}
              >
                Analyze Filing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
