// MetaMask Helper Utilities
const getConfiguredNetwork = () => {
    const envChainId = process.env.REACT_APP_CHAIN_ID; // decimal string, e.g. "80002" for Amoy
    const chainIdNum = envChainId ? parseInt(envChainId, 10) : 80002;

    // Default to Polygon Amoy if not specified
    if (chainIdNum === 80002) {
        return {
            chainIdDec: 80002,
            chainIdHex: '0x13882',
            chainName: 'Polygon Amoy',
            rpcUrls: [process.env.REACT_APP_RPC_URL || 'https://rpc-amoy.polygon.technology'],
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 }
        };
    }

    if (chainIdNum === 1337) {
        return {
            chainIdDec: 1337,
            chainIdHex: '0x539',
            chainName: 'Hardhat Local',
            rpcUrls: [process.env.REACT_APP_RPC_URL || 'http://localhost:8545'],
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
        };
    }

    // Generic fallback using provided ENV values (requires RPC URL)
    return {
        chainIdDec: chainIdNum,
        chainIdHex: '0x' + chainIdNum.toString(16),
        chainName: process.env.REACT_APP_NETWORK_NAME || `Chain ${chainIdNum}`,
        rpcUrls: [process.env.REACT_APP_RPC_URL || ''],
        nativeCurrency: {
            name: process.env.REACT_APP_NATIVE_NAME || 'ETH',
            symbol: process.env.REACT_APP_NATIVE_SYMBOL || 'ETH',
            decimals: 18
        }
    };
};

export const MetaMaskHelper = {
    // Check if MetaMask is installed
    isInstalled() {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    },

    // Check if MetaMask is locked
    async isLocked() {
        if (!this.isInstalled()) return true;

        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            return accounts.length === 0;
        } catch (error) {
            return true;
        }
    },

    // Get current network
    async getCurrentNetwork() {
        if (!this.isInstalled()) return null;

        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            return parseInt(chainId, 16);
        } catch (error) {
            return null;
        }
    },

    // Check if connected to configured network (defaults to Polygon Amoy)
    async isCorrectNetwork() {
        const currentNetwork = await this.getCurrentNetwork();
        const target = getConfiguredNetwork();
        return currentNetwork === target.chainIdDec;
    },

    // Switch to configured network (Amoy by default)
    async switchToConfiguredNetwork() {
        if (!this.isInstalled()) {
            throw new Error('MetaMask not installed');
        }

        const target = getConfiguredNetwork();

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: target.chainIdHex }],
            });
            return true;
        } catch (switchError) {
            // If the network doesn't exist, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: target.chainIdHex,
                            chainName: target.chainName,
                            rpcUrls: target.rpcUrls,
                            nativeCurrency: target.nativeCurrency,
                        }],
                    });
                    return true;
                } catch (addError) {
                    throw new Error('Failed to add Hardhat network');
                }
            }
            throw new Error('Failed to switch to Hardhat network');
        }
    },

    // Get troubleshooting tips
    getTroubleshootingTips() {
        return [
            'Make sure MetaMask is installed and unlocked',
            'Ensure you are connected to Hardhat network (Chain ID: 31337)',
            'Try refreshing the page and reconnecting',
            'Check if Hardhat node is running on localhost:8545',
            'Disable other wallet extensions temporarily',
            'Clear browser cache and try again'
        ];
    },

    // Validate MetaMask setup against configured network
    async validateSetup() {
        const issues = [];

        if (!this.isInstalled()) {
            issues.push('MetaMask is not installed');
            return { valid: false, issues };
        }

        if (await this.isLocked()) {
            issues.push('MetaMask is locked - please unlock it');
        }

        const currentNetwork = await this.getCurrentNetwork();
        const target = getConfiguredNetwork();
        if (currentNetwork !== target.chainIdDec) {
            issues.push('Wrong network');
            issues.push(`Wrong network (${currentNetwork}) - should be ${target.chainIdDec}`);
        }

        return {
            valid: issues.length === 0,
            issues,
            currentNetwork
        };
    }
};

export default MetaMaskHelper;

