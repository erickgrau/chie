
'use server'

const pdf = require('pdf-parse')

export type PDFLine = string

export async function parsePDFAction(formData: FormData): Promise<{ success: boolean, data?: PDFLine[], error?: string }> {
    try {
        const file = formData.get('file') as File
        if (!file) {
            throw new Error('No file provided')
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const data = await pdf(buffer)

        // Split by newlines and filter empty lines
        const text: string = data.text
        const lines: string[] = text.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0)

        return { success: true, data: lines }
    } catch (error: any) {
        console.error('PDF Parse Error:', error)
        return { success: false, error: error.message }
    }
}
