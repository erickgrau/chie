import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, PiggyBank, TrendingUp, Wallet, ShieldCheck, Activity, LineChart } from "lucide-react"
import type { DashboardMetrics } from "@/types/metrics"

interface SummaryCardsProps {
    metrics: DashboardMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* 1. Net Worth */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(metrics.netWorth.total)}</div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.netWorth.change > 0 ? '+' : ''}{metrics.netWorth.change}% from last month
                    </p>
                </CardContent>
            </Card>

            {/* 2. Savings Rate */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.savingsRate.rate}%</div>
                    <p className="text-xs text-muted-foreground">
                        Target: {metrics.savingsRate.target}%
                    </p>
                </CardContent>
            </Card>

            {/* 3. Monthly Cash Flow */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${metrics.cashFlow.surplus >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {metrics.cashFlow.surplus >= 0 ? '+' : ''}{formatCurrency(metrics.cashFlow.surplus)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Inc: {formatCurrency(metrics.cashFlow.income)} / Exp: {formatCurrency(metrics.cashFlow.expenses)}
                    </p>
                </CardContent>
            </Card>

            {/* 4. DTI Ratio */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Debt-to-Income</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.dti.ratio}%</div>
                    <p className="text-xs text-muted-foreground">
                        Status: <span className="capitalize">{metrics.dti.status}</span>
                    </p>
                </CardContent>
            </Card>

            {/* 5. Emergency Fund */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.emergencyFund.months} Months</div>
                    <p className="text-xs text-muted-foreground">
                        Target: {metrics.emergencyFund.targetMonths} Months
                    </p>
                </CardContent>
            </Card>

            {/* 6. Investment Portfolio */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Investments</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(metrics.investments.total)}</div>
                    <p className="text-xs text-muted-foreground">
                        ROI: {metrics.investments.roi > 0 ? '+' : ''}{metrics.investments.roi}% YTD
                    </p>
                </CardContent>
            </Card>

            {/* 7. Credit Score */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.creditScore.score}</div>
                    <p className="text-xs text-muted-foreground">
                        Source: {metrics.creditScore.provider}
                    </p>
                </CardContent>
            </Card>

            {/* 8. Subscriptions (Keeping for grid balance) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(metrics.subscriptions.total)}</div>
                    <p className="text-xs text-muted-foreground">
                        {metrics.subscriptions.count} Active
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
