/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VOTING FUNCTIONALITY MODULE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Dedicated voting module
 * WHY: Core functionality deserves focused attention and testing
 * SECURITY: Centralized validation and error handling for voting operations
 * USER EXPERIENCE: Streamlined voting process with clear feedback
 * 
 * This module handles:
 * - Voter eligibility checking
 * - Candidate display and selection
 * - Vote submission and confirmation
 * - Real-time status updates
 * - Error handling and user guidance
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VOTING PANEL MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Dynamic UI based on voter status
 * WHY: Clear guidance for users based on their eligibility and voting status
 * USER EXPERIENCE: No confusion about what actions are available
 */

async function refreshVotingPanel() {
    try {
        console.log('🔄 Refreshing voting panel...');
        
        // Check if wallet is connected
        if (!web3Manager.isConnected) {
            showVotingMessage('wallet', 'Please connect your wallet to participate in voting.');
            return;
        }
        
        // Check if contract is loaded
        if (!web3Manager.contract) {
            showVotingMessage('contract', 'Loading contract...');
            return;
        }
        
        // Get voter status
        const voterStatus = await contractAPI.getVoterStatus();
        if (!voterStatus) {
            showVotingMessage('error', 'Unable to check voter status. Please try again.');
            return;
        }
        
        // Get election stats
        const electionStats = await contractAPI.getElectionStats();
        if (!electionStats) {
            showVotingMessage('error', 'Unable to load election information. Please try again.');
            return;
        }
        
        // Update voter status display
        updateVoterStatusDisplay(voterStatus, electionStats);
        
        // Handle different voting states
        if (!voterStatus.isRegistered) {
            showVotingMessage('notRegistered');
            return;
        }
        
        if (voterStatus.hasVoted) {
            showVotingMessage('alreadyVoted');
            return;
        }
        
        if (!electionStats.votingActive) {
            showVotingMessage('votingInactive');
            return;
        }
        
        // User can vote - show candidates
        await displayCandidatesForVoting();
        
    } catch (error) {
        console.error('❌ Failed to refresh voting panel:', error);
        showVotingMessage('error', 'Failed to load voting information: ' + error.message);
    }
}

/**
 * VOTER STATUS DISPLAY
 * WHY: Users need clear understanding of their voting eligibility
 * TRANSPARENCY: All status information is visible to the user
 */
function updateVoterStatusDisplay(voterStatus, electionStats) {
    const statusElement = document.getElementById('voterStatus');
    
    let statusHTML = '<div class="voter-status-grid">';
    
    // Registration status
    statusHTML += `
        <div class="status-item ${voterStatus.isRegistered ? 'text-success' : 'text-warning'}">
            <i class="fas ${voterStatus.isRegistered ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            ${voterStatus.isRegistered ? 'Registered Voter' : 'Not Registered'}
        </div>
    `;
    
    // Voting status
    if (voterStatus.isRegistered) {
        statusHTML += `
            <div class="status-item ${voterStatus.hasVoted ? 'text-info' : 'text-success'}">
                <i class="fas ${voterStatus.hasVoted ? 'fa-vote-yea' : 'fa-hand-paper'}"></i>
                ${voterStatus.hasVoted ? 'Vote Cast' : 'Ready to Vote'}
            </div>
        `;
    }
    
    // Election status
    statusHTML += `
        <div class="status-item ${electionStats.votingActive ? 'text-success' : 'text-warning'}">
            <i class="fas ${electionStats.votingActive ? 'fa-play-circle' : 'fa-pause-circle'}"></i>
            Voting ${electionStats.votingActive ? 'Active' : 'Inactive'}
        </div>
    `;
    
    statusHTML += '</div>';
    statusElement.innerHTML = statusHTML;
}

/**
 * VOTING MESSAGE DISPLAY
 * WHY: Clear communication of voting state and required actions
 * USER GUIDANCE: Help users understand what they need to do next
 */
