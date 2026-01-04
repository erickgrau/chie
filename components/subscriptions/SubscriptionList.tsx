import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

const subscriptions = [
    {
        id: 1,
        name: "Netflix",
        amount: 15.99,
        billingCycle: "Monthly",
        nextDate: "Nov 24, 2026",
        status: "Active",
        category: "Entertainment",
        logoColor: "bg-red-600",
    },
    {
        id: 2,
        name: "Dribbble Pro",
        amount: 12.00,
        billingCycle: "Yearly",
        nextDate: "Dec 15, 2026",
        status: "Active",
        category: "Software",
        logoColor: "bg-pink-500",
    },
    {
        id: 3,
        name: "Spotify Duo",
        amount: 14.99,
        billingCycle: "Monthly",
        nextDate: "Nov 28, 2026",
        status: "Active",
        category: "Music",
        logoColor: "bg-green-500",
    },
    {
        id: 4,
        name: "Gym Membership",
        amount: 55.00,
        billingCycle: "Monthly",
        nextDate: "Dec 01, 2026",
        status: "Active",
        category: "Health",
        logoColor: "bg-blue-600",
    },
]

export function SubscriptionList() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
                <Card key={sub.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg ${sub.logoColor} flex items-center justify-center text-white font-bold`}>
                                {sub.name.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-base">{sub.name}</CardTitle>
                                <div className="text-xs text-muted-foreground">{sub.category}</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="mt-4 flex flex-1 flex-col justify-end">
                        <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-bold">
                                ${sub.amount}
                                <span className="text-xs font-normal text-muted-foreground">/{sub.billingCycle === 'Monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                                {sub.status}
                            </Badge>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Next charge: {sub.nextDate}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
