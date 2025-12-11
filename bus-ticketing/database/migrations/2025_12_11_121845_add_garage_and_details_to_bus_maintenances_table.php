<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bus_maintenances', function (Blueprint $table) {
            // 🔧 Ajouter la relation Garage
            $table->foreignId('garage_id')->nullable()->constrained('garages')->nullOnDelete()->after('bus_id');

            // 🛠 Nouveaux champs
            $table->integer('labour_cost')->default(0)->after('cost');       // Coût main d’œuvre FCFA
            $table->text('parts')->nullable()->after('labour_cost');         // Pièces changées
            $table->integer('duration_hours')->nullable()->after('parts');   // Durée de maintenance en heures
            $table->string('photo_before')->nullable()->after('duration_hours'); // Photo avant
            $table->string('photo_after')->nullable()->after('photo_before');    // Photo après
        });
    }

    public function down(): void
    {
        Schema::table('bus_maintenances', function (Blueprint $table) {
            $table->dropForeign(['garage_id']);
            $table->dropColumn(['garage_id', 'labour_cost', 'parts', 'duration_hours', 'photo_before', 'photo_after']);
        });
    }
};

