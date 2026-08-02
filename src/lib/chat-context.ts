"use client";

import { createContext } from "react";

export type ChatMode = "Ask" | "Plan" | "Build";
export type EffortLevel = "Low" | "Medium" | "Max Effort";

export const ChatContext = createContext<{
	activeMode: ChatMode;
	setActiveMode: (mode: ChatMode) => void;
	effortLevel: EffortLevel;
	setEffortLevel: (effort: EffortLevel) => void;
} | null>(null);
