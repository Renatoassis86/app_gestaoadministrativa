import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lyisdsnocroocxfblvqf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('Criando usuário...')

  // 1. Criar usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'renato.consultoria@cidadeviva.org',
    password: 'Rairooha123@',
    email_confirm: true,
    user_metadata: { full_name: 'Renato Assis' }
  })

  if (authError) {
    // Pode já existir — tenta apenas atualizar o perfil
    if (authError.message.includes('already')) {
      console.log('Usuário já existe no Auth. Atualizando perfil...')
    } else {
      console.error('Erro Auth:', authError.message)
      process.exit(1)
    }
  } else {
    console.log('✅ Usuário Auth criado:', authData.user.id)
  }

  // 2. Atualizar perfil com role gerente
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'gerente', full_name: 'Renato Assis', is_active: true })
    .eq('email', 'renato.consultoria@cidadeviva.org')

  if (profileError) {
    console.error('Erro Profile:', profileError.message)
  } else {
    console.log('✅ Perfil atualizado: role = gerente')
  }

  // 3. Confirmar
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active')
    .eq('email', 'renato.consultoria@cidadeviva.org')
    .single()

  console.log('\n📋 Perfil final:')
  console.log(profile)
  console.log('\n🚀 Pronto! Faça login em http://localhost:3000/login')
}

main()
