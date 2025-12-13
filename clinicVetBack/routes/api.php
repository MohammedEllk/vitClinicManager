<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\VeterinaireController;
use App\Http\Controllers\ProprietaireController;
use App\Http\Controllers\AnimalController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DashboardController;




/*
|--------------------------------------------------------------------------
| Routes API publiques (login, inscription)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']); // optionnel après MVP
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

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY : CRUD vétérinaires (visible seulement par admin)
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->group(function () {
        Route::apiResource('veterinaires', VeterinaireController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | Propriétaires (avec recherche via ?q=nom ou téléphone dans index)
    |--------------------------------------------------------------------------
    */
    Route::apiResource('proprietaires', ProprietaireController::class);
    Route::get('/proprietaires/{proprietaire}/details', [ProprietaireController::class, 'details']);


    /*
    |--------------------------------------------------------------------------
    | Animaux
    |--------------------------------------------------------------------------
    */
    Route::apiResource('animaux', AnimalController::class);

    /*
    |--------------------------------------------------------------------------
    | Consultations
    |--------------------------------------------------------------------------
    */
    Route::apiResource('consultations', ConsultationController::class);

    // Historique consultations d'un animal (MVP)
    Route::get('/animaux/{animal}/consultations', [ConsultationController::class, 'historyByAnimal']);

    /*
    |--------------------------------------------------------------------------
    | Documents médicaux (upload + list + download + delete)
    |--------------------------------------------------------------------------
    */
    // documents liés à une consultation
    Route::get('/consultations/{consultation}/documents', [DocumentController::class, 'index']);
    Route::post('/consultations/{consultation}/documents', [DocumentController::class, 'store']);

    // télécharger / voir un document (download)
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);

    // supprimer document
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/agenda-week', [DashboardController::class, 'agendaWeek']);
});
