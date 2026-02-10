<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_rental_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_rental_id')
                  ->constrained('vehicle_rentals')
                  ->onDelete('cascade');

            $table->enum('type', [
                'chauffeur',    // Chauffeur
                'carburant',    // Fuel / Essence
                'peages',       // Toll / Péages
                'restauration', // Meal / Restauration
                'entretien',    // Maintenance / Entretien
                'autres'        // Other / Autres
            ])->comment('Type de dépense : chauffeur, carburant, péages, restauration, entretien, autres');

            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_rental_expenses');
    }
};
