"use client";

import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { ThreadFollowupSuggestions } from "@/components/assistant-ui/follow-up-suggestions";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import {
  ToolGroupContent,
  ToolGroupRoot,
  ToolGroupTrigger,
} from "@/components/assistant-ui/tool-group";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import SharedButton from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import { InteractiveQuestionTool } from "@/components/assistant-ui/interactive-question-tool";
import { AgentProgressToolUI } from "@/components/assistant-ui/agent-progress-tool";
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  type AssistantState,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  groupPartByType,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  type ToolCallMessagePartComponent,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  MicIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ComponentType,
  type FC,
  type PropsWithChildren,
} from "react";
import { MENTION_OPTIONS, SLASH_ACTIONS } from "@/lib/mentions";

export type ThreadGroupPart = MessagePrimitive.GroupedParts.GroupPart;

/**
 * Optional component overrides for the thread. `AssistantMessage` and
 * `Welcome` replace whole sections; the remaining slots override how the
 * assistant message renders tool calls and part groups. Tool UIs registered
 * by name (toolkit `render`, `useAssistantDataUI`) take precedence over
 * `ToolFallback`.
 */
export type ThreadComponents = {
  AssistantMessage?: ComponentType | undefined;
  Welcome?: ComponentType | undefined;
  ToolFallback?: ToolCallMessagePartComponent | undefined;
  ToolGroup?:
    | ComponentType<PropsWithChildren<{ group: ThreadGroupPart }>>
    | undefined;
  ReasoningGroup?:
    | ComponentType<PropsWithChildren<{ group: ThreadGroupPart }>>
    | undefined;
};

export type ThreadProps = {
  components?: ThreadComponents | undefined;
};

const EMPTY_COMPONENTS: ThreadComponents = {};

const ThreadComponentsContext =
  createContext<ThreadComponents>(EMPTY_COMPONENTS);

// Startup exposes a loading placeholder thread; treat it as a new chat so
// the composer mounts centered. Loads after startup keep the docked layout.
const isNewChatView = (s: AssistantState) =>
  s.thread.messages.length === 0 &&
  (!s.thread.isLoading || s.threads.isLoading);

export const Thread: FC<ThreadProps> = ({ components = EMPTY_COMPONENTS }) => {
  const isEmpty = useAuiState(isNewChatView);

  return (
    <ThreadComponentsContext.Provider value={components}>
      <ThreadRoot isEmpty={isEmpty} />
    </ThreadComponentsContext.Provider>
  );
};

const ThreadRoot: FC<{ isEmpty: boolean }> = ({ isEmpty }) => {
  const { Welcome = ThreadWelcome } = useContext(ThreadComponentsContext);

  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root bg-background @container flex h-full flex-col"
      style={{
        ["--thread-max-width" as string]: "44rem",
        ["--composer-bg" as string]:
          "color-mix(in oklab, var(--color-muted) 30%, var(--color-background))",
        ["--composer-radius" as string]: "1.5rem",
        ["--composer-padding" as string]: "8px",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        data-slot="aui_thread-viewport"
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth"
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-4",
            isEmpty && "justify-center",
          )}
        >
          <AuiIf condition={isNewChatView}>
            <Welcome />
          </AuiIf>

          <div
            data-slot="aui_message-group"
            className="mb-14 flex flex-col gap-y-6 empty:hidden"
          >
            <ThreadPrimitive.Messages>
              {() => <ThreadMessage />}
            </ThreadPrimitive.Messages>
          </div>

          <ThreadPrimitive.ViewportFooter
            className={cn(
              "aui-thread-viewport-footer bg-background flex flex-col gap-4 overflow-visible pb-4 md:pb-6",
              !isEmpty &&
                "sticky bottom-0 mt-auto rounded-t-(--composer-radius)",
            )}
          >
            <ThreadScrollToBottom />
            <ThreadFollowupSuggestions />
            <Composer />
            <AuiIf condition={(s) => isNewChatView(s) && s.composer.isEmpty}>
              <ThreadSuggestions />
            </AuiIf>
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadMessage: FC = () => {
  const { AssistantMessage: AssistantMessageComponent = AssistantMessage } =
    useContext(ThreadComponentsContext);
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);

  if (isEditing) return <EditComposer />;
  if (role === "user") return <UserMessage />;
  return <AssistantMessageComponent />;
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom render={<TooltipIconButton tooltip="Scroll to bottom" variant="outline" className="aui-thread-scroll-to-bottom dark:border-border dark:bg-background dark:hover:bg-accent absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible" />}><ArrowDownIcon /></ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root mb-6 flex flex-col items-center px-4 text-center">
      <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-2xl font-semibold duration-200">
        How can I help you today?
      </h1>
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions flex w-full flex-wrap items-center justify-center gap-2 px-4">
      <ThreadPrimitive.Suggestions>
        {() => <ThreadSuggestionItem />}
      </ThreadPrimitive.Suggestions>
    </div>
  );
};

