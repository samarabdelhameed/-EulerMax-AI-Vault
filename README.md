# EulerMax AI Vault

**EulerMax AI Vault** is an advanced decentralized vault protocol that integrates smart automation, AI-powered risk optimization, and EIP-4337 Passkey wallets. Built on top of the [EulerSwap](https://docs.euler.finance/) ecosystem, this project allows users to deploy delta-neutral strategies, manage risk, and access AI-guided portfolio insights—all in one modular and composable system.

---

## 🔍 Problem Statement

Managing leverage, portfolio risk, and optimal yield in DeFi protocols is often complex, manual, and error-prone. Most retail users lack the tools to make data-driven decisions or avoid liquidation risks effectively.

---

## ✅ Our Solution

EulerMax combines:

- 🔐 **EIP-4337 Smart Account + Passkey** wallet for secure and user-friendly UX.
- 🤖 **MCP AI Agent** for personalized portfolio analysis & recommendations.
- 📈 **Delta Neutral Strategy Vault** for maximizing yield with minimal risk.
- 🔁 **Automated Swap + Leverage Management** via EulerSwap EVC batches.
- 🧠 **Risk Oracle** for real-time health & liquidation predictions.

---

## 🧠 Architecture Diagram

```

```

            +---------------------------+
            |      Frontend (Astro)     |
            +-------------+-------------+
                          |
                Calls unified API
                          |
      +------------------+---------------------+
      |          SDK (api.ts)                  |
      +------------------+---------------------+
                          |
               REST API (Node.js + Express)
                          |

+-----------------------+------------------------+
| | |

```

MongoDB (Users, Vaults)   Smart Contracts         MCP Agent (AI)
(Foundry + Solidity)   (Advisor on risk)

```

---

## 🔗 Smart Contracts

| Contract                   | Description                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| `EulerMaxVault.sol`        | Main vault handling deposits, withdrawals, and strategy allocation |
| `DeltaNeutralStrategy.sol` | Balances long/short exposure using EulerSwap                       |
| `RiskOracle.sol`           | On-chain risk score and liquidation prediction                     |
| `SmartAccount.sol`         | EIP-4337 abstract account                                          |
| `PasskeyVerifier.sol`      | Verifies WebAuthn passkey signatures                               |
| `WalletFactory.sol`        | Creates smart accounts                                             |
| `EntryPoint.sol`           | Central contract for bundler entry in 4337                         |

---

## 🤖 MCP Agent

The AI agent uses:

- 🧠 Trained prompts (`prompts/advisor.txt`)
- 📊 Real-time data (`memory/userPortfolio.json`)
- 💬 Provides actionable advice like:
  > “You're nearing liquidation risk, consider reducing your ETH leverage.”

---

## 🚀 Running Locally

```bash
# 1. Install backend
cd backend
npm install
node server.js

# 2. Deploy contracts using Foundry
forge install
forge build
forge test

# 3. Run frontend
cd frontend
bun install
bun dev

# 4. Run MCP AI Agent
cd mcp-agent
node server.js
```

---

## 📦 Project Structure

```
eulermax-ai-vault/
├── contracts/
│   ├── aa-wallet/
│   ├── EulerMaxVault.sol
│   ├── DeltaNeutralStrategy.sol
│   └── RiskOracle.sol
├── backend/
├── frontend/
├── mcp-agent/
├── sdk/
├── test/
├── scripts/
└── README.md
```

---

## 📽 Demo

> 🎥 Coming soon — [demo.mp4](./demo.mp4)

---

## 🛡 Security

- Uses a **verified swapper + swapVerifier** pattern from Euler
- EIP-4337 abstract accounts reduce private key exposure
- MCP Agent is stateless and sanitized against prompt injection

---

## 🏆 Built for

**Euler x Encode Hackathon 2025**
Integrates full stack AI + DeFi + Account Abstraction

---

## 🤝 Contributing

PRs and forks are welcome. Please submit issues or improvements.

---

## 📬 Contact

For inquiries or collaboration:

- 🧑‍💻 Samar Abdelhameed (Blockchain Engineer)

```

```
