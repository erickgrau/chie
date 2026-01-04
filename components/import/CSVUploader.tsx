
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import Papa from 'papaparse'

interface CSVUploaderProps {
    onUpload: (data: any[], filename: string) => void
}

export function CSVUploader({ onUpload }: CSVUploaderProps) {
    const [dragging, setDragging] = useState(false)

    const handleFile = (file: File) => {
        if (!file || file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            alert('Please upload a valid CSV file')
            return
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                onUpload(results.data, file.name)
            },
            error: (error) => {
                console.error('CSV Error:', error)
                alert('Failed to parse CSV file')
            }
        })
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
                <div className="p-4 rounded-full bg-muted">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <p className="font-medium">Drag & drop your CSV here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="csv-upload"
                    onChange={(e) => {
                        if (e.target.files?.[0]) handleFile(e.target.files[0])
                    }}
                />
                <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
                    Select File
                </Button>
            </CardContent>
        </Card>
    )
}
