import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Proteção: apenas aceita requests com a service key como Bearer
const SETUP_TOKEN = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${SETUP_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = createAdminClient()
  const results: { step: string; ok: boolean; error?: string }[] = []

  // Lista de statements SQL a executar em ordem
  const steps: { name: string; sql: string }[] = [
    {
      name: 'can_view_all function',
      sql: `
        create or replace function can_view_all()
        returns boolean language sql security definer stable as $$
          select coalesce(
            (select role in ('gerente','supervisor','consultor')
             from profiles where id = auth.uid()),
            false
          )
        $$
      `,
    },
    { name: 'drop policy escolas select',     sql: `drop policy if exists "Selecionar escolas" on escolas` },
    { name: 'create policy escolas select',   sql: `create policy "Selecionar escolas" on escolas for select using (can_view_all())` },
    { name: 'drop policy registros select',   sql: `drop policy if exists "Selecionar registros" on registros` },
    { name: 'create policy registros select', sql: `create policy "Selecionar registros" on registros for select using (can_view_all())` },
    { name: 'drop policy negociacoes select', sql: `drop policy if exists "Selecionar negociações" on negociacoes` },
    { name: 'create policy negociacoes',      sql: `create policy "Selecionar negociações" on negociacoes for select using (can_view_all())` },
    { name: 'drop policy tarefas select',     sql: `drop policy if exists "Selecionar tarefas" on tarefas` },
    { name: 'create policy tarefas',          sql: `create policy "Selecionar tarefas" on tarefas for select using (can_view_all())` },
    { name: 'drop policy contratos select',   sql: `drop policy if exists "Selecionar contratos" on contratos` },
    { name: 'create policy contratos',        sql: `create policy "Selecionar contratos" on contratos for select using (can_view_all())` },
    { name: 'drop policy notas select',       sql: `drop policy if exists "Selecionar notas" on notas_escola` },
    { name: 'create policy notas',            sql: `create policy "Selecionar notas" on notas_escola for select using (can_view_all())` },
    { name: 'drop policy contatos select',    sql: `drop policy if exists "Selecionar contatos" on contatos_escola` },
    { name: 'create policy contatos',         sql: `create policy "Selecionar contatos" on contatos_escola for select using (can_view_all())` },
    { name: 'drop policy formularios select', sql: `drop policy if exists "Ler formulários (apenas autenticados)" on formularios` },
    { name: 'create policy formularios',      sql: `create policy "Ler formulários (apenas autenticados)" on formularios for select using (can_view_all())` },
  ]

  for (const step of steps) {
    const { error } = await sb.rpc('exec_sql', { sql: step.sql }).single() as any
    // Se rpc não existe, tenta via from().select() que não serve pra DDL
    // Precisamos de uma função exec_sql criada no banco primeiro

    // Workaround: usar raw query via pg library não disponível no Supabase JS SDK
    // Reportar resultado
    results.push({ step: step.name, ok: !error, error: error?.message })
  }

  return NextResponse.json({ results })
}
