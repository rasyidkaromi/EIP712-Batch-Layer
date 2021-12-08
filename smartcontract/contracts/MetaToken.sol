// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "subtraction overflow");
        return a - b;
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        return a - b;
    }
}

contract MetaToken  {
    event Transfer(address indexed from, address indexed to, uint256 value);

    using SafeMath for uint256;

    string public name = "MetaToken";
    string public symbol = "MT";
    uint256 public totalSupply = 1000000;
    uint8 public decimals = 18;
    address public owner;
    mapping(address => uint256) balances;
    address public currentContextAddress;

    constructor() {
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    function transfer(address recipient, uint256 amount) public virtual returns (bool){
        _transfer(_getCurrentContextAddress(), recipient, amount);
        return true;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function _transfer(address sender,address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        uint256 senderBalance = balances[sender];
        require(senderBalance >= amount,"ERC20: transfer amount exceeds balance");

        balances[sender] = balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
        balances[recipient] = balances[recipient].add(amount);

        emit Transfer(sender, recipient, amount);
    }

    function _getCurrentContextAddress() internal view returns (address) {
        address currentContextAddress_ = currentContextAddress;
        address contextAddress = currentContextAddress_ == address(0) ? msg.sender : currentContextAddress_;
        return contextAddress;
    }

    function _setCurrentContextAddressIfRequired(address signerAddress, address contextAddress) internal {
        if (signerAddress != msg.sender) {
            currentContextAddress = contextAddress;
        }
    }

}
