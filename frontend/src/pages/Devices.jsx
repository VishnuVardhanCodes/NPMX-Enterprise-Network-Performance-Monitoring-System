import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Download, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import DeviceTable from '../components/DeviceTable';
import AddDeviceModal from '../components/AddDeviceModal';
import { getDevicesApi, deleteDeviceApi } from '../services/api';

export default function Devices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await getDevicesApi();
      setDevices(data);
    } catch (err) {
      toast.error('Failed to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDeviceApi(id);
      toast.success('Device Deleted Successfully');
      fetchDevices();
    } catch (err) {
      toast.error('Failed to delete device');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Device Inventory</h2>
          <p className="text-gray-400 mt-1">Manage and provision monitored nodes</p>
        </div>
        <div className="flex gap-3">
           <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl border border-white/10 transition-colors shadow-inner"
          >
            <Download size={18} /> <span className="hidden sm:inline">Export</span>
          </motion.button>
          <motion.button 
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)]"
          >
            <Plus size={18} /> Add Node
          </motion.button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass-panel overflow-hidden bg-gray-900/60 rounded-2xl shadow-xl border-white/5"
      >
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Activity className="animate-spin text-cyan-400 w-8 h-8 mr-3" />
            <span className="text-gray-400">Loading Devices...</span>
          </div>
        ) : (
          <DeviceTable devices={devices} onDelete={handleDelete} />
        )}
        
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-400 bg-black/20">
          <div>Showing {devices.length} devices from Database</div>
        </div>
      </motion.div>

      <AddDeviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchDevices} 
      />
    </div>
  );
}
