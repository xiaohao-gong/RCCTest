import { ethers } from "hardhat";

async function main() {
  console.log("开始部署投票合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址:", deployer.address);

  // 部署投票合约
  const VotingContract = await ethers.getContractFactory("VotingContract");
  const votingContract = await VotingContract.deploy();
  console.log("投票合约已部署到:", await votingContract.getAddress());

  // 添加候选人
  console.log("\n添加候选人...");
  await votingContract.addCandidate("张三");
  await votingContract.addCandidate("李四");
  await votingContract.addCandidate("王五");
  console.log("已添加3个候选人");

  // 开始投票（设置投票时长为10分钟）
  console.log("\n开始投票...");
  await votingContract.startVoting(10); // 10分钟
  console.log("投票已开始，持续10分钟");

  // 显示投票状态
  const [active, endTime, currentTime] = await votingContract.getVotingStatus();
  console.log("投票状态:", {
    active: active,
    endTime: new Date(Number(endTime) * 1000).toLocaleString(),
    currentTime: new Date(Number(currentTime) * 1000).toLocaleString()
  });

  // 显示候选人信息
  console.log("\n候选人信息:");
  for (let i = 0; i < 3; i++) {
    const [name, voteCount, exists] = await votingContract.getCandidate(i);
    console.log(`候选人${i}: ${name}, 得票: ${voteCount}`);
  }

  console.log("\n部署完成！");
  console.log("合约地址:", await votingContract.getAddress());
  console.log("\n使用说明:");
  console.log("1. 调用 vote(candidateId) 进行投票");
  console.log("2. 调用 getVotingStatus() 查看投票状态");
  console.log("3. 投票结束后调用 getWinner() 查看获胜者");
  console.log("4. 调用 getAllResults() 查看所有结果");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 