// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UsernameRegistry {
    // 映射：地址 => 用户名
    mapping(address => string) private usernames;

    // 注册事件
    event Registered(address indexed user, string username);

    // 注册用户名，每个地址只能注册一次
    function register(string calldata username) external {
        require(bytes(usernames[msg.sender]).length == 0, "Already registered");
        require(bytes(username).length > 0, "Username cannot be empty");
        usernames[msg.sender] = username;
        emit Registered(msg.sender, username);
    }

    // 查询某个地址的用户名
    function getUsername(address user) external view returns (string memory) {
        return usernames[user];
    }

    // 查询自己注册的用户名
    function myUsername() external view returns (string memory) {
        return usernames[msg.sender];
    }
} 