import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getRecentAlertsApi } from '../services/api';

export default function Navbar({ toggleSidebar }) {
  const [time, setTime] = useState(new Date());
  const [alertCount, setAlertCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const lastAlertIdRef = useRef(null);

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Alert Polling Engine
  useEffect(() => {
    const pollAlerts = async () => {
      try {
        const data = await getRecentAlertsApi();
        setAlerts(data);
        setAlertCount(data.length);
        
        if (data.length > 0) {
           const topAlert = data[0]; 
           if (lastAlertIdRef.current !== null && topAlert.id !== lastAlertIdRef.current) {
               // A new alert ID has entered the database! Trigger global toast.
               if (topAlert.severity === 'CRITICAL') {
                   toast.error(topAlert.alert_message, { duration: 5000, style: { background: '#7f1d1d' } });
               } else if (topAlert.severity === 'WARNING') {
                   toast(topAlert.alert_message, { icon: '⚠️', duration: 4000, style: { border: '1px solid orange', color: 'orange' } });
               }
           }
           lastAlertIdRef.current = topAlert.id;
        }
      } catch (e) {
        // Silently fail network checks
      }
    };
    
    pollAlerts();
    const alertInterval = setInterval(pollAlerts, 5000);
    return () => clearInterval(alertInterval);
  }, []);

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 glass-panel border-b-0 border-white/5 flex items-center justify-between px-6 z-20 sticky top-0 bg-gray-950/80 backdrop-blur-xl"
    >
      <div className="flex-1 flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none xl:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <div className="relative w-full max-w-md group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search metrics, devices, or alerts... (Ctrl+K)" 
            className="w-full bg-gray-900/50 border border-white/5 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center text-sm font-medium text-gray-400 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none group p-1"
          >
            <Bell size={22} className="group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] transition-all" />
            
            <AnimatePresence>
              {alertCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 border border-gray-950 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                >
                  {alertCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 glass-panel border-white/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden bg-gray-950/95"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-white">Recent Incidents</h4>
                  <span className="text-xs text-cyan-400">{alertCount} Active</span>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {alerts.length > 0 ? alerts.map(alt => (
                    <div key={alt.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                       <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${alt.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            {alt.severity}
                          </span>
                          <span className="text-[10px] text-gray-500">{new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <p className="text-xs text-gray-300 leading-relaxed">{alt.alert_message}</p>
                    </div>
                  )) : (
                    <p className="text-center text-sm text-gray-500 py-6 italic">No active threats detected</p>
                  )}
                </div>
                {alerts.length > 0 && (
                   <button className="w-full mt-4 py-2 text-xs font-semibold text-gray-400 hover:text-white border-t border-white/5 transition-colors">
                     Clear All Notifications
                   </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

        <motion.div 
          className="flex items-center gap-3 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="h-10 w-10 py-[2px] px-[2px] rounded-full bg-gradient-to-tr from-purple-500 via-cyan-400 to-blue-500 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-shadow">
            <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold overflow-hidden relative">
              <span className="relative z-10">Admin</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">System Admin</p>
            <p className="text-xs text-cyan-400">Superuser</p>
          </div>
          <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors ml-1" />
        </motion.div>
      </div>
    </motion.header>
  );
}
