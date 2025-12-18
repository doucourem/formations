<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();

            // Clés étrangères
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('driver_id');

            $table->string('product_name');
            $table->string('product_lot')->nullable();
            $table->decimal('quantity_loaded', 10, 2);
            $table->decimal('quantity_delivered', 10, 2)->default(0);
            $table->decimal('distance_km', 10, 2)->default(0); // distance du trajet
            $table->decimal('price', 12, 2)->default(0);         // prix de la livraison

            $table->dateTime('departure_at');
            $table->dateTime('arrival_at')->nullable();
            $table->enum('status', ['pending', 'in_transit', 'delivered'])->default('pending');

            $table->timestamps();

            // Définir les contraintes étrangères
            $table->foreign('vehicle_id')->references('id')->on('buses')->onDelete('cascade');
            $table->foreign('driver_id')->references('id')->on('drivers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
