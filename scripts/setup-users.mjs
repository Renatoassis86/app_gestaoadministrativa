import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lyisdsnocroocxfblvqf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── Definição dos usuários ────────────────────────────────────────────────────
const USUARIOS = [
  {
    full_name: 'Renato Silva de Assis',
    email:     'renato.consultoria@cidadeviva.org',
    password:  'admin123',
    role:      'gerente',          // Administrador master
  },
  {
    full_name: 'Raissa Fernandes',
    email:     'raissa.fernandes@cidadeviva.org',
    password:  'admin123',
    role:      'consultor',
  },
  {
    full_name: 'Jessé de Souza',
    email:     'jesse.souza@cidadeviva.org',   // email único para Jesse
    password:  'admin123',
    role:      'consultor',
  },
  {
    full_name: 'Alan Plínio',
    email:     'comercialnorte.education@cidadeviva.org',
    password:  'admin123',
    role:      'consultor',
  },
  {
    full_name: 'Isabela Rolim',
    email:     'isabela.rolim@cidadeviva.org', // email único para Isabela
    password:  'admin123',
    role:      'consultor',
  },
  {
    full_name: 'Thiago Dutra',
    email:     'thiagodutra@cidadeviva.org',
    password:  'admin123',
    role:      'consultor',
  },
]

async function main() {
  console.log('\n━━━ Setup de Usuários — CVE Gestão Comercial ━━━\n')

  for (const u of USUARIOS) {
    process.stdout.write(`→ ${u.full_name} (${u.email})... `)

    // 1. Tentar criar no Auth
    const { data: authData, error: authErr } = await sb.auth.admin.createUser({
      email:          u.email,
      password:       u.password,
      email_confirm:  true,
      user_metadata:  { full_name: u.full_name },
    })

    let userId = authData?.user?.id

    if (authErr) {
      if (authErr.message.toLowerCase().includes('already')) {
        // Usuário já existe — buscar o ID
        const { data: list } = await sb.auth.admin.listUsers()
        const existing = list?.users?.find(x => x.email === u.email)
        userId = existing?.id
        process.stdout.write('(já existe) ')
      } else {
        console.error(`ERRO Auth: ${authErr.message}`)
        continue
      }
    }

    if (!userId) {
      console.error('ERRO: userId não encontrado')
      continue
    }

    // 2. Atualizar/inserir perfil com role correta
    const { error: profileErr } = await sb
      .from('profiles')
      .upsert({
        id:        userId,
        email:     u.email,
        full_name: u.full_name,
        role:      u.role,
        is_active: true,
      }, { onConflict: 'id' })

    if (profileErr) {
      console.error(`ERRO Profile: ${profileErr.message}`)
      continue
    }

    console.log(`✅ ${u.role.toUpperCase()}`)
  }

  // ── Listar todos os usuários ao final ─────────────────────────────────────
  console.log('\n━━━ Usuários cadastrados ━━━')
  const { data: profiles } = await sb
    .from('profiles')
    .select('full_name, email, role, is_active')
    .order('full_name')

  profiles?.forEach(p => {
    const status = p.is_active ? '✓' : '✗'
    const role   = p.role.padEnd(12)
    console.log(`  ${status} [${role}] ${p.full_name} — ${p.email}`)
  })

  console.log('\n━━━ Permissões por role ━━━')
  console.log('  gerente   → Acesso total: dashboard, usuários, todos os módulos')
  console.log('  consultor → Escolas, Registros, Negociação, Calculadora, Downloads')
  console.log('\n✅ Setup concluído!\n')
}

main().catch(console.error)
