//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.4;

contract Math {
    /**
     * Taken from uniswap-v2-core
     */
    function sqrt(uint256 y) public pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function sqrtFloating(uint256 val) public pure returns(uint256 res){
        res = sqrt(val * 1 ether); // returns precision upto 9 points
    }
}
