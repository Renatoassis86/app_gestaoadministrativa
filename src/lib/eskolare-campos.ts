// Definição ÚNICA dos campos do Cadastro Eskolare. Um campo novo (ex.: ciclo 2028) é só uma linha aqui.
// Fonte: planilha Cadastro_Escolas_Eskolare_2027_Cidade_Viva_Education.xlsx (aba Cadastro).
// Arquivo sem imports para poder ser testado direto com `node --test`.

export type TipoCampo =
  | 'texto' | 'email' | 'whatsapp' | 'cnpj' | 'cpf' | 'cep'
  | 'inteiro' | 'dinheiro' | 'opcoes' | 'textolongo' | 'logo' | 'calculado'

export interface Campo {
  chave: string
  rotulo: string
  bloco: number
  tipo: TipoCampo
  obrigatorio?: boolean
  opcoes?: string[]
  interno?: boolean                       // nunca aparece para a escola
  ajuda?: string
  apenasQuando?: { chave: string; valor: string }
  colunaTitulo?: string                   // título na planilha quando difere do rótulo
}

export interface Bloco { id: number; titulo: string; descricao?: string }

const SIM_NAO = ['Sim', 'Não']

export const BLOCOS: Bloco[] = [
  { id: 1,  titulo: 'Identificação da escola' },
  { id: 2,  titulo: 'Responsável pela parceria' },
  { id: 3,  titulo: 'Administrador da loja na Eskolare', descricao: 'Quem acessa o painel da escola: pedidos, alunos e saldo da comissão.' },
  { id: 4,  titulo: 'Contato para o treinamento' },
  { id: 5,  titulo: 'Financeiro da escola' },
  { id: 6,  titulo: 'Coordenação pedagógica' },
  { id: 7,  titulo: 'Alunos previstos por série', descricao: 'Kits Infantil II a V têm 5 livros (4 + Inglês). O kit do 1º ano tem 9 livros e o do 2º ao 5º ano tem 12 livros.' },
  { id: 8,  titulo: 'Preço final ou comissão', descricao: 'A comissão é única para a escola toda: a Eskolare não permite comissão diferente por série. Preço de tabela: Infantil R$ 1.150 e Fundamental R$ 1.450.' },
  { id: 9,  titulo: 'Entrega dos kits' },
  { id: 10, titulo: 'Contrato 2027' },
]

export const PRECO_MODOS = ['Preço final às famílias', 'Comissão desejada'] as const

