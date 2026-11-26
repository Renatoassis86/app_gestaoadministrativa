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
  opcoes?: string[]
  interno?: boolean                       // nunca aparece para a escola
  ajuda?: string
  apenasQuando?: { chave: string; valor: string }
  participante?: number                   // participante do treinamento (1 a 6); os extras só aparecem depois de "Adicionar participante"
  colunaTitulo?: string                   // título na planilha quando difere do rótulo
}

export interface Bloco { id: number; titulo: string; descricao?: string }

const SIM_NAO = ['Sim', 'Não']

export const BLOCOS: Bloco[] = [
  { id: 1,  titulo: 'Identificação da escola', descricao: 'Confira os dados já preenchidos e corrija se algo mudou. Pedimos de novo só para conferir e evitar erro.' },
  { id: 2,  titulo: 'Responsável pela parceria', descricao: 'Quem responde pelo acordo com a Cidade Viva (direção ou mantenedora).' },
  { id: 3,  titulo: 'Administrador da loja na Eskolare', descricao: 'Quem acessa o painel da loja na Eskolare: pedidos, alunos e comissão.' },
  { id: 4,  titulo: 'Contato para o treinamento', descricao: 'Quem participa do treinamento de uso da plataforma. Adicione mais participantes se precisar.' },
  { id: 5,  titulo: 'Financeiro da escola', descricao: 'Contato do financeiro e conta para receber a comissão.' },
  { id: 6,  titulo: 'Coordenação pedagógica', descricao: 'Preenchido pelo comercial. A escola não vê esta etapa.' },
  { id: 7,  titulo: 'Alunos previstos por série', descricao: 'Confira os números do seu pedido. Deixe em branco as séries que a escola não tem.' },
  { id: 8,  titulo: 'Valor negociado dos kits', descricao: 'Valor combinado com a Cidade Viva, igual ao contrato. Se não souber, deixe em branco.' },
  { id: 9,  titulo: 'Entrega dos kits', descricao: 'Quem recebe os kits na escola.' },
  { id: 10, titulo: 'Contrato 2027', descricao: 'Preenchido pelo comercial a partir do contrato. A escola não vê este bloco.' },
]

export const MAX_PARTICIPANTES = 6

