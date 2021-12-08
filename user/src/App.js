//import logo from './logo.svg';
import React from 'react';
import './App.css';
import WalletCardEthers from './WalletCardEthers';

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:4000";
const socket = socketIOClient(ENDPOINT, {
  cors: {
    origin: { origins: '*:*'}
  }
});

const App = () => {
  return (
    <div className="App">
      <WalletCardEthers socket={socket}/>
    </div>
  );
}

export default App;
