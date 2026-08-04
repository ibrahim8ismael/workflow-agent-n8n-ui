"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<"button"> & { className?: string }) {
  return (
    <button
      role="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent text-primary shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary/20 data-[state=checked]:text-primary dark:bg-primary/20 dark:data-[state=checked]:bg-primary/20 dark:text-primary dark:ring-offset-background",
        className
      )}
      {...props}
    />
  );
}

export { Switch };