// Nenhuma pergunta é obrigatória para a escola. Campos "interno" são preenchidos só pelo comercial (a escola não vê).
export const CAMPOS: Campo[] = [
  // 1. Identificação
  { chave: 'cnpj', rotulo: 'CNPJ', bloco: 1, tipo: 'cnpj', ajuda: 'CNPJ que emite as notas e assina o contrato.' },
  { chave: 'razao_social', rotulo: 'Razão social', bloco: 1, tipo: 'texto', ajuda: 'Nome oficial, como no cartão CNPJ.' },
  { chave: 'nome_loja', rotulo: 'Nome que aparece na loja', bloco: 1, tipo: 'texto', ajuda: 'Nome que as famílias veem na loja.' },
  { chave: 'cep', rotulo: 'CEP', bloco: 1, tipo: 'cep' },
  { chave: 'rua_numero', rotulo: 'Rua e número', bloco: 1, tipo: 'texto', ajuda: 'Ex.: Rua das Flores, 100' },
  { chave: 'bairro', rotulo: 'Bairro', bloco: 1, tipo: 'texto' },
  { chave: 'cidade_uf', rotulo: 'Cidade / UF', bloco: 1, tipo: 'texto', ajuda: 'Ex.: João Pessoa / PB' },
  { chave: 'complemento', rotulo: 'Complemento', bloco: 1, tipo: 'texto', ajuda: 'Sala, bloco ou referência.' },
  { chave: 'logo', rotulo: 'Logo da escola', bloco: 1, tipo: 'logo', ajuda: 'Marca da escola (PNG, JPG ou WebP, até 5 MB). Se não tiver agora, envie depois.', colunaTitulo: 'Logo enviada (PNG)?' },
  // 2. Responsável pela parceria
  { chave: 'parc_nome', rotulo: 'Nome', bloco: 2, tipo: 'texto' },
  { chave: 'parc_cargo', rotulo: 'Cargo', bloco: 2, tipo: 'texto', ajuda: 'Ex.: Diretora' },
  { chave: 'parc_email', rotulo: 'E-mail', bloco: 2, tipo: 'email' },
  { chave: 'parc_whatsapp', rotulo: 'WhatsApp', bloco: 2, tipo: 'whatsapp' },
  // 3. Administrador da loja
  { chave: 'adm_nome', rotulo: 'Nome', bloco: 3, tipo: 'texto', ajuda: 'Quem vai entrar no painel da loja.' },
  { chave: 'adm_ja_usa', rotulo: 'A escola já usa a Eskolare?', bloco: 3, tipo: 'opcoes', opcoes: SIM_NAO, ajuda: 'Responda Sim se a escola já tem acesso à Eskolare.' },
  { chave: 'adm_email', rotulo: 'E-mail de acesso', bloco: 3, tipo: 'email', ajuda: 'Se a escola ainda não usa a Eskolare, deixe em branco: usamos o e-mail do responsável.' },
  { chave: 'adm_cpf', rotulo: 'CPF', bloco: 3, tipo: 'cpf', ajuda: 'Usado só para criar o acesso.' },
  // 4. Treinamento: participante 1 e até 5 participantes extras (botão "Adicionar participante")
  { chave: 'trein_nome', rotulo: 'Nome', bloco: 4, tipo: 'texto', participante: 1 },
  { chave: 'trein_cargo', rotulo: 'Cargo', bloco: 4, tipo: 'texto', participante: 1 },
  { chave: 'trein_email', rotulo: 'E-mail', bloco: 4, tipo: 'email', participante: 1 },
  { chave: 'trein_whatsapp', rotulo: 'WhatsApp', bloco: 4, tipo: 'whatsapp', participante: 1 },
  ...[2, 3, 4, 5, 6].flatMap(n => ([
    { chave: `trein${n}_nome`, rotulo: 'Nome', bloco: 4, tipo: 'texto', participante: n },
    { chave: `trein${n}_cargo`, rotulo: 'Cargo', bloco: 4, tipo: 'texto', participante: n },
    { chave: `trein${n}_email`, rotulo: 'E-mail', bloco: 4, tipo: 'email', participante: n },
    { chave: `trein${n}_whatsapp`, rotulo: 'WhatsApp', bloco: 4, tipo: 'whatsapp', participante: n },
  ] as Campo[])),
  { chave: 'trein_periodo', rotulo: 'Melhor período', bloco: 4, tipo: 'opcoes', opcoes: ['Manhã', 'Tarde', 'Noite', 'Qualquer horário'], ajuda: 'Para o treinamento.' },
  // 5. Financeiro e conta para receber a comissão
  { chave: 'fin_nome', rotulo: 'Nome', bloco: 5, tipo: 'texto' },
  { chave: 'fin_email', rotulo: 'E-mail', bloco: 5, tipo: 'email' },
  { chave: 'fin_whatsapp', rotulo: 'WhatsApp', bloco: 5, tipo: 'whatsapp' },
  { chave: 'fin_banco', rotulo: 'Banco', bloco: 5, tipo: 'texto', ajuda: 'Conta em nome da escola, para receber a comissão.' },
  { chave: 'fin_agencia', rotulo: 'Agência', bloco: 5, tipo: 'texto' },
  { chave: 'fin_conta', rotulo: 'Conta (com dígito)', bloco: 5, tipo: 'texto' },
  { chave: 'fin_tipo_conta', rotulo: 'Tipo de conta', bloco: 5, tipo: 'opcoes', opcoes: ['Corrente', 'Poupança'] },
  { chave: 'fin_titular', rotulo: 'Titular da conta', bloco: 5, tipo: 'texto' },
  { chave: 'fin_titular_doc', rotulo: 'CNPJ ou CPF do titular', bloco: 5, tipo: 'texto' },
  { chave: 'fin_pix', rotulo: 'Chave Pix', bloco: 5, tipo: 'texto', ajuda: 'Opcional.' },
  // 6. Coordenação pedagógica (só o comercial)
  { chave: 'coord_nome', rotulo: 'Nome', bloco: 6, tipo: 'texto', interno: true },
  { chave: 'coord_email', rotulo: 'E-mail', bloco: 6, tipo: 'email', interno: true },
  { chave: 'coord_whatsapp', rotulo: 'WhatsApp', bloco: 6, tipo: 'whatsapp', interno: true },
  // 7. Alunos por série
  { chave: 'al_inf2', rotulo: 'Infantil 2 (2 anos)', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_inf3', rotulo: 'Infantil 3 (3 anos)', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_inf4', rotulo: 'Infantil 4 (4 anos)', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_inf5', rotulo: 'Infantil 5 (5 anos)', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano1', rotulo: '1º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano2', rotulo: '2º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano3', rotulo: '3º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano4', rotulo: '4º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_ano5', rotulo: '5º ano', bloco: 7, tipo: 'inteiro' },
  { chave: 'al_total', rotulo: 'Total de alunos', bloco: 7, tipo: 'calculado', ajuda: 'Soma automática.' },
  // 8. Valor negociado dos kits
  { chave: 'preco_infantil', rotulo: 'Valor negociado do kit Infantil (R$)', bloco: 8, tipo: 'dinheiro', ajuda: 'Valor de cada kit.' },
  { chave: 'preco_fundamental', rotulo: 'Valor negociado do kit Fundamental (R$)', bloco: 8, tipo: 'dinheiro', ajuda: 'Valor de cada kit.' },
  // 9. Entrega
  { chave: 'ent_nome', rotulo: 'Quem recebe (nome)', bloco: 9, tipo: 'texto' },
  { chave: 'ent_whatsapp', rotulo: 'WhatsApp de quem recebe', bloco: 9, tipo: 'whatsapp' },
  { chave: 'ent_endereco', rotulo: 'Endereço de entrega (se diferente)', bloco: 9, tipo: 'texto', ajuda: 'Só se for diferente do endereço da escola.' },
  // 10. Contrato 2027
  { chave: 'ctr_assinado', rotulo: 'Contrato assinado?', bloco: 10, tipo: 'opcoes', interno: true, opcoes: ['Sim', 'Em assinatura', 'Não'] },
  { chave: 'ctr_kits', rotulo: 'Kits contratados', bloco: 10, tipo: 'inteiro', interno: true },
  { chave: 'ctr_vigencia', rotulo: 'Vigência', bloco: 10, tipo: 'texto', interno: true },
]

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
export const camposDoBlocoTodos = (b: number) => CAMPOS.filter(c => c.bloco === b)
export const blocosPublicos = () => BLOCOS.filter(b => camposDoBloco(b.id).length > 0)
export const camposDoBloco = (b: number) => CAMPOS.filter(c => c.bloco === b && !c.interno)

