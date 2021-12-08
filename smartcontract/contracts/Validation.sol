// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

contract Validation {

    bytes32 public immutable DOMAIN_SEPARATOR;
    uint256 constant chainId = 99999;
    bytes32 constant salt = 0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;

    struct Transaction {
        address payable to;
        uint256 amount;
        uint256 nonce;
    }

    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)" );
    bytes32 private constant TRANSACTION_TYPEHASH = keccak256("Transaction(address to,uint256 amount,uint256 nonce)");

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
        abi.encode(EIP712_DOMAIN_TYPEHASH, keccak256("RasyidKaromi"), keccak256("1.0.0"), chainId, address(this), salt));
    }

    function hashTransaction(Transaction calldata transaction) private view returns (bytes32){
        return keccak256(
                abi.encodePacked(bytes1(0x19),bytes1(0x01), DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            TRANSACTION_TYPEHASH,
                            transaction.to,
                            transaction.amount,
                            transaction.nonce
                        )
                    )
                )
            );
    }

    function isValidTransaction(address signer, Transaction calldata transaction,uint8 v,bytes32 r, bytes32 s) public view returns (bool) {
        return ecrecover(hashTransaction(transaction), v, r, s) == signer;
    }
}
