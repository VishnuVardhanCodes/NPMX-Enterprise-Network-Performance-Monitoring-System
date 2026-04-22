import React from 'react';
import { motion } from 'framer-motion';
import { SearchX, ServerOff, ShieldAlert } from 'lucide-react';

export default function EmptyState({ title = "No Data Found", message = "There is currently no data to display.", type = "default" }) {
  const getIcon = () => {
    switch(type) {
      case 'devices': return <ServerOff size={48} className="text-gray-600 mb-4" />;
      case 'alerts': return <ShieldAlert size={48} className="text-gray-600 mb-4" />;
      default: return <SearchX size={48} className="text-gray-600 mb-4" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col flex-1 items-center justify-center p-12 text-center h-full w-full opacity-60 hover:opacity-100 transition-opacity"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {getIcon()}
      </motion.div>
      <h3 className="text-lg font-bold text-gray-300 tracking-wide">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">{message}</p>
    </motion.div>
  );
}
