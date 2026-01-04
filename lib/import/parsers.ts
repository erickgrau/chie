
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
        // Smart Parsing for Unstructured Data (e.g. PDF Lines)
        // If the user maps Date, Amount, and Description ALL to the same column (likely "raw_text"),
        // we try to extract data via Regex.
        if (mapping.date === mapping.amount && mapping.amount === mapping.description) {
            const raw = row[mapping.date] || ''

            // 1. Extract Date (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc)
            // Simple match for common date formats
            const dateMatch = raw.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{1,2}-\d{1,2})|((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2})/)
            let dateObj = new Date()
            let cleanLine = raw

            if (dateMatch) {
                dateObj = new Date(dateMatch[0])
                if (dateObj.getFullYear() < 2000) dateObj.setFullYear(new Date().getFullYear()) // Fix "Jan 01" missing year
                // Remove date from line to help description cleanup
                cleanLine = cleanLine.replace(dateMatch[0], '').trim()
            }

            // 2. Extract Amount
            // Look for number at end of line, possibly with currency symbol and negatives
            const amountMatch = cleanLine.match(/(-?\$?[\d,]+\.\d{2}(\-?))$/)
            let amount = 0
            if (amountMatch) {
                let amountStr = amountMatch[0].replace(/[$,]/g, '')
                if (amountStr.endsWith('-')) { // "50.00-" format
                    amountStr = '-' + amountStr.slice(0, -1)
                }
                amount = parseFloat(amountStr)
                // Remove amount from line
                cleanLine = cleanLine.replace(amountMatch[0], '').trim()
            }

            // 3. Description is what remains
            return {
                date: isValid(dateObj) ? startOfDay(dateObj) : startOfDay(new Date()),
                amount: isNaN(amount) ? 0 : amount,
                description: cleanLine || raw,
                category: null,
                originalData: row
            }
        }

        // Standard CSV Column Parsing
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
