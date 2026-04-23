import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Save, Server, Activity, ShieldAlert, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDevicesApi, getThresholdApi, updateThresholdApi } from '../services/api';

export default function Settings() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  
  const [latency, setLatency] = useState(100);
  const [packetLoss, setPacketLoss] = useState(5);
  const [bandwidth, setBandwidth] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  
  const [interval, setIntervalVal] = useState(5);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load target nodes
  useEffect(() => {
    getDevicesApi().then(data => {
      setDevices(data);
      if (data.length > 0) setSelectedDevice(data[0].id.toString());
    }).catch(() => toast.error('Infrastucture registry inaccessible'));
  }, []);

  // Sync threshold parameters on node selection
  useEffect(() => {
    if (selectedDevice) {
      setIsLoading(true);
      getThresholdApi(selectedDevice)
        .then(data => {
          if (data) {
            setLatency(data.latency_threshold);
            setPacketLoss(data.packet_loss_threshold);
            setBandwidth(data.bandwidth_threshold);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedDevice]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
         latency_threshold: parseFloat(latency),
         packet_loss_threshold: parseFloat(packetLoss),
         bandwidth_threshold: parseFloat(bandwidth)
      };
      await updateThresholdApi(selectedDevice, payload);
      toast.success("Security Settings Successfully Modified!");
    } catch(err) {
      toast.error("Failed to register metric adjustments");
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center mb-4 border-b border-white/5 pb-6 text-center">
        <div>
           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center gap-3">
            <SettingsIcon size={32} className="text-teal-500" /> Platform Configuration
          </h2>
          <p className="text-gray-400 mt-2 text-sm max-w-lg mx-auto">Modify infrastructure mechanics, alert limits, and boundary constants securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-3xl border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-8">
               <Cpu className="text-cyan-400" size={24} />
               <h3 className="text-xl font-bold text-white">Dynamic Threshold Management</h3>
            </div>

            <div className="mb-8 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Target Node Parameter</label>
              <select 
                value={selectedDevice} 
                onChange={(e) => setSelectedDevice(e.target.value)}
                 className="w-full bg-gray-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 appearance-none font-mono"
              >
                {devices.map(d => <option key={d.id} value={d.id}>{d.device_name} (IP: {d.ip_address})</option>)}
                {devices.length === 0 && <option value="">No targets established</option>}
              </select>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
              <AnimatePresence mode="wait">
                {!isLoading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                              <Activity size={14} className="text-pink-400"/> Max ICMP Latency
                            </label>
                            <span className="text-xs font-mono text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded">{latency} ms</span>
                          </div>
                          <input type="range" min="10" max="500" value={latency} onChange={(e) => setLatency(e.target.value)} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                           <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                             <ShieldAlert size={14} className="text-red-400"/> Critical Packet Loss
                           </label>
                           <span className="text-xs font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded">{packetLoss} %</span>
                          </div>
                          <input type="range" min="0" max="50" step="0.5" value={packetLoss} onChange={(e) => setPacketLoss(e.target.value)} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                        </div>

                         <div className="space-y-4">
                           <div className="flex justify-between items-center">
                             <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                               <Server size={14} className="text-purple-400"/> SNMP Bandwidth Ceiling
                             </label>
                             <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">{bandwidth} Mbps</span>
                           </div>
                           <input type="range" min="1" max="1000" value={bandwidth} onChange={(e) => setBandwidth(e.target.value)} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end">
                         <motion.button 
                           type="submit"
                           whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                           className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl border border-teal-500/30 transition-all font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                         >
                           <Save size={18} /> Apply Threshold Bounds
                         </motion.button>
                      </div>
                  </motion.div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                  </div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>

        <div className="space-y-8">
           <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-3xl border-white/10 shadow-xl"
           >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" /> Polling Engine
              </h3>
              <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest font-bold">Frequency Level</p>
              <div className="space-y-3">
                 {[1, 5, 10, 30].map(val => (
                    <button 
                      key={val}
                      onClick={() => setIntervalVal(val)}
                      className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all ${interval === val ? 'bg-teal-500/10 border-teal-500/40 text-teal-400' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                       <span className="text-sm font-medium">{val === 1 ? 'High Precision' : val === 30 ? 'Resource Saver' : 'Standard'}</span>
                       <span className="text-xs font-mono">{val}s</span>
                    </button>
                 ))}
              </div>
           </motion.div>

           <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-3xl border-white/10 shadow-xl"
           >
              <h3 className="text-lg font-bold text-white mb-6">Aesthetics</h3>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                 <span className="text-sm text-gray-300">Enterprise Dark Mode</span>
                 <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-teal-500' : 'bg-gray-700'}`}
                 >
                    <motion.div 
                       animate={{ x: isDarkMode ? 24 : 4 }}
                       className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
                    />
                 </button>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
