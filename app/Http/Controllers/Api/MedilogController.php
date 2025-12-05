<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\FollowRequest;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MedilogController extends Controller
{
    public function loginPatient(Request $request): JsonResponse
    {
        $phone = (string)$request->input('phone', '');
        $password = (string)$request->input('password', '');
        $patient = Patient::where('phone', $phone)->first();
        if ($patient && Hash::check($password, $patient->password)) {
            return response()->json($this->serializePatient($patient));
        }
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function loginDoctor(Request $request): JsonResponse
    {
        $phone = (string)$request->input('phone', '');
        $password = (string)$request->input('password', '');
        $doctor = Doctor::where('phone', $phone)->first();
        if ($doctor && Hash::check($password, $doctor->password)) {
            return response()->json($this->serializeDoctor($doctor));
        }
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function getPatient(string $username): JsonResponse
    {
        $patient = Patient::where('username', $username)->first();
        if (!$patient) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($this->serializePatient($patient));
    }

    public function getDoctor(string $id): JsonResponse
    {
        $doctor = Doctor::where('uid', strtoupper($id))->first();
        if (!$doctor) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($this->serializeDoctor($doctor));
    }

    public function addPrescription(string $patientId, Request $request): JsonResponse
    {
        $patient = Patient::where('uid', $patientId)->orWhere('id', $patientId)->first();
        $doctor = Doctor::first(); // placeholder; in real use auth
        if (!$patient || !$doctor) {
            return response()->json(['message' => 'Patient or Doctor not found'], 404);
        }
        $data = $request->all();
        $pres = Prescription::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'follow_up' => $data['followUp'] ?? null,
            'investigations' => $data['investigations'] ?? null,
            'advice' => $data['advice'] ?? null,
        ]);
        foreach (($data['items'] ?? []) as $item) {
            PrescriptionItem::create([
                'prescription_id' => $pres->id,
                'brand_name' => $item['brandName'] ?? '',
                'generic_name' => $item['genericName'] ?? '',
                'strength' => $item['strength'] ?? null,
                'dosage' => $item['dosage'] ?? null,
                'frequency' => $item['frequency'] ?? null,
                'duration' => $item['duration'] ?? null,
                'notes' => $item['notes'] ?? null,
            ]);
        }
        $pres->load('items', 'doctor');
        return response()->json([
            'id' => 'PRES-' . $pres->id,
            'date' => $pres->date?->toAtomString() ?? now()->toAtomString(),
            'doctor' => [
                'id' => $doctor->uid,
                'name' => $doctor->name,
                'specialization' => $doctor->specialization,
            ],
            'items' => $pres->items->map(function ($i) {
                return [
                    'id' => 'med-' . $i->id,
                    'brandName' => $i->brand_name,
                    'genericName' => $i->generic_name,
                    'strength' => $i->strength,
                    'dosage' => $i->dosage,
                    'frequency' => $i->frequency,
                    'duration' => $i->duration,
                    'notes' => $i->notes,
                ];
            })->toArray(),
            'investigations' => $pres->investigations ?? [],
            'advice' => $pres->advice ?? [],
            'followUp' => $pres->follow_up,
        ], 201);
    }

    public function addMedicalRecord(string $patientId, Request $request): JsonResponse
    {
        $patient = Patient::where('uid', $patientId)->orWhere('id', $patientId)->first();
        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }
        $record = MedicalRecord::create([
            'patient_id' => $patient->id,
            'type' => $request->input('type'),
            'name' => $request->input('name'),
            'date' => $request->input('date'),
            'institution' => $request->input('institution'),
        ]);
        return response()->json([
            'id' => 'REC-' . $record->id,
            'type' => $record->type,
            'name' => $record->name,
            'date' => optional($record->date)->format('Y-m-d'),
            'institution' => $record->institution,
        ], 201);
    }

    public function addPrescriptionRecord(string $patientId, Request $request): JsonResponse
    {
        $patient = Patient::where('uid', $patientId)->orWhere('id', $patientId)->first();
        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }
        $record = \App\Models\PrescriptionRecord::create([
            'patient_id' => $patient->id,
            'name' => $request->input('name'),
            'date' => $request->input('date'),
        ]);
        return response()->json([
            'id' => 'PR-' . $record->id,
            'name' => $record->name,
            'date' => optional($record->date)->format('Y-m-d'),
        ], 201);
    }

    public function updatePatient(string $patientId, Request $request): JsonResponse
    {
        $patient = Patient::where('uid', $patientId)->orWhere('id', $patientId)->first();
        if (!$patient) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $data = $request->all();
        $currentPassword = $data['currentPassword'] ?? null;
        $newPassword = $data['newPassword'] ?? null;
        unset($data['currentPassword'], $data['newPassword'], $data['password']);
        $patient->fill([
            'name' => $data['name'] ?? $patient->name,
            'email' => $data['email'] ?? $patient->email,
            'phone' => $data['phone'] ?? $patient->phone,
            'profile_picture_url' => $data['profilePictureUrl'] ?? $patient->profile_picture_url,
            'blood_group' => $data['bloodGroup'] ?? $patient->blood_group,
            'allergies' => $data['allergies'] ?? $patient->allergies,
            'asthma' => $data['asthma'] ?? $patient->asthma,
            'major_conditions' => $data['majorConditions'] ?? $patient->major_conditions,
        ])->save();
        if ($newPassword !== null) {
            if (!$currentPassword || !Hash::check($currentPassword, $patient->password)) {
                return response()->json(['message' => 'Incorrect current password.'], 400);
            }
            $patient->update(['password' => Hash::make($newPassword)]);
        }
        return response()->json($this->serializePatient($patient));
    }

    public function updateDoctor(string $doctorId, Request $request): JsonResponse
    {
        $doctor = Doctor::where('uid', $doctorId)->orWhere('id', $doctorId)->first();
        if (!$doctor) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $data = $request->all();
        $currentPassword = $data['currentPassword'] ?? null;
        $newPassword = $data['newPassword'] ?? null;
        unset($data['currentPassword'], $data['newPassword'], $data['password']);
        $doctor->fill([
            'name' => $data['name'] ?? $doctor->name,
            'email' => $data['email'] ?? $doctor->email,
            'phone' => $data['phone'] ?? $doctor->phone,
            'specialization' => $data['specialization'] ?? $doctor->specialization,
            'profile_picture_url' => $data['profilePictureUrl'] ?? $doctor->profile_picture_url,
        ])->save();
        if ($newPassword !== null) {
            if (!$currentPassword || !Hash::check($currentPassword, $doctor->password)) {
                return response()->json(['message' => 'Incorrect current password.'], 400);
            }
            $doctor->update(['password' => Hash::make($newPassword)]);
        }
        return response()->json($this->serializeDoctor($doctor));
    }

    public function requestAccess(Request $request): JsonResponse
    {
        $doctorUid = (string)$request->input('doctorId', '');
        $patientUid = (string)$request->input('patientId', '');
        $doctor = Doctor::where('uid', $doctorUid)->first();
        $patient = Patient::where('uid', $patientUid)->first();
        if (!$doctor || !$patient) {
            return response()->json(['message' => 'Not found'], 404);
        }
        FollowRequest::firstOrCreate(
            ['patient_id' => $patient->id, 'doctor_id' => $doctor->id],
            ['doctor_name' => $doctor->name, 'doctor_specialization' => $doctor->specialization, 'status' => 'pending']
        );
        return response()->json(['ok' => true]);
    }

    public function approveAccess(Request $request): JsonResponse
    {
        $doctorUid = (string)$request->input('doctorId', '');
        $patientUid = (string)$request->input('patientId', '');
        $doctor = Doctor::where('uid', $doctorUid)->first();
        $patient = Patient::where('uid', $patientUid)->first();
        if (!$doctor || !$patient) {
            return response()->json(['message' => 'Not found'], 404);
        }
        FollowRequest::where('patient_id', $patient->id)->where('doctor_id', $doctor->id)->update(['status' => 'approved']);
        return response()->json(['ok' => true]);
    }

    public function declineAccess(Request $request): JsonResponse
    {
        $doctorUid = (string)$request->input('doctorId', '');
        $patientUid = (string)$request->input('patientId', '');
        $doctor = Doctor::where('uid', $doctorUid)->first();
        $patient = Patient::where('uid', $patientUid)->first();
        if (!$doctor || !$patient) {
            return response()->json(['message' => 'Not found'], 404);
        }
        FollowRequest::where('patient_id', $patient->id)->where('doctor_id', $doctor->id)->update(['status' => 'declined']);
        return response()->json(['ok' => true]);
    }

    public function registerDoctor(Request $request): JsonResponse
    {
        $data = $request->only(['name', 'specialization', 'email', 'phone', 'password', 'dateOfBirth', 'nid', 'profilePictureUrl']);
        $uid = 'DOC-' . time();
        $doc = Doctor::create([
            'uid' => $uid,
            'name' => $data['name'],
            'specialization' => $data['specialization'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => Hash::make($data['password']),
            'date_of_birth' => $data['dateOfBirth'] ?? null,
            'nid' => $data['nid'] ?? null,
            'profile_picture_url' => $data['profilePictureUrl'] ?? null,
        ]);
        return response()->json($this->serializeDoctor($doc), 201);
    }

    public function registerPatient(Request $request): JsonResponse
    {
        $data = $request->only(['username', 'name', 'age', 'gender', 'email', 'phone', 'password', 'dateOfBirth', 'nid', 'profilePictureUrl', 'bloodGroup', 'allergies', 'asthma', 'majorConditions']);
        $uid = 'PAT-' . str_pad((string)random_int(1, 999), 3, '0', STR_PAD_LEFT);
        $pat = Patient::create([
            'uid' => $uid,
            'username' => $data['username'],
            'name' => $data['name'],
            'age' => $data['age'] ?? null,
            'gender' => $data['gender'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => Hash::make($data['password']),
            'date_of_birth' => $data['dateOfBirth'] ?? null,
            'nid' => $data['nid'] ?? null,
            'profile_picture_url' => $data['profilePictureUrl'] ?? null,
            'blood_group' => $data['bloodGroup'] ?? null,
            'allergies' => $data['allergies'] ?? null,
            'asthma' => $data['asthma'] ?? null,
            'major_conditions' => $data['majorConditions'] ?? [],
            'vitals' => [],
        ]);
        return response()->json($this->serializePatient($pat), 201);
    }

    public function requestPasswordReset(Request $request): JsonResponse
    {
        $email = (string)$request->input('email', '');
        $exists = Doctor::where('email', $email)->exists() || Patient::where('email', $email)->exists();
        return response()->json(['ok' => $exists]);
    }

    private function serializeDoctor(Doctor $doctor): array
    {
        return [
            'id' => $doctor->uid,
            'name' => $doctor->name,
            'specialization' => $doctor->specialization,
            'nid' => $doctor->nid,
            'email' => $doctor->email,
            'phone' => $doctor->phone,
            'followedPatients' => FollowRequest::where('doctor_id', $doctor->id)->where('status', 'approved')->get()
                ->map(fn ($fr) => optional(Patient::find($fr->patient_id))->uid)->filter()->values()->toArray(),
            'profilePictureUrl' => $doctor->profile_picture_url,
        ];
    }

    private function serializePatient(Patient $patient): array
    {
        $prescriptions = Prescription::with(['items', 'doctor'])->where('patient_id', $patient->id)->orderByDesc('date')->get()->map(function ($p) {
            return [
                'id' => 'PRES-' . $p->id,
                'date' => $p->date?->toDateString(),
                'doctor' => [
                    'id' => $p->doctor?->uid,
                    'name' => $p->doctor?->name,
                    'specialization' => $p->doctor?->specialization,
                ],
                'items' => $p->items->map(fn ($i) => [
                    'id' => 'med-' . $i->id,
                    'brandName' => $i->brand_name,
                    'genericName' => $i->generic_name,
                    'strength' => $i->strength,
                    'dosage' => $i->dosage,
                    'frequency' => $i->frequency,
                    'duration' => $i->duration,
                    'notes' => $i->notes,
                ])->toArray(),
                'investigations' => $p->investigations ?? [],
                'advice' => $p->advice ?? [],
                'followUp' => $p->follow_up,
            ];
        })->toArray();

        $records = $patient->medicalRecords()->orderByDesc('date')->get()->map(fn ($r) => [
            'id' => 'REC-' . $r->id,
            'type' => $r->type,
            'name' => $r->name,
            'date' => optional($r->date)->format('Y-m-d'),
            'institution' => $r->institution,
        ])->toArray();

        $prRecords = $patient->prescriptionRecords()->orderByDesc('date')->get()->map(fn ($r) => [
            'id' => 'PR-' . $r->id,
            'name' => $r->name,
            'date' => optional($r->date)->format('Y-m-d'),
        ])->toArray();

        $followRequests = FollowRequest::where('patient_id', $patient->id)->get()->map(fn ($fr) => [
            'doctorId' => optional(Doctor::find($fr->doctor_id))->uid,
            'doctorName' => $fr->doctor_name,
            'doctorSpecialization' => $fr->doctor_specialization,
            'status' => $fr->status,
        ])->toArray();

        return [
            'id' => $patient->uid,
            'username' => $patient->username,
            'name' => $patient->name,
            'age' => $patient->age,
            'gender' => $patient->gender,
            'dateOfBirth' => optional($patient->date_of_birth)->format('Y-m-d'),
            'nid' => $patient->nid,
            'vitals' => $patient->vitals ?? [],
            'majorConditions' => $patient->major_conditions ?? [],
            'bloodGroup' => $patient->blood_group,
            'allergies' => $patient->allergies,
            'asthma' => $patient->asthma,
            'email' => $patient->email,
            'phone' => $patient->phone,
            'profilePictureUrl' => $patient->profile_picture_url,
            'records' => $records,
            'prescriptionRecords' => $prRecords,
            'prescriptions' => $prescriptions,
            'followRequests' => $followRequests,
        ];
    }
}


