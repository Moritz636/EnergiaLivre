import Link from 'next/link'
import { Zap, ArrowLeft, FileText, ShieldCheck, Scale, BookOpen, Lock, AlertCircle, Building2, Clock, Gavel } from 'lucide-react'
import { CURRENT_TERMS_VERSION, CURRENT_TERMS_HASH } from '@/lib/commissions'

export const metadata = {
  title: 'Acordo de Pagamento e Uso | EnergiaLivre',
  description: 'Acordo legal de uso da plataforma EnergiaLivre: termos de pagamento, comissões, programa de indicação e responsabilidades.',
}

export default function TermosPage() {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition">
            <Zap className="w-6 h-6" />
            <span className="text-lg font-bold">EnergiaLivre</span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-slate-300 hover:text-emerald-400 transition">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Scale className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Acordo de Pagamento e Uso
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Versão <span className="text-emerald-400 font-mono">{CURRENT_TERMS_VERSION}</span> ·
            Hash <span className="text-slate-500 font-mono text-xs">{CURRENT_TERMS_HASH}</span> ·
            Vigente desde {today}
          </p>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <BookOpen className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3">1. Objeto e Escopo</h2>
              <p className="text-slate-300 leading-relaxed">
                A plataforma <strong className="text-emerald-400">EnergiaLivre</strong> atua como
                facilitadora tecnológica entre consumidores residenciais/comerciais, geradores de
                energia distribuída e parceiros indicadores. Sua função é conectar oferta e demanda
                de excedente energético — não vender energia, não distribuir eletricidade e não
                substituir a concessionária local.
              </p>
              <p className="text-slate-300 leading-relaxed mt-3">
                Nosso ecossistema opera sob o regime da Lei 14.300/2022 (Microgeração e Minigeração
                Distribuída), Lei 14.478/2022 (Criptoativos — token KWATT) e Lei 13.709/2018 (LGPD),
                além das regulações complementares da ANEEL.
              </p>
              <ul className="mt-4 space-y-2 text-slate-300 list-disc list-inside">
                <li>Match georreferenciado entre oferta (excedente solar) e demanda (economia na fatura);</li>
                <li>Negociação direta entre as partes via chat e propostas;</li>
                <li>Assinaturas opcionais (planos Consumidor/Gerador, Member Plus) e moedas internas (1 moeda = R$ 0,70 de desconto);</li>
                <li>Programa de indicação com cupons e comissões para parceiros;</li>
                <li>Token de utilidade KWATT, regido por contrato autônomo e whitepaper específico.</li>
              </ul>
              <p className="text-slate-400 text-sm mt-4 italic">
                A EnergiaLivre não interfere na relação regulatória entre usuário e concessionária,
                não emite fatura de energia e não realiza venda direta de kWh. O acordo entre
                consumidor e gerador é particular; a plataforma é a facilitadora.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">2. Modelo Econômico</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-left py-2">Ator</th>
                      <th className="text-left py-2">Receita / Benefício</th>
                      <th className="text-left py-2">Custo</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-slate-800">
                      <td className="py-3 font-semibold text-emerald-300">Consumidor</td>
                      <td className="py-3">Economia de até 32% na fatura via match</td>
                      <td className="py-3">R$ 0 (cliente grátis). Member Plus opcional R$ 9,90/mês</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 font-semibold text-emerald-300">Gerador (UFV)</td>
                      <td className="py-3">Venda de excedente a consumidores próximos (preço melhor que rede)</td>
                      <td className="py-3">Plano de assinatura Gerador + 8% de taxa da plataforma por transação</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 font-semibold text-emerald-300">Parceiro</td>
                      <td className="py-3">5% da receita dos clientes indicados + 20 moedas por match</td>
                      <td className="py-3">R$ 0 (gratuito)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-emerald-300">Plataforma</td>
                      <td className="py-3">Assinaturas + moedas + taxa de 8% por transação entre as partes</td>
                      <td className="py-3">Operação, infraestrutura, suporte ao time</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-slate-400 text-sm mt-4">
                <strong className="text-amber-400">Importante:</strong> Moedas EnergiaLivre são <em>desconto</em>
                sobre o valor da fatura negociada, aplicáveis exclusivamente a transações realizadas dentro da
                plataforma. Moedas <strong>não</strong> constituem moeda corrente, não são conversíveis em
                dinheiro, não são transferíveis entre usuários e expiram em 12 meses após a compra.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                <strong className="text-amber-400">Prazo de integração:</strong> Uma vez aceito o match,
                a compensação de créditos junto à distribuidora local pode levar até{' '}
                <strong>90 (noventa) dias</strong> para refletir na fatura do consumidor, conforme
                ciclos de faturamento e regulação da ANEEL aplicável a cada concessionária.
                Este prazo aplica-se a todos os planos, sem exceção.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3">3. Comissões e Taxas</h2>
              <div className="space-y-4 text-slate-300">
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">3.1. Match aceito (bônus em moedas)</h3>
                  <p>
                    Quando uma proposta de match é aceita por ambas as partes, a plataforma credita
                    automaticamente <strong>20 moedas</strong> a cada parte (consumidor e gerador) como
                    bônus de boas-vindas à conexão. Se houver um parceiro indicador
                    (campo <code className="text-emerald-300">referred_by</code>), o parceiro recebe
                    também <strong>20 moedas</strong> por indicação confirmada.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">3.2. Comissão de Parceiro (5%)</h3>
                  <p>
                    Para cada pagamento processado pela plataforma de um cliente que tenha sido indicado
                    por um parceiro, o parceiro recebe <strong>5% do valor</strong> do pagamento.
                    Esta comissão é calculada atomicamente via RPC <code>process_payment_commissions</code> e
                    registrada na tabela <code>comissoes</code> com tipo <code>embaixador_5pct</code>.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">3.3. Taxa da Plataforma (8%)</h3>
                  <p>
                    Para cada transação realizada entre consumidor e gerador, a plataforma retém
                    <strong> 8% do valor</strong> como taxa de operação. Esta taxa mantém o time,
                    infraestrutura e garante o funcionamento contínuo da plataforma.
                    Registrada automaticamente a cada pagamento processado.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">3.4. Idempotência</h3>
                  <p>
                    Todas as comissões são <em>idempotentes</em>: se um mesmo pagamento for processado
                    duas vezes (ex.: retry de webhook), a comissão só é creditada uma vez. Idem para
                    match aceito: colunas <code>commissions_processed_at</code> registram timestamp da
                    primeira execução.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3">4. Privacidade e Proteção de Dados (LGPD)</h2>
              <p className="text-slate-300 leading-relaxed">
                O tratamento de dados pessoais na plataforma observa a{' '}
                <strong className="text-emerald-400">Lei 13.709/2018 (LGPD)</strong> e o{' '}
                <strong className="text-emerald-400">Marco Civil da Internet (Lei 12.965/2014)</strong>.
                Dados coletados:
              </p>
              <ul className="mt-3 space-y-2 text-slate-300 list-disc list-inside">
                <li><strong>Identificação:</strong> nome, e-mail, CPF/CNPJ (para geradores), WhatsApp;</li>
                <li><strong>Localização:</strong> lat/lng do navegador (apenas com permissão explícita) para cálculo de distância no match;</li>
                <li><strong>Fatura:</strong> estado, concessionária, valor, kWh mensal — armazenados criptografados em bucket privado;</li>
                <li><strong>Comportamento:</strong> aceite de propostas, histórico de matches, transações de moedas.</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-3">
                Finalidades: (i) execução do serviço de match; (ii) processamento de pagamentos via Stripe
                (PCI-DSS nível 1); (iii) emissão de cupons e comissões; (iv) cumprimento de obrigações
                legais/regulatórias (ANEEL, Receita Federal).
              </p>
              <p className="text-slate-300 leading-relaxed mt-2">
                Direitos do titular (art. 18 LGPD): acesso, correção, anonimização, portabilidade,
                eliminação — exercer via{' '}
                <a href="mailto:contato@energialivre.dev.br" className="text-emerald-400 hover:underline">
                  contato@energialivre.dev.br</a>. Respondemos em até 15 dias úteis.
              </p>
              <p className="text-slate-400 text-sm mt-3 italic">
                A plataforma não compartilha dados com terceiros para fins de marketing não autorizados.
                Dados de localização são utilizados exclusivamente para o algoritmo de match e não são
                armazenados após o término da conta do usuário.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <Building2 className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3">5. Obrigações das Partes e Prazos</h2>
              <div className="space-y-4 text-slate-300">
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">5.1. Plataforma</h3>
                  <p>
                    Manter a infraestrutura operacional, proteger os dados conforme LGPD, processar pagamentos
                    via Stripe com segurança PCI-DSS, mediar conflitos via ouvidoria, cumprir prazos de
                    estorno (até 7 dias úteis após solicitação válida).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">5.2. Consumidor</h3>
                  <p>
                    Fornecer dados verdadeiros da fatura, manter seus dados cadastrais atualizados,
                    honrar os termos acordados com o gerador no chat (valor do kWh, prazo, forma de pagamento),
                    respeitar o CDC (Lei 8.078/1990) na relação com o gerador.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">5.3. Gerador</h3>
                  <p>
                    Manter a usina em condições operacionais conforme regulamentação ANEEL, entregar a energia
                    acordada com qualidade e continuidade, honrar o pagamento da taxa da plataforma de 8% por
                    transação realizada, manter o registro de microgeração/minigeração atualizado.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">5.4. Parceiro</h3>
                  <p>
                    Indicar consumidores/geradores de forma ética e não enganosa, não fazer promessas
                    financeiras além das previstas neste acordo, comunicar à plataforma eventuais
                    conflitos de interesse.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">5.5. Prazo de Integração (90 dias)</h3>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 leading-relaxed">
                        Por normas operacionais das distribuidoras de energia e ciclos de faturamento
                        regulados pela ANEEL, o prazo para que os créditos de compensação passem a
                        refletir na fatura do consumidor é de <strong>até 90 (noventa) dias corridos</strong>{' '}
                        a partir da ativação do match na plataforma.
                      </p>
                      <p className="text-slate-300 leading-relaxed mt-2">
                        Este prazo aplica-se a <strong>todos os planos</strong> (Consumidor, Gerador,
                        Parceiro e Member Plus), sem distinção. A plataforma não se responsabiliza por
                        atrasos decorrentes dos processos internos de cada concessionária, limitações
                        técnicas de integração ou períodos de migração regulatória.
                      </p>
                      <p className="text-slate-400 text-sm mt-2">
                        Durante este período, o consumidor continua pagando a tarifa cheia à
                        concessionária. Os créditos são compensados de forma retroativa assim que a
                        integração é concluída.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3">6. Limitação de Responsabilidade</h2>
              <p className="text-slate-300 leading-relaxed">
                A EnergiaLivre atua como mera facilitadora tecnológica. Desta posição decorrem as
                seguintes limitações objetivas:
              </p>
              <ul className="mt-3 space-y-2 text-slate-300 list-disc list-inside">
                <li>Descumprimento de termos acordados entre consumidor e gerador via chat ou proposta — a plataforma não é parte na relação contratual entre eles;</li>
                <li>Indisponibilidade da rede elétrica local, falhas da concessionária ou bandeiras tarifárias — eventos alheios ao controle da plataforma;</li>
                <li>Flutuações de tarifa, impostos ou mudanças regulatórias da ANEEL — riscos regulatórios inerentes ao setor elétrico brasileiro;</li>
                <li>Danos indiretos, lucros cessantes ou perdas consequenciais — excluídos em qualquer hipótese;</li>
                <li>Ações de terceiros (hackers, força maior, falhas de internet do usuário) — casos fortuitos ou de força maior nos termos do art. 393 do Código Civil.</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-3">
                A responsabilidade total e cumulativa da plataforma, em qualquer hipótese, limita-se
                ao valor efetivamente pago pelo usuário nos 12 (doze) meses anteriores ao evento
                danoso. Esta limitação é parte essencial da precificação dos serviços e sobrevive
                mesmo em caso de falha na finalidade essencial do serviço.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <Gavel className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3">7. Disposições Finais</h2>
              <ul className="space-y-3 text-slate-300 list-disc list-inside">
                <li><strong>Foro:</strong> Comarca de Natal/RN, Brasil — eleito com exclusividade para dirimir quaisquer controvérsias (Lei 10.406/2002, art. 78);</li>
                <li><strong>Mediação prévia:</strong> tentativa obrigatória de resolução via ouvidoria antes de qualquer ação judicial. Prazo de resposta: até 10 dias úteis;</li>
                <li><strong>Aceite eletrônico:</strong> o clique em &ldquo;Aceitar os termos&rdquo; constitui assinatura eletrônica válida nos termos da MP 2.200-2/2001 (ICP-Brasil);</li>
                <li><strong>Alterações:</strong> mudanças materiais nestes termos serão comunicadas com 30 (trinta) dias de antecedência por e-mail e notificação na plataforma. O uso continuado após alteração implica aceitação tácita;</li>
                <li><strong>Cancelamento:</strong> o usuário pode cancelar sua conta a qualquer momento, com efeito imediato. Comissões pendentes (5% de parceiro, moedas de match) são honradas em até 30 dias corridos do cancelamento;</li>
                <li><strong>Eleição de garantias:</strong> em caso de conflito entre versões traduzidas deste acordo, a versão em português brasileiro prevalece.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <Scale className="w-6 h-6 text-slate-500 shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-3 text-slate-400">8. Legislação Aplicável</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Este acordo é regido pelas seguintes leis, sem prejuízo de outras aplicáveis:
              </p>
              <ul className="mt-3 space-y-1.5 text-slate-500 text-sm list-disc list-inside">
                <li>Lei 14.300/2022 — Microgeração e Minigeração Distribuída</li>
                <li>Lei 14.478/2022 — Criptoativos (token KWATT)</li>
                <li>Lei 13.709/2018 — LGPD (proteção de dados)</li>
                <li>Lei 10.406/2002 — Código Civil</li>
                <li>Lei 8.078/1990 — Código de Defesa do Consumidor (aplicável a consumidores finais)</li>
                <li>Lei 12.965/2014 — Marco Civil da Internet</li>
                <li>MP 2.200-2/2001 — Infraestrutura de Chaves Públicas (ICP-Brasil)</li>
                <li>Regulações ANEEL — Resoluções Normativas aplicáveis à GD</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="text-center pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm">
            Documento gerado eletronicamente · {today} ·{' '}
            <span className="font-mono">{CURRENT_TERMS_HASH}</span>
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Dúvidas?{' '}
            <a href="mailto:contato@energialivre.dev.br" className="text-emerald-400 hover:underline">contato@energialivre.dev.br</a>
            {' '}·{' '}
            <a href="https://wa.me/5584987858668" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">WhatsApp</a>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </section>
      </main>
    </div>
  )
}
