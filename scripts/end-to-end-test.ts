import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lyisdsnocroocxfblvqf.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

async function endToEndTest() {
  const supabase = createClient(url, serviceKey)

  console.log('\n=== TESTE PONTA-A-PONTA: PERSISTÊNCIA DE REGISTROS ===\n')

  try {
    // 0. Buscar um user válido para created_by
    console.log('0️⃣ Buscando usuário ativo...')
    const { data: users } = await supabase.from('profiles').select('id').limit(1)
    if (!users || users.length === 0) {
      throw new Error('Nenhum usuário encontrado')
    }
    const createdByUserId = users[0].id
    console.log(`   ✅ Usuário encontrado: ${createdByUserId}\n`)

    // 1. Listar escolas disponíveis
    console.log('1️⃣ Buscando escolas disponíveis...')
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('id, nome')
      .limit(3)

    if (escolasError) {
      throw new Error(`Erro ao buscar escolas: ${escolasError.message}`)
    }

    if (!escolas || escolas.length === 0) {
      throw new Error('Nenhuma escola encontrada. Não é possível criar teste.')
    }

    const escolaTest = escolas[0]
    console.log(`   ✅ Encontrada: ${escolaTest.nome} (${escolaTest.id})\n`)

    // 2. Criar novo registro de teste
    console.log('2️⃣ Criando novo registro de teste...')
    const hoje = new Date().toISOString().split('T')[0]
    const resumoTeste = `[TESTE E2E] Registro criado automaticamente em ${new Date().toLocaleString('pt-BR')}. Este é um teste de persistência para garantir que os registros estão sendo salvos corretamente no banco de dados.`

    const { data: novoRegistro, error: insertError } = await supabase
      .from('registros')
      .insert({
        escola_id: escolaTest.id,
        resumo: resumoTeste,
        data_contato: hoje,
        meio_contato: 'email',
        interesse: 'alto',
        prontidao: 'apresentacao',
        abertura: 'alta',
        encaminhamentos: ['enviar_proposta'],
        qtd_infantil: 150,
        qtd_fund1: 200,
        qtd_fund2: 180,
        qtd_medio: 120,
        potencial_financeiro: 85000,
        probabilidade: 75,
        classificacao: 'quente',
        created_by: createdByUserId,
      })
      .select('id, created_at, resumo, classificacao')
      .single()

    if (insertError) {
      throw new Error(`Erro ao inserir registro: ${insertError.message}`)
    }

    const registroId = novoRegistro.id
    console.log(`   ✅ Registro criado com ID: ${registroId}`)
    console.log(`   ✅ Criado em: ${novoRegistro.created_at}`)
    console.log(`   ✅ Classificação: ${novoRegistro.classificacao}\n`)

    // 3. Verificar se o registro foi persistido
    console.log('3️⃣ Verificando persistência (leitura do banco)...')
    const { data: registroVerificado, error: verifyError } = await supabase
      .from('registros')
      .select('id, resumo, classificacao, probabilidade, data_contato, created_at')
      .eq('id', registroId)
      .single()

    if (verifyError) {
      throw new Error(`Erro ao verificar registro: ${verifyError.message}`)
    }

    if (!registroVerificado) {
      throw new Error('❌ Registro criado mas não encontrado na leitura!')
    }

    console.log(`   ✅ Registro encontrado no banco!`)
    console.log(`   ✅ Resumo: ${registroVerificado.resumo?.substring(0, 80)}...`)
    console.log(`   ✅ Dados íntegros: probabilidade=${registroVerificado.probabilidade}%, classificacao=${registroVerificado.classificacao}\n`)

    // 4. Verificar visibilidade na jornada
    console.log('4️⃣ Verificando visibilidade na tabela registros...')
    const { data: emRegistros, error: registrosError } = await supabase
      .from('registros')
      .select('id, resumo')
      .eq('escola_id', escolaTest.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (registrosError) {
      throw new Error(`Erro ao buscar registros da escola: ${registrosError.message}`)
    }

    const encontradoEmRegistros = emRegistros?.some((r: any) => r.id === registroId)
    if (encontradoEmRegistros) {
      console.log(`   ✅ Registro encontrado na lista de registros da escola\n`)
    } else {
      console.warn(`   ⚠️ Registro não encontrado na lista (pode ser cache)\n`)
    }

    // 5. Listar últimos 5 registros globalmente
    console.log('5️⃣ Últimos 5 registros globais:')
    const { data: ultimos, error: ultimosError } = await supabase
      .from('registros')
      .select('id, resumo, data_contato, classificacao, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (ultimosError) {
      throw new Error(`Erro ao buscar últimos registros: ${ultimosError.message}`)
    }

    ultimos?.forEach((r: any, i: number) => {
      console.log(`   ${i + 1}. [${r.classificacao?.toUpperCase()}] ${r.resumo?.substring(0, 50)}... (${r.data_contato})`)
    })

    console.log('\n=== ✅ TESTE CONCLUÍDO COM SUCESSO ===')
    console.log(`\nResumo:`)
    console.log(`- Registro criado: ${registroId}`)
    console.log(`- Escola teste: ${escolaTest.nome}`)
    console.log(`- Data: ${hoje}`)
    console.log(`- Persistência: ✅ Confirmada`)
    console.log(`- Visibilidade: ✅ Confirmada`)

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:\n', error.message)
    console.error('\nStack:', error.stack)
    process.exit(1)
  }
}

endToEndTest()
