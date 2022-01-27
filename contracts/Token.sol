// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.4;

import "./ERC20.sol";

contract Token is ERC20 {

    address public owner;
    uint16 public contractFee;
    uint16 public burnFee;

    uint16 public constant base = 10000;

    //==========// Initializer //==========//
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        owner = msg.sender;
        contractFee = 500;
        burnFee = 500; 

        _mint(msg.sender, 1000 ether);
    }

    //==========//External Functions //==========//

    function updateFeePercent(uint16 _burnFee, uint16 _contractFee) public {
        require(msg.sender == owner , "ERR : Auth failed");
        require(_burnFee + _contractFee < base, "ERR : Fee cannot be 100%");
        burnFee = _burnFee;
        contractFee = _contractFee;
    }

        //==========//Internal Functions //==========//

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);

        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");

        (uint256 burnAmt, uint256 contractAmt, uint256 toRecieverAmt) = calculateAmounts(amount);

        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += toRecieverAmt;
        _balances[address(this)] += contractAmt;
        _totalSupply -= burnAmt; // tx gas cost saving

        emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);

    }

    function calculateAmounts(uint256 amounts) public view returns(uint256 burnAmt, uint256 contractAmt, uint256 toRecieverAmt){
        burnAmt = (amounts * burnFee)/base;
        contractAmt = (amounts * contractFee)/base;
        toRecieverAmt = amounts - (burnAmt + contractAmt);

        // NOTE : NOT USING SAFE MATH HERE , DUE TO BREAKING CHANGEs IN ^0.8.x.
    }
}
