"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CopyIcon, CheckIcon, WorkflowIcon, PlugIcon, ShieldAlertIcon } from "lucide-react";
import type { Automation, AutomationBlueprint } from "@/lib/api/types";

function JsonBlock({ value }: { value: unknown }) {
  const [copied, setCopied] = React.useState(false);
  const text = React.useMemo(() => JSON.stringify(value, null, 2), [value]);
  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="relative rounded-xl border border-border/50 bg-muted/20 p-3">
      <Button variant="ghost" size="xs" className="absolute right-2 top-2 h-7 gap-1" onClick={onCopy}>
        {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre className="text-xs font-mono whitespace-pre-wrap break-all pr-16">{text}</pre>
    </div>
  );
}

function BlueprintSteps({ blueprint }: { blueprint: AutomationBlueprint }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <WorkflowIcon className="w-4 h-4 text-primary" />
        </div>
        Trigger
        <Badge variant="outline" className="font-mono text-xs">{blueprint.trigger.type}</Badge>
      </div>
      {blueprint.trigger.config && Object.keys(blueprint.trigger.config).length > 0 && (
        <JsonBlock value={blueprint.trigger.config} />
      )}
      <div className="pt-2 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Steps ({blueprint.steps.length})</div>
        <ol className="space-y-2">
          {blueprint.steps.map((s, i) => (
            <li key={i} className="rounded-xl border border-border/50 bg-card p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">{i + 1}</span>
                <span className="font-medium text-sm truncate">{s.name}</span>
                {s.integration && (
                  <Badge variant="outline" className="text-[11px] gap-1">
                    <PlugIcon className="w-3 h-3" />
                    {s.integration}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{s.action}</div>
              {s.description && <div className="text-xs text-muted-foreground/80">{s.description}</div>}
              {s.config && Object.keys(s.config).length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Config</summary>
                  <JsonBlock value={s.config} />
                </details>
              )}
            </li>
          ))}
        </ol>
      </div>
      {blueprint.integrations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {blueprint.integrations.map((int) => (
            <Badge key={int} variant="outline" className="text-xs gap-1">
              <PlugIcon className="w-3 h-3" />{int}
            </Badge>
          ))}
        </div>
      )}
      {blueprint.riskNotes && blueprint.riskNotes.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 flex gap-2">
          <ShieldAlertIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
            {blueprint.riskNotes.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AutomationBlueprintViewer({
  automation,
  open,
  onOpenChange,
}: {
  automation: Automation | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const blueprint = automation?.blueprint as AutomationBlueprint | undefined;
  const hasBlueprint = blueprint && typeof blueprint === "object" && "trigger" in blueprint;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {automation?.name ?? "Blueprint"}
            {automation?.blueprintRevision && (
              <Badge variant="outline" className="font-mono text-[11px]">{automation.blueprintRevision}</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-left">
            {automation?.description ?? (hasBlueprint ? (blueprint as AutomationBlueprint).goal : "")}
          </DialogDescription>
        </DialogHeader>

        {!hasBlueprint ? (
          <div className="py-6">
            <JsonBlock value={automation?.blueprint ?? {}} />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <Card className="rounded-xl border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Goal</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{(blueprint as AutomationBlueprint).goal}</CardContent>
            </Card>
            {(blueprint as AutomationBlueprint).summary && (
              <Card className="rounded-xl border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{(blueprint as AutomationBlueprint).summary}</CardContent>
              </Card>
            )}
            <BlueprintSteps blueprint={blueprint as AutomationBlueprint} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-xl border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Input Contract</CardTitle></CardHeader>
                <CardContent>
                  <JsonBlock value={(blueprint as AutomationBlueprint).inputContract ?? {}} />
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Output Contract</CardTitle></CardHeader>
                <CardContent>
                  <JsonBlock value={(blueprint as AutomationBlueprint).outputContract ?? {}} />
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-xl border-border/50 bg-muted/10">
              <CardContent className="pt-4 space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium">{automation?.status}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Revision</span><span className="font-mono">{automation?.blueprintRevision ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Webhook</span><span className="font-mono truncate max-w-[60%]">{automation?.webhookPath ?? "—"}</span></div>
                {automation?.lastError && <div className="pt-2 text-destructive">{automation.lastError}</div>}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function InlineBlueprint({ automation }: { automation: Automation }) {
  const bp = automation.blueprint as AutomationBlueprint | undefined;
  if (!bp || !("trigger" in bp)) {
    return <JsonBlock value={automation.blueprint} />;
  }
  const blueprint = bp as AutomationBlueprint;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/40 bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Goal</div>
        <div className="text-sm mt-1">{blueprint.goal}</div>
        {blueprint.summary && <div className="text-sm text-muted-foreground mt-2">{blueprint.summary}</div>}
      </div>
      <BlueprintSteps blueprint={blueprint} />
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-border/40 bg-muted/10 p-3">
          <div className="font-semibold text-muted-foreground">Input</div>
          <pre className="font-mono text-xs whitespace-pre-wrap mt-1">{JSON.stringify(blueprint.inputContract ?? {}, null, 2)}</pre>
        </div>
        <div className="rounded-xl border border-border/40 bg-muted/10 p-3">
          <div className="font-semibold text-muted-foreground">Output</div>
          <pre className="font-mono text-xs whitespace-pre-wrap mt-1">{JSON.stringify(blueprint.outputContract ?? {}, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
