<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MedilogController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Medilog mock backend endpoints to mirror frontend apiService.ts
Route::prefix('medilog')->group(function () {
    // Auth
    Route::post('/auth/patient/login', [MedilogController::class, 'loginPatient']);
    Route::post('/auth/doctor/login', [MedilogController::class, 'loginDoctor']);

    // Read entities
    Route::get('/patients/by-username/{username}', [MedilogController::class, 'getPatient']);
    Route::get('/doctors/{id}', [MedilogController::class, 'getDoctor']);

    // Mutations
    Route::post('/patients/{patientId}/prescriptions', [MedilogController::class, 'addPrescription']);
    Route::post('/patients/{patientId}/records', [MedilogController::class, 'addMedicalRecord']);
    Route::post('/patients/{patientId}/prescription-records', [MedilogController::class, 'addPrescriptionRecord']);

    Route::patch('/patients/{patientId}', [MedilogController::class, 'updatePatient']);
    Route::patch('/doctors/{doctorId}', [MedilogController::class, 'updateDoctor']);

    // Access control
    Route::post('/access/request', [MedilogController::class, 'requestAccess']);
    Route::post('/access/approve', [MedilogController::class, 'approveAccess']);
    Route::post('/access/decline', [MedilogController::class, 'declineAccess']);

    // Registration and password reset
    Route::post('/doctors', [MedilogController::class, 'registerDoctor']);
    Route::post('/patients', [MedilogController::class, 'registerPatient']);
    Route::post('/password/reset-request', [MedilogController::class, 'requestPasswordReset']);
});
