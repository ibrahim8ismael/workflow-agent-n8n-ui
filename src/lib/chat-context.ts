"use client";

import { createContext } from "react";

export type EffortLevel = "Low" | "Medium" | "Max Effort";

export type PendingApproval = {
	runId: string;
	blueprintRevision?: string;
	name: string;
	summary: string;
	status?: string;
	goal?: string;
	triggerType?: string;
	stepCount?: number;
};

export const ChatContext = createContext<{
	effortLevel: EffortLevel;
	setEffortLevel: (effort: EffortLevel) => void;
	pendingApproval?: PendingApproval | null;
	isConfirming?: boolean;
	onConfirmApproval?: () => void;
	createdSuccess?: string | null;
	onDismissSuccess?: () => void;
} | null>(null);
