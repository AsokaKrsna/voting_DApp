# Code Comment Standards

## Purpose
Simple guidelines for commenting code in this voting DApp to maintain consistency and clarity.

## Comment Types

### 1. **Function Headers**
```solidity
/**
 * @dev Register a new voter (admin only)
 * @param _voter Address of the voter to register
 */
function registerVoter(address _voter) public onlyAdmin {
```

### 2. **Security Notes**
```solidity
// SECURITY: Prevent double voting
require(!hasVoted[msg.sender], "Already voted");
```

### 3. **Design Decisions**
```solidity
// DESIGN: Admin-controlled for Sybil attack prevention
address public admin;
```

### 4. **Trade-off Explanations**
```solidity
// TRADE-OFF: Public voting status enables transparency but reduces privacy
mapping(address => bool) public hasVoted;
```

## Standards

- **Be concise** - Explain why, not what
- **Focus on decisions** - Document reasoning behind choices  
- **Highlight security** - Mark all security-related code
- **Note trade-offs** - Explain what we sacrifice and why

## When to Comment

- All public functions
- Security-critical code  
- Non-obvious design decisions
- Trade-offs between competing priorities

---

*Keep it simple. Code should be self-documenting with strategic comments explaining the 'why'.*