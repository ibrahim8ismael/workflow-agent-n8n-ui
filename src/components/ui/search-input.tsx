"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.ComponentProps<"input"> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function SearchInput({ className, value, onChange, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        className={cn("pl-8", className)}
        {...props}
      />
    </div>
  );
}
