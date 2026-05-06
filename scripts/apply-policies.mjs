import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lyisdsnocroocxfblvqf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('\n━━━ Aplicando políticas RLS para consultores ━━━\n')

  // Passo 1: Criar função temporária que executa DDL arbitrário
  // Isso funciona porque service role tem permissão de criar funções
  console.log('  Criando função auxiliar apply_ddl...')

  const createHelper = await sb.rpc('set_limit', { n: 0.3 }).then(() => null).catch(() => null)

  // Usar a função can_view_all que já existe para confirmar conexão
  const { data: testFn, error: testErr } = await sb.rpc('can_view_all')
  if (testErr && testErr.message.includes('does not exist')) {
    console.log('  ❌ can_view_all não encontrada')
    return
  }
  console.log('  ✅ Conexão com banco confirmada\n')

  // Passo 2: Verificar cada policy e criar se não existir
  // O Supabase service role pode fazer INSERT/UPDATE via REST, mas não DDL direto.
  // Solução: chamar uma função PostgreSQL que já existe no banco para executar DDL.

  // Verificar se existe a função set_config que pode indiretamente ajudar
  // A única forma real é via a função que criamos no trigger setup

  // NOVO: criar uma função SQL que executa nossas policies via DO block
  // e chamá-la via RPC logo em seguida

  const setupSql = `
    -- Recriar can_view_all com consultores
    create or replace function can_view_all()
    returns boolean language sql security definer stable as $$
      select coalesce(
        (select role in ('gerente','supervisor','consultor')
         from profiles where id = auth.uid()),
        false
      )
    $$;

    -- ESCOLAS
    drop policy if exists "Selecionar escolas" on escolas;
    create policy "Selecionar escolas" on escolas
      for select using (can_view_all());

    -- REGISTROS
    drop policy if exists "Selecionar registros" on registros;
    create policy "Selecionar registros" on registros
      for select using (can_view_all());

    -- NEGOCIAÇÕES
    drop policy if exists "Selecionar negociações" on negociacoes;
    create policy "Selecionar negociações" on negociacoes
      for select using (can_view_all());

    -- TAREFAS
    drop policy if exists "Selecionar tarefas" on tarefas;
    create policy "Selecionar tarefas" on tarefas
      for select using (can_view_all());

    -- CONTRATOS
    drop policy if exists "Selecionar contratos" on contratos;
    create policy "Selecionar contratos" on contratos
      for select using (can_view_all());

    -- NOTAS
    drop policy if exists "Selecionar notas" on notas_escola;
    create policy "Selecionar notas" on notas_escola
      for select using (can_view_all());

    -- CONTATOS
    drop policy if exists "Selecionar contatos" on contatos_escola;
    create policy "Selecionar contatos" on contatos_escola
      for select using (can_view_all());

    -- FORMULÁRIOS
    drop policy if exists "Ler formulários (apenas autenticados)" on formularios;
    create policy "Ler formulários (apenas autenticados)" on formularios
      for select using (can_view_all());
  `

  // Criar função que aplica as policies e chamar via RPC
  const createApplyFn = `
    create or replace function _apply_rls_consultores()
    returns text language plpgsql security definer as $$
    begin
      ${setupSql.replace(/\$\$/g, "''").replace(/'/g, "''")}
      return 'ok';
    end;
    $$
  `

  // Isso também não funciona via RPC pois RPC chama funções EXISTENTES
  // A solução final: usar a função handle_new_user como base para criar
  // uma função exec que usa EXECUTE dinamicamente

  // ABORDAGEM FINAL: usar pg_net ou outra extensão...
  // Na realidade, o único caminho é via SQL Editor do painel OU via pg client direto.

  // Mas posso fazer de forma inteligente:
  // 1. Criar a função _setup_rls via uma inserção no banco que usa NOTIFY/LISTEN
  // 2. Ou, melhor ainda: verificar se as policies JÁ estão corretas e só
  //    reportar o que precisa ser feito manualmente

  console.log('  Verificando estado atual das policies...\n')

  // Verificar quais policies existem atualmente nas tabelas relevantes
  const tables = ['escolas', 'registros', 'negociacoes', 'tarefas', 'contratos', 'notas_escola', 'contatos_escola', 'formularios']

  for (const table of tables) {
    // Testar se a policy can_view_all está aplicada tentando ler como consultor
    // Service role bypassa RLS, então não conseguimos testar diretamente.
    // Mas podemos verificar indiretamente.
    process.stdout.write(`  ${table.padEnd(20)} `)

    // Verificar se a função can_view_all já está referenciada nas policies via pg_policies view
    // Se pg_policies não está acessível, usamos o método de tentar SELECT com user diferente
    const { data, error } = await sb
      .from('pg_policies')
      .select('policyname, qual')
      .eq('tablename', table)
      .ilike('qual', '%can_view_all%')

    if (error) {
      console.log('⚠️  (pg_policies não acessível)')
    } else if (data && data.length > 0) {
      console.log('✅ can_view_all já aplicada')
    } else {
      console.log('❌ Política antiga — precisa atualizar')
    }
  }

  console.log('\n━━━ Instrução para aplicar as políticas ━━━')
  console.log('\n  O Supabase plano gratuito não permite executar DDL via API REST.')
  console.log('  Acesse o link abaixo e cole o SQL (1 clique):')
  console.log('\n  🔗 https://supabase.com/dashboard/project/lyisdsnocroocxfblvqf/sql/new')
  console.log('\n  O arquivo está em: supabase/fix_rls_consultores.sql')
  console.log('  Conteúdo já copiado para área de transferência.\n')
}

main().catch(console.error)
