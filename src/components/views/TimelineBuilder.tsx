"use client";

import * as React from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  FileText,
  MessageSquare,
  Mail,
  Phone,
  Users,
  Scale,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Eye,
  EyeOff,
  Filter,
  Search,
  Sparkles,
  CheckCircle2,
  Circle,
  X,
  Link2,
  Image,
  Paperclip,
  Tag,
  MoreVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput, TextArea } from "../ui/Input";
import { Badge, StatusBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
type EventType =
  | "contract"
  | "communication"
  | "meeting"
  | "court"
  | "filing"
  | "evidence"
  | "breach"
  | "other";

type EventImportance = "critical" | "important" | "normal" | "minor";

interface TimelineEvent {
  id: string;
  date: Date;
  time?: string;
  title: string;
  description: string;
  type: EventType;
  importance: EventImportance;
  participants?: string[];
  documents?: string[];
  tags?: string[];
  evidence?: string;
  notes?: string;
  color?: string;
}

interface TimelineProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

// Event type configurations
const eventTypes: { type: EventType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "contract", label: "Contract/Agreement", icon: <FileText className="w-4 h-4" />, color: "purple" },
  { type: "communication", label: "Communication", icon: <MessageSquare className="w-4 h-4" />, color: "blue" },
  { type: "meeting", label: "Meeting", icon: <Users className="w-4 h-4" />, color: "green" },
  { type: "court", label: "Court Event", icon: <Scale className="w-4 h-4" />, color: "red" },
  { type: "filing", label: "Filing", icon: <FileText className="w-4 h-4" />, color: "orange" },
  { type: "evidence", label: "Evidence", icon: <Paperclip className="w-4 h-4" />, color: "teal" },
  { type: "breach", label: "Breach/Violation", icon: <AlertTriangle className="w-4 h-4" />, color: "red" },
  { type: "other", label: "Other", icon: <Tag className="w-4 h-4" />, color: "gray" },
];

const importanceColors = {
  critical: "red",
  important: "amber",
  normal: "blue",
  minor: "gray",
};

