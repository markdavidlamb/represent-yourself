"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles = {
  primary: [
    "bg-primary-600 text-white",
    "hover:bg-primary-700",
    "active:bg-primary-800",
    "focus-visible:ring-primary-500",
    "shadow-sm hover:shadow-md",
  ].join(" "),
  secondary: [
    "bg-white text-neutral-700 border border-neutral-300",
    "hover:bg-neutral-50 hover:border-neutral-400",
    "active:bg-neutral-100",
    "focus-visible:ring-primary-500",
  ].join(" "),
  ghost: [
    "bg-transparent text-neutral-600",
    "hover:bg-neutral-100 hover:text-neutral-900",
    "active:bg-neutral-200",
    "focus-visible:ring-primary-500",
  ].join(" "),
  danger: [
    "bg-error-main text-white",
    "hover:bg-red-600",
    "active:bg-red-700",
    "focus-visible:ring-red-500",
    "shadow-sm hover:shadow-md",
  ].join(" "),
  success: [
    "bg-success-main text-white",
    "hover:bg-emerald-600",
    "active:bg-emerald-700",
    "focus-visible:ring-emerald-500",
    "shadow-sm hover:shadow-md",
  ].join(" "),
};

const sizeStyles = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-6 text-base gap-2.5 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-150 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "select-none",
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        whileHover={{ scale: isDisabled ? 1 : 1.01 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">{children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            {size !== "icon" && children}
            {icon && iconPosition === "right" && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            {size === "icon" && icon}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
