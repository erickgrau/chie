
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, User, Mail, Shield, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

type Member = {
    user_id: string
    role: 'admin' | 'member'
    joined_at: string
    profiles: {
        display_name: string | null
        avatar_url: string | null
        email?: string // Derived if possible, but profiles usually don't have email for privacy by default. 
        // Accessing auth.users is restricted. We rely on profiles.
    } | null
}

type Invitation = {
    id: string
    email: string
    role: 'admin' | 'member'
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
}

export function HouseholdSettings() {
    const [members, setMembers] = useState<Member[]>([])
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteOpen, setInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Use RPC to get household ID securely
            const { data: householdId, error: hhError } = await supabase.rpc('get_current_household_id')

            if (hhError) throw hhError

            if (householdId) {
                // Fetch members (RLS on members might still be strict, but we can try)
                // If RLS fails on select *, we might need a similar RPC for fetching members
                // But let's try standard fetch first. The policy "Users can view household members" uses get_my_household_ids which is also safe.
                const { data: membersData } = await supabase
                    .from('household_members')
                    .select(`
                        user_id,
                        role,
                        joined_at,
                        profiles:user_id (display_name, avatar_url)
                    `)
                    .eq('household_id', householdId)

                if (membersData) setMembers(membersData as any)

                const { data: iData } = await supabase
                    .from('household_invitations')
                    .select('*')
                    .eq('household_id', householdId)

                if (iData) setInvitations(iData as any)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleInvite() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: householdId, error: hhError } = await supabase.rpc('get_current_household_id')

            if (!householdId || hhError) {
                console.error('No household found', hhError)
                alert('Could not identify your household. Please contact support.')
                return
            }

            // Call Server Action to send real email
            const { inviteMemberAction } = await import('@/app/actions/household')
            const result = await inviteMemberAction(inviteEmail, householdId, user.id)

            if (!result.success) {
                throw new Error(result.error)
            }

            setInviteOpen(false)
            setInviteEmail('')
            fetchData()
        } catch (error: any) {
            console.error('Error sending invite:', error)
            alert(`Failed to send invite: ${error.message || error}`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Household Settings</h2>
                    <p className="text-muted-foreground">Manage members and permissions.</p>
                </div>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite to Household</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleInvite} className="w-full">
                                Send Invitation
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Members</CardTitle>
                        <CardDescription>People with access to this household's shared data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {members.map((member) => (
                            <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{member.profiles?.display_name || 'Unknown User'}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            <span className="capitalize">{member.role}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Actions like remove member could go here */}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {invitations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Invitations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {invitations.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">{inv.email}</div>
                                            <div className="text-sm text-muted-foreground">
                                                <Badge variant="outline" className="text-xs">{inv.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        Cancel
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
