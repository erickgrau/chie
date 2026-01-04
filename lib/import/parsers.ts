
import Papa from 'papaparse'
import { parse, isValid, startOfDay } from 'date-fns'

export type ImportedTransaction = {
    date: Date
    amount: number
    description: string
    category: string | null
    originalData: Record<string, any>
}

export type ColumnMapping = {
    date: string
    amount: string
    description: string
    category?: string
    isCredit?: string // Some banks split debit/credit columns
}

export function parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data)
            },
            error: (error) => {
                reject(error)
            }
        })
    })
}

export function normalizeTransactions(
    rawRows: any[],
    mapping: ColumnMapping
): ImportedTransaction[] {
    return rawRows.map(row => {
        // 1. Date Parsing
        let dateVal = row[mapping.date]
        let dateObj = new Date(dateVal)

        // If raw Date constructor fails, try simple fixups or current date fallback
        if (!isValid(dateObj)) {
            // Simple MM/DD/YYYY attempt if needed (browsers usually handle this well)
            dateObj = new Date()
        }

        // 2. Amount Parsing
        // Handle "$1,200.50", "(50.00)" for negative, etc.
        let amountStr = row[mapping.amount] || '0'

        // If separate credit column exists and has value, prefer it (or logic depends on bank)
        // For MVP, assuming single signed amount column or user selected the right one.

        // Remove currency symbols and commas
        let cleanAmount = amountStr.replace(/[$,]/g, '').trim()

        // Handle parentheses for negative: "(100)" -> "-100"
        if (cleanAmount.startsWith('(') && cleanAmount.endsWith(')')) {
            cleanAmount = '-' + cleanAmount.slice(1, -1)
        }

        let amount = parseFloat(cleanAmount)
        if (isNaN(amount)) amount = 0

        return {
            date: startOfDay(dateObj),
            amount: amount,
            description: row[mapping.description] || 'No Description',
            category: mapping.category ? (row[mapping.category] || null) : null,
            originalData: row
        }
    }).filter(t => t.description !== 'No Description') // Basic filter
}
