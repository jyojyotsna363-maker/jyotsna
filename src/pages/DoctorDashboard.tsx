import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App.tsx';
import { Appointment } from '../types';
import { Calendar, Video, Clock, Users, ArrowRight, UserRound, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function DoctorDashboard() {
  const { token, user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);

  useEffect(() => {
    fetchAppts();
  }, []);

  const fetchAppts = async () => {
    try {
      const res = await axios.get('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Console — Dr. {user?.name.split(' ').pop()}</h1>
        <p className="text-slate-600">You have {appts.length} appointments scheduled for today.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Appointments List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Consultations</h2>
          </div>

          <div className="space-y-4">
            {appts.map((appt, i) => (
              <motion.div 
                key={appt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <UserRound className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{appt.otherUser?.name}</h3>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">General Consultation • Patient ID: #SH-{appt.patientId.slice(-4)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900">10:30 AM</span>
                    <span className="text-[10px] font-bold text-primary uppercase">Scheduled</span>
                  </div>
                  <Link 
                    to={`/call/${appt.id}`}
                    className="btn-geometric-primary"
                  >
                    Start Session
                  </Link>
                </div>
              </motion.div>
            ))}

            {appts.length === 0 && (
              <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No appointments yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl shadow-slate-900/10">
            <h3 className="text-lg font-bold mb-6 tracking-tight">Daily Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-xl">
                <span className="block text-2xl font-extrabold">{appts.length}</span>
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total</span>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <span className="block text-2xl font-extrabold">0</span>
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Done</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10">
              View All History
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center justify-between">
              Recent Activity
              <ClipboardList className="w-4 h-4 text-primary" />
            </h3>
            <div className="space-y-5">
              {[
                { name: 'Alex Thompson', action: 'Requested prescription', time: '12m ago' },
                { name: 'Sarah Wilson', action: 'Canceled appointment', time: '1h ago' }
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                    {act.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{act.name}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{act.action}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

