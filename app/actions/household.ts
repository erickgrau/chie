
'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Admin client for privileged operations (sending invites)
const adminAuthClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function inviteMemberAction(email: string, householdId: string, invitedByUserId: string) {
    try {
        // 1. Send the official Supabase Invite Email
        const { data, error } = await adminAuthClient.auth.admin.inviteUserByEmail(email, {
            data: {
                household_id: householdId,
                invited_by: invitedByUserId
            },
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=invite`
        })

        if (error) throw error

        // 2. Insert into our local tracking table (household_invitations)
        // We do this to show pending status in UI.
        // Use the admin client to bypass RLS if needed, or just rely on the fact user is admin.
        // Actually, we can just use the standard client for this insert if we want RLS to apply, 
        // but we already have a dedicated function for this. 
        // Let's just return success and let the client-side re-fetch or handle the UI update.

        // However, we DO need to ensure the DB record exists.
        // Since we are server-side, let's just use the admin client to insert the record directly to be safe.

        const { error: dbError } = await adminAuthClient
            .from('household_invitations')
            .insert({
                household_id: householdId,
                email: email,
                invited_by: invitedByUserId,
                role: 'member',
                status: 'pending' // Matches the auth invite status roughly
            })
            .select()

        if (dbError) {
            // If it's a duplicate (unique constraint), that's fine, we treated the email re-send as success.
            if (dbError.code !== '23505') { // Postgres unique_violation code
                throw dbError
            }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Invite Action Error:', error)
        return { success: false, error: error.message }
    }
}
