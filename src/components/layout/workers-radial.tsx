"use client";

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

// Mock workers — replace with real data later
const TOTAL_WORKERS = 20000;
const ACTIVE_WORKERS = 8500;
const pct = Math.round((ACTIVE_WORKERS / TOTAL_WORKERS) * 100);
// endAngle maps pct → degrees (90 = start, counterclockwise by default but we map it from 90 to 90-360)
const endAngle = 90 - Math.round((ACTIVE_WORKERS / TOTAL_WORKERS) * 360);

const chartData = [{ name: "workers", value: ACTIVE_WORKERS, fill: "var(--color-workers)" }];

const chartConfig = {
  workers: {
    label: "Workers",
    color: pct > 80 ? "hsl(0, 84%, 60%)" : pct > 50 ? "hsl(38, 92%, 50%)" : "hsl(142, 71%, 45%)",
  },
} satisfies ChartConfig;

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function WorkersRadial() {
  const { t } = useTranslation("common");
  return (
    <motion.div 
      className="hidden sm:flex items-center gap-2 group cursor-default"
      whileHover="hover"
      initial="initial"
    >
      <motion.div
        variants={{
          initial: { scale: 1 },
          hover: { scale: 1.15 }
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
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan className="fill-foreground" style={{ fontSize: 8, fontWeight: 700 }}>
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
        <span className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors duration-300">{ACTIVE_WORKERS.toLocaleString()} {t("active", { defaultValue: "Active" })}</span>
        <span className="text-[10px] text-muted-foreground">{t("ofWorkersMax", { count: TOTAL_WORKERS.toLocaleString(), defaultValue: `of ${TOTAL_WORKERS.toLocaleString()} workers max` })}</span>
      </div>
    </motion.div>
  );
}
