# EIP712-Batch-Layer
submitted transactions and submit multiple transactions in one meta-transaction


1. install depedencies npm install or yarn
2. running hardhat 
    - npx hardhat node
    - npx hardhat run --network localhost scripts/deployMetaTransaction.js
    - copy save token address from deploy command
3. run relayer server
    - nodemon server.js run on port 4000
4. run react
    - npm start run on port 3000
5. get and copy file MetaTransaction.json from folder smartcontracts/artifacts/contracts/MetaTransaction.sol  
6. paste MetaTransaction.json file on relayer folder
7. paste token from deploy address to 
    - file WalletCardEthers.js from user/src folder  | line 72
    - file server.js from relayer folder | line 22
8. see and change owner private key on server.js if deferent from Hardhat first/owner address


account reference use in this case

    owner
    account : 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    private key : 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    
    user
    account : 0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199
    private key : 0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e
    
    user
    account : 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
    private key : 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d   
    
    user
    account : 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc
    private key : 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   
   
   
<div>
  <br><br><br>
 </div>

<br><br>
  <div align="center" >
<img  src="https://i.ibb.co/rwpXByK/screenB.jpg"  width="780px"  />
</div>

<br>
  <div align="center" >
<img  src="https://i.ibb.co/TTnfzPd/screenA.jpg"  width="780px"  />
</div>
