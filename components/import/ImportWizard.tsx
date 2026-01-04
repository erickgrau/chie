'use client'

import { useState } from 'react'
import { FileUploader } from './FileUploader'
import { ColumnMapper } from './ColumnMapper'
import { ImportedTransaction } from '@/lib/import/parsers'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Check, ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Step = 'upload' | 'map' | 'review' | 'success'

export function ImportWizard() {
    const [step, setStep] = useState<Step>('upload')
    const [rawRows, setRawRows] = useState<any[]>([])
    const [transactions, setTransactions] = useState<ImportedTransaction[]>([])
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const handleUpload = (data: any[]) => {
        setRawRows(data)
        setStep('map')
    }

    const handleMappingConfirm = (data: ImportedTransaction[]) => {
        setTransactions(data)
        setStep('review')
    }

    const handleCommit = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get household ID (simplified for MVP)
            const { data: membership } = await supabase
                .from('household_members')
                .select('household_id')
                .eq('user_id', user.id)
                .single()

            if (!membership) {
                alert('No household found')
                return
            }

            // Insert transactions
            const toInsert = transactions.map(t => ({
                household_id: membership.household_id,
                amount: t.amount,
                date: format(t.date, 'yyyy-MM-dd'),
                description: t.description,
                category_name: t.category,
                category_id: null, // Resolving to Uncategorized logic omitted for brevity, assuming DB default or null is OK
                is_personal: false, // Defaulting to shared for imported household data
            }))

            // For MVP, letting DB handle null category or we should fetch default
            const { data: uncateg } = await supabase.from('categories').select('id').eq('name', 'Uncategorized').single()
            const fallbackId = uncateg?.id

            const finalInserts = toInsert.map(t => ({
                ...t,
                category_id: fallbackId,
                category_name: undefined
            }))

            const { error } = await supabase.from('transactions').insert(finalInserts as any)
            if (error) throw error

            setStep('success')
        } catch (error: any) {
            console.error('Import Error:', error)
            alert('Failed to save transactions: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className={step === 'upload' ? 'text-primary font-bold' : ''}>1. Upload</div>
                <div>&gt;</div>
                <div className={step === 'map' ? 'text-primary font-bold' : ''}>2. Map Columns</div>
                <div>&gt;</div>
                <div className={step === 'review' ? 'text-primary font-bold' : ''}>3. Review</div>
            </div>

            {step === 'upload' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Upload Bank Export</h2>
                    <p>Select a CSV or PDF file from your bank.</p>
                    <FileUploader onUpload={handleUpload} onLoading={setUploading} />
                    {uploading && <p className="text-sm text-muted-foreground animate-pulse">Processing file...</p>}
                </div>
            )}

            {step === 'map' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setStep('upload')}><ArrowLeft className="w-4 h-4" /></Button>
                        <h2 className="text-2xl font-bold">Map Columns</h2>
                    </div>
                    <ColumnMapper data={rawRows} onConfirm={handleMappingConfirm} />
                </div>
            )}

            {step === 'review' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setStep('map')}><ArrowLeft className="w-4 h-4" /></Button>
                        <h2 className="text-2xl font-bold">Review & Save</h2>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Ready to Import {transactions.length} Transactions</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.slice(0, 5).map((t, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{format(t.date, 'MMM d, yyyy')}</TableCell>
                                            <TableCell>{t.description}</TableCell>
                                            <TableCell className="text-right font-mono">${t.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {transactions.length > 5 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                ...and {transactions.length - 5} more
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Button className="w-full" size="lg" onClick={handleCommit} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        Import {transactions.length} Transactions
                    </Button>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center py-20 space-y-6 bg-green-50/10 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Import Successful!</h2>
                        <p className="text-muted-foreground">Your transactions have been added to the database.</p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={() => window.location.reload()}>Import Another</Button>
                        <Button onClick={() => window.location.href = '/transactions'}>View Transactions</Button>
                    </div>
                </div>
            )}
        </div>
    )
}
