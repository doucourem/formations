<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('buses')->onDelete('cascade');
            $table->string('renter_name'); // Nom de la personne/entreprise qui loue
            $table->decimal('rental_price', 12, 2); // prix total ou par jour
            $table->dateTime('rental_start');
            $table->dateTime('rental_end');
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_rentals');
    }
};
