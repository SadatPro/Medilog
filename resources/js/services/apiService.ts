  import { Doctor, Patient, MedicalRecord, Prescription, PrescriptionRecord, MedicalRecordFile } from '../types';

const API_BASE = '/api/medilog';

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
	const res = await fetch(input, {
		headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
		credentials: 'same-origin',
		...init,
	});
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(msg || res.statusText);
	}
	return res.json() as Promise<T>;
}

export const apiService = {
	loginPatient: async (phone: string, password?: string): Promise<Patient | undefined> => {
		const data = await http<Patient>(`${API_BASE}/auth/patient/login`, {
			method: 'POST',
			body: JSON.stringify({ phone, password }),
		});
		return data;
	},

	loginDoctor: async (phone: string, password?: string): Promise<Doctor | undefined> => {
		const data = await http<Doctor>(`${API_BASE}/auth/doctor/login`, {
			method: 'POST',
			body: JSON.stringify({ phone, password }),
		});
		return data;
	},

	getPatient: async (username: string): Promise<Patient | undefined> => {
		return http<Patient>(`${API_BASE}/patients/by-username/${encodeURIComponent(username)}`);
	},

	getDoctor: async (id: string): Promise<Doctor | undefined> => {
		return http<Doctor>(`${API_BASE}/doctors/${encodeURIComponent(id)}`);
	},

	addPrescription: async (patientId: string, prescriptionData: Omit<Prescription, 'id' | 'date' | 'doctor'>): Promise<Prescription> => {
		return http<Prescription>(`${API_BASE}/patients/${encodeURIComponent(patientId)}/prescriptions`, {
			method: 'POST',
			body: JSON.stringify(prescriptionData),
		});
	},

	addMedicalRecord: async (patientId: string, record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> => {
		return http<MedicalRecord>(`${API_BASE}/patients/${encodeURIComponent(patientId)}/records`, {
			method: 'POST',
			body: JSON.stringify(record),
		});
	},

	addPrescriptionRecord: async (patientId: string, record: Omit<PrescriptionRecord, 'id'>): Promise<PrescriptionRecord> => {
		return http<PrescriptionRecord>(`${API_BASE}/patients/${encodeURIComponent(patientId)}/prescription-records`, {
			method: 'POST',
			body: JSON.stringify(record),
		});
	},

	updatePatientProfile: async (patientId: string, updates: Partial<Patient> & { currentPassword?: string; newPassword?: string }): Promise<Patient> => {
		return http<Patient>(`${API_BASE}/patients/${encodeURIComponent(patientId)}`, {
			method: 'PATCH',
			body: JSON.stringify({
				...updates,
				bloodGroup: updates.bloodGroup,
				majorConditions: updates.majorConditions,
				profilePictureUrl: updates.profilePictureUrl,
			}),
		});
	},

	updateDoctorProfile: async (doctorId: string, newInfo: Partial<Doctor> & { currentPassword?: string; newPassword?: string }): Promise<Doctor> => {
		return http<Doctor>(`${API_BASE}/doctors/${encodeURIComponent(doctorId)}`, {
			method: 'PATCH',
			body: JSON.stringify({
				...newInfo,
				profilePictureUrl: newInfo.profilePictureUrl,
			}),
		});
	},

	requestAccess: async (doctorId: string, doctorName: string, doctorSpecialization: string, patientId: string): Promise<void> => {
		await http(`${API_BASE}/access/request`, {
			method: 'POST',
			body: JSON.stringify({ doctorId, doctorName, doctorSpecialization, patientId }),
		});
	},

	approveAccess: async (doctorId: string, patientId: string): Promise<void> => {
		await http(`${API_BASE}/access/approve`, {
			method: 'POST',
			body: JSON.stringify({ doctorId, patientId }),
		});
	},

	declineAccess: async (doctorId: string, patientId: string): Promise<void> => {
		await http(`${API_BASE}/access/decline`, {
			method: 'POST',
			body: JSON.stringify({ doctorId, patientId }),
		});
	},

	registerDoctor: async (data: { name: string; specialization: string; email: string; phone: string; password: string; dateOfBirth: string; nid: string; profilePictureUrl?: string; }): Promise<Doctor> => {
		return http<Doctor>(`${API_BASE}/doctors`, {
			method: 'POST',
			body: JSON.stringify({
				name: data.name,
				specialization: data.specialization,
				email: data.email,
				phone: data.phone,
				password: data.password,
				dateOfBirth: data.dateOfBirth,
				nid: data.nid,
				profilePictureUrl: data.profilePictureUrl,
			}),
		});
	},

	registerPatient: async (data: { username: string; name: string; age: number; gender: 'Female' | 'Male' | 'Other'; email: string; phone: string; password: string; dateOfBirth: string; nid: string; profilePictureUrl?: string; }): Promise<Patient> => {
		return http<Patient>(`${API_BASE}/patients`, {
			method: 'POST',
			body: JSON.stringify({
				username: data.username,
				name: data.name,
				age: data.age,
				gender: data.gender,
				email: data.email,
				phone: data.phone,
				password: data.password,
				dateOfBirth: data.dateOfBirth,
				nid: data.nid,
				profilePictureUrl: data.profilePictureUrl,
			}),
		});
	},

	requestPasswordReset: async (email: string): Promise<boolean> => {
		const res = await http<{ ok: boolean }>(`${API_BASE}/password/reset-request`, {
			method: 'POST',
			body: JSON.stringify({ email }),
		});
		return !!res.ok;
	}
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string); // Return the full data URL
        reader.onerror = error => reject(error);
    });
};

export const createMedicalRecordFile = async (file: File): Promise<MedicalRecordFile> => {
    const base64WithMime = await fileToBase64(file);
    const base64 = base64WithMime.split(',')[1];
    return { data: base64, mimeType: file.type, name: file.name };
};