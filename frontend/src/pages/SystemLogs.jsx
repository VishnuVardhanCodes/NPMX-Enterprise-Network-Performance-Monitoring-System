import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity, Terminal, Key, Trash, User, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLogsApi } from '../services/api'; 

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await getLogsApi();
      setLogs(data);
    } catch (e) {
      toast.error("Failed to load audit trail");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (actionText) => {
      const lower = actionText.toLowerCase();
      if (lower.includes('login') || lower.includes('register')) return <Key size={16} className="text-cyan-400" />;
      if (lower.includes('delete') || lower.includes('eras')) return <Trash size={16} className="text-red-400" />;
      if (lower.includes('threshold') || lower.includes('limit')) return <Activity size={16} className="text-purple-400" />;
      if (lower.includes('add')) return <ShieldCheck size={16} className="text-green-400" />;
      return <Terminal size={16} className="text-gray-400" />;
  };

  const filteredLogs = logs.filter(log => log.action.toLowerCase().includes(filter.toLowerCase()) || log.username.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col items-center justify-center text-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center gap-3">
            <Terminal size={32} className="text-emerald-500" /> System Audit Trail
          </h2>
          <p className="text-gray-400 mt-1">Immutable ledger tracking enterprise access records and physical configuration overrides.</p>
        </div>
        
        <div className="flex gap-3">
           <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Grep logs..." 
              value={filter} onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass-panel overflow-hidden bg-gray-950/80 rounded-2xl shadow-2xl border-white/10"
      >
        <div className="w-full overflow-x-auto custom-scrollbar pb-4 max-h-[700px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-gray-900 border-b border-white/10 z-10">
              <tr className="text-gray-400 text-xs uppercase tracking-widest shadow-lg">
                <th className="p-5 font-semibold pl-6">Timestamp / Seq ID</th>
                <th className="p-5 font-semibold">Security Context</th>
                <th className="p-5 font-semibold w-full">Executed Action</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                  key={log.id} 
                  className="border-b border-white/[0.03] hover:bg-white/[0.06] transition-colors group"
                >
                  <td className="p-4 pl-6 font-mono text-sm text-gray-500 group-hover:text-cyan-200 transition-colors">
                     {new Date(log.timestamp).toLocaleString()}
                     <span className="block text-[10px] text-gray-600 mt-1 opacity-50">TRACE_{log.id.toString().padStart(6, '0')}</span>
                  </td>
                  <td className="p-4">
                     <div className="flex items-center gap-2 bg-black/40 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                        <User size={14} className="text-emerald-400" />
                        <span className="text-gray-200 text-sm font-semibold">{log.username}</span>
                     </div>
                  </td>
                  <td className="p-4">
                     <div className="flex items-center gap-3">
                         <span className="p-2 bg-white/5 rounded-lg border border-white/5">{getActionIcon(log.action)}</span>
                         <span className="text-sm font-mono text-gray-300 group-hover:text-white transition-colors">{log.action}</span>
                     </div>
                  </td>
                </motion.tr>
              )) : (
                 <tr>
                   <td colSpan={3} className="text-center p-16 text-gray-500 font-mono">
                     {isLoading ? "Fetching audit trails..." : "No events recorded in search vector."}
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
