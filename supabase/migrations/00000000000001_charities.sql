ALTER TABLE charities ADD COLUMN IF NOT EXISTS category text;

CREATE TABLE IF NOT EXISTS charity_contributions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  charity_id uuid REFERENCES charities(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date timestamptz DEFAULT now()
);

ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own charity_contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);

-- Create a storage bucket for charity images
INSERT INTO storage.buckets (id, name, public) VALUES ('charities', 'charities', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'charities' );
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'charities' AND auth.role() = 'authenticated' );
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING ( bucket_id = 'charities' AND auth.role() = 'authenticated' );
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING ( bucket_id = 'charities' AND auth.role() = 'authenticated' );
