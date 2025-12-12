"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Scale,
  FileSearch,
  PenTool,
  Upload,
} from "lucide-react";
import { Card, CardHeader, CardContent, StatCard, ListCardItem } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge, StatusBadge, DeadlineBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";
import { loadCaseData, CaseData } from "@/lib/case-store";

const quickActions = [
  {
    id: "new-affidavit",
    title: "Draft Affidavit",
    description: "Create a sworn statement with AI assistance",
    icon: <PenTool className="w-5 h-5" />,
    color: "primary",
  },
  {
    id: "analyze-doc",
    title: "Analyze Document",
    description: "Upload opponent's filing to extract key points",
    icon: <FileSearch className="w-5 h-5" />,
    color: "info",
  },
  {
    id: "upload-evidence",
    title: "Upload Evidence",
    description: "Add documents to your evidence bundle",
    icon: <Upload className="w-5 h-5" />,
    color: "success",
  },
  {
    id: "ai-help",
    title: "Ask AI Assistant",
    description: "Get help with legal questions",
    icon: <Sparkles className="w-5 h-5" />,
    color: "warning",
  },
];

interface DashboardProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onAction }) => {
  // Load case data and exhibits from localStorage
  const [caseData, setCaseData] = React.useState<CaseData | null>(null);
  const [exhibits, setExhibits] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const data = loadCaseData();
    setCaseData(data);

    // Load exhibits from localStorage
    try {
      const storedExhibits = localStorage.getItem('legalcli_exhibits');
      if (storedExhibits) {
        setExhibits(JSON.parse(storedExhibits));
      }
    } catch (e) {
      console.error('Failed to load exhibits:', e);
    }

