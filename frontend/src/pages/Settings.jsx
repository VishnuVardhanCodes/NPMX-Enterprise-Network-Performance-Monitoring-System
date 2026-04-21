import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Save, Server, Activity, ShieldAlert, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDevicesApi, getThresholdApi, updateThresholdApi } from '../services/api';

export default function Settings() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  
  const [latency, setLatency] = useState(100.0);
  const [packetLoss, setPacketLoss] = useState(5.0);
  const [bandwidth, setBandwidth] = useState(80.0);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await getDevicesApi();
        setDevices(data);
        if (data.length > 0) {
           setSelectedDevice(data[0].id.toString());
        }
      } catch (err) {
        toast.error("Failed to load device structures");
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchThresholds = async () => {
       if(!selectedDevice) return;
       try {
           setIsLoading(true);
           const data = await getThresholdApi(selectedDevice);
           setLatency(data.latency_threshold || 100);
           setPacketLoss(data.packet_loss_threshold || 5);
           setBandwidth(data.bandwidth_threshold || 80);
       } catch(e) {
           toast.error("Unable to load logic thresholds");
       } finally {
           setIsLoading(false);
       }
    };
    fetchThresholds();
  }, [selectedDevice]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (latency < 0 || packetLoss < 0 || bandwidth < 0) {
      return toast.error("Threshold limits cannot drop below zero");
    }
    
    if (packetLoss > 100) return toast.error("Packet loss caps at 100%");
    
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
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-6">
        <div>
           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center gap-3">
            <SettingsIcon size={32} className="text-teal-500" /> Platform Configuration
          </h2>
          <p className="text-gray-400 mt-2 text-sm max-w-lg">Modify infrastructure mechanics, alert limits, and boundary constants securely. Changes overwrite native physics globally.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
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

        <form onSubmit={handleSave} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLoading && (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="space-y-5"
              >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                        <Activity size={14} className="text-pink-400"/> Max ICMP Latency (ms)
                      </label>
                      <input 
                        type="number" step="0.1"
                        value={latency} onChange={(e) => setLatency(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:border-pink-500/50 transition-all font-mono"
                      />
                    </div>
                    
                    <div className="space-y-1">
                       <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                         <ShieldAlert size={14} className="text-red-400"/> Critical Packet Loss (%)
                       </label>
                       <input 
                         type="number" step="0.1"
                         value={packetLoss} onChange={(e) => setPacketLoss(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:border-red-500/50 transition-all font-mono"
                       />
                    </div>

                     <div className="space-y-1 md:col-span-2">
                       <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                         <Server size={14} className="text-purple-400"/> SNMP Bandwidth Ceiling (Mbps)
                       </label>
                       <input 
                         type="number" step="0.1"
                         value={bandwidth} onChange={(e) => setBandwidth(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:border-purple-500/50 transition-all font-mono max-w-xs"
                       />
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
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}
