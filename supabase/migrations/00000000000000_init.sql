-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Table: subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan text CHECK (plan IN ('monthly', 'yearly')),
  status text CHECK (status IN ('active', 'cancelled', 'lapsed')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Table: scores
CREATE TABLE scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score int CHECK (score >= 1 AND score <= 45),
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Table: charities
CREATE TABLE charities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  image_url text,
  website text,
  events jsonb,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table: user_charities
CREATE TABLE user_charities (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  charity_id uuid REFERENCES charities(id) ON DELETE CASCADE,
  contribution_pct int DEFAULT 10,
  PRIMARY KEY (user_id, charity_id)
);

-- Table: draws
CREATE TABLE draws (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month date NOT NULL,
  status text CHECK (status IN ('pending', 'simulated', 'published')),
  draw_type text CHECK (draw_type IN ('random', 'weighted')),
  winning_numbers int[],
  jackpot_amount numeric,
  pool_4match numeric,
  pool_3match numeric,
  created_at timestamptz DEFAULT now()
);

-- Table: draw_entries
CREATE TABLE draw_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  numbers int[]
);

-- Table: winners
CREATE TABLE winners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type text CHECK (match_type IN ('5match', '4match', '3match')),
  prize_amount numeric,
  proof_url text,
  status text CHECK (status IN ('pending', 'verified', 'rejected', 'paid')),
  created_at timestamptz DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for scores
CREATE POLICY "Users can view own scores" ON scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON scores
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_charities
CREATE POLICY "Users can view own user_charities" ON user_charities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_charities" ON user_charities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_charities" ON user_charities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own user_charities" ON user_charities
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for winners
CREATE POLICY "Users can view own winners" ON winners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own winners proof_url" ON winners
  FOR UPDATE USING (auth.uid() = user_id);

-- Give access to charities and draws for reading (since users usually need to see these to participate)
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view charities" ON charities FOR SELECT USING (true);

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view draws" ON draws FOR SELECT USING (true);

-- Trigger: Automatically delete oldest score when > 5 scores exist for a user
CREATE OR REPLACE FUNCTION delete_oldest_score()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM scores WHERE user_id = NEW.user_id) > 5 THEN
    DELETE FROM scores
    WHERE id = (
      SELECT id FROM scores 
      WHERE user_id = NEW.user_id 
      ORDER BY date ASC, created_at ASC 
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maintain_five_scores
AFTER INSERT ON scores
FOR EACH ROW
EXECUTE FUNCTION delete_oldest_score();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON scores(user_id, date);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_user ON draw_entries(draw_id, user_id);
CREATE INDEX IF NOT EXISTS idx_winners_draw_status ON winners(draw_id, status);

-- Trigger: Automatically insert row into public.users when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
