import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../App.tsx';
import { User, Appointment } from '../types';
import { Search, Calendar, Video, Clock, Filter, BrainCircuit, Activity, Heart, Brain, Sparkles, Thermometer, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { token, user } = useAuth();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

  const diseases = [
    { name: 'Cardiology', tag: 'heart', icon: <Heart className="w-6 h-6" />, desc: 'Heart & Vascular' },
    { name: 'Neurology', tag: 'neurology', icon: <Brain className="w-6 h-6" />, desc: 'Brain & Nerves' },
    { name: 'Dermatology', tag: 'skin', icon: <Sparkles className="w-6 h-6" />, desc: 'Skin Care' },
    { name: 'General Health', tag: 'cold', icon: <Thermometer className="w-6 h-6" />, desc: 'Cold, Flu & Wellness' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, apptsRes] = await Promise.all([
        axios.get('/api/doctors'),
        axios.get('/api/appointments', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDoctors(docsRes.data);
      setAppts(apptsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const bookAppt = async (doctorId: string) => {
    try {
      await axios.post('/api/appointments', {
        doctorId,
        date: new Date(Date.now() + 86400000).toISOString()
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Appointment requested!');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                         doc.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchesDisease = !selectedDisease || doc.diseaseTags?.includes(selectedDisease);
    return matchesSearch && matchesDisease;
  });

  return (
    <div className="max-w-[1200px] mx-auto p-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
        <p className="text-slate-600">Select a category to find specialized care for your symptoms.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {diseases.map(d => (
          <div
            key={d.tag}
            onClick={() => setSelectedDisease(selectedDisease === d.tag ? null : d.tag)}
            className={`card-geometric text-center flex flex-col items-center gap-4 ${
              selectedDisease === d.tag ? 'border-primary ring-1 ring-primary' : ''
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
              selectedDisease === d.tag ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {d.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{d.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{d.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedDisease ? `Specialists for ${diseases.find(d => d.tag === selectedDisease)?.name}` : 'Recommended Doctors'}
            </h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search doctors..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-primary transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredDoctors.map(doc => (
              <motion.div 
                layout
                key={doc.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <UserRound className="w-8 h-8" />
                  </div>
                  {doc.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-white rounded-full"></div>}
                </div>

                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-sm text-slate-600">MD, {doc.specialization} • 12 Years Exp.</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-primary-dark uppercase">98% Success</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${doc.online ? 'bg-green-50 text-success' : 'bg-slate-50 text-slate-400'}`}>
                      {doc.online ? 'Online Now' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="btn-geometric-secondary">View Profile</button>
                  <button 
                    onClick={() => bookAppt(doc.id)}
                    className="btn-geometric-primary"
                  >
                    Book Call
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Mini Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Calls
            </h2>
            
            <div className="space-y-4">
              {appts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No scheduled calls</p>
              ) : (
                appts.slice(0, 3).map(appt => (
                  <div key={appt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-primary uppercase">
                        {new Date(appt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Confirmed</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">Dr. {appt.otherUser?.name}</p>
                    <Link 
                      to={`/call/${appt.id}`}
                      className="btn-geometric-primary w-full inline-block text-center py-2"
                    >
                      Join Session
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

