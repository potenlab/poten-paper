"use client";

import * as React from "react";
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

/**
 * Sonner/Toaster Component Wrapper
 *
 * Customized toast notifications with The Potential's design system:
 * - Theme-aware styling (light/dark)
 * - Custom icons with proper sizing
 * - Rounded corners matching design system
 * - Glow effects for different toast types
 */

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme === "dark" ? "dark" : "light") as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors
      closeButton
      icons={{
        success: <CircleCheck className="h-5 w-5 text-success" />,
        info: <Info className="h-5 w-5 text-info" />,
        warning: <TriangleAlert className="h-5 w-5 text-warning" />,
        error: <OctagonX className="h-5 w-5 text-error" />,
        loading: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          // Toast container
          toast: [
            "group toast",
            "group-[.toaster]:bg-card",
            "group-[.toaster]:text-foreground",
            "group-[.toaster]:border-border",
            "group-[.toaster]:shadow-xl",
            "group-[.toaster]:rounded-2xl",
            "group-[.toaster]:p-4",
          ].join(" "),
          // Toast title
          title: [
            "group-[.toast]:text-foreground",
            "group-[.toast]:font-semibold",
            "group-[.toast]:text-sm",
          ].join(" "),
          // Toast description
          description: [
            "group-[.toast]:text-muted",
            "group-[.toast]:text-sm",
          ].join(" "),
          // Action button
          actionButton: [
            "group-[.toast]:bg-primary",
            "group-[.toast]:text-foreground",
            "group-[.toast]:rounded-xl",
            "group-[.toast]:font-semibold",
            "group-[.toast]:text-sm",
            "group-[.toast]:px-4",
            "group-[.toast]:py-2",
            "group-[.toast]:hover:bg-primary/90",
          ].join(" "),
          // Cancel button
          cancelButton: [
            "group-[.toast]:bg-foreground/10",
            "group-[.toast]:text-foreground",
            "group-[.toast]:rounded-xl",
            "group-[.toast]:font-semibold",
            "group-[.toast]:text-sm",
            "group-[.toast]:px-4",
            "group-[.toast]:py-2",
            "group-[.toast]:hover:bg-foreground/20",
          ].join(" "),
          // Close button
          closeButton: [
            "group-[.toast]:bg-foreground/10",
            "group-[.toast]:text-foreground",
            "group-[.toast]:border-none",
            "group-[.toast]:hover:bg-foreground/20",
          ].join(" "),
          // Success toast
          success: [
            "group-[.toaster]:border-success/30",
            "group-[.toaster]:shadow-[0_0_20px_rgba(52,211,153,0.2)]",
          ].join(" "),
          // Error toast
          error: [
            "group-[.toaster]:border-error/30",
            "group-[.toaster]:shadow-[0_0_20px_rgba(255,69,58,0.2)]",
          ].join(" "),
          // Warning toast
          warning: [
            "group-[.toaster]:border-warning/30",
            "group-[.toaster]:shadow-[0_0_20px_rgba(251,146,60,0.2)]",
          ].join(" "),
          // Info toast
          info: [
            "group-[.toaster]:border-info/30",
            "group-[.toaster]:shadow-[0_0_20px_rgba(34,211,238,0.2)]",
          ].join(" "),
          // Loading toast
          loading: [
            "group-[.toaster]:border-primary/30",
          ].join(" "),
        },
      }}
      style={
        {
          "--normal-bg": "var(--color-card)",
          "--normal-text": "var(--color-text)",
          "--normal-border": "var(--color-border)",
          "--success-bg": "var(--color-card)",
          "--success-text": "var(--color-success)",
          "--success-border": "rgba(52, 211, 153, 0.3)",
          "--error-bg": "var(--color-card)",
          "--error-text": "var(--color-error)",
          "--error-border": "rgba(255, 69, 58, 0.3)",
          "--warning-bg": "var(--color-card)",
          "--warning-text": "var(--color-warning)",
          "--warning-border": "rgba(251, 146, 60, 0.3)",
          "--info-bg": "var(--color-card)",
          "--info-text": "var(--color-info)",
          "--info-border": "rgba(34, 211, 238, 0.3)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

// Re-export toast function for convenience
export { Toaster, toast };
