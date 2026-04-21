import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Wifi, Activity, PowerOff, Trash2 } from 'lucide-react';

export default function DeviceTable({ devices, onDelete }) {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
        return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/20', icon: <Wifi size={14} />, glow: 'shadow-[0_0_10px_rgba(74,222,128,0.2)]' };
      case 'warning':
        return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/20', icon: <Activity size={14} />, glow: 'shadow-[0_0_10px_rgba(250,204,21,0.2)]' };
      case 'offline':
        return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/20', icon: <PowerOff size={14} />, glow: 'shadow-[0_0_10px_rgba(248,113,113,0.2)]' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-500/20', icon: <Wifi size={14} />, glow: '' };
    }
  };

  return (
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
          {devices && devices.length > 0 ? devices.map((device, idx) => {
            const statusConfig = getStatusConfig(device.status || 'active');
            return (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={device.id} 
                className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors group cursor-pointer"
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
                  <span className="bg-purple-500/5 px-2 py-1 rounded-md font-mono inline-block">
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
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
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
               <td colSpan={6} className="text-center p-8 text-gray-500">
                 No devices found. Click "Add Node" to begin tracking.
               </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
