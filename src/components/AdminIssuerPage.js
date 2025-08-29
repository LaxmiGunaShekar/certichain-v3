import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContracts } from 'wagmi/actions';
import { wagmiConfig } from '../App.js';
import { contractAddress, finalABI } from '../App.js';
import { isAddress } from 'ethers';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const AdminIssuerPage = ({ setNotification }) => {
  const { address } = useAccount();
  const [newIssuerAddress, setNewIssuerAddress] = useState("");
  const [pendingDocs, setPendingDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyingDocIndex, setVerifyingDocIndex] = useState(null);

  const { data: ownerAddress } = useReadContract({ address: contractAddress, abi: finalABI, functionName: 'owner' });
  const isOwner = address?.toLowerCase() === ownerAddress?.toLowerCase();
  const { data: isAnIssuer } = useReadContract({ address: contractAddress, abi: finalABI, functionName: 'isIssuer', args: [address], enabled: !!address });

  const { data: queueCountData } = useReadContract({
    address: contractAddress, abi: finalABI, functionName: 'getIssuerQueueCount', args: [address], enabled: isAnIssuer,
  });
  const queueCount = queueCountData ? Number(queueCountData) : 0;
  const queuePointerConfigs = Array.from({ length: queueCount }, (_, index) => ({
    address: contractAddress, abi: finalABI, functionName: 'issuerVerificationQueue', args: [address, index],
  }));
  const { data: queuePointers } = useReadContracts({
    contracts: queuePointerConfigs, enabled: queueCount > 0,
  });

  useEffect(() => {
    const fetchPendingDocuments = async () => {
      setIsLoading(true);
      if (queuePointers && queuePointers.length > 0) {
        const docDetailsConfigs = queuePointers.filter(p => p.status === 'success').map(p => ({ address: contractAddress, abi: finalABI, functionName: 'getDocument', args: [p.result[0], p.result[1]] }));
        if (docDetailsConfigs.length > 0) {
            const docDetailsData = await readContracts(wagmiConfig, { contracts: docDetailsConfigs });
            if (docDetailsData) {
              const formatted = docDetailsData.map((doc, i) => ({ ...doc, userAddress: queuePointers[i].result[0], docIndex: Number(queuePointers[i].result[1]) })).filter(doc => doc.status === 'success' && !doc.result[3]);
              setPendingDocs(formatted);
            }
        } else { setPendingDocs([]); }
      } else { setPendingDocs([]); }
      setIsLoading(false);
    };
    fetchPendingDocuments();
  }, [queuePointers, queueCount]);

  const { data: hash, writeContract, isPending, error: writeError, reset } = useWriteContract();
  const { isSuccess, isError, error: receiptError } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setNotification({ isActive: true, message: 'Transaction successful! The page will now refresh.', type: 'success' });
      setTimeout(() => window.location.reload(), 2000);
    }
    if (isError || writeError) {
      const errorMsg = writeError?.shortMessage || receiptError?.shortMessage;
      setNotification({ isActive: true, message: `Transaction Failed: ${errorMsg}`, type: 'error' });
      reset();
    }
  }, [isSuccess, isError, writeError, receiptError, reset, setNotification]);

  const handleAddIssuer = (e) => { e.preventDefault(); if (!isAddress(newIssuerAddress)) return setNotification({isActive: true, message: 'Invalid Ethereum address.', type: 'error'}); writeContract({ address: contractAddress, abi: finalABI, functionName: 'addIssuer', args: [newIssuerAddress] }); };
  const handleVerifyDocument = (userAddress, docIndex) => { setVerifyingDocIndex(docIndex); writeContract({ address: contractAddress, abi: finalABI, functionName: 'verifyDocument', args: [userAddress, docIndex] }); };
  const docsToDisplay = searchTerm ? pendingDocs.filter(doc => doc.userAddress.toLowerCase().includes(searchTerm.toLowerCase())) : pendingDocs;

  if (isOwner) {
    return (
      <motion.div className="admin-panel-container" variants={itemVariants} initial="hidden" animate="visible">
        <div className="card">
          <h3>Admin Panel</h3><p>As the platform owner, you can grant verification rights by adding an issuer's wallet address below.</p>
          <form onSubmit={handleAddIssuer}>
            <input type="text" placeholder="Enter new issuer's wallet address" value={newIssuerAddress} onChange={(e) => setNewIssuerAddress(e.target.value)} required />
            <button type="submit" disabled={isPending}>{isPending ? 'Processing...' : 'Add Issuer'}</button>
          </form>
        </div>
      </motion.div>
    );
  }
  if (isAnIssuer) {
    return (
      <motion.div className="issuer-panel-container" variants={itemVariants} initial="hidden" animate="visible">
        <div className="card">
          <h3>Issuer Dashboard</h3><p>The following documents have been submitted for your verification. You can search by a user's wallet address to filter the list.</p>
          <div className="search-bar" style={{ margin: '20px 0' }}><input type="text" placeholder="Filter by Student Wallet Address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="document-list-header" style={{ marginTop: '30px', borderTop: '1px solid #4a4a68', paddingTop: '20px' }}><h4>Pending Verifications</h4><p style={{fontSize: '0.9rem', color: '#ccc'}}>These documents have been specifically tagged for your review.</p></div>
          <div className="document-list">
            {isLoading && <p>Loading verification requests...</p>}
            {!isLoading && docsToDisplay.length === 0 && <p>There are no documents pending your verification.</p>}
            {!isLoading && docsToDisplay.map(doc => {
              const isCurrentDocPending = isPending && verifyingDocIndex === doc.docIndex;
              return (
                <div key={`${doc.userAddress}-${doc.docIndex}`} className="document-item">
                  <span>User: `{doc.userAddress.substring(0, 6)}...` - Doc: "{doc.result[1]}"</span>
                  <div className="document-actions">
                    <a href={`https://gateway.pinata.cloud/ipfs/${doc.result[0]}`} target="_blank" rel="noopener noreferrer">View Document</a>
                    <button onClick={() => handleVerifyDocument(doc.userAddress, doc.docIndex)} disabled={isPending}>{isCurrentDocPending ? 'Verifying...' : 'Verify'}</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div className="card" variants={itemVariants} initial="hidden" animate="visible">
      <h3>Access Denied</h3><p>Your wallet address does not have Admin or Issuer privileges.</p>
    </motion.div>
  );
};

export default AdminIssuerPage;