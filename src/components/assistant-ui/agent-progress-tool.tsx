import { makeAssistantToolUI } from "@assistant-ui/react";
import { AgentProgressTimeline, TimelineItem } from "@/components/agent-progress-timeline";

type AgentProgressArgs = {
  steps: TimelineItem[];
};

export const AgentProgressToolUI = makeAssistantToolUI<AgentProgressArgs, string>({
  toolName: "show_agent_progress",
  render: ({ args }) => {
    // We fall back to an empty array if args.steps is undefined during streaming
    const steps = args?.steps || [];
    
    return (
      <div className="w-full my-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 font-semibold text-lg text-foreground">Agent Execution Timeline</h3>
        {steps.length > 0 ? (
          <AgentProgressTimeline steps={steps} />
        ) : (
          <p className="text-sm text-muted-foreground animate-pulse">Initializing timeline...</p>
        )}
      </div>
    );
  },
});
