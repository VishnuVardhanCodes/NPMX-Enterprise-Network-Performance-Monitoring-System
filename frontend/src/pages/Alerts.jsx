import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import AlertPanel from '../components/AlertPanel';
import { getAlertsApi } from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlertsApi();
        setAlerts(data);
      } catch (err) {
         console.error(err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 flex items-center gap-3">
            <ShieldAlert size={32} className="text-red-500" /> Incident Management
          </h2>
          <p className="text-gray-400 mt-1">Review, acknowledge, and resolve simulated system alerts automatically</p>
        </div>
        <div className="flex gap-3">
           <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Filter alerts..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white transition-all shadow-inner"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition-colors shadow-inner">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.02)]">
        <div className="[&>div]:max-h-[800px]"> 
          <AlertPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
