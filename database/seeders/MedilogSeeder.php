<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\FollowRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MedilogSeeder extends Seeder
{
    public function run(): void
    {
        $doc = Doctor::create([
            'uid' => 'DOC-101',
            'name' => 'Dr. Arifa Tasnim',
            'specialization' => 'MBBS, FCPS (Medicine)',
            'nid' => '1985123456789',
            'email' => 'arifa.t@medilog.com',
            'phone' => '01712345678',
            'password' => Hash::make('password123'),
            'profile_picture_url' => 'https://i.pravatar.cc/150?img=29',
        ]);

        $pat1 = Patient::create([
            'uid' => 'PAT-001',
            'username' => 'sameera_a',
            'name' => 'Sameera Ahmed',
            'age' => 34,
            'gender' => 'Female',
            'date_of_birth' => '1990-05-15',
            'nid' => '1990123456789',
            'blood_group' => 'O+',
            'allergies' => 'Pollen, Dust',
            'asthma' => 'No',
            'email' => 'sameera.a@email.com',
            'phone' => '01812345678',
            'password' => Hash::make('password123'),
            'profile_picture_url' => 'https://i.pravatar.cc/150?img=32',
            'vitals' => [
                ['label' => 'Blood Pressure', 'value' => '120/80', 'unit' => 'mmHg', 'date' => '2024-07-21'],
                ['label' => 'Blood Glucose', 'value' => '5.5', 'unit' => 'mmol/L', 'date' => '2024-07-21'],
                ['label' => 'Pulse', 'value' => '72', 'unit' => 'bpm', 'date' => '2024-07-21'],
                ['label' => 'SpO2', 'value' => '98', 'unit' => '%', 'date' => '2024-07-21'],
            ],
            'major_conditions' => ['Diabetes Type 2', 'Hypertension'],
        ]);

        MedicalRecord::create([
            'patient_id' => $pat1->id,
            'type' => 'Lab Report',
            'name' => 'Complete Blood Count (CBC)',
            'date' => '2024-07-15',
            'institution' => 'Popular Diagnostic Centre',
        ]);
        MedicalRecord::create([
            'patient_id' => $pat1->id,
            'type' => 'X-ray',
            'name' => 'Chest X-ray (PA view)',
            'date' => '2024-06-20',
            'institution' => 'Dhaka Medical College',
        ]);
        MedicalRecord::create([
            'patient_id' => $pat1->id,
            'type' => 'Other',
            'name' => 'ECG Report',
            'date' => '2024-05-30',
            'institution' => 'National Heart Foundation',
        ]);

        $pres = Prescription::create([
            'patient_id' => $pat1->id,
            'doctor_id' => $doc->id,
            'date' => '2024-05-15 00:00:00',
            'investigations' => ['CBC', 'Serum Creatinine'],
            'advice' => ['Drink plenty of water', 'Take complete bed rest'],
            'follow_up' => 'After 7 days',
        ]);
        PrescriptionItem::create([
            'prescription_id' => $pres->id,
            'brand_name' => 'Napa',
            'generic_name' => 'Paracetamol',
            'strength' => '500mg',
            'dosage' => '1 tablet',
            'frequency' => 'Every 6 hours',
            'duration' => '3 days',
            'notes' => 'Take with food if stomach upset occurs.',
        ]);
        PrescriptionItem::create([
            'prescription_id' => $pres->id,
            'brand_name' => 'Fexo',
            'generic_name' => 'Fexofenadine',
            'strength' => '120mg',
            'dosage' => '1 tablet',
            'frequency' => 'Once daily',
            'duration' => '14 days',
            'notes' => 'For seasonal allergies.',
        ]);

        $pat2 = Patient::create([
            'uid' => 'PAT-002',
            'username' => 'rahim_s',
            'name' => 'Rahim Sheikh',
            'age' => 52,
            'gender' => 'Male',
            'date_of_birth' => '1972-03-10',
            'nid' => '1972123456789',
            'email' => 'rahim@example.com',
            'phone' => '01309250507',
            'password' => Hash::make('password123'),
            'vitals' => [['label' => 'Blood Pressure', 'value' => '140/90', 'unit' => 'mmHg', 'date' => '2024-07-20']],
        ]);

        FollowRequest::create([
            'patient_id' => $pat1->id,
            'doctor_id' => $doc->id,
            'doctor_name' => $doc->name,
            'doctor_specialization' => $doc->specialization,
            'status' => 'approved',
        ]);
    }
}


