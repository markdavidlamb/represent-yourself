"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Plus,
  Filter,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gavel,
  Clock,
  AlertCircle,
  Flag,
  MoreVertical,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import { useStore, useSelectedCase, type TimelineEvent } from "@/lib/store";

type EventType = TimelineEvent["type"];
type ViewMode = "timeline" | "calendar" | "list";

const EVENT_COLORS: Record<EventType, { bg: string; border: string; text: string }> = {
  event: { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-500" },
  filing: { bg: "bg-purple-500/10", border: "border-purple-500", text: "text-purple-500" },
  hearing: { bg: "bg-red-500/10", border: "border-red-500", text: "text-red-500" },
  deadline: { bg: "bg-yellow-500/10", border: "border-yellow-500", text: "text-yellow-500" },
  order: { bg: "bg-green-500/10", border: "border-green-500", text: "text-green-500" },
};

const EVENT_ICONS: Record<EventType, React.ComponentType<{ className?: string }>> = {
  event: Calendar,
  filing: FileText,
  hearing: Gavel,
  deadline: Clock,
  order: Flag,
};

export function TimelineView() {
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [filterTypes, setFilterTypes] = useState<EventType[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const selectedCase = useSelectedCase();
  const timelineEvents = useStore((s) => s.timelineEvents);
  const addTimelineEvent = useStore((s) => s.addTimelineEvent);
  const setTimelineEvents = useStore((s) => s.setTimelineEvents);

  const caseEvents = useMemo(() => {
    let events = selectedCase
      ? timelineEvents.filter((e) => e.caseId === selectedCase.id)
      : timelineEvents;

    if (filterTypes.length > 0) {
      events = events.filter((e) => filterTypes.includes(e.type));
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedCase, timelineEvents, filterTypes]);

  const toggleFilter = (type: EventType) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Delete this event?")) {
      setTimelineEvents(timelineEvents.filter((e) => e.id !== eventId));
    }
  };

  const exportTimeline = () => {
    const content = caseEvents
      .map((e) => `${new Date(e.date).toLocaleDateString()} - ${e.title}${e.description ? `: ${e.description}` : ""}`)
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timeline-${selectedCase?.number || "all"}.txt`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Timeline</h2>
          <p className="text-sm text-muted-foreground">
            {selectedCase ? selectedCase.name : "All cases"} ({caseEvents.length} events)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddEvent(true)}
            className="flex items-center px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </button>
          <button
            onClick={exportTimeline}
            className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        {/* View Modes */}
        <div className="flex items-center space-x-1 p-1 bg-muted rounded-lg">
          {(["timeline", "calendar", "list"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === mode ? "bg-background shadow" : "hover:bg-background/50"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(Object.keys(EVENT_COLORS) as EventType[]).map((type) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                filterTypes.length === 0 || filterTypes.includes(type)
                  ? `${EVENT_COLORS[type].bg} ${EVENT_COLORS[type].text} border-current`
                  : "border-border text-muted-foreground opacity-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Zoom (for timeline view) */}
        {viewMode === "timeline" && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:bg-accent rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
              className="p-1 hover:bg-accent rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {caseEvents.length === 0 ? (
          <EmptyState onAdd={() => setShowAddEvent(true)} />
        ) : viewMode === "timeline" ? (
          <TimelineViewContent
            events={caseEvents}
            zoomLevel={zoomLevel}
            onEdit={setEditingEvent}
            onDelete={handleDeleteEvent}
          />
        ) : viewMode === "calendar" ? (
          <CalendarViewContent events={caseEvents} onEdit={setEditingEvent} />
        ) : (
          <ListViewContent
            events={caseEvents}
            onEdit={setEditingEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <EventModal
          caseId={selectedCase?.id}
          onClose={() => setShowAddEvent(false)}
          onSave={(event) => {
            addTimelineEvent(event);
            setShowAddEvent(false);
          }}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EventModal
          event={editingEvent}
          caseId={selectedCase?.id}
          onClose={() => setEditingEvent(null)}
          onSave={(updates) => {
            setTimelineEvents(
              timelineEvents.map((e) =>
                e.id === editingEvent.id ? { ...e, ...updates } : e
              )
            );
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="font-medium mb-2">No events yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add events to build your case timeline
        </p>
        <button
          onClick={onAdd}
          className="flex items-center mx-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add First Event
        </button>
      </div>
    </div>
  );
}

function TimelineViewContent({
  events,
  zoomLevel,
  onEdit,
  onDelete,
}: {
  events: TimelineEvent[];
  zoomLevel: number;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (id: string) => void;
}) {
  const today = new Date();

  return (
    <div className="relative pl-8" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}>
      {/* Timeline Line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

      {/* Today Marker */}
      <div
        className="absolute left-0 right-0 border-t-2 border-dashed border-primary/50"
        style={{ top: "0px" }}
      >
        <span className="absolute left-8 -top-3 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
          Today
        </span>
      </div>

      {/* Events */}
      <div className="space-y-4 pt-8">
        {events.map((event) => {
          const Icon = EVENT_ICONS[event.type];
          const colors = EVENT_COLORS[event.type];
          const isPast = new Date(event.date) < today;

          return (
            <div key={event.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-5 w-4 h-4 rounded-full border-2 ${colors.border} ${
                  isPast ? "bg-muted" : colors.bg
                }`}
              />

              {/* Card */}
              <div
                className={`ml-4 p-4 rounded-lg border ${colors.border} ${colors.bg} ${
                  isPast ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded ${colors.bg}`}>
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {event.description && (
                        <p className="mt-2 text-sm">{event.description}</p>
                      )}
                      {event.source && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Source: {event.source}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(event)}
                      className="p-1 hover:bg-background rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(event.id)}
                      className="p-1 hover:bg-background rounded text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarViewContent({
  events,
  onEdit,
}: {
  events: TimelineEvent[];
  onEdit: (event: TimelineEvent) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = monthStart.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((e) => {
      const eventDate = new Date(e.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
          }
          className="p-2 hover:bg-accent rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-medium">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
          }
          className="p-2 hover:bg-accent rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((date, i) => {
          if (!date) {
            return <div key={i} className="p-2 h-24" />;
          }

          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={i}
              className={`p-2 h-24 border border-border rounded-lg overflow-hidden ${
                isToday ? "bg-primary/5 border-primary" : "hover:bg-accent/50"
              }`}
            >
              <div
                className={`text-sm mb-1 ${
                  isToday ? "font-bold text-primary" : "text-muted-foreground"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEdit(event)}
                    className={`w-full text-left px-1 py-0.5 text-xs rounded truncate ${
                      EVENT_COLORS[event.type].bg
                    } ${EVENT_COLORS[event.type].text}`}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListViewContent({
  events,
  onEdit,
  onDelete,
}: {
  events: TimelineEvent[];
  onEdit: (event: TimelineEvent) => void;
  onDelete: (id: string) => void;
}) {
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach((event) => {
      const year = new Date(event.date).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(event);
    });
    return groups;
  }, [events]);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([year, yearEvents]) => (
          <div key={year}>
            <h3 className="text-lg font-semibold mb-3">{year}</h3>
            <div className="space-y-2">
              {yearEvents.map((event) => {
                const Icon = EVENT_ICONS[event.type];
                const colors = EVENT_COLORS[event.type];

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${colors.bg}`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                            {event.type}
                          </span>
                          {event.source && <span>• {event.source}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEdit(event)}
                        className="p-1 hover:bg-accent rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(event.id)}
                        className="p-1 hover:bg-accent rounded text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}

function EventModal({
  event,
  caseId,
  onClose,
  onSave,
}: {
  event?: TimelineEvent;
  caseId?: string;
  onClose: () => void;
  onSave: (event: Omit<TimelineEvent, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date
      ? new Date(event.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    type: event?.type || ("event" as EventType),
    source: event?.source || "",
    caseId: event?.caseId || caseId || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-background rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{event ? "Edit Event" : "Add Event"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Injunction Order Made"
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="event">Event</option>
              <option value="filing">Filing</option>
              <option value="hearing">Hearing</option>
              <option value="deadline">Deadline</option>
              <option value="order">Order</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              rows={3}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g., Court file, Email, Document"
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                ...formData,
                date: new Date(formData.date),
              })
            }
            disabled={!formData.title || !formData.date || !formData.caseId}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {event ? "Save Changes" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
