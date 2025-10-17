# 🌐 Sepolia Testnet Deployment Guide

## ✅ Pre-Deployment Checklist

Your project is already configured! Here's what you need to do:

### 1. ✅ Your Deployment Account
```
Address: 0xfC317770d1690f36DFb7b72852246006Ec7c1859
```

### 2. 💰 Get Sepolia ETH (Required!)

You MUST have Sepolia ETH in your deployment account. Get it from these faucets:

- **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
- **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
- **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

**How to get Sepolia ETH:**
1. Visit one of the faucets above
2. Enter your address: `0xfC317770d1690f36DFb7b72852246006Ec7c1859`
3. Complete any verification (some may require social login)
4. Wait for the ETH to arrive (usually 1-5 minutes)
5. You need at least **0.1 Sepolia ETH** for deployment

### 3. ✅ Verify Your Configuration

Your `.env` file is already configured with:
- ✅ Private Key
- ✅ Infura Project ID
- ✅ Etherscan API Key

---

## 🚀 Deployment Steps

### Step 1: Check Sepolia ETH Balance

First, verify you have enough Sepolia ETH:

```powershell
node -e "const { Web3 } = require('web3'); const web3 = new Web3('https://sepolia.infura.io/v3/f4d8acbe732245878e0c731cdfe250cc'); web3.eth.getBalance('0xfC317770d1690f36DFb7b72852246006Ec7c1859').then(balance => console.log('Balance:', web3.utils.fromWei(balance, 'ether'), 'SepoliaETH'));"
```

**Expected output:** Should show > 0.1 SepoliaETH

---

### Step 2: Compile Contracts

```powershell
npm run compile
```

**Expected output:**
```
Compiling your contracts...
===========================
> Compiling .\contracts\Voting.sol
> Artifacts written to ...\build\contracts
> Compiled successfully using:
   - solc: 0.8.19
```

---

### Step 3: Deploy to Sepolia

```powershell
npm run migrate:sepolia
```

**This will:**
- Connect to Sepolia via Infura
- Deploy the Voting contract
- Show deployment address and gas costs

**Expected output:**
```
Compiling your contracts...
===========================
Starting migrations...
======================
> Network name:    'sepolia'
> Network id:      11155111
> Block gas limit: 30000000 (0x1c9c380)

1_initial_migration.js
======================

   Deploying 'Voting'
   ------------------
   > transaction hash:    0x...
   > Blocks: 2            Seconds: 25
   > contract address:    0x... ← COPY THIS ADDRESS!
   > block number:        12345
   > block timestamp:     1234567890
   > account:             0xfC317770d1690f36DFb7b72852246006Ec7c1859
   > balance:             0.09... (slightly less than before)
   > gas used:            1234567 (0x...)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.02... ETH

   > Saving artifacts
   -------------------------------------
   > Total cost:          0.02... ETH

Summary
=======
> Total deployments:   1
> Final cost:          0.02... ETH
```

**⚠️ IMPORTANT:** Copy the **contract address** from the deployment output!

---

### Step 4: Update Frontend Configuration

After deployment, update the contract address in your frontend:

**File:** `frontend/js/contract.js`

**Line 26:** Replace this line:
```javascript
address: "replace with actual deployed contract address",
```

**With your new contract address:**
```javascript
address: "0xYourNewSepoliaContractAddress", // Deployed on Sepolia
```

---

### Step 5: Verify Contract on Etherscan (Optional but Recommended)

```powershell
npx truffle run verify Voting --network sepolia
```

**Expected output:**
```
Verifying Voting
Pass - Verified: https://sepolia.etherscan.io/address/0x...#code
Successfully verified 1 contract(s).
```

**Benefits:**
- Users can view your source code
- Increased trust and transparency
- Easier debugging

---

## 🌐 Configure MetaMask for Sepolia

### Add Sepolia Network to MetaMask

If Sepolia is not already in your MetaMask:

1. Open MetaMask
2. Click the network dropdown (top left)
3. Click "Add Network"
4. Enter these details:

```
Network Name:    Sepolia Testnet
New RPC URL:     https://sepolia.infura.io/v3/f4d8acbe732245878e0c731cdfe250cc
Chain ID:        11155111
Currency Symbol: SepoliaETH
Block Explorer:  https://sepolia.etherscan.io
```

5. Click "Save"

### Import Your Admin Account

To use the admin functions, import the deployment account into MetaMask:

1. Open MetaMask
2. Click the account icon (top right)
3. Select "Import Account"
4. Paste your private key: `0x3339d79c470929312c8ab402b24dc45ab6ad10054b97ab7f9abd1022b9712dd4`
5. Click "Import"

**⚠️ SECURITY WARNING:** This private key is now in your deployment guide. Consider generating a new one for production!

---

## 🧪 Testing Your Sepolia Deployment

### Step 1: Start Frontend

```powershell
# Method 1: VS Code Live Server
# Right-click frontend/index.html → "Open with Live Server"

# Method 2: npm script
npm run frontend
```

