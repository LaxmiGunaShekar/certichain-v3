// =================================================================
// src/components/PublicVerifierPage.js (Complete with Wagmi Logic)
// =================================================================
import React, { useState } from 'react';
import UserDashboard from './UserDashboard';
import { readContract } from 'wagmi/actions';
import { wagmiConfig } from '../App.js'; // Import the wagmiConfig
import { contractAddress, finalABI } from '../App.js';
import { isAddress } from 'ethers';

const PublicVerifierPage = () => {
  const [userToSearch, setUserToSearch] = useState("");
  const [searchedDocs, setSearchedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedAddress, setSearchedAddress] = useState("");

  const handlePublicSearch = async (e) => {
    e.preventDefault();
    if (!isAddress(userToSearch)) return alert("Invalid Ethereum address.");
    setIsLoading(true);
    setHasSearched(true);
    setSearchedAddress(userToSearch);
    setSearchedDocs([]);
    try {
      const docCount = await readContract(wagmiConfig, { address: contractAddress, abi: finalABI, functionName: 'getDocumentCount', args: [userToSearch] });
      const docPromises = [];
      for (let i = 0; i < Number(docCount); i++) {
        docPromises.push(readContract(wagmiConfig, { address: contractAddress, abi: finalABI, functionName: 'getDocument', args: [userToSearch, i] }));
      }
      const resolvedDocs = await Promise.all(docPromises);
      const formattedDocs = resolvedDocs.map(doc => ({
        ipfsHash: doc[0], documentName: doc[1], issuer: doc[2], isVerified: doc[3]
      }));
      setSearchedDocs(formattedDocs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      alert("Could not fetch documents for this address.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="public-verifier-container">
      <div className="card">
        <h3>Public Document Verifier</h3>
        <p>Anyone can use this tool to verify the authenticity of a user's credentials. Simply enter the user's public wallet address to view their on-chain portfolio.</p>
        <form onSubmit={handlePublicSearch}>
          <input type="text" placeholder="Enter Wallet Address" value={userToSearch} onChange={(e) => setUserToSearch(e.target.value)} required />
          <button type="submit" disabled={isLoading}>{isLoading ? 'Searching...' : 'Search'}</button>
        </form>
      </div>

      {hasSearched && (
        <div className="search-results-section card">
          <h3>Search Results</h3>
          <p>Profile of: {searchedAddress}</p>
          {isLoading ? <p>Loading...</p> : (
            <>
              <UserDashboard documents={searchedDocs} />
              <div className="document-list" style={{ marginTop: '20px' }}>
                {searchedDocs.length > 0 ? (
                  searchedDocs.map((doc, index) => (
                    <div key={index} className="document-item">
                      <span>{doc.documentName}</span>
                      <div className="document-actions">
                        {doc.isVerified && <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer">View Verified Document</a>}
                        <span className={doc.isVerified ? 'verified-tag' : 'pending-tag'}>{doc.isVerified ? `✅ Verified by ${doc.issuer.substring(0,6)}...` : '❌ Not Verified'}</span>
                      </div>
                    </div>
                  ))
                ) : <p>No documents found for this address.</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicVerifierPage;