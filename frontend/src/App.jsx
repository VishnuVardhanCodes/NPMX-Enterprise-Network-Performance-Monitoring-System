import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Monitoring from './pages/Monitoring';
import NetworkMap from './pages/NetworkMap';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import SystemLogs from './pages/SystemLogs';
import ErrorBoundary from './components/ErrorBoundary';

const PageWrapper = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }} className="h-full">
    {children}
  </motion.div>
);

const PlatformLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  return (
      <div className="flex h-screen overflow-hidden bg-gray-950 text-white selection:bg-purple-500/30 selection:text-white font-sans">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-col flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black z-0">
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 z-10 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </main>
          
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        </div>
      </div>
  );
};

const ProtectedRoute = ({ children }) => {
   const token = localStorage.getItem('npmx_token');
   if(!token) return <Navigate to="/login" replace />;
   return <PlatformLayout>{children}</PlatformLayout>;
};

function App() {
  return (
    <Router>
       <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><PageWrapper><Devices /></PageWrapper></ProtectedRoute>} />
          <Route path="/monitoring" element={<ProtectedRoute><PageWrapper><ErrorBoundary><Monitoring /></ErrorBoundary></PageWrapper></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><PageWrapper><NetworkMap /></PageWrapper></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><PageWrapper><Alerts /></PageWrapper></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><PageWrapper><Reports /></PageWrapper></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><PageWrapper><Settings /></PageWrapper></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><PageWrapper><SystemLogs /></PageWrapper></ProtectedRoute>} />
       </Routes>

       <Toaster 
        position="top-right"
        toastOptions={{
          style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }}
      />
    </Router>
  );
}

export default App;
