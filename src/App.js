import React, { Component } from "react";
import Auction from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { highestBid: 0, highestBidder: "", balance: 0, web3: null, accounts: null, contract: null , value: 0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Auction.networks[networkId];
      const instance = new web3.eth.Contract(
        Auction.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const highestBidder = await instance.methods.highestBidder().call()
      const highestBid = await instance.methods.highestBid().call()
      const balance = await web3.eth.getBalance(instance.options.address)

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ highestBidder, highestBid,balance, web3, accounts, contract: instance });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  bid = async () => {
    if(isNaN(this.state.value)){
      alert("Not valid amount!")
      return
    }

    await this.state.contract.methods.bid().send({from: this.state.accounts[0], value: this.state.value})

    const highestBidder = await this.state.contract.methods.highestBidder().call()
    const highestBid = await this.state.contract.methods.highestBid().call()
    const balance = await this.state.web3.eth.getBalance(this.state.contract.options.address)

    this.setState({highestBid, highestBidder, balance})
  }

  withdraw = async () => {
    await this.state.contract.methods.withdraw().send({from: this.state.accounts[0]})

    const balance = await this.state.web3.eth.getBalance(this.state.contract.options.address)

    this.setState({balance})
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div style={{display: 'flex-start', textAlign:'center', justifyContent:'center'}}>
        <h1>Auction Contract</h1>
        <div style={{backgroundColor: '#E8E0F0', paddingTop: 1, paddingBottom: 5, marginBottom: 20, width: window.innerWidth*0.4, marginLeft: window.innerWidth*0.3, borderRadius: 10}}>
          <h2 style={{marginBottom: 30}}>Contract Information</h2>
          <h3>Highest Bidder: {this.state.highestBidder}</h3>
          <h3>Highest Bid: {this.state.highestBid}</h3>
          <h3>Contract Balance: {this.state.balance}</h3>
        </div>
        <div style={{flexDirection: "row", marginBottom: 20}}>
          <input style={{marginRight: 10, width: 200}} type="text" value={this.state.value} onChange={(e)=>{this.setState({value: e.target.value})}} />
          <button style={{height: 35, width: 100, allignItems: 'center', justifyContent:'center'}} onClick={this.bid}>Bid</button>
        </div>
        <button style={{height: 35, width: 150, allignItems: 'center', justifyContent:'center'}} onClick={this.withdraw}>Withdraw</button>
      </div>
    );
  }
}

export default App;
