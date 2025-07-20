import { expect } from "chai";
import { ethers } from "hardhat";

describe("MessageBoard", function () {
  let messageBoard: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MessageBoardFactory = await ethers.getContractFactory("MessageBoard");
    messageBoard = await MessageBoardFactory.deploy();
  });

  it("用户可以成功留言并触发事件", async function () {
    await expect(messageBoard.connect(addr1).post("Hello, world!"))
      .to.emit(messageBoard, "MessagePosted")
      .withArgs(addr1.address, "Hello, world!");
  });

  it("不能发送空留言", async function () {
    await expect(messageBoard.connect(addr1).post(""))
      .to.be.revertedWith("Message cannot be empty");
  });

  it("留言条数统计正确", async function () {
    expect(await messageBoard.getMessageCount()).to.equal(0);
    await messageBoard.connect(addr1).post("msg1");
    await messageBoard.connect(addr2).post("msg2");
    expect(await messageBoard.getMessageCount()).to.equal(2);
  });

  it("能正确获取最新留言", async function () {
    await messageBoard.connect(addr1).post("first");
    await messageBoard.connect(addr2).post("second");
    const [sender, content] = await messageBoard.getLatestMessage();
    expect(sender).to.equal(addr2.address);
    expect(content).to.equal("second");
  });

  it("没有留言时获取最新留言应报错", async function () {
    await expect(messageBoard.getLatestMessage()).to.be.revertedWith("No messages yet");
  });
}); 