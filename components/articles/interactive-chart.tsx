"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

interface InteractiveChartProps {
  type: "bar" | "line" | "pie";
  data: any[];
  title?: string;
  config?: ChartConfig;
}

export const InteractiveChart = ({
  type,
  data,
  title,
  config = {
    value: {
      label: "Значение",
      color: "#22d3ee",
    },
  },
}: InteractiveChartProps) => {
  const chartData = data.map(item => ({
    ...item,
    name: item.name || item.label || item.category || ""
  }));

  return (
    <div className="my-12 rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 md:p-10 shadow-2xl backdrop-blur-sm overflow-hidden">
      {title && (
        <h4 className="mb-10 text-center font-oswald text-xl font-black uppercase tracking-widest text-white/90">
          {title}
        </h4>
      )}
      <div className="h-[400px] w-full pb-6">
        <ChartContainer config={config}>
          {type === "bar" && (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
              />
              <ChartTooltip content={<ChartTooltipContent className="bg-[#121214] border-white/10 text-white" />} />
              <Bar
                dataKey="value"
                fill="#22d3ee"
                radius={[6, 6, 0, 0]}
                className="drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"
              />
            </BarChart>
          )}
          {type === "line" && (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
              />
              <ChartTooltip content={<ChartTooltipContent className="bg-[#121214] border-white/10 text-white" />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ r: 6, fill: "#22d3ee", strokeWidth: 0 }}
                activeDot={{ r: 8, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2 }}
                className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              />
            </LineChart>
          )}
          {type === "pie" && (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#22d3ee" : index === 1 ? "#fbbf24" : index === 2 ? "#f43f5e" : "#a855f7"}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent className="bg-[#121214] border-white/10 text-white" />} />
            </PieChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};
