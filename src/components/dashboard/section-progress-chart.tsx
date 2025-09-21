"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SectionProgressData {
  section: string;
  total: number;
  solved: number;
  partial: number;
  percentage: number;
}

interface SectionProgressChartProps {
  data: SectionProgressData[];
}

export function SectionProgressChart({ data }: SectionProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Բաժինների առաջընթաց
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.slice(0, 5)} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="section" type="category" width={80} />
            <Tooltip
              formatter={(value: number) => [
                `${Math.round(value)}%`,
                "Առաջընթաց",
              ]}
            />
            <Bar dataKey="percentage" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
