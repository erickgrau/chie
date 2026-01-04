
'use server'

import PDFParser from 'pdf2json'

export type PDFLine = string

export async function parsePDFAction(formData: FormData): Promise<{ success: boolean, data?: PDFLine[], error?: string }> {
    try {
        const file = formData.get('file') as File
        if (!file) {
            throw new Error('No file provided')
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        return new Promise((resolve) => {
            const pdfParser = new PDFParser(null, true) // Enable simple text extraction

            pdfParser.on("pdfParser_dataError", (errData: any) => {
                console.error("PDF Parsing Error:", errData.parserError)
                resolve({ success: false, error: "Failed to parse PDF data" })
            })

            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                try {
                    // pdf2json returns URL-encoded text in generic format
                    // We need to access the text content cautiously
                    // The '1' in constructor means text content output?
                    // Actually getRawTextContent() is simpler
                    const rawText = pdfParser.getRawTextContent()

                    // The text might be somewhat messy, separate by newlines
                    const lines = rawText.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l.length > 0)

                    resolve({ success: true, data: lines })
                } catch (e: any) {
                    resolve({ success: false, error: e.message })
                }
            })

            pdfParser.parseBuffer(buffer)
        })

    } catch (error: any) {
        console.error('PDF Action Error:', error)
        return { success: false, error: error.message }
    }
}
