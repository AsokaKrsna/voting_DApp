// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VOTING SMART CONTRACT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * A decentralized voting system with secure voter registration and transparent results.
 * 
 * DESIGN PHILOSOPHY:
 * This contract prioritizes transparency and security over privacy and complete 
 * decentralization. It's designed for educational purposes and controlled voting 
 * environments where participants are known and trusted.
 * 
 * KEY TRADE-OFFS:
 * ✅ Security & Fraud Prevention vs ⚠️ Centralization
 * ✅ Transparency & Verifiability vs ⚠️ Privacy Loss  
 * ✅ Simplicity & Gas Efficiency vs ⚠️ Advanced Features
 * 
 * SECURITY MODEL:
 * - Prevention over Detection
 * - Admin-controlled access for Sybil attack prevention
 * - Multiple validation layers for vote integrity
 * - Complete audit trail through events
 * 
 * @title Voting
 * @author Your Name
 * @notice A simple, secure voting system for registered voters
 * @dev Uses mapping-based tracking for O(1) operations and gas efficiency
 */
contract Voting {
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * DESIGN DECISION: Single admin model
     * WHY: Simplifies access control, reduces gas costs, clear responsibility
     * TRADE-OFF: Centralization risk vs operational simplicity
     * SECURITY: Single point of failure - admin key must be secured
     * FUTURE: Will upgrade to multi-signature admin system
     */
    address public admin;
    
    /**
     * DESIGN DECISION: Mapping for voter registration tracking
     * WHY: O(1) lookup time, gas efficient, transparent verification
     * TRADE-OFF: Public visibility vs privacy
     * SECURITY: Prevents unauthorized voting, enables verification
     * ALTERNATIVE: Could use merkle tree for privacy (more complex)
     */
    mapping(address => bool) public registeredVoters;
    
    /**
     * DESIGN DECISION: Public voting status tracking  
     * WHY: Prevents double voting, provides transparency
     * TRADE-OFF: Privacy loss vs fraud prevention
     * SECURITY: Core protection against double voting attacks
     * RISK: Enables vote buying verification (accepted for educational use)
     */
    mapping(address => bool) public hasVoted;
    
    /**
     * DESIGN DECISION: Public vote counts per candidate
     * WHY: Maximum transparency, real-time results, easy verification
     * TRADE-OFF: Potential vote buying vs transparency
     * ALTERNATIVE: Commit-reveal scheme (adds complexity)
     * JUSTIFICATION: Educational value outweighs vote buying risk
     */
    mapping(uint => uint) public voteCounts;
    
    /**
     * DESIGN DECISION: String storage for candidate names
     * WHY: Human-readable candidate identification
     * TRADE-OFF: Higher gas costs vs user experience
     * ALTERNATIVE: Use bytes32 for efficiency (less user-friendly)
     */
    mapping(uint => string) public candidates;
    
    /**
     * DESIGN DECISION: Sequential candidate IDs starting from 1
     * WHY: Simple iteration, avoid zero-value confusion
     * SECURITY: Prevents votes for non-existent candidate (ID 0)
     */
    uint public candidateCount;
    
    /**
     * TRACKING: Total votes cast (for statistics and validation)
     * PURPOSE: Quick total without iterating through all candidates
     */
    uint public totalVotes;
    
    /**
     * DESIGN DECISION: Admin-controlled voting status
     * WHY: Allows pausing voting in emergencies or scheduling elections
     * TRADE-OFF: Admin control vs automatic processes
     * SECURITY: Prevents voting during setup or after conclusion
     */
    bool public votingActive;
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * TRANSPARENCY: All major actions emit events for off-chain tracking
     * SECURITY: Creates immutable audit trail
     * PURPOSE: Enables frontend updates and external monitoring
     */
    event VoterRegistered(address indexed voter, uint timestamp);
    event CandidateAdded(uint indexed candidateId, string name, uint timestamp);
    event VoteCast(address indexed voter, uint indexed candidateId, uint timestamp);
    event VotingStatusChanged(bool active, uint timestamp);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin, uint timestamp);
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * ACCESS CONTROL MODIFIER
     * DESIGN DECISION: Simple admin check
     * WHY: Clear, gas-efficient, easy to understand
     * SECURITY: Prevents unauthorized administrative actions
     * LIMITATION: Single point of failure
     * FUTURE: Replace with multi-signature mechanism
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    /**
     * VOTER VERIFICATION MODIFIER
     * DESIGN DECISION: Require explicit registration
     * WHY: Prevents Sybil attacks, ensures voter eligibility
     * SECURITY: Core defense against unauthorized participation
     * TRADE-OFF: Centralized control vs open participation
     */
    modifier onlyRegisteredVoter() {
        require(registeredVoters[msg.sender], "You are not registered to vote");
        _;
    }
    
    /**
     * DOUBLE VOTING PREVENTION MODIFIER
     * DESIGN DECISION: Mapping-based check
     * WHY: O(1) lookup, gas efficient, deterministic
     * SECURITY: Core protection against vote manipulation
     * TRADE-OFF: Public voting status vs privacy
     * EFFECTIVENESS: 100% prevention of address-based double voting
     */
    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted");
        _;
    }
    
    /**
     * VOTING STATUS MODIFIER
     * DESIGN DECISION: Admin-controlled voting periods
     * WHY: Allows setup time, emergency pausing, scheduled elections
     * SECURITY: Prevents votes during maintenance or after conclusion
     * TRADE-OFF: Admin control vs automated processes
     */
    modifier votingIsActive() {
        require(votingActive, "Voting is currently inactive");
        _;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * CONTRACT INITIALIZATION
     * DESIGN DECISION: Deployer becomes admin automatically
     * WHY: Simple deployment process, clear initial ownership
     * SECURITY: Admin role established at deployment
     * TRADE-OFF: Manual admin setup vs automatic assignment
     */
    constructor() {
        admin = msg.sender;
        votingActive = false; // Start with voting disabled for setup
        candidateCount = 0;
        totalVotes = 0;
        
        emit AdminChanged(address(0), admin, block.timestamp);
        emit VotingStatusChanged(false, block.timestamp);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: registerVoter
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Register an eligible voter by their Ethereum address
     * 
     * DESIGN DECISION: Admin-only voter registration
     * WHY: Prevents Sybil attacks, ensures voter eligibility verification
     * SECURITY: Core defense against unauthorized participation
     * TRADE-OFF: Centralization vs security
     * RISK: Admin could exclude legitimate voters
     * MITIGATION: Transparent criteria, community oversight planned
     * 
     * @param _voter The Ethereum address of the voter to register
     */
    function registerVoter(address _voter) public onlyAdmin {
        // VALIDATION: Ensure voter is not already registered
        require(!registeredVoters[_voter], "Voter is already registered");
        
        // VALIDATION: Ensure valid address
        require(_voter != address(0), "Invalid voter address");
        
        // STATE CHANGE: Register the voter
        registeredVoters[_voter] = true;
        
        // TRANSPARENCY: Emit event for audit trail
        emit VoterRegistered(_voter, block.timestamp);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: addCandidate
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Add a candidate to the election ballot
     * 
     * DESIGN DECISION: Admin-controlled candidate addition
     * WHY: Quality control, prevents spam candidates, ensures legitimacy
     * SECURITY: Maintains ballot integrity
     * TRADE-OFF: Centralized control vs open candidate registration
     * RISK: Admin could exclude legitimate candidates
     * MITIGATION: Transparent criteria, appeal process planned
     * 
     * @param _name The name of the candidate to add
     */
    function addCandidate(string memory _name) public onlyAdmin {
        // VALIDATION: Ensure candidate name is not empty
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        
        // VALIDATION: Ensure name is not too long (gas optimization)
        require(bytes(_name).length <= 64, "Candidate name too long");
        
        // STATE CHANGE: Increment candidate count and add candidate
        candidateCount++;
        candidates[candidateCount] = _name;
        // Note: voteCounts[candidateCount] is automatically 0
        
        // TRANSPARENCY: Emit event for audit trail
        emit CandidateAdded(candidateCount, _name, block.timestamp);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: toggleVoting
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Start or stop the voting process
     * 
     * DESIGN DECISION: Admin-controlled voting periods
     * WHY: Allows setup time, emergency controls, scheduled elections
     * SECURITY: Prevents votes during setup or maintenance
     * TRADE-OFF: Admin control vs automated time-based voting
     * USE CASES: Setup phase, emergency pause, scheduled end
     */
    function toggleVoting() public onlyAdmin {
        votingActive = !votingActive;
        
        // TRANSPARENCY: Emit event for status change
        emit VotingStatusChanged(votingActive, block.timestamp);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: transferAdmin
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Transfer admin rights to another address
     * 
     * DESIGN DECISION: Single-step admin transfer
     * WHY: Simple implementation for educational use
     * SECURITY: Allows admin rotation, recovery from compromised keys
     * RISK: Accidental transfer to wrong address
     * FUTURE: Implement two-step transfer with acceptance required
     * 
     * @param _newAdmin The address of the new admin
     */
    function transferAdmin(address _newAdmin) public onlyAdmin {
        // VALIDATION: Ensure valid new admin address
        require(_newAdmin != address(0), "Invalid admin address");
        require(_newAdmin != admin, "New admin cannot be the same as current admin");
        
        // STATE CHANGE: Update admin
        address oldAdmin = admin;
        admin = _newAdmin;
        
        // TRANSPARENCY: Emit event for admin change
        emit AdminChanged(oldAdmin, _newAdmin, block.timestamp);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // VOTING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: vote
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Cast a vote for a candidate
     * 
     * SECURITY LAYERS:
     * 1. onlyRegisteredVoter: Prevents unauthorized voting
     * 2. hasNotVoted: Prevents double voting
     * 3. votingIsActive: Ensures voting is in progress
     * 4. Candidate validation: Prevents votes for non-existent candidates
     * 
     * DESIGN DECISION: Immediate vote recording
     * WHY: Simplicity, immediate transparency, gas efficiency
     * TRADE-OFF: No vote changing vs immediate finality
     * RISK: Voter mistakes are permanent
     * JUSTIFICATION: Democratic principle - votes should be final
     * 
     * @param _candidateId The ID of the candidate to vote for (1-based)
     */
    function vote(uint _candidateId) public onlyRegisteredVoter hasNotVoted votingIsActive {
        // VALIDATION: Ensure candidate exists
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");
        
        // STATE CHANGES: Record the vote (prevents reentrancy)
        hasVoted[msg.sender] = true;
        voteCounts[_candidateId]++;
        totalVotes++;
        
        // TRANSPARENCY: Emit event for audit trail
        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (No gas cost for callers)
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: showResults
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Return complete voting results and determine winner
     * 
     * DESIGN DECISIONS:
     * • Public visibility: Anyone can view results
     * • Real-time results: No waiting until voting ends
     * • Winner calculation: Automatic determination of highest vote count
     * 
     * WHY THIS APPROACH:
     * • Transparency: Maximum openness builds trust
     * • Simplicity: Easy to understand and verify
     * • User Experience: Immediate feedback and engagement
     * 
     * TRADE-OFFS:
     * ✅ BENEFITS:
     *   - Complete transparency and verifiability
     *   - Real-time monitoring and engagement
     *   - Simple implementation and low gas costs
     * 
     * ⚠️ COSTS:
     *   - Enables vote buying (buyer can verify purchase)
     *   - May influence undecided voters (bandwagon effect)
     *   - Psychological pressure on voters
     * 
     * SECURITY IMPLICATIONS:
     * • Vote buying risk: Public results enable verification of purchased votes
     * • No manipulation risk: Results calculated from immutable vote counts
     * • Transparency benefit: Anyone can independently verify counting
     * 
     * ALTERNATIVES CONSIDERED:
     * 1. Hidden results until voting ends - Rejected: Reduces transparency
     * 2. Partial results (percentages only) - Rejected: Still enables vote buying
     * 3. Commit-reveal scheme - Rejected: Too complex for educational use
     * 
     * GAS CONSIDERATIONS:
     * • Read-only function: No gas cost for callers
     * • O(n) complexity where n = number of candidates
     * • Reasonable for expected candidate counts (<100)
     * 
     * @return votes Array of vote counts for each candidate
     * @return names Array of candidate names
     * @return winningCandidateId ID of the candidate with most votes
     */
    function showResults() public view returns (
        uint[] memory votes,
        string[] memory names,
        uint winningCandidateId
    ) {
        // INITIALIZATION: Create arrays for return data
        votes = new uint[](candidateCount);
        names = new string[](candidateCount);
        
        // EDGE CASE: Handle no candidates scenario
        if (candidateCount == 0) {
            return (votes, names, 0);
        }
        
        // WINNER TRACKING: Find candidate with highest votes
        uint highestVoteCount = 0;
        winningCandidateId = 1; // Default to first candidate
        
        // ITERATION: Collect data for all candidates
        for (uint i = 1; i <= candidateCount; i++) {
            votes[i-1] = voteCounts[i];
            names[i-1] = candidates[i];
            
            // WINNER DETERMINATION: Update winner if this candidate has more votes
            if (voteCounts[i] > highestVoteCount) {
                highestVoteCount = voteCounts[i];
                winningCandidateId = i;
            }
        }
        
        return (votes, names, winningCandidateId);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: getWinner
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Get the current winner information
     * 
     * DESIGN DECISION: Separate winner function for gas optimization
     * WHY: Sometimes only winner info is needed, not full results
     * 
     * @return winnerName Name of the winning candidate
     * @return winnerVotes Number of votes for the winner
     * @return winnerExists Whether there are any candidates/votes
     */
    function getWinner() public view returns (
        string memory winnerName,
        uint winnerVotes,
        bool winnerExists
    ) {
        // EDGE CASE: No candidates
        if (candidateCount == 0) {
            return ("", 0, false);
        }
        
        uint highestVoteCount = 0;
        uint winningCandidateId = 1;
        
        // FIND WINNER: Iterate through candidates
        for (uint i = 1; i <= candidateCount; i++) {
            if (voteCounts[i] > highestVoteCount) {
                highestVoteCount = voteCounts[i];
                winningCandidateId = i;
            }
        }
        
        return (
            candidates[winningCandidateId],
            highestVoteCount,
            true
        );
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: getCandidateInfo
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Get information about a specific candidate
     * 
     * @param _candidateId The ID of the candidate
     * @return name The candidate's name
     * @return votes The candidate's current vote count
     * @return exists Whether the candidate exists
     */
    function getCandidateInfo(uint _candidateId) public view returns (
        string memory name,
        uint votes,
        bool exists
    ) {
        if (_candidateId == 0 || _candidateId > candidateCount) {
            return ("", 0, false);
        }
        
        return (
            candidates[_candidateId],
            voteCounts[_candidateId],
            true
        );
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: getVoterStatus
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Check a voter's registration and voting status
     * 
     * @param _voter The address to check
     * @return isRegistered Whether the address is registered to vote
     * @return hasVotedAlready Whether the address has already voted
     * @return canVote Whether the address can currently vote
     */
    function getVoterStatus(address _voter) public view returns (
        bool isRegistered,
        bool hasVotedAlready,
        bool canVote
    ) {
        isRegistered = registeredVoters[_voter];
        hasVotedAlready = hasVoted[_voter];
        canVote = isRegistered && !hasVotedAlready && votingActive;
        
        return (isRegistered, hasVotedAlready, canVote);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════════════════════
     * FUNCTION: getElectionStats
     * ═══════════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE: Get overall election statistics
     * 
     * @return totalCandidates Number of candidates in the election
     * @return totalVotesCast Total number of votes cast
     * @return isVotingActive Whether voting is currently active
     * @return currentAdmin Address of the current admin
     */
    function getElectionStats() public view returns (
        uint totalCandidates,
        uint totalVotesCast,
        bool isVotingActive,
        address currentAdmin
    ) {
        return (
            candidateCount,
            totalVotes,
            votingActive,
            admin
        );
    }
}