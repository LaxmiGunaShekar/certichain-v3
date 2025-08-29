import React, { useState } from 'react';
import { motion } from 'framer-motion'; // <-- Import motion
import UserDashboard from './UserDashboard';
import { readContracts } from 'wagmi/actions';
import { wagmiConfig } from '../App.js';
import { contractAddress, finalABI } from '../App.js';
import { isAddress } from 'ethers';

// --- Animation Definitions ---
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

const PublicVerifierPage = () => {
  const [userToSearch, setUserToSearch] = useState("");
  const [searchedDocs, setSearchedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedAddress, setSearchedAddress] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handlePublicSearch = async (e) => {
    e.preventDefault();
    if (!isAddress(userToSearch)) return alert("Invalid Ethereum address.");
    setIsLoading(true); setHasSearched(true); setSearchedAddress(userToSearch); setSearchedDocs([]); setShowAll(false);
    try {
      const docCountResult = await readContracts(wagmiConfig, { contracts: [{ address: contractAddress, abi: finalABI, functionName: 'getDocumentCount', args: [userToSearch] }]});
      const count = Number(docCountResult[0].result);
      if (count > 0) {
        const docConfigs = Array.from({ length: count }, (_, i) => ({ address: contractAddress, abi: finalABI, functionName: 'getDocument', args: [userToSearch, i] }));
        const resolvedDocs = await readContracts(wagmiConfig, { contracts: docConfigs });
        const formattedDocs = resolvedDocs.map(doc => ({ ipfsHash: doc.result[0], documentName: doc.result[1], issuer: doc.result[2], isVerified: doc.result[3] }));
        setSearchedDocs(formattedDocs);
      }
    } catch (err) { console.error("Error fetching documents:", err); alert("Could not fetch documents."); }
    finally { setIsLoading(false); }
  };

  const documentsToShow = showAll ? searchedDocs : searchedDocs.slice(0, 3);

  return (
    <motion.div className="public-verifier-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="card" variants={itemVariants}>
          <h3>Public Document Verifier</h3>
          <p className="dashboard-description">Anyone can use this tool to verify the authenticity of a user's credentials.</p>
          <form onSubmit={handlePublicSearch}>
              <input type="text" placeholder="Enter Wallet Address" value={userToSearch} onChange={(e) => setUserToSearch(e.target.value)} required />
              <button type="submit" disabled={isLoading}>{isLoading ? 'Searching...' : 'Search'}</button>
          </form>
      </motion.div>
      {hasSearched && (
        <motion.div className="search-results-section card" variants={itemVariants}>
          <h3>Search Results</h3><p>Profile of: {searchedAddress}</p>
          {isLoading ? <p>Loading...</p> : (
            <div className="dashboard-content">
              <div className="dashboard-visuals"><UserDashboard documents={searchedDocs} /></div>
              <div className="dashboard-doc-list">
                <h4 style={{ marginTop: 0 }}>Documents</h4>
                <div className="document-list">
                  {searchedDocs.length > 0 ? (
                    documentsToShow.map((doc, index) => (
                      <div key={index} className="document-item">
                        <span>{doc.documentName}</span>
                        <div className="document-actions">
                          {doc.isVerified && <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer">View Verified Document</a>}
                          <span className={doc.isVerified ? 'verified-tag' : 'pending-tag'}>{doc.isVerified ? `✅ Verified by ${doc.issuer.substring(0,6)}...` : '❌ Not Verified'}</span>
                        </div>
                      </div>
                    ))
                  ) : <p>No documents found for this address.</p>}
                  {!showAll && searchedDocs.length > 3 && (
                    <button className="view-all-btn" onClick={() => setShowAll(true)}>View All Documents</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PublicVerifierPage;