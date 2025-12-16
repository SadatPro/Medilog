<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Doctor;
use App\Models\Patient;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create test doctor
        Doctor::create([
            'uid' => 'DOC-001',
            'name' => 'Dr. Test Doctor',
            'specialization' => 'General Medicine',
            'email' => 'doctor@test.com',
            'phone' => '01712345678',
            'password' => Hash::make('password123'),
            'date_of_birth' => '1980-01-01',
        ]);

        // Create test patient
        Patient::create([
            'uid' => 'PAT-001',
            'username' => 'testpatient',
            'name' => 'Test Patient',
            'age' => 30,
            'gender' => 'Male',
            'date_of_birth' => '1993-01-01',
            'email' => 'patient@test.com',
            'phone' => '01812345678',
            'password' => Hash::make('password123'),
            'blood_group' => 'A+',
        ]);
    }
}
