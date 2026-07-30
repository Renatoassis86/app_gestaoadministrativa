import type { FormularioBriefingConfig } from './types'
import { perguntasComuns } from './types'

const PRIORIDADES_GERAIS = [
  'Produzir material de resposta a objeções', 'Esclarecer o perfil de escola ideal para o time comercial',
  'Fortalecer conteúdo baseado em dúvidas reais das escolas', 'Mapear a concorrência com mais profundidade',
  'Produzir depoimentos e casos reais de implantação', 'Melhorar o material de apresentação da proposta',
]

export const consultoraPedagogica: FormularioBriefingConfig = {
  id: 'consultoria-pedagogica',
  titulo: 'Briefing para construção do planejamento de marketing',
  destinatario: 'Consultoria Pedagógica',
  descricaoDestinatario:
    'Este formulário se destina à Consultoria Pedagógica. Você é quem mais conversa diretamente com escolas, ' +
    'professores e famílias durante implantações e formações — por isso as perguntas aqui são sobre o que você ' +
    'ouve e observa no campo: dores reais, objeções, dúvidas recorrentes e como a concorrência aparece nessas ' +
    'conversas. Escreva com suas próprias palavras — isso vira material bruto para o marketing.',
  tempoEstimado: '20–25 min',
  perguntas: [
    ...perguntasComuns(PRIORIDADES_GERAIS),

    // Bloco 1 — Cliente ideal e dor real
    {
      id: 'cliente_ideal_descricao', bloco: 'Cliente ideal e dor real',
      texto: 'Descreva o cliente ideal com quem você mais gosta de trabalhar: perfil da escola, porte, região, momento institucional.',
      tipo: 'texto_longo', obrigatoria: true,
    },
    {
      id: 'problema_real_cliente', bloco: 'Cliente ideal e dor real',
      texto: 'Qual é o problema real que faz uma escola procurar o Cidade Viva Education? Não o problema que ela declara — o que você percebe que ela realmente sente.',
      tipo: 'texto_longo', obrigatoria: true,
    },
    {
      id: 'cliente_indesejado', bloco: 'Cliente ideal e dor real',
      texto: 'Que tipo de escola vocês NÃO deveriam aceitar como parceira, mesmo que ela pagasse?',
      tipo: 'texto_curto',
    },

    // Bloco 2 — Objeções e decisão
    {
      id: 'tres_objecoes_campo', bloco: 'Objeções e decisão',
      texto: 'Quais são as três objeções que mais aparecem antes de uma escola fechar parceria?',
      tipo: 'texto_longo', obrigatoria: true,
    },
    {
      id: 'ultimo_nao_recebido', bloco: 'Objeções e decisão',
      texto: 'Qual foi o último "não" que você recebeu de uma escola, e por quê?',
      tipo: 'texto_longo',
    },
    {
      id: 'gatilho_decisao_sim', bloco: 'Objeções e decisão',
      texto: 'O que a escola precisa acreditar ou entender para finalmente dizer sim?',
      tipo: 'texto_longo', obrigatoria: true,
    },

    // Bloco 3 — Concorrência pelo olhar de campo
    {
      id: 'concorrentes_diretos_campo', bloco: 'Concorrência pelo olhar de campo',
      texto: 'Quais sistemas ou propostas concorrentes aparecem com mais frequência nas conversas com escolas?',
      tipo: 'texto_curto', obrigatoria: true,
    },
    {
      id: 'motivo_escolha_concorrente', bloco: 'Concorrência pelo olhar de campo',
      texto: 'Quando uma escola escolhe o concorrente em vez do Cidade Viva Education, qual costuma ser o motivo real?',
      tipo: 'texto_longo',
    },
    {
      id: 'diferencial_impossivel_copiar', bloco: 'Concorrência pelo olhar de campo',
      texto: 'Na sua experiência de campo, o que o Cidade Viva Education faz que nenhum concorrente consegue copiar?',
      tipo: 'texto_longo', obrigatoria: true,
    },

    // Bloco 4 — Conteúdo a partir do campo
    {
      id: 'perguntas_frequentes_escolas', bloco: 'Conteúdo a partir do campo',
      texto: 'Quais perguntas as escolas e professores fazem toda vez, nas formações e implantações? Liste quantas lembrar — cada uma pode virar um conteúdo.',
      tipo: 'texto_longo', obrigatoria: true,
    },
    {
      id: 'porta_vozes_confortaveis_campo', bloco: 'Conteúdo a partir do campo',
      texto: 'Dentre as pessoas com quem você trabalha em campo (professores, coordenadores, autores), quem é confortável e bom diante da câmera?',
      tipo: 'texto_curto',
    },
    {
      id: 'peca_conteudo_preferida', bloco: 'Conteúdo a partir do campo',
      texto: 'Qual peça de conteúdo já publicada pelo Cidade Viva Education você mais gostou? Por quê?',
      tipo: 'texto_longo',
    },
    {
      id: 'decisao_oculta_marketing', bloco: 'Conteúdo a partir do campo',
      texto: 'Existe alguma decisão estratégica já tomada que o time de marketing ainda não sabe?',
      tipo: 'texto_longo',
    },
    {
      id: 'observacoes_finais', bloco: 'Conteúdo a partir do campo',
      texto: 'O que eu deveria ter perguntado e não perguntei?',
      tipo: 'texto_longo',
    },
  ],
}
