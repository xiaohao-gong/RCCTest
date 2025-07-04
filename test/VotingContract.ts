import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingContract", function () {
  let votingContract: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;
  let addr4: any;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    
    const VotingContractFactory = await ethers.getContractFactory("VotingContract");
    votingContract = await VotingContractFactory.deploy();
  });

  describe("部署和初始化", function () {
    it("应该正确设置部署者", async function () {
      expect(await votingContract.deployer()).to.equal(owner.address);
    });

    it("初始状态应该是未开始投票", async function () {
      const [active, endTime, currentTime] = await votingContract.getVotingStatus();
      expect(active).to.be.false;
      expect(endTime).to.equal(0);
    });

    it("初始候选人数量应该为0", async function () {
      expect(await votingContract.getCandidateCount()).to.equal(0);
    });
  });

  describe("添加候选人", function () {
    it("部署者应该能够添加候选人", async function () {
      await expect(votingContract.addCandidate("候选人1"))
        .to.emit(votingContract, "CandidateAdded")
        .withArgs("候选人1", 0);

      expect(await votingContract.getCandidateCount()).to.equal(1);
      
      const [name, voteCount, exists] = await votingContract.getCandidate(0);
      expect(name).to.equal("候选人1");
      expect(voteCount).to.equal(0);
      expect(exists).to.be.true;
    });

    it("非部署者不能添加候选人", async function () {
      await expect(
        votingContract.connect(addr1).addCandidate("候选人1")
      ).to.be.revertedWith("Only deployer can call this function");
    });

    it("不能添加空名字的候选人", async function () {
      await expect(
        votingContract.addCandidate("")
      ).to.be.revertedWith("Candidate name cannot be empty");
    });

    it("可以添加多个候选人", async function () {
      await votingContract.addCandidate("候选人1");
      await votingContract.addCandidate("候选人2");
      await votingContract.addCandidate("候选人3");

      expect(await votingContract.getCandidateCount()).to.equal(3);
      
      const [name1, , ] = await votingContract.getCandidate(0);
      const [name2, , ] = await votingContract.getCandidate(1);
      const [name3, , ] = await votingContract.getCandidate(2);
      
      expect(name1).to.equal("候选人1");
      expect(name2).to.equal("候选人2");
      expect(name3).to.equal("候选人3");
    });
  });

  describe("开始投票", function () {
    beforeEach(async function () {
      await votingContract.addCandidate("候选人1");
      await votingContract.addCandidate("候选人2");
    });

    it("部署者应该能够开始投票", async function () {
      const durationInMinutes = 60; // 1小时
      await expect(votingContract.startVoting(durationInMinutes))
        .to.emit(votingContract, "VotingStarted");

      const [active, endTime, currentTime] = await votingContract.getVotingStatus();
      expect(active).to.be.true;
      expect(endTime).to.be.gt(currentTime);
    });

    it("非部署者不能开始投票", async function () {
      await expect(
        votingContract.connect(addr1).startVoting(60)
      ).to.be.revertedWith("Only deployer can call this function");
    });

    it("没有候选人时不能开始投票", async function () {
      const VotingContractFactory = await ethers.getContractFactory("VotingContract");
      const newVotingContract = await VotingContractFactory.deploy();
      
      await expect(
        newVotingContract.startVoting(60)
      ).to.be.revertedWith("No candidates added");
    });

    it("投票已经开始后不能再次开始", async function () {
      await votingContract.startVoting(60);
      
      await expect(
        votingContract.startVoting(60)
      ).to.be.revertedWith("Voting is already active");
    });

    it("投票开始后不能添加候选人", async function () {
      await votingContract.startVoting(60);
      
      await expect(
        votingContract.addCandidate("候选人3")
      ).to.be.revertedWith("Cannot add candidates after voting starts");
    });
  });

  describe("投票", function () {
    beforeEach(async function () {
      await votingContract.addCandidate("候选人1");
      await votingContract.addCandidate("候选人2");
      await votingContract.startVoting(60); // 1小时
    });

    it("用户应该能够投票", async function () {
      await expect(votingContract.connect(addr1).vote(0))
        .to.emit(votingContract, "VoteCast")
        .withArgs(addr1.address, 0);

      const [hasVoted, votedFor] = await votingContract.getVoter(addr1.address);
      expect(hasVoted).to.be.true;
      expect(votedFor).to.equal(0);

      const [, voteCount, ] = await votingContract.getCandidate(0);
      expect(voteCount).to.equal(1);
    });

    it("用户不能重复投票", async function () {
      await votingContract.connect(addr1).vote(0);
      
      await expect(
        votingContract.connect(addr1).vote(1)
      ).to.be.revertedWith("Already voted");
    });

    it("不能投票给不存在的候选人", async function () {
      await expect(
        votingContract.connect(addr1).vote(5)
      ).to.be.revertedWith("Invalid candidate ID");
    });

    it("多个用户可以投票给不同候选人", async function () {
      await votingContract.connect(addr1).vote(0);
      await votingContract.connect(addr2).vote(1);
      await votingContract.connect(addr3).vote(0);

      const [, voteCount0, ] = await votingContract.getCandidate(0);
      const [, voteCount1, ] = await votingContract.getCandidate(1);
      
      expect(voteCount0).to.equal(2);
      expect(voteCount1).to.equal(1);
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      await votingContract.addCandidate("候选人1");
      await votingContract.addCandidate("候选人2");
      await votingContract.startVoting(60);
    });

    it("应该能正确查询候选人信息", async function () {
      const [name, voteCount, exists] = await votingContract.getCandidate(0);
      expect(name).to.equal("候选人1");
      expect(voteCount).to.equal(0);
      expect(exists).to.be.true;
    });

    it("应该能正确查询投票者信息", async function () {
      await votingContract.connect(addr1).vote(0);
      
      const [hasVoted, votedFor] = await votingContract.getVoter(addr1.address);
      expect(hasVoted).to.be.true;
      expect(votedFor).to.equal(0);
    });

    it("未投票的用户应该显示正确的状态", async function () {
      const [hasVoted, votedFor] = await votingContract.getVoter(addr1.address);
      expect(hasVoted).to.be.false;
      expect(votedFor).to.equal(0);
    });
  });

  describe("投票结果", function () {
    beforeEach(async function () {
      await votingContract.addCandidate("候选人1");
      await votingContract.addCandidate("候选人2");
      await votingContract.addCandidate("候选人3");
      await votingContract.startVoting(1); // 1分钟
    });

    it("投票未结束时不能获取获胜者", async function () {
      await expect(
        votingContract.getWinner()
      ).to.be.revertedWith("Voting has not ended yet");
    });

    it("投票未结束时不能获取所有结果", async function () {
      await expect(
        votingContract.getAllResults()
      ).to.be.revertedWith("Voting has not ended yet");
    });

    it("投票结束后应该能获取获胜者", async function () {
      // 进行一些投票
      await votingContract.connect(addr1).vote(0);
      await votingContract.connect(addr2).vote(1);
      await votingContract.connect(addr3).vote(0);
      await votingContract.connect(addr4).vote(2);

      // 等待投票结束
      await ethers.provider.send("evm_increaseTime", [61]); // 增加61秒
      await ethers.provider.send("evm_mine", []);

      const [winnerId, winnerName, winnerVotes] = await votingContract.getWinner();
      expect(winnerId).to.equal(0); // 候选人1应该获胜
      expect(winnerName).to.equal("候选人1");
      expect(winnerVotes).to.equal(2);
    });

    it("投票结束后应该能获取所有结果", async function () {
      // 进行一些投票
      await votingContract.connect(addr1).vote(0);
      await votingContract.connect(addr2).vote(1);
      await votingContract.connect(addr3).vote(0);

      // 等待投票结束
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);

      const [names, voteCounts] = await votingContract.getAllResults();
      expect(names).to.deep.equal(["候选人1", "候选人2", "候选人3"]);
      expect(voteCounts).to.deep.equal([2, 1, 0]);
    });

    it("投票结束后不能继续投票", async function () {
      // 等待投票结束
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        votingContract.connect(addr1).vote(0)
      ).to.be.revertedWith("Voting has ended");
    });
  });

  describe("边界情况", function () {
    it("平票情况下应该返回第一个最高票数的候选人", async function () {
      await votingContract.addCandidate("候选人1");
      await votingContract.addCandidate("候选人2");
      await votingContract.startVoting(1);

      // 平票投票
      await votingContract.connect(addr1).vote(0);
      await votingContract.connect(addr2).vote(1);

      // 等待投票结束
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);

      const [winnerId, winnerName, winnerVotes] = await votingContract.getWinner();
      expect(winnerId).to.equal(0); // 应该返回第一个候选人
      expect(winnerVotes).to.equal(1);
    });

    it("没有投票时获胜者应该得0票", async function () {
      await votingContract.addCandidate("候选人1");
      await votingContract.startVoting(1);

      // 等待投票结束
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);

      const [winnerId, winnerName, winnerVotes] = await votingContract.getWinner();
      expect(winnerId).to.equal(0);
      expect(winnerVotes).to.equal(0);
    });
  });
}); 