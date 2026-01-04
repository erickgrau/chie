-- Enable RLS
alter table auth.users enable row level security;

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  currency text default 'USD',
  locale text default 'en-US',
  timezone text default 'America/New_York',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Platform Roles
create table public.platform_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique,
  role text not null check (role in ('platform_owner', 'platform_admin')),
  granted_by uuid references auth.users,
  granted_at timestamptz default now(),
  is_active boolean default true
);
alter table public.platform_roles enable row level security;

-- Households
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id),
  subscription_status text default 'free', -- free, trial, active, past_due, cancelled
  subscription_plan text default 'free', -- free, basic, premium
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  billing_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.households enable row level security;

-- Household Invitations
create table public.household_invitations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  invited_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.household_invitations enable row level security;

-- Household Members
create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('head_of_house', 'member', 'viewer')),
  nickname text,
  can_see_all_personal boolean default false, -- special override for heads
  invited_by uuid references public.profiles(id),
  invited_at timestamptz default now(),
  joined_at timestamptz,
  status text default 'pending' check (status in ('pending', 'active', 'suspended')),
  
  unique(household_id, user_id)
);
alter table public.household_members enable row level security;

-- Accounts
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  account_type text not null, -- checking, savings, credit_card, investment, loan, property
  institution text,
  balance decimal(15,2) default 0,
  currency text default 'USD',
  is_asset boolean default true, -- true for assets, false for liabilities
  is_active boolean default true,
  icon text,
  color text,
  display_order int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.accounts enable row level security;

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  parent_id uuid references public.categories(id),
  category_type text not null, -- income, expense, transfer
  icon text,
  color text,
  is_system boolean default false, -- system defaults vs user-created
  is_active boolean default true,
  budget_default decimal(15,2),
  display_order int,
  created_at timestamptz default now()
);
alter table public.categories enable row level security;

-- Recurring Transactions
create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  account_id uuid references public.accounts(id),
  category_id uuid references public.categories(id),
  name text not null,
  amount decimal(15,2) not null,
  frequency text not null, -- daily, weekly, biweekly, monthly, quarterly, yearly
  next_date date,
  last_date date,
  is_active boolean default true,
  reminder_days int default 3,
  auto_categorize boolean default true,
  merchant_pattern text, -- regex for auto-matching
  notes text,
  created_at timestamptz default now()
);
alter table public.recurring_transactions enable row level security;

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id),
  amount decimal(15,2) not null,
  transaction_type text not null, -- income, expense, transfer
  description text,
  merchant text,
  transaction_date date not null,
  is_recurring boolean default false,
  recurring_id uuid references public.recurring_transactions(id),
  notes text,
  tags text[],
  receipt_url text,
  import_source text, -- manual, csv, api
  external_id text, -- for deduplication
  visibility text default 'shared' check (visibility in ('shared', 'personal', 'head_only')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.transactions enable row level security;

-- Budgets
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id),
  amount decimal(15,2) not null,
  period text not null, -- monthly, quarterly, yearly
  start_date date,
  end_date date,
  rollover boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.budgets enable row level security;

-- Goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  target_amount decimal(15,2) not null,
  current_amount decimal(15,2) default 0,
  target_date date,
  linked_account_id uuid references public.accounts(id),
  icon text,
  color text,
  is_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.goals enable row level security;

-- User Preferences
create table public.user_preferences (
  user_id uuid references public.profiles(id) primary key,
  
  -- Dashboard Customization
  dashboard_layout jsonb default '{}', -- widget positions, visibility
  default_date_range text default 'month', -- week, month, quarter, year
  show_cents boolean default true,
  start_of_week int default 0, -- 0=Sunday, 1=Monday
  fiscal_month_start int default 1, -- 1=January
  
  -- Notification Preferences
  email_notifications boolean default true,
  bill_reminders boolean default true,
  budget_alerts boolean default true,
  weekly_summary boolean default true,
  
  -- Display Preferences
  theme text default 'light', -- light, dark, system
  compact_mode boolean default false,
  show_account_balances boolean default true,
  hide_zero_budgets boolean default false,
  
  -- Privacy
  mask_amounts boolean default false,
  
  updated_at timestamptz default now()
);
alter table public.user_preferences enable row level security;

-- Category Rules
create table public.category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id),
  rule_type text not null, -- merchant_contains, merchant_exact, amount_range, description_contains
  rule_value text not null,
  priority int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.category_rules enable row level security;

-- API Connections
create table public.api_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  service_name text not null, -- plaid, zillow, etc.
  connection_status text default 'pending', -- pending, active, error, disconnected
  last_sync timestamptz,
  sync_frequency text default 'daily',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.api_connections enable row level security;

-- Net Worth Snapshots
create table public.net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  snapshot_date date not null,
  total_assets decimal(15,2),
  total_liabilities decimal(15,2),
  net_worth decimal(15,2),
  breakdown jsonb, -- detailed account balances
  created_at timestamptz default now()
);
alter table public.net_worth_snapshots enable row level security;


-- POLICIES (Example Basic Policies - need refinement for household sharing)

-- Profiles: Users can view/edit own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Accounts: Users can view/edit own accounts
create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can insert own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on public.accounts for delete using (auth.uid() = user_id);

-- Transactions: Users can view/edit own transactions
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Function to get user's households (Security Definer to avoid RLS recursion)
create or replace function public.get_my_household_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id from public.household_members where user_id = auth.uid();
$$;

-- Household Members Policies
create policy "Users can view household members" on public.household_members
for select using (
  household_id in (select get_my_household_ids())
);

create policy "Admins can manage household members" on public.household_members
for all using (
  exists (
    select 1 from public.household_members 
    where household_id = public.household_members.household_id 
    and user_id = auth.uid()
    and role in ('head_of_house', 'admin')
  )
);

-- Household Invitations Policies
create policy "Users can view invitations for their household" on public.household_invitations for select using (
  exists (
    select 1 from public.household_members 
    where household_id = public.household_invitations.household_id 
    and user_id = auth.uid()
  )
);

create policy "Admins can create invitations" on public.household_invitations for insert with check (
  exists (
    select 1 from public.household_members 
    where household_id = public.household_invitations.household_id 
    and user_id = auth.uid()
    and role in ('head_of_house', 'admin') 
  )
);

-- Trigger to automatically accept invite when user is created
create or replace function public.handle_invite_acceptance() 
returns trigger as $$
declare
  invite_record public.household_invitations%ROWTYPE;
begin
  -- Check if there is a pending invite for this email
  select * into invite_record
  from public.household_invitations
  where email = new.email
  and status = 'pending';

  if found then
    -- Add to household
    insert into public.household_members (household_id, user_id, role)
    values (invite_record.household_id, new.id, invite_record.role);

    -- Update invite status
    update public.household_invitations
    set status = 'accepted'
    where id = invite_record.id;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_accept_invite on auth.users;
create trigger on_auth_user_accept_invite
  after insert on auth.users
  for each row execute procedure public.handle_invite_acceptance();
