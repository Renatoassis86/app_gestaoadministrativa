import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lyisdsnocroocxfblvqf.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

async function test() {
  const supabase = createClient(url, serviceKey)

  console.log('=== TESTE DE PERSISTÊNCIA DE REGISTROS ===\n')

  // 1. Verificar tabelas
  console.log('1. Listando registros existentes...')
  const { data: registros, error: fetchError } = await supabase
    .from('registros')
    .select('id, escola_id, resumo, data_contato, created_at, classificacao, probabilidade')
    .order('created_at', { ascending: false })
    .limit(10)

  if (fetchError) {
    console.error('❌ Erro ao buscar registros:', fetchError.message)
  } else {
    console.log(`✅ ${registros?.length || 0} registros encontrados:\n`)
    registros?.forEach((r: any) => {
      console.log(`   ID: ${r.id}`)
      console.log(`   Data: ${r.data_contato}`)
      console.log(`   Resumo: ${r.resumo?.substring(0, 60)}...`)
      console.log(`   Classificação: ${r.classificacao} (${r.probabilidade}%)`)
      console.log(`   Criado em: ${r.created_at}\n`)
    })
  }

  // 2. Verificar escolas
  console.log('\n2. Verificando escolas no banco...')
  const { data: escolas, error: escolasError } = await supabase
    .from('escolas')
    .select('id, nome')
    .limit(5)

  if (escolasError) {
    console.error('❌ Erro ao buscar escolas:', escolasError.message)
  } else {
    console.log(`✅ ${escolas?.length || 0} escolas encontradas`)
    escolas?.forEach((e: any) => {
      console.log(`   - ${e.nome} (${e.id})`)
    })
  }

  // 3. Verificar se há registros órfãos (sem escola)
  if (registros && registros.length > 0) {
    console.log('\n3. Verificando integridade de chaves estrangeiras...')
    const registrosOmSchoolId = registros.filter((r: any) => !r.escola_id)
    if (registrosOmSchoolId.length > 0) {
      console.error(`❌ ${registrosOmSchoolId.length} registros sem escola_id!`)
    } else {
      console.log('✅ Todos os registros têm escola_id válida')
    }
  }

  console.log('\n=== FIM DO TESTE ===')
}

test().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
