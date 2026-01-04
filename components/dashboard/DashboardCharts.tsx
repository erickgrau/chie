"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"

const expData = [
    { name: "Groceries", value: 400, color: "#D4AF37" }, // Gold
    { name: "Utilities", value: 200, color: "#228B22" }, // Forest
    { name: "Rent", value: 1200, color: "#1F2937" }, // Dark
    { name: "Entertainment", value: 150, color: "#F5DEB3" }, // Wheat
]

const incData = [
    { name: "Jan", income: 4000, expense: 2800 },
    { name: "Feb", income: 3000, expense: 1398 },
    { name: "Mar", income: 2000, expense: 9800 },
    { name: "Apr", income: 2780, expense: 3908 },
    { name: "May", income: 1890, expense: 4800 },
    { name: "Jun", income: 2390, expense: 3800 },
]

export function DashboardCharts() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={incData}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip />
                                <Bar dataKey="income" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#228B22" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
