import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, User, LogIn, Eye, EyeOff, Wifi, Activity, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginApi } from '../services/api';

/* ─── Animated Canvas Network Background ─────────────────────────────────── */
function NetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* Create nodes */
    const NODE_COUNT = 55;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.5 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const MAX_DIST = 160;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Update positions */
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.025;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      /* Draw connections */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      /* Draw nodes */
      nodes.forEach((n) => {
        const glow = Math.sin(n.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.5 + glow * 0.5})`;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.9)';
        ctx.shadowBlur = 6 + glow * 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.55 }}
    />
  );
}

/* ─── Floating Status Badge ────────────────────────────────────────────────── */
function StatusBadge({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm"
    >
      <Icon size={12} className="text-cyan-400" />
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
      <span className="text-[10px] text-cyan-400 font-bold">{value}</span>
    </motion.div>
  );
}

/* ─── Main Login Component ─────────────────────────────────────────────────── */
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [tick, setTick] = useState(0);

  /* Live clock ticker for the "uptime" badge */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const uptime = `${String(Math.floor(tick / 3600)).padStart(2, '0')}:${String(
    Math.floor((tick % 3600) / 60)
  ).padStart(2, '0')}:${String(tick % 60).padStart(2, '0')}`;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Please fill in both fields');

    setIsLoading(true);
    try {
      const res = await loginApi({ username, password });
      localStorage.setItem('npmx_token', res.access_token);
      localStorage.setItem('npmx_role', res.role);
      localStorage.setItem('npmx_user', username);
      toast.success(`Welcome back, ${username}! System unlocked.`);
      window.location.href = '/';
    } catch (err) {
      toast.error('Invalid credentials or server unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  /* Field border colour helper */
  const fieldBorder = (name) =>
    focusedField === name
      ? '1px solid rgba(34,211,238,0.7)'
      : '1px solid rgba(255,255,255,0.08)';

  return (
    <>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .npmx-login-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        /* Input autofill override */
        .npmx-input:-webkit-autofill,
        .npmx-input:-webkit-autofill:hover,
        .npmx-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0 1000px #0a0a1a inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* Shimmer on card border */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .card-glow-border {
          position: relative;
        }
        .card-glow-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 28px;
          background: linear-gradient(
            135deg,
            rgba(34,211,238,0.6) 0%,
            rgba(99,102,241,0.4) 35%,
            rgba(34,211,238,0.05) 60%,
            rgba(34,211,238,0.6) 100%
          );
          background-size: 300% 300%;
          animation: shimmer 5s linear infinite;
          z-index: -1;
        }

        /* Pulse ring on shield icon */
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .pulse-ring::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 2px solid rgba(34,211,238,0.7);
          animation: pulse-ring 2.2s ease-out infinite;
        }

        /* Loading spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Scanline effect */
        @keyframes scanline {
          0%   { top: -10%; }
          100% { top: 110%; }
        }
        .scanline {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.18), transparent);
          pointer-events: none;
          animation: scanline 4s linear infinite;
        }
      `}</style>

      <div
        className="npmx-login-root"
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at 20% 50%, #0d1a2e 0%, #05050f 55%, #0a0210 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated network canvas */}
        <NetworkCanvas />

        {/* Ambient glows */}
        <div
          style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
          }}
        >
          <div style={{
            position: 'absolute', top: '10%', left: '5%',
            width: 480, height: 480,
            background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '5%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 60%)',
            borderRadius: '50%',
          }} />
        </div>

        {/* Status badges — top-right corner */}
        <div
          style={{
            position: 'fixed', top: 20, right: 20,
            display: 'flex', gap: 8, zIndex: 10,
          }}
        >
          <StatusBadge icon={Wifi} label="Network" value="ONLINE" delay={0.8} />
          <StatusBadge icon={Activity} label="Uptime" value={uptime} delay={1.0} />
          <StatusBadge icon={Cpu} label="Nodes" value="247" delay={1.2} />
        </div>

        {/* ── Login Card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 120, delay: 0.1 }}
          className="card-glow-border"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: 440,
            background: 'rgba(8, 10, 24, 0.85)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: 26,
            padding: '44px 40px 36px',
            boxShadow:
              '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Scanline animation overlay */}
          <div className="scanline" style={{ zIndex: 0 }} />

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
            {/* Shield icon with pulse ring */}
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="pulse-ring"
              style={{
                position: 'relative',
                width: 72, height: 72,
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 32px rgba(34,211,238,0.45), 0 0 64px rgba(34,211,238,0.15)',
              }}
            >
              <ShieldCheck size={34} color="#fff" />
            </motion.div>

            {/* App name */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 26, fontWeight: 900,
                color: '#ffffff', margin: '0 0 8px',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}
            >
              NPMX{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #22d3ee, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Enterprise
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              style={{ color: '#64748b', fontSize: 13, fontWeight: 500, margin: 0 }}
            >
              Authenticate to access the secure telemetry network
            </motion.p>

            {/* Divider */}
            <div
              style={{
                marginTop: 22,
                height: 1,
                background:
                  'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), rgba(139,92,246,0.3), transparent)',
              }}
            />
          </div>

          {/* ── Form ────────────────────────────────────────────────────── */}
          <form onSubmit={handleLogin} style={{ position: 'relative', zIndex: 1 }}>
            {/* Username field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={{ marginBottom: 16, position: 'relative' }}
            >
              <label
                style={{
                  display: 'block', color: '#94a3b8', fontSize: 11,
                  fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 8,
                }}
              >
                Enterprise ID
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute', left: 16, top: '50%',
                    transform: 'translateY(-50%)',
                    color: focusedField === 'user' ? '#22d3ee' : '#475569',
                    transition: 'color 0.2s',
                  }}
                />
                <input
                  className="npmx-input"
                  required
                  type="text"
                  placeholder="Enter your ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('user')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: fieldBorder('user'),
                    borderRadius: 14,
                    padding: '13px 16px 13px 44px',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border 0.25s, box-shadow 0.25s',
                    boxShadow:
                      focusedField === 'user'
                        ? '0 0 0 3px rgba(34,211,238,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              style={{ marginBottom: 28, position: 'relative' }}
            >
              <label
                style={{
                  display: 'block', color: '#94a3b8', fontSize: 11,
                  fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 8,
                }}
              >
                Passkey
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute', left: 16, top: '50%',
                    transform: 'translateY(-50%)',
                    color: focusedField === 'pass' ? '#22d3ee' : '#475569',
                    transition: 'color 0.2s',
                  }}
                />
                <input
                  className="npmx-input"
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter passkey"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: fieldBorder('pass'),
                    borderRadius: 14,
                    padding: '13px 48px 13px 44px',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border 0.25s, box-shadow 0.25s',
                    boxShadow:
                      focusedField === 'pass'
                        ? '0 0 0 3px rgba(34,211,238,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: 4, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#22d3ee')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                  aria-label="Toggle password visibility"
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.span key="eye-off" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.18 }}>
                        <EyeOff size={16} />
                      </motion.span>
                    ) : (
                      <motion.span key="eye" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.18 }}>
                        <Eye size={16} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.025, boxShadow: '0 0 32px rgba(34,211,238,0.45)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 55%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 0',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 0 20px rgba(34,211,238,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                  opacity: isLoading ? 0.75 : 1,
                  transition: 'opacity 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Animated shimmer stripe on button */}
                <span
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2.5s linear infinite',
                    pointerEvents: 'none',
                  }}
                />
                {isLoading ? (
                  <><div className="spinner" /> Verifying Identity…</>
                ) : (
                  <><LogIn size={18} /> Establish Secure Session</>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            style={{
              marginTop: 28, textAlign: 'center',
              fontSize: 13, color: '#475569', fontWeight: 500,
              position: 'relative', zIndex: 1,
            }}
          >
            New Network Engineer?{' '}
            <Link
              to="/register"
              style={{
                color: '#22d3ee', fontWeight: 600,
                textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#67e8f9')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#22d3ee')}
            >
              Enroll Account →
            </Link>
          </motion.div>

          {/* Security notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            style={{
              marginTop: 20,
              padding: '10px 14px',
              background: 'rgba(34,211,238,0.04)',
              border: '1px solid rgba(34,211,238,0.1)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22d3ee',
                boxShadow: '0 0 6px #22d3ee',
                flexShrink: 0,
                animation: 'pulse-ring 2s ease-out infinite',
              }}
            />
            <span style={{ color: '#475569', fontSize: 11, fontWeight: 500 }}>
              256-bit AES encrypted · Zero-trust session · SOC 2 compliant
            </span>
          </motion.div>
        </motion.div>

        {/* Bottom brand tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: 'fixed', bottom: 20, left: '50%',
            transform: 'translateX(-50%)',
            color: '#1e293b', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            zIndex: 10,
          }}
        >
          NPMX Enterprise · Network Performance Monitor v2.0
        </motion.div>
      </div>
    </>
  );
}
