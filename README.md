
# 智能合约项目

这个项目包含两个智能合约：

## 1. UsernameRegistry 合约

一个简单的用户名注册合约，允许用户注册唯一的用户名。

### 功能
- 用户注册用户名
- 查询地址对应的用户名
- 查询自己的用户名

### 使用方法
```solidity
// 注册用户名
register("myUsername")

// 查询某个地址的用户名
getUsername(address)

// 查询自己的用户名
myUsername()
```

## 2. VotingContract 合约

一个完整的投票系统合约，支持多候选人投票。

### 功能特性
- ✅ 部署者指定多个候选人
- ✅ 设置投票截止时间
- ✅ 每个地址只能投一票
- ✅ 实时统计得票情况
- ✅ 投票结束后查看结果

### 主要功能

#### 部署者功能
- `addCandidate(string name)` - 添加候选人
- `startVoting(uint256 durationInMinutes)` - 开始投票并设置时长

#### 投票者功能
- `vote(uint256 candidateId)` - 投票给指定候选人

#### 查询功能
- `getCandidate(uint256 candidateId)` - 查询候选人信息
- `getVoter(address voterAddress)` - 查询投票者信息
- `getCandidateCount()` - 获取候选人总数
- `getVotingStatus()` - 获取投票状态
- `getWinner()` - 获取获胜者（投票结束后）
- `getAllResults()` - 获取所有候选人的得票情况（投票结束后）

### 使用流程

1. **部署合约**
   ```bash
   npx hardhat run scripts/deploy-voting.ts
   ```

2. **添加候选人**（仅部署者）
   ```solidity
   addCandidate("张三")
   addCandidate("李四")
   addCandidate("王五")
   ```

3. **开始投票**（仅部署者）
   ```solidity
   startVoting(60) // 投票持续60分钟
   ```

4. **用户投票**
   ```solidity
   vote(0) // 投票给候选人0（张三）
   vote(1) // 投票给候选人1（李四）
   ```

5. **查看结果**（投票结束后）
   ```solidity
   getWinner() // 获取获胜者
   getAllResults() // 获取所有结果
   ```

### 安全特性
- 只有部署者可以添加候选人和开始投票
- 每个地址只能投一票
- 投票开始后不能添加候选人
- 投票结束后不能继续投票
- 投票未结束时不能查看结果

### 测试

运行所有测试：
```bash
npx hardhat test
```

运行特定测试：
```bash
npx hardhat test test/VotingContract.ts
npx hardhat test test/UsernameRegistry.ts
```

### 部署

部署投票合约：
```bash
npx hardhat run scripts/deploy-voting.ts
```

## 技术栈

- Solidity ^0.8.0
- Hardhat
- TypeScript
- Chai (测试框架)
- Ethers.js

## 项目结构

```
RCCtest/
├── contracts/
│   ├── UsernameRegistry.sol
│   └── VotingContract.sol
├── test/
│   ├── UsernameRegistry.ts
│   └── VotingContract.ts
├── scripts/
│   └── deploy-voting.ts
├── hardhat.config.ts
└── README.md
```
