"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  dot?: boolean;
}

const variantStyles = {
  default: "bg-neutral-100 text-neutral-700 border-neutral-200",
  primary: "bg-primary-50 text-primary-700 border-primary-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

const dotColors = {
  default: "bg-neutral-500",
  primary: "bg-primary-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

const sizeStyles = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "sm", dot, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full border",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Status Badge with pulsing animation for urgent items
export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "active" | "pending" | "urgent" | "closed" | "overdue";
}

const statusConfig = {
  active: { variant: "success" as const, label: "Active", pulse: false },
  pending: { variant: "warning" as const, label: "Pending", pulse: false },
  urgent: { variant: "error" as const, label: "Urgent", pulse: true },
  closed: { variant: "default" as const, label: "Closed", pulse: false },
  overdue: { variant: "error" as const, label: "Overdue", pulse: true },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot {...props}>
      {config.pulse && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              dotColors[config.variant]
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              dotColors[config.variant]
            )}
          />
        </span>
      )}
      {config.label}
    </Badge>
  );
};

// Keyboard shortcut badge
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  keys: string[];
}

export const Kbd: React.FC<KbdProps> = ({ keys, className, ...props }) => {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} {...props}>
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="min-w-[1.25rem] h-5 px-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded flex items-center justify-center">
            {key}
          </kbd>
          {i < keys.length - 1 && (
            <span className="text-neutral-300 text-xs">+</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

// Deadline badge with countdown
export interface DeadlineBadgeProps {
  date: Date;
  label?: string;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ date, label }) => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  let variant: BadgeProps["variant"] = "default";
  let text = label || `${Math.abs(days)} days`;

  if (days < 0) {
    variant = "error";
    text = `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    variant = "error";
    text = "Due today";
  } else if (days === 1) {
    variant = "warning";
    text = "Due tomorrow";
  } else if (days <= 7) {
    variant = "warning";
    text = `${days} days left`;
  } else {
    variant = "info";
    text = `${days} days left`;
  }

  return (
    <Badge variant={variant} dot size="sm">
      {text}
    </Badge>
  );
};
