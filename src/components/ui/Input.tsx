"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X, Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      description,
      error,
      icon,
      iconPosition = "left",
      clearable,
      onClear,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="text-error-main ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              // Base
              "w-full h-10 px-3 text-sm bg-white border rounded-lg",
              "text-neutral-900 placeholder:text-neutral-400",
              // Focus
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "transition-all duration-150 ease-out",
              // States
              error
                ? "border-error-main focus:ring-error-main/20 focus:border-error-main"
                : "border-neutral-300 focus:ring-primary-500/20 focus:border-primary-500",
              // Icon padding
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              // Password and clearable padding
              (type === "password" || clearable) && "pr-10",
              // Disabled
              "disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />

          {/* Password toggle */}
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Clear button */}
          {clearable && props.value && type !== "password" && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              tabIndex={-1}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {icon && iconPosition === "right" && !clearable && type !== "password" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {/* Description */}
        {description && !error && (
          <p className="mt-1.5 text-xs text-neutral-500">{description}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs text-error-main">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Search Input variant
export interface SearchInputProps extends Omit<InputProps, "icon" | "iconPosition"> {
  onSearch?: (value: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    return (
      <Input
        ref={ref}
        type="search"
        icon={<Search className="h-4 w-4" />}
        iconPosition="left"
        onChange={handleChange}
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

// TextArea component
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, description, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="text-error-main ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            // Base
            "w-full px-3 py-2 text-sm bg-white border rounded-lg resize-none",
            "text-neutral-900 placeholder:text-neutral-400",
            // Focus
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "transition-all duration-150 ease-out",
            // States
            error
              ? "border-error-main focus:ring-error-main/20 focus:border-error-main"
              : "border-neutral-300 focus:ring-primary-500/20 focus:border-primary-500",
            // Disabled
            "disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />

        {/* Description */}
        {description && !error && (
          <p className="mt-1.5 text-xs text-neutral-500">{description}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs text-error-main">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
