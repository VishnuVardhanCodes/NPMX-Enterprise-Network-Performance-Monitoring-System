import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Server, Activity, Network, Bell, FileText, Settings, Menu, ChevronLeft, ShieldAlert, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, toggleSidebar }) {
  // Perform instant physical role lookups locally matching Flask payloads
  const userRole = localStorage.getItem('npmx_role');
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Network Map', icon: Network, path: '/map' },
    { name: 'Live Monitoring', icon: Activity, path: '/monitoring' },
    { name: 'Alerts', icon: ShieldAlert, path: '/alerts' },
  ];
  
  if (userRole === 'admin') {
     navItems.push(
        { name: 'Devices Matrix', icon: Server, path: '/devices' },
        { name: 'Reports', icon: FileText, path: '/reports' },
        { name: 'System Logs', icon: Terminal, path: '/logs' },
        { name: 'Settings', icon: Settings, path: '/settings' }
     );
  } else {
     // Optional basic visibility for non-admins if desired, or completely stripped out
     navItems.push(
        { name: 'Reports', icon: FileText, path: '/reports' }
     );
  }

  const handleLogout = () => {
     localStorage.clear();
     window.location.href = '/login';
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      className="glass-panel border-r-0 border-white/5 flex flex-col h-full bg-gray-950/80 z-30 relative overflow-hidden shrink-0"
    >
      <div className="flex items-center justify-between p-6 h-20 border-b border-white/5">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-animate flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-gray-950 rounded-[7px] flex items-center justify-center">
                  <Activity size={18} className="text-purple-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500">
                NPMX
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors absolute right-4"
        >
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-8 rounded-r bg-gradient-to-b from-purple-500 to-cyan-400"
                  />
                )}
                <div className={`flex-shrink-0 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_currentColor]' : 'group-hover:text-purple-400 transition-colors'}`}>
                  <item.icon size={20} />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.span 
                      initial={{ opacity: 0, w: 0 }}
                      animate={{ opacity: 1, w: 'auto' }}
                      exit={{ opacity: 0, w: 0, transition: { duration: 0.2 } }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {!isOpen && (
                  <div className="absolute left-14 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap shadow-xl border border-white/10">
                    {item.name}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/5 space-y-4">
        <div className={`flex items-center gap-3 ${isOpen ? 'justify-start px-2' : 'justify-center'} py-2`}>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
          </span>
          {isOpen && <span className="text-sm font-medium text-gray-300">System Normal</span>}
        </div>
        
        <button 
           onClick={handleLogout}
           className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${!isOpen && 'px-0'}`}
        >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
           {isOpen && <span className="text-sm font-bold">Close Session</span>}
        </button>
      </div>
    </motion.aside>
  );
}
