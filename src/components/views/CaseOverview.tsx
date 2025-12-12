"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Scale,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Shield,
  Gavel,
  ChevronRight,
  ArrowRight,
  Flag,
  AlertCircle,
  Trophy,
  Timer,
  Upload,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";
import { loadCaseData, CaseData } from "@/lib/case-store";

interface CaseOverviewProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({ onNavigate, onAction }) => {
  // Load case data from localStorage (AI-generated from uploaded documents)
  const [caseData, setCaseData] = React.useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const data = loadCaseData();
    setCaseData(data);
    setIsLoading(false);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your case...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no case data
  if (!caseData || !caseData.case.caseNumber) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Welcome to Represent Yourself
          </h1>
          <p className="text-lg text-neutral-600 max-w-xl mx-auto mb-8">
            Upload your legal documents and our AI will analyze them to help you
            understand your case, track deadlines, and prepare your strategy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">1. Upload Documents</h3>
                <p className="text-sm text-neutral-500">
                  Court filings, pleadings, correspondence, evidence - upload everything related to your case.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">2. AI Analysis</h3>
                <p className="text-sm text-neutral-500">
                  Our AI extracts key information, identifies parties, dates, claims, and builds your case profile.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">3. Get Guidance</h3>
                <p className="text-sm text-neutral-500">
                  Receive strategic recommendations, deadline alerts, and help drafting your responses.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => onNavigate?.("evidence-manager")}
              icon={<Upload className="w-5 h-5" />}
            >
              Upload Documents
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate?.("ai-assistant")}
              icon={<Sparkles className="w-5 h-5" />}
            >
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate days until hearing (with safety check)
  const nextHearingDate = caseData.nextHearing?.date ? new Date(caseData.nextHearing.date) : null;
  const today = new Date();
  const daysUntilHearing = nextHearingDate
    ? Math.ceil((nextHearingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Get priority applications
  const highPriorityApps = caseData.applications?.filter(app => app.priority === "high") || [];
  const pendingApps = caseData.applications?.filter(app =>
    app.status === "Pending" || app.status === "TO DO" || app.status.includes("New")
  ) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Case Summary */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Case Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="pt-6 pb-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="warning" size="sm" className="mb-3">Active Litigation</Badge>
                  <h1 className="text-3xl font-bold mb-1">{caseData.case.caseNumber}</h1>
                  <p className="text-slate-300 text-sm">{caseData.case.court}</p>
                  <div className="flex items-center gap-2 mt-3 text-slate-400 text-sm">
                    <Gavel className="w-4 h-4" />
                    <span>Judge: {caseData.case.caseManagementJudge}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm mb-1">Your Role</p>
                  <p className="text-xl font-semibold">1st Defendant</p>
                  <Badge variant="info" size="sm" className="mt-2">Self-Represented</Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Victories</p>
                  <p className="text-2xl font-bold text-emerald-400">2</p>
                  <p className="text-xs text-slate-500">Kent Yee rulings</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Pending</p>
                  <p className="text-2xl font-bold text-amber-400">{pendingApps.length}</p>
                  <p className="text-xs text-slate-500">Applications</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Related</p>
                  <p className="text-2xl font-bold text-blue-400">1</p>
                  <p className="text-xs text-slate-500">HCMP 2344/2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hearing Countdown - only show if we have hearing data */}
        {daysUntilHearing !== null && nextHearingDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-80"
          >
            <Card className={cn(
              "h-full border-2",
              daysUntilHearing <= 30 ? "border-red-200 bg-red-50" :
              daysUntilHearing <= 60 ? "border-amber-200 bg-amber-50" :
              "border-emerald-200 bg-emerald-50"
            )}>
              <CardContent className="pt-6 text-center">
                <Timer className={cn(
                  "w-12 h-12 mx-auto mb-3",
                  daysUntilHearing <= 30 ? "text-red-600" :
                  daysUntilHearing <= 60 ? "text-amber-600" :
                  "text-emerald-600"
                )} />
                <p className="text-sm text-neutral-500 mb-2">Next Hearing</p>
                <p className={cn(
                  "text-5xl font-bold mb-1",
                  daysUntilHearing <= 30 ? "text-red-700" :
                  daysUntilHearing <= 60 ? "text-amber-700" :
                  "text-emerald-700"
                )}>{daysUntilHearing}</p>
                <p className="text-sm text-neutral-600 mb-4">days remaining</p>
                <div className="text-left bg-white/70 rounded-lg p-3">
                  <p className="font-medium text-neutral-900">
                    {nextHearingDate.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Before {caseData.nextHearing?.judge || "Judge TBD"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Urgent Actions */}
      {highPriorityApps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">High Priority Actions Required</h3>
                  <p className="text-sm text-red-700">{highPriorityApps.length} items need your attention before Jan 22</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {highPriorityApps.map((app, i) => (
                  <button
                    key={i}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 hover:border-red-300 hover:shadow-md transition-all text-left"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      app.status === "TO DO" ? "bg-amber-100 text-amber-600" :
                      app.status.includes("New") ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-600"
                    )}>
                      {app.status === "TO DO" ? <Flag className="w-4 h-4" /> :
                       app.status.includes("New") ? <AlertCircle className="w-4 h-4" /> :
                       <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 text-sm">{app.type}</p>
                      <p className="text-xs text-neutral-500 truncate">{app.nextStep}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader
              title="Applications Status"
              description="Current applications and their status"
              icon={<Scale className="w-5 h-5" />}
            />
            <CardContent>
              <div className="space-y-3">
                {caseData.applications.map((app, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md",
                      app.priority === "high" ? "border-red-200 bg-red-50/50" :
                      app.priority === "medium" ? "border-amber-200 bg-amber-50/50" :
                      "border-neutral-200 bg-neutral-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      app.filedBy.includes("Plaintiffs") ? "bg-red-100 text-red-600" :
                      app.filedBy.includes("Mark") ? "bg-emerald-100 text-emerald-600" :
                      "bg-amber-100 text-amber-600"
                    )}>
                      {app.type === "Committal" ? <AlertTriangle className="w-6 h-6" /> :
                       app.type === "Summary Judgment" ? <Gavel className="w-6 h-6" /> :
                       app.type === "Security for Costs" ? <Shield className="w-6 h-6" /> :
                       <FileText className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-neutral-900">{app.type}</h4>
                        <Badge
                          variant={
                            app.status === "TO DO" ? "warning" :
                            app.status.includes("New") ? "error" :
                            app.status === "Pending" ? "info" :
                            "default"
                          }
                          size="sm"
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-500">{app.yourPosition}</p>
                      <p className="text-xs text-neutral-400 mt-1">Filed by: {app.filedBy}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-neutral-400 mb-1">Next Step</p>
                      <p className="text-sm font-medium text-primary-600">{app.nextStep}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Case Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Your Strengths */}
          <Card className="border-emerald-200">
            <CardHeader
              title="Your Strengths"
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            />
            <CardContent>
              <ul className="space-y-2">
                {caseData.yourStrengths.slice(0, 4).map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Their Weaknesses */}
          <Card className="border-amber-200">
            <CardHeader
              title="Their Weaknesses"
              icon={<TrendingDown className="w-5 h-5 text-amber-600" />}
            />
            <CardContent>
              <ul className="space-y-2">
                {caseData.theirWeaknesses.slice(0, 4).map((weakness, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Financial Summary - only show if data exists */}
          {caseData.financials && (
            <Card>
              <CardHeader
                title="Financial Summary"
                icon={<DollarSign className="w-5 h-5" />}
              />
              <CardContent>
                <div className="space-y-3">
                  {caseData.financials.securityForCosts && (
                    <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                      <span className="text-sm text-neutral-600">Security Sought</span>
                      <span className="font-semibold text-neutral-900">
                        {caseData.financials.securityForCosts.currency}${(caseData.financials.securityForCosts.amount / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  )}
                  {caseData.financials.legalFees && Object.entries(caseData.financials.legalFees).map(([key, fees]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-600">Legal Fees ({key})</span>
                        <span className="font-semibold text-neutral-900">
                          {fees.currency}${(fees.total / 1000).toFixed(0)}K
                        </span>
                      </div>
                      {fees.outstanding > 0 && (
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-sm text-red-700">Outstanding</span>
                          <span className="font-semibold text-red-700">
                            {fees.currency}${(fees.outstanding / 1000).toFixed(0)}K
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Timeline section - only show if timeline exists */}
      {caseData.timeline && caseData.timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader
              title="Recent Timeline"
              description="Key events in your case"
              icon={<Target className="w-5 h-5" />}
            />
            <CardContent>
              <div className="space-y-3">
                {caseData.timeline.slice(-8).map((event, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg",
                      event.type === "victory" ? "bg-emerald-50 border border-emerald-100" :
                      event.type === "upcoming" ? "bg-amber-50 border border-amber-100" :
                      "bg-neutral-50"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      event.type === "victory" ? "bg-emerald-500" :
                      event.type === "upcoming" ? "bg-amber-500" :
                      event.type === "yours" ? "bg-primary-500" :
                      "bg-neutral-400"
                    )} />
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500">{event.date}</p>
                      <p className="text-sm text-neutral-900">{event.event}</p>
                    </div>
                    {event.type === "victory" && (
                      <Trophy className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Parties - only show if parties data exists */}
      {caseData.parties && (caseData.parties.plaintiffs.length > 0 || caseData.parties.defendants.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader
              title="Parties"
              description={`All parties in ${caseData.case.caseNumber}`}
              icon={<Users className="w-5 h-5" />}
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plaintiffs */}
                {caseData.parties.plaintiffs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">Plaintiffs</h4>
                    <div className="space-y-3">
                      {caseData.parties.plaintiffs.map((p, i) => (
                        <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-neutral-900">{p.name}</span>
                            <Badge variant="error" size="sm">{p.designation}</Badge>
                          </div>
                          {p.jurisdiction && <p className="text-xs text-neutral-500">Jurisdiction: {p.jurisdiction}</p>}
                          {p.controlledBy && p.controlledBy.length > 0 && (
                            <p className="text-xs text-neutral-500">Controlled by: {p.controlledBy.join(", ")}</p>
                          )}
                        </div>
                      ))}
                      {caseData.parties.opposingSolicitors?.firm && (
                        <div className="p-3 bg-neutral-50 rounded-lg">
                          <p className="text-xs text-neutral-500">Solicitors</p>
                          <p className="font-medium text-neutral-900">{caseData.parties.opposingSolicitors.firm}</p>
                          {caseData.parties.opposingSolicitors.partner && (
                            <p className="text-xs text-neutral-500">Partner: {caseData.parties.opposingSolicitors.partner}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Defendants */}
                {caseData.parties.defendants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">Defendants</h4>
                    <div className="space-y-3">
                      {caseData.parties.defendants.map((d, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3 rounded-lg border",
                            d.isYou ? "bg-primary-50 border-primary-200" :
                            d.status === "Discontinued" ? "bg-neutral-50 border-neutral-200 opacity-60" :
                            "bg-blue-50 border-blue-100"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-neutral-900">
                              {d.name}
                              {d.isYou && <span className="text-primary-600 ml-2">(You)</span>}
                            </span>
                            <Badge
                              variant={
                                d.isYou ? "primary" :
                                d.status === "Discontinued" ? "default" :
                                "info"
                              }
                              size="sm"
                            >
                              {d.designation}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500">Status: {d.status}</p>
                          {d.representedBy && <p className="text-xs text-neutral-500">Represented: {d.representedBy}</p>}
                          {d.notes && <p className="text-xs text-amber-600 mt-1">{d.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Button
          variant="secondary"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigate?.("document-drafting")}
        >
          <FileText className="w-6 h-6" />
          <span>Draft Document</span>
        </Button>
        <Button
          variant="secondary"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigate?.("evidence-manager")}
        >
          <FileText className="w-6 h-6" />
          <span>View Evidence</span>
        </Button>
        <Button
          variant="secondary"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigate?.("ai-assistant")}
        >
          <Target className="w-6 h-6" />
          <span>AI Assistant</span>
        </Button>
        <Button
          variant="secondary"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigate?.("deadlines")}
        >
          <Calendar className="w-6 h-6" />
          <span>Deadlines</span>
        </Button>
      </motion.div>
    </div>
  );
};
