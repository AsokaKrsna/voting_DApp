/**
 * Quick Test Script for Voting DApp
 * Run this in browser console after connecting to verify everything works
 */

async function quickTest() {
    console.log('🧪 Starting Voting DApp Quick Test...');
    
    try {
        // Test 1: Check Web3 and MetaMask
        console.log('1️⃣ Testing Web3 connection...');
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not detected');
        }
        console.log('✅ MetaMask detected');
        
        // Test 2: Check contract loading
        console.log('2️⃣ Testing contract loading...');
        if (!window.contractAPI || !window.contractAPI.web3Manager) {
            throw new Error('Contract API not loaded');
        }
        console.log('✅ Contract API loaded');
        
        // Test 3: Get election stats
        console.log('3️⃣ Testing contract communication...');
        const stats = await window.contractAPI.getElectionStats();
        if (stats) {
            console.log('✅ Contract communication successful');
            console.log('📊 Election Stats:', stats);
        } else {
            throw new Error('Failed to get election stats');
        }
        
        // Test 4: Get candidates
        console.log('4️⃣ Testing candidate retrieval...');
        const candidates = await window.contractAPI.getCandidates();
        console.log('✅ Candidates retrieved:', candidates);
        
        // Test 5: Check admin status
        console.log('5️⃣ Testing admin detection...');
        const isAdmin = await window.contractAPI.web3Manager.isAdmin();
        console.log('✅ Admin status:', isAdmin);
        
        console.log('🎉 All tests passed! Your DApp is ready to use.');
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

// Export for global use
window.quickTest = quickTest;

console.log('🧪 Quick test function loaded. Run quickTest() in console after connecting wallet.');