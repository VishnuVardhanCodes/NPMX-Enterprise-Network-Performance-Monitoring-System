import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import ChartCard from '../components/ChartCard';
import { Play, Square, Activity, Network } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDevicesApi, pingDeviceApi, getDeviceMetricsApi, triggerSnmpApi, getSnmpMetricsApi } from '../services/api';

export default function Monitoring() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  
  const [metrics, setMetrics] = useState([]);
  const [snmpMetrics, setSnmpMetrics] = useState([]);
  const [currentBandwidth, setCurrentBandwidth] = useState(0);
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  
  // Load Available Devices
  useEffect(() => {
    getDevicesApi().then(data => {
      setDevices(data);
      if (data.length > 0) setSelectedDevice(data[0].id.toString());
    }).catch(() => toast.error('Failed to load device list'));
  }, []);

  // Polling Loop for Ping and SNMP
  useEffect(() => {
    let interval;
    if (isMonitoring && selectedDevice) {
      const cycle = async () => {
        try {
          // 1. PING TELEMETRY
          let pingData = [];
          try {
            await pingDeviceApi(selectedDevice);
            pingData = await getDeviceMetricsApi(selectedDevice);
          } catch (e) {
            console.warn("Ping API Failed", e);
            pingData = [{ timestamp: new Date().toISOString(), latency: 0, packet_loss: 100, is_fallback: true }];
          }
          
          let simulated = false;
          const formattedPing = Array.isArray(pingData) ? pingData.map(item => {
            const date = new Date(item.timestamp);
            if (item.is_fallback) simulated = true;
            return {
              time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`,
              latency: item.latency || 0,
            };
          }) : [];
          setMetrics(formattedPing);

          // 2. SNMP TELEMETRY
          let snmpData = [];
          try {
            const snmpRes = await triggerSnmpApi(selectedDevice);
            if (snmpRes.is_simulated) simulated = true;
            snmpData = await getSnmpMetricsApi(selectedDevice);
          } catch (e) {
            console.warn("SNMP API Failed", e);
            snmpData = [{ timestamp: new Date().toISOString(), in_octets: 1000, out_octets: 1000, bandwidth: 1.2, is_fallback: true }];
            simulated = true;
          }
          
          const formattedSnmp = Array.isArray(snmpData) ? snmpData.map(item => {
            const date = new Date(item.timestamp);
            if (item.is_fallback) simulated = true;
            return {
              time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`,
              inOctets: item.in_octets || 0,
              outOctets: item.out_octets || 0,
              bandwidth: item.bandwidth || 0
            };
          }) : [];
          setSnmpMetrics(formattedSnmp);
          setIsSimulated(simulated);
          
          if(formattedSnmp.length > 0) {
              setCurrentBandwidth(formattedSnmp[formattedSnmp.length - 1].bandwidth);
          }
        } catch (globalErr) {
          console.error("Critical Telemetry Loop Error:", globalErr);
        }
      };
      
      cycle(); // Run immediately on start
      interval = setInterval(cycle, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, selectedDevice]);

  const gaugeData = [{ name: 'Bandwidth', value: currentBandwidth, fill: '#8b5cf6' }];

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER & CONTROLS */}
      <div className="mb-8 flex flex-col items-center justify-center text-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 justify-center">Advanced Telemetry</h2>
          <p className="text-gray-400 mt-1">Live ICMP Latency & SNMP Network Traffic</p>
        </div>
        
        <div className="flex bg-gray-900/50 p-2 rounded-2xl border border-white/5 items-center gap-3 shadow-xl">
          <select 
            value={selectedDevice} 
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={isMonitoring || devices.length === 0}
            className="bg-black/40 text-sm border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 min-w-[200px]"
          >
            {devices.map(d => <option key={d.id} value={d.id}>{d.device_name} ({d.ip_address})</option>)}
            {devices.length === 0 && <option value="">No devices registered...</option>}
          </select>

          {isMonitoring ? (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setIsMonitoring(false); toast('Monitoring Paused', { icon: '⏸️' }); }}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2.5 rounded-xl border border-red-500/30 transition-all font-semibold shadow-inner"
            >
              <Square size={16} fill="currentColor" /> Stop
            </motion.button>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { 
                if(!selectedDevice) return toast.error('Select a device first!');
                setIsMonitoring(true); 
                toast.success('System Diagnostics Started'); 
              }}
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl border border-emerald-500/30 transition-all font-semibold shadow-inner"
            >
              <Play size={16} fill="currentColor" /> Start Live
            </motion.button>
          )}

          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-colors duration-500 ${isMonitoring ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-white/5 text-gray-500 border-transparent'}`}>
             <span className="relative flex h-2 w-2">
              {isMonitoring && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isMonitoring ? 'bg-cyan-500' : 'bg-gray-600'}`}></span>
            </span>
            {isMonitoring ? 'Streaming Live' : 'Offline'}
          </div>

          <AnimatePresence>
            {isSimulated && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              >
                Simulated Data Mode
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!isMonitoring && metrics.length === 0 ? (
         <div className="h-[500px] w-full flex flex-col items-center justify-center text-gray-500 border border-white/5 rounded-3xl bg-white/[0.02]">
           <Network className="w-16 h-16 mb-4 opacity-50 text-cyan-500/50" />
           <p className="text-xl font-semibold">Ready for Deployment</p>
           <p className="text-sm mt-2 max-w-sm text-center">Select a target node from the dropdown above and press "Start Live" to instantiate SNMP and ICMP data streams.</p>
         </div>
      ) : (
        <div className="space-y-6">
          {/* TOP TIER: GAUGE AND LATENCY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* BANDWIDTH METER GAUGE */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px]"></div>
              <h3 className="text-white font-semibold text-lg tracking-wide mb-2">Live Throughput</h3>
              <p className="text-gray-400 text-xs mb-4">Calculated SNMP Payload</p>
              
              <div className="relative w-full h-[200px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart 
                    cx="50%" cy="50%" 
                    innerRadius="70%" outerRadius="100%" 
                    barSize={15} 
                    data={gaugeData} 
                    startAngle={180} endAngle={0}
                  >
                    <RadialBar minAngle={15} background={{ fill: 'rgba(255,255,255,0.05)' }} clockWise dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center">
                   <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                     {currentBandwidth.toFixed(1)}
                   </span>
                   <span className="text-cyan-400 text-sm font-semibold tracking-widest mt-1">MBPS</span>
                </div>
              </div>
            </div>

            {/* ICMP LATENCY CHART */}
            <div className="lg:col-span-2">
              <ChartCard title="ICMP Latency Graph (ms)" delay={0.1}>
                <div className="w-full h-[300px] min-h-[300px]">
                   <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                      <Line 
                        type="monotone" isAnimationActive={false} 
                        dataKey="latency" name="Ping (ms)"
                        stroke="#06b6d4" strokeWidth={3} 
                        dot={{r: 4, fill: '#06b6d4', strokeWidth: 0}} 
                        activeDot={{r: 8, fill: '#fff', strokeWidth: 3, stroke: '#06b6d4', className: 'drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'}} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>

          {/* LOWER TIER: SNMP TRAFFIC CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SNMP BANDWIDTH LINE */}
            <ChartCard title="Calculated Bandwidth Trend (Mbps)" delay={0.2}>
              <div className="w-full h-[300px] min-h-[300px]">
                 <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={snmpMetrics}>
                    <defs>
                      <linearGradient id="colorBw" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area 
                      type="monotone" isAnimationActive={false} 
                      dataKey="bandwidth" name="Throughput"
                      stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBw)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* RAW INTERFACE TRAFFIC */}
            <ChartCard title="Raw Interface Traffic (Octets)" delay={0.3}>
              <div className="w-full h-[300px] min-h-[300px]">
                 <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={snmpMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Line 
                      type="monotone" isAnimationActive={false} 
                      dataKey="inOctets" name="In (Rx)"
                      stroke="#ec4899" strokeWidth={3} dot={false}
                    />
                    <Line 
                      type="monotone" isAnimationActive={false} 
                      dataKey="outOctets" name="Out (Tx)"
                      stroke="#10b981" strokeWidth={3} dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
