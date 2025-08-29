import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { y: "-50vh", opacity: 0 },
  visible: { y: "0", opacity: 1, transition: { delay: 0.2 } }
};

const Notification = ({ notification, setNotification }) => {
  if (!notification.isActive) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="notification-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div 
          className="notification-modal card" // We reuse our 'card' style!
          variants={modalVariants}
        >
          <h3>{notification.type === 'success' ? 'Success!' : 'Error'}</h3>
          <p>{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, isActive: false })}>
            OK
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;