// =================================================================
// src/App.js (With Role Selection Restored)
// =================================================================

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig, useAccount, useBalance } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import your page components
import UserProfile from './components/UserProfile';
import AdminIssuerPage from './components/AdminIssuerPage';
import PublicVerifierPage from './components/PublicVerifierPage';
import './App.css';

// --- 1. Get projectID and create wagmiConfig ---
const projectId = process.env.REACT_APP_WALLETCONNECT_ID;
const metadata = {
  name: 'CertiChain',
  description: 'A Decentralized Solution for Verifiable Credentials',
  url: 'https://certichain-dapp.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};
const chains = [sepolia];
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// --- 2. Create modal ---
createWeb3Modal({ wagmiConfig, projectId, chains });

// --- 3. Create QueryClient ---
const queryClient = new QueryClient();

// --- Your Contract Details ---
export const finalABI = [ 
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_documentName",
				"type": "string"
			}
		],
		"name": "addDocument",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newIssuer",
				"type": "address"
			}
		],
		"name": "addIssuer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "getDocument",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
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
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getDocumentCount",
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isIssuer",
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
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userDocuments",
		"outputs": [
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "documentName",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "issuer",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isVerified",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_userAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_docIndex",
				"type": "uint256"
			}
		],
		"name": "verifyDocument",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] ;
export const contractAddress = "0x81298d0A12addC1D3E873169284F54C6dbA1F460";

//============================================
// LANDING PAGE COMPONENT
//============================================
function LandingPage({ onLaunch }) {
  // This component remains the same.
  return ( <div className="landing-page"><div className="hero-section"><h1>CertiChain</h1><p className="quote">"Where there is a chain there is Trust"</p><button className="launch-button" onClick={onLaunch}>Launch dApp</button></div></div> );
}

//============================================
// LOGIN PAGE COMPONENT
//============================================
function LoginPage() {
  return ( <div className="connect-wallet-container"><h3 className="dashboard-title">Welcome to CertiChain</h3><p className="dashboard-description">Please connect your wallet to continue.</p><w3m-button /></div> );
}

//============================================
// ROLE SELECTION PAGE COMPONENT
//============================================
function RoleSelectionPage({ setView }) {
  return (
    <div className="connect-wallet-container">
      <h3 className="dashboard-title">Connection Successful!</h3>
      <p className="dashboard-description">Please select how you'd like to proceed.</p>
      <div className="login-options">
        <button onClick={() => setView('user')}>Enter as User</button>
        <button onClick={() => setView('issuer')}>Enter as Issuer / Admin</button>
        <button onClick={() => setView('public')}>Enter as Public Verifier</button>
      </div>
    </div>
  );
}

//============================================
// MAIN DAPP CONTAINER COMPONENT
//============================================
function MainDApp() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const [view, setView] = useState(null);

  const balance = balanceData ? Number(ethers.formatEther(balanceData.value)).toFixed(5) : '0';

  useEffect(() => {
    if (!isConnected) {
      setView(null); // Reset view on disconnect
    }
  }, [isConnected]);

  // Render Logic
  if (!isConnected) return <LoginPage />;
  if (!view) return <RoleSelectionPage setView={setView} />;

  return (
    <div className="dapp-container">
      <nav className="navbar">
        <div className="nav-account">Connected: {address.substring(0, 6)}...{address.substring(address.length - 4)}</div>
        <w3m-button />
      </nav>
      <div className="main-content">
        {view === 'user' && <UserProfile balance={balance} />}
        {view === 'issuer' && <AdminIssuerPage />}
        {view === 'public' && <PublicVerifierPage />}
      </div>
    </div>
  );
}

//============================================
// APP WRAPPER COMPONENT
//============================================
function App() {
  const [appLaunched, setAppLaunched] = useState(false);
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <header className="App-header">
            {!appLaunched ? (<LandingPage onLaunch={() => setAppLaunched(true)} />) : (<MainDApp />)}
          </header>
        </div>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;