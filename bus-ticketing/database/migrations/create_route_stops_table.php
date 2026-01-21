<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('route_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->foreignId('city_id')->constrained('cities')->cascadeOnDelete();
            $table->integer('order')->default(0); // ordre d’arrêt (1er, 2e, etc.)
            $table->decimal('distance_from_start', 8, 2)->nullable(); // km depuis le départ
            $table->decimal('partial_price', 10, 2)->nullable(); // prix jusqu’à cet arrêt
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_stops');
    }
};
