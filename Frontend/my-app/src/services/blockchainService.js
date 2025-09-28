import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

class BlockchainService {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.account = null;
        this.isCasting = false;
        // Try to get contract address from environment or use default
        this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
        this.contractABI = [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "electionId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "candidateId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "voter",
                        "type": "address"
                    }
                ],
                "name": "VoteCast",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_electionId",
                        "type": "uint256"
                    }
                ],
                "name": "getTotalVotes",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_electionId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_candidateId",
                        "type": "uint256"
                    }
                ],
                "name": "getVoteCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_electionId",
                        "type": "uint256"
                    }
                ],
                "name": "getVotesForElection",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "electionId",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "candidateId",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "voter",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "timestamp",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct VotingContract.Vote[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "hasVoted",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_electionId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_voter",
                        "type": "address"
                    }
                ],
                "name": "hasVotedInElection",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_electionId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_candidateId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_voter",
                        "type": "address"
                    }
                ],
                "name": "vote",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "voteCounts",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "votes",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "electionId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "candidateId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "voter",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    async connectWallet() {
        try {
            const provider = await detectEthereumProvider();

            if (!provider) {
                throw new Error('MetaMask not detected. Please install MetaMask.');
            }

            if (provider !== window.ethereum) {
                throw new Error('Multiple wallets detected. Please use MetaMask.');
            }

            this.web3 = new Web3(provider);

            // Check if already connected
            let accounts = [];
            try {
                accounts = await window.ethereum.request({ method: 'eth_accounts' });
            } catch (error) {
                console.warn('Failed to get existing accounts:', error.message);
            }

            // If no accounts, request access
            if (accounts.length === 0) {
                try {
                    accounts = await window.ethereum.request({
                        method: 'eth_requestAccounts'
                    });
                } catch (requestError) {
                    if (requestError.code === 4001) {
                        throw new Error('User rejected the connection request.');
                    }
                    throw new Error('Failed to connect to MetaMask. Please try again.');
                }
            }

            if (accounts.length === 0) {
                throw new Error('No accounts found. Please connect your wallet.');
            }

            this.account = accounts[0];

            // Initialize contract with error handling
            try {
                this.contract = new this.web3.eth.Contract(
                    this.contractABI,
                    this.contractAddress
                );
            } catch (contractError) {
                console.warn('Contract initialization failed:', contractError.message);
                throw new Error('Failed to initialize contract. Please check your network connection.');
            }

            // Verify network matches local Hardhat (1337) or configured chain
            try {
                const networkId = await this.web3.eth.net.getId();
                const expected = process.env.REACT_APP_CHAIN_ID ? parseInt(process.env.REACT_APP_CHAIN_ID, 10) : 80002; // Amoy by default
                if (networkId !== expected) {
                    console.warn('Unexpected network ID:', networkId, 'expected:', expected);
                }
            } catch (nidErr) {
                console.warn('Failed to get network id:', nidErr.message);
            }

            // Verify contract is accessible (optional)
            try {
                await this.contract.methods.getTotalVotes(1).call();
            } catch (error) {
                console.warn('Contract verification failed:', error.message);
                // Continue anyway, the contract might still work for voting
            }

            // Set up event listeners for MetaMask changes
            this.setupEventListeners();

            return {
                success: true,
                account: this.account,
                networkId: await this.web3.eth.net.getId(),
                contractAddress: this.contractAddress
            };
        } catch (error) {
            console.error('Wallet connection error:', error);

            let errorMessage = error.message;
            if (error.message.includes('User rejected')) {
                errorMessage = 'Connection was cancelled by user.';
            } else if (error.message.includes('MetaMask not detected')) {
                errorMessage = 'MetaMask not found. Please install MetaMask browser extension.';
            } else if (error.message.includes('Multiple wallets')) {
                errorMessage = 'Multiple wallets detected. Please disable other wallet extensions and use only MetaMask.';
            } else if (error.message.includes('Failed to connect')) {
                errorMessage = 'Failed to connect to MetaMask. Please try again.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    async checkWalletConnection() {
        try {
            const provider = await detectEthereumProvider();
            if (!provider) return { connected: false, error: 'MetaMask not installed' };

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0) return { connected: false, error: 'No accounts connected' };

            this.web3 = new Web3(provider);
            this.account = accounts[0];
            this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);

            return { connected: true, account: this.account };
        } catch (error) {
            return { connected: false, error: error.message };
        }
    }

    async castVote(electionId, candidateId, voterAddress) {
        try {
            if (this.isCasting) {
                return { success: false, error: 'A vote transaction is already in progress.' };
            }

            if (!this.contract || !this.account) {
                throw new Error('Wallet not connected');
            }

            // Ensure we have a plausible contract address configured
            if (!this.contractAddress || this.contractAddress === '0x0000000000000000000000000000000000000000') {
                throw new Error('Contract address is not configured. Please set REACT_APP_CONTRACT_ADDRESS.');
            }

            // Normalize Mongo ObjectId strings to uint256 numbers for the contract
            const normalizeToHexUint256 = (value) => {
                // For any string id (Mongo ObjectId or arbitrary), derive a deterministic 32-byte hex via keccak256
                if (typeof value === 'string') {
                    try {
                        return this.web3.utils.keccak256(value); // 0x-prefixed 32-byte hash
                    } catch (_) {
                        return this.web3.utils.keccak256(String(value));
                    }
                }
                if (typeof value === 'number') {
                    return this.web3.utils.keccak256(this.web3.utils.numberToHex(value));
                }
                return this.web3.utils.keccak256(String(value));
            };

            const electionIdHex = normalizeToHexUint256(electionId);
            const candidateIdHex = normalizeToHexUint256(candidateId);

            // Validate inputs
            if (!electionIdHex) {
                throw new Error('Invalid election ID');
            }
            if (!candidateIdHex) {
                throw new Error('Invalid candidate ID');
            }
            if (!voterAddress || !this.web3.utils.isAddress(voterAddress)) {
                throw new Error('Invalid voter address');
            }

            const fromAddress = this.account;

            // Log derived IDs for troubleshooting
            console.log('Derived electionId (hex):', electionIdHex);
            console.log('Derived candidateId (hex):', candidateIdHex);

            // Verify contract code exists on current network to avoid MetaMask showing a transfer
            try {
                const code = await this.web3.eth.getCode(this.contractAddress);
                if (!code || code === '0x' || code === '0x0') {
                    throw new Error('Contract not found on current network. Please switch network in MetaMask.');
                }
            } catch (codeErr) {
                throw new Error('Contract not found on current network. Please switch network in MetaMask.');
            }

            // Prepare gas values before prompting wallet (estimation does not trigger prompt)
            let gasPrice;
            try {
                gasPrice = await this.web3.eth.getGasPrice();
                console.log('Current gas price:', gasPrice);
            } catch (gasPriceError) {
                console.warn('Failed to get gas price, using default:', gasPriceError.message);
                gasPrice = '20000000000'; // 20 gwei default
            }

            let gasLimit = 200000;
            try {
                const estimatedGas = await this.contract.methods
                    .vote(electionIdHex, candidateIdHex, fromAddress)
                    .estimateGas({ from: fromAddress });
                gasLimit = Math.floor(estimatedGas * 1.5);
                console.log('Estimated gas limit:', gasLimit);
            } catch (gasError) {
                console.warn('Gas estimation failed, using default:', gasError.message);
            }

            this.isCasting = true;

            const transaction = await this.contract.methods
                .vote(electionIdHex, candidateIdHex, fromAddress)
                .send({
                    from: fromAddress,
                    gas: gasLimit,
                    gasPrice: gasPrice
                });

            console.log('Transaction successful:', transaction.transactionHash);
            return {
                success: true,
                transactionHash: transaction.transactionHash,
                blockNumber: transaction.blockNumber
            };
        } catch (error) {
            console.error('Vote casting error:', error);

            // Provide more specific error messages
            let errorMessage = error.message;

            if (error.message.includes('execution reverted')) {
                if (error.message.includes('Already voted')) {
                    errorMessage = 'You have already voted in this election.';
                } else if (error.message.includes('Invalid voter address')) {
                    errorMessage = 'Invalid voter address.';
                } else if (error.message.includes('Invalid candidate ID')) {
                    errorMessage = 'Invalid candidate ID.';
                } else {
                    errorMessage = 'Transaction failed on-chain. Most likely: already voted for this election.';
                }
            } else if (error?.receipt?.status === false) {
                // Hard fallback when no revert reason is surfaced (e.g., Polygon PoS)
                errorMessage = 'Transaction reverted by EVM. This usually means the wallet already voted for this election.';
            } else if (error.message.includes('User denied') || error.message.includes('user rejected')) {
                errorMessage = 'Transaction was cancelled by user.';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for gas. Please add ETH to your wallet.';
            } else if (error.message.includes('network') || error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('Parameter decoding error')) {
                errorMessage = 'Contract interaction error. Please refresh the page and try again.';
            } else if (error.message.includes('Returned values aren\'t valid')) {
                errorMessage = 'Contract response error. Please try again.';
            } else if (error.message.includes('out of gas')) {
                errorMessage = 'Transaction failed due to insufficient gas. Please try again.';
            } else if (error.message.includes('JSON RPC')) {
                errorMessage = 'MetaMask connection error. Please try again or refresh the page.';
            } else if (error.message.includes('Internal JSON-RPC error')) {
                errorMessage = 'MetaMask internal error. Please try again.';
            } else if (error.message.includes('Nonce too low')) {
                errorMessage = 'Transaction nonce error. Please try again.';
            } else if (error.message.includes('already known')) {
                errorMessage = 'Transaction already submitted. Please wait and try again.';
            }

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            this.isCasting = false;
        }
    }

    async getVoteCount(electionId, candidateId) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const voteCount = await this.contract.methods
                .getVoteCount(electionId, candidateId)
                .call();

            return {
                success: true,
                voteCount: parseInt(voteCount)
            };
        } catch (error) {
            console.error('Get vote count error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async hasVoted(electionId, voterAddress) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const voted = await this.contract.methods
                .hasVoted(electionId, voterAddress)
                .call();

            return {
                success: true,
                hasVoted: voted
            };
        } catch (error) {
            console.error('Check voted status error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getAccount() {
        return this.account;
    }

    getWeb3() {
        return this.web3;
    }

    // Listen for MetaMask account changes (register once)
    setupEventListeners() {
        if (window.ethereum) {
            if (this._listenersAttached) return;
            this._listenersAttached = true;

            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.account = null;
                    this.contract = null;
                    console.log('MetaMask account disconnected');
                } else {
                    this.account = accounts[0];
                    console.log('MetaMask account changed:', this.account);
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                console.log('MetaMask network changed:', chainId);
                // Reload the page to reset the connection
                window.location.reload();
            });

            window.ethereum.on('disconnect', () => {
                this.account = null;
                this.contract = null;
                this._listenersAttached = false;
                console.log('MetaMask disconnected');
            });
        }
    }

    // Remove event listeners
    removeEventListeners() {
        if (window.ethereum) {
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
            window.ethereum.removeAllListeners('disconnect');
        }
    }

    // Alternative voting method using direct Web3 calls
    async castVoteAlternative(electionId, candidateId, voterAddress) {
        try {
            if (!this.web3 || !this.account) {
                throw new Error('Wallet not connected');
            }

            // Convert to proper format
            const electionIdNum = typeof electionId === 'string' ? parseInt(electionId) : electionId;
            const candidateIdNum = typeof candidateId === 'string' ? parseInt(candidateId) : candidateId;

            // Encode the function call manually
            const functionSignature = this.web3.eth.abi.encodeFunctionSignature('vote(uint256,uint256,address)');
            const encodedParams = this.web3.eth.abi.encodeParameters(
                ['uint256', 'uint256', 'address'],
                [electionIdNum, candidateIdNum, voterAddress]
            );

            const data = functionSignature + encodedParams.slice(2);

            // Get gas price
            const gasPrice = await this.web3.eth.getGasPrice();

            // Estimate gas
            let gasEstimate = 300000;
            try {
                gasEstimate = await this.web3.eth.estimateGas({
                    to: this.contractAddress,
                    from: this.account,
                    data: data
                });
                gasEstimate = Math.floor(gasEstimate * 1.2);
            } catch (gasError) {
                console.warn('Gas estimation failed, using default:', gasError.message);
            }

            // Send transaction
            const transaction = await this.web3.eth.sendTransaction({
                from: this.account,
                to: this.contractAddress,
                data: data,
                gas: gasEstimate,
                gasPrice: gasPrice
            });

            return {
                success: true,
                transactionHash: transaction.transactionHash,
                blockNumber: transaction.blockNumber
            };
        } catch (error) {
            console.error('Alternative vote casting error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new BlockchainService();
