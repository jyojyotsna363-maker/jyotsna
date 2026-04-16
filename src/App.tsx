import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from './types';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import PatientDashboard from './pages/PatientDashboard.tsx';
import DoctorDashboard from './pages/DoctorDashboard.tsx';
import CallPage from './pages/CallPage.tsx';
import { LogOut, Activity, User as UserIcon, Calendar, Video, Search, LayoutDashboard, FileText, MessageSquare, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const NavItem = ({ to, icon: Icon, label, active = false, danger = false }: any) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        danger ? 'text-red-500 hover:bg-red-50' :
        active ? 'bg-primary text-white shadow-sm' : 
        'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="w-60 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 h-full">
      <div className="flex items-center gap-2 text-primary font-extrabold text-xl mb-12 tracking-tight">
        <Activity className="w-6 h-6" />
        <span>SMART HEALTH</span>
      </div>

      <div className="space-y-8 flex-1">
        <nav className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-4 mb-3 block">Overview</span>
          <NavItem to={user.role === 'patient' ? '/patient' : '/doctor'} icon={LayoutDashboard} label="Dashboard" active />
          <NavItem to="#" icon={Calendar} label="My Appointments" />
          <NavItem to="#" icon={FileText} label="Medical Reports" />
        </nav>

        <nav className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-4 mb-3 block">Consultation</span>
          <NavItem to="#" icon={Video} label="Video Call" />
          <NavItem to="#" icon={MessageSquare} label="Live Chat" />
          <NavItem to="#" icon={Pill} label="Prescriptions" />
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const Header = () => {
  const { user } = useAuth();
  
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="text-slate-400 text-sm hidden md:block">
        Search doctors, diseases, or clinics...
      </div>
      
      {user ? (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">
              {user.role === 'patient' ? 'Patient ID: #SH-4092' : `MD, ${user.specialization}`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary bg-slate-100 flex items-center justify-center font-bold text-primary">
            {user.name[0]}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-primary">Login</Link>
          <Link to="/register" className="btn-geometric-primary">Get Started</Link>
        </div>
      )}
    </header>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center font-medium bg-slate-50">Loading SmartHealth...</div>;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex">
          {user && <Sidebar />}
          
          <div className="flex-1 flex flex-col min-w-0">
            {!window.location.pathname.startsWith('/call/') && <Header />}
            
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'patient' ? '/patient' : '/doctor'} />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'patient' ? '/patient' : '/doctor'} />} />
                
                <Route path="/patient" element={user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />} />
                <Route path="/doctor" element={user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />} />
                <Route path="/call/:appointmentId" element={user ? <CallPage /> : <Navigate to="/login" />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

