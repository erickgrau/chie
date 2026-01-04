import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { DashboardMetrics } from "@/types/metrics"

// Mock Data - In a real app, this would come from an API/Database
const mockMetrics: DashboardMetrics = {
  netWorth: {
    total: 142500.00,
    change: 2.4,
  },
  savingsRate: {
    rate: 32.8,
    target: 30,
  },
  cashFlow: {
    income: 8500,
    expenses: 5240,
    surplus: 3260,
  },
  dti: {
    ratio: 12,
    status: 'good',
  },
  emergencyFund: {
    months: 4.5,
    targetMonths: 6,
  },
  investments: {
    total: 98200.50,
    roi: 8.2,
  },
  creditScore: {
    score: 785,
    provider: 'FICO',
  },
  subscriptions: {
    total: 145.00,
    count: 12,
  }
}

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Snapshot of your household finances.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            View Reports
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

      <SummaryCards metrics={mockMetrics} />
      <DashboardCharts />
      <RecentTransactions />
    </div>
  )
}
