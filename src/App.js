// =================================================================
// src/App.js (With Role Selection Restored)
// =================================================================

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig, useAccount, useBalance } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

// Import your page components
import UserProfile from './components/UserProfile';
import AdminIssuerPage from './components/AdminIssuerPage';
import PublicVerifierPage from './components/PublicVerifierPage';
import Notification from './components/Notification';
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
			},
			{
				"internalType": "address",
				"name": "_intendedIssuer",
				"type": "address"
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
			},
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
				"name": "_issuer",
				"type": "address"
			}
		],
		"name": "getIssuerQueueCount",
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
		"name": "issuerVerificationQueue",
		"outputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "docIndex",
				"type": "uint256"
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
			},
			{
				"internalType": "address",
				"name": "intendedIssuer",
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
];
export const contractAddress = "0x7fF4D5Da0615Ef4dBC7d4d913C28bF10fCa9959E";

//============================================
// LANDING PAGE COMPONENT
//============================================
// --- Add these animation definitions above your LandingPage component ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};


//============================================
// LANDING PAGE COMPONENT (ANIMATED VERSION)
//============================================
function LandingPage({ onLaunch }) {
  return (
    <motion.div 
      className="landing-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="hero-section" variants={itemVariants}>
        <h1>CertiChain</h1>
        <p className="quote">"Where there is a chain there is Trust"</p>
        <motion.button 
          className="launch-button" 
          onClick={onLaunch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Launch dApp
        </motion.button>
      </motion.div>

      <motion.div className="info-section" variants={itemVariants}>
        <h2>Why CertiChain?</h2>
        <div className="features-grid">
          <div className="feature-card"><i className="fa-solid fa-cubes"></i><h3>Immutable & Tamper-Proof</h3><p>Leveraging blockchain technology, every credential is a permanent, unchangeable record, eliminating the possibility of fraud.</p></div>
          <div className="feature-card"><i className="fa-solid fa-cloud-arrow-up"></i><h3>Decentralized & Always Available</h3><p>Files are stored on the IPFS network, ensuring they are always accessible, censorship-resistant, and not controlled by any single entity.</p></div>
          <div className="feature-card"><i className="fa-solid fa-shield-halved"></i><h3>Instant & Trustworthy Verification</h3><p>Trusted institutions can verify credentials with a single, secure transaction, providing immediate and undeniable proof of authenticity for employers.</p></div>
        </div>
      </motion.div>

      <motion.div className="info-section" variants={itemVariants}>
        <h2>How It Works</h2>
        <div className="how-it-works-grid">
          <div className="step-card"><h3>1. Upload</h3><i className="fa-solid fa-arrow-up-from-bracket"></i><p>Connect your Web3 wallet and upload your credential. The file is secured on IPFS and a corresponding record is created on-chain.</p></div>
          <div className="step-card"><h3>2. Verify</h3><i className="fa-solid fa-check-to-slot"></i><p>The original issuing institution verifies the document, creating a permanent, trustworthy link on the blockchain.</p></div>
          <div className="step-card"><h3>3. Share</h3><i className="fa-solid fa-magnifying-glass"></i><p>Recruiters can instantly look up a user's wallet address and see a complete, trusted portfolio of their verified credentials.</p></div>
        </div>
      </motion.div>
      
      <motion.footer className="footer" variants={itemVariants}>
        <p>© 2025 CertiChain. A Decentralized Identity Project.</p>
      </motion.footer>
    </motion.div>
  );
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



// ... (keep the rest of your imports and setup code)

//============================================
// MAIN DAPP CONTAINER COMPONENT (with Notification)
//============================================
function MainDApp() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const [view, setView] = useState(null);
  // NEW: State to control our notification modal
  const [notification, setNotification] = useState({ isActive: false, message: '', type: '' });

  const balance = balanceData ? Number(ethers.formatEther(balanceData.value)).toFixed(5) : '0';

  useEffect(() => {
    if (!isConnected) { setView(null); }
  }, [isConnected]);

  // Render Logic
  if (!isConnected) return <LoginPage />;

  return (
    // We use a React Fragment <> to return multiple components
    <>
      <Notification notification={notification} setNotification={setNotification} />

      {/* Conditionally render the rest of the app based on the 'view' state */}
      {!view ? <RoleSelectionPage setView={setView} /> : (
        <div className="dapp-container">
          <nav className="navbar">
            <div className="nav-account">Connected: {address.substring(0, 6)}...{address.substring(address.length - 4)}</div>
            <w3m-button />
          </nav>
          <div className="main-content">
            <AnimatePresence mode="wait">
              {view === 'user' && ( <motion.div key="user"><UserProfile balance={balance} setNotification={setNotification} /></motion.div> )}
              {view === 'issuer' && ( <motion.div key="issuer"><AdminIssuerPage setNotification={setNotification} /></motion.div> )}
              {view === 'public' && ( <motion.div key="public"><PublicVerifierPage setNotification={setNotification} /></motion.div> )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
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