export const TimelineBuilder: React.FC<TimelineProps> = ({ onNavigate, onAction }) => {
  // State
  const [events, setEvents] = React.useState<TimelineEvent[]>([]);
  const [viewMode, setViewMode] = React.useState<"timeline" | "table" | "calendar">("timeline");
  const [showAddEvent, setShowAddEvent] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<TimelineEvent | null>(null);
  const [filterType, setFilterType] = React.useState<EventType | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedEvents, setExpandedEvents] = React.useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [newEvent, setNewEvent] = React.useState<Partial<TimelineEvent>>({
    type: "other",
    importance: "normal",
    participants: [],
    documents: [],
    tags: [],
  });

  // Sample events for demo
  React.useEffect(() => {
    if (events.length === 0) {
      setEvents([
        {
          id: "1",
          date: new Date("2022-01-15"),
          title: "Initial Investment Agreement Signed",
          description: "Parties entered into Investment Agreement for HK$10,000,000",
          type: "contract",
          importance: "critical",
          participants: ["Mark Lamb", "Plaintiff 1", "Plaintiff 2"],
          documents: ["Investment Agreement.pdf"],
          tags: ["agreement", "founding"],
        },
        {
          id: "2",
          date: new Date("2022-03-20"),
          title: "First Tranche Payment",
          description: "HK$5,000,000 transferred to company account",
          type: "evidence",
          importance: "important",
          documents: ["Bank Statement.pdf", "Wire Transfer Confirmation.pdf"],
          tags: ["payment", "evidence"],
        },
        {
          id: "3",
          date: new Date("2022-06-15"),
          title: "Email Exchange - Project Status",
          description: "Discussion about project delays and budget concerns",
          type: "communication",
          importance: "normal",
          participants: ["Mark Lamb", "Plaintiff 1"],
          documents: ["Email Thread.pdf"],
          tags: ["correspondence"],
        },
        {
          id: "4",
          date: new Date("2022-09-01"),
          title: "Board Meeting",
          description: "Quarterly board meeting discussing company direction",
          type: "meeting",
          importance: "important",
          participants: ["Mark Lamb", "Board Members"],
          documents: ["Board Minutes.pdf"],
          tags: ["corporate"],
        },
        {
          id: "5",
          date: new Date("2023-01-10"),
          title: "Demand Letter Received",
          description: "Plaintiffs sent demand letter claiming breach of agreement",
          type: "communication",
          importance: "critical",
          participants: ["Plaintiff's Lawyers"],
          documents: ["Demand Letter.pdf"],
          tags: ["litigation", "demand"],
        },
        {
          id: "6",
          date: new Date("2023-03-15"),
          title: "Writ of Summons Issued",
          description: "HCA 1646/2023 commenced in High Court",
          type: "court",
          importance: "critical",
          documents: ["Writ of Summons.pdf", "Statement of Claim.pdf"],
          tags: ["litigation", "court"],
        },
        {
          id: "7",
          date: new Date("2023-04-01"),
          title: "Defence Filed",
          description: "Filed Defence denying allegations",
          type: "filing",
          importance: "critical",
          documents: ["Defence.pdf"],
          tags: ["litigation", "pleading"],
        },
        {
          id: "8",
          date: new Date("2024-09-30"),
          title: "Default Judgment Application Dismissed",
          description: "DHCJ Kent Yee dismissed Plaintiffs' application for default judgment",
          type: "court",
          importance: "critical",
          documents: ["Kent Yee Decision.pdf"],
          tags: ["victory", "court"],
          notes: "Key findings: service was improper, Plaintiffs' arguments 'thoroughly untenable'",
        },
      ]);
    }
  }, []);

  // Filter and sort events
  const filteredEvents = React.useMemo(() => {
    return events
      .filter((e) => {
        const matchesType = filterType === "all" || e.type === filterType;
        const matchesSearch =
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, filterType, searchQuery]);

  // Group events by year
  const eventsByYear = React.useMemo(() => {
    const grouped = new Map<number, TimelineEvent[]>();
    filteredEvents.forEach((event) => {
      const year = event.date.getFullYear();
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Toggle event expansion
  const toggleEventExpanded = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Add event
  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const event: TimelineEvent = {
      id: Date.now().toString(),
      date: new Date(newEvent.date),
      time: newEvent.time,
      title: newEvent.title,
      description: newEvent.description || "",
      type: newEvent.type as EventType,
      importance: newEvent.importance as EventImportance,
      participants: newEvent.participants,
      documents: newEvent.documents,
      tags: newEvent.tags,
      evidence: newEvent.evidence,
      notes: newEvent.notes,
    };

    setEvents((prev) => [...prev, event]);
    setShowAddEvent(false);
    setNewEvent({
      type: "other",
      importance: "normal",
      participants: [],
      documents: [],
      tags: [],
    });
  };

  // Delete event
  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Update event
  const updateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  // Get event type config
  const getEventTypeConfig = (type: EventType) => {
    return eventTypes.find((t) => t.type === type) || eventTypes[eventTypes.length - 1];
  };

  // Reorder events
  const handleReorder = (newOrder: TimelineEvent[]) => {
    setEvents(newOrder);
  };

  // Export timeline
  const exportTimeline = (format: "pdf" | "docx" | "json") => {
    onAction?.("export-timeline", { events: filteredEvents, format });
  };

  // Render timeline view
  const renderTimelineView = () => (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-neutral-200" />

      {Array.from(eventsByYear.entries()).map(([year, yearEvents]) => (
        <div key={year} className="mb-8">
          {/* Year marker */}
          <div className="sticky top-0 z-10 flex items-center gap-4 mb-4 bg-white py-2">
            <div className="w-16 h-16 rounded-full bg-primary-100 border-4 border-white shadow flex items-center justify-center">
              <span className="text-lg font-bold text-primary-700">{year}</span>
            </div>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-primary-200 to-transparent" />
          </div>

          {/* Events for this year */}
          <div className="space-y-4 ml-4">
            {yearEvents.map((event) => {
              const typeConfig = getEventTypeConfig(event.type);
              const isExpanded = expandedEvents.has(event.id);

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative flex gap-4"
                >
                  {/* Event dot */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm",
                      event.importance === "critical" && "bg-red-500 text-white",
                      event.importance === "important" && "bg-amber-500 text-white",
                      event.importance === "normal" && "bg-blue-500 text-white",
                      event.importance === "minor" && "bg-neutral-400 text-white"
                    )}
                  >
                    {typeConfig.icon}
                  </div>

                  {/* Event card */}
                  <Card
                    variant="interactive"
                    className={cn(
                      "flex-1 transition-all",
                      isExpanded && "ring-2 ring-primary-200"
                    )}
                    onClick={() => toggleEventExpanded(event.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-neutral-500">
                              {event.date.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                              {event.time && ` at ${event.time}`}
                            </span>
                            <Badge
                              variant={
                                event.importance === "critical"
                                  ? "error"
                                  : event.importance === "important"
                                  ? "warning"
                                  : "default"
                              }
                              size="sm"
                            >
                              {typeConfig.label}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-neutral-900">{event.title}</h3>
                          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEvent(event);
                            }}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-neutral-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronDown
                            className={cn(
                              "w-5 h-5 text-neutral-400 transition-transform",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-neutral-100 space-y-4">
                              {/* Full description */}
                              <div>
                                <h4 className="text-sm font-medium text-neutral-700 mb-1">
                                  Description
                                </h4>
                                <p className="text-sm text-neutral-600">{event.description}</p>
                              </div>

                              {/* Participants */}
                              {event.participants && event.participants.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-neutral-700 mb-2">
                                    Participants
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {event.participants.map((p, i) => (
                                      <Badge key={i} variant="default" size="sm">
                                        <Users className="w-3 h-3 mr-1" />
                                        {p}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Documents */}
                              {event.documents && event.documents.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-neutral-700 mb-2">
                                    Documents
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {event.documents.map((doc, i) => (
                                      <Badge key={i} variant="info" size="sm">
                                        <Paperclip className="w-3 h-3 mr-1" />
                                        {doc}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tags */}
                              {event.tags && event.tags.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-neutral-700 mb-2">
                                    Tags
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag, i) => (
                                      <Badge key={i} variant="default" size="sm">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {event.notes && (
                                <div className="bg-amber-50 rounded-lg p-3">
                                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                                    Notes
                                  </h4>
                                  <p className="text-sm text-amber-700">{event.notes}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No events found</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setShowAddEvent(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Your First Event
          </Button>
        </div>
      )}
    </div>
  );

  // Render table view
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-50">
            <th className="text-left p-3 text-sm font-medium text-neutral-700 border-b">Date</th>
            <th className="text-left p-3 text-sm font-medium text-neutral-700 border-b">Event</th>
            <th className="text-left p-3 text-sm font-medium text-neutral-700 border-b">Type</th>
            <th className="text-left p-3 text-sm font-medium text-neutral-700 border-b">
              Importance
            </th>
            <th className="text-left p-3 text-sm font-medium text-neutral-700 border-b">
              Documents
            </th>
            <th className="text-right p-3 text-sm font-medium text-neutral-700 border-b">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event, index) => {
            const typeConfig = getEventTypeConfig(event.type);
            return (
              <tr
                key={event.id}
                className={cn(
                  "border-b hover:bg-neutral-50 transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
                )}
              >
                <td className="p-3 text-sm text-neutral-700">
                  {event.date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="p-3">
                  <p className="font-medium text-neutral-900">{event.title}</p>
                  <p className="text-sm text-neutral-500 truncate max-w-xs">
                    {event.description}
                  </p>
                </td>
                <td className="p-3">
                  <Badge variant="default" size="sm">
                    {typeConfig.icon}
                    <span className="ml-1">{typeConfig.label}</span>
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge
                    variant={
                      event.importance === "critical"
                        ? "error"
                        : event.importance === "important"
                        ? "warning"
                        : "default"
                    }
                    size="sm"
                  >
                    {event.importance}
                  </Badge>
                </td>
                <td className="p-3">
                  {event.documents && event.documents.length > 0 ? (
                    <span className="text-sm text-neutral-500">
                      {event.documents.length} file(s)
                    </span>
                  ) : (
                    <span className="text-sm text-neutral-400">None</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Add/Edit event modal
  const renderEventModal = () => {
    const isEditing = !!editingEvent;
    const currentEvent = editingEvent || newEvent;

    return (
      <AnimatePresence>
        {(showAddEvent || editingEvent) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddEvent(false);
              setEditingEvent(null);
            }}
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
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {isEditing ? "Edit Event" : "Add Event"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddEvent(false);
                      setEditingEvent(null);
                    }}
                    className="p-2 rounded-lg hover:bg-neutral-100"
                  >
                    <X className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Date"
                    type="date"
                    value={
                      currentEvent.date instanceof Date
                        ? currentEvent.date.toISOString().split("T")[0]
                        : currentEvent.date || ""
                    }
                    onChange={(e) => {
                      if (isEditing) {
                        setEditingEvent({ ...editingEvent!, date: new Date(e.target.value) });
                      } else {
                        setNewEvent({ ...newEvent, date: new Date(e.target.value) });
                      }
                    }}
                  />

                  <Input
                    label="Title"
                    placeholder="What happened?"
                    value={currentEvent.title || ""}
                    onChange={(e) => {
                      if (isEditing) {
                        setEditingEvent({ ...editingEvent!, title: e.target.value });
                      } else {
                        setNewEvent({ ...newEvent, title: e.target.value });
                      }
                    }}
                  />

                  <TextArea
                    label="Description"
                    placeholder="Describe what happened in detail..."
                    rows={3}
                    value={currentEvent.description || ""}
                    onChange={(e) => {
                      if (isEditing) {
                        setEditingEvent({ ...editingEvent!, description: e.target.value });
                      } else {
                        setNewEvent({ ...newEvent, description: e.target.value });
                      }
                    }}
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Event Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {eventTypes.map((type) => (
                        <button
                          key={type.type}
                          onClick={() => {
                            if (isEditing) {
                              setEditingEvent({ ...editingEvent!, type: type.type });
                            } else {
                              setNewEvent({ ...newEvent, type: type.type });
                            }
                          }}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors",
                            currentEvent.type === type.type
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                          )}
                        >
                          {type.icon}
                          <span className="truncate w-full text-center">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Importance
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: "critical", label: "Critical", color: "red" },
                        { value: "important", label: "Important", color: "amber" },
                        { value: "normal", label: "Normal", color: "blue" },
                        { value: "minor", label: "Minor", color: "gray" },
                      ].map((imp) => (
                        <button
                          key={imp.value}
                          onClick={() => {
                            if (isEditing) {
                              setEditingEvent({
                                ...editingEvent!,
                                importance: imp.value as EventImportance,
                              });
                            } else {
                              setNewEvent({
                                ...newEvent,
                                importance: imp.value as EventImportance,
                              });
                            }
                          }}
                          className={cn(
                            "p-2 rounded-lg border text-sm font-medium transition-colors",
                            currentEvent.importance === imp.value
                              ? `border-${imp.color}-500 bg-${imp.color}-50 text-${imp.color}-700`
                              : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                          )}
                        >
                          {imp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <TextArea
                    label="Notes (optional)"
                    placeholder="Any additional notes..."
                    rows={2}
                    value={currentEvent.notes || ""}
                    onChange={(e) => {
                      if (isEditing) {
                        setEditingEvent({ ...editingEvent!, notes: e.target.value });
                      } else {
                        setNewEvent({ ...newEvent, notes: e.target.value });
                      }
                    }}
                  />
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setShowAddEvent(false);
                      setEditingEvent(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      if (isEditing) {
                        updateEvent(editingEvent!.id, editingEvent!);
                        setEditingEvent(null);
                      } else {
                        addEvent();
                      }
                    }}
                    disabled={!currentEvent.title || !currentEvent.date}
                  >
                    {isEditing ? "Save Changes" : "Add Event"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Timeline Builder</h1>
            <p className="text-neutral-500 mt-1">
              Create a chronological timeline of events in your case
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => exportTimeline("docx")}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddEvent(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Event
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
          <div className="flex gap-2">
            {/* View Mode */}
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
              <button
                onClick={() => setViewMode("timeline")}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  viewMode === "timeline"
                    ? "bg-primary-100 text-primary-700"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                )}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors border-l border-neutral-200",
                  viewMode === "table"
                    ? "bg-primary-100 text-primary-700"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                )}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filterType === "all"
                ? "bg-primary-100 text-primary-700"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            All Events
          </button>
          {eventTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setFilterType(type.type)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filterType === type.type
                  ? "bg-primary-100 text-primary-700"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">{events.length}</p>
              <p className="text-sm text-neutral-500">Total Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {events.filter((e) => e.importance === "critical").length}
              </p>
              <p className="text-sm text-neutral-500">Critical Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">
                {events.filter((e) => e.documents && e.documents.length > 0).length}
              </p>
              <p className="text-sm text-neutral-500">With Documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">
                {eventsByYear.size}
              </p>
              <p className="text-sm text-neutral-500">Years Covered</p>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <Card>
          <CardContent className="p-6">
            {viewMode === "timeline" && renderTimelineView()}
            {viewMode === "table" && renderTableView()}
          </CardContent>
        </Card>

        {/* AI Suggestion */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">AI Timeline Analysis</h3>
                <p className="text-sm text-blue-700">
                  Let AI analyze your timeline to identify gaps, suggest missing events,
                  and highlight key turning points in your case.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => onAction?.("analyze-timeline", events)}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Analyze Timeline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {renderEventModal()}
    </div>
  );
};
