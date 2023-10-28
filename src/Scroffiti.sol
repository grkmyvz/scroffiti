// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Scroffiti {
    address public owner;

    bytes32[] public scroffitis;
    uint256 public bestScroffitiIndex;
    uint256 public bestScroffitiPoint;

    uint256 public constant moveUpFee = 0.001 ether;

    mapping(uint256 => uint256) public scroffitiPoints;

    event ScroffitiWritten(address indexed author, bytes32 message);
    event ScroffitiMovedUp(address indexed sender, uint256 scroffitiIndex);

    constructor() {
        owner = msg.sender;
    }

    function count() public view returns (uint256) {
        return scroffitis.length;
    }

    function read(uint256 index) public view returns (bytes32) {
        return scroffitis[index];
    }

    function write(bytes32 message) public {
        scroffitis.push(message);

        emit ScroffitiWritten(msg.sender, message);
    }

    function moveUp(uint256 _index) public payable {
        require(msg.value == moveUpFee, "Just send 0.001 ETH");
        require(_index < scroffitis.length, "Invalid index");

        scroffitiPoints[_index] += 1;
        if (scroffitiPoints[_index] > bestScroffitiPoint) {
            bestScroffitiPoint = scroffitiPoints[_index];
            bestScroffitiIndex = _index;
        }

        emit ScroffitiMovedUp(msg.sender, _index);
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}

    fallback() external payable {}
}
