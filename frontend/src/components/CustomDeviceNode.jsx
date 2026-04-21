import React from 'react';
import { Handle, Position } from 'reactflow';
import { Server, Wifi, AlertTriangle, XCircle } from 'lucide-react';

export default function CustomDeviceNode({ data, isConnectable }) {
  // data context parses from ReactFlow parent nodes state mapping
  const isAlert = data.isAlert;
  const status = data.status || 'offline';
  
  let glowColor = 'shadow-[0_0_15px_rgba(34,211,238,0.2)]';
  let borderColor = 'border-white/10';
  let Icon = Server;
  let StatusIcon = Wifi;
  let statusColor = 'text-green-400';

  if (isAlert || status === 'warning') {
    glowColor = 'shadow-[0_0_20px_rgba(249,115,22,0.4)]';
    borderColor = 'border-orange-500/50';
    StatusIcon = AlertTriangle;
    statusColor = 'text-orange-400';
  } else if (status === 'offline') {
    glowColor = 'shadow-[0_0_20px_rgba(239,68,68,0.4)]';
    borderColor = 'border-red-500/50';
    StatusIcon = XCircle;
    statusColor = 'text-red-400';
  }

  return (
    <div className={`relative px-4 py-3 rounded-2xl bg-gray-950 border ${borderColor} ${glowColor} flex flex-col items-center justify-center min-w-[140px] transition-colors`}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2.5 h-2.5 !bg-cyan-400 border-none shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-black/40 border border-white/5`}>
          <Icon size={20} className="text-gray-300" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm tracking-wide">{data.device_name || 'Unknown Node'}</h4>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusColor} mt-0.5 uppercase tracking-wider`}>
             <StatusIcon size={12} />
             {isAlert ? 'CRITICAL' : status}
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2.5 h-2.5 !bg-purple-400 border-none shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
    </div>
  );
}
