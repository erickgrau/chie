
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from "@/lib/utils"

type Account = Database['public']['Tables']['accounts']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface TransactionFormProps {
    onSuccess?: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // Data State
    const [accounts, setAccounts] = useState<Account[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    // Form State
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [merchant, setMerchant] = useState('')
    const [accountId, setAccountId] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [type, setType] = useState<'income' | 'expense'>('expense')
    const [visibility, setVisibility] = useState<'shared' | 'personal' | 'head_only'>('shared')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const [accRes, catRes] = await Promise.all([
            supabase.from('accounts').select('*').order('name'),
            supabase.from('categories').select('*').order('name')
        ])

        if (accRes.data) setAccounts(accRes.data)
        if (catRes.data) setCategories(catRes.data)
    }

    async function handleSubmit() {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from('transactions').insert({
                user_id: user.id,
                account_id: accountId,
                category_id: categoryId || null,
                transaction_date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                amount: parseFloat(amount),
                description,
                merchant: merchant || description,
                transaction_type: type,
                visibility: visibility,
                created_by: user.id
            })

            if (error) throw error

            // Reset form
            setAmount('')
            setDescription('')
            setMerchant('')

            onSuccess?.()
        } catch (error) {
            console.error('Error adding transaction:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Type</Label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={type === 'expense' ? 'default' : 'outline'}
                            onClick={() => setType('expense')}
                            className="w-full"
                        >
                            Expense
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'income' ? 'default' : 'outline'}
                            onClick={() => setType('income')}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            Income
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-7"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Merchant / Payee</Label>
                <Input
                    placeholder="e.g. Starbucks, Landlord"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Account</Label>
                    <Select value={accountId} onValueChange={setAccountId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    {acc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                            {categories.length === 0 && (
                                <SelectItem value="none" disabled>No categories found</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={(val: any) => setVisibility(val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="shared">Shared (Household)</SelectItem>
                        <SelectItem value="personal">Personal (Private)</SelectItem>
                        <SelectItem value="head_only">Head Only (Admins)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Transaction'}
            </Button>
        </div>
    )
}
