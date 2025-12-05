<?php

namespace App\Services;

class MockDataService
{
    /**
     * Singleton-style in-memory storage to emulate a backend for development.
     */
    private static ?MockDataService $instance = null;

    /** @var array<int, array<string, mixed>> */
    private array $doctors;

    /** @var array<int, array<string, mixed>> */
    private array $patients;

    private function __construct()
    {
        $this->doctors = [
            [
                'id' => 'DOC-101',
                'name' => 'Dr. Arifa Tasnim',
                'specialization' => 'MBBS, FCPS (Medicine)',
                'nid' => '1985123456789',
                'email' => 'arifa.t@medilog.com',
                'phone' => '01712345678',
                'followedPatients' => ['PAT-001'],
                'password' => 'password123',
                'profilePictureUrl' => 'https://i.pravatar.cc/150?img=29',
            ],
        ];

        $this->patients = [
            [
                'id' => 'PAT-001',
                'username' => 'sameera_a',
                'name' => 'Sameera Ahmed',
                'age' => 34,
                'gender' => 'Female',
                'dateOfBirth' => '1990-05-15',
                'nid' => '1990123456789',
                'vitals' => [
                    ['label' => 'Blood Pressure', 'value' => '120/80', 'unit' => 'mmHg', 'date' => '2024-07-21'],
                    ['label' => 'Blood Glucose', 'value' => '5.5', 'unit' => 'mmol/L', 'date' => '2024-07-21'],
                    ['label' => 'Pulse', 'value' => '72', 'unit' => 'bpm', 'date' => '2024-07-21'],
                    ['label' => 'SpO2', 'value' => '98', 'unit' => '%', 'date' => '2024-07-21'],
                ],
                'majorConditions' => ['Diabetes Type 2', 'Hypertension'],
                'bloodGroup' => 'O+',
                'allergies' => 'Pollen, Dust',
                'asthma' => 'No',
                'email' => 'sameera.a@email.com',
                'phone' => '01812345678',
                'password' => 'password123',
                'profilePictureUrl' => 'https://i.pravatar.cc/150?img=32',
                'records' => [
                    ['id' => 'REC-001', 'type' => 'Lab Report', 'name' => 'Complete Blood Count (CBC)', 'date' => '2024-07-15', 'institution' => 'Popular Diagnostic Centre'],
                    ['id' => 'REC-002', 'type' => 'X-ray', 'name' => 'Chest X-ray (PA view)', 'date' => '2024-06-20', 'institution' => 'Dhaka Medical College'],
                    ['id' => 'REC-003', 'type' => 'Other', 'name' => 'ECG Report', 'date' => '2024-05-30', 'institution' => 'National Heart Foundation'],
                ],
                'prescriptionRecords' => [],
                'prescriptions' => [
                    [
                        'id' => 'PRES-001',
                        'date' => '2024-05-15',
                        'doctor' => ['id' => 'DOC-101', 'name' => 'Dr. Arifa Tasnim', 'specialization' => 'MBBS, FCPS (Medicine)'],
                        'items' => [
                            ['id' => 'med-1', 'brandName' => 'Napa', 'genericName' => 'Paracetamol', 'strength' => '500mg', 'dosage' => '1 tablet', 'frequency' => 'Every 6 hours', 'duration' => '3 days', 'notes' => 'Take with food if stomach upset occurs.'],
                            ['id' => 'med-2', 'brandName' => 'Fexo', 'genericName' => 'Fexofenadine', 'strength' => '120mg', 'dosage' => '1 tablet', 'frequency' => 'Once daily', 'duration' => '14 days', 'notes' => 'For seasonal allergies.'],
                        ],
                        'investigations' => ['CBC', 'Serum Creatinine'],
                        'advice' => ['Drink plenty of water', 'Take complete bed rest'],
                        'followUp' => 'After 7 days',
                    ],
                ],
                'followRequests' => [
                    ['doctorId' => 'DOC-102', 'doctorName' => 'Dr. Imtiaz Hossain', 'doctorSpecialization' => 'Cardiologist', 'status' => 'pending'],
                    ['doctorId' => 'DOC-101', 'doctorName' => 'Dr. Arifa Tasnim', 'doctorSpecialization' => 'MBBS, FCPS (Medicine)', 'status' => 'approved'],
                ],
            ],
            [
                'id' => 'PAT-002',
                'username' => 'rahim_s',
                'name' => 'Rahim Sheikh',
                'age' => 52,
                'gender' => 'Male',
                'dateOfBirth' => '1972-03-10',
                'nid' => '1972123456789',
                'vitals' => [
                    ['label' => 'Blood Pressure', 'value' => '140/90', 'unit' => 'mmHg', 'date' => '2024-07-20'],
                ],
                'records' => [],
                'prescriptionRecords' => [],
                'prescriptions' => [],
                'followRequests' => [],
                'phone' => '01309250507',
                'password' => 'password123',
            ],
        ];
    }

