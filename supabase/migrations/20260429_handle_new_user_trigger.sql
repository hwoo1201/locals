-- handle_new_user: auth.users INSERT 시 profiles 레코드 자동 생성
-- ON CONFLICT DO NOTHING — API 라우트에서 수동으로 먼저 insert하는 경우를 위한 안전 장치

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, user_type, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_type', 'owner'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
