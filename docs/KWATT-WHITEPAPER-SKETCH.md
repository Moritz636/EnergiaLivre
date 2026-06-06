# KWATT Whitepaper — Esqueleto (rascunho para advogado)

> **Status**: Rascunho técnico. Não usar como material legal sem revisão.
> **Data**: 06/06/2026
> **Próxima revisão**: pós-auditoria externa
> **Idioma oficial**: Português (Brasil) + tradução em Inglês

---

## 1. Resumo executivo (1 página)

- KWATT é token utilitário do ecossistema EnergiaLivre
- Função: pagamento de faturas, recargas, cashback
- 1 KWATT = 30% de 1 kWh (R$ 0,285 base)
- Supply fixo: 1 bilhão de tokens
- Blockchain: Polygon PoS (chain 137)
- Padrão: ERC-20 + Burnable + Pausable + Permit + Votes
- NÃO é valor mobiliário (Lei 14.478/2022 art. 3º)
- NÃO confere direito a dividendos, voto societário ou expectativa de retorno

---

## 2. Problema e solução

### 2.1. Problema
- Mercado de energia solar distribuída no Brasil: 3,1M sistemas (ANEEL 2024)
- 80% do excedente vai para a rede sem rastreabilidade individual
- Consumidores sem solar pagam tarifa cheia
- Produtores sem plataforma digital para monetizar excedente
- Intermediários capturam 30-50% do valor

### 2.2. Solução EnergiaLivre
- Marketplace P2P de excedente solar
- Georreferenciamento + match automático
- Token utilitário como camada de liquidação
- Compliance total com Lei 14.300/2022 (net metering)

---

## 3. Tokenomics detalhado

### 3.1. Supply e distribuição
| Alocação | % | Tokens | Vesting |
|---|---|---|---|
| Pré-venda pública | 20% | 200M | Disponível no launch |
| Recompensas usuários | 15% | 150M | 4 anos (linear) |
| Tesouraria / DAO | 25% | 250M | 4 anos (1 ano cliff) |
| Liquidez DEX | 20% | 200M | Disponível no launch |
| Ecossistema | 15% | 150M | 3 anos (linear) |
| Advisors | 5% | 50M | 2 anos (6 meses cliff) |

### 3.2. Mecanismos deflacionários
- Burn em resgates (100% do valor resgatado)
- Sem mint adicional (MAX_SUPPLY guard no contrato)
- Queima opcional em transações futuras (decisão DAO)

### 3.3. Utilidade concreta
- 1 KWATT = 30% de 1 kWh (R$ 0,285)
- Pagamento de fatura: 100% desconto até limite mensal
- Recarga celular: Vivo, Claro, TIM, Oi (R$ 10-100)
- Cashback: 5-12% em compras
- Indicação: 5-100 KWATT por signup confirmado
- Governança: 1 KWATT = 1 voto em propostas DAO

---

## 4. Tecnologia

### 4.1. Smart contract
- Linguagem: Solidity 0.8.24
- Padrão: ERC-20 (EIP-20) + extensões
- Extensões: Burnable, Pausable, Permit (EIP-2612), Votes (EIP-5805), AccessControl
- Upgradeability: NÃO (imutável, com multisig para roles críticas)
- Audit: CertiK / OpenZeppelin Defender
- Verificação: Polygonscan (verified source)
- Open source: github.com/Moritz636/EnergiaLivre/contracts

### 4.2. Arquitetura
```
┌─────────────────────┐
│ EnergiaLivre App    │ (Next.js 14, App Router)
│ (Next.js 14)        │
└──────────┬──────────┘
           │
           ├──► Supabase (PostgreSQL + Auth)
           │    - profiles, geradores, matches
           │    - token_holdings, token_transactions
           │    - token_redemptions, token_airdrops
           │
           ├──► Polygon RPC
           │    - KWATT contract (read-only cache)
           │
           └──► APIs internas
                - /api/token/* (info, balance, redeem, claim)
                - /api/pix/* (OpenPix/Mock)
                - /api/stripe/* (cartão)
```

### 4.3. Segurança
- Multisig 5/9 (Gnosis Safe) para roles críticas (PAUSER, MINTER, ADMIN)
- Timelock 48h para mudanças de fee ou queima programada
- Bug bounty: US$ 5k-50k (Immunefi)
- Auditoria externa anual
- Monitoria 24/7 (Tenderly, Forta)
- Circuit breaker (Pausable) com SLA de 1h

---

## 5. Casos de uso reais

### 5.1. Consumidor
- Maria, 32 anos, São Paulo: paga R$ 280/mês de luz
- Compra pacote Standard (300 KWATT) por R$ 76,50 (10% off)
- Usa 280 KWATT para abater 100% da fatura
- Sobram 20 KWATT para cashback em recarga
- Economia anual: R$ 2.436 (87% da conta original)

### 5.2. Gerador
- João, 45 anos, Belo Horizonte: 8 kWp instalado
- Excedente mensal: 600 kWh
- Vende na plataforma a R$ 0,75/kWh (5% abaixo da tarifa)
- Recebe 70% em PIX + 30% em KWATT (escolha)
- Renda extra: R$ 1.200/mês

### 5.3. Embaixador
- Carla, 28 anos, Recife: 5k seguidores no Instagram
- Indica 20 amigos no mês
- Cada signup: R$ 22,50 (15% de assinatura de R$ 150)
- Cashback recorrente: R$ 15/mês por amigo ativo
- Renda mensal: R$ 750 (sem teto)

---

## 6. Equipe e advisors

