"use client";

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

// Mock credits — replace with real data later
const TOTAL_CREDITS = 1000;
const USED_CREDITS = 320;
const remaining = TOTAL_CREDITS - USED_CREDITS;
const pct = Math.round((remaining / TOTAL_CREDITS) * 100);
// endAngle maps remaining% → degrees (0 = empty, 360 = full)
const endAngle = Math.round((remaining / TOTAL_CREDITS) * 360);

const chartData = [{ name: "credits", value: remaining, fill: "var(--color-credits)" }];

const chartConfig = {
  credits: {
    label: "Credits",
    color: pct > 40 ? "hsl(217, 91%, 60%)" : pct > 15 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

import { motion } from "framer-motion";

export function CreditsRadial() {
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
        <span className="text-xs font-semibold text-foreground group-hover:text-blue-500 transition-colors duration-300">{remaining.toLocaleString()} credits</span>
        <span className="text-[10px] text-muted-foreground">of {TOTAL_CREDITS.toLocaleString()} remaining</span>
      </div>
    </motion.div>
  );
}
