import Link from "next/link"
import { Home, CreditCard, Upload } from "lucide-react"
import Image from "next/image"

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 max-w-5xl mx-auto justify-between">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Chie Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                        priority
                    />
                    <span className="text-2xl font-bold tracking-tight text-[#1A3D2E] lowercase font-sans">
                        ch<span className="text-primary">i</span>e
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <Link href="/subscriptions" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">Subscriptions</span>
                    </Link>
                    <Link href="/import" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Import</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
