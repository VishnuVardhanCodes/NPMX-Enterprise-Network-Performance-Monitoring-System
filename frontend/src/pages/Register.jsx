import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, PlusCircle, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerApi } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRegister = async (e) => {
     e.preventDefault();
     if (!username || !password) return toast.error("Please fill in both fields");
     
     setIsLoading(true);
     try {
       await registerApi({ username, password, role });
       toast.success(`Registration array built for ${username}! Proceed to Login.`);
       navigate('/login');
     } catch (err) {
       toast.error("Registration failed. Username may exist.");
     } finally {
       setIsLoading(false);
     }
  };

  return (
     <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-md relative z-10 glass-panel p-9 rounded-3xl border-white/5 shadow-2xl backdrop-blur-2xl bg-gray-950/80"
        >
           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(168,85,247,0.4)] transform rotate-3">
                 <ShieldCheck size={32} className="text-white -rotate-3" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">NPMX Enrollment</h2>
              <p className="text-gray-400 text-sm font-medium">Create a new local authority profile</p>
           </div>
           
           <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1 relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input 
                   required type="text" placeholder="Desired Username" 
                   value={username} onChange={e => setUsername(e.target.value)} 
                   className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500/50 appearance-none outline-none transition-all"
                 />
              </div>
              <div className="space-y-1 relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input 
                   required type="password" placeholder="Secure Password" 
                   value={password} onChange={e => setPassword(e.target.value)} 
                   className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500/50 appearance-none outline-none transition-all"
                 />
              </div>

              <div className="flex gap-4">
                 <label className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${role === 'user' ? 'bg-purple-500/10 border-purple-500' : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/30'}`}>
                    <input type="radio" name="role" value="user" className="hidden" onChange={(e) => setRole(e.target.value)} checked={role === 'user'} />
                    <LayoutDashboard size={20} className={role === 'user' ? 'text-purple-400' : 'text-gray-500'} />
                    <span className={`text-xs font-bold ${role === 'user' ? 'text-purple-300' : 'text-gray-500'}`}>Basic View</span>
                 </label>
                 
                 <label className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${role === 'admin' ? 'bg-pink-500/10 border-pink-500' : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/30'}`}>
                    <input type="radio" name="role" value="admin" className="hidden" onChange={(e) => setRole(e.target.value)} checked={role === 'admin'} />
                    <ShieldCheck size={20} className={role === 'admin' ? 'text-pink-400' : 'text-gray-500'} />
                    <span className={`text-xs font-bold ${role === 'admin' ? 'text-pink-300' : 'text-gray-500'}`}>Full Admin</span>
                 </label>
              </div>

              <motion.button 
                 disabled={isLoading}
                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                 className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 mt-4"
              >
                 <PlusCircle size={20} /> {isLoading ? 'Building Identity...' : 'Join Workspace'}
              </motion.button>
           </form>
           
           <div className="mt-8 text-center text-sm text-gray-600 font-medium">
              Already have credentials? <Link to="/login" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">Return to Login</Link>
           </div>
        </motion.div>
     </div>
  );
}