    public static function instance(): MockDataService
    {
        if (!self::$instance) {
            self::$instance = new MockDataService();
        }
        return self::$instance;
    }

    public function getDoctorByPhone(string $phone): ?array
    {
        foreach ($this->doctors as $doctor) {
            if ($doctor['phone'] === $phone) {
                return $doctor;
            }
        }
        return null;
    }

    public function getPatientByPhone(string $phone): ?array
    {
        foreach ($this->patients as $patient) {
            if (($patient['phone'] ?? null) === $phone) {
                return $patient;
            }
        }
        return null;
    }

    public function getPatientByUsername(string $username): ?array
    {
        foreach ($this->patients as $patient) {
            if (strtolower($patient['username']) === strtolower($username)) {
                return $patient;
            }
        }
        return null;
    }

    public function getDoctorById(string $id): ?array
    {
        foreach ($this->doctors as $doctor) {
            if ($doctor['id'] === strtoupper($id)) {
                return $doctor;
            }
        }
        return null;
    }

    public function addDoctor(array $data): array
    {
        $new = array_merge(['id' => 'DOC-' . time(), 'followedPatients' => []], $data);
        $this->doctors[] = $new;
        return $new;
    }

    public function addPatient(array $data): array
    {
        $id = 'PAT-' . str_pad((string)random_int(1, 999), 3, '0', STR_PAD_LEFT);
        $defaults = [
            'id' => $id,
            'vitals' => [],
            'records' => [],
            'prescriptionRecords' => [],
            'followRequests' => [],
            'prescriptions' => [],
            'majorConditions' => [],
        ];
        $new = array_merge($defaults, $data);
        $this->patients[] = $new;
        return $new;
    }

    public function updatePatient(string $patientId, array $updates): ?array
    {
        foreach ($this->patients as $index => $patient) {
            if ($patient['id'] === $patientId) {
                $current = $patient;
                $currentPassword = $updates['currentPassword'] ?? null;
                $newPassword = $updates['newPassword'] ?? null;
                unset($updates['currentPassword'], $updates['newPassword']);
                unset($updates['password']);
                $current = array_merge($current, $updates);
                if ($newPassword !== null) {
                    if ($currentPassword === null) {
                        throw new \RuntimeException('Current password is required to set a new password.');
                    }
                    if (($patient['password'] ?? '') !== $currentPassword) {
                        throw new \RuntimeException('Incorrect current password.');
                    }
                    $current['password'] = $newPassword;
                }
                $this->patients[$index] = $current;
                return $current;
            }
        }
        return null;
    }

    public function updateDoctor(string $doctorId, array $updates): ?array
    {
        foreach ($this->doctors as $index => $doctor) {
            if ($doctor['id'] === $doctorId) {
                $current = $doctor;
                $currentPassword = $updates['currentPassword'] ?? null;
                $newPassword = $updates['newPassword'] ?? null;
                unset($updates['currentPassword'], $updates['newPassword']);
                unset($updates['password']);
                $current = array_merge($current, $updates);
                if ($newPassword !== null) {
                    if ($currentPassword === null) {
                        throw new \RuntimeException('Current password is required to set a new password.');
                    }
                    if (($doctor['password'] ?? '') !== $currentPassword) {
                        throw new \RuntimeException('Incorrect current password.');
                    }
                    $current['password'] = $newPassword;
                }
                $this->doctors[$index] = $current;
                return $current;
            }
        }
        return null;
    }

