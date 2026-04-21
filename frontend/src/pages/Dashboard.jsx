import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, ShieldAlert, Wifi, BarChart3, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import AlertPanel from '../components/AlertPanel';

const trafficData = [
  { time: '10:00', value: 400 }, { time: '10:05', value: 300 },
  { time: '10:10', value: 550 }, { time: '10:15', value: 450 },
  { time: '10:20', value: 700 }, { time: '10:25', value: 650 },
  { time: '10:30', value: 800 },
];

const mockAlerts = [
  { id: 1, severity: 'critical', title: 'High CPU Usage', time: '2 mins ago', message: 'Core-Router-01 CPU usage exceeded 95%.' },
  { id: 2, severity: 'warning', title: 'Packet Loss Spike', time: '15 mins ago', message: 'Gateway-Edge experiencing 3% packet loss.' },
  { id: 3, severity: 'info', title: 'Firmware Update', time: '1 hour ago', message: 'Switch-Alpha firmware successfully updated to v2.4.1.' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Network Overview</h2>
          <p className="text-gray-400 mt-1">Real-time performance and active incidents</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-300 backdrop-blur-md">
          <Clock size={16} className="text-cyan-400" /> Auto-refreshing in 5s
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <MetricCard title="Total Devices" value="124" icon={<Server size={28} />} color="blue" delay={0.1} />
        <MetricCard title="Active Devices" value="118" icon={<Wifi size={28} />} color="cyan" delay={0.2} />
        <MetricCard title="Network Health" value="98%" icon={<Activity size={28} />} color="green" delay={0.3} />
        <MetricCard title="Alerts Count" value="3" icon={<ShieldAlert size={28} />} color="red" delay={0.4} />
        <MetricCard title="Bandwidth Usage" value="45 TB" icon={<BarChart3 size={28} />} color="primary" delay={0.5} />
        <MetricCard title="Avg Latency" value="12 ms" icon={<Activity size={28} />} color="pink" delay={0.6} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-2">
          <ChartCard title="Traffic Overview" delay={0.7}>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="url(#colorTraffic)" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" activeDot={{r: 6, strokeWidth: 0, fill: '#22d3ee', className: 'drop-shadow-[0_0_10px_rgba(34,211,238,1)]'}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
        
        <div className="xl:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="glass-panel p-6 rounded-2xl h-full flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                Recent Alerts
              </h4>
              <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300">View All</button>
            </div>
            <div className="flex-1">
              <AlertPanel alerts={mockAlerts} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
