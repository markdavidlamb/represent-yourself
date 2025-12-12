"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Eye,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Info,
  HelpCircle,
  Zap,
  Scale,
  FileText,
  Users,
  Clock,
  DollarSign,
  Brain,
  RefreshCw,
  Download,
  Share2,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, TextArea } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
interface RiskFactor {
  id: string;
  category: "legal" | "evidence" | "procedural" | "practical" | "opponent";
  name: string;
  description: string;
  weight: number; // 1-10
  score: number; // 1-10 (10 = very favorable)
  impact: "positive" | "negative" | "neutral";
  notes?: string;
  recommendation?: string;
}

interface CaseAssessment {
  id: string;
  caseName: string;
  caseNumber: string;
  role: "plaintiff" | "defendant" | "applicant" | "respondent";
  caseType: string;
  assessmentDate: Date;
  overallScore: number;
  riskFactors: RiskFactor[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  probabilityOfSuccess: number;
}

// Risk factor templates
const riskFactorTemplates: Omit<RiskFactor, "id" | "score" | "notes">[] = [
  // Legal factors
  {
    category: "legal",
    name: "Legal Merit",
    description: "Strength of your legal arguments and applicable law",
    weight: 10,
    impact: "neutral",
    recommendation: "Ensure you have clear legal authority supporting your position",
  },
  {
    category: "legal",
    name: "Burden of Proof",
    description: "Which party bears the burden and how difficult to discharge",
    weight: 8,
    impact: "neutral",
    recommendation: "Understand what you need to prove and gather supporting evidence",
  },
  {
    category: "legal",
    name: "Limitation Period",
    description: "Whether claims are within limitation",
    weight: 9,
    impact: "neutral",
    recommendation: "Check applicable limitation periods early",
  },
  {
    category: "legal",
    name: "Jurisdiction Issues",
    description: "Clear jurisdiction or potential challenges",
    weight: 7,
    impact: "neutral",
    recommendation: "Address any jurisdictional issues proactively",
  },
  // Evidence factors
  {
    category: "evidence",
    name: "Documentary Evidence",
    description: "Quality and completeness of documentary support",
    weight: 9,
    impact: "neutral",
    recommendation: "Organize all relevant documents early",
  },
  {
    category: "evidence",
    name: "Witness Availability",
    description: "Availability and credibility of witnesses",
    weight: 8,
    impact: "neutral",
    recommendation: "Identify and prepare witnesses early",
  },
  {
    category: "evidence",
    name: "Corroboration",
    description: "Whether key facts are corroborated by independent evidence",
    weight: 7,
    impact: "neutral",
    recommendation: "Identify independent evidence supporting your version",
  },
  {
    category: "evidence",
    name: "Adverse Evidence",
    description: "Existence of evidence that undermines your case",
    weight: 8,
    impact: "neutral",
    recommendation: "Anticipate and prepare to address adverse evidence",
  },
  // Procedural factors
  {
    category: "procedural",
    name: "Compliance History",
    description: "Track record of procedural compliance",
    weight: 6,
    impact: "neutral",
    recommendation: "Maintain strict procedural compliance going forward",
  },
  {
    category: "procedural",
    name: "Time Constraints",
    description: "Pressure of deadlines and timeline",
    weight: 5,
    impact: "neutral",
    recommendation: "Create a detailed timeline and calendar",
  },
  {
    category: "procedural",
    name: "Interlocutory History",
    description: "Success/failure of previous applications",
    weight: 6,
    impact: "neutral",
    recommendation: "Learn from any previous hearing outcomes",
  },
  // Practical factors
  {
    category: "practical",
    name: "Cost Exposure",
    description: "Potential liability for costs if unsuccessful",
    weight: 7,
    impact: "neutral",
    recommendation: "Budget realistically for all scenarios",
  },
  {
    category: "practical",
    name: "Recovery Prospects",
    description: "Ability to recover judgment if successful",
    weight: 8,
    impact: "neutral",
    recommendation: "Investigate opponent's assets and ability to pay",
  },
  {
    category: "practical",
    name: "Time Investment",
    description: "Personal time and stress involved",
    weight: 5,
    impact: "neutral",
    recommendation: "Plan for the time commitment realistically",
  },
  // Opponent factors
  {
    category: "opponent",
    name: "Opponent Resources",
    description: "Financial resources of opposing party",
    weight: 6,
    impact: "neutral",
    recommendation: "Assess whether opponent can sustain prolonged litigation",
  },
  {
    category: "opponent",
    name: "Opponent Legal Team",
    description: "Quality and experience of opposing lawyers",
    weight: 7,
    impact: "neutral",
    recommendation: "Research opposing counsel's track record",
  },
  {
    category: "opponent",
    name: "Opponent Conduct",
    description: "Opponent's behavior and tactics",
    weight: 5,
    impact: "neutral",
    recommendation: "Document any unreasonable conduct for costs arguments",
  },
];

interface RiskScorecardProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const RiskScorecard: React.FC<RiskScorecardProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"overview" | "assessment" | "results">("overview");
  const [assessment, setAssessment] = React.useState<CaseAssessment | null>(null);
  const [riskFactors, setRiskFactors] = React.useState<RiskFactor[]>([]);
  const [currentCategory, setCurrentCategory] = React.useState<string>("legal");
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [caseInfo, setCaseInfo] = React.useState({
    caseName: "",
    caseNumber: "",
    role: "defendant" as const,
    caseType: "Commercial Dispute",
  });

