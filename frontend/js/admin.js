/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ADMIN FUNCTIONALITY MODULE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Dedicated admin module
 * WHY: Administrative functions require special handling and security
 * SECURITY: Centralized validation and confirmation for admin operations
 * TRADE-OFF: Admin power vs decentralization (documented in design decisions)
 * 
 * This module handles:
 * - Voter registration management
 * - Candidate addition and management
 * - Election control (start/stop voting)
 * - Admin role transfer
 * - Security confirmations for sensitive operations
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ADMIN PANEL MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Real-time admin panel updates
 * WHY: Admin needs current information to make decisions
 * SECURITY: Always verify admin status before showing controls
 */

async function refreshAdminPanel() {
    try {
        console.log('🔄 Refreshing admin panel...');
        
        // Verify admin access
        const isAdmin = await web3Manager.isAdmin();
        if (!isAdmin) {
            console.log('❌ Access denied: User is not admin');
            uiManager.switchTab('voting'); // Redirect non-admins
            return;
        }
        
        // Update voting status display
        await updateVotingStatusDisplay();
        
        // Clear any previous form data
        clearAdminForms();
        
        console.log('✅ Admin panel refreshed');
        
    } catch (error) {
        console.error('❌ Failed to refresh admin panel:', error);
        uiManager.showModal('Admin Panel Error', 'Failed to load admin panel: ' + error.message);
    }
}

/**
 * VOTING STATUS DISPLAY
 * WHY: Admin needs to see current voting state clearly
 * CONTROL: Provides context for admin decisions
 */
async function updateVotingStatusDisplay() {
    try {
        const stats = await contractAPI.getElectionStats();
        if (!stats) return;
        
        const statusDisplay = document.getElementById('votingStatus');
        const toggleButton = document.getElementById('toggleVoting');
        
        if (stats.votingActive) {
            statusDisplay.innerHTML = `
                <div class="status-active">
                    <i class="fas fa-play-circle"></i>
                    <strong>Voting is currently ACTIVE</strong>
                    <p>Registered voters can cast their votes.</p>
                </div>
            `;
            statusDisplay.className = 'status-display active';
            toggleButton.innerHTML = '<i class="fas fa-pause"></i> Stop Voting';
        } else {
            statusDisplay.innerHTML = `
                <div class="status-inactive">
                    <i class="fas fa-pause-circle"></i>
                    <strong>Voting is currently INACTIVE</strong>
                    <p>Voters cannot cast votes at this time.</p>
                </div>
            `;
            statusDisplay.className = 'status-display inactive';
            toggleButton.innerHTML = '<i class="fas fa-play"></i> Start Voting';
        }
        
    } catch (error) {
        console.error('❌ Failed to update voting status:', error);
    }
}

/**
 * CLEAR ADMIN FORMS
 * USER EXPERIENCE: Reset forms after successful operations
 */
function clearAdminForms() {
    const forms = ['voterAddress', 'candidateName', 'newAdminAddress'];
    forms.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
            element.classList.remove('invalid');
        }
    });
    
    // Reset button states
    document.getElementById('registerVoter').disabled = true;
    document.getElementById('addCandidate').disabled = true;
    document.getElementById('transferAdmin').disabled = true;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VOTER MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Admin-controlled voter registration
 * WHY: Prevents Sybil attacks, ensures voter eligibility
 * SECURITY: Core defense against unauthorized participation
 * TRADE-OFF: Centralization vs security (documented)
 */

