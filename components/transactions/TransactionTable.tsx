
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    accounts: Database['public']['Tables']['accounts']['Row'] | null
    categories: Database['public']['Tables']['categories']['Row'] | null
}

export function TransactionTable() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchTransactions()
    }, [])

    async function fetchTransactions() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          accounts (name, icon),
          categories (name, icon, color)
        `)
                .order('transaction_date', { ascending: false })
                .limit(50)

            if (error) throw error
            if (data) setTransactions(data as any) // Type casting due to join
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : transactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>
                                    {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{tx.merchant || tx.description}</div>
                                    {tx.description && tx.description !== tx.merchant && (
                                        <div className="text-xs text-muted-foreground">{tx.description}</div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {tx.categories ? (
                                        <Badge variant="secondary" style={{
                                            backgroundColor: tx.categories.color ? `${tx.categories.color}20` : undefined,
                                            color: tx.categories.color || undefined
                                        }}>
                                            {tx.categories.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{tx.accounts?.name}</span>
                                </TableCell>
                                <TableCell className={`text-right font-medium ${tx.transaction_type === 'income' ? 'text-green-600' : ''
                                    }`}>
                                    {tx.transaction_type === 'income' ? '+' : ''}
                                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
