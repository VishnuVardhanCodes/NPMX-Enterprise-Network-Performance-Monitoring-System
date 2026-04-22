import React, { memo } from 'react';
import { motion } from 'framer-motion';

export default memo(function ChartCard({ title, children, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ boxShadow: "0 0 30px rgba(147, 51, 234, 0.05)" }}
      className="glass-panel p-6 relative rounded-2xl group transition-all"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h4 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          {title}
        </h4>
        <div className="flex gap-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-xs text-cyan-400 font-medium tracking-widest uppercase">Live</span>
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
});
