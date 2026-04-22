import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, ShieldAlert, Wifi, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import AlertPanel from '../components/AlertPanel';
import { getDashboardStatsApi, getRecentAlertsApi } from '../services/api';
import toast from 'react-hot-toast';

import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_devices: '0',
    active_devices: '0',
    network_health: '0%',
    alerts_count: '0',
    bandwidth_usage: '0 Mbps',
    avg_latency: '0 ms',
    traffic_data: []
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsData, alertsData] = await Promise.all([
        getDashboardStatsApi(),
        getRecentAlertsApi()
      ]);
      setStats(statsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      // Simulate slight delay for smooth animation look if needed or just disable loading immediately
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Network Overview</h2>
          <p className="text-gray-400 mt-1">Real-time performance and active incidents</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-300 backdrop-blur-md">
          <Clock size={16} className="text-cyan-400" /> Auto-refreshing in 10s
        </div>
      </div>

      {loading ? (
        <SkeletonLoader type="dashboard" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <MetricCard title="Total Devices" value={stats.total_devices} icon={<Server size={28} />} color="blue" delay={0.1} />
          <MetricCard title="Active Devices" value={stats.active_devices} icon={<Wifi size={28} />} color="cyan" delay={0.2} />
          <MetricCard title="Network Health" value={stats.network_health} icon={<Activity size={28} />} color="green" delay={0.3} />
          <MetricCard title="Alerts Count" value={stats.alerts_count} icon={<ShieldAlert size={28} />} color="red" delay={0.4} />
          <MetricCard title="Bandwidth Usage" value={stats.bandwidth_usage} icon={<BarChart3 size={28} />} color="primary" delay={0.5} />
          <MetricCard title="Avg Latency" value={stats.avg_latency} icon={<Activity size={28} />} color="pink" delay={0.6} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-2">
          <ChartCard title="Traffic Trend (Avg Latency)" delay={0.7}>
            <div className="h-[350px] w-full">
              {stats.traffic_data && stats.traffic_data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={stats.traffic_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                  <Activity size={48} className="opacity-20" />
                  <p>Insufficient telemetry data for mapping</p>
                </div>
              )}
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
                Recent Incidents
              </h4>
              <button 
                onClick={() => window.location.href = '/alerts'}
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
              >
                View All
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
               {alerts && alerts.length > 0 ? (
                 <AlertPanel alerts={alerts} />
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 py-10">
                   <ShieldAlert size={40} className="mb-2 opacity-20" />
                   <p className="text-sm">No active threats detected</p>
                 </div>
               )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
