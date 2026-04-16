/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'patient' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialization?: string;
  availability?: string[];
  online: boolean;
  diseaseTags?: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Message {
  id: string;
  appointmentId: string;
  senderId: string;
  text: string;
  timestamp: string;
}