  // Initialize risk factors
  React.useEffect(() => {
    if (riskFactors.length === 0) {
      setRiskFactors(
        riskFactorTemplates.map((template, index) => ({
          ...template,
          id: index.toString(),
          score: 5, // Default neutral score
        }))
      );
    }
  }, []);

  // Calculate assessment
  const calculateAssessment = async () => {
    setIsCalculating(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Calculate weighted score
    const totalWeight = riskFactors.reduce((sum, f) => sum + f.weight, 0);
    const weightedScore = riskFactors.reduce((sum, f) => sum + f.score * f.weight, 0);
    const overallScore = Math.round((weightedScore / totalWeight) * 10);

    // Determine strengths and weaknesses
    const strengths = riskFactors
      .filter((f) => f.score >= 7)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((f) => `${f.name}: ${f.notes || f.description}`);

    const weaknesses = riskFactors
      .filter((f) => f.score <= 4)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((f) => `${f.name}: ${f.notes || f.description}`);

    // Generate recommendations based on low scores
    const recommendations = riskFactors
      .filter((f) => f.score <= 5)
      .sort((a, b) => a.score * a.weight - b.score * b.weight)
      .slice(0, 5)
      .map((f) => f.recommendation || `Address ${f.name.toLowerCase()}`);

    // Calculate probability of success
    const probabilityOfSuccess = Math.min(
      95,
      Math.max(5, Math.round(overallScore * 10 + (Math.random() - 0.5) * 10))
    );

    const newAssessment: CaseAssessment = {
      id: Date.now().toString(),
      caseName: caseInfo.caseName || "Untitled Case",
      caseNumber: caseInfo.caseNumber,
      role: caseInfo.role,
      caseType: caseInfo.caseType,
      assessmentDate: new Date(),
      overallScore,
      riskFactors: [...riskFactors],
      strengths,
      weaknesses,
      recommendations,
      probabilityOfSuccess,
    };

    setAssessment(newAssessment);
    setIsCalculating(false);
    setView("results");
  };

  // Update risk factor score
  const updateScore = (factorId: string, score: number) => {
    setRiskFactors((prev) =>
      prev.map((f) =>
        f.id === factorId
          ? {
              ...f,
              score,
              impact: score >= 7 ? "positive" : score <= 4 ? "negative" : "neutral",
            }
          : f
      )
    );
  };

  // Update risk factor notes
  const updateNotes = (factorId: string, notes: string) => {
    setRiskFactors((prev) => prev.map((f) => (f.id === factorId ? { ...f, notes } : f)));
  };

  // Get category factors
  const getCategoryFactors = (category: string) =>
    riskFactors.filter((f) => f.category === category);

  // Get category score
  const getCategoryScore = (category: string) => {
    const factors = getCategoryFactors(category);
    if (factors.length === 0) return 0;
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
    return Math.round((weightedScore / totalWeight) * 10);
  };

  // Render overview
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Risk Scorecard</h1>
          <p className="text-neutral-500 mt-1">
            AI-powered assessment of your case strength and risks
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary-50 to-indigo-50 border-primary-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Know Your Position</h2>
              <p className="text-neutral-600 text-sm">
                Get an objective assessment of your case's strengths and weaknesses. Rate each
                factor honestly to get the most accurate analysis. This helps you focus on areas
                that need attention and make informed decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Info */}
      <Card>
        <CardHeader title="Case Information" />
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Case Name"
              placeholder="e.g., ABC Corp v. XYZ Ltd"
              value={caseInfo.caseName}
              onChange={(e) => setCaseInfo({ ...caseInfo, caseName: e.target.value })}
            />
            <Input
              label="Case Number"
              placeholder="e.g., HCA 1646/2023"
              value={caseInfo.caseNumber}
              onChange={(e) => setCaseInfo({ ...caseInfo, caseNumber: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Your Role</label>
              <select
                value={caseInfo.role}
                onChange={(e) => setCaseInfo({ ...caseInfo, role: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200"
              >
                <option value="plaintiff">Plaintiff</option>
                <option value="defendant">Defendant</option>
                <option value="applicant">Applicant</option>
                <option value="respondent">Respondent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Case Type</label>
              <select
                value={caseInfo.caseType}
                onChange={(e) => setCaseInfo({ ...caseInfo, caseType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200"
              >
                <option>Commercial Dispute</option>
                <option>Contract Claim</option>
                <option>Debt Recovery</option>
                <option>Shareholder Dispute</option>
                <option>Professional Negligence</option>
                <option>Property Dispute</option>
                <option>Employment</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Assessment */}
      <div className="text-center py-8">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setView("assessment")}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Start Risk Assessment
        </Button>
        <p className="text-sm text-neutral-500 mt-2">Takes approximately 10-15 minutes</p>
      </div>
    </div>
  );

  // Render assessment
  const renderAssessment = () => {
    const categories = [
      { id: "legal", name: "Legal Factors", icon: <Scale className="w-5 h-5" /> },
      { id: "evidence", name: "Evidence", icon: <FileText className="w-5 h-5" /> },
      { id: "procedural", name: "Procedural", icon: <Clock className="w-5 h-5" /> },
      { id: "practical", name: "Practical", icon: <DollarSign className="w-5 h-5" /> },
      { id: "opponent", name: "Opponent", icon: <Users className="w-5 h-5" /> },
    ];

    const currentFactors = getCategoryFactors(currentCategory);
    const currentIndex = categories.findIndex((c) => c.id === currentCategory);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="w-4 h-4 rotate-180" />}
              onClick={() => setView("overview")}
            >
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Risk Assessment</h1>
              <p className="text-neutral-500 text-sm">
                Rate each factor from 1 (very unfavorable) to 10 (very favorable)
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={calculateAssessment}
            disabled={isCalculating}
            icon={isCalculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          >
            {isCalculating ? "Calculating..." : "Calculate Score"}
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const score = getCategoryScore(category.id);
            return (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors",
                  currentCategory === category.id
                    ? "bg-primary-100 text-primary-700"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
                <Badge
                  variant={score >= 7 ? "success" : score <= 4 ? "error" : "default"}
                  size="sm"
                >
                  {score}/10
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <Card className="bg-neutral-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Assessment Progress</span>
              <span className="text-sm text-neutral-500">
                Category {currentIndex + 1} of {categories.length}
              </span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / categories.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <div className="space-y-4">
          {currentFactors.map((factor) => (
            <RiskFactorCard
              key={factor.id}
              factor={factor}
              onScoreChange={(score) => updateScore(factor.id, score)}
              onNotesChange={(notes) => updateNotes(factor.id, notes)}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              const prevIndex = currentIndex - 1;
              if (prevIndex >= 0) setCurrentCategory(categories[prevIndex].id);
            }}
            disabled={currentIndex === 0}
            icon={<ChevronRight className="w-4 h-4 rotate-180" />}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const nextIndex = currentIndex + 1;
              if (nextIndex < categories.length) {
                setCurrentCategory(categories[nextIndex].id);
              } else {
                calculateAssessment();
              }
            }}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            {currentIndex === categories.length - 1 ? "Calculate" : "Next"}
          </Button>
        </div>
      </div>
    );
  };

  // Render results
  const renderResults = () => {
    if (!assessment) return null;

    const getScoreColor = (score: number) => {
      if (score >= 7) return "text-emerald-600";
      if (score >= 5) return "text-amber-600";
      return "text-red-600";
    };

    const getScoreBg = (score: number) => {
      if (score >= 7) return "bg-emerald-100";
      if (score >= 5) return "bg-amber-100";
      return "bg-red-100";
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="w-4 h-4 rotate-180" />}
              onClick={() => setView("assessment")}
            >
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Risk Assessment Results</h1>
              <p className="text-neutral-500 text-sm">
                {assessment.caseName} • Assessed {assessment.assessmentDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
            <Button
              variant="primary"
              onClick={() => setView("assessment")}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Reassess
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className={cn("border-2", getScoreBg(assessment.overallScore))}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-neutral-700 mb-1">Overall Risk Score</h2>
                <p className="text-neutral-500 text-sm">
                  Based on {assessment.riskFactors.length} weighted risk factors
                </p>
              </div>
              <div className="text-center">
                <div
                  className={cn(
                    "text-6xl font-bold",
                    getScoreColor(assessment.overallScore)
                  )}
                >
                  {assessment.overallScore}
                </div>
                <div className="text-neutral-500">out of 10</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-neutral-600">Estimated Probability of Success</span>
                </div>
                <div className={cn("text-2xl font-bold", getScoreColor(assessment.overallScore))}>
                  {assessment.probabilityOfSuccess}%
                </div>
              </div>
              <div className="mt-2 h-4 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    assessment.probabilityOfSuccess >= 60
                      ? "bg-emerald-500"
                      : assessment.probabilityOfSuccess >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${assessment.probabilityOfSuccess}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader title="Category Breakdown" />
          <CardContent className="p-4">
            <div className="space-y-4">
              {["legal", "evidence", "procedural", "practical", "opponent"].map((category) => {
                const score = getCategoryScore(category);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 capitalize">
                        {category} Factors
                      </span>
                      <span className={cn("font-semibold", getScoreColor(score))}>
                        {score}/10
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          score >= 7 ? "bg-emerald-500" : score >= 5 ? "bg-amber-500" : "bg-red-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 10}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-emerald-200">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-emerald-900">Strengths</h2>
            </div>
            <CardContent className="p-4">
              {assessment.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {assessment.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">
                  No strong factors identified. Focus on improving your weak areas.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold text-red-900">Weaknesses</h2>
            </div>
            <CardContent className="p-4">
              {assessment.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {assessment.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">
                  No major weaknesses identified. Your case appears strong.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4 border-b border-blue-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-blue-900">Recommendations</h2>
          </div>
          <CardContent className="p-4">
            <ul className="space-y-3">
              {assessment.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-neutral-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-neutral-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-600">
                <strong>Disclaimer:</strong> This assessment is for informational purposes only
                and does not constitute legal advice. The probability estimates are based on the
                factors you provided and should not be relied upon as predictions of actual
                outcomes. Every case is unique and court outcomes can be unpredictable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "overview" && renderOverview()}
        {view === "assessment" && renderAssessment()}
        {view === "results" && renderResults()}
      </AnimatePresence>
    </div>
  );
};

// Risk Factor Card Component
interface RiskFactorCardProps {
  factor: RiskFactor;
  onScoreChange: (score: number) => void;
  onNotesChange: (notes: string) => void;
}

const RiskFactorCard: React.FC<RiskFactorCardProps> = ({
  factor,
  onScoreChange,
  onNotesChange,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-emerald-500";
    if (score >= 5) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Very Favorable";
    if (score >= 6) return "Favorable";
    if (score >= 5) return "Neutral";
    if (score >= 3) return "Unfavorable";
    return "Very Unfavorable";
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-neutral-900">{factor.name}</h3>
              <Badge variant="default" size="sm">
                Weight: {factor.weight}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500 mb-4">{factor.description}</p>

            {/* Score Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Your Assessment</span>
                <span className={cn("text-sm font-medium", factor.score >= 7 ? "text-emerald-600" : factor.score <= 4 ? "text-red-600" : "text-amber-600")}>
                  {factor.score}/10 - {getScoreLabel(factor.score)}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={factor.score}
                onChange={(e) => onScoreChange(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Very Unfavorable</span>
                <span>Neutral</span>
                <span>Very Favorable</span>
              </div>
            </div>

            {/* Expand for notes */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-primary-600 mt-3 hover:text-primary-700"
            >
              <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
              {expanded ? "Hide notes" : "Add notes"}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3">
                    <TextArea
                      placeholder="Add specific details about this factor for your case..."
                      rows={2}
                      value={factor.notes || ""}
                      onChange={(e) => onNotesChange(e.target.value)}
                    />
                    {factor.recommendation && (
                      <p className="text-xs text-primary-600 mt-2 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 mt-0.5" />
                        {factor.recommendation}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Score indicator */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
                getScoreColor(factor.score)
              )}
            >
              {factor.score}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
