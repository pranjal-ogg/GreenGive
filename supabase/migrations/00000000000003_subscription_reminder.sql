-- Add reminder_sent_at to subscriptions to track renewal reminders
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
