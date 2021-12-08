const express = require("express");
const socketIO = require("socket.io");
const http = require('http')
const cors = require("cors");
const ethers = require("ethers");


const { utils } = ethers;
const { formatEther } = utils;

const app = express();
const port = 4000;

const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Network
const contractABI = require("./MetaTransaction.json").abi;
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
const contractAddress = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";


// use owner address from Hardhat for main server relay service
const owner = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)
const contractOwner = new ethers.Contract(contractAddress, contractABI, owner);

// socket
const io = socketIO(server, { cors: { origin: '*', } });
io.on("connection", (socket) => {
  console.log("New client connected")

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  })


  socket.on('balance', async (data, cb) => {
    try {
      const balance = await provider.getBalance(data.accountMetamask)
      cb({
        balance: formatEther(balance),
      })
    } catch (error) {
      return
    }

  })

  socket.on('tokenbalance', async (data, cb) => {
    try {
      const tokenBalance = await contractOwner.balanceOf(data.accountMetamask);
      cb({
        tokenBalance: formatEther(tokenBalance)
      })
    } catch (error) {
      return
    }

  })

  socket.on('transfer', async (data) => {
    const signature = data.signature;
    if (signature) {
      const r = "0x" + signature.substring(2).substring(0, 64);
      const s = "0x" + signature.substring(2).substring(64, 128);
      const v = "0x" + signature.substring(2).substring(128, 130);

      const transaction = {
        to: data.to,
        amount: data.amount,
        nonce: data.nonce,
      };

      try {
        let res = await contractOwner.metaTransfer(data.signer, transaction, v, r, s);
        socket.emit('update', {
          type: 'transferSingle',
          hash: res.hash,
        })
      } catch (error) {
        return
      }
    }
  })

  socket.on('transferBatch', async (data) => {
    const signature = data.signature;
    if (signature) {
      const r = "0x" + signature.substring(2).substring(0, 64);
      const s = "0x" + signature.substring(2).substring(64, 128);
      const v = "0x" + signature.substring(2).substring(128, 130);

      const transactionBatch = {
        nonce: data.nonce,
        payload: data.payload
      }
      try {
        let res = await contractOwner.multiSender(data.signer, transactionBatch, v, r, s);
        socket.emit('update', {
          type: 'transferBatch',
          hash: res.hash,
        })
      } catch (error) {
        return
      }
    }
  })

});

server.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
