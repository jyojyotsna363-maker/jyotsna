import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App.tsx';
import { io, Socket } from 'socket.io-client';
import { Peer } from 'peerjs';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Send, 
  MessageSquare, User, Info, MoreHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types';

export default function CallPage() {
  const { appointmentId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appointmentId || !user) return;

    // 1. Initialize Sockets
    socketRef.current = io();
    socketRef.current.emit('join-room', appointmentId, user.id);

    socketRef.current.on('receive-message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    // 2. Initialize Media & Peer
    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        const peer = new Peer(user.id, {
          host: window.location.hostname,
          port: 3000,
          path: '/peerjs'
        });

        peer.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            setPeerStream(remoteStream);
            if (peerVideoRef.current) peerVideoRef.current.srcObject = remoteStream;
          });
        });

        socketRef.current?.on('user-connected', (remoteUserId) => {
          const call = peer.call(remoteUserId, stream);
          call.on('stream', (remoteStream) => {
            setPeerStream(remoteStream);
            if (peerVideoRef.current) peerVideoRef.current.srcObject = remoteStream;
          });
        });

        peerRef.current = peer;
      } catch (err) {
        console.error('Failed to get local stream', err);
      }
    };

    initCall();

    return () => {
      myStream?.getTracks().forEach(t => t.stop());
      socketRef.current?.disconnect();
      peerRef.current?.destroy();
    };
  }, [appointmentId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleMute = () => {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      myStream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', { text: inputText });
    setInputText('');
  };

  const endCall = () => {
    navigate(user?.role === 'patient' ? '/patient' : '/doctor');
  };

  return (
    <div className="h-[calc(100vh-73px)] bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Video Section */}
      <div className="flex-1 relative flex flex-col bg-slate-900">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 relative">
          {/* Peer Video (Main) */}
          <div className="bg-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
            {peerStream ? (
              <video 
                ref={peerVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <User className="w-12 h-12 text-slate-500" />
                </div>
                <p className="text-slate-500 font-medium">Waiting for participant...</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-medium">
              Remote User
            </div>
          </div>

          {/* My Video */}
          <div className="bg-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
            <video 
              ref={myVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
            />
            {isVideoOff && (
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-slate-500" />
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-medium">
              You (Me)
            </div>
          </div>
        </div>

          {/* Controls Overlay */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-2xl lg:hidden transition-all ${showChat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/10 text-white'}`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button 
            onClick={endCall}
            className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/40"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat Section */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-full lg:w-96 bg-white border-l shadow-2xl flex flex-col relative z-20"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-slate-900">
                <MessageSquare className="w-5 h-5 text-primary" />
                Session Chat
              </h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Info className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.senderId === user?.id 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-6 border-t bg-slate-50 flex gap-3">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                type="submit"
                className="btn-geometric-primary p-3 shadow-lg shadow-primary/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
