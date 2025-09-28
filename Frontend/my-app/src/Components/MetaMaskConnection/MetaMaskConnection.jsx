import React, { useState, useEffect } from 'react';
import './MetaMaskConnection.css';
import blockchainService from '../../services/blockchainService';
import MetaMaskHelper from '../../utils/metaMaskHelper';

const MetaMaskConnection = ({ onWalletConnected, onWalletDisconnected }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        const result = await blockchainService.checkWalletConnection();
        if (result.connected) {
            setIsConnected(true);
            setAccount(result.account);
            onWalletConnected && onWalletConnected(result.account);
        } else {
            setIsConnected(false);
            setAccount('');
        }
    };

    const connectWallet = async () => {
        setIsConnecting(true);
        setError('');

        try {
            // First validate MetaMask setup
            const validation = await MetaMaskHelper.validateSetup();

            if (!validation.valid) {
                if (validation.issues.includes('MetaMask is not installed')) {
                    setError('MetaMask not installed. Please install MetaMask browser extension.');
                    return;
                }

                if (validation.issues.includes('Wrong network')) {
                    try {
                        await MetaMaskHelper.switchToConfiguredNetwork();
                    } catch (networkError) {
                        setError('Please switch to the configured network in MetaMask and retry.');
                        return;
                    }
                }

                if (validation.issues.includes('MetaMask is locked')) {
                    setError('Please unlock MetaMask and try again.');
                    return;
                }
            }

            const result = await blockchainService.connectWallet();

            if (result.success) {
                setIsConnected(true);
                setAccount(result.account);
                onWalletConnected && onWalletConnected(result.account);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setIsConnected(false);
        setAccount('');
        onWalletDisconnected && onWalletDisconnected();
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="metamask-connection">
            {!isConnected ? (
                <div className="wallet-not-connected">
                    <button
                        className="connect-wallet-btn"
                        onClick={connectWallet}
                        disabled={isConnecting}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </div>
            ) : (
                <div className="wallet-connected">
                    <div className="wallet-info">
                        <span className="wallet-icon">🦊</span>
                        <span className="wallet-address">{formatAddress(account)}</span>
                    </div>
                    <button
                        className="disconnect-btn"
                        onClick={disconnectWallet}
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
};

export default MetaMaskConnection;




