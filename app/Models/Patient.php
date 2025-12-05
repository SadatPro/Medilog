<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'uid', 'username', 'name', 'age', 'gender', 'date_of_birth', 'nid',
        'blood_group', 'allergies', 'asthma', 'email', 'phone', 'password',
        'profile_picture_url', 'vitals', 'major_conditions'
    ];

    protected $casts = [
        'vitals' => 'array',
        'major_conditions' => 'array',
    ];

    protected $hidden = ['password'];

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function prescriptionRecords(): HasMany
    {
        return $this->hasMany(PrescriptionRecord::class);
    }

    public function followRequests(): HasMany
    {
        return $this->hasMany(FollowRequest::class);
    }
}


