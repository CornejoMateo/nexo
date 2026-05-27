"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const salesData = [
  { name: "Lun", ventas: 4200, cantidad: 3 },
  { name: "Mar", ventas: 3800, cantidad: 2 },
  { name: "Mie", ventas: 5100, cantidad: 4 },
  { name: "Jue", ventas: 4600, cantidad: 3 },
  { name: "Vie", ventas: 6200, cantidad: 5 },
  { name: "Sab", ventas: 7800, cantidad: 6 },
  { name: "Dom", ventas: 3200, cantidad: 2 },
]

const stockByCategory = [
  { name: "iPhones", stock: 25 },
  { name: "MacBooks", stock: 10 },
  { name: "iPads", stock: 10 },
  { name: "AirPods", stock: 17 },
  { name: "Watch", stock: 12 },
  { name: "Acc", stock: 55 },
]

export function StockChart() {
  const { isDarkMode } = useStore()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock por Categoria</CardTitle>
        <CardDescription>Distribucion de inventario</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stockByCategory}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#333" : "#e5e5e5"}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? "#888" : "#666", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? "#888" : "#666", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
                  border: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}`,
                  borderRadius: "8px",
                  color: isDarkMode ? "#fff" : "#000",
                }}
                formatter={(value: number) => [value, "Unidades"]}
              />
              <Bar
                dataKey="stock"
                fill={isDarkMode ? "#3b82f6" : "#2563eb"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
