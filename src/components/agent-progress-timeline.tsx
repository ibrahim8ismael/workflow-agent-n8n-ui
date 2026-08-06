import { Check, X, CircleMinus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type TimelineStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'waiting_user'
  | 'skipped';

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  status: TimelineStatus;
  timestamp?: string;
  progress?: number;
  logs?: string[];
}

interface AgentProgressTimelineProps {
  steps: TimelineItem[];
  className?: string;
}

export function AgentProgressTimeline({ steps, className }: AgentProgressTimelineProps) {
  return (
    <div dir="ltr" className={cn("p-2 sm:p-4 text-left font-sans", className)}>
      <ul className="space-y-6 relative">
        <AnimatePresence initial={false}>
          {steps.map((step, stepIdx) => {
            const isLast = stepIdx === steps.length - 1;

            return (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative flex gap-x-4"
              >
                {/* Vertical line connecting steps */}
                <div
                  className={cn(
                    'absolute top-0 left-0 flex w-7 justify-center',
                    isLast ? 'h-7' : '-bottom-6'
                  )}
                >
                  <span aria-hidden className="w-px bg-border/60" />
                </div>

                <div className="flex items-start space-x-3 w-full">
                  {/* Status Icon Indicator */}
                  <div className="relative flex size-7 flex-none items-center justify-center bg-background z-10">
                    <AnimatePresence mode="wait">
                      {step.status === 'completed' ? (
                        <motion.div
                          key="completed"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex size-6 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400"
                        >
                          <Check aria-hidden className="size-3.5 stroke-[3]" />
                        </motion.div>
                      ) : step.status === 'running' ? (
                        <motion.div
                          key="running"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex size-6 items-center justify-center"
                        >
                          <div
                            aria-hidden
                            className="size-2.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse"
                          />
                        </motion.div>
                      ) : step.status === 'failed' ? (
                        <motion.div
                          key="failed"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                        >
                          <X aria-hidden className="size-3.5 stroke-[3]" />
                        </motion.div>
                      ) : step.status === 'waiting_user' ? (
                        <motion.div
                          key="waiting"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex size-6 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-4 ring-orange-500/20 animate-pulse"
                        >
                          <User aria-hidden className="size-3.5 stroke-[2.5]" />
                        </motion.div>
                      ) : step.status === 'skipped' ? (
                        <motion.div
                          key="skipped"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
                        >
                          <CircleMinus aria-hidden className="size-3.5" />
                        </motion.div>
                      ) : (
                        // pending
                        <motion.div
                          key="pending"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex size-6 items-center justify-center"
                        >
                          <div
                            aria-hidden
                            className="size-2.5 rounded-full border-2 border-border bg-background"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2 pt-1 w-full min-w-0">
                    <p className="font-medium text-foreground text-sm flex items-center gap-2">
                      {step.title}
                      {step.timestamp && (
                        <span className="font-normal text-muted-foreground/50 text-xs">
                          {step.timestamp}
                        </span>
                      )}
                    </p>

                    {/* Optional Progress */}
                    {step.progress !== undefined && (
                      <div className="mt-3 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-secondary/60">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${step.progress}%` }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className={cn(
                            "h-full rounded-full bg-primary",
                            step.status === 'failed' && "bg-destructive",
                            step.status === 'completed' && "bg-green-500"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
