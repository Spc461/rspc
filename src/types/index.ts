export interface Application {
  id?: string;
  fullName: string;
  age: number;
  phone: string;
  email?: string;
  wilaya: string;
  education: string;
  course: string;
  experience?: string;
  comments?: string;
  registrationType: 'Basic' | 'Full';
  submissionDate: Date;
  paymentMethod?: string;
  agreedToContract?: boolean;
  signature?: string;
  paymentProofUrl?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface CourseOption {
  id: string;
  name: string;
  arabicName: string;
  category: 'professional' | 'language';
}

export interface WilayaOption {
  code: string;
  name: string;
}

export interface Workshop {
  id?: string;
  name: string;
  arabicName: string;
  description: string;
  imageUrl: string;
  date: Date;
  duration: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  createdAt: Date;
}

export interface WorkshopRegistration {
  id?: string;
  workshopId: string;
  fullName: string;
  phone: string;
  email?: string;
  registrationDate: Date;
  status: 'registered' | 'attended' | 'cancelled';
}