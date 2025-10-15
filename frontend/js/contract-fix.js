// Backup: Simplified contract loader
window.loadContractSimple = async function() {
    try {
        console.log('🔧 Loading contract with simplified method...');
        
        // Load ABI
        const response = await fetch('../build/contracts/Voting.json');
        const contractData = await response.json();
        
        // Create contract instance
        const contract = new web3Manager.web3.eth.Contract(
            contractData.abi,
            "0x9b1f7F645351AF3631a656421eD2e40f2802E6c0"
        );
        
        // Test it
        const admin = await contract.methods.admin().call();
        console.log('✅ Contract working! Admin:', admin);
        
        // Set it globally
        web3Manager.contract = contract;
        return true;
        
    } catch (error) {
        console.error('❌ Simple contract loading failed:', error);
        return false;
    }
};

console.log('📄 Simple contract loader ready');