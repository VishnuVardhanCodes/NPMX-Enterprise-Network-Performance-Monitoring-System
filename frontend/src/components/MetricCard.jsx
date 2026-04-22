import React, { memo } from 'react';
import { motion } from 'framer-motion';

export default memo(function MetricCard({ title, value, icon, color, delay }) {
  const gradientMap = {
    primary: 'from-purple-600 to-purple-400',
    blue: 'from-blue-600 to-blue-400',
    cyan: 'from-cyan-500 to-cyan-300',
    pink: 'from-pink-500 to-pink-300',
    green: 'from-green-500 to-green-300',
    red: 'from-red-500 to-red-300'
  };
  
  const textGlowMap = {
    primary: 'text-purple-400',
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
    green: 'text-green-400',
    red: 'text-red-400'
  };

  const selectedGradient = gradientMap[color] || gradientMap.primary;
  const selectedText = textGlowMap[color] || textGlowMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="glass-panel p-6 relative overflow-hidden group rounded-2xl cursor-pointer"
    >
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${selectedGradient} group-hover:opacity-40 transition-opacity duration-500`}></div>
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
          <motion.h3 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
            className={`text-4xl font-bold tracking-tight ${selectedText} drop-shadow-[0_0_8px_currentColor]`}
          >
            {value}
          </motion.h3>
        </div>
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          className={`p-4 rounded-xl glass-panel relative`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${selectedGradient} opacity-20 rounded-xl`}></div>
          <span className={selectedText}>{icon}</span>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r group-hover:w-full transition-all duration-500 ease-out z-20"></div>
    </motion.div>
  );
});
