import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'

// Campos default para o cadastro de Escolas no CRM
// Alinhado com os campos do formulário /comercial/escolas/nova
const CAMPOS_DEFAULT_ESCOLA = new Set([
  // ── CIECC (inscritos) ──
  'Inscrito', 'Nome', '👤 Nome',
  'Email', '📧 Email',
  'Tel. Celular', '📱 Tel', 'Tel. Fixo',
  'Cidade', 'UF', 'Endereço', 'Bairro', 'CEP',
  'Qual é o nome da sua instituição de ensino?',
  'Escola Declarada', 'Instituição',
  'CNPJ (Fórum)', 'CNPJ',
  'Qual é o tipo de sua inscrição?', 'Tipo', 'Cargo Original',
  'Qtd Alunos', 'Alunos',
  'Alunos Infantil', 'Alunos Fund. I', 'Alunos Fund. II', 'Alunos Ens. Médio',
  'Data Inscrição', '📅 Data', 'Lote', 'Participou I Congresso?',

  // ── CRM Education (Education_CRM_FINAL.xlsx) ──
  // Identificação da escola
  '🏫 Escola', 'Escola',
  // Localização
  // (Cidade e UF já mapeados acima)
  // Contatos (até 8 por escola — os mais importantes)
  '👤 Contato 1', 'Contato 1',
  '👤 Contato 2', 'Contato 2',
  'Cargo 1', 'Cargo 2',
  'Tel 1', 'Tel 2',
  'Email 1', 'Email 2',
  // Alunos
  // (Alunos já mapeado acima)
  // Status comercial
  '🔥 Status Lead', 'Status Lead',
  'Status 1º CIECC', 'Status 2026',
  'Origem', 'Fontes',
  // Representante Legal
  'Rep. Legal', 'Email Rep.', 'Tel Rep.',
  // Observações
  '📝 Observações', 'Observações',
])

// Mapeamento de nomes de colunas das planilhas → campos fixos do banco
const CAMPO_FIXO: Record<string, string> = {
  // Identificação
  'Inscrito': 'nome', 'Nome': 'nome', '👤 Nome': 'nome',
  'CPF': 'cpf',
  'RG': 'rg',
  'Sexo': 'sexo',
  'Data Nascimento': 'data_nascimento',

  // Contato
  'Email': 'email', '📧 Email': 'email', 'Email Original': 'email',
  'Tel. Celular': 'tel_celular', '📱 Tel': 'tel_celular', 'Tel Original': 'tel_celular',
  'Tel. Fixo': 'tel_fixo',
  'Tel. Comercial': 'tel_comercial',

  // Localização
  'Cidade': 'cidade',
  'UF': 'uf',
  'Endereço': 'endereco', 'Endereco': 'endereco',
  'Bairro': 'bairro',
  'CEP': 'cep',

  // Escola
  'Qual é o nome da sua instituição de ensino?': 'escola_nome',
  'Escola Declarada': 'escola_nome',
  'Instituição': 'escola_nome',
  '🏫 Escola': 'escola_nome', 'Escola': 'escola_nome',
  'CNPJ (Fórum)': 'escola_cnpj', 'CNPJ': 'escola_cnpj',

  // CRM — contato principal (usa Contato 1 como nome, Email 1 como email, Tel 1 como tel)
  '👤 Contato 1': 'nome', 'Contato 1': 'nome',
  'Email 1': 'email',
  'Tel 1': 'tel_celular',
  'Cargo 1': 'tipo_inscricao',
  // CRM — status e origem
  '🔥 Status Lead': 'cargo',  // reutiliza campo cargo para status do lead
  'Origem': 'lote',           // reutiliza lote como campo de origem/fonte da captação
  'Rep. Legal': 'nome',       // fallback se não tiver Contato 1
  'Email Rep.': 'email',
  'Tel Rep.': 'tel_celular',

  // Perfil
  'Qual é o tipo de sua inscrição?': 'tipo_inscricao',
  'Tipo': 'tipo_inscricao',
  'Cargo Original': 'cargo',

  // Evento
  'Lote': 'lote',
  'Data Inscrição': 'data_inscricao', '📅 Data': 'data_inscricao',
  'Forma de Pagamento': 'forma_pagamento',
  'Status Financeiro': 'status_financeiro',
  'Valor Total Inscrição': 'valor_total', 'Valor Total': 'valor_total', 'Valor': 'valor_total',

  // Alunos
  'Qtd Alunos': 'qtd_alunos_total', 'Alunos': 'qtd_alunos_total',
  'Alunos Infantil': 'qtd_infantil',
  'Alunos Fund. I': 'qtd_fund1',
  'Alunos Fund. II': 'qtd_fund2',
  'Alunos Ens. Médio': 'qtd_medio',
}

function limparValor(v: any): string | number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') {
    if (isNaN(v)) return null
    return v
  }
  const s = String(v).trim()
  if (!s || s === 'nan' || s === 'undefined' || s === 'NaN') return null
  return s
}