export const CAMPOS: Campo[] = [
  // 1. Identificação
  { chave: 'cnpj', rotulo: 'CNPJ', bloco: 1, tipo: 'cnpj', obrigatorio: true },
  { chave: 'razao_social', rotulo: 'Razão social', bloco: 1, tipo: 'texto', obrigatorio: true },
  { chave: 'nome_loja', rotulo: 'Nome que aparece na loja', bloco: 1, tipo: 'texto', obrigatorio: true },
  { chave: 'cep', rotulo: 'CEP', bloco: 1, tipo: 'cep', obrigatorio: true },
  { chave: 'rua_numero', rotulo: 'Rua e número', bloco: 1, tipo: 'texto', obrigatorio: true },
  { chave: 'bairro', rotulo: 'Bairro', bloco: 1, tipo: 'texto', obrigatorio: true },
  { chave: 'cidade_uf', rotulo: 'Cidade / UF', bloco: 1, tipo: 'texto', obrigatorio: true, ajuda: 'Ex.: João Pessoa / PB' },
  { chave: 'complemento', rotulo: 'Complemento', bloco: 1, tipo: 'texto' },
  { chave: 'logo', rotulo: 'Logo da escola (PNG)', bloco: 1, tipo: 'logo', obrigatorio: true, ajuda: 'Arquivo PNG de até 5 MB.', colunaTitulo: 'Logo enviada (PNG)?' },
  // 2. Responsável pela parceria
  { chave: 'parc_nome', rotulo: 'Nome', bloco: 2, tipo: 'texto', obrigatorio: true },
  { chave: 'parc_cargo', rotulo: 'Cargo', bloco: 2, tipo: 'texto' },
  { chave: 'parc_email', rotulo: 'E-mail', bloco: 2, tipo: 'email', obrigatorio: true },
  { chave: 'parc_whatsapp', rotulo: 'WhatsApp', bloco: 2, tipo: 'whatsapp', obrigatorio: true },
  // 3. Administrador da loja
  { chave: 'adm_nome', rotulo: 'Nome', bloco: 3, tipo: 'texto', obrigatorio: true },
  { chave: 'adm_email', rotulo: 'E-mail de acesso', bloco: 3, tipo: 'email', obrigatorio: true, ajuda: 'Se a escola já usa a Eskolare, informe o e-mail que já existe.' },
  { chave: 'adm_cpf', rotulo: 'CPF', bloco: 3, tipo: 'cpf', obrigatorio: true },
  { chave: 'adm_ja_usa', rotulo: 'Já usa a Eskolare?', bloco: 3, tipo: 'opcoes', opcoes: SIM_NAO },
  // 4. Treinamento
  { chave: 'trein_nome', rotulo: 'Nome', bloco: 4, tipo: 'texto', obrigatorio: true },
  { chave: 'trein_cargo', rotulo: 'Cargo', bloco: 4, tipo: 'texto' },
  { chave: 'trein_email', rotulo: 'E-mail', bloco: 4, tipo: 'email', obrigatorio: true },
  { chave: 'trein_whatsapp', rotulo: 'WhatsApp', bloco: 4, tipo: 'whatsapp', obrigatorio: true },
  { chave: 'trein_periodo', rotulo: 'Melhor período', bloco: 4, tipo: 'opcoes', opcoes: ['Manhã', 'Tarde', 'Noite', 'Qualquer horário'] },
  { chave: 'trein_participantes', rotulo: 'Nº de participantes', bloco: 4, tipo: 'inteiro' },
  // 5. Financeiro
  { chave: 'fin_nome', rotulo: 'Nome', bloco: 5, tipo: 'texto' },
  { chave: 'fin_email', rotulo: 'E-mail', bloco: 5, tipo: 'email' },
  { chave: 'fin_whatsapp', rotulo: 'WhatsApp', bloco: 5, tipo: 'whatsapp' },
  { chave: 'fin_conta_resgate', rotulo: 'Tem conta para resgate na Eskolare?', bloco: 5, tipo: 'opcoes', opcoes: ['Sim', 'Não', 'Não sabe'] },
  // 6. Coordenação pedagógica
  { chave: 'coord_nome', rotulo: 'Nome', bloco: 6, tipo: 'texto' },
  { chave: 'coord_email', rotulo: 'E-mail', bloco: 6, tipo: 'email' },
  { chave: 'coord_whatsapp', rotulo: 'WhatsApp', bloco: 6, tipo: 'whatsapp' },
  // 7. Alunos por série
  { chave: 'al_inf2', rotulo: 'Infantil 2 anos', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_inf3', rotulo: 'Infantil 3 anos', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_inf4', rotulo: 'Infantil 4 anos', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_inf5', rotulo: 'Infantil 5 anos', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano1', rotulo: '1º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano2', rotulo: '2º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano3', rotulo: '3º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano4', rotulo: '4º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano5', rotulo: '5º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_total', rotulo: 'Total de alunos', bloco: 7, tipo: 'calculado' },
  { chave: 'inf_com_ingles', rotulo: 'Infantil com Inglês?', bloco: 7, tipo: 'opcoes', opcoes: SIM_NAO },
  { chave: 'venda_2sem', rotulo: 'Venda de 2º semestre?', bloco: 7, tipo: 'opcoes', opcoes: SIM_NAO },
  { chave: 'venda_avulso', rotulo: 'Venda de livro avulso?', bloco: 7, tipo: 'opcoes', opcoes: SIM_NAO },
  // 8. Preço final ou comissão
  { chave: 'preco_modo', rotulo: 'A escola informou', bloco: 8, tipo: 'opcoes', opcoes: [...PRECO_MODOS] },
  { chave: 'preco_infantil', rotulo: 'Preço final às famílias – kit Infantil (R$)', bloco: 8, tipo: 'dinheiro', apenasQuando: { chave: 'preco_modo', valor: PRECO_MODOS[0] } },
  { chave: 'preco_fundamental', rotulo: 'Preço final às famílias – kit Fundamental (R$)', bloco: 8, tipo: 'dinheiro', apenasQuando: { chave: 'preco_modo', valor: PRECO_MODOS[0] } },
  { chave: 'comissao_kit', rotulo: 'Comissão desejada por kit (R$)', bloco: 8, tipo: 'dinheiro', apenasQuando: { chave: 'preco_modo', valor: PRECO_MODOS[1] } },
  // 9. Entrega
  { chave: 'ent_nome', rotulo: 'Quem recebe (nome)', bloco: 9, tipo: 'texto' },
  { chave: 'ent_whatsapp', rotulo: 'WhatsApp de quem recebe', bloco: 9, tipo: 'whatsapp' },
  { chave: 'ent_endereco', rotulo: 'Endereço de entrega (se diferente)', bloco: 9, tipo: 'texto' },
  // 10. Contrato 2027
  { chave: 'ctr_assinado', rotulo: 'Contrato assinado?', bloco: 10, tipo: 'opcoes', obrigatorio: true, opcoes: ['Sim', 'Em assinatura', 'Não'] },
  { chave: 'ctr_kits', rotulo: 'Kits contratados', bloco: 10, tipo: 'inteiro', obrigatorio: true },
  { chave: 'ctr_valor', rotulo: 'Valor total contratado (R$)', bloco: 10, tipo: 'dinheiro', obrigatorio: true },
  { chave: 'ctr_vigencia', rotulo: 'Vigência', bloco: 10, tipo: 'texto' },
]

