import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Download, Upload, Clock, RefreshCw, History } from 'lucide-react';
import ReactSpeedometer from 'react-d3-speedometer';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { startSpeedTestApi, getSpeedHistoryApi } from '../services/api';
import toast from 'react-hot-toast';

const SpeedTest = () => {
  const [loading, setLoading] = useState(false);
  const [speedData, setSpeedData] = useState(null);
  const [history, setHistory] = useState([]);
  const [maxDownload, setMaxDownload] = useState(100);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getSpeedHistoryApi();
      if (response.status === 'success') {
        setHistory(response.data.reverse());
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleStartTest = async () => {
    setLoading(true);
    setSpeedData(null);
    toast.loading("Testing Internet Speed... This may take a minute.", { id: 'speed-test' });

    try {
      const response = await startSpeedTestApi();
      if (response.status === 'success') {
        setSpeedData(response.data);
        if (response.data.download > maxDownload) {
          setMaxDownload(Math.ceil(response.data.download / 100) * 100);
        }
        toast.success("Speed test completed!", { id: 'speed-test' });
        fetchHistory();
      } else {
        toast.error("Speed test failed: " + response.message, { id: 'speed-test' });
      }
    } catch (error) {
      toast.error("Error running speed test.", { id: 'speed-test' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Internet Speed Test</h1>
        <button
          onClick={handleStartTest}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
            loading 
              ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
          }`}
        >
          {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Activity className="w-5 h-5" />}
          {loading ? "Testing..." : "Start Test"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-lg font-semibold mb-8 text-slate-600 dark:text-slate-400">Download Speed</h2>
          <div className="relative">
            <ReactSpeedometer
              maxValue={maxDownload}
              value={speedData ? speedData.download : 0}
              needleColor="#3b82f6"
              startColor="#3b82f6"
              segments={10}
              endColor="#ef4444"
              needleTransitionDuration={4000}
              needleTransition="easeElastic"
              textColor={window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#1e293b'}
              currentValueText={`${speedData ? speedData.download : 0} Mbps`}
              ringWidth={47}
            />
          </div>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-blue-500 font-medium animate-pulse"
            >
              Testing Internet Speed...
            </motion.div>
          )}
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <StatCard 
            title="Ping" 
            value={speedData ? speedData.ping : '--'} 
            unit="ms" 
            icon={<Clock className="text-amber-500" />} 
            color="amber"
          />
          <StatCard 
            title="Download" 
            value={speedData ? speedData.download : '--'} 
            unit="Mbps" 
            icon={<Download className="text-blue-500" />} 
            color="blue"
          />
          <StatCard 
            title="Upload" 
            value={speedData ? speedData.upload : '--'} 
            unit="Mbps" 
            icon={<Upload className="text-emerald-500" />} 
            color="emerald"
          />
        </div>
      </div>

      {/* History Graph */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Speed History</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                stroke="#94a3b8"
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="download" name="Download (Mbps)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="upload" name="Upload (Mbps)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
          <span className="text-sm text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default SpeedTest;
