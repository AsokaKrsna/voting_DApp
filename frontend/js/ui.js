/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * UI MANAGEMENT MODULE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Vanilla JavaScript for UI management
 * WHY: No framework dependencies, full control, educational value
 * TRADE-OFF: More manual work vs framework convenience
 * BENEFIT: Clear understanding of DOM manipulation and state management
 * 
 * This module handles:
 * - Tab switching and navigation
 * - Modal dialogs and notifications
 * - Loading states and user feedback
 * - Form validation and input handling
 * - Responsive UI updates
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * GLOBAL UI STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

const UI_STATE = {
    currentTab: 'voting',
    isLoading: false,
    selectedCandidate: null,
    walletConnected: false,
    isAdmin: false
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * TAB MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Single-page application with tab navigation
 * WHY: Fast switching, maintains state, no page reloads
 * USER EXPERIENCE: Smooth navigation between different features
 */

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update UI state
    UI_STATE.currentTab = tabName;
    
    // Update tab appearance
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName + 'Tab') {
            content.classList.add('active');
        }
    });
    
    // Refresh content when switching to tabs
    switch (tabName) {
        case 'results':
            refreshResults();
            break;
        case 'admin':
            refreshAdminPanel();
            break;
        case 'voting':
            refreshVotingPanel();
            break;
    }
    
    console.log('🔄 Switched to tab:', tabName);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MODAL MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Modal dialogs for user feedback
 * WHY: Non-intrusive notifications, user acknowledgment required
 * ACCESSIBILITY: Keyboard navigation support
 */

