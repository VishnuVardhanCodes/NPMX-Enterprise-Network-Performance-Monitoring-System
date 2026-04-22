import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Wifi, Activity, PowerOff, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DeviceTable({ devices, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
        return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/20', icon: <Wifi size={14} />, glow: 'shadow-[0_0_10px_rgba(74,222,128,0.2)]' };
      case 'warning':
        return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/20', icon: <Activity size={14} />, glow: 'shadow-[0_0_10px_rgba(250,204,21,0.2)]' };
      case 'offline':
        return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/20', icon: <PowerOff size={14} />, glow: 'shadow-[0_0_10px_rgba(248,113,113,0.2)]' };
      case 'simulated':
        return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/20', icon: <Activity size={14} />, glow: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-500/20', icon: <Wifi size={14} />, glow: '' };
    }
  };

  const filteredDevices = devices.filter(d => 
    d.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.ip_address?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const displayedDevices = filteredDevices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full space-y-4">
      {/* Table Controls */}
      <div className="flex justify-between items-center px-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by IP or Name..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-widest bg-white/[0.02]">
              <th className="p-4 font-semibold rounded-tl-xl pl-6">Device Name</th>
              <th className="p-4 font-semibold">IP Address</th>
              <th className="p-4 font-semibold">Port</th>
              <th className="p-4 font-semibold">Community</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold flex justify-end rounded-tr-xl pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedDevices.length > 0 ? displayedDevices.map((device, idx) => {
              const statusConfig = getStatusConfig(device.status || 'active');
              return (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={device.id} 
                  className="border-b border-white/[0.03] hover:bg-white/10 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner text-cyan-300 font-bold uppercase">
                        {device.device_name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-200 group-hover:text-white transition-colors">{device.device_name}</h4>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">SNMP Node</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm text-cyan-100">{device.ip_address}</td>
                  <td className="p-4 font-mono text-sm text-gray-300">{device.port}</td>
                  <td className="p-4 text-sm text-purple-300">
                    <span className="bg-purple-500/5 px-2 py-1 rounded-md font-mono inline-block border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                      {device.snmp_community ? '••••••••' : 'None'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} ${statusConfig.glow} capitalize`}>
                      {statusConfig.icon}
                      {device.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(device.id); }}
                        title="Delete Device"
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            }) : (
               <tr>
                 <td colSpan={6} className="text-center p-0">
                   <EmptyState type="devices" title="No Devices Found" message={searchTerm ? "No devices matched your search." : "Click 'Add Node' to trace devices on the network."} />
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
