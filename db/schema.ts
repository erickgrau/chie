import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable('transactions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    amount: real('amount').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    type: text('type').notNull(), // 'income' | 'expense'
    isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const subscriptions = sqliteTable('subscriptions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    amount: real('amount').notNull(),
    billingCycle: text('billing_cycle').notNull(), // 'monthly' | 'yearly'
    nextBillingDate: text('next_billing_date').notNull(),
    status: text('status').default('active'),
    category: text('category'),
    logoUrl: text('logo_url'),
});

export const incomeSources = sqliteTable('income_sources', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    amount: real('amount').notNull(),
    frequency: text('frequency').notNull(), // 'monthly'
    dayOfMonth: integer('day_of_month'), // e.g. 1st or 15th
});
