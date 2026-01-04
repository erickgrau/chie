

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, FileSpreadsheet } from 'lucide-react'
import Papa from 'papaparse'
import { parsePDFAction } from '@/app/actions/upload'

interface FileUploaderProps {
    onUpload: (data: any[], filename: string) => void
    onLoading?: (isLoading: boolean) => void
}

export function FileUploader({ onUpload, onLoading }: FileUploaderProps) {
    const [dragging, setDragging] = useState(false)

    const handleFile = async (file: File) => {
        if (!file) return

        console.log('File selected:', file.name, file.type, file.size)
        onLoading?.(true)

        try {
            // Loose check for CSV to support more mime types
            if (file.type.includes('csv') || file.name.toLowerCase().endsWith('.csv')) {
                console.log('Processing as CSV...')
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        console.log('CSV Parsed. Rows:', results.data.length)
                        if (results.data.length === 0) {
                            alert('The CSV file appears to be empty.')
                        } else {
                            onUpload(results.data, file.name)
                        }
                        onLoading?.(false)
                    },
                    error: (error) => {
                        console.error('CSV Parsing Error:', error)
                        alert('Failed to parse CSV file: ' + error.message)
                        onLoading?.(false)
                    }
                })
            } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                console.log('Processing as PDF...')
                const formData = new FormData()
                formData.append('file', file)

                const result = await parsePDFAction(formData)
                console.log('PDF Action Result:', result)

                if (result.success && result.data) {
                    if (result.data.length === 0) {
                        alert('No text found in this PDF. It might be an image scan.')
                    } else {
                        // Convert lines to a structure compatible with our ColumnMapper
                        // We'll treat the entire line as a single "raw_text" column for now,
                        // OR we try to regex split it. 
                        // Better approach for Mapper: One object per line.
                        const pdfRows = result.data.map(line => ({
                            raw_text: line
                        }))
                        onUpload(pdfRows, file.name)
                    }
                } else {
                    alert('Failed to parse PDF: ' + (result.error || 'Unknown error'))
                }
                onLoading?.(false)
            } else {
                console.warn('Unsupported file type:', file.type)
                alert(`Unsupported file type: ${file.type}. Please use .csv or .pdf`)
                onLoading?.(false)
            }
        } catch (error: any) {
            console.error('Critical Upload Error:', error)
            alert('An unexpected error occurred: ' + error.message)
            onLoading?.(false)
        }
    }

    return (
        <Card className={`border-2 border-dashed transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}>
            <CardContent
                className="flex flex-col items-center justify-center py-10 space-y-4"
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
                }}
            >
                <div className="p-4 rounded-full bg-muted flex gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <FileText className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center">
                    <p className="font-medium">Drag & drop CSV or PDF</p>
                    <p className="text-sm text-muted-foreground mt-1">Bank statements supported</p>
                </div>
                <input
                    type="file"
                    accept=".csv,.pdf"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                        if (e.target.files?.[0]) handleFile(e.target.files[0])
                    }}
                />
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    Select File
                </Button>
            </CardContent>
        </Card>
    )
}

