# P1 Decision Matrix — EnergiaLivre

Três frentes competem pelo tempo de execução pós-Token + FASE Embaixador.
Decisão por impacto, custo e bloqueios.

## TL;DR — Recomendação

1. **Whitepaper técnico** (PRIMEIRO)
2. **OpenPix produção** (SEGUNDO)
3. **wagmi/RainbowKit wallet connect** (TERCEIRO)

Justificativa: whitepaper é pré-requisito regulatório (Lei 14.478/2022 art. 10), habilita o restante do marketing, e destrava a auditoria externa do contrato. OpenPix gera receita real e fecha o loop do MVP. wagmi é nice-to-have que pode esperar a segunda iteração.

---

## Comparação detalhada

| Critério | Whitepaper | OpenPix produção | wagmi + RainbowKit |
|---|---|---|---|
| **Impacto direto na receita** | ⭐⭐⭐⭐⭐ (compliance) | ⭐⭐⭐⭐⭐ (PIX real) | ⭐⭐ (cosmético) |
| **Bloqueia outros itens?** | SIM (CVM, marketing) | NÃO | NÃO |
| **Esforço técnico** | 2-3 dias (escrita) + R$ 5-15k (advogado) | 1-2 dias (integração) | 1 semana (deps + Webpack) |
| **Risco se adiar** | ALTO (multa CVM, BC) | MÉDIO (receita adiada) | BAIXO (UX) |
| **Pré-requisitos** | Contrato auditado | Contrato deployado (testnet) | Nenhum |
| **Custo externo** | Advogado R$ 5-15k | OpenPix taxa 0,99% | R$ 0 |
| **Pode ser paralelizado?** | SIM (independente) | SIM (independente) | SIM |
| **Status atual** | 0% (rascunho esqueleto) | 0% (MockPixProvider) | 0% (não iniciado) |
| **Dependência upstream** | Contrato KWATT auditado | Contrato KWATT deployado em Amoy | — |

---

## 1. Whitepaper técnico (PRIMEIRO)

**O que é**: documento técnico-legal que descreve o token, tokenomics, casos de uso, riscos, governança e arcabouço regulatório. Equivalente ao "prospecto" simplificado de um token utilitário.

**Por que primeiro**:
- **Compliance**: Lei 14.478/2022 art. 10 obriga documentação técnica pública
- **CVM/BC**: facilita diálogos com regulador e reduz risco de classificação como security
- **Marketing**: link público em /token e /manifesto. Aumenta credibilidade.
- **Auditoria**: revisores externos (CertiK, OpenZeppelin Defender) usam o whitepaper como entrada
- **Prazos**: 1-3 meses para advogado revisar; começar agora para ter pronto no Q3/2026

**Entregas**:
- `docs/WHITEPAPER-KWATT.md` (15-30 páginas)
- Versão PDF formatada para download
- Resumo executivo de 1 página (`/whitepaper` no site)
- Glossário de termos
- Disclaimer legal

**Esqueleto** sugerido em `docs/KWATT-WHITEPAPER-SKETCH.md`.

**Custo**:
- DIY: 0 (2-3 dias do time)
- Advogado cripto: R$ 5-15k (recomendado para mainnet launch)
- OpenZeppelin Defender review: grátis (open-source)

---

## 2. OpenPix produção (SEGUNDO)

**O que é**: trocar o `MockPixProvider` (atual) pelo OpenPix real, gerando BR Code válido na rede PIX do Banco Central, com webhook de confirmação.

**Por que segundo**:
- Gera receita real (taxa 0,99% sobre cada transação)
- Já temos 90% da infraestrutura (`lib/pix.ts`, factories, validação)
- A integração é puramente backend (~150 linhas)
- Risco baixo: OpenPix é regulado pelo BC, APIs estáveis

**Entregas**:
- `lib/pix/openpix-provider.ts` (~100 linhas)
- Webhook `/api/pix/webhook` ajustado para assinatura OpenPix
- Testes E2E com OpenPix sandbox
- Migração de `MockPixProvider` → `OpenPixProvider` em produção
- Env vars: `OPENPIX_APP_ID`, `OPENPIX_API_URL`, `OPENPIX_WEBHOOK_SECRET`

**Custo**:
- Setup: R$ 0
- Transação: 0,99% (ou plano negociado para volume)
- Tempo de implementação: 1-2 dias

**Risco**:
- Downtime OpenPix: PIX cai → vendas pausam (mitigação: fallback para outro provedor)
- Webhook signature falsificada: usar HMAC + IP allowlist
- Time-out BR Code: 30min expira, gerar novo com idempotência

---

## 3. wagmi + RainbowKit (TERCEIRO)

**O que é**: biblioteca React/TypeScript para conectar carteiras EVM (MetaMask, WalletConnect, Rabby, etc) na plataforma, permitindo ver saldo KWATT, assinar transações, votar em governance.

**Por que terceiro**:
- Já temos `/api/token/balance` (read-only server-side)
- A "carteira" é cadastrada manualmente no `/dashboard/token` (input 0x...)
- UX de wallet connect é nice mas não bloqueia
- Implementação tem pegadinhas: SSR (Next.js App Router), Webpack config, eventos assíncronos

**Entregas**:
- `lib/wagmi/config.ts` (chains, connectors)
- `components/WalletConnect.tsx` (botão)
- Hooks: `useTokenBalance`, `useTokenTransfer`, `useTokenBurn`
- Páginas: `/dashboard/token` ganha botão "Conectar carteira"
- Testes: mock de window.ethereum

**Custo**:
- Setup: R$ 0
- WalletConnect projectId: grátis (até 10k MAU)
- Tempo: 1 semana (deps + integração + testes)

**Risco**:
- SSR hydration: precisa `'use client'` + dynamic import
- Eventos: usar `useEffect` para re-render
- Multi-chain: começar só com Polygon
- Mobile UX: WalletConnect QR code flow

---

## Ordem de execução recomendada

```
Q3 2026 (agora)
├─ Whitepaper técnico ──────── 2-3 dias (escrita) + 1-2 semanas (advogado)
├─ OpenPix produção ────────── 1-2 dias (paralelo)
└─ wagmi/RainbowKit ────────── 1 semana (paralelo, mas mais arriscado)

Q4 2026
├─ Contrato KWATT auditado (CertiK ou OZ Defender)
├─ Deploy em Amoy testnet
└─ Testes E2E com OpenPix + wagmi

Q1 2027 (05/01/2027)
├─ Deploy mainnet Polygon
├─ Airdrop para pré-registrados
└─ Launch oficial
```

---

## Decisão final

Confirme a ordem comigo ou inverta se tiver motivo estratégico. Posso começar pelo whitepaper HOJE (esqueleto + seções) e pelo OpenPix AMANHÃ em paralelo.

Última atualização: 06/06/2026
