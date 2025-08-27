# CertiChain v2 ⛓️✅

> "Where there is a chain, there is Trust."

CertiChain v2 is a complete rebuild of the original CertiChain project, now powered by a modern, robust, and scalable Web3 stack. It is a full-stack decentralized application (dApp) designed to securely store, manage, and verify documents on the blockchain, creating a single source of truth for credentials and eliminating digital document fraud.

This project leverages the security of the Ethereum blockchain and the decentralized nature of IPFS to create a trustless ecosystem for students, issuing institutions, and recruiters.

---
## Core Features

* **👤 User Dashboard:** Users can securely connect with a wide range of wallets (not just MetaMask) to upload their important documents (degrees, certificates, etc.). Each file is uploaded to IPFS for decentralized storage, and its unique hash is recorded on the blockchain in the user's personal on-chain portfolio.

* **👑 Admin & 🎓 Issuer Dashboard:** The application features a role-based access system.
    * The **Admin** (the contract owner) has the exclusive ability to authorize trusted institutions (e.g., universities, companies) by adding their wallet addresses as official "Issuers".
    * **Issuers** can then search for any user's profile and see a list of their unverified documents. With a single transaction, an issuer can cryptographically verify a document, creating a permanent and undeniable on-chain endorsement.

* **🔍 Public Verifier:** Anyone, such as a recruiter or an admissions officer, can use the public verifier tool. By simply pasting a candidate's public wallet address, they can instantly view a complete portfolio of that user's documents and, most importantly, see which ones have been officially verified and by whom.

* **📱 Multi-Wallet & Responsive Design:** Built with Web3Modal v2 and a responsive UI, CertiChain v2 offers a seamless experience on both desktop and mobile, allowing users to connect with their favorite wallets, including MetaMask, Coinbase Wallet, Trust Wallet, and many others via WalletConnect.

---
## Tech Stack

This project was built using a modern Web3 technology stack:

* **Frontend:** **React.js**
* **Web3 Connectivity:** **Wagmi** & **Viem** (for robust blockchain interaction and state management)
* **Wallet Integration:** **Web3Modal v2** (for seamless multi-wallet support)
* **Decentralized Storage:** **IPFS** via **Pinata**
* **Smart Contract:** Written in **Solidity** and deployed on the **Sepolia Testnet**.
* **Styling:** Plain CSS with a focus on responsiveness.
* **Deployment:** **Vercel**

---
## Getting Started

To run this project locally, follow these steps:

**1. Clone the repository:**
```bash
git clone [https://github.com/Your-Username/certichain-v2.git](https://github.com/Your-Username/certichain-v2.git)
cd certichain-v2

## 2. Install dependencies:
This project uses Yarn.

##Bash

yarn install
## 3. Set up your environment variables:
Create a .env file in the root of the project and add the following keys. You can get a free Project ID from WalletConnect Cloud.

REACT_APP_WALLETCONNECT_ID=
REACT_APP_PINATA_API_KEY=
REACT_APP_PINATA_API_SECRET=
## 4. Run the development server:

Bash

yarn start
The application will be available at http://localhost:3000.