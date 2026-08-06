"use client";

import { createContext } from "react";

export type EffortLevel = "Low" | "Medium" | "Max Effort";

export const ChatContext = createContext<{
	effortLevel: EffortLevel;
	setEffortLevel: (effort: EffortLevel) => void;
} | null>(null);
