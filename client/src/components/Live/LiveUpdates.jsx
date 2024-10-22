import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import websocket from '../../services/websocket';

export default function LiveUpdates() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const handleUpdate = (data) => {
      setUpdates(prev => [data, ...prev].slice(0, 5)); // Keep last 5 updates
    };

    websocket.subscribe('unit_update', handleUpdate);
    websocket.subscribe('form_update', handleUpdate);
    websocket.subscribe('order_update', handleUpdate);

    return () => {
      websocket.unsubscribe('unit_update', handleUpdate);
      websocket.unsubscribe('form_update', handleUpdate);
      websocket.unsubscribe('order_update', handleUpdate);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {updates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-white shadow-lg rounded-lg p-4 mb-2 max-w-sm"
          >
            <h4 className="font-medium">{update.title}</h4>
            <p className="text-sm text-gray-500">{update.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}