export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum MoodType {
  GREAT = 'GREAT',
  GOOD = 'GOOD',
  NEUTRAL = 'NEUTRAL',
  BAD = 'BAD',
  TERRIBLE = 'TERRIBLE'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  stars?: number; // Only for students
}

export interface MoodLog {
  id: string;
  userId: string;
  mood: MoodType;
  note: string;
  timestamp: Date;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
}

export interface CounselingRequest {
  id: string;
  studentId: string;
  studentName: string;
  type: 'GUIDANCE' | 'PSYCHOLOGIST';
  note: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
  timestamp: Date;
}

export interface DiaryEntry {
  id: string;
  studentId: string;
  content: string;
  aiResponse?: string;
  timestamp: Date;
}

export interface StatData {
  name: string;
  value: number;
}