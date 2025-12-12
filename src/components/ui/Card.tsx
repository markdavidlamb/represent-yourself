"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "outlined" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-white border border-neutral-200 shadow-sm",
  outlined: "bg-white border border-neutral-300",
  elevated: "bg-white border border-neutral-100 shadow-lg",
  interactive: [
    "bg-white border border-neutral-200 shadow-sm",
    "hover:border-neutral-300 hover:shadow-md",
    "cursor-pointer transition-all duration-200",
  ].join(" "),
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className, children, ...props }, ref) => {
    const isInteractive = variant === "interactive";

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl",
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        whileHover={isInteractive ? { y: -2 } : undefined}
        whileTap={isInteractive ? { scale: 0.995 } : undefined}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, action, icon, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between gap-4", className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-neutral-900">{title}</h3>
            {description && (
              <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

// Card Content
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-4", className)} {...props} />
));

CardContent.displayName = "CardContent";

// Card Footer
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-4 pt-4 border-t border-neutral-100 flex items-center justify-end gap-2",
      className
    )}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

// Stat Card for dashboard
export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  href?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  href,
}) => {
  const trendColors = {
    up: "text-success-main bg-success-light",
    down: "text-error-main bg-error-light",
    neutral: "text-neutral-600 bg-neutral-100",
  };

  const CardWrapper = href ? motion.a : motion.div;

  return (
    <CardWrapper
      href={href}
      className={cn(
        "block p-5 rounded-xl bg-white border border-neutral-200 shadow-sm",
        href && "hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer"
      )}
      whileHover={href ? { y: -2 } : undefined}
      whileTap={href ? { scale: 0.995 } : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  trendColors[change.trend]
                )}
              >
                {change.trend === "up" && "+"}
                {change.trend === "down" && "-"}
                {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-neutral-400">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </CardWrapper>
  );
};

// List Card Item
export interface ListCardItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  chevron?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ListCardItem = React.forwardRef<HTMLDivElement, ListCardItemProps>(
  ({ title, description, icon, badge, chevron = true, className, onClick }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "flex items-center gap-3 px-4 py-3 -mx-4 rounded-lg",
          "hover:bg-neutral-50 cursor-pointer transition-colors",
          "first:mt-0 last:mb-0",
          className
        )}
        whileTap={{ scale: 0.995 }}
        onClick={onClick}
      >
        {icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-900 truncate">{title}</p>
          {description && (
            <p className="text-sm text-neutral-500 truncate">{description}</p>
          )}
        </div>
        {badge && <div className="flex-shrink-0">{badge}</div>}
        {chevron && (
          <ChevronRight className="flex-shrink-0 w-4 h-4 text-neutral-400" />
        )}
      </motion.div>
    );
  }
);

ListCardItem.displayName = "ListCardItem";
