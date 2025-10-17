const fs = require('fs');
const path = require('path');

// Get contract address from build artifacts
const buildPath = path.join(__dirname, 'build', 'contracts', 'Voting.json');
const contractPath = path.join(__dirname, 'frontend', 'js', 'contract.js');

try {
    // Read the build artifact
    const buildData = JSON.parse(fs.readFileSync(buildPath, 'utf8'));
    
    // Get Sepolia network ID (11155111)
    const sepoliaNetworkId = '11155111';
    
    if (!buildData.networks || !buildData.networks[sepoliaNetworkId]) {
        console.log('❌ Contract not deployed on Sepolia yet!');
        console.log('   Please run: npm run migrate:sepolia\n');
        process.exit(1);
    }
    
    const contractAddress = buildData.networks[sepoliaNetworkId].address;
    
    console.log('\n🔍 Found Sepolia Deployment:\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📍 Contract Address:', contractAddress);
    console.log('🌐 Network: Sepolia Testnet (ID: 11155111)');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Read the contract.js file
    let contractJs = fs.readFileSync(contractPath, 'utf8');
    
    // Replace the contract address
    const oldPattern = /address: ["']([^"']+)["'],\s*\/\/ Deployed contract address/;
    const newLine = `address: "${contractAddress}", // Deployed on Sepolia - ${new Date().toISOString()}`;
    
    if (contractJs.match(oldPattern)) {
        contractJs = contractJs.replace(oldPattern, newLine);
    } else {
        // Try alternative pattern
        const altPattern = /address: ["']([^"']+)["'],/;
        contractJs = contractJs.replace(altPattern, newLine + ',');
    }
    
    // Write back the file
    fs.writeFileSync(contractPath, contractJs, 'utf8');
    
    console.log('✅ Frontend updated successfully!\n');
    console.log('📝 File updated: frontend/js/contract.js');
    console.log('📍 New address:', contractAddress);
    console.log('\n🔗 View on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}\n`);
    console.log('🎉 You can now start your frontend and test on Sepolia!\n');
    console.log('Next steps:');
    console.log('   1. npm run frontend  (or use VS Code Live Server)');
    console.log('   2. Open browser and connect MetaMask');
    console.log('   3. Make sure MetaMask is on Sepolia network');
    console.log('   4. Start testing!\n');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ENOENT') {
        console.log('\n💡 File not found. Make sure you have:');
        console.log('   1. Compiled contracts: npm run compile');
        console.log('   2. Deployed to Sepolia: npm run migrate:sepolia\n');
    }
}