const ThreadSuggestionItem: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestion-display fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-200">
      <SuggestionPrimitive.Trigger send render={<Button variant="ghost" className="aui-thread-welcome-suggestion text-foreground hover:bg-muted border-border/60 h-auto gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-normal whitespace-nowrap transition-colors" />}><SuggestionPrimitive.Title className="aui-thread-welcome-suggestion-text-1" /><SuggestionPrimitive.Description className="aui-thread-welcome-suggestion-text-2 empty:hidden" /></SuggestionPrimitive.Trigger>
    </div>
  );
};

const Composer: FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [activeQuery, setActiveQuery] = useState<{ query: string; startIndex: number; endIndex: number; type: 'mention' | 'slash' } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [composerValue, setComposerValue] = useState("");

  const filteredMentions = MENTION_OPTIONS.filter((opt) => 
    opt.label.toLowerCase().includes(activeQuery?.query.toLowerCase() || "")
  );

  const filteredActions = SLASH_ACTIONS.filter((opt) => 
    opt.label.toLowerCase().includes(activeQuery?.query.toLowerCase() || "")
  );

  const activeOptions = (activeQuery?.type === 'mention' ? filteredMentions : filteredActions).slice(0, 5);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  const updateMentionState = useCallback(() => {
    if (!textareaRef.current) return;
    const cursorPosition = textareaRef.current.selectionStart;
    const value = textareaRef.current.value;
    setComposerValue(value);
    
    const textBeforeCursor = value.slice(0, cursorPosition);
    
    const mentionMatch = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
    if (mentionMatch) {
      setActiveQuery({
        type: 'mention',
        query: mentionMatch[1],
        startIndex: cursorPosition - mentionMatch[1].length - 1,
        endIndex: cursorPosition,
      });
      setSelectedIndex(0);
      return;
    }

    const slashMatch = textBeforeCursor.match(/(?:^|\s)\/(\w*)$/);
    if (slashMatch) {
      setActiveQuery({
        type: 'slash',
        query: slashMatch[1],
        startIndex: cursorPosition - slashMatch[1].length - 1,
        endIndex: cursorPosition,
      });
      setSelectedIndex(0);
      return;
    }

    setActiveQuery(null);
  }, []);

  const insertOption = useCallback((option: typeof MENTION_OPTIONS[0] | typeof SLASH_ACTIONS[0]) => {
    if (!activeQuery || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const currentVal = textarea.value;
    const prefix = activeQuery.type === 'mention' ? '@' : '/';
    const newVal = 
      currentVal.slice(0, activeQuery.startIndex) + 
      `${prefix}${option.label} ` + 
      currentVal.slice(activeQuery.endIndex);
    
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(textarea, newVal);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    setActiveQuery(null);
    setComposerValue(newVal);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = activeQuery.startIndex + prefix.length + option.label.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [activeQuery]);

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    const mentionLabels = MENTION_OPTIONS.map(o => `@${o.label}`);
    const actionLabels = SLASH_ACTIONS.map(o => `/${o.label}`);
    const allLabels = [...mentionLabels, ...actionLabels].sort((a, b) => b.length - a.length);
    
    if (allLabels.length === 0) return <span className="whitespace-pre-wrap break-words">{text}</span>;
    
    const escapedLabels = allLabels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedLabels.join('|')})`, 'g');
    
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      const isMention = mentionLabels.includes(part);
      const isAction = actionLabels.includes(part);
      
      if (isMention) {
        return <span key={index} className="bg-primary/20 ring-[3px] ring-primary/20 text-primary rounded-sm font-medium">{part}</span>;
      }
      if (isAction) {
        return <span key={index} className="bg-orange-500/20 ring-[3px] ring-orange-500/20 text-orange-600 dark:text-orange-400 rounded-sm font-medium">{part}</span>;
      }
      return <span key={index} className="text-foreground">{part}</span>;
    });
  };

  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col mb-4 md:mb-8">
      <ComposerPrimitive.AttachmentDropzone render={<div data-slot="aui_composer-shell" className="border-border/60 data-[dragging=true]:border-ring focus-within:border-border dark:border-muted-foreground/15 dark:focus-within:border-muted-foreground/30 flex w-full flex-col gap-2 rounded-(--composer-radius) border bg-(--composer-bg) p-(--composer-padding) shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] focus-within:shadow-[0_6px_24px_-8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] data-[dragging=true]:border-dashed data-[dragging=true]:bg-[color-mix(in_oklab,var(--color-accent)_50%,var(--color-background))] dark:shadow-none" />}>
        <ComposerAttachments />
        <div className="relative w-full">
          {/* Backdrop div for highlighting text */}
          <div 
            ref={backdropRef}
            aria-hidden="true" 
            className="absolute inset-0 z-0 pointer-events-none w-full h-full max-h-32 min-h-10 px-2.5 py-1 text-base overflow-y-auto whitespace-pre-wrap break-words"
            style={{ color: "transparent" }}
          >
             {renderFormattedText(composerValue)}
             {composerValue.endsWith('\n') ? <br /> : null}
          </div>

          {activeQuery && activeOptions.length > 0 && (
            <div 
              className="absolute left-2 bottom-[calc(100%+8px)] z-50 w-56 rounded-xl border border-border bg-card/95 p-1 shadow-xl backdrop-blur-md flex flex-col animate-in fade-in slide-in-from-bottom-2"
            >
              {activeOptions.map((option, idx) => {
                const Icon = option.icon as string | ComponentType<{ className?: string }>;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertOption(option)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-1 text-left transition-colors cursor-default outline-none",
                      idx === selectedIndex ? "bg-accent/80 text-foreground" : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                      idx === selectedIndex ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                    )}>
                      {typeof Icon === "string" ? (
                        <img src={Icon} alt="" className="size-4 object-contain" />
                      ) : (
                        <Icon className="size-3.5" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="leading-tight text-xs font-medium truncate">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <ComposerPrimitive.Input
            ref={textareaRef}
            onChange={(e) => {
              setComposerValue(e.target.value);
              updateMentionState();
            }}
            onScroll={handleScroll}
            onKeyUp={(e) => {
              if (["ArrowLeft", "ArrowRight", "Backspace", "Delete"].includes(e.key)) {
                updateMentionState();
              }
            }}
            onClick={() => updateMentionState()}
            onKeyDown={(e) => {
              if (activeQuery && activeOptions.length > 0) {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeOptions.length - 1));
                  return;
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedIndex((prev) => (prev < activeOptions.length - 1 ? prev + 1 : 0));
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertOption(activeOptions[selectedIndex]);
                  return;
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setActiveQuery(null);
                  return;
                }
              }
              if (e.key === "Enter" && !e.shiftKey && !activeQuery) {
                // Set timeout to clear state after the send action completes
                setTimeout(() => setComposerValue(""), 0);
              }
            }}
            placeholder="Send a message..."
            className={cn(
              "aui-composer-input relative z-10 caret-primary max-h-32 min-h-10 w-full resize-none bg-transparent px-2.5 py-1 text-base outline-none",
              composerValue.length > 0 ? "text-transparent" : "text-foreground placeholder:text-muted-foreground/80"
            )}
            style={{ color: composerValue.length > 0 ? 'transparent' : undefined }}
            rows={1}
            autoFocus
            enterKeyHint="send"
            aria-label="Message input"
          />
        </div>
        <ComposerAction onSend={() => setTimeout(() => setComposerValue(""), 0)} />
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
};

import { DynamicBarsIcon } from "@/components/ui/ai-chat-input";
import { ChatContext, ChatMode, EffortLevel } from "@/lib/chat-context";

const MODES: ChatMode[] = ["Ask", "Plan", "Build"];
const EFFORTS: EffortLevel[] = ["Low", "Medium", "Max Effort"];

const ComposerAction: FC<{ onSend: () => void }> = ({ onSend }) => {
  const context = useContext(ChatContext);
  if (!context) return null;
  const { activeMode, setActiveMode, effortLevel, setEffortLevel } = context;

  const cycleMode = () => setActiveMode(MODES[(MODES.indexOf(activeMode) + 1) % MODES.length]);
  const cycleEffort = () => setEffortLevel(EFFORTS[(EFFORTS.indexOf(effortLevel) + 1) % EFFORTS.length]);

  return (
    <div className="aui-composer-action-wrapper relative flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <ComposerAddAttachment />
        
        {/* Custom Mode & Effort Selectors */}
        <button
          type="button" onClick={cycleEffort}
          className={cn(
            "group flex items-center gap-1 rounded-full px-2 py-1 transition-all hover:bg-accent/60",
            effortLevel === "Low" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "",
            effortLevel === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "",
            effortLevel === "Max Effort" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "",
          )}
        >
          <DynamicBarsIcon level={effortLevel} />
          <span className="text-xs font-semibold">{effortLevel}</span>
        </button>

        <button
          type="button" onClick={cycleMode}
          className={cn(
            "group flex items-center gap-1 rounded-full px-2 py-1 transition-all hover:bg-accent/60",
            activeMode === "Ask" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "",
            activeMode === "Plan" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" : "",
            activeMode === "Build" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "",
          )}
        >
          <span className="text-xs font-semibold">{activeMode}</span>
        </button>
      </div>
      
      <div className="flex items-center gap-1.5">
        <AuiIf condition={(s) => s.thread.capabilities.dictation}>
          <AuiIf condition={(s) => s.composer.dictation == null}>
            <ComposerPrimitive.Dictate render={<TooltipIconButton tooltip="Voice input" side="bottom" type="button" variant="ghost" size="icon" className="aui-composer-dictate size-7 rounded-full" aria-label="Start voice input" />}><MicIcon className="aui-composer-dictate-icon size-4" /></ComposerPrimitive.Dictate>
          </AuiIf>
          <AuiIf condition={(s) => s.composer.dictation != null}>
            <ComposerPrimitive.StopDictation render={<TooltipIconButton tooltip="Stop dictation" side="bottom" type="button" variant="ghost" size="icon" className="aui-composer-stop-dictation text-destructive size-7 rounded-full" aria-label="Stop voice input" />}><SquareIcon className="aui-composer-stop-dictation-icon size-3.5 animate-pulse fill-current" /></ComposerPrimitive.StopDictation>
          </AuiIf>
        </AuiIf>
        <AuiIf condition={(s) => !s.thread.isRunning}>
          <ComposerPrimitive.Send render={
            <SharedButton size="sm" showArrow={false} onClick={onSend} className="aui-composer-send h-8 w-8 rounded-xl !p-0 flex items-center justify-center ml-2" aria-label="Send message">
              <ArrowUpIcon className="size-4.5" />
            </SharedButton>
          } />
        </AuiIf>
        <AuiIf condition={(s) => s.thread.isRunning}>
          <ComposerPrimitive.Cancel render={
            <SharedButton variant="danger" size="sm" showArrow={false} className="aui-composer-cancel h-8 w-8 rounded-xl !p-0 flex items-center justify-center ml-2" aria-label="Stop generating">
              <SquareIcon className="size-3.5 fill-current" />
            </SharedButton>
          } />
        </AuiIf>
      </div>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root border-destructive bg-destructive/10 text-destructive dark:bg-destructive/5 mt-2 rounded-md border p-3 text-sm dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  const {
    ToolFallback: ToolFallbackComponent = ToolFallback,
    ToolGroup,
    ReasoningGroup,
  } = useContext(ThreadComponentsContext);

  const ACTION_BAR_PT = "pt-1.5";
  // Keep the action bar inside the contained root's paint box, then cancel its reserved space in flow.
  const ACTION_BAR_HEIGHT = `min-h-7.5 ${ACTION_BAR_PT}`;

  return (
    <MessagePrimitive.Root
      data-slot="aui_assistant-message-root"
      data-role="assistant"
      className="fade-in slide-in-from-bottom-1 animate-in relative -mb-7.5 pb-7.5 duration-150 [contain-intrinsic-size:auto_200px] [content-visibility:auto]"
    >
      <div
        data-slot="aui_assistant-message-content"
        className="text-foreground px-2 leading-relaxed wrap-break-word"
      >
        <MessagePrimitive.GroupedParts
          groupBy={(part, context) => {
            if (part.type === "tool-call" && part.toolName === "ask_user") {
              return [];
            }
            return groupPartByType({
              reasoning: ["group-chainOfThought", "group-reasoning"],
              "tool-call": ["group-chainOfThought", "group-tool"],
              "standalone-tool-call": [],
            })(part, context);
          }}
        >
          {({ part, children }) => {
            switch (part.type) {
              case "group-chainOfThought":
                return <div data-slot="aui_chain-of-thought">{children}</div>;
              case "group-tool":
                if (ToolGroup) {
                  return <ToolGroup group={part}>{children}</ToolGroup>;
                }
                return (
                  <ToolGroupRoot variant="ghost">
                    <ToolGroupTrigger
                      count={part.indices.length}
                      active={part.status.type === "running"}
                    />
                    <ToolGroupContent>{children}</ToolGroupContent>
                  </ToolGroupRoot>
                );
              case "group-reasoning": {
                if (ReasoningGroup) {
                  return (
                    <ReasoningGroup group={part}>{children}</ReasoningGroup>
                  );
                }
                const running = part.status.type === "running";
                return (
                  <ReasoningRoot streaming={running}>
                    <ReasoningTrigger active={running} />
                    <ReasoningContent aria-busy={running}>
                      <ReasoningText>{children}</ReasoningText>
                    </ReasoningContent>
                  </ReasoningRoot>
                );
              }
              case "text":
                return <MarkdownText />;
              case "reasoning":
                return <Reasoning {...part} />;
              case "tool-call":
                if (part.toolName === "ask_user") {
                  // @ts-expect-error - InteractiveQuestionTool is a tool UI component
                  return <InteractiveQuestionTool {...part} />;
                }
                if (part.toolName === "show_agent_progress") {
                  // @ts-expect-error - AgentProgressToolUI is a tool UI component
                  return <AgentProgressToolUI {...part} />;
                }
                return part.toolUI ?? <ToolFallbackComponent {...part} />;
              case "data":
                return part.dataRendererUI;
              case "indicator":
                return (
                  <span
                    data-slot="aui_assistant-message-indicator"
                    className="animate-pulse font-sans"
                    aria-label="Assistant is working"
                  >
                    {"●"}
                  </span>
                );
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <MessageError />
      </div>

      <div
        data-slot="aui_assistant-message-footer"
        className={cn("ms-2 flex items-center", ACTION_BAR_HEIGHT)}
      >
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-assistant-action-bar-root text-muted-foreground animate-in fade-in col-start-3 row-start-2 -ms-1 flex gap-1 duration-200"
    >
      <ActionBarPrimitive.Copy render={<TooltipIconButton tooltip="Copy" />}><AuiIf condition={(s) => s.message.isCopied}>
                      <CheckIcon className="animate-in zoom-in-50 fade-in duration-200 ease-out" />
                    </AuiIf><AuiIf condition={(s) => !s.message.isCopied}>
                      <CopyIcon className="animate-in zoom-in-75 fade-in duration-150" />
                    </AuiIf></ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload render={<TooltipIconButton tooltip="Refresh" />}><RefreshCwIcon /></ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger render={<TooltipIconButton tooltip="More" className="data-[state=open]:bg-accent" />}><MoreHorizontalIcon /></ActionBarMorePrimitive.Trigger>
        <ActionBarMorePrimitive.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="aui-action-bar-more-content bg-popover/95 text-popover-foreground data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-xl border p-1.5 shadow-lg backdrop-blur-sm"
        >
          <ActionBarPrimitive.ExportMarkdown render={<ActionBarMorePrimitive.Item className="aui-action-bar-more-item hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none select-none" />}><DownloadIcon className="size-4" />Export as Markdown
                              </ActionBarPrimitive.ExportMarkdown>
        </ActionBarMorePrimitive.Content>
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_user-message-root"
      className="fade-in slide-in-from-bottom-1 animate-in grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 duration-150 [contain-intrinsic-size:auto_200px] [content-visibility:auto] [&:where(>*)]:col-start-2"
      data-role="user"
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content peer bg-muted text-foreground rounded-xl px-4 py-2 wrap-break-word empty:hidden">
          <MessagePrimitive.Parts />
        </div>
        <div className="aui-user-action-bar-wrapper absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 pe-2 peer-empty:hidden rtl:translate-x-full">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker
        data-slot="aui_user-branch-picker"
        className="col-span-full col-start-1 row-start-3 -me-1 justify-end"
      />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit render={<TooltipIconButton tooltip="Edit" className="aui-user-action-edit" />}><PencilIcon /></ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_edit-composer-wrapper"
      className="flex flex-col px-2 [contain-intrinsic-size:auto_200px] [content-visibility:auto]"
    >
      <ComposerPrimitive.Root className="aui-edit-composer-root border-border/60 dark:border-muted-foreground/15 ms-auto flex w-full max-w-[85%] flex-col rounded-(--composer-radius) border bg-(--composer-bg) shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input text-foreground min-h-14 w-full resize-none bg-transparent px-4 pt-3 pb-1 text-base outline-none"
          autoFocus
        />
        <div className="aui-edit-composer-footer mx-2.5 mb-2.5 flex items-center gap-1.5 self-end">
          <ComposerPrimitive.Cancel render={<Button variant="ghost" size="sm" className="h-8 rounded-full px-3.5" />}>Cancel
                              </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send render={<Button size="sm" className="h-8 rounded-full px-3.5" />}>Update
                              </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root text-muted-foreground -ms-2 me-2 inline-flex items-center text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous render={<TooltipIconButton tooltip="Previous" />}><ChevronLeftIcon /></BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next render={<TooltipIconButton tooltip="Next" />}><ChevronRightIcon /></BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
