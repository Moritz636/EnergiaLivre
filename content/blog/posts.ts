export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  tags: string[]
  content: string[]
}

export const posts: BlogPost[] = [
  {
    slug: 'economizar-energia-sem-placa-solar',
    title: 'Como economizar energia sem instalar placa solar',
    description: 'Descubra como reduzir sua conta de luz em até 32% usando créditos de energia solar de vizinhos — sem obra, sem placa, sem burocracia.',
    date: '2026-06-10',
    readTime: '5 min',
    tags: ['Economia', 'Créditos', 'Sem placa'],
    content: [
      'Muita gente pensa que para economizar com energia solar é preciso instalar painéis no telhado. Mas existe um caminho mais simples e acessível: a cessão de créditos de energia.',
      'Pela Resolução Normativa ANEEL 1.059/2023, consumidores podem receber créditos de energia gerados por outras unidades consumidoras. Na prática, você "compra" o excedente de quem já tem placas solares e abate da sua conta.',
      'Como funciona: 1) Um gerador solar produz mais energia do que consome. 2) Esse excedente vira créditos na distribuidora. 3) Você solicita a cessão desses créditos via EnergiaLivre. 4) A distribuidora aplica os créditos na sua fatura.',
      'Vantagens: sem instalação, sem manutenção, sem investimento inicial. A economia média é de até 32% sobre o valor da fatura. O processo é regulado pela ANEEL e 100% legal.',
      'Quer saber quanto você pode economizar? Use nossa calculadora na página inicial e descubra em 30 segundos.',
    ],
  },
  {
    slug: 'venda-excedente-solar-vizinhos-legal',
    title: 'Venda de excedente solar para vizinhos — é legal?',
    description: 'Tire todas as dúvidas sobre a legalidade da venda de excedente solar entre vizinhos no Brasil. Entenda a RN 1.059/2023 e como funciona na prática.',
    date: '2026-06-08',
    readTime: '7 min',
    tags: ['Legal', 'ANEEL', 'Excedente'],
    content: [
      'Sim, é legal. Desde a publicação da Resolução Normativa ANEEL 1.059/2023, o modelo de cessão de créditos entre unidades consumidoras foi ampliado e regulamentado.',
      'Antes dessa resolução, os créditos só podiam ser usados na mesma unidade ou em unidades do mesmo titular. Agora, qualquer consumidor pode receber créditos de qualquer gerador dentro da mesma área de concessão da distribuidora.',
      'Na prática, o que acontece: 1) O gerador cede voluntariamente seus créditos excedentes. 2) A distribuidora aplica esses créditos na fatura do consumidor receptor. 3) O consumidor combina uma contrapartida financeira com o gerador (via Pix, por exemplo).',
      'A ANEEL chama isso de "cessão de créditos" — não é venda de energia, mas sim cessão do direito de abatimento. Por isso, não incide ICMS sobre o valor da contrapartida (desde que dentro dos limites legais).',
      'Importante: a cessão deve ser registrada junto à distribuidora. A EnergiaLivre automatiza todo esse processo para geradores e consumidores.',
    ],
  },
  {
    slug: 'mercado-livre-energia-2025',
    title: 'Mercado livre de energia para residências — o que muda em 2025/2026',
    description: 'Entenda as mudanças do mercado livre de energia no Brasil e como elas podem beneficiar consumidores residenciais a partir de 2025.',
    date: '2026-06-05',
    readTime: '6 min',
    tags: ['Mercado Livre', 'Regulação', '2025'],
    content: [
      'O mercado livre de energia, antes restrito a grandes empresas, está se abrindo gradualmente para pequenos negócios e residências. A partir de 2025, consumidores com carga a partir de 500 kWh/mês já podem escolher seu fornecedor.',
      'No modelo atual (Ambiente de Contratação Regulado — ACR), a distribuidora compra energia e repassa o custo ao consumidor. No mercado livre (Ambiente de Contratação Livre — ACL), o consumidor negocia diretamente com geradores e comercializadoras.',
      'Vantagens do mercado livre: preço negociável (pode ser até 30% menor), previsibilidade de custos (contratos de longo prazo), e possibilidade de escolher fontes renováveis específicas.',
      'Para a maioria dos consumidores residenciais (consumo abaixo de 500 kWh/mês), o modelo de cessão de créditos solares continua sendo a melhor alternativa — combina a simplicidade do mercado regulado com economias similares ao mercado livre.',
      'A EnergiaLivre está preparada para operar em ambos os modelos. Nosso sistema de match conecta consumidores a geradores para cessão de créditos, enquanto nos preparamos para atuar como comercializadora no ACL.',
    ],
  },
  {
    slug: 'fazenda-solar-vs-credito-vizinho',
    title: 'Fazenda solar vs crédito de vizinho — qual compensa mais?',
    description: 'Comparativo completo entre assinar uma fazenda solar remota ou receber créditos de geradores locais. Veja prós, contras e qual escolher.',
    date: '2026-06-02',
    readTime: '6 min',
    tags: ['Comparativo', 'Fazenda Solar', 'Crédito Local'],
    content: [
      'Duas opções dominam o mercado de energia solar sem placa: fazendas solares remotas (usinas compartilhadas) e a cessão de créditos de geradores locais (vizinhos). Cada uma tem vantagens específicas.',
      'Fazenda solar remota: você assina quotas de uma usina em outra região. A energia gerada vira créditos na sua conta. Vantagens: escala, preço competitivo, sem preocupação com distância. Desvantagens: dependência de uma única usina, prazo contratual longo (12 a 24 meses).',
      'Crédito de vizinho: você recebe o excedente de geradores próximos (até 5 km). Vantagens: conexão local, contratos mais flexíveis, incentiva a economia circular. Desvantagens: disponibilidade variável, depende de geradores cadastrados na região.',
      'Para consumidores com consumo estável acima de R$ 200/mês: a fazenda solar pode oferecer o menor preço. Para quem busca flexibilidade e quer apoiar a geração distribuída local: o crédito de vizinho é mais interessante.',
      'Na EnergiaLivre, você encontra ambas as opções. Simule seu perfil na página inicial e veja qual modelo compensa mais para sua região.',
    ],
  },
  {
    slug: 'taxacao-importados-energia-solar',
    title: 'Taxação de importados vai afetar a energia solar no Brasil?',
    description: 'Análise do impacto da taxação de painéis solares importados no custo da energia solar e nas alternativas para o consumidor brasileiro.',
    date: '2026-05-28',
    readTime: '5 min',
    tags: ['Taxação', 'Importação', 'Mercado'],
    content: [
      'O governo brasileiro restabeleceu a taxação de importação de painéis solares (células fotovoltaicas) em 2024/2025. A alíquota voltou a até 25%, impactando diretamente o custo de novos sistemas solares.',
      'Resultado: o preço de uma usina residencial (5 kWp) subiu entre 10% e 15% no período. Isso torna o investimento em placas solares menos atrativo para quem depende de financiamento longo.',
      'Paradoxalmente, esse movimento fortalece modelos alternativos como a cessão de créditos. Quando instalar placas fica mais caro, comprar crédito de quem já tem placas se torna relativamente mais barato.',
      'A energia solar ainda compensa no longo prazo (payback médio de 4-6 anos, mesmo com taxação), mas a barreira de entrada subiu. Para quem não tem R$ 15-20 mil para investir, o crédito de vizinho é a alternativa mais racional.',
      'Na EnergiaLivre, acreditamos que a geração distribuída deve ser acessível a todos. Por isso, priorizamos modelos sem barreira de entrada — você economiza sem precisar importar nada.',
    ],
  },
]
