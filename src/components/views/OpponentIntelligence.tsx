"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Scale,
  Eye,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Sword,
  Info,
  Lightbulb,
  Award,
  X,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput, TextArea } from "../ui/Input";
import { Badge, StatusBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
interface OpponentProfile {
  id: string;
  name: string;
  type: "law_firm" | "barrister" | "solicitor" | "in_house" | "self_rep";
  firmName?: string;
  yearsExperience?: number;
  specializations: string[];
  notes: string;
  createdAt: Date;
}

interface CaseRecord {
  id: string;
  caseNumber: string;
  caseName: string;
  court: string;
  year: number;
  outcome: "won" | "lost" | "settled" | "ongoing" | "unknown";
  role: "plaintiff" | "defendant" | "applicant" | "respondent";
  caseType: string;
  keyTactics: string[];
  notes?: string;
  citation?: string;
}

interface TacticPattern {
  tactic: string;
  frequency: number;
  successRate: number;
  description: string;
  counterStrategy: string;
}

interface FilingPattern {
  type: string;
  averageDelay: number; // days
  frequency: number;
  notes: string;
}

interface OpponentIntelligenceProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const OpponentIntelligence: React.FC<OpponentIntelligenceProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"overview" | "profile" | "analysis">("overview");
  const [opponents, setOpponents] = React.useState<OpponentProfile[]>([]);
  const [selectedOpponent, setSelectedOpponent] = React.useState<OpponentProfile | null>(null);
  const [caseRecords, setCaseRecords] = React.useState<CaseRecord[]>([]);
  const [showAddOpponent, setShowAddOpponent] = React.useState(false);
  const [showAddCase, setShowAddCase] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [newOpponent, setNewOpponent] = React.useState<Partial<OpponentProfile>>({
    type: "law_firm",
    specializations: [],
  });
  const [newCase, setNewCase] = React.useState<Partial<CaseRecord>>({
    outcome: "unknown",
    role: "plaintiff",
    keyTactics: [],
  });

  // Sample data
  React.useEffect(() => {
    if (opponents.length === 0) {
      const sampleOpponents: OpponentProfile[] = [
        {
          id: "1",
          name: "Tanner De Witt",
          type: "law_firm",
          yearsExperience: 30,
          specializations: ["Commercial Litigation", "Insolvency", "Fraud"],
          notes: "Major HK litigation firm. Known for aggressive tactics and high billing.",
          createdAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          name: "John Smith",
          type: "barrister",
          firmName: "Temple Chambers",
          yearsExperience: 15,
          specializations: ["Commercial Law", "Contract Disputes"],
          notes: "Senior Counsel. Methodical approach, strong on procedural matters.",
          createdAt: new Date("2024-02-01"),
        },
      ];

      const sampleCases: CaseRecord[] = [
        {
          id: "1",
          caseNumber: "HCA 1234/2022",
          caseName: "ABC Corp v. XYZ Ltd",
          court: "High Court",
          year: 2022,
          outcome: "won",
          role: "plaintiff",
          caseType: "Commercial Dispute",
          keyTactics: ["Summary judgment application", "Extensive discovery requests", "Cost threats"],
          citation: "[2022] HKCFI 1234",
        },
        {
          id: "2",
          caseNumber: "HCA 5678/2021",
          caseName: "DEF Holdings v. GHI Investment",
          court: "High Court",
          year: 2021,
          outcome: "lost",
          role: "plaintiff",
          caseType: "Shareholder Dispute",
          keyTactics: ["Mareva injunction", "Anton Piller order attempt"],
          notes: "Failed to obtain injunctive relief - weak evidence",
          citation: "[2021] HKCFI 5678",
        },
        {
          id: "3",
          caseNumber: "HCA 9012/2023",
          caseName: "JKL Finance v. MNO Trading",
          court: "High Court",
          year: 2023,
          outcome: "settled",
          role: "defendant",
          caseType: "Debt Recovery",
          keyTactics: ["Delay tactics", "Procedural challenges", "Security for costs"],
        },
        {
          id: "4",
          caseNumber: "HCMP 3456/2022",
          caseName: "PQR v. STU",
          court: "High Court",
          year: 2022,
          outcome: "won",
          role: "applicant",
          caseType: "Committal",
          keyTactics: ["Contempt application", "Personal service requirements"],
        },
        {
          id: "5",
          caseNumber: "HCA 7890/2020",
          caseName: "VWX Ltd v. YZ Corp",
          court: "High Court",
          year: 2020,
          outcome: "lost",
          role: "plaintiff",
          caseType: "Professional Negligence",
          keyTactics: ["Expert evidence", "Document heavy approach"],
          notes: "Lost on causation - damages not proven",
        },
      ];

      setOpponents(sampleOpponents);
      setCaseRecords(sampleCases);
      setSelectedOpponent(sampleOpponents[0]);
    }
  }, []);

  // Calculate statistics
  const calculateStats = React.useMemo(() => {
    if (caseRecords.length === 0) return null;

    const total = caseRecords.length;
    const won = caseRecords.filter((c) => c.outcome === "won").length;
    const lost = caseRecords.filter((c) => c.outcome === "lost").length;
    const settled = caseRecords.filter((c) => c.outcome === "settled").length;
    const ongoing = caseRecords.filter((c) => c.outcome === "ongoing").length;

    const winRate = total > 0 ? Math.round((won / (won + lost)) * 100) : 0;

    // Tactic frequency
    const tacticCounts: Record<string, { count: number; wins: number }> = {};
    caseRecords.forEach((c) => {
      c.keyTactics.forEach((t) => {
        if (!tacticCounts[t]) tacticCounts[t] = { count: 0, wins: 0 };
        tacticCounts[t].count++;
        if (c.outcome === "won") tacticCounts[t].wins++;
      });
    });

    const tactics: TacticPattern[] = Object.entries(tacticCounts)
      .map(([tactic, data]) => ({
        tactic,
        frequency: data.count,
        successRate: Math.round((data.wins / data.count) * 100),
        description: getTacticDescription(tactic),
        counterStrategy: getCounterStrategy(tactic),
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Role analysis
    const asPlaintiff = caseRecords.filter((c) => c.role === "plaintiff" || c.role === "applicant");
    const asDefendant = caseRecords.filter((c) => c.role === "defendant" || c.role === "respondent");
    const plaintiffWinRate =
      asPlaintiff.length > 0
        ? Math.round(
            (asPlaintiff.filter((c) => c.outcome === "won").length /
              asPlaintiff.filter((c) => c.outcome === "won" || c.outcome === "lost").length) *
              100
          )
        : 0;
    const defendantWinRate =
      asDefendant.length > 0
        ? Math.round(
            (asDefendant.filter((c) => c.outcome === "won").length /
              asDefendant.filter((c) => c.outcome === "won" || c.outcome === "lost").length) *
              100
          )
        : 0;

    return {
      total,
      won,
      lost,
      settled,
      ongoing,
      winRate,
      tactics,
      asPlaintiff: asPlaintiff.length,
      asDefendant: asDefendant.length,
      plaintiffWinRate,
      defendantWinRate,
    };
  }, [caseRecords]);

  // Helper functions
  function getTacticDescription(tactic: string): string {
    const descriptions: Record<string, string> = {
      "Summary judgment application": "Attempt to win case without trial by arguing no triable issues",
      "Extensive discovery requests": "Burdensome document requests to increase costs and find weaknesses",
      "Cost threats": "Threatening adverse costs orders to pressure settlement",
      "Mareva injunction": "Freezing order to prevent asset dissipation",
      "Anton Piller order attempt": "Search order to preserve evidence",
      "Delay tactics": "Procedural maneuvers to extend timeline and increase costs",
      "Procedural challenges": "Technical objections to procedural compliance",
      "Security for costs": "Application requiring opponent to provide security for legal costs",
      "Contempt application": "Committal proceedings for breach of court orders",
      "Expert evidence": "Heavy reliance on expert witnesses",
      "Document heavy approach": "Strategy based on documentary evidence",
      "Personal service requirements": "Strict insistence on proper service",
    };
    return descriptions[tactic] || "Litigation tactic used in proceedings";
  }

  function getCounterStrategy(tactic: string): string {
    const counters: Record<string, string> = {
      "Summary judgment application":
        "Show triable issues exist with credible evidence. File detailed affirmation showing disputed facts.",
      "Extensive discovery requests":
        "Object to irrelevant/oppressive requests. Apply for protective order if fishing expedition.",
      "Cost threats":
        "Assess realistically. Consider protective costs order if public interest. Document unreasonable conduct.",
      "Mareva injunction":
        "Challenge on grounds: no real risk of dissipation, legitimate business needs, disproportionate.",
      "Anton Piller order attempt": "Argue no real risk of destruction, confidentiality concerns, disproportionate.",
      "Delay tactics": "Apply for unless orders. Seek costs thrown away. Document pattern for costs hearing.",
      "Procedural challenges": "Ensure strict compliance. Cure defects promptly. Apply to court for directions.",
      "Security for costs":
        "Show means to pay costs. Demonstrate merits. Argue stifling of genuine claim. Offer alternative security.",
      "Contempt application": "Ensure full compliance with orders. Apologize and purge contempt if breach occurred.",
      "Expert evidence": "Engage equally qualified expert. Challenge methodology. Seek hot-tubbing.",
      "Document heavy approach": "Organize documents meticulously. Create clear chronology. Challenge authenticity if appropriate.",
      "Personal service requirements": "Ensure proper service. Maintain detailed service records. Use process servers.",
    };
    return counters[tactic] || "Research and prepare targeted response to this tactic.";
  }

  // Add opponent
  const addOpponent = () => {
    if (!newOpponent.name) return;

    const opponent: OpponentProfile = {
      id: Date.now().toString(),
      name: newOpponent.name,
      type: newOpponent.type as OpponentProfile["type"],
      firmName: newOpponent.firmName,
      yearsExperience: newOpponent.yearsExperience,
      specializations: newOpponent.specializations || [],
      notes: newOpponent.notes || "",
      createdAt: new Date(),
    };

    setOpponents((prev) => [...prev, opponent]);
    setShowAddOpponent(false);
    setNewOpponent({ type: "law_firm", specializations: [] });
  };

  // Add case record
  const addCaseRecord = () => {
    if (!newCase.caseNumber || !newCase.caseName) return;

    const record: CaseRecord = {
      id: Date.now().toString(),
      caseNumber: newCase.caseNumber,
      caseName: newCase.caseName,
      court: newCase.court || "High Court",
      year: newCase.year || new Date().getFullYear(),
      outcome: newCase.outcome as CaseRecord["outcome"],
      role: newCase.role as CaseRecord["role"],
      caseType: newCase.caseType || "Commercial",
      keyTactics: newCase.keyTactics || [],
      notes: newCase.notes,
      citation: newCase.citation,
    };

    setCaseRecords((prev) => [...prev, record]);
    setShowAddCase(false);
    setNewCase({ outcome: "unknown", role: "plaintiff", keyTactics: [] });
  };

  // Render overview
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Opponent Intelligence</h1>
          <p className="text-neutral-500 mt-1">
            Know thy enemy - track opposing counsel's tactics and patterns
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddOpponent(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Opponent
        </Button>
      </div>

      {/* Opponent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {opponents.map((opponent) => (
          <Card
            key={opponent.id}
            variant="interactive"
            onClick={() => {
              setSelectedOpponent(opponent);
              setView("profile");
            }}
            className={cn(
              selectedOpponent?.id === opponent.id && "ring-2 ring-primary-500"
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  {opponent.type === "law_firm" ? (
                    <Building2 className="w-6 h-6" />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900">{opponent.name}</h3>
                  {opponent.firmName && (
                    <p className="text-sm text-neutral-500">{opponent.firmName}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {opponent.specializations.slice(0, 2).map((spec) => (
                      <Badge key={spec} variant="default" size="sm">
                        {spec}
                      </Badge>
                    ))}
                    {opponent.specializations.length > 2 && (
                      <Badge variant="default" size="sm">
                        +{opponent.specializations.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </CardContent>
          </Card>
        ))}

        {opponents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Target className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No opponents tracked yet</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setShowAddOpponent(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Your First Opponent
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {calculateStats && selectedOpponent && (
        <Card>
          <CardHeader title={`Quick Analysis: ${selectedOpponent.name}`} />
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900">{calculateStats.total}</div>
                <div className="text-sm text-neutral-500">Total Cases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{calculateStats.winRate}%</div>
                <div className="text-sm text-neutral-500">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{calculateStats.plaintiffWinRate}%</div>
                <div className="text-sm text-neutral-500">As Plaintiff</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{calculateStats.defendantWinRate}%</div>
                <div className="text-sm text-neutral-500">As Defendant</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant="primary"
                onClick={() => setView("analysis")}
                icon={<BarChart3 className="w-4 h-4" />}
              >
                View Full Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render profile view
  const renderProfile = () => {
    if (!selectedOpponent) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight className="w-4 h-4 rotate-180" />}
            onClick={() => setView("overview")}
          >
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-neutral-900">{selectedOpponent.name}</h1>
            <p className="text-neutral-500 text-sm">
              {selectedOpponent.type === "law_firm" ? "Law Firm" : "Individual"} •{" "}
              {selectedOpponent.yearsExperience} years experience
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setView("analysis")}
              icon={<BarChart3 className="w-4 h-4" />}
            >
              Analysis
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddCase(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Case
            </Button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Card */}
          <Card>
            <CardHeader title="Profile" />
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase">Type</label>
                <p className="text-neutral-900 capitalize">{selectedOpponent.type.replace("_", " ")}</p>
              </div>
              {selectedOpponent.firmName && (
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase">Firm</label>
                  <p className="text-neutral-900">{selectedOpponent.firmName}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase">Specializations</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedOpponent.specializations.map((spec) => (
                    <Badge key={spec} variant="default" size="sm">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase">Notes</label>
                <p className="text-neutral-700 text-sm">{selectedOpponent.notes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Case Records */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title={`Case History (${caseRecords.length})`} />
              <CardContent className="p-0">
                <div className="divide-y divide-neutral-100">
                  {caseRecords.map((record) => (
                    <div key={record.id} className="p-4 hover:bg-neutral-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">{record.caseNumber}</span>
                            <Badge
                              variant={
                                record.outcome === "won"
                                  ? "success"
                                  : record.outcome === "lost"
                                  ? "error"
                                  : record.outcome === "settled"
                                  ? "warning"
                                  : "default"
                              }
                              size="sm"
                            >
                              {record.outcome}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">{record.caseName}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {record.court} • {record.year} • {record.role}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                          Details
                        </Button>
                      </div>
                      {record.keyTactics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {record.keyTactics.map((tactic) => (
                            <span
                              key={tactic}
                              className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded"
                            >
                              {tactic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Render analysis view
  const renderAnalysis = () => {
    if (!selectedOpponent || !calculateStats) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight className="w-4 h-4 rotate-180" />}
            onClick={() => setView("profile")}
          >
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              Tactical Analysis: {selectedOpponent.name}
            </h1>
            <p className="text-neutral-500 text-sm">
              Based on {calculateStats.total} tracked cases
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{calculateStats.won}</div>
              <div className="text-sm text-neutral-500">Won</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{calculateStats.lost}</div>
              <div className="text-sm text-neutral-500">Lost</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{calculateStats.settled}</div>
              <div className="text-sm text-neutral-500">Settled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{calculateStats.ongoing}</div>
              <div className="text-sm text-neutral-500">Ongoing</div>
            </CardContent>
          </Card>
          <Card className="bg-primary-50 border-primary-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-700">{calculateStats.winRate}%</div>
              <div className="text-sm text-primary-600">Win Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Tactics Analysis */}
        <Card>
          <CardHeader
            title="Favorite Tactics & Counter-Strategies"
            icon={<Sword className="w-5 h-5 text-red-500" />}
          />
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-100">
              {calculateStats.tactics.map((tactic, index) => (
                <div key={tactic.tactic} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">{tactic.tactic}</h3>
                        <p className="text-sm text-neutral-500">{tactic.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-neutral-900">
                        Used {tactic.frequency}x
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          tactic.successRate >= 50 ? "text-red-600" : "text-emerald-600"
                        )}
                      >
                        {tactic.successRate}% success
                      </div>
                    </div>
                  </div>
                  <div className="ml-11 mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-emerald-800 uppercase">
                          Counter-Strategy
                        </span>
                        <p className="text-sm text-emerald-700 mt-1">{tactic.counterStrategy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-emerald-200">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-emerald-900">Their Strengths</h2>
            </div>
            <CardContent className="p-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckMark className="text-emerald-500" />
                  <span className="text-sm text-neutral-700">
                    Strong on procedural matters and technical objections
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckMark className="text-emerald-500" />
                  <span className="text-sm text-neutral-700">
                    Experienced with interlocutory applications
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckMark className="text-emerald-500" />
                  <span className="text-sm text-neutral-700">
                    Aggressive discovery and document requests
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckMark className="text-emerald-500" />
                  <span className="text-sm text-neutral-700">
                    Better win rate as plaintiff ({calculateStats.plaintiffWinRate}%)
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold text-red-900">Their Weaknesses</h2>
            </div>
            <CardContent className="p-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">
                    Weaker when defending ({calculateStats.defendantWinRate}% win rate)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">
                    Injunctive relief applications often fail
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">
                    Settlement rate suggests may fold under pressure
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">
                    Weak on proving causation and damages
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Recommendations */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4 border-b border-blue-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-blue-900">Strategic Recommendations</h2>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <h3 className="font-medium text-neutral-900 mb-2">Preparation</h3>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Ensure strict procedural compliance from day one</li>
                  <li>• Prepare detailed evidence bundles early</li>
                  <li>• Anticipate aggressive discovery requests</li>
                  <li>• Budget for interlocutory skirmishes</li>
                </ul>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <h3 className="font-medium text-neutral-900 mb-2">During Proceedings</h3>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Document all unreasonable conduct for costs</li>
                  <li>• Push for early case management directions</li>
                  <li>• Consider proactive strike-out if frivolous claims</li>
                  <li>• Apply cost pressure through Calderbank offers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Checkmark component
  const CheckMark = ({ className }: { className?: string }) => (
    <svg className={cn("w-4 h-4 flex-shrink-0 mt-0.5", className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  // Add Opponent Modal
  const renderAddOpponentModal = () => (
    <AnimatePresence>
      {showAddOpponent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddOpponent(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">Add Opponent</h2>
                <button
                  onClick={() => setShowAddOpponent(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Name"
                  placeholder="Opponent name or firm"
                  value={newOpponent.name || ""}
                  onChange={(e) => setNewOpponent({ ...newOpponent, name: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "law_firm", label: "Law Firm" },
                      { value: "barrister", label: "Barrister" },
                      { value: "solicitor", label: "Solicitor" },
                      { value: "in_house", label: "In-House" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setNewOpponent({ ...newOpponent, type: type.value as any })}
                        className={cn(
                          "p-2 rounded-lg border text-sm font-medium transition-colors",
                          newOpponent.type === type.value
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Firm Name (if applicable)"
                  placeholder="e.g., Temple Chambers"
                  value={newOpponent.firmName || ""}
                  onChange={(e) => setNewOpponent({ ...newOpponent, firmName: e.target.value })}
                />

                <Input
                  label="Years Experience"
                  type="number"
                  placeholder="e.g., 15"
                  value={newOpponent.yearsExperience?.toString() || ""}
                  onChange={(e) =>
                    setNewOpponent({ ...newOpponent, yearsExperience: parseInt(e.target.value) || 0 })
                  }
                />

                <TextArea
                  label="Notes"
                  placeholder="Any notes about this opponent..."
                  rows={3}
                  value={newOpponent.notes || ""}
                  onChange={(e) => setNewOpponent({ ...newOpponent, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddOpponent(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={addOpponent}>
                  Add Opponent
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Add Case Modal
  const renderAddCaseModal = () => (
    <AnimatePresence>
      {showAddCase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddCase(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">Add Case Record</h2>
                <button
                  onClick={() => setShowAddCase(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Case Number"
                    placeholder="e.g., HCA 1234/2023"
                    value={newCase.caseNumber || ""}
                    onChange={(e) => setNewCase({ ...newCase, caseNumber: e.target.value })}
                  />
                  <Input
                    label="Year"
                    type="number"
                    placeholder="2023"
                    value={newCase.year?.toString() || ""}
                    onChange={(e) => setNewCase({ ...newCase, year: parseInt(e.target.value) })}
                  />
                </div>

                <Input
                  label="Case Name"
                  placeholder="e.g., ABC Corp v. XYZ Ltd"
                  value={newCase.caseName || ""}
                  onChange={(e) => setNewCase({ ...newCase, caseName: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Outcome</label>
                    <select
                      value={newCase.outcome}
                      onChange={(e) => setNewCase({ ...newCase, outcome: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200"
                    >
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                      <option value="settled">Settled</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Their Role</label>
                    <select
                      value={newCase.role}
                      onChange={(e) => setNewCase({ ...newCase, role: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200"
                    >
                      <option value="plaintiff">Plaintiff</option>
                      <option value="defendant">Defendant</option>
                      <option value="applicant">Applicant</option>
                      <option value="respondent">Respondent</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Case Type"
                  placeholder="e.g., Commercial Dispute"
                  value={newCase.caseType || ""}
                  onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
                />

                <TextArea
                  label="Notes"
                  placeholder="Key observations about this case..."
                  rows={3}
                  value={newCase.notes || ""}
                  onChange={(e) => setNewCase({ ...newCase, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddCase(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={addCaseRecord}>
                  Add Case
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "overview" && renderOverview()}
        {view === "profile" && renderProfile()}
        {view === "analysis" && renderAnalysis()}
      </AnimatePresence>
      {renderAddOpponentModal()}
      {renderAddCaseModal()}
    </div>
  );
};
