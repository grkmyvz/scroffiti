// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Scroffiti.sol";
import "./utils/Users.sol";

contract ScroffitiTest is Test {
    Scroffiti scroffiti;
    Users public users;

    uint256 public constant DEFAULT_WALLET_BALANCE = 100 ether;

    modifier writeScroffiti(uint256 count) {
        for (uint256 i = 0; i < count; i++) {
            vm.prank(users.user1);
            scroffiti.write(
                0x48656c6c6f205363726f6c6c2121000000000000000000000000000000000000
            );
        }
        _;
    }

    modifier moveUpScroffiti(uint256 index) {
        vm.prank(users.user1);
        scroffiti.moveUp{value: 0.001 ether}(index);
        _;
    }

    event ScroffitiWritten(address indexed author, bytes32 message);
    event ScroffitiMovedUp(address indexed sender, uint256 scroffitiIndex);

    constructor() {}

    function createUser(string memory name) internal returns (address payable) {
        address payable user = payable(makeAddr(name));
        vm.deal({account: user, newBalance: DEFAULT_WALLET_BALANCE});
        return user;
    }

    function setUp() public {
        users = Users({
            owner: createUser("owner"),
            user1: createUser("user1"),
            user2: createUser("user2")
        });

        vm.prank(users.owner);
        scroffiti = new Scroffiti();
    }

    function test_ShouldBeSetup() public {
        assertEq(users.owner.balance, DEFAULT_WALLET_BALANCE);
        assertEq(users.user1.balance, DEFAULT_WALLET_BALANCE);
        assertEq(users.user2.balance, DEFAULT_WALLET_BALANCE);

        assertTrue(address(scroffiti) != address(0));
        assertEq(scroffiti.owner(), address(users.owner));

        // For debug
        /* emit log_named_address("owner", address(users.owner));
        emit log_named_address("user1", address(users.user1));
        emit log_named_address("user2", address(users.user2));
        emit log_named_address("scroffiti", address(scroffiti));
        emit log_named_address("scroffiti.owner", address(scroffiti.owner())); */
    }

    function test_ShouldBeReturnZero_count() public {
        assertEq(scroffiti.count(), 0);
    }

    function test_ShouldBeReturnOne_count() public writeScroffiti(5) {
        assertEq(scroffiti.count(), 5);
    }

    function test_ShouldBeReturnMessage_read() public writeScroffiti(1) {
        assertEq(
            scroffiti.read(0),
            0x48656c6c6f205363726f6c6c2121000000000000000000000000000000000000
        );
    }

    function test_ShouldBeWriteMessage_write() public {
        vm.prank(users.user1);
        vm.expectEmit(address(scroffiti));
        emit ScroffitiWritten(
            users.user1,
            0x48656c6c6f205363726f6c6c2121000000000000000000000000000000000000
        );
        scroffiti.write(
            0x48656c6c6f205363726f6c6c2121000000000000000000000000000000000000
        );

        assertEq(scroffiti.count(), 1);
        assertEq(
            scroffiti.read(0),
            0x48656c6c6f205363726f6c6c2121000000000000000000000000000000000000
        );

        vm.prank(users.user2);
        vm.expectEmit(address(scroffiti));
        emit ScroffitiWritten(
            users.user2,
            0x5363726f66666974692054657374204d65737361676500000000000000000000
        );
        scroffiti.write(
            0x5363726f66666974692054657374204d65737361676500000000000000000000
        );

        assertEq(scroffiti.count(), 2);
        assertEq(
            scroffiti.read(1),
            0x5363726f66666974692054657374204d65737361676500000000000000000000
        );
    }

    function test_ShouldBeSendDonate_donate() public writeScroffiti(5) {
        // Must donate to second scroffiti by user2
        vm.prank(users.user2);
        vm.expectEmit(address(scroffiti));
        emit ScroffitiMovedUp(users.user2, 1);
        scroffiti.moveUp{value: 0.001 ether}(1);

        assertEq(scroffiti.scroffitiPoints(1), 1);
        assertEq(scroffiti.bestScroffitiIndex(), 1);
        assertEq(scroffiti.bestScroffitiPoint(), 1);
    }

    function test_ShouldBeRevertValueError_dotate() public writeScroffiti(5) {
        vm.prank(users.user2);
        vm.expectRevert("Just send 0.001 ETH");
        scroffiti.moveUp{value: 0.002 ether}(1);

        vm.prank(users.user2);
        vm.expectRevert("Just send 0.001 ETH");
        scroffiti.moveUp{value: 0.0005 ether}(1);
    }

    function test_ShouldBeRevertInvalidIndexError_donate() public {
        vm.prank(users.user2);
        vm.expectRevert("Invalid index");
        scroffiti.moveUp{value: 0.001 ether}(1);
    }

    function test_ShouldBeWithdrawEther_withdraw()
        public
        writeScroffiti(1)
        moveUpScroffiti(0)
    {
        uint256 ownerBalanceBefore = address(users.owner).balance;
        vm.prank(users.owner);
        scroffiti.withdraw();

        assertEq(
            address(users.owner).balance,
            ownerBalanceBefore + scroffiti.moveUpFee()
        );
    }

    function test_ShouldBeRevertOnlyOwnerError_withdraw()
        public
        writeScroffiti(1)
        moveUpScroffiti(0)
    {
        vm.prank(users.user1);
        vm.expectRevert("Only owner can withdraw");
        scroffiti.withdraw();
    }
}
