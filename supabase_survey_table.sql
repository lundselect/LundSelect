create table survey_responses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  location text,
  age text,
  gender text,
  frequency text,
  brand_count text,
  channels text[],
  abandoned text,
  abandon_reasons text[],
  instagram_rating text,
  shipping text,
  outfit_ease text,
  categories text[],
  budget text,
  interest text,
  platform_features text[],
  favorite_brands text,
  newsletter text,
  email text
);

-- Allow the API to insert rows
alter table survey_responses enable row level security;
create policy "Allow insert" on survey_responses for insert with check (true);
create policy "Allow select for service role" on survey_responses for select using (true);