export const CHAVES_PRECO = ['preco_infantil', 'preco_fundamental', 'comissao_kit']
export const CHAVES_ALUNOS = ['al_inf2', 'al_inf3', 'al_inf4', 'al_inf5', 'al_ano1', 'al_ano2', 'al_ano3', 'al_ano4', 'al_ano5']

export const STATUS_FICHA = [
  { id: 'rascunho', label: 'Não enviada à escola', cor: '#475569', bg: '#f1f5f9' },
  { id: 'enviada', label: 'Link enviado, aguardando a escola', cor: '#0369a1', bg: '#e0f2fe' },
  { id: 'em_preenchimento', label: 'Escola preenchendo (não enviou)', cor: '#b45309', bg: '#fef3c7' },
  { id: 'respondida', label: '✔ Escola enviou as respostas', cor: '#047857', bg: '#d1fae5' },
  { id: 'validada', label: '✔ Validada pelo comercial', cor: '#065f46', bg: '#a7f3d0' },
  { id: 'cadastrada', label: '✔ Cadastrada na Eskolare', cor: '#14532d', bg: '#86efac' },
] as const
export type StatusFicha = typeof STATUS_FICHA[number]['id']

export const campoPorChave = (chave: string) => CAMPOS.find(c => c.chave === chave)
export const camposPublicos = () => CAMPOS.filter(c => !c.interno)
export const camposDoBloco = (b: number) => CAMPOS.filter(c => c.bloco === b && !c.interno)

export const vazio = (v: unknown) => v == null || String(v).trim() === ''

// Campo visível dado o preenchimento atual (bloco 8 só mostra os campos da opção escolhida).
export function campoVisivel(c: Campo, dados: Record<string, any>) {
  if (!c.apenasQuando) return true
  return dados[c.apenasQuando.chave] === c.apenasQuando.valor
}

export function totalAlunos(dados: Record<string, any>) {
  return CHAVES_ALUNOS.reduce((a, k) => a + (parseInt(dados[k], 10) || 0), 0)
}

// % preenchido = obrigatórios preenchidos ÷ obrigatórios, com o bloco de preço contando como UM obrigatório
// (completo quando qualquer um dos três valores existir). Mesma conta da planilha: 20 + 1 = 21.
export function calcularPreenchimento(dados: Record<string, any>) {
  const obrigatorios = CAMPOS.filter(c => c.obrigatorio && !c.interno)
  let preenchidos = obrigatorios.filter(c => !vazio(dados[c.chave])).length
  const precoOk = CHAVES_PRECO.some(k => !vazio(dados[k]) && Number(String(dados[k]).replace(',', '.')) > 0)
  const total = obrigatorios.length + 1
  if (precoOk) preenchidos += 1
  const faltando = [
    ...obrigatorios.filter(c => vazio(dados[c.chave])).map(c => c.rotulo + ' (bloco ' + c.bloco + ')'),
    ...(precoOk ? [] : ['Preço final ou comissão (bloco 8)']),
  ]
  return { preenchidos, total, pct: Math.round((preenchidos / total) * 100), faltando }
}

// Situação da escola em linguagem simples (o status "enviada" muda de texto se a escola já abriu o link).
export function etapaEscola(status: string, acessou: boolean): { label: string; cor: string; bg: string } {
  const st = STATUS_FICHA.find(x => x.id === status) ?? STATUS_FICHA[0]
  if (status === 'enviada' && acessou) return { label: 'Escola abriu o link, ainda não preencheu', cor: '#0369a1', bg: '#e0f2fe' }
  return { label: st.label, cor: st.cor, bg: st.bg }
}
