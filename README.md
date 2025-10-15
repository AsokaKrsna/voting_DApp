#  Voting DApp

A secure, transparent, and decentralized voting application built on Ethereum blockchain using Truffle, Solidity, and Web3.js.

##  Project Status: Complete & Production Ready

 **Fully Functional** - All features implemented and tested  
 **Deployed & Verified** - Working on both Ganache and testnet  
 **Professionally Documented** - Comprehensive guides available  
 **Clean Architecture** - Well-organized, maintainable codebase  

##  Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Ganache (or use Ganache GUI)
npx ganache-cli

# 3. Deploy contracts
npm run migrate:development

# 4. Start frontend
npm run frontend
# Or use VS Code Live Server extension
```

** Complete setup guide:** **[docs/RUN.md](./docs/RUN.md)**

##  Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Ganache (for local development)

##  Core Features

-  **Secure Voter Registration** - Admin-controlled registration
-  **Double Voting Prevention** - Blockchain-enforced one-vote-per-address
-  **Real-time Results** - Transparent, live vote counting
-  **Candidate Management** - Dynamic candidate addition
-  **MetaMask Integration** - Seamless wallet connection
-  **Multi-Network Support** - Ganache, Sepolia testnet ready

##  Testing

```bash
npm test                    # Run all tests
npm run compile             # Compile contracts
npm run migrate:sepolia     # Deploy to Sepolia testnet
```

##  Documentation

**Complete guides available in `/docs` folder:**

| Document | Purpose |
|----------|---------|
| **[RUN.md](./docs/RUN.md)** | Complete setup & deployment guide |
| **[TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** | Testing procedures |
| **[SECURITY_ANALYSIS.md](./docs/SECURITY_ANALYSIS.md)** | Security & threat analysis |
| **[DESIGN_DECISIONS.md](./docs/DESIGN_DECISIONS.md)** | Architecture rationale |

** Full documentation index:** **[docs/README.md](./docs/README.md)**

##  Security Note

This DApp prioritizes **security and transparency** for educational and controlled voting environments. For production use, conduct thorough security audits and consider additional privacy features.

##  License

MIT License - see [LICENSE](LICENSE) file for details.

---

** Educational Project:** Designed for learning blockchain development and controlled voting scenarios. Please check before using in professional environment as any flaw may lead to financial loss.