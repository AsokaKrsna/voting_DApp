/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MAIN APPLICATION MODULE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Central application orchestrator
 * WHY: Coordinates all modules and manages application lifecycle
 * ARCHITECTURE: Single entry point for initialization and global state
 * RESPONSIBILITY: Application-wide state management and module coordination
 * 
 * This module:
 * - Initializes all other modules
 * - Manages application lifecycle
 * - Coordinates module interactions
 * - Handles global error management
 * - Provides unified update mechanism
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * APPLICATION STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

const APP_STATE = {
    initialized: false,
    walletConnected: false,
    contractLoaded: false,
    userRole: 'none', // 'admin', 'voter', 'none'
    currentAccount: null,
    networkInfo: null,
    refreshInterval: null
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * APPLICATION INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Step-by-step initialization
 * WHY: Clear error handling and user feedback at each step
 * USER EXPERIENCE: Users understand what's happening during startup
 */

async function initializeApp() {
    try {
        console.log('🚀 Initializing Voting DApp...');
        
        // Step 1: Initialize Web3
        uiManager.updateStatusBanner('Initializing Web3...', 'info');
        const web3Ready = await web3Manager.init();
        
        if (!web3Ready) {
            uiManager.updateStatusBanner('Web3 initialization failed. Please install MetaMask.', 'error');
            return false;
        }
        
        // Step 2: Set up event listeners
        setupGlobalEventListeners();
        
        // Step 3: Check for existing connection
        await checkExistingConnection();
        
        APP_STATE.initialized = true;
        console.log('✅ Application initialized successfully');
        
        return true;
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        uiManager.updateStatusBanner('Application initialization failed: ' + error.message, 'error');
        return false;
    }
}

/**
 * CHECK FOR EXISTING WALLET CONNECTION
 * WHY: Restore connection if user previously connected
 * USER EXPERIENCE: Seamless experience on page reload
 */
async function checkExistingConnection() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            
            if (accounts && accounts.length > 0) {
                console.log('🔄 Found existing wallet connection');
                await connectWallet();
            } else {
                uiManager.updateStatusBanner('Please connect your wallet to continue', 'warning');
            }
        }
    } catch (error) {
        console.error('❌ Failed to check existing connection:', error);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * WALLET CONNECTION MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Comprehensive connection process
 * WHY: Wallet connection enables all DApp functionality
 * SECURITY: Verify network and contract before allowing interactions
 */

async function connectWallet() {
    try {
        console.log('🔗 Connecting wallet...');
        uiManager.showLoading('Connecting to wallet...');
        
        // Step 1: Connect to MetaMask
        const connected = await web3Manager.connect();
        if (!connected) {
            uiManager.hideLoading();
            return false;
        }
        
        // Step 2: Get network information
        const networkInfo = await web3Manager.getNetworkInfo();
        APP_STATE.networkInfo = networkInfo;
        
        // Step 3: Load contract
        uiManager.updateLoadingMessage('Loading smart contract...');
        const contractLoaded = await web3Manager.loadContract();
        
        if (!contractLoaded) {
            uiManager.hideLoading();
            uiManager.updateStatusBanner('Contract not available on this network', 'error');
            return false;
        }
        
        // Step 4: Update state
        APP_STATE.walletConnected = true;
        APP_STATE.contractLoaded = true;
        APP_STATE.currentAccount = web3Manager.account;
        
        // Step 5: Determine user role
        await updateUserRole();
        
        // Step 6: Update UI
        uiManager.updateWalletUI(true, web3Manager.account, networkInfo);
        
        // Step 7: Start periodic updates
        startPeriodicUpdates();
        
        // Step 8: Initial content load
        await updateAllContent();
        
        uiManager.hideLoading();
        console.log('✅ Wallet connected successfully');
        
        return true;
        
    } catch (error) {
        console.error('❌ Wallet connection failed:', error);
        uiManager.hideLoading();
        uiManager.showModal('Connection Failed', 'Failed to connect wallet: ' + error.message);
        return false;
    }
}

/**
 * DISCONNECT WALLET
 * CLEANUP: Reset all application state
 */
function disconnectWallet() {
    console.log('🔌 Disconnecting wallet...');
    
    // Stop periodic updates
    stopPeriodicUpdates();
    
    // Reset state
    APP_STATE.walletConnected = false;
    APP_STATE.contractLoaded = false;
    APP_STATE.userRole = 'none';
    APP_STATE.currentAccount = null;
    
    // Update UI
    uiManager.updateWalletUI(false);
    uiManager.updateAdminTabVisibility(false);
    
    // Clear content
    clearAllContent();
    
    console.log('✅ Wallet disconnected');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USER ROLE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Role-based interface adaptation
 * WHY: Show relevant functionality based on user's role
 * SECURITY: UI provides convenience, contract enforces access control
 */

async function updateUserRole() {
    try {
        const isAdmin = await web3Manager.isAdmin();
        
        if (isAdmin) {
            APP_STATE.userRole = 'admin';
            uiManager.updateAdminTabVisibility(true);
            console.log('👑 User role: Admin');
        } else {
            const voterStatus = await contractAPI.getVoterStatus();
            if (voterStatus && voterStatus.isRegistered) {
                APP_STATE.userRole = 'voter';
                console.log('🗳️ User role: Registered Voter');
            } else {
                APP_STATE.userRole = 'none';
                console.log('👤 User role: Unregistered');
            }
            uiManager.updateAdminTabVisibility(false);
        }
        
    } catch (error) {
        console.error('❌ Failed to update user role:', error);
        APP_STATE.userRole = 'none';
        uiManager.updateAdminTabVisibility(false);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CONTENT UPDATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Centralized content updates
 * WHY: Ensure all tabs show current information
 * PERFORMANCE: Update only visible content when possible
 */

async function updateAllContent() {
    if (!APP_STATE.contractLoaded) return;
    
    try {
        console.log('🔄 Updating all content...');
        
        // Always update the current tab
        const currentTab = UI_STATE.currentTab;
        
        switch (currentTab) {
            case 'voting':
                await votingManager.refreshVotingPanel();
                break;
            case 'results':
                await refreshResults();
                break;
            case 'admin':
                if (APP_STATE.userRole === 'admin') {
                    await adminManager.refreshAdminPanel();
                }
                break;
        }
        
        console.log('✅ Content updated');
        
    } catch (error) {
        console.error('❌ Failed to update content:', error);
    }
}

/**
 * REFRESH RESULTS TAB
 * WHY: Results need frequent updates as votes come in
 * TRANSPARENCY: Real-time results support our transparency priority
 */
async function refreshResults() {
    try {
        console.log('📊 Refreshing results...');
        
        // Get election statistics
        const stats = await contractAPI.getElectionStats();
        if (stats) {
            uiManager.renderElectionStats(stats);
        }
        
        // Get detailed results
        const results = await contractAPI.getElectionResults();
        if (results) {
            uiManager.renderResults(results);
        }
        
        console.log('✅ Results refreshed');
        
    } catch (error) {
        console.error('❌ Failed to refresh results:', error);
        uiManager.showModal('Update Error', 'Failed to refresh results: ' + error.message);
    }
}

/**
 * CLEAR ALL CONTENT
 * CLEANUP: Reset content when wallet disconnected
 */
function clearAllContent() {
    // Clear voting panel
    const candidatesList = document.getElementById('candidatesList');
    if (candidatesList) candidatesList.innerHTML = '';
    
    const voteButton = document.getElementById('voteButton');
    if (voteButton) voteButton.classList.add('hidden');
    
    // Clear results
    const resultsDisplay = document.getElementById('resultsDisplay');
    if (resultsDisplay) resultsDisplay.innerHTML = '';
    
    const electionStats = document.getElementById('electionStats');
    if (electionStats) electionStats.innerHTML = '';
    
    const winnerAnnouncement = document.getElementById('winnerAnnouncement');
    if (winnerAnnouncement) winnerAnnouncement.classList.add('hidden');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PERIODIC UPDATES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Automatic content refresh
 * WHY: Blockchain state can change due to other users' actions
 * BALANCE: Frequent enough to be current, not so frequent to spam network
 */

function startPeriodicUpdates() {
    if (APP_STATE.refreshInterval) {
        clearInterval(APP_STATE.refreshInterval);
    }
    
    // Update every 30 seconds
    APP_STATE.refreshInterval = setInterval(async () => {
        if (APP_STATE.contractLoaded && !UI_STATE.isLoading) {
            await updateAllContent();
        }
    }, 30000);
    
    console.log('⏰ Periodic updates started');
}

function stopPeriodicUpdates() {
    if (APP_STATE.refreshInterval) {
        clearInterval(APP_STATE.refreshInterval);
        APP_STATE.refreshInterval = null;
        console.log('⏰ Periodic updates stopped');
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * GLOBAL EVENT LISTENERS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

function setupGlobalEventListeners() {
    // Connect wallet button
    const connectWalletButton = document.getElementById('connectWallet');
    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', connectWallet);
    }
    
    // Refresh results button
    const refreshResultsButton = document.getElementById('refreshResults');
    if (refreshResultsButton) {
        refreshResultsButton.addEventListener('click', refreshResults);
    }
    
    // Tab switching updates content
    document.addEventListener('tabChanged', (e) => {
        updateAllContent();
    });
    
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && APP_STATE.contractLoaded) {
            updateAllContent();
        }
    });
    
    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
        stopPeriodicUpdates();
    });
    
    console.log('🌐 Global event listeners set up');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Global error handling
 * WHY: Consistent error reporting and recovery
 * USER EXPERIENCE: Clear error messages and recovery options
 */

function handleGlobalError(error, context = 'Unknown') {
    console.error(`❌ Global error in ${context}:`, error);
    
    // Don't show error modals during initialization
    if (!APP_STATE.initialized) return;
    
    // Check if it's a connection error
    if (error.message && error.message.includes('connection')) {
        uiManager.updateStatusBanner('Connection lost. Please check your internet connection.', 'error');
    } else {
        uiManager.showModal('Error', `An error occurred: ${error.message}`);
    }
}

// Global error handler
window.addEventListener('error', (e) => {
    handleGlobalError(e.error, 'Window');
});

window.addEventListener('unhandledrejection', (e) => {
    handleGlobalError(e.reason, 'Promise');
    e.preventDefault();
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

function updateLoadingMessage(message) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
}

// Expose update function globally for module coordination
window.updateUI = updateAllContent;

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * APPLICATION LIFECYCLE
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 DOM loaded, starting application...');
    await initializeApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    console.log('📱 Application shutting down...');
    stopPeriodicUpdates();
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EXPORT FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

window.app = {
    // State
    state: APP_STATE,
    
    // Functions
    initializeApp,
    connectWallet,
    disconnectWallet,
    updateAllContent,
    refreshResults,
    updateUserRole,
    handleGlobalError,
    
    // Lifecycle
    startPeriodicUpdates,
    stopPeriodicUpdates
};

console.log('📱 Main application module loaded');

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MODULE DESIGN RATIONALE:
 * 
 * 1. CENTRAL ORCHESTRATION: Single point of control for application state
 * 2. PROGRESSIVE ENHANCEMENT: Application works even if some features fail
 * 3. GRACEFUL DEGRADATION: Clear error handling and user feedback
 * 4. REAL-TIME UPDATES: Keep UI synchronized with blockchain state
 * 5. CLEAN LIFECYCLE: Proper initialization and cleanup
 * 
 * This module ties together all our documented design decisions and trade-offs,
 * providing a cohesive user experience while maintaining security and transparency
 * principles throughout the application.
 * ═══════════════════════════════════════════════════════════════════════════════════
 */