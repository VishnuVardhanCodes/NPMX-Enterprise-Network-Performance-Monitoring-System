import React, { useState, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Download, Upload, Clock, RefreshCw, History, 
  Wifi, ShieldAlert, CheckCircle2, AlertTriangle, Gauge 
} from 'lucide-react';
import ReactSpeedometer from 'react-d3-speedometer';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { runSpeedTestApi, getSpeedHistoryApi } from '../services/api';
import toast from 'react-hot-toast';

// Phase 13 — Error Protection
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-3xl border border-red-500/30">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Speed Module Recovering...</h2>
          <p className="text-gray-400">An unexpected error occurred. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      const data = response.data || response;
      if (Array.isArray(data)) {
        // Reverse to show chronological order on chart
        setHistory([...data].reverse());
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleStartTest = async () => {
    setLoading(true);
    setSpeedData(null);
    toast.loading("Running Enterprise Speed Test...", { id: 'speed-test' });

    try {
      const response = await runSpeedTestApi();
      const data = response.data || response;
      
      if (data.error) {
        setSpeedData({ ping: 0, download: 0, upload: 0 });
        toast.error(`Network Issue: ${data.error}`, { id: 'speed-test' });
      } else if (data.download !== undefined) {
        setSpeedData(data);
        if (data.download > maxDownload) {
          setMaxDownload(Math.ceil(data.download / 50) * 50);
        }
        toast.success("Speed Test Completed Successfully", { id: 'speed-test' });
        fetchHistory();
      } else {
        toast.error("Invalid data format received from server.", { id: 'speed-test' });
      }
    } catch (error) {
      const serverError = error.response?.data?.error;
      toast.error(serverError ? `Network Issue: ${serverError}` : "Network Error: Could not connect to backend.", { id: 'speed-test' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Wifi className="text-blue-500 w-8 h-8" />
              Internet Speed Monitoring
            </h1>
            <p className="text-gray-400 mt-1">Real-time performance metrics and historical analysis</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartTest}
            disabled={loading}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl ${
              loading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin w-6 h-6" /> : <Activity className="w-6 h-6" />}
            {loading ? "Measuring..." : "Start Test"}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Speedometer Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 shadow-inner flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
            
            <h2 className="text-xl font-medium text-gray-300 mb-10 flex items-center gap-2">
              <Gauge className="text-blue-400 w-5 h-5" />
              Live Download Velocity
            </h2>

            <div className="relative group">
              <ReactSpeedometer
                maxValue={maxDownload}
                value={speedData ? speedData.download : 0}
                needleColor="#3b82f6"
                startColor="#1e3a8a"
                segments={10}
                endColor="#ef4444"
                needleTransitionDuration={4000}
                needleTransition="easeElastic"
                textColor="#94a3b8"
                currentValueText={`${speedData ? speedData.download : 0} Mbps`}
                ringWidth={47}
                width={300}
                height={200}
                paddingHorizontal={34}
                paddingVertical={34}
              />
              <AnimatePresence>
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm rounded-full"
                  >
                    <div className="text-blue-400 font-bold text-xl animate-pulse">MEASURING...</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-sm">
                <CheckCircle2 size={16} /> Stable Connection
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-sm">
                <Clock size={16} /> Low Latency
              </div>
            </div>
          </motion.div>

          {/* Stats Breakdown Column */}
          <div className="flex flex-col gap-6">
            <StatCard 
              title="Ping Latency" 
              value={speedData ? speedData.ping : '--'} 
              unit="ms" 
              icon={<Clock className="text-amber-500" />} 
              color="amber"
              delay={0.1}
            />
            <StatCard 
              title="Download Speed" 
              value={speedData ? speedData.download : '--'} 
              unit="Mbps" 
              icon={<Download className="text-blue-500" />} 
              color="blue"
              delay={0.2}
            />
            <StatCard 
              title="Upload Speed" 
              value={speedData ? speedData.upload : '--'} 
              unit="Mbps" 
              icon={<Upload className="text-emerald-500" />} 
              color="emerald"
              delay={0.3}
            />
          </div>
        </div>

        {/* Phase 8 & Phase 12 — History Graph Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-800 rounded-2xl">
                <History className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Speed Performance History</h2>
                <p className="text-sm text-gray-400">Chronological trend of network capacity</p>
              </div>
            </div>
          </div>

          {/* Phase 8 Requirements — Prevent width(-1) height(-1) */}
          <div className="w-full h-[300px] min-h-[300px] bg-gray-950/30 rounded-3xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="#4b5563"
                  fontSize={12}
                />
                <YAxis stroke="#4b5563" fontSize={12} unit="M" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="download" 
                  name="Download (Mbps)" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="upload" 
                  name="Upload (Mbps)" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

const StatCard = ({ title, value, unit, icon, color, delay }) => {
  const colorMap = {
    blue: "from-blue-500/20 to-indigo-500/20 border-blue-500/20 text-blue-400 shadow-blue-500/5",
    emerald: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5",
    amber: "from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-400 shadow-amber-500/5"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${colorMap[color]} p-8 rounded-3xl border shadow-xl flex items-center justify-between group overflow-hidden relative`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
        {React.cloneElement(icon, { size: 100 })}
      </div>
      
      <div className="relative z-10">
        <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black tracking-tighter">{value}</span>
          <span className="text-sm font-medium opacity-60">{unit}</span>
        </div>
      </div>
      <div className="p-4 bg-gray-900/50 rounded-2xl relative z-10">
        {React.cloneElement(icon, { size: 28 })}
      </div>
    </motion.div>
  );
};

export default SpeedTest;
