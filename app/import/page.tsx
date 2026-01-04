
import { ImportWizard } from '@/components/import/ImportWizard'
import { Card, CardContent } from "@/components/ui/card"

export default function ImportPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Import Data</h1>
            <ImportWizard />
        </div>
    )
}
