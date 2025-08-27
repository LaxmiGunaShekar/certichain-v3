// =================================================================
// src/components/AdminIssuerPage.js (Complete with Wagmi Hooks)
// =================================================================

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { wagmiConfig } from '../App.js'; // Import the wagmiConfig
import { contractAddress, finalABI } from '../App.js';
import { isAddress } from 'ethers';

const AdminIssuerPage = () => {
  const { address } = useAccount();

  // --- State for UI ---
  const [newIssuerAddress, setNewIssuerAddress] = useState("");
  const [userToVerify, setUserToVerify] = useState("");
  const [userDocs, setUserDocs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Read Contract Data ---
  const { data: ownerAddress } = useReadContract({ address: contractAddress, abi: finalABI, functionName: 'owner' });
  const isOwner = address?.toLowerCase() === ownerAddress?.toLowerCase();

  const { data: isAnIssuer } = useReadContract({ address: contractAddress, abi: finalABI, functionName: 'isIssuer', args: [address], enabled: !!address });

  // --- Write Contract Data (for both adding issuers and verifying docs) ---
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();

  const handleAddIssuer = (e) => {
    e.preventDefault();
    if (!isAddress(newIssuerAddress)) return alert("Please enter a valid Ethereum address.");
    writeContract({ address: contractAddress, abi: finalABI, functionName: 'addIssuer', args: [newIssuerAddress] });
  };

  const handleVerifyDocument = (userAddress, docIndex) => {
    writeContract({ address: contractAddress, abi: finalABI, functionName: 'verifyDocument', args: [userAddress, docIndex] });
  };

  // --- Transaction Confirmation Logic ---
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      alert("Transaction successful!");
      reset(); // Reset the hook for the next transaction
      setNewIssuerAddress("");
      if (userToVerify) handleSearchUser({ preventDefault: () => {} }); // Refresh search after verifying
    }
    if (error) alert(`An error occurred: ${error.shortMessage}`);
  }, [isConfirmed, error, reset]);

  // --- On-Demand Data Fetching for Issuer Search ---
  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!isAddress(userToVerify)) return alert("Please enter a valid Ethereum address.");
    setIsSearching(true);
    setUserDocs([]);
    try {
      const docCount = await readContract(wagmiConfig, { address: contractAddress, abi: finalABI, functionName: 'getDocumentCount', args: [userToVerify] });
      const docPromises = [];
      for (let i = 0; i < Number(docCount); i++) {
        docPromises.push(readContract(wagmiConfig, { address: contractAddress, abi: finalABI, functionName: 'getDocument', args: [userToVerify, i] }));
      }
      const resolvedDocs = await Promise.all(docPromises);
      const formattedDocs = resolvedDocs
        .map((doc, index) => ({
          index: index, ipfsHash: doc[0], documentName: doc[1], issuer: doc[2], isVerified: doc[3]
        }))
        .filter(doc => !doc.isVerified); // Only show unverified documents to the issuer
      setUserDocs(formattedDocs);
    } catch (err) {
      console.error("Error searching for user documents:", err);
      alert("Could not fetch documents for this user.");
    } finally {
      setIsSearching(false);
    }
  };

  // --- Render Logic ---
  if (isOwner) {
    return (
      <div className="admin-panel-container">
        <div className="card">
          <h3>Admin Panel</h3>
          <p>As the platform owner, you can grant verification rights to trusted institutions by adding their wallet address below.</p>
          <form onSubmit={handleAddIssuer}>
            <input type="text" placeholder="Enter new issuer's wallet address" value={newIssuerAddress} onChange={(e) => setNewIssuerAddress(e.target.value)} required />
            <button type="submit" disabled={isPending || isConfirming}>{isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Add Issuer'}</button>
          </form>
        </div>
      </div>
    );
  }

  if (isAnIssuer) {
    return (
      <div className="issuer-panel-container">
        <div className="card">
          <h3>Issuer Dashboard</h3>
          <p>As a trusted issuer, enter a user's wallet address to see a list of their credentials that are pending your verification.</p>
          <form onSubmit={handleSearchUser}>
            <input type="text" placeholder="Student Wallet Address" value={userToVerify} onChange={(e) => setUserToVerify(e.target.value)} required />
            <button type="submit" disabled={isSearching}>{isSearching ? "Searching..." : "Search"}</button>
          </form>
          <div className="document-list" style={{ marginTop: '20px' }}>
            {isSearching ? <p>Loading...</p> : userDocs.length === 0 && userToVerify ? <p>No documents are pending verification for this user.</p> :
              userDocs.map(doc => (
                <div key={doc.index} className="document-item">
                  <span>{doc.documentName}</span>
                  <div className="document-actions">
                    <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer">View Document</a>
                    <button onClick={() => handleVerifyDocument(userToVerify, doc.index)} disabled={isPending || isConfirming}>
                      {isPending || isConfirming ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Access Denied</h3>
      <p>Your wallet address does not have Admin or Issuer privileges.</p>
    </div>
  );
};

export default AdminIssuerPage;