async function registerVoter() {
    try {
        const voterAddressInput = document.getElementById('voterAddress');
        const voterAddress = voterAddressInput.value.trim();
        
        // Validate input
        if (!validateEthereumAddress(voterAddress)) {
            uiManager.showModal('Invalid Address', 'Please enter a valid Ethereum address.');
            return;
        }
        
        // Check if already registered
        const voterStatus = await contractAPI.getVoterStatus(voterAddress);
        if (voterStatus && voterStatus.isRegistered) {
            uiManager.showModal('Already Registered', 'This address is already registered to vote.');
            return;
        }
        
        // Confirm registration
        const confirmed = await confirmAdminAction(
            'Register Voter',
            `Are you sure you want to register this address as a voter?\\n\\nAddress: ${voterAddress}\\n\\nThis will allow them to participate in the election.`
        );
        
        if (!confirmed) return;
        
        // Submit registration
        console.log('👥 Registering voter:', voterAddress);
        await contractAPI.registerVoter(voterAddress);
        
        // Clear form
        voterAddressInput.value = '';
        document.getElementById('registerVoter').disabled = true;
        
        console.log('✅ Voter registered successfully');
        
    } catch (error) {
        console.error('❌ Voter registration failed:', error);
        // Error already handled in contractAPI
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CANDIDATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Admin-controlled candidate addition
 * WHY: Quality control, prevents spam candidates, ensures legitimacy
 * SECURITY: Maintains ballot integrity
 * TRADE-OFF: Centralized control vs open candidate registration
 */

async function addCandidate() {
    try {
        const candidateNameInput = document.getElementById('candidateName');
        const candidateName = candidateNameInput.value.trim();
        
        // Validate input
        if (!validateCandidateName(candidateName)) {
            uiManager.showModal('Invalid Name', 'Please enter a valid candidate name (1-64 characters).');
            return;
        }
        
        // Check for duplicate names (optional check)
        const existingCandidates = await contractAPI.getCandidates();
        const duplicate = existingCandidates.find(c => 
            c.name.toLowerCase() === candidateName.toLowerCase()
        );
        
        if (duplicate) {
            uiManager.showModal('Duplicate Name', 'A candidate with this name already exists.');
            return;
        }
        
        // Confirm addition
        const confirmed = await confirmAdminAction(
            'Add Candidate',
            `Are you sure you want to add this candidate?\\n\\nName: "${candidateName}"\\n\\nThis candidate will appear on the ballot for all voters.`
        );
        
        if (!confirmed) return;
        
        // Submit candidate
        console.log('🏃‍♂️ Adding candidate:', candidateName);
        await contractAPI.addCandidate(candidateName);
        
        // Clear form
        candidateNameInput.value = '';
        document.getElementById('addCandidate').disabled = true;
        
        console.log('✅ Candidate added successfully');
        
    } catch (error) {
        console.error('❌ Candidate addition failed:', error);
        // Error already handled in contractAPI
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ELECTION CONTROL
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Admin-controlled voting periods
 * WHY: Allows setup time, emergency controls, scheduled elections
 * SECURITY: Prevents votes during setup or maintenance
 * TRADE-OFF: Admin control vs automated time-based voting
 */

async function toggleVoting() {
    try {
        const stats = await contractAPI.getElectionStats();
        if (!stats) {
            uiManager.showModal('Error', 'Unable to get current voting status.');
            return;
        }
        
        const action = stats.votingActive ? 'stop' : 'start';
        const actionTitle = stats.votingActive ? 'Stop Voting' : 'Start Voting';
        
        // Different warnings based on action
        let warningMessage;
        if (stats.votingActive) {
            warningMessage = `Are you sure you want to STOP voting?\\n\\nThis will prevent all voters from casting votes until you restart voting.\\n\\nCurrent votes will be preserved.`;
        } else {
            // Check if ready to start voting
            const candidates = await contractAPI.getCandidates();
            if (!candidates || candidates.length < 2) {
                uiManager.showModal('Cannot Start Voting', 'Please add at least 2 candidates before starting the election.');
                return;
            }
            
            warningMessage = `Are you sure you want to START voting?\\n\\nThis will allow all registered voters to cast their votes.\\n\\nMake sure all candidates have been added.`;
        }
        
        // Confirm action
        const confirmed = await confirmAdminAction(actionTitle, warningMessage);
        if (!confirmed) return;
        
        // Toggle voting
        console.log(`🔄 ${actionTitle}...`);
        await contractAPI.toggleVoting();
        
        // Update display
        await updateVotingStatusDisplay();
        
        console.log(`✅ Voting ${action}ped successfully`);
        
    } catch (error) {
        console.error('❌ Toggle voting failed:', error);
        // Error already handled in contractAPI
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ADMIN TRANSFER
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Single-step admin transfer
 * WHY: Simple implementation for educational use
 * SECURITY: Allows admin rotation, recovery from compromised keys
 * RISK: Accidental transfer to wrong address
 * FUTURE: Implement two-step transfer with acceptance required
 */

async function transferAdmin() {
    try {
        const newAdminInput = document.getElementById('newAdminAddress');
        const newAdminAddress = newAdminInput.value.trim();
        
        // Validate input
        if (!validateEthereumAddress(newAdminAddress)) {
            uiManager.showModal('Invalid Address', 'Please enter a valid Ethereum address.');
            return;
        }
        
        // Prevent transfer to current admin
        if (newAdminAddress.toLowerCase() === web3Manager.account.toLowerCase()) {
            uiManager.showModal('Invalid Transfer', 'Cannot transfer admin rights to yourself.');
            return;
        }
        
        // CRITICAL CONFIRMATION - this is irreversible
        const confirmed = await confirmCriticalAdminAction(
            'Transfer Admin Rights',
            `⚠️ CRITICAL ACTION ⚠️\\n\\nYou are about to transfer admin rights to:\\n${newAdminAddress}\\n\\nAfter this transaction:\\n• You will lose all admin privileges\\n• The new address will become the admin\\n• This action CANNOT be undone\\n\\nAre you absolutely sure?`
        );
        
        if (!confirmed) return;
        
        // Final confirmation
        const finalConfirmed = await confirmCriticalAdminAction(
            'Final Confirmation',
            `This is your FINAL chance to cancel.\\n\\nTransfer admin rights to:\\n${newAdminAddress}\\n\\nType 'TRANSFER' in the next dialog to confirm.`
        );
        
        if (!finalConfirmed) return;
        
        // Ask user to type TRANSFER
        const typedConfirmation = prompt('Type "TRANSFER" to confirm this action:');
        if (typedConfirmation !== 'TRANSFER') {
            uiManager.showModal('Transfer Cancelled', 'Admin transfer cancelled.');
            return;
        }
        
        // Submit transfer
        console.log('🔑 Transferring admin rights to:', newAdminAddress);
        await contractAPI.transferAdmin(newAdminAddress);
        
        // Clear form
        newAdminInput.value = '';
        document.getElementById('transferAdmin').disabled = true;
        
        // Redirect user since they're no longer admin
        setTimeout(() => {
            uiManager.switchTab('voting');
            uiManager.showModal('Admin Rights Transferred', 
                'Admin rights have been successfully transferred. You no longer have admin privileges.');
        }, 2000);
        
        console.log('✅ Admin rights transferred successfully');
        
    } catch (error) {
        console.error('❌ Admin transfer failed:', error);
        // Error already handled in contractAPI
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CONFIRMATION DIALOGS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Custom confirmation for admin actions
 * WHY: Admin actions can be irreversible and affect the entire election
 * SECURITY: Prevent accidental admin actions
 * USER EXPERIENCE: Clear explanation of consequences
 */

function confirmAdminAction(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('messageModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalFooter = modal.querySelector('.modal-footer');
        
        modalTitle.textContent = title;
        modalMessage.innerHTML = `
            <div class="admin-confirmation">
                <div class="confirmation-message">
                    ${message.replace(/\\n/g, '<br>')}
                </div>
            </div>
        `;
        
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="cancelAdminAction()">Cancel</button>
            <button class="btn btn-primary" onclick="confirmAdminAction()">
                <i class="fas fa-check"></i>
                Confirm
            </button>
        `;
        
        modal.classList.remove('hidden');
        
        window.cancelAdminAction = () => {
            modal.classList.add('hidden');
            restoreAdminModalFooter();
            resolve(false);
        };
        
        window.confirmAdminAction = () => {
            modal.classList.add('hidden');
            restoreAdminModalFooter();
            resolve(true);
        };
    });
}

function confirmCriticalAdminAction(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('messageModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalFooter = modal.querySelector('.modal-footer');
        
        modalTitle.textContent = title;
        modalMessage.innerHTML = `
            <div class="critical-admin-confirmation">
                <div class="critical-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    CRITICAL ACTION
                </div>
                <div class="confirmation-message">
                    ${message.replace(/\\n/g, '<br>')}
                </div>
            </div>
        `;
        
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="cancelCriticalAction()">Cancel</button>
            <button class="btn btn-danger" onclick="confirmCriticalAction()">
                <i class="fas fa-exclamation-triangle"></i>
                I Understand - Proceed
            </button>
        `;
        
        modal.classList.remove('hidden');
        
        window.cancelCriticalAction = () => {
            modal.classList.add('hidden');
            restoreAdminModalFooter();
            resolve(false);
        };
        
        window.confirmCriticalAction = () => {
            modal.classList.add('hidden');
            restoreAdminModalFooter();
            resolve(true);
        };
    });
}

function restoreAdminModalFooter() {
    const modalFooter = document.querySelector('#messageModal .modal-footer');
    modalFooter.innerHTML = `
        <button class="btn btn-primary" onclick="closeModal()">OK</button>
    `;
    
    // Clean up global functions
    delete window.cancelAdminAction;
    delete window.confirmAdminAction;
    delete window.cancelCriticalAction;
    delete window.confirmCriticalAction;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VALIDATION FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

function validateEthereumAddress(address) {
    const pattern = /^0x[a-fA-F0-9]{40}$/;
    return pattern.test(address);
}

function validateCandidateName(name) {
    return name && name.trim().length > 0 && name.trim().length <= 64;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EVENT LISTENERS SETUP
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

function setupAdminEventListeners() {
    // Register voter button
    const registerVoterButton = document.getElementById('registerVoter');
    if (registerVoterButton) {
        registerVoterButton.addEventListener('click', registerVoter);
    }
    
    // Add candidate button
    const addCandidateButton = document.getElementById('addCandidate');
    if (addCandidateButton) {
        addCandidateButton.addEventListener('click', addCandidate);
    }
    
    // Toggle voting button
    const toggleVotingButton = document.getElementById('toggleVoting');
    if (toggleVotingButton) {
        toggleVotingButton.addEventListener('click', toggleVoting);
    }
    
    // Transfer admin button
    const transferAdminButton = document.getElementById('transferAdmin');
    if (transferAdminButton) {
        transferAdminButton.addEventListener('click', transferAdmin);
    }
    
    console.log('👑 Admin event listeners set up');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    setupAdminEventListeners();
    console.log('👑 Admin module initialized');
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EXPORT FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

window.adminManager = {
    refreshAdminPanel,
    registerVoter,
    addCandidate,
    toggleVoting,
    transferAdmin,
    updateVotingStatusDisplay
};

console.log('👑 Admin module loaded');

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MODULE DESIGN RATIONALE:
 * 
 * 1. SECURITY THROUGH CONFIRMATION: Multiple confirmations for critical actions
 * 2. CLEAR CONSEQUENCES: Users understand the impact of admin actions
 * 3. REVERSIBILITY AWARENESS: Clear indication of what can/cannot be undone
 * 4. PROGRESSIVE DISCLOSURE: Simple actions have simple confirmations
 * 5. ADMIN RESPONSIBILITY: Design emphasizes the power and responsibility
 * 
 * This module implements our documented trade-off of centralized admin control
 * for simplicity and security, while providing safeguards against abuse and
 * accidents through comprehensive confirmation processes.
 * ═══════════════════════════════════════════════════════════════════════════════════
 */