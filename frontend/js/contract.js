/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CONTRACT INTERACTION MODULE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Direct smart contract interaction
 * WHY: Maximum transparency, no intermediary, users see exact transactions
 * TRADE-OFF: Technical complexity for users vs transparency
 * SECURITY: Users can verify every transaction before signing
 * 
 * This module handles all blockchain interactions including:
 * - Web3 initialization and MetaMask connection
 * - Smart contract loading and instantiation
 * - Network detection and validation
 * - Error handling and user feedback
 */

// Contract configuration
const CONTRACT_CONFIG = {
    // Updated with newly deployed contract address
    address: "replace with actual deployed contract address", // Deployed contract address
    abi: null,     // Will be loaded from build artifacts
    
    // Network configurations
    networks: {
        development: {
            networkId: '*',
            name: 'Local Development',
            rpcUrl: 'http://127.0.0.1:8545'
        },
        sepolia: {
            networkId: 11155111,
            name: 'Sepolia Testnet',
            rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'
        }
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * WEB3 AND METAMASK INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: MetaMask integration
 * WHY: Most popular Ethereum wallet, good user experience
 * TRADE-OFF: Wallet dependency vs user convenience
 * SECURITY: Relies on MetaMask's security model
 * ALTERNATIVE: WalletConnect, built-in wallet (more complex)
 */
class Web3Manager {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.networkId = null;
        this.contract = null;
        this.isConnected = false;
    }
    
    /**
     * Initialize Web3 and detect MetaMask
     * WHY: Check for wallet availability before attempting connection
     * ERROR HANDLING: Graceful fallback if MetaMask not available
     */
    async init() {
        console.log('🔍 Starting Web3 initialization...');
        
        try {
            // Check if Web3 is available
            if (typeof Web3 === 'undefined') {
                console.error('❌ Web3 library not loaded');
                alert('Web3 library not loaded. Please refresh the page.');
                return false;
            }
            
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                console.error('❌ MetaMask not detected');
                alert('MetaMask Required: Please install MetaMask to use this DApp. Visit https://metamask.io');
                return false;
            }
            
            console.log('✅ MetaMask detected, initializing Web3...');
            this.web3 = new Web3(window.ethereum);
            console.log('✅ Web3 initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Web3 initialization failed:', error);
            alert('Connection Error: Failed to initialize Web3: ' + error.message);
            return false;
        }
    }
    
    /**
     * Connect to MetaMask wallet
     * SECURITY: Request explicit user permission for account access
     * USER EXPERIENCE: Handle user rejection gracefully
     */
    async connect() {
        try {
            if (!this.web3) {
                throw new Error('Web3 not initialized');
            }
            
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts available');
            }
            
            this.account = accounts[0];
            this.networkId = await this.web3.eth.net.getId();
            this.isConnected = true;
            
            console.log('✅ Connected to account:', this.account);
            console.log('✅ Network ID:', this.networkId);
            
            // Set up event listeners for account/network changes
            this.setupEventListeners();
            
            return true;
            
        } catch (error) {
            console.error('❌ Connection failed:', error);
            
            if (error.code === 4001) {
                showModal('Connection Rejected', 'Please connect your wallet to use the DApp.');
            } else {
                showModal('Connection Error', 'Failed to connect to wallet: ' + error.message);
            }
            
            return false;
        }
    }
    
    /**
     * Set up event listeners for wallet changes
     * WHY: Respond to user switching accounts or networks
     * USER EXPERIENCE: Automatic updates when wallet state changes
     */
    setupEventListeners() {
        // Account change listener
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // User disconnected wallet
                this.disconnect();
            } else {
                // User switched accounts
                this.account = accounts[0];
                console.log('🔄 Account changed to:', this.account);
                updateUI();
            }
        });
        
        // Network change listener
        window.ethereum.on('chainChanged', (chainId) => {
            // Reload page on network change to avoid issues
            console.log('🔄 Network changed to:', chainId);
            window.location.reload();
        });
    }
    
    /**
     * Disconnect from wallet
     * CLEANUP: Reset all connection state
     */
    disconnect() {
        this.account = null;
        this.isConnected = false;
        this.contract = null;
        console.log('🔌 Disconnected from wallet');
        updateUI();
    }
    
    /**
     * Load and instantiate the voting contract
     * DESIGN DECISION: Load ABI from build artifacts
     * WHY: Ensures ABI matches deployed contract
     * ALTERNATIVE: Hardcode ABI (less maintainable)
     */
    async loadContract() {
        try {
            // Load contract ABI from build artifacts
            const response = await fetch('../build/contracts/Voting.json');
            const contractData = await response.json();
            
            CONTRACT_CONFIG.abi = contractData.abi;
            
            // Use the fixed contract address (already set in CONTRACT_CONFIG)
            console.log('📋 Using contract address:', CONTRACT_CONFIG.address);
            
            // Create contract instance
            this.contract = new this.web3.eth.Contract(
                CONTRACT_CONFIG.abi,
                CONTRACT_CONFIG.address
            );
            
            // Test contract by calling a simple method
            try {
                const admin = await this.contract.methods.admin().call();
                console.log('✅ Contract loaded successfully. Admin:', admin);
                return true;
            } catch (testError) {
                console.error('❌ Contract test failed:', testError);
                throw new Error('Contract not responding. Check deployment.');
            }
            
        } catch (error) {
            console.error('❌ Contract loading failed:', error);
            if (typeof showModal === 'function') {
                showModal('Contract Error', 'Failed to load voting contract: ' + error.message);
            } else {
                alert('Contract Error: ' + error.message);
            }
            return false;
        }
    }
    
    /**
     * Get current network information
     * USER FEEDBACK: Display network name to user
     */
    async getNetworkInfo() {
        try {
            const networkId = await this.web3.eth.net.getId();
            const networkConfig = Object.values(CONTRACT_CONFIG.networks)
                .find(config => config.networkId === networkId || config.networkId === '*');
            
            return {
                id: networkId,
                name: networkConfig ? networkConfig.name : `Unknown Network (${networkId})`
            };
        } catch (error) {
            console.error('❌ Failed to get network info:', error);
            return { id: 'unknown', name: 'Unknown Network' };
        }
    }
    
    /**
     * Format address for display
     * USER EXPERIENCE: Show abbreviated address for better readability
     */
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    /**
     * Check if current user is admin
     * ACCESS CONTROL: Determine if admin features should be shown
     */
    async isAdmin() {
        try {
            if (!this.contract || !this.account) return false;
            
            const adminAddress = await this.contract.methods.admin().call();
            return adminAddress.toLowerCase() === this.account.toLowerCase();
        } catch (error) {
            console.error('❌ Failed to check admin status:', error);
            return false;
        }
    }
    
    /**
     * Send transaction with proper error handling
     * SECURITY: Estimate gas and handle transaction failures
     * USER EXPERIENCE: Show loading states and clear error messages
     */
    async sendTransaction(contractMethod, options = {}) {
        try {
            showLoading('Processing transaction...');
            
            // Estimate gas
            const gasEstimate = await contractMethod.estimateGas({
                from: this.account,
                ...options
            });
            
            // Add 20% buffer to gas estimate
            const gasLimit = Math.floor(gasEstimate * 1.2);
            
            // Send transaction
            const result = await contractMethod.send({
                from: this.account,
                gas: gasLimit,
                ...options
            });
            
            hideLoading();
            console.log('✅ Transaction successful:', result.transactionHash);
            
            return result;
            
        } catch (error) {
            hideLoading();
            console.error('❌ Transaction failed:', error);
            
            // Parse error message for user-friendly display
            let errorMessage = 'Transaction failed';
            
            if (error.message.includes('User denied')) {
                errorMessage = 'Transaction was rejected by user';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for transaction';
            } else if (error.message.includes('revert')) {
                // Extract revert reason
                const revertMatch = error.message.match(/revert (.+?)"/);
                if (revertMatch) {
                    errorMessage = revertMatch[1];
                }
            }
            
            showModal('Transaction Failed', errorMessage);
            throw error;
        }
    }
}

