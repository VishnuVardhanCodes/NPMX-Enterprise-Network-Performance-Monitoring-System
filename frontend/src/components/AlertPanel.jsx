import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

export default function AlertPanel({ alerts }) {
  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return { border: 'border-l-red-500', bg: 'bg-red-500/10', icon: <AlertCircle className="text-red-500" size={18} /> };
      case 'warning':
        return { border: 'border-l-orange-500', bg: 'bg-orange-500/10', icon: <AlertTriangle className="text-orange-500" size={18} /> };
      case 'info':
      default:
        return { border: 'border-l-blue-500', bg: 'bg-blue-500/10', icon: <Info className="text-blue-500" size={18} /> };
    }
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar">
      {alerts && alerts.length > 0 ? alerts.map((alert, idx) => {
        const styles = getSeverityStyles(alert.severity);
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: idx * 0.05 }}
            key={alert.id || idx}
            className={`flex items-start gap-4 p-4 rounded-r-xl border-l-4 ${styles.border} bg-white/[0.02] hover:${styles.bg} transition-colors cursor-pointer group shadow-sm`}
          >
            <div className={`mt-1 p-1 rounded-full ${styles.bg}`}>
              {styles.icon}
            </div>
            <div className="flex-1 w-full overflow-hidden">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors truncate pr-2">
                  {alert.device_name || `System Node ${alert.device_id}`}
                </h4>
                <span className="text-xs text-gray-500 whitespace-nowrap bg-black/20 px-2 py-0.5 rounded">
                  {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                </span>
              </div>
              <p className="text-sm text-gray-400 font-mono mb-2 truncate">
                {alert.alert_message}
              </p>
              <div className="flex gap-4 text-xs font-semibold bg-black/20 p-2 rounded-lg border border-white/5">
                 <span className="text-gray-500 uppercase flex gap-1">TYPE: <span className="text-cyan-400">{alert.metric_type}</span></span>
                 <span className="text-gray-500 uppercase flex gap-1">VALUE: <span className="text-pink-400">{alert.metric_value}</span></span>
                 <span className="text-gray-500 uppercase flex gap-1">SEV: <span className={styles.border.replace('border-l-', 'text-')}>{alert.severity}</span></span>
              </div>
            </div>
          </motion.div>
        );
      }) : (
        <div className="text-center p-8 text-gray-500 flex flex-col items-center border border-dashed border-white/5 rounded-xl">
           <Info className="mb-2 opacity-50" />
           No active alerts. System behaves normally.
        </div>
      )}
    </div>
  );
}
