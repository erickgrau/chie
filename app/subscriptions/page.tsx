import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList"

export default function SubscriptionsPage() {
    return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
                    <p className="text-muted-foreground">Manage your recurring payments.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Subscription
                </Button>
            </div>
            <SubscriptionList />
        </div>
    )
}
