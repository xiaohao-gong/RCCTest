// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageBoard {
    // 留言结构体
    struct Message {
        address sender;
        string content;
    }

    // 留言数组
    Message[] private messages;

    // 留言事件
    event MessagePosted(address indexed sender, string message);

    // 用户发送留言
    function post(string calldata message) external {
        require(bytes(message).length > 0, "Message cannot be empty");
        messages.push(Message({sender: msg.sender, content: message}));
        emit MessagePosted(msg.sender, message);
    }

    // 获取留言条数
    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }

    // 获取最新留言
    function getLatestMessage() external view returns (address sender, string memory content) {
        require(messages.length > 0, "No messages yet");
        Message memory m = messages[messages.length - 1];
        return (m.sender, m.content);
    }
} 