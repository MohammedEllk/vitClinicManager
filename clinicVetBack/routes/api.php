<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProprietaireController;
use App\Http\Controllers\AnimalController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DocumentController;

/*
|--------------------------------------------------------------------------
| Routes API publiques (login, inscription)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Routes protégées (requiert un token Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Obtenir l'utilisateur connecté
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Déconnexion
    Route::post('/logout', [AuthController::class, 'logout']);

    // CRUD Propriétaires
    Route::apiResource('proprietaires', ProprietaireController::class);

    // Animaux
    Route::apiResource('animaux', AnimalController::class);

    // Consultations
    Route::apiResource('consultations', ConsultationController::class);


    // Documents liés à consultation
    Route::apiResource('consultations.documents', DocumentController::class)->shallow();
});