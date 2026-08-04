import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// SettingsSection
// A bordered card that groups related fields under a title + description.
// ---------------------------------------------------------------------------
export function SettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/60 bg-card overflow-hidden",
        className
      )}
    >
      <div className="border-b border-border/50 px-6 py-5">
        <h4 className="text-[14px] font-semibold leading-tight text-foreground">
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SettingsField
// Label + optional hint + input slot.
// ---------------------------------------------------------------------------
export function SettingsField({
  label,
  hint,
  htmlFor,
  children,
  horizontal = false,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  horizontal?: boolean;
  className?: string;
}) {
  if (horizontal) {
    return (
      <div className={cn("flex items-start justify-between gap-8", className)}>
        <div className="flex-1 min-w-0">
          <label
            htmlFor={htmlFor}
            className="block text-[13px] font-medium text-foreground"
          >
            {label}
          </label>
          {hint && (
            <p className="mt-0.5 text-[12px] text-muted-foreground leading-relaxed">
              {hint}
            </p>
          )}
        </div>
        <div className="w-full max-w-[280px] shrink-0">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-medium text-foreground"
      >
        {label}
      </label>
      {hint && (
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SettingsDivider
// A visual separator between fields inside a section.
// ---------------------------------------------------------------------------
export function SettingsDivider() {
  return <hr className="border-border/40" />;
}
