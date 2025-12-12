"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Edit2,
  Bell,
  BellRing,
  Download,
  Share2,
  Info,
  Lightbulb,
  Calculator,
  CalendarDays,
  CalendarClock,
  Filter,
  Search,
  Settings,
  CheckCircle2,
  Circle,
  ArrowRight,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput } from "../ui/Input";
import { Badge, StatusBadge, DeadlineBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
type DeadlineType = "filing" | "hearing" | "discovery" | "service" | "appeal" | "other";
type DeadlinePriority = "critical" | "high" | "medium" | "low";
type DeadlineStatus = "upcoming" | "due_soon" | "overdue" | "completed";

interface Deadline {
  id: string;
  title: string;
  description?: string;
  type: DeadlineType;
  date: Date;
  time?: string;
  priority: DeadlinePriority;
  status: DeadlineStatus;
  courtRule?: string;
  caseId?: string;
  caseName?: string;
  reminders: number[]; // Days before
  notes?: string;
  completed: boolean;
}

interface CourtRule {
  id: string;
  name: string;
  rule: string;
  days: number;
  businessDays: boolean;
  description: string;
  category: string;
  startEvent: string;
}

// Common court rules and deadlines
const commonCourtRules: CourtRule[] = [
  // Hong Kong Rules of High Court
  {
    id: "hk-acknowledge",
    name: "Acknowledgment of Service",
    rule: "O.12 r.4",
    days: 14,
    businessDays: false,
    description: "File acknowledgment of service after being served with writ",
    category: "Pleadings",
    startEvent: "Date of service",
  },
  {
    id: "hk-defence",
    name: "File Defence",
    rule: "O.18 r.2",
    days: 28,
    businessDays: false,
    description: "File defence after acknowledgment of service",
    category: "Pleadings",
    startEvent: "Date of acknowledgment",
  },
  {
    id: "hk-reply",
    name: "File Reply",
    rule: "O.18 r.3",
    days: 14,
    businessDays: false,
    description: "File reply to defence (if counterclaim, file reply and defence to counterclaim)",
    category: "Pleadings",
    startEvent: "Date defence served",
  },
  {
    id: "hk-summons-return",
    name: "Summons Return Date",
    rule: "O.32 r.3",
    days: 14,
    businessDays: false,
    description: "Return date for inter partes summons",
    category: "Applications",
    startEvent: "Date of summons",
  },
  {
    id: "hk-affirmation-oppose",
    name: "Affirmation in Opposition",
    rule: "Practice Direction",
    days: 14,
    businessDays: false,
    description: "File affirmation in opposition to summons",
    category: "Applications",
    startEvent: "Date summons served",
  },
  {
    id: "hk-skeleton",
    name: "Skeleton Argument",
    rule: "Practice Direction",
    days: 7,
    businessDays: false,
    description: "File skeleton argument before hearing",
    category: "Hearings",
    startEvent: "Days before hearing",
  },
  {
    id: "hk-bundle",
    name: "Hearing Bundle",
    rule: "Practice Direction",
    days: 7,
    businessDays: false,
    description: "File and serve hearing bundle",
    category: "Hearings",
    startEvent: "Days before hearing",
  },
  {
    id: "hk-appeal-notice",
    name: "Notice of Appeal",
    rule: "O.59 r.4",
    days: 28,
    businessDays: false,
    description: "File notice of appeal from judgment",
    category: "Appeals",
    startEvent: "Date of judgment",
  },
  {
    id: "hk-discovery",
    name: "Discovery",
    rule: "O.24 r.2",
    days: 42,
    businessDays: false,
    description: "Exchange lists of documents (typically 6 weeks after close of pleadings)",
    category: "Discovery",
    startEvent: "Close of pleadings",
  },
  {
    id: "hk-interrogatories",
    name: "Interrogatory Response",
    rule: "O.26 r.3",
    days: 28,
    businessDays: false,
    description: "Answer interrogatories",
    category: "Discovery",
    startEvent: "Date interrogatories served",
  },
  // General UK/Commonwealth rules (similar)
  {
    id: "uk-acknowledge",
    name: "Acknowledgment of Service (UK)",
    rule: "CPR 10.3",
    days: 14,
    businessDays: false,
    description: "File acknowledgment in UK courts",
    category: "Pleadings",
    startEvent: "Date of service",
  },
  {
    id: "uk-defence",
    name: "File Defence (UK)",
    rule: "CPR 15.4",
    days: 28,
    businessDays: false,
    description: "File defence (can extend by 14 days by agreement)",
    category: "Pleadings",
    startEvent: "Date of service",
  },
];

// Holiday calendar (HK public holidays 2024-2025)
const publicHolidays = [
  new Date("2024-01-01"), // New Year's Day
  new Date("2024-02-10"), // Lunar New Year
  new Date("2024-02-11"),
  new Date("2024-02-12"),
  new Date("2024-02-13"),
  new Date("2024-03-29"), // Good Friday
  new Date("2024-03-30"),
  new Date("2024-04-01"),
  new Date("2024-04-04"), // Ching Ming
  new Date("2024-05-01"), // Labour Day
  new Date("2024-05-15"), // Buddha's Birthday
  new Date("2024-06-10"), // Tuen Ng
  new Date("2024-07-01"), // HKSAR Day
  new Date("2024-09-18"), // Mid-Autumn
  new Date("2024-10-01"), // National Day
  new Date("2024-10-11"), // Chung Yeung
  new Date("2024-12-25"), // Christmas
  new Date("2024-12-26"),
  // 2025
  new Date("2025-01-01"),
  new Date("2025-01-29"),
  new Date("2025-01-30"),
  new Date("2025-01-31"),
  new Date("2025-04-18"),
  new Date("2025-04-19"),
  new Date("2025-04-21"),
  new Date("2025-04-04"),
  new Date("2025-05-01"),
  new Date("2025-05-05"),
  new Date("2025-05-31"),
  new Date("2025-07-01"),
  new Date("2025-10-01"),
  new Date("2025-10-07"),
  new Date("2025-10-29"),
  new Date("2025-12-25"),
  new Date("2025-12-26"),
];

interface DeadlineCalculatorProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const DeadlineCalculator: React.FC<DeadlineCalculatorProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"list" | "calculate" | "add">("list");
  const [deadlines, setDeadlines] = React.useState<Deadline[]>([]);
  const [selectedRule, setSelectedRule] = React.useState<CourtRule | null>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [calculatedDate, setCalculatedDate] = React.useState<Date | null>(null);
  const [excludeWeekends, setExcludeWeekends] = React.useState(false);
  const [excludeHolidays, setExcludeHolidays] = React.useState(true);
  const [filterType, setFilterType] = React.useState<DeadlineType | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showAddDeadline, setShowAddDeadline] = React.useState(false);
  const [newDeadline, setNewDeadline] = React.useState<Partial<Deadline>>({
    type: "filing",
    priority: "high",
    reminders: [7, 3, 1],
  });

  // Sample deadlines
  React.useEffect(() => {
    if (deadlines.length === 0) {
      setDeadlines([
        {
          id: "1",
          title: "Affirmation in Opposition to Summary Judgment",
          description: "File sworn statement opposing the motion",
          type: "filing",
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          priority: "critical",
          status: "due_soon",
          courtRule: "O.14",
          caseName: "HCA 1646/2023",
          reminders: [7, 3, 1],
          completed: false,
        },
        {
          id: "2",
          title: "Hearing Bundle Submission",
          description: "Submit hearing bundle for Summary Judgment hearing",
          type: "hearing",
          date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          priority: "high",
          status: "upcoming",
          courtRule: "Practice Direction",
          caseName: "HCA 1646/2023",
          reminders: [7, 3, 1],
          completed: false,
        },
        {
          id: "3",
          title: "Case Management Conference",
          description: "Attend CMC before DHCJ Grace Chow",
          type: "hearing",
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          time: "10:00 AM",
          priority: "high",
          status: "upcoming",
          caseName: "HCA 1646/2023",
          reminders: [14, 7, 1],
          completed: false,
        },
        {
          id: "4",
          title: "Discovery Response Due",
          description: "Respond to First Set of Interrogatories",
          type: "discovery",
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          priority: "medium",
          status: "upcoming",
          courtRule: "O.26 r.3",
          caseName: "HCA 1646/2023",
          reminders: [7, 3, 1],
          completed: false,
        },
      ]);
    }
  }, []);

  // Calculate deadline date
  const calculateDeadline = (start: Date, days: number, excludeWknd: boolean, excludeHol: boolean): Date => {
    let current = new Date(start);
    let daysAdded = 0;

    while (daysAdded < days) {
      current.setDate(current.getDate() + 1);

      // Check if weekend
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;

      // Check if holiday
      const isHoliday = publicHolidays.some(
        (h) => h.toDateString() === current.toDateString()
      );

      // Skip if needed
      if ((excludeWknd && isWeekend) || (excludeHol && isHoliday)) {
        continue;
      }

      daysAdded++;
    }

    return current;
  };

  // Update calculated date when inputs change
  React.useEffect(() => {
    if (startDate && selectedRule) {
      const result = calculateDeadline(
        startDate,
        selectedRule.days,
        excludeWeekends || selectedRule.businessDays,
        excludeHolidays
      );
      setCalculatedDate(result);
    }
  }, [startDate, selectedRule, excludeWeekends, excludeHolidays]);

  // Get deadline status
  const getDeadlineStatus = (deadline: Deadline): DeadlineStatus => {
    if (deadline.completed) return "completed";
    const now = new Date();
    const diff = deadline.date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return "overdue";
    if (days <= 3) return "due_soon";
    return "upcoming";
  };

  // Get days until deadline
  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Filter deadlines
  const filteredDeadlines = React.useMemo(() => {
    return deadlines
      .filter((d) => {
        const matchesType = filterType === "all" || d.type === filterType;
        const matchesSearch =
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [deadlines, filterType, searchQuery]);

  // Group deadlines by urgency
  const overdueDeadlines = filteredDeadlines.filter((d) => !d.completed && getDaysUntil(d.date) < 0);
  const urgentDeadlines = filteredDeadlines.filter((d) => !d.completed && getDaysUntil(d.date) >= 0 && getDaysUntil(d.date) <= 7);
  const upcomingDeadlines = filteredDeadlines.filter((d) => !d.completed && getDaysUntil(d.date) > 7);
  const completedDeadlines = filteredDeadlines.filter((d) => d.completed);

  // Add deadline
  const addDeadline = () => {
    if (!newDeadline.title || !newDeadline.date) return;

    const deadline: Deadline = {
      id: Date.now().toString(),
      title: newDeadline.title,
      description: newDeadline.description,
      type: newDeadline.type as DeadlineType,
      date: new Date(newDeadline.date),
      time: newDeadline.time,
      priority: newDeadline.priority as DeadlinePriority,
      status: "upcoming",
      courtRule: newDeadline.courtRule,
      caseName: newDeadline.caseName,
      reminders: newDeadline.reminders || [7, 3, 1],
      notes: newDeadline.notes,
      completed: false,
    };

    setDeadlines((prev) => [...prev, deadline]);
    setShowAddDeadline(false);
    setNewDeadline({
      type: "filing",
      priority: "high",
      reminders: [7, 3, 1],
    });
  };

  // Toggle completion
  const toggleComplete = (id: string) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d))
    );
  };

  // Delete deadline
  const deleteDeadline = (id: string) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  // Render deadline list
  const renderDeadlineList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Deadline Calculator</h1>
          <p className="text-neutral-500 mt-1">
            Track deadlines and calculate due dates from court rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setView("calculate")}
            icon={<Calculator className="w-4 h-4" />}
          >
            Calculate
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddDeadline(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Deadline
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search deadlines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "filing", label: "Filings" },
            { value: "hearing", label: "Hearings" },
            { value: "discovery", label: "Discovery" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterType(option.value as DeadlineType | "all")}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                filterType === option.value
                  ? "bg-primary-100 text-primary-700"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overdue Section */}
      {overdueDeadlines.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Overdue ({overdueDeadlines.length})
          </h2>
          <div className="space-y-2">
            {overdueDeadlines.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                onToggleComplete={() => toggleComplete(deadline.id)}
                onDelete={() => deleteDeadline(deadline.id)}
                onEdit={() => onAction?.("edit-deadline", deadline)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Urgent Section */}
      {urgentDeadlines.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Due Soon - Next 7 Days ({urgentDeadlines.length})
          </h2>
          <div className="space-y-2">
            {urgentDeadlines.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                onToggleComplete={() => toggleComplete(deadline.id)}
                onDelete={() => deleteDeadline(deadline.id)}
                onEdit={() => onAction?.("edit-deadline", deadline)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingDeadlines.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming ({upcomingDeadlines.length})
          </h2>
          <div className="space-y-2">
            {upcomingDeadlines.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                onToggleComplete={() => toggleComplete(deadline.id)}
                onDelete={() => deleteDeadline(deadline.id)}
                onEdit={() => onAction?.("edit-deadline", deadline)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completedDeadlines.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed ({completedDeadlines.length})
          </h2>
          <div className="space-y-2">
            {completedDeadlines.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                onToggleComplete={() => toggleComplete(deadline.id)}
                onDelete={() => deleteDeadline(deadline.id)}
                onEdit={() => onAction?.("edit-deadline", deadline)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredDeadlines.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No deadlines found</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setShowAddDeadline(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Your First Deadline
          </Button>
        </div>
      )}
    </div>
  );

  // Render calculator view
  const renderCalculator = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronRight className="w-4 h-4 rotate-180" />}
          onClick={() => setView("list")}
        >
          Back
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Calculate Deadline</h1>
          <p className="text-neutral-500 text-sm">
            Select a court rule and start date to calculate your deadline
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Select Court Rule */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-neutral-900 mb-4">Select Court Rule</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {Object.entries(
                  commonCourtRules.reduce((acc, rule) => {
                    if (!acc[rule.category]) acc[rule.category] = [];
                    acc[rule.category].push(rule);
                    return acc;
                  }, {} as Record<string, CourtRule[]>)
                ).map(([category, rules]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                      {category}
                    </p>
                    {rules.map((rule) => (
                      <button
                        key={rule.id}
                        onClick={() => setSelectedRule(rule)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border mb-2 transition-all",
                          selectedRule?.id === rule.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-neutral-900">{rule.name}</span>
                          <Badge variant="default" size="sm">
                            {rule.days} days
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">{rule.description}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {rule.rule} • From: {rule.startEvent}
                        </p>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start Date */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-neutral-900 mb-4">Start Date</h3>
              <Input
                type="date"
                label={selectedRule?.startEvent || "Starting event date"}
                value={startDate?.toISOString().split("T")[0] || ""}
                onChange={(e) =>
                  setStartDate(e.target.value ? new Date(e.target.value) : null)
                }
              />
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-neutral-900 mb-4">Calculation Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeWeekends}
                    onChange={(e) => setExcludeWeekends(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">
                    Exclude weekends (count business days only)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeHolidays}
                    onChange={(e) => setExcludeHolidays(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">
                    Exclude public holidays (Hong Kong)
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Result */}
        <div className="space-y-6">
          {/* Result */}
          <Card className={calculatedDate ? "bg-primary-50 border-primary-200" : ""}>
            <CardContent className="p-6">
              <h3 className="font-medium text-neutral-900 mb-4">Calculated Deadline</h3>
              {calculatedDate && selectedRule ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    {calculatedDate.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <p className="text-neutral-500">
                    {getDaysUntil(calculatedDate)} days from today
                  </p>
                  <div className="mt-6 flex justify-center gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setNewDeadline({
                          title: selectedRule.name,
                          description: selectedRule.description,
                          type: selectedRule.category === "Hearings" ? "hearing" : "filing",
                          date: calculatedDate,
                          priority: "high",
                          courtRule: selectedRule.rule,
                          reminders: [7, 3, 1],
                        });
                        setShowAddDeadline(true);
                      }}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add to Deadlines
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        // Export to calendar
                        onAction?.("export-calendar", {
                          title: selectedRule.name,
                          date: calculatedDate,
                          description: selectedRule.description,
                        });
                      }}
                      icon={<Download className="w-4 h-4" />}
                    >
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <CalendarClock className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p>Select a court rule and start date to calculate the deadline</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium text-blue-900 mb-1">Important Notes</p>
                  <ul className="space-y-1">
                    <li>• Deadlines may vary based on specific court directions</li>
                    <li>• Always verify with the actual court order or rules</li>
                    <li>• Consider filing 1-2 days early to avoid last-minute issues</li>
                    <li>• If a deadline falls on a weekend/holiday, it typically extends to the next business day</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Calculation */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-neutral-900 mb-4">Custom Calculation</h3>
              <div className="space-y-4">
                <Input
                  label="Number of days"
                  type="number"
                  placeholder="e.g., 14"
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    if (days > 0) {
                      setSelectedRule({
                        id: "custom",
                        name: "Custom Period",
                        rule: "Custom",
                        days,
                        businessDays: excludeWeekends,
                        description: `${days} day deadline`,
                        category: "Custom",
                        startEvent: "Custom start date",
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Add deadline modal
  const renderAddDeadlineModal = () => (
    <AnimatePresence>
      {showAddDeadline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddDeadline(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Add Deadline</h2>

              <div className="space-y-4">
                <Input
                  label="Title"
                  placeholder="e.g., File Defence"
                  value={newDeadline.title || ""}
                  onChange={(e) =>
                    setNewDeadline((prev) => ({ ...prev, title: e.target.value }))
                  }
                />

                <Input
                  label="Description (optional)"
                  placeholder="Additional details..."
                  value={newDeadline.description || ""}
                  onChange={(e) =>
                    setNewDeadline((prev) => ({ ...prev, description: e.target.value }))
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Due Date"
                    type="date"
                    value={
                      newDeadline.date instanceof Date
                        ? newDeadline.date.toISOString().split("T")[0]
                        : newDeadline.date || ""
                    }
                    onChange={(e) =>
                      setNewDeadline((prev) => ({ ...prev, date: new Date(e.target.value) }))
                    }
                  />
                  <Input
                    label="Time (optional)"
                    type="time"
                    value={newDeadline.time || ""}
                    onChange={(e) =>
                      setNewDeadline((prev) => ({ ...prev, time: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "filing", label: "Filing", icon: <FileText className="w-4 h-4" /> },
                      { value: "hearing", label: "Hearing", icon: <Calendar className="w-4 h-4" /> },
                      { value: "discovery", label: "Discovery", icon: <Search className="w-4 h-4" /> },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          setNewDeadline((prev) => ({ ...prev, type: type.value as DeadlineType }))
                        }
                        className={cn(
                          "flex items-center justify-center gap-2 p-2 rounded-lg border text-sm transition-colors",
                          newDeadline.type === type.value
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                        )}
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "critical", label: "Critical", color: "red" },
                      { value: "high", label: "High", color: "amber" },
                      { value: "medium", label: "Medium", color: "blue" },
                      { value: "low", label: "Low", color: "neutral" },
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() =>
                          setNewDeadline((prev) => ({
                            ...prev,
                            priority: priority.value as DeadlinePriority,
                          }))
                        }
                        className={cn(
                          "p-2 rounded-lg border text-sm font-medium transition-colors",
                          newDeadline.priority === priority.value
                            ? `border-${priority.color}-500 bg-${priority.color}-50 text-${priority.color}-700`
                            : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                        )}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Court Rule Reference (optional)"
                  placeholder="e.g., O.18 r.2"
                  value={newDeadline.courtRule || ""}
                  onChange={(e) =>
                    setNewDeadline((prev) => ({ ...prev, courtRule: e.target.value }))
                  }
                />

                <Input
                  label="Case Name (optional)"
                  placeholder="e.g., HCA 1646/2023"
                  value={newDeadline.caseName || ""}
                  onChange={(e) =>
                    setNewDeadline((prev) => ({ ...prev, caseName: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddDeadline(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={addDeadline}
                  disabled={!newDeadline.title || !newDeadline.date}
                >
                  Add Deadline
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "list" && renderDeadlineList()}
        {view === "calculate" && renderCalculator()}
      </AnimatePresence>
      {renderAddDeadlineModal()}
    </div>
  );
};

// Deadline card component
interface DeadlineCardProps {
  deadline: Deadline;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const DeadlineCard: React.FC<DeadlineCardProps> = ({
  deadline,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  const daysUntil = React.useMemo(() => {
    const now = new Date();
    const diff = deadline.date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [deadline.date]);

  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil >= 0 && daysUntil <= 3;
  const isDueSoon = daysUntil > 3 && daysUntil <= 7;

  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
      <Card
        variant={deadline.completed ? "default" : "interactive"}
        className={cn(
          deadline.completed && "opacity-60",
          isOverdue && !deadline.completed && "border-red-200 bg-red-50/50",
          isUrgent && !deadline.completed && "border-amber-200 bg-amber-50/50"
        )}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                deadline.completed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isOverdue
                  ? "border-red-400 hover:border-red-500"
                  : isUrgent
                  ? "border-amber-400 hover:border-amber-500"
                  : "border-neutral-300 hover:border-neutral-400"
              )}
            >
              {deadline.completed && <Check className="w-4 h-4" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    className={cn(
                      "font-medium",
                      deadline.completed
                        ? "text-neutral-500 line-through"
                        : "text-neutral-900"
                    )}
                  >
                    {deadline.title}
                  </h3>
                  {deadline.description && (
                    <p className="text-sm text-neutral-500 mt-0.5">{deadline.description}</p>
                  )}
                </div>
                <DeadlineBadge date={deadline.date} />
              </div>

              <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {deadline.date.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  {deadline.time && ` at ${deadline.time}`}
                </span>
                {deadline.caseName && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {deadline.caseName}
                  </span>
                )}
                {deadline.courtRule && (
                  <Badge variant="default" size="sm">
                    {deadline.courtRule}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 rounded-lg hover:bg-red-100 text-neutral-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