export const vazio = (v: unknown) => v == null || String(v).trim() === ''

export function campoVisivel(c: Campo, dados: Record<string, any>) {
  if (!c.apenasQuando) return true
  return dados[c.apenasQuando.chave] === c.apenasQuando.valor
}

// Visível E em uso: participantes extras só contam quando têm algum dado.
export function campoAtivo(c: Campo, dados: Record<string, any>) {
  if (!campoVisivel(c, dados)) return false
  if (c.participante && c.participante > 1) return CAMPOS.some(x => x.participante === c.participante && !vazio(dados[x.chave]))
  return true
}

const soma = (d: Record<string, any>, ks: string[]) => ks.reduce((a, k) => a + (parseInt(d[k], 10) || 0), 0)
export function alunosInfantil(d: Record<string, any>) { return soma(d, ['al_inf2', 'al_inf3', 'al_inf4', 'al_inf5']) }
export function alunosFundamental(d: Record<string, any>) { return soma(d, ['al_ano1', 'al_ano2', 'al_ano3', 'al_ano4', 'al_ano5']) }

export function totalAlunos(dados: Record<string, any>) {
  return CHAVES_ALUNOS.reduce((a, k) => a + (parseInt(dados[k], 10) || 0), 0)
}

// % preenchido = perguntas respondidas / perguntas que a escola vê. Nada é obrigatório: serve só de termômetro.
// Dado que veio da plataforma e a escola ainda não confirmou nem corrigiu não conta como resposta da escola.
export function calcularPreenchimento(dados: Record<string, any>, situacao?: Record<string, string>) {
  const campos = CAMPOS.filter(c => !c.interno && c.tipo !== 'calculado' && campoAtivo(c, dados))
  const naoConfirmado = (c: Campo) => !!situacao && situacao[c.chave] === 'pre' && !vazio(dados[c.chave]) && c.tipo !== 'opcoes' && c.tipo !== 'logo'
  const feito = (c: Campo) => !vazio(dados[c.chave]) && !naoConfirmado(c)
  const preenchidos = campos.filter(feito).length
  const titulo = (b: number) => BLOCOS.find(x => x.id === b)?.titulo ?? String(b)
  const faltando = campos.filter(c => !feito(c)).map(c => `${c.rotulo} (${titulo(c.bloco)})` + (naoConfirmado(c) ? ': confirmar' : ''))
  const total = campos.length
  return { preenchidos, total, pct: total ? Math.round((preenchidos / total) * 100) : 0, faltando }
}

// Situação da escola em linguagem simples (o status "enviada" muda de texto se a escola já abriu o link).
export function etapaEscola(status: string, acessou: boolean): { label: string; cor: string; bg: string } {
  const st = STATUS_FICHA.find(x => x.id === status) ?? STATUS_FICHA[0]
  if (status === 'enviada' && acessou) return { label: 'Escola abriu o link, ainda não preencheu', cor: '#0369a1', bg: '#e0f2fe' }
  return { label: st.label, cor: st.cor, bg: st.bg }
}