    public function addPrescription(string $patientId, array $data): array
    {
        $patientIndex = $this->findPatientIndex($patientId);
        if ($patientIndex === -1) {
            throw new \RuntimeException('Patient not found');
        }
        $doctor = $this->doctors[0] ?? null;
        if (!$doctor) {
            throw new \RuntimeException('Doctor not found');
        }
        $new = array_merge($data, [
            'id' => 'PRES-' . time(),
            'date' => date(DATE_ATOM),
            'doctor' => [
                'id' => $doctor['id'],
                'name' => $doctor['name'],
                'specialization' => $doctor['specialization'],
            ],
        ]);
        $this->patients[$patientIndex]['prescriptions'] = $this->patients[$patientIndex]['prescriptions'] ?? [];
        array_unshift($this->patients[$patientIndex]['prescriptions'], $new);
        return $new;
    }

    public function addMedicalRecord(string $patientId, array $record): array
    {
        $patientIndex = $this->findPatientIndex($patientId);
        if ($patientIndex === -1) {
            throw new \RuntimeException('Patient not found');
        }
        $new = array_merge($record, ['id' => 'REC-' . time()]);
        array_unshift($this->patients[$patientIndex]['records'], $new);
        return $new;
    }

    public function addPrescriptionRecord(string $patientId, array $record): array
    {
        $patientIndex = $this->findPatientIndex($patientId);
        if ($patientIndex === -1) {
            throw new \RuntimeException('Patient not found');
        }
        $new = array_merge($record, ['id' => 'PR-' . time()]);
        array_unshift($this->patients[$patientIndex]['prescriptionRecords'], $new);
        return $new;
    }

    public function requestAccess(string $doctorId, string $doctorName, string $doctorSpecialization, string $patientId): void
    {
        $patientIndex = $this->findPatientIndex($patientId);
        if ($patientIndex === -1) {
            return;
        }
        $existing = array_values(array_filter(
            $this->patients[$patientIndex]['followRequests'],
            fn ($r) => $r['doctorId'] === $doctorId
        ));
        if (count($existing) === 0) {
            $this->patients[$patientIndex]['followRequests'][] = [
                'doctorId' => $doctorId,
                'doctorName' => $doctorName,
                'doctorSpecialization' => $doctorSpecialization,
                'status' => 'pending',
            ];
        }
    }

    public function approveAccess(string $doctorId, string $patientId): void
    {
        $patientIndex = $this->findPatientIndex($patientId);
        if ($patientIndex === -1) {
            return;
        }
        foreach ($this->doctors as &$doctor) {
            if ($doctor['id'] === $doctorId) {
                if (!in_array($patientId, $doctor['followedPatients'], true)) {
                    $doctor['followedPatients'][] = $patientId;
                }
            }
        }
        foreach ($this->patients[$patientIndex]['followRequests'] as &$req) {
            if ($req['doctorId'] === $doctorId) {
                $req['status'] = 'approved';
            }
        }
    }

    public function declineAccess(string $doctorId, string $patientId): void
    {
        $patientIndex = $this->findPatientIndex($patientId);
        if ($patientIndex === -1) {
            return;
        }
        foreach ($this->patients[$patientIndex]['followRequests'] as &$req) {
            if ($req['doctorId'] === $doctorId) {
                $req['status'] = 'declined';
            }
        }
    }

    public function allState(): array
    {
        return [
            'doctors' => $this->doctors,
            'patients' => $this->patients,
        ];
    }

    private function findPatientIndex(string $patientId): int
    {
        foreach ($this->patients as $index => $patient) {
            if ($patient['id'] === $patientId) {
                return $index;
            }
        }
        return -1;
    }
}


