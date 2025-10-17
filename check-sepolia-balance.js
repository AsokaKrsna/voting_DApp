const { Web3 } = require('web3');
require('dotenv').config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const DEPLOYMENT_ADDRESS = '0xfC317770d1690f36DFb7b72852246006Ec7c1859';

async function checkSepoliaBalance() {
    console.log('\n🔍 Checking Sepolia Balance...\n');
    console.log('═══════════════════════════════════════════════════════════');
    
    try {
        const web3 = new Web3(`https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`);
        
        // Get balance
        const balanceWei = await web3.eth.getBalance(DEPLOYMENT_ADDRESS);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        
        console.log('📍 Deployment Address:', DEPLOYMENT_ADDRESS);
        console.log('💰 Current Balance:', balanceEth, 'SepoliaETH');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Check if sufficient balance
        const minRequired = 0.05;
        if (parseFloat(balanceEth) < minRequired) {
            console.log('⚠️  WARNING: Low Balance!');
            console.log(`   You need at least ${minRequired} SepoliaETH for deployment.`);
            console.log('   Current balance:', balanceEth, 'SepoliaETH\n');
            console.log('🚰 Get Sepolia ETH from these faucets:');
            console.log('   - https://sepoliafaucet.com/');
            console.log('   - https://www.infura.io/faucet/sepolia');
            console.log('   - https://faucet.quicknode.com/ethereum/sepolia');
            console.log('   - https://faucets.chain.link/sepolia\n');
            return false;
        } else {
            console.log('✅ Balance is sufficient for deployment!');
            console.log('   You can proceed with: npm run migrate:sepolia\n');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
        console.log('\n💡 Possible issues:');
        console.log('   - Check your internet connection');
        console.log('   - Verify INFURA_PROJECT_ID in .env file');
        console.log('   - Ensure you have npm packages installed\n');
        return false;
    }
}

// Run the check
checkSepoliaBalance();