    setIsLoading(false);
  }, []);

  // Compute stats from actual data
  const stats = {
    activeCases: caseData?.case?.caseNumber ? 1 : 0,
    documents: exhibits.length,
    upcomingDeadlines: caseData?.timeline?.filter(t => new Date(t.date) > new Date()).length || 0,
    draftDocuments: exhibits.filter(e => e.status === 'draft').length,
  };

  // Get upcoming deadlines from timeline
  const upcomingDeadlines = (caseData?.timeline || [])
    .filter(t => new Date(t.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map((t, i) => ({
      id: String(i + 1),
      title: t.event,
      case: caseData?.case?.caseNumber || 'Your Case',
      date: new Date(t.date),
      type: t.type === 'court' || t.type === 'upcoming' ? 'hearing' as const : 'filing' as const,
    }));

  // Get recent documents from exhibits
  const recentDocs = exhibits
    .sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime())
    .slice(0, 3)
    .map((e, i) => ({
      id: String(i + 1),
      title: e.title || e.filename,
      type: e.category || 'document',
      modified: formatTimeAgo(new Date(e.dateAdded)),
    }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="p-6 max-w-7xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Header */}
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Good {getTimeOfDay()}, ready to work on your case?
        </h1>
        <p className="mt-1 text-neutral-500">
          Here's an overview of your legal matters
        </p>
      </motion.div>

      {/* Quick Action Cards */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              className={cn(
                "flex flex-col items-start p-4 rounded-xl border-2 border-dashed",
                "text-left transition-all duration-200",
                "hover:border-primary-300 hover:bg-primary-50/50",
                "border-neutral-200 bg-white"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAction?.(action.id)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                  action.color === "primary" && "bg-primary-100 text-primary-600",
                  action.color === "info" && "bg-blue-100 text-blue-600",
                  action.color === "success" && "bg-emerald-100 text-emerald-600",
                  action.color === "warning" && "bg-amber-100 text-amber-600"
                )}
              >
                {action.icon}
              </div>
              <h3 className="font-medium text-neutral-900">{action.title}</h3>
              <p className="text-sm text-neutral-500 mt-0.5">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Cases"
          value={stats.activeCases}
          icon={<FolderOpen className="w-6 h-6" />}
          href="#cases"
        />
        <StatCard
          title="Documents"
          value={stats.documents}
          icon={<FileText className="w-6 h-6" />}
          href="#documents"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          icon={<Calendar className="w-6 h-6" />}
          href="#deadlines"
        />
        <StatCard
          title="Draft Documents"
          value={stats.draftDocuments}
          icon={<Clock className="w-6 h-6" />}
          href="#drafts"
        />
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <motion.div variants={item}>
          <Card>
            <CardHeader
              title="Upcoming Deadlines"
              description="Don't miss these important dates"
              icon={<AlertTriangle className="w-5 h-5" />}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => onNavigate?.("deadlines")}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-1">
                  {upcomingDeadlines.map((deadline) => (
                    <ListCardItem
                      key={deadline.id}
                      title={deadline.title}
                      description={deadline.case}
                      icon={
                        deadline.type === "hearing" ? (
                          <Scale className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )
                      }
                      badge={<DeadlineBadge date={deadline.date} />}
                      onClick={() => onAction?.(`deadline-${deadline.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming deadlines</p>
                  <p className="text-xs mt-1">Upload documents to auto-detect key dates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Documents */}
        <motion.div variants={item}>
          <Card>
            <CardHeader
              title="Recent Documents"
              description="Your latest work"
              icon={<FileText className="w-5 h-5" />}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => onNavigate?.("documents")}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {recentDocs.length > 0 ? (
                <div className="space-y-1">
                  {recentDocs.map((doc) => (
                    <ListCardItem
                      key={doc.id}
                      title={doc.title}
                      description={doc.modified}
                      icon={<FileText className="w-4 h-4" />}
                      badge={
                        <Badge variant="default" size="sm">
                          {doc.type}
                        </Badge>
                      }
                      onClick={() => onAction?.(`doc-${doc.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents yet</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => onAction?.("upload-evidence")}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Assistant Prompt */}
      <motion.div variants={item} className="mt-8">
        <Card className="bg-gradient-to-r from-primary-50 to-indigo-50 border-primary-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900">Need help with your case?</h3>
              <p className="text-sm text-neutral-600 mt-0.5">
                Ask our AI assistant anything about your legal matters, drafting documents, or understanding court procedures.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => onAction?.("ai-chat")}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Ask AI Assistant
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Getting Started Guide for New Users */}
      <motion.div variants={item} className="mt-8">
        <Card variant="outlined">
          <CardHeader
            title="Getting Started"
            description="Complete these steps to set up your case"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <CardContent>
            <div className="space-y-3">
              <GettingStartedItem
                done={true}
                title="Create your account"
                description="You're all set up and ready to go"
              />
              <GettingStartedItem
                done={false}
                title="Add your first case"
                description="Enter basic case details like parties and court"
                action={
                  <Button variant="secondary" size="sm" onClick={() => onAction?.("new-case")}>
                    Add Case
                  </Button>
                }
              />
              <GettingStartedItem
                done={false}
                title="Upload your documents"
                description="Add any existing court filings or evidence"
                action={
                  <Button variant="secondary" size="sm" onClick={() => onAction?.("upload")}>
                    Upload
                  </Button>
                }
              />
              <GettingStartedItem
                done={false}
                title="Connect your email (optional)"
                description="Monitor for new filings from opposing counsel"
                action={
                  <Button variant="ghost" size="sm" onClick={() => onAction?.("connect-email")}>
                    Connect
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Helper component for getting started checklist
interface GettingStartedItemProps {
  done: boolean;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const GettingStartedItem: React.FC<GettingStartedItemProps> = ({
  done,
  title,
  description,
  action,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg",
        done ? "bg-emerald-50" : "bg-neutral-50"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          done
            ? "bg-emerald-100 text-emerald-600"
            : "bg-neutral-200 text-neutral-400"
        )}
      >
        {done ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <span className="text-sm font-medium">2</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium", done ? "text-emerald-700" : "text-neutral-900")}>
          {title}
        </p>
        <p className={cn("text-sm", done ? "text-emerald-600" : "text-neutral-500")}>
          {description}
        </p>
      </div>
      {!done && action}
    </div>
  );
};

// Helper function to get time of day greeting
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
