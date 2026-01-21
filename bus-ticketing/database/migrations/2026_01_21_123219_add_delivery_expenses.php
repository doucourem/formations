<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_expenses', function (Blueprint $table) {
            $table->id();

            // Clé étrangère vers la livraison
            $table->foreignId('delivery_id')
                  ->constrained('deliveries')
                  ->onDelete('cascade');

            // Type de dépense
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
        Schema::dropIfExists('delivery_expenses');
    }
};
