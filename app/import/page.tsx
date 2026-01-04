import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react"

export default function ImportPage() {
    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Import Data</h2>
                <p className="text-muted-foreground">
                    Upload bank statements to automatically track your finances.
                </p>
            </div>

            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                    <div className="bg-background p-4 rounded-full shadow-sm ring-1 ring-inset ring-muted">
                        <UploadCloud className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Click to upload or drag and drop</h3>
                        <p className="text-sm text-muted-foreground">
                            CSV, PDF bank statements (max 10MB)
                        </p>
                    </div>
                    <Button variant="outline">Select Files</Button>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Recent Imports</h3>
                <Card>
                    <CardContent className="p-0">
                        {[1, 2].map((item) => (
                            <div key={item} className="flex items-center p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <FileText className="h-8 w-8 mr-4 text-muted-foreground p-1.5 bg-muted rounded-md" />
                                <div className="flex-1 space-y-0.5">
                                    <p className="text-sm font-medium">Chase_Statement_Oct_2023.pdf</p>
                                    <p className="text-xs text-muted-foreground">Parsed 42 transactions • Auto-categorized 90%</p>
                                </div>
                                <div className="flex items-center text-sm text-green-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                    Success
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
