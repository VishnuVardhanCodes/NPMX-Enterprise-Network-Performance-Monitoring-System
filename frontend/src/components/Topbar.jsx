import React from 'react';
import { Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Topbar() {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 glass-panel border-b border-dark-border flex items-center justify-between px-8 bg-[#0f111a]/80 backdrop-blur-xl z-20"
    >
      <h2 className="text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
        Project NPMX Overview
      </h2>
      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-primary-glow transition-colors focus:outline-none">
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-pink shadow-[0_0_10px_rgba(236,72,153,0.8)]"></span>
          </span>
        </button>
        <div className="h-10 w-10 rounded-full bg-gradient-animate flex items-center justify-center p-[2px] cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <div className="h-full w-full rounded-full bg-[#0f111a] flex items-center justify-center text-white hover:bg-white/5 transition-colors">
            <User size={20} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
