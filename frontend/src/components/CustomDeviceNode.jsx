import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server, Wifi, AlertTriangle, XCircle, Router, MonitorSpeaker, Box } from 'lucide-react';

export default memo(function CustomDeviceNode({ data, isConnectable }) {
  const isAlert = data.isAlert;
  const status = data.status || 'offline';
  const deviceName = (data.device_name || '').toLowerCase();
  
  let glowColor = 'shadow-[0_0_20px_rgba(34,211,238,0.15)]';
  let borderColor = 'border-white/10';
  let StatusIcon = Wifi;
  let statusColor = 'text-green-400';
  let bgGradient = 'bg-gradient-to-br from-gray-950 to-gray-900';

  let Icon = Server;
  if (deviceName.includes('router') || deviceName.includes('gateway')) Icon = Router;
  else if (deviceName.includes('pc') || deviceName.includes('desktop')) Icon = MonitorSpeaker;
  else if (deviceName.includes('switch')) Icon = Box;

  if (isAlert || status === 'warning') {
    glowColor = 'shadow-[0_0_25px_rgba(249,115,22,0.4)]';
    borderColor = 'border-orange-500/50';
    StatusIcon = AlertTriangle;
    statusColor = 'text-orange-400';
    bgGradient = 'bg-gradient-to-br from-orange-950/80 to-gray-900';
  } else if (status === 'offline') {
    glowColor = 'shadow-[0_0_25px_rgba(239,68,68,0.4)]';
    borderColor = 'border-red-500/50';
    StatusIcon = XCircle;
    statusColor = 'text-red-400';
    bgGradient = 'bg-gradient-to-br from-red-950/80 to-gray-900';
  }

  return (
    <div className={`relative px-4 py-3 rounded-2xl ${bgGradient} border ${borderColor} ${glowColor} flex flex-col items-center justify-center min-w-[160px] transition-all hover:scale-105 duration-300 backdrop-blur-md`}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 !bg-cyan-400 border-2 border-gray-900 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
      
      <div className="flex items-center gap-3 w-full">
        <div className={`p-2.5 rounded-xl bg-black/60 border border-white/5 shadow-inner`}>
          <Icon size={22} className="text-gray-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-bold text-white text-sm tracking-wide truncate max-w-[100px]">{data.device_name || 'Node'}</h4>
          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${statusColor} mt-0.5 uppercase tracking-widest`}>
             <StatusIcon size={10} />
             {isAlert ? 'CRITICAL' : status}
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 !bg-purple-400 border-2 border-gray-900 shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
    </div>
  );
});
