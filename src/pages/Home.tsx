import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Video, Clock, Star, Users, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              Telemedicine <span className="text-primary">Evolved</span>.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Connect with world-class specialists in minutes. Secure, real-time video consultations and AI-powered symptom analysis at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-geometric-primary px-10 py-4 text-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn-geometric-secondary px-10 py-4 text-lg border border-slate-200 bg-white">
                Partner Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Video className="w-8 h-8"/>, title: "HD Video Calls", desc: "Crystal clear video and audio quality for accurate diagnosis and consultation." },
              { icon: <ShieldCheck className="w-8 h-8"/>, title: "Secure & Private", desc: "HIPAA compliant encryption ensuring your medical data stays private." },
              { icon: <Clock className="w-8 h-8"/>, title: "24/7 Availability", desc: "Access care whenever you need it, with doctors available around the clock." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all text-center md:text-left"
              >
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-primary text-white overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="text-center md:text-left">
             <h2 className="text-4xl font-bold mb-4">Trusted by 10,000+ patients</h2>
             <p className="text-blue-100 text-lg">Providing healthcare across 50+ countries worldwide.</p>
           </div>
           <div className="flex gap-12 text-center">
             <div className="flex flex-col">
               <span className="text-5xl font-bold">500+</span>
               <span className="text-blue-200 uppercase tracking-widest text-xs mt-2 font-semibold">Specialists</span>
             </div>
             <div className="flex flex-col">
               <span className="text-5xl font-bold">4.9/5</span>
               <span className="text-blue-200 uppercase tracking-widest text-xs mt-2 font-semibold">Rating</span>
             </div>
           </div>
         </div>
      </section>
    </div>
  );
}