function showModal(title, message, type = 'info') {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Add type-specific styling
    modal.className = `modal ${type}`;
    
    modal.classList.remove('hidden');
    
    // Focus management for accessibility
    modal.focus();
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function closeModal() {
    const modal = document.getElementById('messageModal');
    modal.classList.add('hidden');
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('messageModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * LOADING STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * USER EXPERIENCE: Clear feedback during blockchain operations
 * WHY: Blockchain transactions can be slow, users need feedback
 */

function showLoading(message = 'Loading...') {
    UI_STATE.isLoading = true;
    
    const overlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');
    
    loadingMessage.textContent = message;
    overlay.classList.remove('hidden');
    
    // Disable interactions while loading
    document.body.style.pointerEvents = 'none';
    overlay.style.pointerEvents = 'auto';
}

function updateLoadingMessage(message) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
}

function hideLoading() {
    UI_STATE.isLoading = false;
    
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    
    // Re-enable interactions
    document.body.style.pointerEvents = 'auto';
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STATUS BANNER MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Persistent status banner
 * WHY: Always visible connection and system status
 * USER EXPERIENCE: Users always know the current state
 */

function updateStatusBanner(message, type = 'info') {
    const banner = document.getElementById('statusBanner');
    const statusMessage = document.getElementById('statusMessage');
    
    statusMessage.textContent = message;
    
    // Update banner styling based on type
    banner.className = `status-banner ${type}`;
    
    // Show banner if hidden
    banner.classList.remove('hidden');
}

function hideStatusBanner() {
    const banner = document.getElementById('statusBanner');
    banner.classList.add('hidden');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * WALLET CONNECTION UI
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Prominent wallet connection status
 * WHY: Wallet connection is prerequisite for all functionality
 * SECURITY: Clear indication of connection status
 */

function updateWalletUI(connected, account = null, networkInfo = null) {
    const connectButton = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    const networkInfoElement = document.getElementById('networkInfo');
    
    UI_STATE.walletConnected = connected;
    
    if (connected && account) {
        // Hide connect button, show wallet info
        connectButton.classList.add('hidden');
        walletInfo.classList.remove('hidden');
        
        // Update account display
        walletAddress.textContent = web3Manager.formatAddress(account);
        
        // Update network info
        if (networkInfo) {
            networkInfoElement.textContent = networkInfo.name;
        }
        
        // Update status banner
        updateStatusBanner(`Connected to ${networkInfo ? networkInfo.name : 'Unknown Network'}`, 'success');
        
    } else {
        // Show connect button, hide wallet info
        connectButton.classList.remove('hidden');
        walletInfo.classList.add('hidden');
        
        // Update status banner
        updateStatusBanner('Please connect your wallet to continue', 'warning');
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ADMIN TAB VISIBILITY
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * ACCESS CONTROL: Show admin tab only to admin users
 * WHY: Clean interface, prevents confusion for regular users
 */

function updateAdminTabVisibility(isAdmin) {
    const adminTab = document.querySelector('.tab[data-tab="admin"]');
    UI_STATE.isAdmin = isAdmin;
    
    if (isAdmin) {
        adminTab.style.display = 'flex';
    } else {
        adminTab.style.display = 'none';
        
        // Switch away from admin tab if currently selected
        if (UI_STATE.currentTab === 'admin') {
            switchTab('voting');
        }
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FORM VALIDATION AND INPUT HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * USER EXPERIENCE: Client-side validation for immediate feedback
 * SECURITY: Server-side (smart contract) validation is authoritative
 */

function validateEthereumAddress(address) {
    // Basic Ethereum address validation
    const pattern = /^0x[a-fA-F0-9]{40}$/;
    return pattern.test(address);
}

function validateCandidateName(name) {
    // Candidate name validation
    return name && name.trim().length > 0 && name.trim().length <= 64;
}

function setupFormValidation() {
    // Voter address validation
    const voterAddressInput = document.getElementById('voterAddress');
    if (voterAddressInput) {
        voterAddressInput.addEventListener('input', (e) => {
            const isValid = validateEthereumAddress(e.target.value);
            const registerButton = document.getElementById('registerVoter');
            
            if (isValid) {
                e.target.classList.remove('invalid');
                registerButton.disabled = false;
            } else {
                e.target.classList.add('invalid');
                registerButton.disabled = true;
            }
        });
    }
    
    // Candidate name validation
    const candidateNameInput = document.getElementById('candidateName');
    if (candidateNameInput) {
        candidateNameInput.addEventListener('input', (e) => {
            const isValid = validateCandidateName(e.target.value);
            const addButton = document.getElementById('addCandidate');
            
            if (isValid) {
                e.target.classList.remove('invalid');
                addButton.disabled = false;
            } else {
                e.target.classList.add('invalid');
                addButton.disabled = true;
            }
        });
    }
    
    // New admin address validation
    const newAdminInput = document.getElementById('newAdminAddress');
    if (newAdminInput) {
        newAdminInput.addEventListener('input', (e) => {
            const isValid = validateEthereumAddress(e.target.value);
            const transferButton = document.getElementById('transferAdmin');
            
            if (isValid) {
                e.target.classList.remove('invalid');
                transferButton.disabled = false;
            } else {
                e.target.classList.add('invalid');
                transferButton.disabled = true;
            }
        });
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CANDIDATE SELECTION UI
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Card-based candidate selection
 * WHY: Visual, intuitive selection process
 * ACCESSIBILITY: Keyboard navigation support
 */

function renderCandidates(candidates) {
    const candidatesList = document.getElementById('candidatesList');
    
    if (!candidates || candidates.length === 0) {
        candidatesList.innerHTML = `
            <div class="message-box info">
                <i class="fas fa-info-circle"></i>
                <p>No candidates have been added yet. Please wait for the admin to add candidates.</p>
            </div>
        `;
        return;
    }
    
    candidatesList.innerHTML = candidates.map(candidate => `
        <div class="candidate-card" 
             data-candidate-id="${candidate.id}"
             tabindex="0"
             role="button"
             aria-label="Select ${candidate.name} as your vote choice">
            <div class="candidate-info">
                <h3>${escapeHtml(candidate.name)}</h3>
                <div class="candidate-id">Candidate #${candidate.id}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers for candidate selection
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.addEventListener('click', () => {
            selectCandidate(parseInt(card.dataset.candidateId));
        });
        
        // Keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCandidate(parseInt(card.dataset.candidateId));
            }
        });
    });
}

function selectCandidate(candidateId) {
    UI_STATE.selectedCandidate = candidateId;
    
    // Update visual selection
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
        if (parseInt(card.dataset.candidateId) === candidateId) {
            card.classList.add('selected');
        }
    });
    
    // Enable vote button
    const voteButton = document.getElementById('submitVote');
    const voteSection = document.getElementById('voteButton');
    
    voteButton.disabled = false;
    voteSection.classList.remove('hidden');
    
    console.log('✅ Selected candidate:', candidateId);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * RESULTS DISPLAY
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Visual results with progress bars
 * WHY: Easy to understand vote distribution at a glance
 * TRANSPARENCY: Real-time results support our transparency priority
 */

function renderElectionStats(stats) {
    const statsContainer = document.getElementById('electionStats');
    
    if (!stats) {
        statsContainer.innerHTML = '<p>Unable to load election statistics.</p>';
        return;
    }
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <span class="stat-value">${stats.totalCandidates}</span>
            <div class="stat-label">Total Candidates</div>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.totalVotes}</span>
            <div class="stat-label">Total Votes</div>
        </div>
        <div class="stat-card">
            <span class="stat-value ${stats.votingActive ? 'text-success' : 'text-warning'}">
                ${stats.votingActive ? 'Active' : 'Inactive'}
            </span>
            <div class="stat-label">Voting Status</div>
        </div>
        <div class="stat-card">
            <span class="stat-value">${web3Manager.formatAddress(stats.admin)}</span>
            <div class="stat-label">Admin</div>
        </div>
    `;
}

function renderResults(results) {
    const resultsContainer = document.getElementById('resultsDisplay');
    const winnerContainer = document.getElementById('winnerAnnouncement');
    
    if (!results || !results.candidates || results.candidates.length === 0) {
        resultsContainer.innerHTML = `
            <div class="message-box info">
                <i class="fas fa-info-circle"></i>
                <p>No voting results available yet.</p>
            </div>
        `;
        winnerContainer.classList.add('hidden');
        return;
    }
    
    const totalVotes = results.votes.reduce((sum, votes) => sum + votes, 0);
    
    // Render individual results
    resultsContainer.innerHTML = results.candidates.map(candidate => {
        const percentage = totalVotes > 0 ? (candidate.votes / totalVotes * 100) : 0;
        
        return `
            <div class="result-item ${candidate.isWinner ? 'winner' : ''}">
                <div class="candidate-result">
                    <div class="candidate-name">${escapeHtml(candidate.name)}</div>
                    <div class="vote-bar">
                        <div class="vote-progress" style="width: ${percentage}%"></div>
                    </div>
                    <div class="vote-count">${candidate.votes} votes</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Show winner announcement if there are votes
    if (totalVotes > 0) {
        const winner = results.candidates.find(c => c.isWinner);
        if (winner) {
            winnerContainer.innerHTML = `
                <h3><i class="fas fa-trophy"></i> Current Leader</h3>
                <div class="winner-name">${escapeHtml(winner.name)}</div>
                <p>${winner.votes} votes (${((winner.votes / totalVotes) * 100).toFixed(1)}%)</p>
            `;
            winnerContainer.classList.remove('hidden');
        }
    } else {
        winnerContainer.classList.add('hidden');
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * DOCUMENTATION AND HELP FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

function showDocumentation() {
    showModal('Documentation', 
        'This DApp prioritizes transparency and security. All transactions are recorded on the blockchain. ' +
        'Please verify transaction details before signing. For technical details, see our documentation files.');
}

function showSecurityInfo() {
    showModal('Security Information', 
        'This voting system uses blockchain technology for transparency and immutability. ' +
        'Key security features: ' +
        '• Double voting prevention ' +
        '• Admin-controlled voter registration ' +
        '• Real-time transparent results ' +
        '• All actions recorded on blockchain ' +
        'Always verify your transactions before confirming.');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    setupFormValidation();
    console.log('🎨 UI module initialized');
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EXPORT UI FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

window.uiManager = {
    switchTab,
    showModal,
    closeModal,
    showLoading,
    updateLoadingMessage,
    hideLoading,
    updateStatusBanner,
    updateWalletUI,
    updateAdminTabVisibility,
    renderCandidates,
    selectCandidate,
    renderElectionStats,
    renderResults,
    showDocumentation,
    showSecurityInfo
};

console.log('🎨 UI module loaded');

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MODULE DESIGN RATIONALE:
 * 
 * 1. SEPARATION OF CONCERNS: UI logic separated from business logic
 * 2. ACCESSIBILITY: Keyboard navigation, screen reader support
 * 3. RESPONSIVE FEEDBACK: Immediate user feedback for all actions
 * 4. STATE MANAGEMENT: Clean state management without complex frameworks
 * 5. MODULARITY: Reusable functions for consistent UI behavior
 * 
 * This approach supports our documented trade-off of development complexity
 * for educational value and direct control over the user interface.
 * ═══════════════════════════════════════════════════════════════════════════════════
 */