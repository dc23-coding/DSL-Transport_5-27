-- Users table (linked to Clerk for auth)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'broker', 'driver')),
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table for multi-tenancy
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  vehicle_count INTEGER NOT NULL DEFAULT 0,
  annual_billing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  license_plate TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_use', 'maintenance', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loads table
CREATE TABLE loads (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  driver_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('Scheduled', 'Picked Up', 'Delivered')),
  load_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table (for billing)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'professional', 'enterprise')),
  vehicle_count INTEGER NOT NULL,
  annual_billing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs for Enterprise
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);