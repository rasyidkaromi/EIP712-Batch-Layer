// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
pragma experimental ABIEncoderV2;

import "./Validation.sol";
import "./validationBatch.sol";
import "./MetaToken.sol";

contract MetaTransaction is Validation, ValidationBatch, MetaToken {

    string private message;

    function metaTransfer(address signer, Transaction calldata transaction, uint8 v,bytes32 r,bytes32 s) public payable  returns (string memory) {
        require(isValidTransaction(signer, transaction, v, r, s) == true, "ERROR: Invalid transaction");
        _setCurrentContextAddressIfRequired(signer, signer);
        (bool success, bytes memory data) = address(this).delegatecall(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                transaction.to,
                transaction.amount
            )
        );
        _setCurrentContextAddressIfRequired(signer, address(0));
        message = "metaTransfer";
        return message;
    }

    function multiSender(address signer, TransactionBatch calldata transactionBatch, uint8 v,bytes32 r, bytes32 s) public payable returns (string memory) {
        require(isValidTransactionBatch(signer, transactionBatch, v, r, s) == true, "ERROR: Invalid transaction");
        uint256 i = 0;
        for (i; i < transactionBatch.payload.length; i++) {
            _setCurrentContextAddressIfRequired(signer, signer);
            (bool success, bytes memory data) = address(this).delegatecall(
                abi.encodeWithSignature(
                    "transfer(address,uint256)",
                    transactionBatch.payload[i].to,
                    transactionBatch.payload[i].amount
                )
            );
            _setCurrentContextAddressIfRequired(signer, address(0));
        }
        message = "multiSender";
        return message;
    }
}

