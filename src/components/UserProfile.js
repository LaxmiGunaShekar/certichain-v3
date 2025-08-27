// =================================================================
// src/components/UserProfile.js (Corrected Refresh Logic)
// =================================================================

import React, { useState, useEffect } from 'react';
import UserDashboard from './UserDashboard';
// CHANGED: We now import useReadContracts as well
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractAddress, finalABI } from '../App.js';
import axios from 'axios';

const UserProfile = ({ balance }) => {
  const { address } = useAccount();

  const [showAll, setShowAll] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docName, setDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: docCountData, isLoading: isCountLoading, refetch: refetchDocCount } = useReadContract({
    address: contractAddress,
    abi: finalABI,
    functionName: 'getDocumentCount',
    args: [address],
  });
  const docCount = docCountData ? Number(docCountData) : 0;

  const documentReadConfigs = Array.from({ length: docCount }, (_, index) => ({
    address: contractAddress,
    abi: finalABI,
    functionName: 'getDocument',
    args: [address, index],
  }));

  // CHANGED: from useReadContract to useReadContracts (with an "s")
  const { data: docsData, isLoading: areDocsLoading, refetch: refetchDocsData } = useReadContracts({
    contracts: documentReadConfigs,
    enabled: docCount > 0,
  });

  useEffect(() => {
    if (docsData) {
      const formattedDocs = docsData.map(doc => ({
        ipfsHash: doc.result[0],
        documentName: doc.result[1],
        issuer: doc.result[2],
        isVerified: doc.result[3]
      }));
      setDocuments(formattedDocs);
    } else {
      setDocuments([]);
    }
  }, [docsData]);
  
  const { data: hash, writeContract, isPending: isUploadPending, reset } = useWriteContract();

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile || !docName) return alert("Please select a file and enter a name.");
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
        address: contractAddress,
        abi: finalABI,
        functionName: 'addDocument',
        args: [ipfsHash, docName],
      });
    } catch (error) {
      console.error("Error during upload:", error);
      alert("Upload failed. Make sure your Pinata API keys are set correctly in the .env file.");
    }
  };
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      alert('Document added successfully!');
      refetchDocCount();
      refetchDocsData();
      setDocName("");
      setSelectedFile(null);
      reset();
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    }
  }, [isConfirmed, refetchDocCount, refetchDocsData, reset]);
  
  const documentsToShow = showAll ? documents : documents.slice(0, 3);
  const isLoading = isCountLoading || areDocsLoading;
  const isActionPending = isUploadPending || isConfirming;

  return (
    <div className="user-profile-container">
      <div className="profile-header"><h2>My Profile</h2>{balance && <p className="balance-display">Balance: {balance} ETH</p>}</div>
      <form onSubmit={handleAddDocument} className="upload-section card">
        <h3>Upload a New Document</h3>
        <input type="text" placeholder="Document name (e.g., 'Bachelor Degree')" onChange={(e) => setDocName(e.target.value)} value={docName} required />
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} required />
        <button type="submit" disabled={isActionPending}>{isActionPending ? "Processing..." : "Upload and Add Document"}</button>
      </form>

      <div className="profile-dashboard-section card">
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
                      <span className={doc.isVerified ? 'verified-tag' : 'pending-tag'}>{doc.isVerified ? ` ✅ Verified by ${doc.issuer.substring(0,6)}...` : ' ❌ Pending'}</span>
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
      </div>
    </div>
  );
};

export default UserProfile;