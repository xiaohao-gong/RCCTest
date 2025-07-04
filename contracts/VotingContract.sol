// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingContract {
    // 候选人结构
    struct Candidate {
        string name;
        uint256 voteCount;
        bool exists;
    }
    
    // 投票者结构
    struct Voter {
        bool hasVoted;
        uint256 votedFor;
    }
    
    // 状态变量
    address public deployer;
    uint256 public votingEndTime;
    bool public votingActive;
    
    // 候选人数组
    Candidate[] public candidates;
    
    // 投票者映射
    mapping(address => Voter) public voters;
    
    // 事件
    event CandidateAdded(string name, uint256 candidateId);
    event VoteCast(address voter, uint256 candidateId);
    event VotingStarted(uint256 endTime);
    event VotingEnded();
    
    // 修饰符
    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer can call this function");
        _;
    }
    
    modifier votingNotEnded() {
        require(block.timestamp < votingEndTime, "Voting has ended");
        require(votingActive, "Voting is not active");
        _;
    }
    
    modifier votingEnded() {
        require(block.timestamp >= votingEndTime, "Voting has not ended yet");
        _;
    }
    
    constructor() {
        deployer = msg.sender;
        votingActive = false;
    }
    
    // 添加候选人（只有部署者可以调用）
    function addCandidate(string calldata name) external onlyDeployer {
        require(!votingActive, "Cannot add candidates after voting starts");
        require(bytes(name).length > 0, "Candidate name cannot be empty");
        
        candidates.push(Candidate({
            name: name,
            voteCount: 0,
            exists: true
        }));
        
        emit CandidateAdded(name, candidates.length - 1);
    }
    
    // 开始投票（只有部署者可以调用）
    function startVoting(uint256 durationInMinutes) external onlyDeployer {
        require(candidates.length > 0, "No candidates added");
        require(!votingActive, "Voting is already active");
        
        votingEndTime = block.timestamp + (durationInMinutes * 1 minutes);
        votingActive = true;
        
        emit VotingStarted(votingEndTime);
    }
    
    // 投票
    function vote(uint256 candidateId) external votingNotEnded {
        require(candidateId < candidates.length, "Invalid candidate ID");
        require(candidates[candidateId].exists, "Candidate does not exist");
        require(!voters[msg.sender].hasVoted, "Already voted");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedFor = candidateId;
        candidates[candidateId].voteCount++;
        
        emit VoteCast(msg.sender, candidateId);
    }
    
    // 查询候选人信息
    function getCandidate(uint256 candidateId) external view returns (string memory name, uint256 voteCount, bool exists) {
        require(candidateId < candidates.length, "Invalid candidate ID");
        Candidate memory candidate = candidates[candidateId];
        return (candidate.name, candidate.voteCount, candidate.exists);
    }
    
    // 查询投票者信息
    function getVoter(address voterAddress) external view returns (bool hasVoted, uint256 votedFor) {
        Voter memory voter = voters[voterAddress];
        return (voter.hasVoted, voter.votedFor);
    }
    
    // 获取候选人总数
    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }
    
    // 获取投票状态
    function getVotingStatus() external view returns (bool active, uint256 endTime, uint256 currentTime) {
        return (votingActive, votingEndTime, block.timestamp);
    }
    
    // 获取获胜者（投票结束后调用）
    function getWinner() external view votingEnded returns (uint256 winnerId, string memory winnerName, uint256 winnerVotes) {
        require(candidates.length > 0, "No candidates");
        
        uint256 winningVoteCount = 0;
        uint256 winningCandidateId = 0;
        
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }
        
        return (winningCandidateId, candidates[winningCandidateId].name, winningVoteCount);
    }
    
    // 获取所有候选人的得票情况
    function getAllResults() external view votingEnded returns (string[] memory names, uint256[] memory voteCounts) {
        names = new string[](candidates.length);
        voteCounts = new uint256[](candidates.length);
        
        for (uint256 i = 0; i < candidates.length; i++) {
            names[i] = candidates[i].name;
            voteCounts[i] = candidates[i].voteCount;
        }
        
        return (names, voteCounts);
    }
} 