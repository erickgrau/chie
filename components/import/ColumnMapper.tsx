
'use client'

import { useState, useEffect } from 'react'
import { ImportedTransaction, ColumnMapping, normalizeTransactions } from '@/lib/import/parsers'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface ColumnMapperProps {
    data: any[]
    onConfirm: (transactions: ImportedTransaction[]) => void
}

export function ColumnMapper({ data, onConfirm }: ColumnMapperProps) {
    if (!data.length) return null

    const headers = Object.keys(data[0])
    const [mapping, setMapping] = useState<ColumnMapping>({
        date: '',
        amount: '',
        description: '',
    })

    const [preview, setPreview] = useState<ImportedTransaction[]>([])

    useEffect(() => {
        // Auto-detect columns based on common names
        const newMapping = { ...mapping }

        headers.forEach(h => {
            const lowH = h.toLowerCase()
            if (!newMapping.date && (lowH.includes('date') || lowH.includes('day'))) newMapping.date = h
            if (!newMapping.amount && (lowH.includes('amount') || lowH.includes('debit') || lowH.includes('cost'))) newMapping.amount = h
            if (!newMapping.description && (lowH.includes('desc') || lowH.includes('memo') || lowH.includes('merchant'))) newMapping.description = h
            if (!newMapping.category && (lowH.includes('category') || lowH.includes('type'))) newMapping.category = h
        })
        setMapping(newMapping)
    }, []) // Run once on mount

    useEffect(() => {
        if (mapping.date && mapping.amount && mapping.description) {
            setPreview(normalizeTransactions(data.slice(0, 5), mapping))
        }
    }, [mapping, data])

    const isReady = mapping.date && mapping.amount && mapping.description

    const handleContinue = () => {
        const fullData = normalizeTransactions(data, mapping)
        onConfirm(fullData)
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label>Date Column</Label>
                    <Select value={mapping.date} onValueChange={(v) => setMapping({ ...mapping, date: v })}>
                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent>
                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Amount Column</Label>
                    <Select value={mapping.amount} onValueChange={(v) => setMapping({ ...mapping, amount: v })}>
                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent>
                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Description Column</Label>
                    <Select value={mapping.description} onValueChange={(v) => setMapping({ ...mapping, description: v })}>
                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent>
                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Category (Optional)</Label>
                    <Select value={mapping.category || ''} onValueChange={(v) => setMapping({ ...mapping, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {preview.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        Select columns to see preview
                                    </TableCell>
                                </TableRow>
                            ) : (
                                preview.map((t, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{format(t.date, 'MMM d, yyyy')}</TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className={`text-right ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            ${Math.abs(t.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>{t.category || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleContinue} disabled={!isReady}>
                    Continue with {data.length} Rows
                </Button>
            </div>
        </div>
    )
}