// Global Web3 manager instance
const web3Manager = new Web3Manager();

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CONTRACT INTERACTION FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * These functions provide a clean interface for all contract operations
 * Each function includes proper error handling and user feedback
 */

/**
 * VOTER FUNCTIONS
 * WHY: Separate voter and admin functions for clarity
 * SECURITY: Validation happens at smart contract level
 */

async function getVoterStatus(address = null) {
    try {
        const voterAddress = address || web3Manager.account;
        if (!voterAddress) return null;
        
        const result = await web3Manager.contract.methods
            .getVoterStatus(voterAddress)
            .call();
            
        return {
            isRegistered: result[0],
            hasVoted: result[1],
            canVote: result[2]
        };
    } catch (error) {
        console.error('❌ Failed to get voter status:', error);
        return null;
    }
}

async function getCandidates() {
    try {
        const candidateCount = await web3Manager.contract.methods
            .candidateCount()
            .call();
            
        const candidates = [];
        
        for (let i = 1; i <= candidateCount; i++) {
            const candidateInfo = await web3Manager.contract.methods
                .getCandidateInfo(i)
                .call();
                
            candidates.push({
                id: i,
                name: candidateInfo[0],
                votes: parseInt(candidateInfo[1]),
                exists: candidateInfo[2]
            });
        }
        
        return candidates;
    } catch (error) {
        console.error('❌ Failed to get candidates:', error);
        return [];
    }
}

