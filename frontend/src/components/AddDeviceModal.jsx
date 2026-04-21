import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Server, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { addDeviceApi } from '../services/api';

export default function AddDeviceModal({ isOpen, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await addDeviceApi(data);
      toast.success('Device Added Successfully');
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Failed to add device to database');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-lg glass-panel p-8 pointer-events-auto rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10 border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shadow-inner">
                    <Server size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Add New Device</h3>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Device Name</label>
                  <input 
                    {...register('name', { required: 'Device name is required' })}
                    className={`w-full bg-black/20 border ${errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500/50'} rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 transition-all`}
                    placeholder="e.g. Core Switch 01"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">IP Address</label>
                    <input 
                      {...register('ip', { 
                        required: 'IP is required',
                        pattern: { value: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, message: 'Invalid IP format' }
                      })}
                      className={`w-full bg-black/20 border ${errors.ip ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:border-cyan-500/50 transition-all font-mono text-sm`}
                      placeholder="192.168.1.1"
                    />
                    {errors.ip && <p className="text-red-400 text-xs mt-1 ml-1">{errors.ip.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Port</label>
                    <input 
                      type="number"
                      {...register('port', { required: 'Port required', min: 1, max: 65535 })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:border-cyan-500/50 transition-all font-mono text-sm"
                      defaultValue="161"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">SNMP Community</label>
                  <input 
                    type="password"
                    {...register('snmp', { required: 'Required' })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:border-cyan-500/50 transition-all font-mono text-sm tracking-widest"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={onClose} disabled={submitting} className="flex-1 py-3 px-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 flex justify-center items-center py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-500/25 active:scale-95 transition-all">
                    {submitting ? <Activity className="animate-spin w-5 h-5" /> : 'Provision Device'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
