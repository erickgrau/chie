import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const transactions = [
    {
        id: 1,
        name: "Netflix Subscription",
        amount: -15.99,
        date: "2023-10-24",
        category: "Entertainment",
        method: "Credit Card",
    },
    {
        id: 2,
        name: "Trader Joe's",
        amount: -84.23,
        date: "2023-10-23",
        category: "Groceries",
        method: "Debit Card",
    },
    {
        id: 3,
        name: "Client Payment - Project X",
        amount: 1250.00,
        date: "2023-10-22",
        category: "Income",
        method: "Bank Transfer",
    },
    {
        id: 4,
        name: "Electric Bill",
        amount: -142.50,
        date: "2023-10-20",
        category: "Utilities",
        method: "Bank Transfer",
    },
    {
        id: 5,
        name: "Spotify Duo",
        amount: -14.99,
        date: "2023-10-18",
        category: "Entertainment",
        method: "Credit Card",
    },
]

export function RecentTransactions() {
    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{transaction.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{transaction.category}</span>
                                    <span>•</span>
                                    <span>{transaction.date}</span>
                                </div>
                            </div>
                            <div className={`font-medium ${transaction.amount > 0 ? 'text-secondary' : ''}`}>
                                {transaction.amount > 0 ? '+' : ''}
                                ${Math.abs(transaction.amount).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