### Step 2: Connect to Sepolia

1. Open your browser to the frontend (e.g., http://localhost:3000)
2. Make sure MetaMask is set to **Sepolia Testnet**
3. Click "Connect Wallet"
4. Approve the connection in MetaMask

### Step 3: Test Admin Functions

As the admin account (0xfC317770d1690f36DFb7b72852246006Ec7c1859):

1. **Start Voting**
   - Click "Toggle Voting Status" button
   - Approve transaction in MetaMask
   - Wait for confirmation

2. **Add Candidates**
   - Enter candidate name (e.g., "Alice")
   - Click "Add Candidate"
   - Repeat for more candidates

3. **Register Voters**
   - Create new accounts in MetaMask or use existing ones
   - Copy voter addresses
   - Enter address in "Register Voter" field
   - Click "Register Voter"

### Step 4: Test Voting

Switch to a registered voter account:

1. Switch account in MetaMask
2. Refresh the page
3. Select a candidate
4. Click "Cast Vote"
5. Approve transaction
6. Wait for confirmation

### Step 5: View Results

1. Click "View Results"
2. See vote counts and winner
3. Verify on Etherscan:
   - Go to https://sepolia.etherscan.io
   - Search for your contract address
   - Click "Events" tab to see all votes

---

## 📊 Monitoring Your Contract

### View on Etherscan

**Your contract:** https://sepolia.etherscan.io/address/[YOUR_CONTRACT_ADDRESS]

**What you can see:**
- All transactions
- Contract code (after verification)
- Events emitted (votes cast, candidates added)
- Admin changes
- Current state

### Check Contract State

You can use Truffle console to check your contract:

```powershell
npx truffle console --network sepolia
```

Then run:
```javascript
let instance = await Voting.deployed()
let admin = await instance.admin()
console.log("Admin:", admin)

let stats = await instance.getElectionStats()
console.log("Stats:", stats)

let candidates = await instance.candidateCount()
console.log("Candidates:", candidates.toString())
```

---

## 🔧 Troubleshooting

### Problem: "Insufficient funds for gas"

**Solution:**
- Get more Sepolia ETH from faucets
- Your balance might be too low

### Problem: "Transaction timeout"

**Solution:**
- Sepolia can be slow during high traffic
- Increase timeout in truffle-config.js:
  ```javascript
  timeoutBlocks: 500,
  networkCheckTimeout: 10000000
  ```

### Problem: "Network ID mismatch"

**Solution:**
- Make sure MetaMask is on Sepolia (Chain ID: 11155111)
- Refresh the page after switching networks

### Problem: "Contract address not found"

**Solution:**
- Wait a few minutes after deployment
- Check transaction on Etherscan
- Verify contract was deployed successfully

### Problem: "Nonce too low"

**Solution:**
- Reset MetaMask account:
  - Settings → Advanced → Reset Account

---

## 📝 Important Notes

### Gas Costs

Typical gas costs on Sepolia:
- Deploy contract: ~0.02-0.05 SepoliaETH
- Register voter: ~0.0003-0.0006 SepoliaETH
- Add candidate: ~0.0005-0.001 SepoliaETH
- Cast vote: ~0.0003-0.0006 SepoliaETH

### Sepolia vs Mainnet

**Sepolia Testnet:**
- ✅ Free test ETH
- ✅ Same features as mainnet
- ✅ Safe for testing
- ❌ Can be slower
- ❌ May have occasional resets

**Ethereum Mainnet:**
- ✅ Permanent
- ✅ Fast and reliable
- ❌ Costs real money
- ❌ Irreversible mistakes

### Security Reminders

1. **NEVER** commit `.env` file to Git
2. **NEVER** share your private key
3. **NEVER** use testnet keys on mainnet
4. Use hardware wallet for mainnet deployment
5. Audit your contract before mainnet deployment

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Contract deployed successfully on Sepolia
- [ ] Contract address copied and saved
- [ ] Frontend updated with contract address
- [ ] Contract verified on Etherscan (optional)
- [ ] MetaMask configured for Sepolia
- [ ] Can connect wallet to frontend
- [ ] Admin functions work
- [ ] Can add candidates
- [ ] Can register voters
- [ ] Can cast votes
- [ ] Results display correctly
- [ ] All transactions visible on Etherscan

---

## 📚 Additional Resources

- **Sepolia Etherscan:** https://sepolia.etherscan.io
- **Infura Dashboard:** https://app.infura.io
- **MetaMask Support:** https://support.metamask.io
- **Truffle Docs:** https://trufflesuite.com/docs
- **Web3.js Docs:** https://web3js.readthedocs.io

---

## 🆘 Need Help?

If you encounter issues:

1. Check the console for error messages (F12 in browser)
2. Verify your transaction on Etherscan
3. Check Truffle console for contract state
4. Review this guide step-by-step
5. Check MetaMask network and account

---

**Good luck with your Sepolia deployment! 🚀**

*Remember: This is a testnet deployment. Always test thoroughly before considering mainnet deployment.*
