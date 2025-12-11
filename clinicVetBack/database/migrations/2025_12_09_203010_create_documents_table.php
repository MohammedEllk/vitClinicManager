<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
             $table->id();

            // Lien avec la consultation
            $table->foreignId('consultation_id')
                  ->constrained('consultations')
                  ->onDelete('cascade');

            // Infos fichier
            $table->string('nom_original');       // Nom du fichier uploadé
            $table->string('chemin');             // Path (storage/app/..., URL, etc.)
            $table->string('type_mime')->nullable(); // image/png, application/pdf, etc.
            $table->integer('taille')->nullable();   // Taille en bytes

            // Méta
            $table->string('type_document')->nullable(); // ordonnance, radio, analyse, etc.
            $table->text('description')->nullable();


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