async function castVote(candidateId) {
    try {
        const result = await web3Manager.sendTransaction(
            web3Manager.contract.methods.vote(candidateId)
        );
        
        showModal('Vote Cast Successfully!', 
            `Your vote has been recorded. Transaction: ${result.transactionHash}`);
        
        return result;
    } catch (error) {
        // Error already handled in sendTransaction
        throw error;
    }
}

async function getElectionResults() {
    try {
        const result = await web3Manager.contract.methods
            .showResults()
            .call();
            
        const votes = result[0].map(v => parseInt(v));
        const names = result[1];
        const winnerId = parseInt(result[2]);
        
        return {
            votes,
            names,
            winnerId,
            candidates: names.map((name, index) => ({
                id: index + 1,
                name,
                votes: votes[index],
                isWinner: (index + 1) === winnerId
            }))
        };
    } catch (error) {
        console.error('❌ Failed to get results:', error);
        return null;
    }
}

async function getElectionStats() {
    try {
        const result = await web3Manager.contract.methods
            .getElectionStats()
            .call();
            
        return {
            totalCandidates: parseInt(result[0]),
            totalVotes: parseInt(result[1]),
            votingActive: result[2],
            admin: result[3]
        };
    } catch (error) {
        console.error('❌ Failed to get election stats:', error);
        return null;
    }
}

/**
 * ADMIN FUNCTIONS
 * ACCESS CONTROL: These should only be called when user is verified admin
 * SECURITY: Contract enforces admin-only access, UI provides convenience
 */

async function registerVoter(voterAddress) {
    try {
        const result = await web3Manager.sendTransaction(
            web3Manager.contract.methods.registerVoter(voterAddress)
        );
        
        showModal('Voter Registered', 
            `Voter ${web3Manager.formatAddress(voterAddress)} has been registered successfully.`);
        
        return result;
    } catch (error) {
        throw error;
    }
}

async function addCandidate(candidateName) {
    try {
        const result = await web3Manager.sendTransaction(
            web3Manager.contract.methods.addCandidate(candidateName)
        );
        
        showModal('Candidate Added', 
            `Candidate "${candidateName}" has been added successfully.`);
        
        return result;
    } catch (error) {
        throw error;
    }
}

async function toggleVoting() {
    try {
        const result = await web3Manager.sendTransaction(
            web3Manager.contract.methods.toggleVoting()
        );
        
        showModal('Voting Status Changed', 
            'Voting status has been updated successfully.');
        
        return result;
    } catch (error) {
        throw error;
    }
}

async function transferAdmin(newAdminAddress) {
    try {
        const result = await web3Manager.sendTransaction(
            web3Manager.contract.methods.transferAdmin(newAdminAddress)
        );
        
        showModal('Admin Transferred', 
            `Admin rights have been transferred to ${web3Manager.formatAddress(newAdminAddress)}.`);
        
        return result;
    } catch (error) {
        throw error;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * INITIALIZATION AND EXPORT
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// Export functions for use in other modules
window.contractAPI = {
    web3Manager,
    getVoterStatus,
    getCandidates,
    castVote,
    getElectionResults,
    getElectionStats,
    registerVoter,
    addCandidate,
    toggleVoting,
    transferAdmin
};

console.log('📄 Contract module loaded');
console.log('🔍 Checking dependencies:');
console.log('- window.ethereum:', typeof window.ethereum);
console.log('- Web3:', typeof Web3);

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MODULE DESIGN RATIONALE:
 * 
 * 1. SEPARATION OF CONCERNS: Contract interactions separated from UI logic
 * 2. ERROR HANDLING: Comprehensive error handling with user-friendly messages
 * 3. SECURITY: All validation relies on smart contract, UI provides convenience
 * 4. TRANSPARENCY: Users see exact transaction details before signing
 * 5. MODULARITY: Easy to test and maintain contract interactions separately
 * 
 * This module implements our documented trade-off of technical complexity
 * for users in exchange for maximum transparency and security.
 * ═══════════════════════════════════════════════════════════════════════════════════
 */