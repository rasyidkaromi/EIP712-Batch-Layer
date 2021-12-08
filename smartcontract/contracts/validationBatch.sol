// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

contract ValidationBatch {

    bytes32 public immutable DOMAIN_SEPARATOR_BATCH;
    uint256 constant chainIdBatch = 99999;
    bytes32 constant saltBatch = 0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;

    struct TransactionBatch {
        uint256 nonce;
        TransactionPayload[] payload;
    }

    struct TransactionPayload {
        address payable to;
        uint256 amount;
        uint256 gasLimit;
    }

    bytes32 public constant EIP712DOMAIN_TYPE =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
        );

    bytes32 public constant TRANSACTION_TYPE =
        keccak256(
            "TransactionBatch(uint256 nonce,TransactionPayload[] payload)TransactionPayload(address to,uint256 amount,uint256 gasLimit)"
        );

    bytes32 public constant TRANSACTION_PAYLOAD_TYPE =
        keccak256(
            "TransactionPayload(address to,uint256 amount,uint256 gasLimit)"
        );

    constructor() {
        DOMAIN_SEPARATOR_BATCH = keccak256(
        abi.encode(EIP712DOMAIN_TYPE, keccak256("RasyidKaromi Batch"), keccak256("1.0.0"), chainIdBatch, address(this), saltBatch));
    }

    function hashTransactionBatchV2(TransactionBatch calldata transaction) private view returns (bytes32) {
        return keccak256(
            abi.encodePacked(bytes1(0x19), bytes1(0x01), DOMAIN_SEPARATOR_BATCH, 
                keccak256(
                    abi.encode(
                        TRANSACTION_TYPE, 
                        transaction.nonce, 
                        hash(transaction.payload)
                    )
                )
            ));
    }

    function hash(TransactionPayload[] calldata payload) private pure returns (bytes32) {
        bytes32[] memory values = new bytes32[](payload.length);
        for (uint256 i = 0; i < payload.length; i++) {
            values[i] = hashPayload(payload[i]);
        }
        return keccak256(abi.encodePacked(values));
    }

    function hashPayload(TransactionPayload calldata payload) private pure returns (bytes32) {
        return keccak256(abi.encode(TRANSACTION_PAYLOAD_TYPE, payload.to, payload.amount, payload.gasLimit));
    }

    function isValidTransactionBatch(
        address signer,
        TransactionBatch calldata transaction,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        return ecrecover(hashTransactionBatchV2(transaction), v, r, s) == signer;
    }
}
