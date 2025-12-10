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
    Schema::create('bus_maintenances', function (Blueprint $table) {
        $table->id();
        $table->foreignId('bus_id')->constrained()->cascadeOnDelete();

        $table->date('maintenance_date');       // Date d’intervention
        $table->string('type');                 // Vidange, pneus, freins, moteur, etc.
        $table->integer('cost')->default(0);    // Coût FCFA
        $table->text('notes')->nullable();      // Détails / remarques
        $table->integer('mileage')->nullable(); // Kilométrage
        $table->timestamps();
    });

    Schema::table('buses', function (Blueprint $table) {
    $table->integer('last_maintenance_km')->default(0);
    $table->integer('next_maintenance_km')->default(5000); // plan par défaut
});

}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bus_maintenances', function (Blueprint $table) {
            //
        });
    }
};
