
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Tag, Trash2 } from 'lucide-react'
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
import { Badge } from "@/components/ui/badge"

type Category = Database['public']['Tables']['categories']['Row']

const DEFAULT_CATEGORIES = [
    { name: 'Income', type: 'income', color: '#10B981', icon: 'Wallet' },
    { name: 'Housing', type: 'expense', color: '#EF4444', icon: 'Home' },
    { name: 'Food', type: 'expense', color: '#F59E0B', icon: 'Utensils' },
    { name: 'Transportation', type: 'expense', color: '#3B82F6', icon: 'Car' },
    { name: 'Utilities', type: 'expense', color: '#6366F1', icon: 'Zap' },
    { name: 'Health', type: 'expense', color: '#EC4899', icon: 'Heart' },
    { name: 'Personal', type: 'expense', color: '#8B5CF6', icon: 'User' },
    { name: 'Entertainment', type: 'expense', color: '#F472B6', icon: 'Tv' },
]

export function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    // Form State
    const [newName, setNewName] = useState('')
    const [newType, setNewType] = useState<Category['category_type']>('expense')
    const [newColor, setNewColor] = useState('#64748b')

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('category_type')
                .order('name')

            if (error) throw error
            if (data) setCategories(data)
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddCategory() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from('categories').insert({
                user_id: user.id,
                name: newName,
                category_type: newType,
                color: newColor,
                is_active: true
            })

            if (error) throw error

            setIsOpen(false)
            fetchCategories()
            setNewName('')
            setNewColor('#64748b')
        } catch (error) {
            console.error('Error adding category:', error)
        }
    }

    async function handleSeedDefaults() {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const inserts = DEFAULT_CATEGORIES.map(cat => ({
                user_id: user.id,
                name: cat.name,
                category_type: cat.type as any,
                color: cat.color,
                icon: cat.icon,
                is_system: true,
                is_active: true
            }))

            const { error } = await supabase.from('categories').insert(inserts)
            if (error) throw error

            fetchCategories()
        } catch (error) {
            console.error('Error seeding categories:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure? This will not delete transactions but will remove the category from list.')) return
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id)
            if (error) throw error
            fetchCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
        }
    }

    const groupedCategories = categories.reduce((acc, cat) => {
        const type = cat.category_type
        if (!acc[type]) acc[type] = []
        acc[type].push(cat)
        return acc
    }, {} as Record<string, Category[]>)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
                    <p className="text-muted-foreground">Manage transaction categories.</p>
                </div>
                <div className="flex gap-2">
                    {categories.length === 0 && (
                        <Button variant="outline" onClick={handleSeedDefaults} disabled={loading}>
                            Seed Defaults
                        </Button>
                    )}
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Groceries"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={newType}
                                        onValueChange={(val: any) => setNewType(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                            <SelectItem value="transfer">Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Color</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899', '#64748b'].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                className={`w-8 h-8 rounded-full border-2 ${newColor === c ? 'border-black' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setNewColor(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={handleAddCategory} className="w-full">
                                    Save Category
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedCategories).map(([type, cats]) => (
                    <Card key={type}>
                        <CardHeader>
                            <CardTitle className="capitalize">{type}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {cats.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }} />
                                        <span className="font-medium">{cat.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
