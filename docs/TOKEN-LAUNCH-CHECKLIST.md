# Token Launch Checklist — KWATT (pré-05/01/2027)

Tudo que precisa estar pronto antes do lançamento oficial do token em mainnet Polygon.
Ordenado por criticidade (P0 bloqueia lançamento, P1 polish, P2 nice-to-have).

---

## P0 — Bloqueia o lançamento (FAZER ANTES)

### Contrato
- [ ] Smart contract KWATT gerado (Thirdweb OU OpenZeppelin Wizard)
- [ ] Contrato copiado para `contracts/contracts/KWATT.sol` (substituir o template)
- [ ] `npm run compile` em `/contracts/` sem erros
- [ ] `npm run lint` (solhint) sem erros
- [ ] `npm run test` — 100% passando, coverage > 95%
- [ ] `npm run slither` — sem findings high/medium
- [ ] `npm run echidna` (se disponível) — 0 invariants violados em 50k runs
- [ ] Auditoria interna completa via `contracts/audit/CHECKLIST.md`
- [ ] Relatório de auditoria em `contracts/audit/REPORT-2026-XX.md`
- [ ] **Auditoria externa** (OpenZeppelin Defender OU CertiK)

### Deploy
- [ ] Conta deployer criada (cold wallet, multisig Gnosis Safe recomendado)
- [ ] `PRIVATE_KEY` da multisig deployer em `.env` (com cuidado, vault 1Password)
- [ ] Deploy em Amoy testnet (`npm run deploy:amoy`)
- [ ] Verificação no Amoy Polygonscan (`npm run verify:amoy`)
- [ ] Testes E2E em testnet (mint, burn, pause, permit, vote)
- [ ] Deploy em Polygon mainnet (`npm run deploy:polygon`)
- [ ] Verificação no Polygonscan mainnet (`npm run verify:polygon`)
- [ ] Endereço do contrato publicado em `token_contracts` table
- [ ] `NEXT_PUBLIC_KWATT_CONTRACT_ADDRESS` configurado no Vercel

### Plataforma (Next.js)
- [ ] `lib/tokenomics.ts` atualizado com endereço real do contrato
- [ ] `lib/database.types.ts` com novas tabelas (token_holdings, token_transactions, etc)
- [ ] Migration `20260607_token_ledger.sql` aplicada no Supabase
- [ ] RPCs `get_token_metrics()` e `get_user_token_ledger()` testadas
- [ ] Endpoints testados: `/api/token/info`, `/balance`, `/transactions`, `/redeem`, `/claim`
- [ ] Página `/dashboard/token` funcional com leitura on-chain
- [ ] `components/TokenWidget` em dashboards (consumidor/gerador)
- [ ] Banner de pré-launch removido/ajustado em `/token`
- [ ] FAQ atualizado com perguntas pós-launch
- [ ] Typecheck + build OK
- [ ] Deploy Vercel em produção

### Compliance
- [ ] Whitepaper técnico publicado (`docs/WHITEPAPER-KWATT.md`)
- [ ] Revisão por advogado cripto
- [ ] Termos de uso atualizados mencionando KWATT como utilitário
- [ ] Política de privacidade (LGPD) revisada
- [ ] Disclaimer legal em todas as páginas de token

### Operacional
- [ ] Planilha de airdrops pré-calculada (todos os pré-registros)
- [ ] Script Node para executar airdrops batch (`scripts/airdrop.ts`)
- [ ] Webhook listener de eventos Transfer (para sincronizar cache)
- [ ] Cron job de refresh de holdings (cada 5min)
- [ ] Alertas de monitoria (low balance, pause acionado, large transfer)

---

## P1 — Importante (pode ser feito nas primeiras 48h pós-launch)

- [ ] OpenPix produção (sai do MockPixProvider)
- [ ] wagmi/RainbowKit no `/dashboard/token`
- [ ] Página `/token/whitepaper` com versão formatada para download
- [ ] Email de boas-vindas pós-airdrop (com link para Polygonscan)
- [ ] PWA manifest para que `/dashboard/token` seja instalável
- [ ] Suporte multi-idioma (PT/EN/ES) em `/token`
- [ ] Email marketing Resend para pré-registrados confirmarem wallet
- [ ] Bug bounty program (Immunefi ou Code4rena)
- [ ] Listagem em DEX (Uniswap v3 Polygon) — 30 dias pós-launch
- [ ] Whitepaper tradução inglês para listagem internacional

---

## P2 — Polish (pode esperar 30+ dias)

- [ ] Sentry para monitorar `/api/token/*`
- [ ] Dashboard analytics de tokens (Grafana + Supabase logs)
- [ ] Governança on-chain (propostas, votação, timelock)
- [ ] Staking pools (30/90/180/365 dias)
- [ ] Bridge Polygon ↔ Ethereum mainnet
- [ ] NFT badges para holders (1k+, 10k+, 100k+ KWATT)
- [ ] Marketplace de tokens entre usuários (P2P)
- [ ] Integração com Swap DEX (1inch, Matcha)
- [ ] App mobile (React Native + wagmi)

---

## Critérios de GO/NO-GO (D-7 antes do launch)

Todos devem ser SIM para lançar:

- [ ] Auditoria externa concluída com 0 findings críticos
- [ ] Smart contract deployado e verificado em Polygonscan
- [ ] Whitepaper publicado e revisado por advogado
- [ ] Plataforma `/dashboard/token` testada com 10+ usuários internos
- [ ] Airdrop script testado em Amoy com 100% de sucesso
- [ ] Plano de contingência (pause de emergência) documentado
- [ ] Equipe de plantão 24/7 nas primeiras 72h
- [ ] Saldo da multisig com MATIC suficiente para 1000+ airdrops
- [ ] Comunicado oficial redigido (blog, e-mail, redes sociais)
- [ ] Suporte@energialivre.dev.br com auto-reply configurado

Se QUALQUER item for NÃO, adiar o launch. Não há pressa. Melhor lançar 1 mês depois, perfeito, do que no prazo, com bug.

---

## Pós-launch (D+1 a D+30)

### D+1
- [ ] Comunicar via e-mail todos os pré-registrados
- [ ] Post em redes sociais (LinkedIn, Twitter/X, Instagram)
- [ ] Monitorar Polygonscan para confirmar todos os airdrops
- [ ] Coletar feedback dos primeiros 50 usuários
- [ ] Abrir canal #kwatt-launch no Discord/Telegram

### D+7
- [ ] Relatório de uso (transações, holders ativos, TVL)
- [ ] Bug fixes emergenciais se houver
- [ ] Comunicado público "1 semana de KWATT"
- [ ] Iniciar listagem em DEX (Uniswap v3)

### D+30
- [ ] Relatório completo de 30 dias
- [ ] Decisão de próximos passos (staking, DAO, bridge)
- [ ] Whitepaper v2 com aprendizados
- [ ] Iniciar auditoria de novos features

---

Última atualização: 06/06/2026
Próxima revisão: a cada milestone
