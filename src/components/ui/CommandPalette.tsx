"use client";

import * as React from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  FolderOpen,
  Calendar,
  Clock,
  Mail,
  Scale,
  PenTool,
  BarChart2,
  FileSearch,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "./Badge";

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  action?: () => void;
  href?: string;
  group?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: CommandItem[];
  onSelect?: (item: CommandItem) => void;
  placeholder?: string;
}

const defaultItems: CommandItem[] = [
  // Quick Actions
  { id: "new-case", title: "New Case", description: "Create a new case file", icon: <Plus className="w-4 h-4" />, shortcut: ["N"], group: "Quick Actions" },
  { id: "new-doc", title: "New Document", description: "Draft a new legal document with AI", icon: <PenTool className="w-4 h-4" />, shortcut: ["D"], group: "Quick Actions" },
  { id: "analyze", title: "Analyze Document", description: "Upload and analyze opposing filings", icon: <FileSearch className="w-4 h-4" />, shortcut: ["A"], group: "Quick Actions" },
  { id: "ai-chat", title: "Ask AI Assistant", description: "Get help with your case", icon: <Sparkles className="w-4 h-4" />, shortcut: ["/"], group: "Quick Actions" },

  // Navigation
  { id: "nav-cases", title: "Go to Cases", description: "View all your cases", icon: <FolderOpen className="w-4 h-4" />, shortcut: ["G", "C"], group: "Navigation" },
  { id: "nav-docs", title: "Go to Documents", description: "View all documents", icon: <FileText className="w-4 h-4" />, shortcut: ["G", "D"], group: "Navigation" },
  { id: "nav-timeline", title: "Go to Timeline", description: "View case timeline", icon: <Clock className="w-4 h-4" />, shortcut: ["G", "T"], group: "Navigation" },
  { id: "nav-deadlines", title: "Go to Deadlines", description: "View upcoming deadlines", icon: <Calendar className="w-4 h-4" />, shortcut: ["G", "L"], group: "Navigation" },
  { id: "nav-inbox", title: "Go to Inbox", description: "View case emails", icon: <Mail className="w-4 h-4" />, shortcut: ["G", "I"], group: "Navigation" },
  { id: "nav-arguments", title: "Go to Arguments", description: "View argument map", icon: <BarChart2 className="w-4 h-4" />, shortcut: ["G", "A"], group: "Navigation" },
  { id: "nav-settings", title: "Settings", description: "Configure app settings", icon: <Settings className="w-4 h-4" />, shortcut: ["G", "S"], group: "Navigation" },

  // Document Templates
  { id: "tpl-affidavit", title: "Draft Affidavit", description: "Create a sworn statement", icon: <Scale className="w-4 h-4" />, group: "Create Document" },
  { id: "tpl-submission", title: "Draft Written Submission", description: "Structured legal arguments", icon: <FileText className="w-4 h-4" />, group: "Create Document" },
  { id: "tpl-skeleton", title: "Draft Skeleton Argument", description: "Outline of legal issues", icon: <FileText className="w-4 h-4" />, group: "Create Document" },
  { id: "tpl-letter", title: "Draft Letter to Court", description: "Formal correspondence", icon: <Mail className="w-4 h-4" />, group: "Create Document" },
  { id: "tpl-notice", title: "Draft Notice of Motion", description: "Application notice", icon: <FileText className="w-4 h-4" />, group: "Create Document" },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  items = defaultItems,
  onSelect,
  placeholder = "Search commands, cases, documents...",
}) => {
  const [search, setSearch] = React.useState("");

  // Group items
  const groups = React.useMemo(() => {
    const grouped = new Map<string, CommandItem[]>();
    items.forEach((item) => {
      const group = item.group || "Actions";
      if (!grouped.has(group)) {
        grouped.set(group, []);
      }
      grouped.get(group)!.push(item);
    });
    return grouped;
  }, [items]);

  // Handle item selection
  const handleSelect = React.useCallback(
    (item: CommandItem) => {
      onSelect?.(item);
      item.action?.();
      onOpenChange(false);
      setSearch("");
    },
    [onSelect, onOpenChange]
  );

  // Handle escape key
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-xl z-50"
          >
            <Command
              className="bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden"
              shouldFilter={true}
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-neutral-200 px-4">
                <Search className="w-5 h-5 text-neutral-400 mr-3" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder={placeholder}
                  className="flex-1 h-14 text-base bg-transparent border-0 outline-none placeholder:text-neutral-400"
                />
                <Kbd keys={["Esc"]} className="text-neutral-400" />
              </div>

              {/* Results */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-10 text-center text-sm text-neutral-500">
                  No results found. Try a different search term.
                </Command.Empty>

                {Array.from(groups.entries()).map(([groupName, groupItems]) => (
                  <Command.Group
                    key={groupName}
                    heading={groupName}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide"
                  >
                    {groupItems.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.description || ""}`}
                        onSelect={() => handleSelect(item)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
                          "text-neutral-700 transition-colors",
                          "data-[selected=true]:bg-primary-50 data-[selected=true]:text-primary-900",
                          "hover:bg-neutral-50"
                        )}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center data-[selected=true]:bg-primary-100 data-[selected=true]:text-primary-600">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-neutral-500 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.shortcut && (
                          <Kbd keys={item.shortcut} className="flex-shrink-0" />
                        )}
                        <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-data-[selected=true]:opacity-100" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Kbd keys={["↑", "↓"]} /> Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd keys={["↵"]} /> Select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Kbd keys={["⌘", "K"]} /> Toggle
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
