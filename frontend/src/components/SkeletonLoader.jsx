import React from 'react';
import { motion } from 'framer-motion';

export default function SkeletonLoader({ type = 'card' }) {
  if (type === 'dashboard') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse">
            <div className="flex justify-between items-start">
               <div className="space-y-3 w-full">
                 <div className="h-3 w-24 bg-white/10 rounded"></div>
                 <div className="h-8 w-16 bg-white/10 rounded"></div>
               </div>
               <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="glass-panel p-6 rounded-2xl h-full w-full animate-pulse flex flex-col justify-between">
        <div className="h-5 w-48 bg-white/10 rounded mb-4"></div>
        <div className="flex-1 w-full bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  if (type === 'table') {
    return (
       <div className="glass-panel p-6 rounded-2xl animate-pulse w-full space-y-4">
         <div className="h-6 w-full bg-white/10 rounded mb-4"></div>
         {[1, 2, 3, 4, 5].map(i => (
           <div key={i} className="h-12 w-full bg-white/5 rounded"></div>
         ))}
       </div>
    );
  }

  return (
    <div className="h-32 w-full bg-white/10 rounded-2xl animate-pulse"></div>
  );
}
