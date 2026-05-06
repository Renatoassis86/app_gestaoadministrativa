-- ============================================================
-- FIX: Recriar trigger handle_new_user com public. explícito
-- Cole este SQL no Editor SQL do Supabase e execute
-- ============================================================

-- 1. Remover trigger antigo
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Recriar a função com schema público explícito
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3. Recriar o trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Confirmar
select 'Trigger corrigido! Agora crie o usuário.' as status;
