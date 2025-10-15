# 🗳️ Voting DApp - Complete Running Guide

This guide provides complete instructions for running the Voting DApp on both **Ganache (Local Development)** and **Sepolia Testnet**.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Local Development with Ganache](#local-development-with-ganache)
4. [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
5. [Frontend Setup](#frontend-setup)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)
8. [Project Structure](#project-structure)

---

## 🔧 Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **MetaMask** browser extension - [Install](https://metamask.io/)

### Development Tools
- **Ganache** - [Download](https://trufflesuite.com/ganache/) (GUI version recommended)
- **Visual Studio Code** - [Download](https://code.visualstudio.com/) (optional but recommended)

### Accounts Needed
- **Sepolia ETH** for testnet deployment - Get from [Sepolia Faucet](https://sepoliafaucet.com/)
- **Infura Account** for Sepolia connection - [Sign up](https://infura.io/)

---

## 🛠️ Project Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd DApp1

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Sepolia Deployment Configuration
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Use mnemonic instead of private key
# MNEMONIC=your twelve word mnemonic phrase here
```

⚠️ **Security Warning**: Never commit the `.env` file to version control!

---

## 🏠 Local Development with Ganache

### Step 1: Start Ganache

#### Option A: Ganache GUI (Recommended)
1. Open Ganache application
2. Click "New Workspace" or "Quickstart"
3. Configure settings:
   - **Network ID**: `1337` (or any consistent value)
   - **RPC Server**: `http://127.0.0.1:8545`
   - **Gas Limit**: `6721975`
   - **Gas Price**: `20000000000` (20 gwei)

#### Option B: Ganache CLI
```bash
# Install Ganache CLI globally
npm install -g ganache-cli

# Start Ganache with deterministic accounts
ganache --deterministic --accounts 10 --host 0.0.0.0 --port 8545
```

### Step 2: Deploy Contract to Ganache

```bash
# Compile the smart contract
npm run compile

# Deploy to local Ganache network
npm run migrate:development

# Alternative: Reset and redeploy
npx truffle migrate --reset --network development
```

### Step 3: Get Deployment Information

After successful deployment, note down:
- **Contract Address**: (displayed in terminal)
- **Admin Address**: (first account from Ganache)
- **Network ID**: (from Ganache settings)

### Step 4: Configure Frontend

Update the contract address in `frontend/js/contract.js`:

```javascript
const CONTRACT_CONFIG = {
    address: "YOUR_DEPLOYED_CONTRACT_ADDRESS", // Replace with actual address
    abi: null,
    // ... rest of config
};
```

---

## 🌐 Sepolia Testnet Deployment

### Step 1: Prepare for Testnet

1. **Get Sepolia ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request testnet ETH for your deployment account

2. **Set up Infura**:
   - Create account at [Infura.io](https://infura.io/)
   - Create new project
   - Copy Project ID to `.env` file

3. **Configure Environment**:
   - Add your private key to `.env`
   - Ensure you have Sepolia ETH in your account

### Step 2: Deploy to Sepolia

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia testnet
npm run migrate:sepolia

# Alternative: Direct truffle command
npx truffle migrate --network sepolia
```

### Step 3: Verify Contract (Optional)

```bash
# Verify contract on Etherscan
npx truffle run verify Voting --network sepolia
```

### Step 4: Update Frontend Configuration

1. Update contract address in `frontend/js/contract.js`
2. Update network configuration for Sepolia:

```javascript
const CONTRACT_CONFIG = {
    address: "YOUR_SEPOLIA_CONTRACT_ADDRESS",
    networks: {
        sepolia: {
            networkId: 11155111,
            name: 'Sepolia Testnet',
            rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'
        }
    }
};
```

---

## 🎨 Frontend Setup

### Method 1: Visual Studio Code Live Server (Recommended)

1. **Install Live Server Extension**:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search "Live Server"
   - Install

2. **Start Live Server**:
   - Open `frontend/index.html` in VS Code
   - Right-click → "Open with Live Server"
   - Application opens at `http://127.0.0.1:5500`

### Method 2: Python HTTP Server (Fallback)

```bash
# Navigate to frontend directory
cd frontend

# Python 3.x
python -m http.server 3000

# Python 2.x (legacy)
python -m SimpleHTTPServer 3000

# Access at http://localhost:3000
```

### Method 3: Node.js HTTP Server

```bash
# Install http-server globally
npm install -g http-server

# Start server in frontend directory
cd frontend
http-server -p 3000 -c-1

# Access at http://localhost:3000
```

### Method 4: npm Script (Built-in)

```bash
# Use the npm script (from project root)
npm run frontend
```

---

## 🧪 Testing Guide

### MetaMask Configuration

#### For Ganache (Local):
- **Network Name**: `Local Ganache`
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `1337`
- **Currency Symbol**: `ETH`

#### For Sepolia Testnet:
- **Network Name**: `Sepolia Testnet`
- **RPC URL**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- **Chain ID**: `11155111`
- **Currency Symbol**: `SepoliaETH`

### Import Test Accounts

#### Ganache Accounts:
1. Open Ganache
2. Copy private keys from the accounts tab
3. Import into MetaMask:
   - **Admin Account**: First account (index 0)
   - **Voter Accounts**: Subsequent accounts

#### Sepolia Accounts:
1. Create new accounts in MetaMask
2. Fund with Sepolia ETH from faucet
3. Deploy contract with admin account
4. Register voter accounts using admin functions

### Testing Scenarios

#### 1. Admin Functions Test
```bash
# Connect as admin account
# Test each admin function:
- Register new voters
- Add candidates
- Toggle voting status
- Transfer admin rights (careful!)
```

#### 2. Voting Process Test
```bash
# Connect as registered voter
# Test voting flow:
- View candidates
- Select candidate
- Submit vote
- Verify vote was recorded
- Try voting again (should fail)
```

#### 3. Results Verification
```bash
# Test results display:
- View real-time vote counts
- Check winner determination
- Verify vote percentages
- Test results refresh
```

#### 4. Access Control Test
```bash
# Test security:
- Try admin functions with non-admin account
- Try voting with unregistered account
- Try double voting
- Test voting when inactive
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Contract Not Found
```bash
# Solution: Check contract address and network
- Verify contract address in frontend/js/contract.js
- Ensure MetaMask is on correct network
- Redeploy if necessary: truffle migrate --reset
```

#### MetaMask Connection Issues
```bash
# Solutions:
- Clear browser cache
- Reset MetaMask account (Settings > Advanced > Reset Account)
- Check network configuration
- Ensure MetaMask is unlocked
```

#### Transaction Failures
```bash
# Common causes and solutions:
- Insufficient gas: Increase gas limit
- Insufficient funds: Add more ETH
- Wrong network: Switch to correct network
- Contract not deployed: Verify deployment
```

#### Frontend Loading Issues
```bash
# Solutions:
- Check console for JavaScript errors
- Verify all files are present
- Clear browser cache
- Try different HTTP server method
```

### Debug Commands

#### Check Contract Deployment
```bash
# Using Truffle console
npx truffle console --network development
> let instance = await Voting.deployed()
> let admin = await instance.admin()
> console.log("Admin:", admin)
```

#### View Network Information
```bash
# Check deployed networks
npx truffle networks
```

#### Reset and Redeploy
```bash
# Clean reset (removes all previous deployments)
npx truffle migrate --reset --network development
```

---

## 📁 Project Structure

```
DApp1/
├── contracts/              # Smart contracts
│   └── Voting.sol         # Main voting contract
├── migrations/            # Deployment scripts
│   └── 2_deploy_contracts.js
├── test/                  # Contract tests
│   └── voting.test.js
├── build/                 # Compiled contracts (auto-generated)
│   └── contracts/
│       └── Voting.json    # Contract ABI and bytecode
├── frontend/              # Web interface
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── styles.css     # Styling
│   └── js/                # JavaScript modules
│       ├── app.js         # Main application
│       ├── contract.js    # Web3 integration
│       ├── contractAPI.js # Contract interaction
│       ├── ui.js          # UI management
│       ├── voting.js      # Voting functionality
│       ├── admin.js       # Admin functions
│       └── test.js        # Debug utilities
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
├── package.json          # Node.js dependencies
├── truffle-config.js     # Truffle configuration
└── RUN.md                # This file
```

---

## 🚀 Quick Start Summary

### For Local Development (Ganache):
```bash
# 1. Start Ganache
# 2. Deploy contract
npm run migrate:development

# 3. Update contract address in frontend/js/contract.js
# 4. Start frontend (VS Code Live Server recommended)
# 5. Configure MetaMask for local network
# 6. Import Ganache accounts and test!
```

### For Sepolia Testnet:
```bash
# 1. Set up .env with keys and Infura ID
# 2. Get Sepolia ETH from faucet
# 3. Deploy contract
npm run migrate:sepolia

# 4. Update contract address in frontend
# 5. Configure MetaMask for Sepolia
# 6. Test with Sepolia accounts
```

---

## 📞 Support

If you encounter issues:

1. **Check the console** for error messages
2. **Verify network configuration** in MetaMask
3. **Ensure contract is deployed** correctly
4. **Check account balances** for sufficient ETH
5. **Review this documentation** for missed steps

---

## 🎉 Success!

Your Voting DApp is now ready to run! This decentralized application demonstrates:

- ✅ **Secure blockchain-based voting**
- ✅ **Admin-controlled voter registration**
- ✅ **Transparent, immutable results**
- ✅ **Modern web interface**
- ✅ **Real-time updates**
- ✅ **Complete audit trail**

**Happy Voting! 🗳️**