
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CreditCard, Wallet, Building, TrendingUp } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Account = Database['public']['Tables']['accounts']['Row']

export function AccountList() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    // Form State
    const [newAccountName, setNewAccountName] = useState('')
    const [newAccountType, setNewAccountType] = useState<Account['account_type']>('checking')
    const [newAccountBalance, setNewAccountBalance] = useState('')
    const [newAccountInstitution, setNewAccountInstitution] = useState('')

    useEffect(() => {
        fetchAccounts()
    }, [])

    async function fetchAccounts() {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .order('name')

            if (error) throw error
            if (data) setAccounts(data)
        } catch (error) {
            console.error('Error fetching accounts:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddAccount() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from('accounts').insert({
                user_id: user.id,
                name: newAccountName,
                account_type: newAccountType,
                balance: parseFloat(newAccountBalance) || 0,
                institution: newAccountInstitution,
                is_asset: ['checking', 'savings', 'investment', 'property'].includes(newAccountType),
                currency: 'USD'
            })

            if (error) throw error

            setIsOpen(false)
            fetchAccounts()
            // Reset form
            setNewAccountName('')
            setNewAccountBalance('')
            setNewAccountInstitution('')
        } catch (error) {
            console.error('Error adding account:', error)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'checking': return <Wallet className="h-5 w-5 text-blue-500" />
            case 'savings': return <Building className="h-5 w-5 text-green-500" />
            case 'credit_card': return <CreditCard className="h-5 w-5 text-purple-500" />
            case 'investment': return <TrendingUp className="h-5 w-5 text-indigo-500" />
            default: return <Wallet className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
                    <p className="text-muted-foreground">Manage your bank accounts and credit cards.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Account</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Account Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Chase Checking"
                                    value={newAccountName}
                                    onChange={(e) => setNewAccountName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={newAccountType}
                                    onValueChange={(val: Account['account_type']) => setNewAccountType(val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="checking">Checking</SelectItem>
                                        <SelectItem value="savings">Savings</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="investment">Investment</SelectItem>
                                        <SelectItem value="loan">Loan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="institution">Institution</Label>
                                <Input
                                    id="institution"
                                    placeholder="e.g. Chase, Amex"
                                    value={newAccountInstitution}
                                    onChange={(e) => setNewAccountInstitution(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="balance">Current Balance</Label>
                                <Input
                                    id="balance"
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={newAccountBalance}
                                    onChange={(e) => setNewAccountBalance(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleAddAccount} className="w-full">
                                Save Account
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div>Loading accounts...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => (
                        <Card key={account.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {account.name}
                                </CardTitle>
                                {getIcon(account.account_type)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${account.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {account.institution} • {account.account_type.replace('_', ' ')}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                    {accounts.length === 0 && (
                        <div className="col-span-full text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                            No accounts found. Add one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
