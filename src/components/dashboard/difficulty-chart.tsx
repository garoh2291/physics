"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DifficultyData {
  level: string;
  total: number;
  solved: number;
  accuracy: number;
}

interface DifficultyChartProps {
  data: DifficultyData[];
}

export function DifficultyChart({ data }: DifficultyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Բարդության մակարդակով առաջընթաց
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="level" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "solved" ? "Ավարտված" : "Ընդամենը",
                value,
              ]}
            />
            <Bar dataKey="total" fill="#e5e7eb" name="total" />
            <Bar dataKey="solved" fill="#10b981" name="solved" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
