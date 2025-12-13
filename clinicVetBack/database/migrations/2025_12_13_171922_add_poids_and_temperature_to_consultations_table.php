<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->decimal('poids', 5, 2)->nullable()->after('traitement');
            $table->decimal('temperature', 4, 1)->nullable()->after('poids');
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn(['poids', 'temperature']);
        });
    }
};

