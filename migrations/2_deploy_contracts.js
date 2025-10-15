/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VOTING CONTRACT DEPLOYMENT MIGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This migration script deploys the Voting contract and performs initial setup.
 * 
 * DEPLOYMENT STRATEGY:
 * 1. Deploy the contract (deployer becomes admin automatically)
 * 2. Add initial candidates (if specified)
 * 3. Register initial voters (if specified)
 * 4. Optionally activate voting
 * 
 * DESIGN DECISIONS:
 * • Simple deployment for educational purposes
 * • Admin can customize setup after deployment
 * • Gas-efficient deployment process
 * 
 * SECURITY CONSIDERATIONS:
 * • Deployer becomes admin - ensure secure deployment account
 * • Initial setup should be done carefully
 * • Consider admin transfer after setup if needed
 */

const Voting = artifacts.require("Voting");

module.exports = function (deployer, network, accounts) {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🗳️  DEPLOYING VOTING CONTRACT");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("Network:", network);
  console.log("Deployer:", accounts[0]);
  console.log("Available accounts:", accounts.length);
  
  deployer.deploy(Voting).then(async (instance) => {
    console.log("✅ Voting contract deployed at:", instance.address);
    console.log("🔑 Admin address:", accounts[0]);
    
    // OPTIONAL: Add initial candidates for demo purposes
    if (network === "development" || network === "ganache") {
      console.log("\n🏃‍♂️ Setting up demo data for local development...");
      
      try {
        // Add demo candidates
        await instance.addCandidate("Alice Johnson", { from: accounts[0] });
        await instance.addCandidate("Bob Smith", { from: accounts[0] });
        await instance.addCandidate("Carol Williams", { from: accounts[0] });
        console.log("✅ Added 3 demo candidates");
        
        // Register demo voters (using other accounts)
        const votersToRegister = accounts.slice(1, 6); // Use accounts 1-5 as voters
        for (let i = 0; i < votersToRegister.length; i++) {
          await instance.registerVoter(votersToRegister[i], { from: accounts[0] });
        }
        console.log(`✅ Registered ${votersToRegister.length} demo voters`);
        
        // Activate voting for immediate testing
        await instance.toggleVoting({ from: accounts[0] });
        console.log("✅ Voting activated");
        
        console.log("\n📊 DEPLOYMENT SUMMARY:");
        console.log("Contract Address:", instance.address);
        console.log("Admin:", accounts[0]);
        console.log("Candidates: Alice Johnson, Bob Smith, Carol Williams");
        console.log("Registered Voters:", votersToRegister.join(", "));
        console.log("Voting Status: Active");
        
      } catch (error) {
        console.error("❌ Error setting up demo data:", error.message);
      }
    }
    
    // For testnet/mainnet deployment
    if (network === "sepolia" || network === "mainnet") {
      console.log("\n⚠️  PRODUCTION DEPLOYMENT NOTES:");
      console.log("1. Contract deployed with admin:", accounts[0]);
      console.log("2. Add candidates using: contract.addCandidate()");
      console.log("3. Register voters using: contract.registerVoter()");
      console.log("4. Activate voting using: contract.toggleVoting()");
      console.log("5. Consider transferring admin to multi-sig wallet");
    }
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("═══════════════════════════════════════════════════════════");
  });
};