

export interface FollowRequest {
    doctorId: string;
    doctorName: string;
    doctorSpecialization: string;
    status: 'pending' | 'approved' | 'declined';
}
export interface Patient {
  id: string;
  username: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  dateOfBirth?: string;
  nid?: string;
  vitals: Vital[];
  records: MedicalRecord[];
  prescriptionRecords: PrescriptionRecord[];
  prescriptions?: Prescription[];
  followRequests: FollowRequest[];
  bloodGroup?: string;
  allergies?: string;
  asthma?: 'Yes' | 'No';
  phone?: string;
  email?: string;
  password?: string;
  majorConditions?: string[];
  profilePictureUrl?: string;
}
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  dateOfBirth?: string;
  nid?: string;
  followedPatients: string[];
  phone?: string;
  email?: string;
  password?: string;
  profilePictureUrl?: string;
}
export type User = Patient | Doctor;
export interface Medicine {
  brandName: string;
  genericName: string;
  strength: string;
}
export interface DosageSuggestion {
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}
export interface PrescriptionItem extends Medicine {
  id: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  suggestions?: DosageSuggestion;
}
export interface Finding {
    recordId: string;
    recordName: string;
    recordType: 'medical' | 'prescription';
    comment: string;
}
export interface Prescription {
  id: string;
  date: string;
  doctor: Pick<Doctor, 'id' | 'name' | 'specialization'>;
  items: PrescriptionItem[];
  findings?: Finding[];
  investigations?: string[];
  advice?: string[];
  followUp?: string;
}
export type MedicalRecordType = 'X-ray' | 'CT Scan' | 'MRI' | 'Lab Report' | 'Other';
export interface MedicalRecordFile {
    data: string; // base64
    mimeType: string;
    name: string;
}
export interface MedicalRecord {
    id: string;
    type: MedicalRecordType;
    name: string;
    date: string;
    institution?: string;
    file?: MedicalRecordFile;
}
export interface PrescriptionRecord {
    id: string;
    name: string;
    date: string;
    institution?: string;
    file: MedicalRecordFile;
}
export interface Vital {
    label: string;
    value: string;
    unit: string;
    date: string;
}

export type UserType = 'doctor' | 'patient' | null;
export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';