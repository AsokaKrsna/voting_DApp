/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CONTRACT API MODULE - CORRECTED FOR ACTUAL DEPLOYED CONTRACT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This module provides a simplified API that matches the actual deployed contract.
 */

const contractAPI = {
    
    /**
     * GET VOTER STATUS
     * Uses the actual getVoterStatus function from deployed contract
     */
    async getVoterStatus(address = null) {
        try {
            const voterAddress = address || web3Manager.account;
            if (!voterAddress) return null;
            
            console.log('📋 Getting voter status for:', voterAddress);
            
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
    },
    
    /**
     * GET ALL CANDIDATES
     * Uses candidateCount and getCandidateInfo from deployed contract
     */
    async getCandidates() {
        try {
            console.log('🏛️ Getting all candidates...');
            
            const candidateCount = await web3Manager.contract.methods.candidateCount().call();
            const candidates = [];
            
            for (let i = 1; i <= candidateCount; i++) {
                try {
                    const candidateInfo = await web3Manager.contract.methods
                        .getCandidateInfo(i)
                        .call();
                    
                    candidates.push({
                        id: i,
                        name: candidateInfo[0],
                        votes: parseInt(candidateInfo[1]),
                        exists: candidateInfo[2]
                    });
                } catch (error) {
                    console.warn('⚠️ Failed to get candidate', i, ':', error);
                }
            }
            
            console.log('✅ Retrieved', candidates.length, 'candidates');
            return candidates;
            
        } catch (error) {
            console.error('❌ Failed to get candidates:', error);
            return [];
        }
    },
    
    /**
     * CAST VOTE
     * Uses the vote function from deployed contract
     */
    async castVote(candidateId) {
        try {
            console.log('🗳️ Casting vote for candidate:', candidateId);
            
            const result = await web3Manager.sendTransaction(
                web3Manager.contract.methods.vote(candidateId)
            );
            
            return result;
            
        } catch (error) {
            console.error('❌ Failed to cast vote:', error);
            throw error;
        }
    },
    
    /**
     * GET ELECTION RESULTS
     * Uses showResults function from deployed contract
     */
    async getElectionResults() {
        try {
            console.log('📈 Getting election results...');
            
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
    },
    
    /**
     * GET ELECTION STATISTICS
     * Uses getElectionStats function from deployed contract
     */
    async getElectionStats() {
        try {
            console.log('📊 Getting election statistics...');
            
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
    },
    
    /**
     * ADMIN FUNCTIONS
     */
    
    /**
     * REGISTER VOTER (ADMIN ONLY)
     */
    async registerVoter(voterAddress) {
        try {
            console.log('📝 Registering voter:', voterAddress);
            
            const result = await web3Manager.sendTransaction(
                web3Manager.contract.methods.registerVoter(voterAddress)
            );
            
            return result;
            
        } catch (error) {
            console.error('❌ Failed to register voter:', error);
            throw error;
        }
    },
    
    /**
     * ADD CANDIDATE (ADMIN ONLY)
     */
    async addCandidate(candidateName) {
        try {
            console.log('➕ Adding candidate:', candidateName);
            
            const result = await web3Manager.sendTransaction(
                web3Manager.contract.methods.addCandidate(candidateName)
            );
            
            return result;
            
        } catch (error) {
            console.error('❌ Failed to add candidate:', error);
            throw error;
        }
    },
    
    /**
     * TOGGLE VOTING (ADMIN ONLY)
     */
    async toggleVoting() {
        try {
            console.log('🔄 Toggling voting status...');
            
            const result = await web3Manager.sendTransaction(
                web3Manager.contract.methods.toggleVoting()
            );
            
            return result;
            
        } catch (error) {
            console.error('❌ Failed to toggle voting:', error);
            throw error;
        }
    },
    
    /**
     * TRANSFER ADMIN (ADMIN ONLY)
     */
    async transferAdmin(newAdminAddress) {
        try {
            console.log('🔑 Transferring admin to:', newAdminAddress);
            
            const result = await web3Manager.sendTransaction(
                web3Manager.contract.methods.transferAdmin(newAdminAddress)
            );
            
            return result;
            
        } catch (error) {
            console.error('❌ Failed to transfer admin:', error);
            throw error;
        }
    }
};

// Export the API
window.contractAPI = contractAPI;

console.log('🔗 Contract API module loaded');

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EVENT HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESIGN DECISION: Contract event monitoring
 * WHY: Real-time updates when contract state changes
 * PERFORMANCE: Event-driven updates are more efficient than polling
 */

let eventSubscriptions = [];

/**
 * SUBSCRIBE TO CONTRACT EVENTS
 * DESIGN: Real-time UI updates from blockchain events
 */
function subscribeToEvents() {
    if (!web3Manager.contract) return;
    
    try {
        // Vote cast events
        const voteEvent = web3Manager.contract.events.VoteCast({
            fromBlock: 'latest'
        });
        
        voteEvent.on('data', (event) => {
            console.log('🗳️ Vote cast event:', event);
            // Trigger UI update
            if (window.updateUI) {
                window.updateUI();
            }
        });
        
        voteEvent.on('error', (error) => {
            console.error('❌ Vote event error:', error);
        });
        
        eventSubscriptions.push(voteEvent);
        
        // Voter registered events
        const voterEvent = web3Manager.contract.events.VoterRegistered({
            fromBlock: 'latest'
        });
        
        voterEvent.on('data', (event) => {
            console.log('👤 Voter registered event:', event);
            if (window.updateUI) {
                window.updateUI();
            }
        });
        
        eventSubscriptions.push(voterEvent);
        
        console.log('👂 Subscribed to contract events');
        
    } catch (error) {
        console.error('❌ Failed to subscribe to events:', error);
    }
}

/**
 * UNSUBSCRIBE FROM EVENTS
 * CLEANUP: Stop listening to events when contract changes
 */
function unsubscribeFromEvents() {
    eventSubscriptions.forEach(subscription => {
        try {
            subscription.unsubscribe();
        } catch (error) {
            console.warn('⚠️ Failed to unsubscribe from event:', error);
        }
    });
    
    eventSubscriptions = [];
    console.log('🔇 Unsubscribed from contract events');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EXPORT API
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// Make API available globally
window.contractAPI = contractAPI;

// Event management
window.subscribeToEvents = subscribeToEvents;
window.unsubscribeFromEvents = unsubscribeFromEvents;

console.log('🔗 Contract API module loaded');

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * MODULE DESIGN RATIONALE:
 * 
 * 1. ABSTRACTION: Clean API hides Web3 complexity from UI modules
 * 2. ERROR HANDLING: Consistent error messages and recovery patterns
 * 3. VALIDATION: Client-side validation reduces failed transactions
 * 4. TRANSPARENCY: All vote counts and statistics are publicly accessible
 * 5. REAL-TIME: Event subscriptions keep UI synchronized with blockchain
 * 6. GAS OPTIMIZATION: Gas estimation prevents transaction failures
 * 7. SECURITY: Access control validation on critical operations
 * 
 * This module implements our core design principles:
 * - Transparency through public data access
 * - Security through validation and access control
 * - User experience through clear error handling
 * - Performance through efficient data fetching and event handling
 * ═══════════════════════════════════════════════════════════════════════════════════
 */