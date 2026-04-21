import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginApi } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e) => {
     e.preventDefault();
     if (!username || !password) return toast.error("Please fill in both fields");
     
     setIsLoading(true);
     try {
       const res = await loginApi({ username, password });
       localStorage.setItem('npmx_token', res.access_token);
       localStorage.setItem('npmx_role', res.role);
       localStorage.setItem('npmx_user', username);
       toast.success(`Welcome back, ${username}! System unlocked.`);
       window.location.href = '/'; 
     } catch (err) {
       toast.error("Invalid credentials or server unavailable");
     } finally {
       setIsLoading(false);
     }
  };

  return (
     <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
           <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-md relative z-10 glass-panel p-9 rounded-3xl border-white/5 shadow-2xl backdrop-blur-2xl bg-gray-950/80"
        >
           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(34,211,238,0.4)] transform rotate-3">
                 <ShieldCheck size={32} className="text-white -rotate-3" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">NPMX Authenticator</h2>
              <p className="text-gray-400 text-sm font-medium">Identify to establish a secure telemetry link</p>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1 relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input 
                   required type="text" placeholder="Enterprise ID" 
                   value={username} onChange={e => setUsername(e.target.value)} 
                   className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-cyan-500/50 appearance-none outline-none transition-all"
                 />
              </div>
              <div className="space-y-1 relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input 
                   required type="password" placeholder="Passkey" 
                   value={password} onChange={e => setPassword(e.target.value)} 
                   className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-cyan-500/50 appearance-none outline-none transition-all"
                 />
              </div>
              <motion.button 
                 disabled={isLoading}
                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                 className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                 <LogIn size={20} /> {isLoading ? 'Verifying Link...' : 'Establish Session'}
              </motion.button>
           </form>
           
           <div className="mt-8 text-center text-sm text-gray-600 font-medium">
              New Network Engineer? <Link to="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">Enroll Account</Link>
           </div>
        </motion.div>
     </div>
  );
}
