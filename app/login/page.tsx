'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
    const handleLogin = async () => {
        const supabase = createClient()

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })

        if (error) {
            console.error('Error logging in:', error)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-[#FAF7F2]">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-lg text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#2D2D2D]">
                        Welcome to chie
                    </h2>
                    <p className="mt-2 text-sm text-[#555]">
                        Your personal finance dashboard
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <Button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-2 bg-[#F5C542] hover:bg-[#E0B135] text-[#2D2D2D] font-semibold py-6 text-lg"
                    >
                        <LogIn size={20} />
                        Sign in with Google
                    </Button>

                    <p className="text-xs text-[#888]">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
