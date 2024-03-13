require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cron = require('node-cron');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const monitoredWalletAddress = process.env.WALLET_ADDRESS;

// Monitor transactions
cron.schedule('* * * * *', async () => {
  const latestBlock = await provider.getBlock('latest');
  const transactions = latestBlock.transactions;
  
  transactions.forEach(async (txHash) => {
    const tx = await provider.getTransaction(txHash);
    if (tx.to === monitoredWalletAddress || tx.from === monitoredWalletAddress) {
      console.log(`Suspicious transaction detected: ${txHash}`);
      io.emit('alert', { message: `Suspicious transaction detected: ${txHash}` });
    }
  });
});

server.listen(3000, () => console.log(`Crypto Watchtower running on http://localhost:3000`));