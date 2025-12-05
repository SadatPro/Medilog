<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'uid', 'name', 'specialization', 'nid', 'email', 'phone', 'password',
        'profile_picture_url', 'date_of_birth'
    ];

    protected $hidden = ['password'];

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function followRequests(): HasMany
    {
        return $this->hasMany(FollowRequest::class);
    }
}


