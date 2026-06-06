# Contracts — EnergiaLivre KWATT

Smart contracts do token utilitário **KWATT** rodando em **Polygon PoS** (chain ID 137) e testnet **Amoy** (chain ID 80002).

> **Conformidade legal**: Token utilitário (não-security) conforme Lei 14.478/2022 e Lei 14.300/2022.
> 1 KWATT = 30% de 1 kWh de energia compensada (R$ 0,285 de valor base em 06/2026).
> Sem promessa de valorização, sem mecanismo de staking, sem direito a dividendos.
> Única função: resgate de energia + cashback em recargas.

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Linguagem | Solidity | 0.8.24 |
| Framework | Hardhat | 2.22.x |
| Contracts | OpenZeppelin Contracts | 5.0.x |
| Tests | Mocha + Chai + Ethers v6 | latest |
| Fuzzing | Hardhat built-in (2.22+) + Echidna | opcional |
| Static analysis | Slither | opcional |
| Symbolic | Mythril | opcional |
| Lint | Solhint | 5.0.x |
| Coverage | solidity-coverage | 0.8.x |
| Network | Polygon PoS (137) / Amoy (80002) | — |

## Estrutura

```
contracts/
├── contracts/
│   ├── KWATT.sol              # ← COLAR SEU CONTRATO AQUI
│   └── interfaces/
│       └── IKWATT.sol         # interface publica
├── test/
│   ├── KWATT.test.ts          # ← testes serao gerados a partir do seu contrato
│   └── helpers/
│       └── deploy.ts
├── deploy/
│   ├── 01_deploy_kwatt.ts     # deploy generico (pega do .env)
│   ├── polygon-amoy.ts        # testnet
│   └── polygon-mainnet.ts     # mainnet
├── scripts/
│   └── verify.ts              # verifica no Polygonscan
├── audit/
│   ├── CHECKLIST.md           # ← auditoria sera aplicada com base nisso
│   ├── REPORT-TEMPLATE.md     # ← relatorio de auditoria
│   ├── SLITHER.md             # como rodar Slither
│   ├── ECHIDNA.md             # como rodar Echidna (fuzzing)
│   ├── MYTHRIL.md             # como rodar Mythril (symbolic execution)
│   └── SECURITY-PATTERNS.md   # armadilhas comuns ERC-20
├── hardhat.config.ts
├── package.json
├── tsconfig.json
├── .solhint.json
└── .env.example
```

## Quick start

```bash
cd contracts
cp env.example .env
# preencha .env com sua PRIVATE_KEY e POLYGONSCAN_API_KEY
npm install
npm run compile
npm run test          # roda a suite de testes
npm run test:gas      # report de gas usage
npm run lint          # solhint
npm run slither       # analise estatica (requer Python + solc-select)
```

## Deploy

```bash
# testnet Amoy (gas fake, ideal para testes finais)
npm run deploy:amoy
npm run verify:amoy

# mainnet Polygon (gas real, MATIC)
npm run deploy:polygon
npm run verify:polygon
```

## Workflow de auditoria interna (P0)

1. **Compilação limpa** — `npm run compile` sem warnings
2. **Lint** — `npm run lint` sem erros
3. **Suite de testes** — 100% passando, >95% coverage
4. **Slither** — sem high/medium findings
5. **Echidna fuzzing** — 0 invariants violados em 50k runs
6. **Mythril** — sem SWC IDs críticos (reentrancy, tx.origin, integer overflow)
7. **Review manual** contra `audit/CHECKLIST.md`
8. **Relatório final** em `audit/REPORT-TEMPLATE.md`

## Próximas auditorias externas (P1)

- [ ] OpenZeppelin Defender (grátis para projetos open-source)
- [ ] CertiK (pago, US$ 5-15k, reconhecidíssimo no mercado)
- [ ] Quantstamp / Trail of Bits (enterprise grade)
- [ ] SlowMist (China + LATAM)