function showVotingMessage(type, customMessage = null) {
    // Hide all message boxes first
    const messageBoxes = [
        'votingInactive',
        'notRegistered', 
        'alreadyVoted'
    ];
    
    messageBoxes.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    
    // Hide candidate selection
    const candidatesList = document.getElementById('candidatesList');
    const voteButton = document.getElementById('voteButton');
    candidatesList.innerHTML = '';
    voteButton.classList.add('hidden');
    
    // Show appropriate message
    let messageElement = null;
    
    switch (type) {
        case 'votingInactive':
            messageElement = document.getElementById('votingInactive');
            break;
        case 'notRegistered':
            messageElement = document.getElementById('notRegistered');
            break;
        case 'alreadyVoted':
            messageElement = document.getElementById('alreadyVoted');
            break;
        case 'wallet':
        case 'contract':
        case 'error':
            // Create temporary message for these cases
            candidatesList.innerHTML = `
                <div class="message-box ${type === 'error' ? 'error' : 'warning'}">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                    <p>${customMessage}</p>
                </div>
            `;
            return;
    }
    
    if (messageElement) {
        messageElement.classList.remove('hidden');
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CANDIDATE DISPLAY AND SELECTION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Visual candidate selection
 * WHY: Clear, intuitive voting interface
 * ACCESSIBILITY: Keyboard navigation and screen reader support
 */

async function displayCandidatesForVoting() {
    try {
        const candidates = await contractAPI.getCandidates();
        
        if (!candidates || candidates.length === 0) {
            showVotingMessage('error', 'No candidates available. Please wait for candidates to be added.');
            return;
        }
        
        // Hide all message boxes
        showVotingMessage('none');
        
        // Render candidates using UI manager
        uiManager.renderCandidates(candidates);
        
        console.log('✅ Displayed candidates for voting:', candidates.length);
        
    } catch (error) {
        console.error('❌ Failed to display candidates:', error);
        showVotingMessage('error', 'Failed to load candidates: ' + error.message);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VOTE SUBMISSION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Explicit vote confirmation
 * WHY: Voting is irreversible, user should confirm their choice
 * SECURITY: Multiple validation steps before submission
 * TRANSPARENCY: User sees exactly what transaction they're signing
 */

async function submitVote() {
    try {
        // Validate selection
        if (!UI_STATE.selectedCandidate) {
            uiManager.showModal('No Candidate Selected', 'Please select a candidate before submitting your vote.');
            return;
        }
        
        // Double-check voter eligibility
        const voterStatus = await contractAPI.getVoterStatus();
        if (!voterStatus || !voterStatus.canVote) {
            uiManager.showModal('Cannot Vote', 'You are not eligible to vote at this time.');
            await refreshVotingPanel(); // Refresh to show current status
            return;
        }
        
        // Get candidate name for confirmation
        const candidates = await contractAPI.getCandidates();
        const selectedCandidate = candidates.find(c => c.id === UI_STATE.selectedCandidate);
        
        if (!selectedCandidate) {
            uiManager.showModal('Invalid Selection', 'Selected candidate is no longer available.');
            await refreshVotingPanel();
            return;
        }
        
        // Confirm vote with user
        const confirmed = await confirmVote(selectedCandidate);
        if (!confirmed) {
            return;
        }
        
        // Submit vote to blockchain
        console.log('🗳️ Submitting vote for candidate:', selectedCandidate.name);
        
        const result = await contractAPI.castVote(UI_STATE.selectedCandidate);
        
        console.log('✅ Vote submitted successfully:', result.transactionHash);
        
        // Refresh voting panel to show updated status
        await refreshVotingPanel();
        
        // Switch to results tab to show impact
        setTimeout(() => {
            uiManager.switchTab('results');
        }, 2000);
        
    } catch (error) {
        console.error('❌ Vote submission failed:', error);
        
        // Error handling is done in contractAPI.castVote
        // Just refresh the voting panel in case state changed
        await refreshVotingPanel();
    }
}

/**
 * VOTE CONFIRMATION
 * DESIGN DECISION: Custom confirmation dialog
 * WHY: Standard confirm() is not user-friendly for important decisions
 * USER EXPERIENCE: Clear explanation of what will happen
 */
function confirmVote(candidate) {
    return new Promise((resolve) => {
        const modal = document.getElementById('messageModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalFooter = modal.querySelector('.modal-footer');
        
        modalTitle.textContent = 'Confirm Your Vote';
        modalMessage.innerHTML = `
            <div class="vote-confirmation">
                <div class="confirmation-candidate">
                    <strong>You are about to vote for:</strong><br>
                    <span class="candidate-name-large">${escapeHtml(candidate.name)}</span>
                    <span class="candidate-id">(Candidate #${candidate.id})</span>
                </div>
                <div class="confirmation-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Important:</strong> This action cannot be undone. You can only vote once.
                </div>
                <div class="confirmation-details">
                    This will create a blockchain transaction that you'll need to confirm in MetaMask.
                </div>
            </div>
        `;
        
        // Custom footer with confirm/cancel buttons
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="cancelVoteConfirmation()">Cancel</button>
            <button class="btn btn-primary" onclick="proceedWithVote()">
                <i class="fas fa-vote-yea"></i>
                Confirm Vote
            </button>
        `;
        
        modal.classList.remove('hidden');
        
        // Set up global functions for button handlers
        window.cancelVoteConfirmation = () => {
            modal.classList.add('hidden');
            restoreModalFooter();
            resolve(false);
        };
        
        window.proceedWithVote = () => {
            modal.classList.add('hidden');
            restoreModalFooter();
            resolve(true);
        };
        
        // Close on escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                window.cancelVoteConfirmation();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    });
}

/**
 * RESTORE MODAL TO DEFAULT STATE
 * CLEANUP: Reset modal after custom confirmation dialog
 */
function restoreModalFooter() {
    const modalFooter = document.querySelector('#messageModal .modal-footer');
    modalFooter.innerHTML = `
        <button class="btn btn-primary" onclick="closeModal()">OK</button>
    `;
    
    // Clean up global functions
    delete window.cancelVoteConfirmation;
    delete window.proceedWithVote;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EVENT LISTENERS SETUP
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

function setupVotingEventListeners() {
    // Vote submission button
    const submitVoteButton = document.getElementById('submitVote');
    if (submitVoteButton) {
        submitVoteButton.addEventListener('click', submitVote);
    }
    
    console.log('🗳️ Voting event listeners set up');
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

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    setupVotingEventListeners();
    console.log('🗳️ Voting module initialized');
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EXPORT FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

window.votingManager = {
    refreshVotingPanel,
    displayCandidatesForVoting,
    submitVote,
    updateVoterStatusDisplay
};

console.log('🗳️ Voting module loaded');

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MODULE DESIGN RATIONALE:
 * 
 * 1. USER-CENTRIC DESIGN: Interface adapts to user's voting eligibility
 * 2. SECURITY THROUGH TRANSPARENCY: Users see exactly what they're voting for
 * 3. ERROR PREVENTION: Multiple validation steps prevent invalid votes
 * 4. ACCESSIBILITY: Clear messaging and keyboard support
 * 5. IMMUTABILITY AWARENESS: Users understand voting is permanent
 * 
 * This module implements our core voting functionality while maintaining
 * the documented trade-offs between simplicity and security. The interface
 * prioritizes clarity and transparency over complex features.
 * ═══════════════════════════════════════════════════════════════════════════════════
 */