/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VOTING CONTRACT TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive tests for the Voting smart contract covering:
 * - Security mechanisms (double voting prevention, access control)
 * - Core functionality (voting, candidate management, results)
 * - Edge cases and error conditions
 * - Gas optimization verification
 * 
 * WHY THESE TESTS MATTER:
 * - Verify security properties documented in our threat model
 * - Ensure trade-offs work as designed
 * - Validate all documented design decisions
 * - Provide confidence for production deployment
 */

const Voting = artifacts.require("Voting");
const { expect } = require("chai");
const truffleAssert = require("truffle-assertions");

contract("Voting", (accounts) => {
  // Test accounts assignment for clarity
  const admin = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const voter3 = accounts[3];
  const unauthorized = accounts[4];
  
  let voting;
  
  beforeEach(async () => {
    // Deploy fresh contract for each test
    voting = await Voting.new({ from: admin });
  });
  
  describe("🏗️ Contract Deployment", () => {
    /**
     * TEST: Verify deployment sets up correct initial state
     * WHY: Ensures contract starts in secure, predictable state
     * SECURITY: Admin role must be properly established
     */
    it("should set deployer as admin", async () => {
      const contractAdmin = await voting.admin();
      expect(contractAdmin).to.equal(admin);
    });
    
    it("should start with voting inactive", async () => {
      const votingActive = await voting.votingActive();
      expect(votingActive).to.be.false;
    });
    
    it("should start with zero candidates and votes", async () => {
      const candidateCount = await voting.candidateCount();
      const totalVotes = await voting.totalVotes();
      expect(candidateCount.toNumber()).to.equal(0);
      expect(totalVotes.toNumber()).to.equal(0);
    });
  });
  
  describe("👑 Admin Functions", () => {
    /**
     * TESTS: Admin access control and functionality
     * WHY: Core security feature - only admin should control setup
     * TRADE-OFF: Centralization vs security (documented in design decisions)
     */
    
    describe("Voter Registration", () => {
      it("should allow admin to register voters", async () => {
        const tx = await voting.registerVoter(voter1, { from: admin });
        
        // Verify state change
        const isRegistered = await voting.registeredVoters(voter1);
        expect(isRegistered).to.be.true;
        
        // Verify event emission
        truffleAssert.eventEmitted(tx, "VoterRegistered", (ev) => {
          return ev.voter === voter1;
        });
      });
      
      it("should prevent non-admin from registering voters", async () => {
        await truffleAssert.reverts(
          voting.registerVoter(voter1, { from: unauthorized }),
          "Only admin can perform this action"
        );
      });
      
      it("should prevent duplicate voter registration", async () => {
        await voting.registerVoter(voter1, { from: admin });
        
        await truffleAssert.reverts(
          voting.registerVoter(voter1, { from: admin }),
          "Voter is already registered"
        );
      });
      
      it("should prevent registering zero address", async () => {
        await truffleAssert.reverts(
          voting.registerVoter("0x0000000000000000000000000000000000000000", { from: admin }),
          "Invalid voter address"
        );
      });
    });
    
    describe("Candidate Management", () => {
      it("should allow admin to add candidates", async () => {
        const tx = await voting.addCandidate("Alice Johnson", { from: admin });
        
        // Verify state changes
        const candidateCount = await voting.candidateCount();
        const candidateName = await voting.candidates(1);
        
        expect(candidateCount.toNumber()).to.equal(1);
        expect(candidateName).to.equal("Alice Johnson");
        
        // Verify event emission
        truffleAssert.eventEmitted(tx, "CandidateAdded", (ev) => {
          return ev.candidateId.toNumber() === 1 && ev.name === "Alice Johnson";
        });
      });
      
      it("should prevent non-admin from adding candidates", async () => {
        await truffleAssert.reverts(
          voting.addCandidate("Alice Johnson", { from: unauthorized }),
          "Only admin can perform this action"
        );
      });
      
      it("should prevent adding candidates with empty names", async () => {
        await truffleAssert.reverts(
          voting.addCandidate("", { from: admin }),
          "Candidate name cannot be empty"
        );
      });
      
      it("should prevent adding candidates with too long names", async () => {
        const longName = "A".repeat(65); // 65 characters
        await truffleAssert.reverts(
          voting.addCandidate(longName, { from: admin }),
          "Candidate name too long"
        );
      });
      
      it("should assign sequential IDs to candidates", async () => {
        await voting.addCandidate("Alice", { from: admin });
        await voting.addCandidate("Bob", { from: admin });
        await voting.addCandidate("Carol", { from: admin });
        
        const count = await voting.candidateCount();
        expect(count.toNumber()).to.equal(3);
        
        const alice = await voting.candidates(1);
        const bob = await voting.candidates(2);
        const carol = await voting.candidates(3);
        
        expect(alice).to.equal("Alice");
        expect(bob).to.equal("Bob");
        expect(carol).to.equal("Carol");
      });
    });
    
    describe("Voting Control", () => {
      it("should allow admin to toggle voting status", async () => {
        // Initially inactive
        let status = await voting.votingActive();
        expect(status).to.be.false;
        
        // Activate voting
        const tx1 = await voting.toggleVoting({ from: admin });
        status = await voting.votingActive();
        expect(status).to.be.true;
        
        // Verify event
        truffleAssert.eventEmitted(tx1, "VotingStatusChanged", (ev) => {
          return ev.active === true;
        });
        
        // Deactivate voting
        const tx2 = await voting.toggleVoting({ from: admin });
        status = await voting.votingActive();
        expect(status).to.be.false;
        
        // Verify event
        truffleAssert.eventEmitted(tx2, "VotingStatusChanged", (ev) => {
          return ev.active === false;
        });
      });
      
      it("should prevent non-admin from toggling voting", async () => {
        await truffleAssert.reverts(
          voting.toggleVoting({ from: unauthorized }),
          "Only admin can perform this action"
        );
      });
    });
    
    describe("Admin Transfer", () => {
      it("should allow admin to transfer admin rights", async () => {
        const tx = await voting.transferAdmin(voter1, { from: admin });
        
        const newAdmin = await voting.admin();
        expect(newAdmin).to.equal(voter1);
        
        // Verify event
        truffleAssert.eventEmitted(tx, "AdminChanged", (ev) => {
          return ev.oldAdmin === admin && ev.newAdmin === voter1;
        });
      });
      
      it("should prevent transferring to zero address", async () => {
        await truffleAssert.reverts(
          voting.transferAdmin("0x0000000000000000000000000000000000000000", { from: admin }),
          "Invalid admin address"
        );
      });
      
      it("should prevent transferring to same admin", async () => {
        await truffleAssert.reverts(
          voting.transferAdmin(admin, { from: admin }),
          "New admin cannot be the same as current admin"
        );
      });
    });
  });
  
  describe("🗳️ Voting Functionality", () => {
    beforeEach(async () => {
      // Set up election for voting tests
      await voting.addCandidate("Alice", { from: admin });
      await voting.addCandidate("Bob", { from: admin });
      await voting.registerVoter(voter1, { from: admin });
      await voting.registerVoter(voter2, { from: admin });
      await voting.toggleVoting({ from: admin }); // Activate voting
    });
    
    /**
     * TESTS: Core voting security mechanisms
     * WHY: Verify our documented security trade-offs work correctly
     * CRITICAL: Double voting prevention, access control, vote integrity
     */
    
    it("should allow registered voters to vote", async () => {
      const tx = await voting.vote(1, { from: voter1 });
      
      // Verify state changes
      const hasVotedStatus = await voting.hasVoted(voter1);
      const voteCount = await voting.voteCounts(1);
      const totalVotes = await voting.totalVotes();
      
      expect(hasVotedStatus).to.be.true;
      expect(voteCount.toNumber()).to.equal(1);
      expect(totalVotes.toNumber()).to.equal(1);
      
      // Verify event
      truffleAssert.eventEmitted(tx, "VoteCast", (ev) => {
        return ev.voter === voter1 && ev.candidateId.toNumber() === 1;
      });
    });
    
    it("should prevent unregistered voters from voting", async () => {
      await truffleAssert.reverts(
        voting.vote(1, { from: unauthorized }),
        "You are not registered to vote"
      );
    });
    
    it("should prevent double voting (CRITICAL SECURITY TEST)", async () => {
      // First vote should succeed
      await voting.vote(1, { from: voter1 });
      
      // Second vote should fail
      await truffleAssert.reverts(
        voting.vote(2, { from: voter1 }),
        "You have already voted"
      );
      
      // Verify vote count didn't change
      const voteCount1 = await voting.voteCounts(1);
      const voteCount2 = await voting.voteCounts(2);
      const totalVotes = await voting.totalVotes();
      
      expect(voteCount1.toNumber()).to.equal(1);
      expect(voteCount2.toNumber()).to.equal(0);
      expect(totalVotes.toNumber()).to.equal(1);
    });
    
    it("should prevent voting when voting is inactive", async () => {
      // Deactivate voting
      await voting.toggleVoting({ from: admin });
      
      await truffleAssert.reverts(
        voting.vote(1, { from: voter1 }),
        "Voting is currently inactive"
      );
    });
    
    it("should prevent voting for non-existent candidates", async () => {
      await truffleAssert.reverts(
        voting.vote(99, { from: voter1 }),
        "Invalid candidate ID"
      );
      
      await truffleAssert.reverts(
        voting.vote(0, { from: voter1 }),
        "Invalid candidate ID"
      );
    });
    
    it("should handle multiple voters correctly", async () => {
      // Multiple voters vote for different candidates
      await voting.vote(1, { from: voter1 }); // Alice
      await voting.vote(2, { from: voter2 }); // Bob
      
      // Verify vote counts
      const aliceVotes = await voting.voteCounts(1);
      const bobVotes = await voting.voteCounts(2);
      const totalVotes = await voting.totalVotes();
      
      expect(aliceVotes.toNumber()).to.equal(1);
      expect(bobVotes.toNumber()).to.equal(1);
      expect(totalVotes.toNumber()).to.equal(2);
    });
  });
  
  describe("📊 Results and View Functions", () => {
    beforeEach(async () => {
      // Set up election with votes
      await voting.addCandidate("Alice", { from: admin });
      await voting.addCandidate("Bob", { from: admin });
      await voting.addCandidate("Carol", { from: admin });
      
      await voting.registerVoter(voter1, { from: admin });
      await voting.registerVoter(voter2, { from: admin });
      await voting.registerVoter(voter3, { from: admin });
      
      await voting.toggleVoting({ from: admin });
      
      // Cast some votes
      await voting.vote(1, { from: voter1 }); // Alice
      await voting.vote(1, { from: voter2 }); // Alice
      await voting.vote(2, { from: voter3 }); // Bob
    });
    
    /**
     * TESTS: Result transparency and accuracy
     * WHY: Verify our transparency-over-privacy design decision
     * CRITICAL: Results must be accurate and verifiable
     */
    
    it("should return correct results", async () => {
      const result = await voting.showResults();
      const votes = result[0].map(v => v.toNumber());
      const names = result[1];
      const winnerId = result[2].toNumber();
      
      expect(votes).to.deep.equal([2, 1, 0]); // Alice: 2, Bob: 1, Carol: 0
      expect(names).to.deep.equal(["Alice", "Bob", "Carol"]);
      expect(winnerId).to.equal(1); // Alice wins
    });
    
    it("should identify correct winner", async () => {
      const result = await voting.getWinner();
      const winnerName = result[0];
      const winnerVotes = result[1].toNumber();
      const winnerExists = result[2];
      
      expect(winnerName).to.equal("Alice");
      expect(winnerVotes).to.equal(2);
      expect(winnerExists).to.be.true;
    });
    
    it("should handle no candidates scenario", async () => {
      // Deploy fresh contract with no candidates
      const emptyVoting = await Voting.new({ from: admin });
      
      const result = await emptyVoting.showResults();
      expect(result[0].length).to.equal(0);
      expect(result[1].length).to.equal(0);
      expect(result[2].toNumber()).to.equal(0);
      
      const winner = await emptyVoting.getWinner();
      expect(winner[0]).to.equal("");
      expect(winner[1].toNumber()).to.equal(0);
      expect(winner[2]).to.be.false;
    });
    
    it("should return correct candidate info", async () => {
      const result = await voting.getCandidateInfo(1);
      expect(result[0]).to.equal("Alice");
      expect(result[1].toNumber()).to.equal(2);
      expect(result[2]).to.be.true;
      
      // Non-existent candidate
      const noCandidate = await voting.getCandidateInfo(99);
      expect(noCandidate[0]).to.equal("");
      expect(noCandidate[1].toNumber()).to.equal(0);
      expect(noCandidate[2]).to.be.false;
    });
    
    it("should return correct voter status", async () => {
      // Voted voter
      const voter1Status = await voting.getVoterStatus(voter1);
      expect(voter1Status[0]).to.be.true; // registered
      expect(voter1Status[1]).to.be.true; // has voted
      expect(voter1Status[2]).to.be.false; // cannot vote
      
      // Unregistered user
      const unauthorizedStatus = await voting.getVoterStatus(unauthorized);
      expect(unauthorizedStatus[0]).to.be.false; // not registered
      expect(unauthorizedStatus[1]).to.be.false; // hasn't voted
      expect(unauthorizedStatus[2]).to.be.false; // cannot vote
    });
    
    it("should return correct election stats", async () => {
      const stats = await voting.getElectionStats();
      expect(stats[0].toNumber()).to.equal(3); // total candidates
      expect(stats[1].toNumber()).to.equal(3); // total votes
      expect(stats[2]).to.be.true; // voting active
      expect(stats[3]).to.equal(admin); // current admin
    });
  });
  
  describe("⛽ Gas Optimization Tests", () => {
    /**
     * TESTS: Verify gas efficiency claims in documentation
     * WHY: Our design prioritizes gas efficiency - verify it works
     */
    
    it("should have reasonable gas costs for voting", async () => {
      await voting.addCandidate("Alice", { from: admin });
      await voting.registerVoter(voter1, { from: admin });
      await voting.toggleVoting({ from: admin });
      
      const tx = await voting.vote(1, { from: voter1 });
      console.log("      Gas used for voting:", tx.receipt.gasUsed);
      
      // Should be under 100k gas (reasonable for a simple vote)
      expect(tx.receipt.gasUsed).to.be.below(100000);
    });
    
    it("should have O(1) voter registration", async () => {
      const gasUsages = [];
      
      // Register multiple voters and measure gas
      for (let i = 1; i <= 5; i++) {
        const tx = await voting.registerVoter(accounts[i], { from: admin });
        gasUsages.push(tx.receipt.gasUsed);
      }
      
      console.log("      Gas usage for voter registration:", gasUsages);
      
      // Gas usage should be consistent (O(1))
      const avgGas = gasUsages.reduce((a, b) => a + b) / gasUsages.length;
      gasUsages.forEach(gas => {
        expect(Math.abs(gas - avgGas)).to.be.below(5000); // Small variance allowed
      });
    });
  });
  
  describe("🔒 Edge Cases and Security", () => {
    /**
     * TESTS: Edge cases and security scenarios
     * WHY: Ensure contract behaves correctly in unusual situations
     */
    
    it("should handle tie scenarios in winner determination", async () => {
      await voting.addCandidate("Alice", { from: admin });
      await voting.addCandidate("Bob", { from: admin });
      
      await voting.registerVoter(voter1, { from: admin });
      await voting.registerVoter(voter2, { from: admin });
      await voting.toggleVoting({ from: admin });
      
      // Create a tie
      await voting.vote(1, { from: voter1 });
      await voting.vote(2, { from: voter2 });
      
      const winner = await voting.getWinner();
      // Should return the first candidate in case of tie (Alice, ID 1)
      expect(winner[0]).to.equal("Alice");
      expect(winner[1].toNumber()).to.equal(1);
    });
    
    it("should maintain state consistency after admin transfer", async () => {
      // Set up initial state
      await voting.addCandidate("Alice", { from: admin });
      await voting.registerVoter(voter1, { from: admin });
      
      // Transfer admin
      await voting.transferAdmin(voter2, { from: admin });
      
      // New admin should be able to continue operations
      await voting.addCandidate("Bob", { from: voter2 });
      await voting.registerVoter(voter3, { from: voter2 });
      
      // Verify state
      const candidateCount = await voting.candidateCount();
      const isVoter1Registered = await voting.registeredVoters(voter1);
      const isVoter3Registered = await voting.registeredVoters(voter3);
      
      expect(candidateCount.toNumber()).to.equal(2);
      expect(isVoter1Registered).to.be.true;
      expect(isVoter3Registered).to.be.true;
    });
  });
  
  describe("📝 Event Emission Tests", () => {
    /**
     * TESTS: Verify all events are emitted correctly
     * WHY: Events provide audit trail - critical for transparency
     */
    
    it("should emit all required events", async () => {
      // Test VoterRegistered event
      let tx = await voting.registerVoter(voter1, { from: admin });
      truffleAssert.eventEmitted(tx, "VoterRegistered");
      
      // Test CandidateAdded event
      tx = await voting.addCandidate("Alice", { from: admin });
      truffleAssert.eventEmitted(tx, "CandidateAdded");
      
      // Test VotingStatusChanged event
      tx = await voting.toggleVoting({ from: admin });
      truffleAssert.eventEmitted(tx, "VotingStatusChanged");
      
      // Test VoteCast event
      tx = await voting.vote(1, { from: voter1 });
      truffleAssert.eventEmitted(tx, "VoteCast");
      
      // Test AdminChanged event
      tx = await voting.transferAdmin(voter2, { from: admin });
      truffleAssert.eventEmitted(tx, "AdminChanged");
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * TEST SUMMARY
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This test suite verifies:
 * ✅ All documented security mechanisms work correctly
 * ✅ Trade-offs behave as designed and documented
 * ✅ Core functionality meets requirements
 * ✅ Gas optimization claims are validated
 * ✅ Edge cases are handled properly
 * ✅ Event emission provides complete audit trail
 * 
 * Coverage includes:
 * - Double voting prevention (CRITICAL)
 * - Access control enforcement
 * - Vote integrity and counting accuracy
 * - Result transparency and verification
 * - Admin functionality and security
 * - Gas efficiency validation
 * - Edge case handling
 * 
 * These tests provide confidence that our documented design decisions
 * and security trade-offs work correctly in practice.
 */