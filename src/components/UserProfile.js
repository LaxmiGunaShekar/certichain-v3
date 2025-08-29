import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserDashboard from './UserDashboard';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractAddress, finalABI } from '../App.js';
import axios from 'axios';
import { isAddress } from 'ethers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// Accept 'setNotification' as a prop
const UserProfile = ({ balance, setNotification }) => {
  const { address } = useAccount();
  const [showAll, setShowAll] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docName, setDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [intendedIssuer, setIntendedIssuer] = useState("");

  const { data: docCountData, isLoading: isCountLoading, refetch: refetchDocCount } = useReadContract({
    address: contractAddress, abi: finalABI, functionName: 'getDocumentCount', args: [address],
  });
  const docCount = docCountData ? Number(docCountData) : 0;
  const documentReadConfigs = Array.from({ length: docCount }, (_, index) => ({
    address: contractAddress, abi: finalABI, functionName: 'getDocument', args: [address, index],
  }));
  const { data: docsData, isLoading: areDocsLoading, refetch: refetchDocsData } = useReadContracts({
    contracts: documentReadConfigs, enabled: docCount > 0,
  });

  useEffect(() => {
    if (docsData) {
      const formattedDocs = docsData.map(doc => ({
        ipfsHash: doc.result[0], documentName: doc.result[1], issuer: doc.result[2], isVerified: doc.result[3]
      }));
      setDocuments(formattedDocs);
    } else {
      setDocuments([]);
    }
  }, [docsData]);
  
  const { data: hash, writeContract, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const error = writeError || receiptError;
    if (isConfirmed) {
      // USE NEW NOTIFICATION SYSTEM
      setNotification({ isActive: true, message: 'Document added successfully!', type: 'success' });
      refetchDocCount(); refetchDocsData();
      setDocName(""); setSelectedFile(null); setIntendedIssuer("");
      reset();
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    }
    if (error) {
      if (error.shortMessage.includes("The tagged address is not a registered issuer")) {
        setNotification({ isActive: true, message: 'Upload Failed: The wallet address you tagged is not a registered issuer.', type: 'error' });
      } else {
        setNotification({ isActive: true, message: `Transaction Failed: ${error.shortMessage}`, type: 'error' });
      }
      reset();
    }
  }, [isConfirmed, writeError, receiptError, refetchDocCount, refetchDocsData, reset, setNotification]);

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile || !docName || !intendedIssuer) return setNotification({isActive: true, message: 'Please fill out all fields.', type: 'error'});
    if (!isAddress(intendedIssuer)) return setNotification({isActive: true, message: 'The tagged issuer address is not a valid Ethereum address.', type: 'error'});
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
          'pinata_secret_api_key': process.env.REACT_APP_PINATA_API_SECRET
        }
      });
      const ipfsHash = res.data.IpfsHash;
      writeContract({
        address: contractAddress, abi: finalABI, functionName: 'addDocument', args: [ipfsHash, docName, intendedIssuer],
      });
    } catch (error) {
      console.error("Pinata Upload Error:", error);
      setNotification({isActive: true, message: 'Upload to Pinata failed. See console for details.', type: 'error'});
    }
  };
  
  const documentsToShow = showAll ? documents : documents.slice(0, 3);
  const isLoading = isCountLoading || areDocsLoading;
  const isActionPending = isPending || isConfirming;

  return (
    <motion.div className="user-profile-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="profile-header" variants={itemVariants}><h2>My Profile</h2>{balance && <p className="balance-display">Balance: {balance} ETH</p>}</motion.div>
      <motion.form onSubmit={handleAddDocument} className="upload-section card" variants={itemVariants}>
        <h3>Upload a New Document</h3>
        <input type="text" placeholder="Document name (e.g., 'Bachelor Degree')" onChange={(e) => setDocName(e.target.value)} value={docName} required />
        <input type="text" placeholder="Tag an Issuer's Wallet Address for Verification" onChange={(e) => setIntendedIssuer(e.target.value)} value={intendedIssuer} required />
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} required />
        <motion.button type="submit" disabled={isActionPending} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {isActionPending ? "Processing..." : "Upload and Add Document"}
        </motion.button>
      </motion.form>
      <motion.div className="profile-dashboard-section card" variants={itemVariants}>
        <h3>My Profile Dashboard</h3>
        <div className="dashboard-content">
          <div className="dashboard-visuals"><UserDashboard documents={documents} /></div>
          <div className="dashboard-doc-list">
            <h4 style={{ marginTop: 0 }}>My Documents</h4>
            <div className="document-list">
              {isLoading && <p>Loading your documents...</p>}
              {!isLoading && documents.length > 0 ? (
                documentsToShow.map((doc, index) => (
                  <div key={index} className="document-item">
                    <span>{doc.documentName}</span>
                    <div className="document-actions">
                      <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer">View Document</a>
                      <span className={doc.isVerified ? 'verified-tag' : 'pending-tag'}>{doc.isVerified ? `✅ Verified by ${doc.issuer.substring(0,6)}...` : '❌ Pending'}</span>
                    </div>
                  </div>
                ))
              ) : (!isLoading && <p>You have not uploaded any documents yet.</p>)}
              {!showAll && documents.length > 3 && (
                <button className="view-all-btn" onClick={() => setShowAll(true)}>View All Documents</button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;