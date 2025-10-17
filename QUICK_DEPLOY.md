# 🚀 Quick Sepolia Deployment - Step by Step

## ✅ You're Ready to Deploy!

Your account has **0.0795 Sepolia ETH** - sufficient for deployment!

---

## 📋 Deployment Steps (Copy-Paste Commands)

### Step 1: Deploy to Sepolia

Run this single command to compile, deploy, and update frontend:

```powershell
npm run sepolia:deploy
```

**What this does:**
1. ✅ Compiles your Voting.sol contract
2. ✅ Deploys to Sepolia testnet
3. ✅ Automatically updates frontend with contract address

**Expected time:** 1-3 minutes

---

### Step 2: Verify on Etherscan (Optional but Recommended)

```powershell
npm run verify:sepolia
```

**This makes your code public and verifiable.**

---

### Step 3: Start Frontend

```powershell
npm run frontend
```

**Or use VS Code Live Server:**
- Right-click `frontend/index.html`
- Select "Open with Live Server"

---

## 🌐 Configure MetaMask

### Add Sepolia Network (if not already added)

1. Open MetaMask
2. Click network dropdown (top)
3. Click "Add network" → "Add network manually"
4. Enter these details:

```
Network name:    Sepolia Testnet
RPC URL:         https://sepolia.infura.io/v3/f4d8acbe732245878e0c731cdfe250cc
Chain ID:        11155111
Currency symbol: SepoliaETH
Block explorer:  https://sepolia.etherscan.io
```

### Import Admin Account

**Your admin address:** `0xfC317770d1690f36DFb7b72852246006Ec7c1859`

To use admin functions:
1. MetaMask → Click account icon (top right)
2. "Import Account"
3. Paste private key: `0x3339d79c470929312c8ab402b24dc45ab6ad10054b97ab7f9abd1022b9712dd4`
4. Click "Import"

⚠️ **Security Note:** This key is in your config. For production, generate a new one!

---

## 🧪 Test Your DApp

### 1. Connect Wallet
- Open frontend in browser
- Make sure MetaMask is on **Sepolia** network
- Click "Connect Wallet"
- Approve in MetaMask

### 2. Admin Actions (with admin account)
- Toggle Voting (to activate)
- Add candidates (e.g., "Alice", "Bob", "Charlie")
- Register voter addresses

### 3. Vote (with registered voters)
- Switch to different MetaMask account
- Refresh page
- Select candidate
- Click "Cast Vote"
- Approve transaction

### 4. View Results
- Click "View Results"
- See real-time vote counts
- Check Etherscan for transaction history

---

## 🔗 Useful Links After Deployment

Your contract will be at:
```
https://sepolia.etherscan.io/address/[YOUR_CONTRACT_ADDRESS]
```

**Sepolia Faucets** (if you need more ETH):
- https://sepoliafaucet.com/
- https://www.infura.io/faucet/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

---

## 🆘 Troubleshooting

### If deployment fails:

**Check balance:**
```powershell
npm run sepolia:check
```

**View account address:**
```powershell
npm run get-address
```

**Reset and redeploy:**
```powershell
npm run clean
npm run sepolia:deploy
```

### Common Issues:

**"Insufficient funds"**
- Get more Sepolia ETH from faucets
- Wait 5-10 minutes for faucet ETH to arrive

**"Network timeout"**
- Sepolia can be slow, just wait
- Try again in a few minutes

**"Contract not found"**
- Wait 1-2 minutes after deployment
- Transaction might still be pending

**"MetaMask connection failed"**
- Make sure MetaMask is unlocked
- Check you're on Sepolia network
- Refresh the browser

---

## ✅ Success Checklist

After deployment:

- [ ] Contract deployed (check terminal output)
- [ ] Contract address saved
- [ ] Frontend updated automatically
- [ ] MetaMask configured for Sepolia
- [ ] Can connect wallet to frontend
- [ ] Admin functions work (toggle, add candidate, register)
- [ ] Can cast votes
- [ ] Results display correctly
- [ ] Transactions visible on Etherscan

---

## 📊 Helpful Commands

```powershell
# Check your Sepolia balance
npm run sepolia:check

# Get your deployment address
npm run get-address

# Full deployment (compile + migrate + update)
npm run sepolia:deploy

# Just compile
npm run compile

# Just migrate
npm run migrate:sepolia

# Update frontend with address
npm run sepolia:update

# Verify on Etherscan
npm run verify:sepolia

# Start frontend
npm run frontend

# View networks
npm run networks
```

---

## 🎯 Quick Deploy (TL;DR)

```powershell
# 1. Deploy everything
npm run sepolia:deploy

# 2. Start frontend
npm run frontend

# 3. Open browser, connect MetaMask (Sepolia network)

# 4. Start testing!
```

---

## 📚 Full Documentation

For detailed guide, see: **SEPOLIA_DEPLOYMENT_GUIDE.md**

---

**Ready to deploy? Run: `npm run sepolia:deploy`**

🚀 Good luck!