### 6.1. Equipe fundadora
- 4 fundadores com biografias detalhadas (a serem confirmadas)
- Experiência em: energia renovável, fintech, blockchain, growth
- Track record: projetos anteriores, empresas, exit

### 6.2. Advisors
- 5 advisors técnicos
- Especialidades: smart contracts, regulação BC/CVM, GTM, solar
- Compensação: tokens (5% supply) + equity (negociado individualmente)

### 6.3. Estrutura societária
- EnergiaLivre Tecnologia Ltda. (CNPJ XX.XXX.XXX/0001-XX)
- Sede: São Paulo, SP
- Capital social: R$ XXX.XXX,XX
- Sócios: nomes completos + CPFs

---

## 7. Roadmap

| Marco | Data | Status |
|---|---|---|
| Pré-venda + auditoria | Q2 2026 | Em andamento |
| Listagem DEX | Q3 2026 | Planejado |
| Staking v1 | Q4 2026 | Planejado |
| **Lançamento mainnet** | **05/01/2027** | **Crítico** |
| Pagamento de faturas on-chain | Q1 2027 | Pós-launch |
| Recargas via token | Q2 2027 | Pós-launch |
| DAO governance | Q3 2027 | Pós-launch |

---

## 8. Riscos

### 8.1. Riscos tecnológicos
- Bug em smart contract (mitigação: auditoria, bug bounty, pause)
- Oracle attack (mitigação: múltiplas fontes, fallback)
- Reorg chain (mitigação: Polygon finality ~2min)

### 8.2. Riscos regulatórios
- Classificação como security (mitigação: whitepaper, advogado, dialogue com CVM)
- Mudança na Lei 14.478/2022 (mitigação: compliance contínuo)
- Restrições geográficas (mitigação: geofencing, KYC por país)

### 8.3. Riscos de mercado
- Volatilidade (mitigação: utilidade real fixa o piso)
- Liquidez baixa (mitigação: pools incentivadas, listagem múltipla)
- Concorrência (mitigação: first-mover, comunidade, parcerias)

### 8.4. Riscos operacionais
- Equipe chave (mitigação: vesting 4 anos, documentar)
- Fornecedor único (mitigação: multi-provedor PIX, multi-cloud)
- Compliance (mitigação: advogado retainer, DPO interno)

---

## 9. Aspectos legais

### 9.1. Natureza jurídica
KWATT é **token de utilidade** (utility token) nos termos da Lei 14.478/2022, art. 3º, §1º:
> "Tokens de utilidade são ativos virtuais cuja principal finalidade é conferir ao seu titular acesso a um bem, serviço, produto ou benefício"

NÃO confere:
- Participação societária
- Direito a voto em assembleia
- Distribuição de lucros ou dividendos
- Expectativa de retorno financeiro

### 9.2. Compliance
- KYC leve para lifts > R$ 5.000
- KYC completo para lifts > R$ 50.000
- PLD/FTP conforme Lei 9.613/1998
- LGPD: dados pessoais criptografados, DPO nomeado
- Banco Central: PSP autorizada ou parceira de PSP

### 9.3. Disclaimer
Este whitepaper é meramente informativo e não constitui:
- Oferta de valores mobiliários
- Recomendação de investimento
- Garantia de retorno financeiro
- Assessoria jurídica, contábil ou tributária

Consulte sempre um profissional habilitado antes de tomar decisões financeiras.

---

## 10. Contato e governança

- **Site**: https://energialivre.dev.br
- **Email**: contato@energialivre.dev.br
- **Suporte**: suporte@energialivre.dev.br
- **GitHub**: github.com/Moritz636/EnergiaLivre
- **Twitter/X**: @energialivre
- **LinkedIn**: /company/energialivre
- **Discord**: discord.gg/energialivre (em breve)

---

## Anexo A — Especificações técnicas do contrato

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract KWATT is ERC20, ERC20Burnable, ERC20Pausable,
                  ERC20Permit, ERC20Votes, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    // ... (contrato completo em /contracts/contracts/KWATT.sol)
}
```

**Endereço de deploy (a confirmar)**:
- Polygon mainnet: TBD (a ser publicado 05/01/2027)
- Polygon Amoy: TBD (testnet)

---

## Anexo B — Glossário

- **ANEEL**: Agência Nacional de Energia Elétrica
- **APR**: Auto Produção Remota (modalidade de net metering)
- **CVM**: Comissão de Valores Mobiliários
- **DEX**: Decentralized Exchange
- **EIP**: Ethereum Improvement Proposal
- **ERC**: Ethereum Request for Comments
- **Geração distribuída**: Produção de energia próxima ao consumo
- **Net metering**: Sistema de compensação de energia
- **kWh**: Quilowatt-hora (unidade de energia)
- **Lei 14.300/2022**: Marco Legal da Microgeração e Minigeração Distribuída
- **Lei 14.478/2022**: Marco Legal Cripto no Brasil
- **PLD/FTP**: Prevenção à Lavagem de Dinheiro / Financiamento ao Terrorismo
- **PSP**: Provedor de Serviços de Pagamento
- **UFV**: Usina Fotovoltaica

---

## Anexo C — Referências

- ANEEL. "Sistemas de geração distribuída no Brasil". 2024.
- BloombergNEF. "New Energy Outlook 2024".
- COP28. "Global Stocktake". 2023.
- CVM. "Guia de Tokens de Utilidade". 2023.
- Lei 14.478/2022. "Marco Legal Cripto".
- Lei 14.300/2022. "Marco Legal da GD".

---

**Versão**: 0.1-rascunho
**Próxima atualização**: pós-auditoria externa
**Revisão legal**: pendente
