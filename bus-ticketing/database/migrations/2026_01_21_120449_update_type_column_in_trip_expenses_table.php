<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trip_expenses', function (Blueprint $table) {
            // Modifier la colonne `type` pour accepter uniquement les valeurs définies
            $table->enum('type', [
                'chauffeur',
                'fuel',
                'toll',
                'meal',
                'maintenance',
                'other'
            ])->default('other')->comment('Type de dépense : chauffeur, fuel, toll, meal, maintenance, other')->change();
        });
    }

    public function down(): void
    {
        Schema::table('trip_expenses', function (Blueprint $table) {
            // Revenir à une simple string si rollback
            $table->string('type')->change();
        });
    }
};
