import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, Activity } from 'lucide-react';
import EmptyState from './EmptyState';

export default function AlertPanel({ alerts }) {
  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-500', icon: <AlertCircle className="text-white" size={16} /> };
      case 'warning':
        return { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-500', icon: <AlertTriangle className="text-white" size={16} /> };
      case 'info':
      default:
        return { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-500', icon: <Info className="text-white" size={16} /> };
    }
  };

  return (
    <div className="relative pl-6 py-2 overflow-y-auto custom-scrollbar">
      <div className="absolute left-10 top-0 bottom-0 w-px bg-white/10 hidden sm:block"></div>
      
      {alerts && alerts.length > 0 ? alerts.map((alert, idx) => {
        const styles = getSeverityStyles(alert.severity);
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: idx * 0.05 }}
            key={alert.id || idx}
            className="relative flex flex-col sm:flex-row items-start gap-6 mb-6 group"
          >
            {/* Timeline Node */}
            <div className={`relative z-10 w-8 h-8 rounded-full ${styles.bg} shadow-lg shadow-${styles.border.split('-')[1]}-500/50 flex items-center justify-center shrink-0 border-4 border-gray-950 hidden sm:flex left-[10px]`}>
              {styles.icon}
            </div>

            {/* Alert Card */}
            <div className={`flex-1 w-full glass-panel p-5 rounded-2xl border-l-4 ${styles.border.replace('border-', 'border-l-')} hover:bg-white/[0.04] transition-all duration-300 shadow-md`}>
              <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                  {alert.device_name || `System Node ${alert.device_id}`}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${styles.bg.replace('bg-', 'bg-').concat('/20')} ${styles.text}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-gray-500 font-mono bg-black/20 px-2 py-0.5 rounded">
                    {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 font-mono mb-4 leading-relaxed">
                {alert.alert_message}
              </p>
              
              <div className="flex flex-wrap gap-3 text-xs font-semibold bg-black/30 p-3 rounded-xl border border-white/5">
                 <span className="text-gray-500 uppercase flex items-center gap-1.5"><Activity size={12} className="text-cyan-400"/> TYPE: <span className="text-cyan-400">{alert.metric_type}</span></span>
                 <span className="text-gray-500 uppercase flex items-center gap-1.5"><AlertCircle size={12} className="text-pink-400"/> VALUE: <span className="text-pink-400">{alert.metric_value}</span></span>
              </div>
            </div>
          </motion.div>
        );
      }) : (
        <EmptyState type="alerts" title="No Active Incidents" message="The system is operating securely without critical errors or anomalies." />
      )}
    </div>
  );
}
