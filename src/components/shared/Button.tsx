import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  showArrow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      href,
      variant = "primary",
      size = "md",
      showArrow = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClass =
    "group inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:grayscale-[0.5]";

  const variants = {
    primary:
      "bg-gradient-to-b from-[#3b82f6] to-[#2563eb] border border-[#1d4ed8] text-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.25),0_4px_12px_rgba(37,99,235,0.15)] hover:from-[#2563eb] hover:to-[#1d4ed8] hover:border-[#1e40af] hover:shadow-[inset_0_1.5px_0_rgba(255,255,255,0.25),0_6px_16px_rgba(37,99,235,0.25)]",
    secondary:
      "bg-white border border-[#e2e8f0] text-[#1e293b] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_6px_16px_rgba(0,0,0,0.05)]",
    danger:
      "bg-gradient-to-b from-[#ef4444] to-[#dc2626] border border-[#b91c1c] text-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.25),0_4px_12px_rgba(220,38,38,0.15)] hover:from-[#dc2626] hover:to-[#b91c1c] hover:border-[#991b1b] hover:shadow-[inset_0_1.5px_0_rgba(255,255,255,0.25),0_6px_16px_rgba(220,38,38,0.25)]",
  };

  const sizes = {
    xs: "px-4 py-1.5 text-xs rounded-lg",
    sm: "px-5 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  const arrowSizes = {
    xs: "h-3 w-3 ms-1",
    sm: "h-3.5 w-3.5 ms-1.5",
    md: "h-4 w-4 ms-2",
    lg: "h-4 w-4 ms-2",
  };

  const content = (
    <>
      {children}
      {showArrow && (
        <ArrowRight className={cn("transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180", arrowSizes[size])} />
      )}
    </>
  );

  const finalClassName = cn(baseClass, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={finalClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} className={finalClassName} {...props}>
      {content}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
