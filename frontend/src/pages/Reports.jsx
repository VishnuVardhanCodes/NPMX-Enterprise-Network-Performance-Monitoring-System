import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Play, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateReportApi, getReportsApi, downloadReportUrl } from '../services/api';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const data = await getReportsApi();
      setReports(data);
    } catch (err) {
      toast.error('Failed to load historic reports');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const compileToast = toast.loading('Compiling Network Data & Generating PDF...');
    try {
      await generateReportApi();
      toast.success('Successfully Generated PDF Document', { id: compileToast });
      fetchReports();
    } catch (e) {
      toast.error('Failed to generate report', { id: compileToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col items-center justify-center text-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center gap-3">
            <FileText size={32} className="text-blue-500" /> Automated Reporting
          </h2>
          <p className="text-gray-400 mt-1">Generate deep topological and ICMP performance metrics as PDF audits</p>
        </div>
        
        <div className="flex gap-3">
           <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fetchReports}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl border border-white/10 transition-colors shadow-inner"
          >
            <RefreshCw size={18} /> Refresh
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => window.open('http://localhost:5000/api/reports/export/csv', '_blank')}
            className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2.5 rounded-xl border border-emerald-500/20 transition-colors shadow-inner font-semibold"
          >
            <Download size={18} /> Export CSV
          </motion.button>

          <motion.button 
            disabled={isGenerating}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed font-semibold tracking-wide"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />} 
            Compile Daily Report
          </motion.button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass-panel overflow-hidden bg-gray-900/60 rounded-2xl shadow-2xl border-white/5"
      >
        <div className="w-full overflow-x-auto custom-scrollbar pb-4">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-widest bg-white/[0.02]">
                <th className="p-5 font-semibold rounded-tl-xl pl-6">Report Date</th>
                <th className="p-5 font-semibold">Total / Active Devices</th>
                <th className="p-5 font-semibold">Critical Alerts</th>
                <th className="p-5 font-semibold">Avg Latency</th>
                <th className="p-5 font-semibold">Max Bandwidth</th>
                <th className="p-5 font-semibold">Loss Errors</th>
                <th className="p-5 font-semibold flex justify-end pr-6">Binary Export</th>
              </tr>
            </thead>
            <tbody>
              {reports && reports.length > 0 ? reports.map((report, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={report.id} 
                  className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors group"
                >
                  <td className="p-5 pl-6 font-semibold text-white flex items-center gap-3">
                     <CheckCircle size={16} className="text-cyan-400" />
                     {report.report_date}
                  </td>
                  <td className="p-5">
                    <span className="bg-gray-800 text-gray-300 font-mono px-2 py-1 rounded-md text-sm border border-white/10">
                      {report.total_devices} / <span className="text-green-400">{report.active_devices}</span>
                    </span>
                  </td>
                  <td className="p-5">
                     <span className={`font-mono px-3 py-1 text-sm rounded-full ${report.critical_alerts > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-gray-800 text-gray-500'}`}>
                        {report.critical_alerts} Triggered
                     </span>
                  </td>
                  <td className="p-5 text-sm text-cyan-200">{report.avg_latency || 0} ms</td>
                  <td className="p-5 text-sm font-semibold text-purple-300">{report.max_bandwidth || 0} Mbps</td>
                  <td className="p-5 text-sm text-pink-300">{report.packet_loss_events} Events</td>
                  <td className="p-5 pr-6">
                    <div className="flex justify-end gap-2">
                       <a 
                          href={downloadReportUrl(new Date(report.report_date).toISOString().split('T')[0])}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 px-4 shadow-[0_0_10px_rgba(255,255,255,0.05)] text-gray-300 bg-white/5 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/50 rounded-xl border border-white/10 transition-all focus:outline-none uppercase text-xs tracking-wider font-bold"
                       >
                         <Download size={14} /> PDF File
                       </a>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                 <tr>
                   <td colSpan={7} className="text-center p-12 text-gray-500 flex flex-col items-center justify-center gap-3">
                     <FileText size={32} className="opacity-30" />
                     No formal audits generated. Press "Compile Daily Report" to begin.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
