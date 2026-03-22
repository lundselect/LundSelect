import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://vxxpkdwzqgpvolboazuc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHBrZHd6cWdwdm9sYm9henVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDg1ODMsImV4cCI6MjA4OTc4NDU4M30.EDF8cm6P2K4ftQlp_jclD3HSXwDzkDuLq8-9Qs8BbsA'
)
