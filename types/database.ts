
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    display_name: string | null
                    avatar_url: string | null
                    currency: string | null
                    locale: string | null
                    timezone: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    display_name?: string | null
                    avatar_url?: string | null
                    currency?: string | null
                    locale?: string | null
                    timezone?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    currency?: string | null
                    locale?: string | null
                    timezone?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            accounts: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string
                    account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'property'
                    institution: string | null
                    balance: number | null
                    currency: string | null
                    is_asset: boolean | null
                    is_active: boolean | null
                    icon: string | null
                    color: string | null
                    display_order: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name: string
                    account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'property'
                    institution?: string | null
                    balance?: number | null
                    currency?: string | null
                    is_asset?: boolean | null
                    is_active?: boolean | null
                    icon?: string | null
                    color?: string | null
                    display_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    name?: string
                    account_type?: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'property'
                    institution?: string | null
                    balance?: number | null
                    currency?: string | null
                    is_asset?: boolean | null
                    is_active?: boolean | null
                    icon?: string | null
                    color?: string | null
                    display_order?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string | null
                    account_id: string | null
                    category_id: string | null
                    amount: number
                    transaction_type: 'income' | 'expense' | 'transfer'
                    description: string | null
                    merchant: string | null
                    transaction_date: string
                    is_recurring: boolean | null
                    recurring_id: string | null
                    notes: string | null
                    tags: string[] | null
                    receipt_url: string | null
                    import_source: string | null
                    external_id: string | null
                    visibility: 'shared' | 'personal' | 'head_only' | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    account_id?: string | null
                    category_id?: string | null
                    amount: number
                    transaction_type: 'income' | 'expense' | 'transfer'
                    description?: string | null
                    merchant?: string | null
                    transaction_date: string
                    is_recurring?: boolean | null
                    recurring_id?: string | null
                    notes?: string | null
                    tags?: string[] | null
                    receipt_url?: string | null
                    import_source?: string | null
                    external_id?: string | null
                    visibility?: 'shared' | 'personal' | 'head_only' | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    account_id?: string | null
                    category_id?: string | null
                    amount?: number
                    transaction_type?: 'income' | 'expense' | 'transfer'
                    description?: string | null
                    merchant?: string | null
                    transaction_date?: string
                    is_recurring?: boolean | null
                    recurring_id?: string | null
                    notes?: string | null
                    tags?: string[] | null
                    receipt_url?: string | null
                    import_source?: string | null
                    external_id?: string | null
                    visibility?: 'shared' | 'personal' | 'head_only' | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string
                    parent_id: string | null
                    category_type: 'income' | 'expense' | 'transfer'
                    icon: string | null
                    color: string | null
                    is_system: boolean | null
                    is_active: boolean | null
                    budget_default: number | null
                    display_order: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name: string
                    parent_id?: string | null
                    category_type: 'income' | 'expense' | 'transfer'
                    icon?: string | null
                    color?: string | null
                    is_system?: boolean | null
                    is_active?: boolean | null
                    budget_default?: number | null
                    display_order?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    name?: string
                    parent_id?: string | null
                    category_type?: 'income' | 'expense' | 'transfer'
                    icon?: string | null
                    color?: string | null
                    is_system?: boolean | null
                    is_active?: boolean | null
                    budget_default?: number | null
                    display_order?: number | null
                    created_at?: string
                }
            }
        }
    }
}
