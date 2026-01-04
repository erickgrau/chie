
'use client'

import { useState } from 'react'
import { TransactionTable } from "@/components/transactions/TransactionTable"
import { TransactionForm } from "@/components/transactions/TransactionForm"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function TransactionsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleSuccess = () => {
        setIsDialogOpen(false)
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className="max-w-5xl mx-auto p-4 pb-20 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground">View and manage your financial activity.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Transaction</DialogTitle>
                        </DialogHeader>
                        <TransactionForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <TransactionTable key={refreshKey} />
        </div>
    )
}
