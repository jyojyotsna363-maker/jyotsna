import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ExpressPeerServer } from 'peer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Role, Appointment, Message } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

// In-memory "Database"
const users: User[] = [];
const passwords: Record<string, string> = {}; // userId -> hashedPW
const appointments: Appointment[] = [];
const messages: Message[] = [];

// Seed Data
const seedDoctors = [
  { id: 'doc1', name: 'Dr. Sarah Connor', email: 'sarah@health.com', role: 'doctor' as Role, specialization: 'Cardiology', diseaseTags: ['heart', 'chest pain', 'blood pressure'], online: true },
  { id: 'doc2', name: 'Dr. John Doe', email: 'john@health.com', role: 'doctor' as Role, specialization: 'Dermatology', diseaseTags: ['skin', 'rash', 'acne'], online: false },
  { id: 'doc3', name: 'Dr. Emily Blunt', email: 'emily@health.com', role: 'doctor' as Role, specialization: 'General Physician', diseaseTags: ['fever', 'cold', 'flu', 'headache'], online: true },
];

seedDoctors.forEach(doc => {
  users.push(doc);
  passwords[doc.id] = bcrypt.hashSync('password123', 10);
});

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  const peerServer = ExpressPeerServer(httpServer, {
    path: '/peerjs'
  });

  app.use('/peerjs', peerServer);
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = users.find(u => u.id === decoded.id);
      if (!req.user) throw new Error();
      next();
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // --- Auth Routes ---
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, specialization } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'User exists' });
    
    const id = Date.now().toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = { id, name, email, role, specialization, online: false };
    
    users.push(newUser);
    passwords[id] = hashedPassword;
    
    const token = jwt.sign({ id, email, role }, JWT_SECRET);
    res.json({ token, user: newUser });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, passwords[user.id])) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user });
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    res.json({ user: req.user });
  });

  // --- Data Routes ---
  app.get('/api/doctors', (req, res) => {
    res.json(users.filter(u => u.role === 'doctor'));
  });

  app.post('/api/appointments', authenticate, (req: any, res) => {
    const { doctorId, date } = req.body;
    const appointment: Appointment = {
      id: Date.now().toString(),
      patientId: req.user.id,
      doctorId,
      date,
      status: 'pending'
    };
    appointments.push(appointment);
    res.json(appointment);
  });

  app.get('/api/appointments', authenticate, (req: any, res) => {
    const myAppointments = appointments.filter(a => 
      req.user.role === 'patient' ? a.patientId === req.user.id : a.doctorId === req.user.id
    ).map(appt => {
      const otherUser = users.find(u => u.id === (req.user.role === 'patient' ? appt.doctorId : appt.patientId));
      return { ...appt, otherUser };
    });
    res.json(myAppointments);
  });

  // --- Real-time Sockets ---
  io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);
      
      socket.on('send-message', (data) => {
        const message: Message = {
          id: Date.now().toString(),
          appointmentId: roomId,
          senderId: userId,
          text: data.text,
          timestamp: new Date().toISOString()
        };
        messages.push(message);
        io.in(roomId).emit('receive-message', message);
      });

      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
      });
    });
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
