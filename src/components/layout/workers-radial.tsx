"use client";

import * as React from "react";
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { listAgents } from "@/lib/api/agents";

export function WorkersRadial() {
  const { t } = useTranslation("common");
  const [activeWorkers, setActiveWorkers] = React.useState<number>(1);
  const [totalWorkers, setTotalWorkers] = React.useState<number>(5);

  React.useEffect(() => {
    let cancelled = false;
    async function loadAgents() {
      try {
        const agents = await listAgents({ take: 100 });
        if (!cancelled && Array.isArray(agents)) {
          const active = agents.filter(
            (a) => a.status === "PUBLISHED" || (a.status as string) === "ACTIVE",
          ).length;
          setActiveWorkers(active);
          setTotalWorkers(Math.max(agents.length, 5));
        }
      } catch {
        // Fallback silently to default
      }
    }
    loadAgents();
    return () => {
      cancelled = true;
    };
  }, []);

  const pct = Math.min(100, Math.max(0, Math.round((activeWorkers / totalWorkers) * 100)));
  const endAngle = 90 - Math.round((activeWorkers / totalWorkers) * 360);

  const chartData = [{ name: "workers", value: activeWorkers, fill: "var(--color-workers)" }];

  const chartConfig = {
    workers: {
      label: "Workers",
      color:
        pct > 80
          ? "hsl(0, 84%, 60%)"
          : pct > 50
            ? "hsl(38, 92%, 50%)"
            : "hsl(142, 71%, 45%)",
    },
  } satisfies ChartConfig;

  return (
    <motion.div
      className="hidden sm:flex items-center gap-2 group cursor-default"
      whileHover="hover"
      initial="initial"
    >
      <motion.div
        variants={{
          initial: { scale: 1 },
          hover: { scale: 1.15 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <ChartContainer config={chartConfig} className="w-10 h-10">
          <RadialBarChart
            data={chartData}
            endAngle={endAngle}
            innerRadius={14}
            outerRadius={20}
            startAngle={90}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[18, 12]}
            />
            <RadialBar dataKey="value" background cornerRadius={4} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          className="fill-foreground"
                          style={{ fontSize: 8, fontWeight: 700 }}
                        >
                          {pct}%
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </motion.div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors duration-300">
          {activeWorkers.toLocaleString()}{" "}
          {t("active", { defaultValue: "Active" })}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {t("ofWorkersMax", {
            count: totalWorkers.toLocaleString(),
            defaultValue: `of ${totalWorkers.toLocaleString()} employees`,
          })}
        </span>
      </div>
    </motion.div>
  );
}

