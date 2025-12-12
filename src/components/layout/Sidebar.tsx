"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Calendar,
  Clock,
  Mail,
  BarChart2,
  BookOpen,
  CheckSquare,
  Calculator,
  Settings,
  HelpCircle,
  ChevronDown,
  Plus,
  Scale,
  Sparkles,
  Menu,
  X,
  Compass,
  Brain,
  FileEdit,
  Search,
  UserSearch,
  DollarSign,
  Mic,
  FolderArchive,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Kbd } from "../ui/Badge";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string | number;
  shortcut?: string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    shortcut: ["⌘", "1"],
  },
  {
    id: "legal-gps",
    label: "Legal GPS",
    icon: <Compass className="w-5 h-5" />,
    badge: "New",
  },
  {
    id: "case-analyzer",
    label: "Case Analyzer",
    icon: <Brain className="w-5 h-5" />,
    badge: "AI",
  },
  {
    id: "cases",
    label: "My Cases",
    icon: <FolderOpen className="w-5 h-5" />,
    badge: 3,
    shortcut: ["⌘", "2"],
  },
  {
    id: "documents",
    label: "Documents",
    icon: <FileText className="w-5 h-5" />,
    shortcut: ["⌘", "3"],
    children: [
      { id: "all-docs", label: "All Documents", icon: <FileText className="w-4 h-4" /> },
      { id: "drafts", label: "Drafts", icon: <FileText className="w-4 h-4" />, badge: 2 },
      { id: "filed", label: "Filed", icon: <FileText className="w-4 h-4" /> },
      { id: "evidence", label: "Evidence", icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    id: "doc-generator",
    label: "Document Generator",
    icon: <FileEdit className="w-5 h-5" />,
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: <Clock className="w-5 h-5" />,
    shortcut: ["⌘", "4"],
  },
  {
    id: "deadlines",
    label: "Deadlines",
    icon: <Calendar className="w-5 h-5" />,
    badge: "2 due",
  },
  {
    id: "discovery",
    label: "Discovery Helper",
    icon: <Search className="w-5 h-5" />,
  },
  {
    id: "arguments",
    label: "Argument Map",
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    id: "rules",
    label: "Court Rules",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: "hearing-prep",
    label: "Hearing Prep",
    icon: <CheckSquare className="w-5 h-5" />,
  },
  {
    id: "hearing-sim",
    label: "Hearing Simulator",
    icon: <Mic className="w-5 h-5" />,
    badge: "AI",
  },
  {
    id: "opponent-intel",
    label: "Opponent Intel",
    icon: <UserSearch className="w-5 h-5" />,
  },
  {
    id: "settlement",
    label: "Settlement Calculator",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    id: "bundles",
    label: "Bundle Generator",
    icon: <FolderArchive className="w-5 h-5" />,
  },
  {
    id: "risk-score",
    label: "Risk Scorecard",
    icon: <Shield className="w-5 h-5" />,
    badge: "AI",
  },
  {
    id: "costs",
    label: "Cost Calculator",
    icon: <Calculator className="w-5 h-5" />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    id: "ai-assistant",
    label: "AI Assistant",
    icon: <Sparkles className="w-5 h-5" />,
    shortcut: ["/"],
  },
  {
    id: "help",
    label: "Help & Guide",
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    shortcut: ["⌘", ","],
  },
];

interface SidebarProps {
  activeItem?: string;
  onItemSelect?: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem = "dashboard",
  onItemSelect,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const NavLink: React.FC<{ item: NavItem; depth?: number }> = ({ item, depth = 0 }) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div>
        <motion.button
          data-nav={item.id}
          data-testid={`nav-${item.id}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onItemSelect?.(item.id);
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
            "text-sm font-medium transition-all duration-150",
            "group relative",
            depth > 0 && "ml-4",
            isActive
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          )}
          whileTap={{ scale: 0.98 }}
        >
          {/* Icon */}
          <span
            className={cn(
              "flex-shrink-0 transition-colors",
              isActive ? "text-primary-600" : "text-neutral-500 group-hover:text-neutral-700"
            )}
          >
            {item.icon}
          </span>

          {/* Label */}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <Badge
                  variant={typeof item.badge === "number" ? "primary" : "warning"}
                  size="sm"
                >
                  {item.badge}
                </Badge>
              )}

              {/* Expand arrow */}
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-neutral-400 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              )}

              {/* Shortcut hint on hover */}
              {item.shortcut && !hasChildren && (
                <span className="hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Kbd keys={item.shortcut} />
                </span>
              )}
            </>
          )}
        </motion.button>

        {/* Children */}
        {hasChildren && !collapsed && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="py-1">
                  {item.children!.map((child) => (
                    <NavLink key={child.id} item={child} depth={depth + 1} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <motion.aside
      data-testid="sidebar"
      className={cn(
        "flex flex-col h-full bg-white border-r border-neutral-200",
        "transition-all duration-200"
      )}
      animate={{ width: collapsed ? 64 : 260 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-neutral-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-neutral-900 text-sm">Represent Yourself</h1>
              <p className="text-xs text-neutral-500">Legal Assistant</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <motion.button
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg",
            "bg-primary-600 text-white font-medium text-sm",
            "hover:bg-primary-700 transition-colors",
            "shadow-sm hover:shadow-md"
          )}
          whileTap={{ scale: 0.98 }}
          onClick={() => onItemSelect?.("new-document")}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>New Document</span>}
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-neutral-100 px-3 py-3">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* User Section */}
      {!collapsed && (
        <div className="border-t border-neutral-100 p-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">User</p>
              <p className="text-xs text-neutral-500 truncate">Free Plan</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};