function limparTel(v: any): string | null {
  if (!v) return null
  const s = String(v).split('.')[0].replace(/\D/g, '')
  return s.length >= 8 ? s : null
}

function detectarModalidade(lote: string): string {
  return lote?.toUpperCase().includes('ONLINE') ? 'online' : 'presencial'
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const formData      = await request.formData()
  const file          = formData.get('file') as File
  const acao          = formData.get('acao') as string
  const fonte         = formData.get('fonte') as string
  const abaIdx        = parseInt(formData.get('aba') as string ?? '0')
  const colsSel       = JSON.parse(formData.get('colunas_sel') as string ?? '[]') as string[]
  // filtrosTipo: array JSON de tipos exatos para filtrar (ex: ["Gestor de escola", "Mantenedor de escola"])
  // vazio [] = sem filtro = importa todos
  const filtrosTipoRaw = formData.get('filtros_tipo') as string ?? '[]'
  const filtrosTipo: string[] = JSON.parse(filtrosTipoRaw)

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  // Ler planilha completa
  const buffer    = await file.arrayBuffer()
  const wb        = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = wb.SheetNames[abaIdx] ?? wb.SheetNames[0]
  const sheet     = wb.Sheets[sheetName]

  // Tentar detectar a linha real de cabeçalho
  // O Education_CRM_FINAL tem 2-3 linhas de título antes dos headers reais
  // Estratégia: ler como array e encontrar a linha com mais campos não-vazios
  const rawArray = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: null })

  // Encontrar a linha de cabeçalho real (tem mais colunas preenchidas consecutivas)
  let headerRowIdx = 0
  let maxFilledCols = 0
  for (let i = 0; i < Math.min(5, rawArray.length); i++) {
    const row = rawArray[i] ?? []
    const filled = row.filter((v: any) => v !== null && String(v).trim() !== '').length
    // Linha de header tem muitas colunas E valores curtos (não são frases longas)
    const isHeaderLike = filled > 3 && row.every((v: any) =>
      v === null || String(v).trim().length < 80
    )
    if (isHeaderLike && filled > maxFilledCols) {
      maxFilledCols = filled
      headerRowIdx = i
    }
  }

  // Ler com o header correto
  const todasRowsFull = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: null,
    raw: false,
    header: headerRowIdx === 0 ? undefined : undefined,
    range: headerRowIdx, // pula as linhas de título
  })

  // Coluna de tipo de inscrição (varia entre planilhas)
  const COL_TIPO = [
    'Qual é o tipo de sua inscrição?',
    'Tipo',
    'Cargo Original',
  ]

  // Detectar qual coluna de tipo existe nesta planilha
  const colTipoAtiva = todasRowsFull.length > 0
    ? COL_TIPO.find(c => todasRowsFull[0][c] !== undefined) ?? null
    : null

  // Contar todos os tipos únicos da planilha (para montar o seletor no frontend)
  const contagemTiposReais: Record<string, number> = {}
  todasRowsFull.forEach(row => {
    for (const col of COL_TIPO) {
      const v = String(row[col] ?? '').trim()
      if (v && v !== 'null') {
        contagemTiposReais[v] = (contagemTiposReais[v] ?? 0) + 1
        break
      }
    }
  })

  // Aplicar filtro de tipos selecionados (apenas se houver seleção)
  // Suporta dois formatos:
  //   1. Tipo exato: "Gestor de escola" → match exato (case-insensitive)
  //   2. Keyword: "__kw:gestor" → match parcial (contém "gestor")
  let rawRows = todasRowsFull
  if (filtrosTipo.length > 0) {
    rawRows = todasRowsFull.filter(row => {
      for (const col of COL_TIPO) {
        const v = String(row[col] ?? '').trim().toLowerCase()
        if (!v) continue
        for (const filtro of filtrosTipo) {
          if (filtro.startsWith('__kw:')) {
            // Match parcial por keyword
            const kw = filtro.replace('__kw:', '').toLowerCase()
            if (v.includes(kw)) return true
          } else {
            // Match exato (case-insensitive)
            if (v === filtro.toLowerCase()) return true
          }
        }
      }
      return false
    })
  }

  // Filtrar colunas reais
  const todasColunas = rawRows.length > 0
    ? Object.keys(rawRows[0]).filter(c => c && !c.startsWith('__EMPTY'))
    : []

  if (acao === 'preview') {
    // Identificar quais colunas têm mapeamento fixo e quais irão para dados_extras
    const mapeadas: Record<string, { campo: string; tipo: 'fixo' | 'extra' }> = {}
    todasColunas.forEach(col => {
      const campoFixo = CAMPO_FIXO[col]
      mapeadas[col] = campoFixo
        ? { campo: campoFixo, tipo: 'fixo' }
        : { campo: col, tipo: 'extra' }
    })

    // Colunas pré-selecionadas: apenas as relevantes para o cadastro de escola (default)
    const presel = todasColunas.filter(c => CAMPOS_DEFAULT_ESCOLA.has(c))

    const preview = rawRows.slice(0, 5).map(row =>
      Object.fromEntries(todasColunas.map(c => [c, row[c]]))
    )

    // Ordenar tipos por contagem (maior primeiro)
    const tiposOrdenados = Object.entries(contagemTiposReais)
      .sort((a, b) => b[1] - a[1])
      .map(([tipo, n]) => ({ tipo, n }))

    return NextResponse.json({
      abas: wb.SheetNames,
      colunas: todasColunas,
      mapeadas,
      presel,
      preview,
      total: rawRows.length,
      totalSemFiltro: todasRowsFull.length,
      filtrosAplicados: filtrosTipo,
      tiposDisponiveis: tiposOrdenados,  // todos os tipos reais da planilha com contagem
      colTipoAtiva,
    })
  }

  if (acao === 'importar') {
    if (colsSel.length === 0) return NextResponse.json({ error: 'Selecione ao menos uma coluna' }, { status: 400 })

    let inseridos = 0, atualizados = 0, erros = 0, ignorados = 0
    const BATCH = 150

    for (let i = 0; i < rawRows.length; i += BATCH) {
      const batch = rawRows.slice(i, i + BATCH)

      const registros = batch.map(row => {
        const fixo: Record<string, any> = { fonte, importado_por: user.id }
        const extra: Record<string, any> = {}

        colsSel.forEach(col => {
          const val = row[col]
          const campoFixo = CAMPO_FIXO[col]

          if (campoFixo) {
            let v = limparValor(val)
            if (campoFixo === 'tel_celular' || campoFixo === 'tel_fixo' || campoFixo === 'tel_comercial') {
              v = limparTel(val)
            } else if (campoFixo === 'uf') {
              v = typeof v === 'string' ? v.toUpperCase().slice(0, 2) : null
            } else if (campoFixo === 'email') {
              v = typeof v === 'string' ? v.toLowerCase().trim() : null
            } else if (campoFixo === 'valor_total') {
              const n = parseFloat(String(val).replace(',', '.').replace('R$', ''))
              v = isNaN(n) ? null : Math.round(n * 100) / 100
            } else if (['qtd_alunos_total','qtd_infantil','qtd_fund1','qtd_fund2','qtd_medio'].includes(campoFixo)) {
              const n = parseInt(String(val).split('.')[0])
              v = isNaN(n) ? null : n
            }
            if (v !== null && v !== undefined) fixo[campoFixo] = v
          } else {
            const v = limparValor(val)
            if (v !== null) extra[col] = v
          }
        })

        if (fixo.lote) fixo.modalidade = detectarModalidade(fixo.lote)
        if (Object.keys(extra).length > 0) fixo.dados_extras = extra

        return fixo
      }).filter(r => Object.keys(r).length > 2)

      if (registros.length === 0) continue

      // Separar por estratégia de upsert:
      // COM email → upsert por (email, fonte) — sobrescreve se exato
      // SEM email mas com nome+escola → upsert por (nome, escola_nome, fonte)
      // Sem nenhum identificador → ignora (não cria duplicata cega)
      const comEmail    = registros.filter(r => r.email)
      const semEmailCom = registros.filter(r => !r.email && r.nome && r.escola_nome)
      const semIdent    = registros.filter(r => !r.email && !(r.nome && r.escola_nome))

      ignorados += semIdent.length

      try {
        // Upsert por email+fonte
        if (comEmail.length > 0) {
          const { error, data } = await supabase
            .from('leads_universal')
            .upsert(comEmail, {
              onConflict: 'email,fonte',
              ignoreDuplicates: false,  // false = sobrescreve (update)
            })
            .select('id')
          if (error) { erros += comEmail.length }
          else {
            // Contar inseridos vs atualizados seria complexo sem trigger
            // Simplificamos: todos que passaram = processados com sucesso
            inseridos += comEmail.length
          }
        }

        // Upsert por nome+escola+fonte (sem email)
        if (semEmailCom.length > 0) {
          const { error } = await supabase
            .from('leads_universal')
            .upsert(semEmailCom, {
              onConflict: 'nome,escola_nome,fonte',
              ignoreDuplicates: false,
            })
          if (error) { erros += semEmailCom.length }
          else { inseridos += semEmailCom.length }
        }

      } catch (e: any) {
        // Fallback: se a constraint não existe ainda, usa insert simples
        try {
          await supabase.from('leads_universal').insert([...comEmail, ...semEmailCom])
          inseridos += comEmail.length + semEmailCom.length
        } catch {
          erros += comEmail.length + semEmailCom.length
        }
      }
    }

    return NextResponse.json({ inseridos, erros, ignorados, total: rawRows.length })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
