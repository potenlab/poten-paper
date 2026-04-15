-- idea_validations: 아이디어 검증 도구 결과 저장
-- 포텐체커(poten_diagnoses)와 구분: 러프 아이디어 텍스트 → 빠른 스크리닝
-- 포텐체커는 완성된 사업계획서 파일 업로드 → 심층 분석

create table if not exists public.idea_validations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_text text not null,
  scores jsonb not null,
  overall_score integer not null,
  summary text not null,
  blue_team text not null,
  red_team text not null,
  improvement_tips jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idea_validations_user_id_created_at_idx
  on public.idea_validations (user_id, created_at desc);

-- RLS
alter table public.idea_validations enable row level security;

drop policy if exists "Users read own idea validations"
  on public.idea_validations;
create policy "Users read own idea validations"
  on public.idea_validations
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own idea validations"
  on public.idea_validations;
create policy "Users insert own idea validations"
  on public.idea_validations
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own idea validations"
  on public.idea_validations;
create policy "Users delete own idea validations"
  on public.idea_validations
  for delete
  using (auth.uid() = user_id);
