"use client";

import * as React from "react";
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getWallet } from "@/lib/api/billing";

export function CreditsRadial() {
  const { t } = useTranslation("common");
  const [balanceCredits, setBalanceCredits] = React.useState<number>(1000);
  const [totalCredits, setTotalCredits] = React.useState<number>(1000);

  React.useEffect(() => {
    let cancelled = false;
    async function loadWallet() {
      try {
        const wallet = await getWallet();
        if (!cancelled && wallet) {
          const balance = Number(wallet.balanceCredits) || 0;
          const lifetime = Number(wallet.lifetimeCredits) || Math.max(balance, 1000);
          setBalanceCredits(balance);
          setTotalCredits(Math.max(lifetime, balance, 1000));
        }
      } catch {
        // Fallback silently to default
      }
    }
    loadWallet();
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = Math.max(0, balanceCredits);
  const pct = Math.min(100, Math.max(0, Math.round((remaining / totalCredits) * 100)));
  const endAngle = Math.round((remaining / totalCredits) * 360);

  const chartData = [{ name: "credits", value: remaining, fill: "var(--color-credits)" }];

  const chartConfig = {
    credits: {
      label: "Credits",
      color:
        pct > 40
          ? "hsl(217, 91%, 60%)"
          : pct > 15
            ? "hsl(38, 92%, 50%)"
            : "hsl(0, 84%, 60%)",
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
        <span className="text-xs font-semibold text-foreground group-hover:text-blue-500 transition-colors duration-300">
          {remaining.toLocaleString()}{" "}
          {t("credits", { defaultValue: "credits" })}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {t("ofCreditsRemaining", {
            count: totalCredits.toLocaleString(),
            defaultValue: `of ${totalCredits.toLocaleString()} total`,
          })}
        </span>
      </div>
    </motion.div>
  );
}

