# CertiChain v3 ⛓️✅

> "Where there is a chain, there is Trust."

CertiChain v3 is a full-stack decentralized application (dApp) designed to securely store, manage, and verify documents on the blockchain. It creates a single source of truth for credentials, eliminating digital document fraud and streamlining verification for students, institutions, and recruiters.

This project showcases a complete development lifecycle, evolving from an initial concept to a fully-featured, responsive, and animated dApp built on a modern Web3 foundation.

## Link: [**CertiChain-v3**](https://certichain-v3.vercel.app)

---
## What's New in v3?

CertiChain v3 is a significant upgrade from the original version, focusing on robustness, user experience, and modern development practices.

* **🚀 Complete Tech Stack Overhaul:** The entire application was migrated from a basic `ethers.js` setup to a modern **Wagmi** & **Viem** stack. This provides superior state management, data caching, and overall performance.
* **🌐 Enhanced Multi-Wallet Support:** Upgraded to **Web3Modal v2**, allowing seamless connection with a wide range of wallets, including MetaMask, Coinbase Wallet, and mobile wallets via WalletConnect.
* **🎯 Targeted Verification System:** A major new feature allowing users to "tag" a specific, registered Issuer address when uploading a document. This ensures that only the intended institution can view and verify the credential, enhancing privacy and efficiency.
* **✨ Dynamic UI & Animations:** The user interface has been brought to life with **Framer Motion**, featuring smooth page transitions and dynamic, staggered animations for a professional and fluid user experience.
* **📱 Full Responsiveness:** The UI is now fully responsive and optimized for a great experience on both desktop and mobile devices.

---
## Core Features

* **👤 User Dashboard:** Users can connect their wallet to upload important documents to **IPFS** via Pinata. When uploading, they can **tag a specific Issuer** to request verification, ensuring only that institution can act on it. Users can view their entire on-chain portfolio of documents and their verification status.

* **👑 Admin & 🎓 Issuer Dashboard:** A role-based system powered by the smart contract.
    * The **Admin** (contract owner) can authorize trusted institutions by adding their wallet addresses as official "Issuers".
    * **Issuers** see a dedicated, automated queue of documents that have been specifically tagged for their review. They can search this queue and verify documents with a single, secure transaction.

* **🔍 Public Verifier:** An open-access page where anyone (like a recruiter) can paste a candidate's wallet address to instantly view their portfolio of credentials, clearly seeing which ones have been officially verified.

---
## How It Works

The process is simple and creates a transparent chain of trust:

1.  **Upload & Tag:** A user uploads their credential and tags the wallet address of the institution that issued it (e.g., their university).
2.  **Verify:** The institution logs in, sees the pending request in their queue, and cryptographically verifies the document on the blockchain.
3.  **Share & Confirm:** Anyone can now look up the user's address and see the document with undeniable proof that it was verified by the official issuer.

---
## Tech Stack

* **Frontend:** **React.js**
* **Web3 Connectivity:** **Wagmi** & **Viem**
* **Wallet Integration:** **Web3Modal v2**
* **Smart Contract:** **Solidity** (Deployed on Sepolia Testnet)
* **Decentralized Storage:** **IPFS** via **Pinata**
* **Animations:** **Framer Motion**
* **Deployment:** **Vercel**

---
## Getting Started

To run this project locally, follow these steps:

**1. Clone the repository:**
```bash
git clone [https://github.com/LaxmiGunaShekar/certichain-v3.git](https://github.com/LaxmiGunaShekar/certichain-v3.git)
cd certichain-v3


## 2. Install dependencies:
This project has a complex dependency tree. The most reliable way to install is using the --legacy-peer-deps flag with npm.

Bash

npm install --legacy-peer-deps
## 3. Set up your environment variables:
Create a .env file in the root of the project and add the following keys. You can get a free Project ID from WalletConnect Cloud.

REACT_APP_WALLETCONNECT_ID=
REACT_APP_PINATA_API_KEY=
REACT_APP_PINATA_API_SECRET=
## 4. Run the development server:

Bash

npm start
The application will be available at http://localhost:3000.

## Deployment
This project is configured for easy deployment on Vercel. Simply import the GitHub repository, configure the three environment variables and the install command (npm install --legacy-peer-deps), and deploy. Continuous deployment is active, meaning any git push to the master branch will automatically trigger a new deployment.


After you create this file, remember to push it to your GitHub repository!
```bash
git add README.md
git commit -m "docs: Create final project README"
git push origin master