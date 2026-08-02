import { BotIcon, ZapIcon, CompassIcon, CpuIcon, SendIcon, CheckCircleIcon, AlertTriangleIcon, FileTextIcon } from "lucide-react";

export const MENTION_OPTIONS = [
  { id: "agent-1", label: "Sarah", icon: "/3d-icons/3dicons-bookmark-fav-dynamic-color.png", description: "Customer Support Agent", category: "Agent" },
  { id: "agent-2", label: "HR Assistant", icon: "/3d-icons/3dicons-bookmark-fav-dynamic-color.png", description: "Human Resources Expert", category: "Agent" },
  { id: "agent-3", label: "Developer", icon: "/3d-icons/3dicons-bookmark-fav-dynamic-color.png", description: "Senior Software Engineer", category: "Agent" },
  { id: "agent-4", label: "Sales Representative", icon: "/3d-icons/3dicons-bookmark-fav-dynamic-color.png", description: "B2B Sales Specialist", category: "Agent" },
  { id: "skill-1", label: "Web Search", icon: "/3d-icons/3dicons-flash-dynamic-color.png", description: "Search the web for information", category: "Skill" },
  { id: "skill-2", label: "Email Writer", icon: "/3d-icons/3dicons-flash-dynamic-color.png", description: "Draft professional emails", category: "Skill" },
  { id: "skill-3", label: "Code Review", icon: "/3d-icons/3dicons-flash-dynamic-color.png", description: "Analyze code for issues", category: "Skill" },
  { id: "knowledge-1", label: "Company Handbook", icon: "/3d-icons/3dicons-folder-dynamic-color.png", description: "Internal policies and guidelines", category: "Knowledge" },
  { id: "knowledge-2", label: "API Docs", icon: "/3d-icons/3dicons-folder-dynamic-color.png", description: "Technical documentation", category: "Knowledge" },
  { id: "knowledge-3", label: "Brand Guidelines", icon: "/3d-icons/3dicons-folder-dynamic-color.png", description: "Design rules and assets", category: "Knowledge" },
  { id: "integration-1", label: "Slack", icon: "/3d-icons/3dicons-link-dynamic-color.png", description: "Team communication", category: "Integration" },
  { id: "integration-2", label: "Google Drive", icon: "/3d-icons/3dicons-link-dynamic-color.png", description: "Cloud storage", category: "Integration" },
  { id: "integration-3", label: "Jira", icon: "/3d-icons/3dicons-link-dynamic-color.png", description: "Issue tracking", category: "Integration" },
];

export const SLASH_ACTIONS = [
  { id: "action-1", label: "delegate", icon: "/3d-icons/3dicons-explorer-dynamic-color.png", description: "Assign task to another agent" },
  { id: "action-2", label: "review", icon: "/3d-icons/3dicons-tick-dynamic-color.png", description: "Request human review" },
  { id: "action-3", label: "escalate", icon: "/3d-icons/3dicons-shield-dynamic-color.png", description: "Escalate to management" },
  { id: "action-4", label: "summarize", icon: "/3d-icons/3dicons-notebook-dynamic-color.png", description: "Summarize current thread" },
];
