import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './WalletCard.css'

const WalletCardEthers = ({ socket }) => {

	const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState(null)

	const [userBalance, setUserBalance] = useState(0);
	const [userBalanceFromRelayService, setuserBalanceFromRelayService] = useState(0)
	const [userTokenBalanceFromRelayService, setuserTokenBalanceFromRelayService] = useState(0)
	const [userSignData, setUserSignData] = useState(null)
	const [userSignDataBatch, setUserSignDataBatch] = useState(null)

	const [connButtonText, setConnButtonText] = useState('Connect Wallet')
	const [connButtonText2, setConnButtonText2] = useState('Balance')
	const [connButtonText3, setConnButtonText3] = useState('Token Balance')
	const [connButtonText4, setConnButtonText4] = useState('Sign and send token via Relatey Service')
	const [connButtonText5, setConnButtonText5] = useState('Sign and send batch token via Relatey Service')

	const [provider, setProvider] = useState(null);
	const [signerData, setsignerData] = useState(null)

	const [singleHashTransaction, setSingleHashTransaction] = useState(null)
	const [batchHashTransaction, setBatchHashTransaction] = useState(null)

	const [forNonce, setForNonce] = useState(10)
	const [forGasLimit, setForGasLimit] = useState(1000)

	const [disableButtonBatch, setDisableButtonBatch] = useState(false)
	const [disableButtonSingle, setDisableButtonSingle] = useState(false)
	const [timeoutBath, setTimeOutBatch] = useState(10000)

	const [singleInfo, setSingleInfo] = useState('')
	const [batchInfo, setBatchInfo] = useState('')


	const [singleAccount, setSingleAccount] = useState({
		to: '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
		amount: 100
	})
	const [batchAccountSend, setBachAccountSend] = useState({})
	const [batchAccount, setBatchAccount] = useState([
		{
			to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
			amount: 100,
			gasLimit: forGasLimit,
		}, {
			to: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
			amount: 100,
			gasLimit: forGasLimit,
		}, {
			to: '',
			amount: 0,
			gasLimit: forGasLimit,
		}, {
			to: '',
			amount: 0,
			gasLimit: forGasLimit,
		}, {
			to: '',
			amount: 0,
			gasLimit: forGasLimit,
		}, {
			to: '',
			amount: 0,
			gasLimit: forGasLimit,
		}
	])

	const contract = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

	useEffect(() => {
		socket.on('update', (data) => {
			if (data.type == 'transferSingle') {
				setSingleHashTransaction(data.hash)
			}
			if (data.type == 'transferBatch') {
				setBatchHashTransaction(data.hash)
				setDisableButtonBatch(true)
				BatchTimeOutButtonDisable()
			}
		})

		let bufferBatch = [...batchAccount]
		let bufSend = []
		bufferBatch.forEach((val, i) => {
			if (isAddress(val.to) && Number(val.amount) !== 0 && val.amount !== "") {
				bufSend.push(val)
			}
		})
		setBachAccountSend(bufSend)

	}, [])

	useEffect(() => {
		if (singleHashTransaction) {
			setForNonce(forNonce - 1)
			relayerServiceBalance()
			relayerServiceTokenBalance()
		}
	}, [singleHashTransaction])

	useEffect(() => {
		if (batchHashTransaction) {
			setForNonce(forNonce - 1)
			relayerServiceBalance()
			relayerServiceTokenBalance()
		}
	}, [batchHashTransaction])

	useEffect(() => {
		socket.emit('transfer', {
			signer: defaultAccount,
			signature: userSignData,
			nonce: forNonce,
			to: singleAccount.to,
			amount: singleAccount.amount
		})
	}, [userSignData])

	useEffect(() => {
		socket.emit('transferBatch', {
			signer: defaultAccount,
			signature: userSignDataBatch,
			nonce: forNonce,
			payload: batchAccountSend
		})
	}, [userSignDataBatch])

	useEffect(() => {
		if (provider) {
			setsignerData(provider.getSigner(defaultAccount))
		}
	}, [provider])

	useEffect(() => {
		if (defaultAccount) {
			provider.getBalance(defaultAccount)
				.then(balanceResult => {
					setUserBalance(ethers.utils.formatEther(balanceResult));
				})
		};
	}, [defaultAccount]);

	const BatchTimeOutButtonDisable = () => {
		setTimeout(() => {
			setDisableButtonBatch(false)
		}, timeoutBath);

	}
	const connectWalletHandler = () => {
		if (window.ethereum && defaultAccount == null) {
			// set ethers provider
			setProvider(new ethers.providers.Web3Provider(window.ethereum));
			// connect to metamask
			window.ethereum.request({ method: 'eth_requestAccounts' })
				.then(result => {
					setConnButtonText('Wallet Connected');
					setDefaultAccount(result[0]);
				})
				.catch(error => {
					setErrorMessage(error.message);
				});

		} else if (!window.ethereum) {
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
	}

	const relayerServiceBalance = () => {
		let data = {
			accountMetamask: defaultAccount
		}
		socket.emit('balance', data, (cb) => {
			setuserBalanceFromRelayService(cb.balance)
		})
	}
	const relayerServiceTokenBalance = () => {
		let data = {
			accountMetamask: defaultAccount
		}
		socket.emit('tokenbalance', data, (cb) => {
			setuserTokenBalanceFromRelayService(cb.tokenBalance)
		})
	}

	const signDataSingle = async () => {
		let msg = {
			"nonce": forNonce,
			"to": singleAccount.to,
			"amount": singleAccount.amount,
		}
		let msgParams = {
			"types": {
				"EIP712Domain": [
					{ "name": "name", "type": "string" },
					{ "name": "version", "type": "string" },
					{ "name": "chainId", "type": "uint256" },
					{ "name": "verifyingContract", "type": "address" },
					{ "name": "salt", "type": "bytes32" }
				],
				"Transaction": [
					{ "name": "to", "type": "address" },
					{ "name": "amount", "type": "uint256" },
					{ "name": "nonce", "type": "uint256" }
				]
			},
			"domain": {
				"name": "RasyidKaromi",
				"version": "1.0.0",
				"chainId": 99999,
				"verifyingContract": contract,
				"salt": "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
			},
			"primaryType": "Transaction",
			"message": msg
		}
		const sign = await window.ethereum.request({
			method: 'eth_signTypedData_v4',
			params: [defaultAccount, JSON.stringify(msgParams)],
		});
		setUserSignData(sign)
	}
	const signDataBatch = async () => {
		let msg = {
			"nonce": forNonce,
			"payload": batchAccountSend
		}
		let msgParams = {
			"types": {
				"EIP712Domain": [
					{ "name": "name", "type": "string" },
					{ "name": "version", "type": "string" },
					{ "name": "chainId", "type": "uint256" },
					{ "name": "verifyingContract", "type": "address" },
					{ "name": "salt", "type": "bytes32" }
				],
				"TransactionBatch": [
					{ "name": "nonce", "type": "uint256" },
					{ "name": "payload", "type": "TransactionPayload[]" }
				],
				"TransactionPayload": [
					{ "name": "to", "type": "address" },
					{ "name": "amount", "type": "uint256" },
					{ "name": "gasLimit", "type": "uint256" },
				]
			},
			"domain": {
				"name": "RasyidKaromi Batch",
				"version": "1.0.0",
				"chainId": 99999,
				"verifyingContract": contract,
				"salt": "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
			},
			"primaryType": "TransactionBatch",
			"message": msg
		}
		const sign = await window.ethereum.request({
			method: 'eth_signTypedData_v4',
			params: [defaultAccount, JSON.stringify(msgParams)],
		});

		setUserSignDataBatch(sign)
	}

	const batchAccountChange_amount = (idx, val) => {
		let bufferBatch = [...batchAccount]
		bufferBatch[idx].amount = val.target.value
		let bufSend = []
		bufferBatch.forEach((val, i) => {
			if (val.amount === "" || Number(val.amount) === 0 || val.to === "") {

			} else {
				if (isAddress(val.to)) {
					bufSend.push(val)
				}
			}
		})
		setBatchAccount(bufferBatch)
		setBachAccountSend(bufSend)
	}

	const batchAccountChange_to = (idx, val) => {
		let bufferBatch = [...batchAccount]
		bufferBatch[idx].to = val.target.value
		let bufSend = []
		bufferBatch.forEach((val, i) => {
			if (val.amount === "" || Number(val.amount) === 0 || val.to === "") {

			} else {
				if (isAddress(val.to)) {
					bufSend.push(val)
				}
			}
		})
		setBatchAccount(bufferBatch)
		setBachAccountSend(bufSend)
	}
	const isAddress = (address) => {
		try {
			ethers.utils.getAddress(address);
		} catch (e) { return false; }
		return true;
	}

	return (
		<>
			<div className='walletCard'>
				<h4> Connection to MetaMask </h4>
				<button onClick={connectWalletHandler}>{connButtonText}</button>
				<div className='accountDisplay'>
					<h3>Address: {defaultAccount}</h3>
				</div>
				<div className='balanceDisplay'>
					<h3>Balance: {userBalance}</h3>
				</div>
				{errorMessage}
			</div>
			<div className='walletCard'>
				<h4> Call Relayer Service </h4>

				<button onClick={relayerServiceBalance}>{connButtonText2}</button>
				<div className='balanceDisplay'>
					<h3>Balance: </h3>
					<div style={{
						fontSize: 15,
						width: "100%",

					}}>{userBalanceFromRelayService}</div>
					<br />
				</div>

				<button onClick={relayerServiceTokenBalance}>{connButtonText3}</button>
				<div className='balanceDisplay'>
					<h3>Token Balance:</h3>
					<div style={{
						fontSize: 15,
						width: "100%",

					}}>{userTokenBalanceFromRelayService * (10 ** 18)}</div>
					<br />
				</div>


				<div className='walletCard'>
					<h4> Sign and single transaction with Relayer Service </h4>
					<h4> nonce {forNonce}</h4>
					<h4> {singleInfo}</h4>
					account : <input
						name="gasLimit"
						type="tex"
						value={singleAccount.to}
						onChange={(res) => {

							if (isAddress(res.target.value)) {
								setDisableButtonSingle(false)
								setSingleInfo('')
								const newMessageObj = {
									to: res.target.value,
									amount: singleAccount.amount
								};
								setSingleAccount(newMessageObj)
							} else {
								setDisableButtonSingle(true)
								setSingleInfo('Wrong Address')
								const newMessageObj = {
									to: res.target.value,
									amount: singleAccount.amount
								};
								setSingleAccount(newMessageObj)
							}
						}} />
					<br />
					amount : <input
						name="gasLimit"
						type="number"
						value={singleAccount.amount}
						onChange={(res) => {
							if (res.target.valuet === "" || Number(res.target.value) === 0 || singleAccount.to === "") {
								setDisableButtonSingle(true)
								if (isAddress(singleAccount.to)) {
									const newMessageObj = {
										to: singleAccount.to,
										amount: Number(res.target.value)
									};
									setSingleAccount(newMessageObj)

								}
							} else {
								setDisableButtonSingle(false)
								if (isAddress(singleAccount.to)) {
									const newMessageObj = {
										to: singleAccount.to,
										amount: Number(res.target.value)
									};
									setSingleAccount(newMessageObj)
								}
							}
						}} />
					<br />	<br />
					<button disabled={disableButtonSingle} onClick={signDataSingle}>{connButtonText4}</button>
					<div className='balanceDisplay'>
						<h3>Sign V4: </h3>
						<div style={{
							fontSize: 15,
							width: "100%",
							wordWrap: 'break-word',
						}}>{userSignData}</div>
						<div style={{
							fontSize: 15,
							width: "100%",
							wordWrap: 'break-word',
						}}></div>
						<br />
					</div>
				</div>

				<div className='walletCard'>
					<h4> Sign and batch transaction with Relayer Service </h4>
					<h4> nonce {forNonce}</h4>
					<h4> timeout X {timeoutBath} ms</h4>
					GasLimit : <input
						name="gasLimit"
						type="number"
						value={forGasLimit}
						onChange={(res) => {
							setForGasLimit(res.target.value)
						}} />
					<br />
					Time Out : <input
						name="timeout"
						type="number"
						value={timeoutBath}
						onChange={(res) => {
							setTimeOutBatch(res.target.value)
						}} />
					<br />	<br />

					{batchAccount.map((val, index) => {
						return (
							<div key={index} className="input-group">
								to : <input type="text"
									className="form-control"
									onChange={(val) => {
										batchAccountChange_to(index, val)
									}} value={val.to} />
								&nbsp;
								amount : <input type="number"
									className="form-control"
									onChange={(val) => {
										batchAccountChange_amount(index, val)
									}} value={val.amount} />
							</div>
						)
					})}
					<br />	<br />
					<button disabled={disableButtonBatch} onClick={signDataBatch}>{connButtonText5}</button>
					<div className='balanceDisplay'>
						<h3>Sign V4: </h3>
						<div style={{
							fontSize: 15,
							width: "100%",
							wordWrap: 'break-word',
						}}>{userSignDataBatch}</div>
						<div style={{
							fontSize: 15,
							width: "100%",
							wordWrap: 'break-word',
						}}></div>
						<br />
					</div>
				</div>


				{errorMessage}
			</div>
		</>
	)
}

export default WalletCardEthers;



