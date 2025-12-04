<?php

// database/migrations/2025_12_04_000000_create_baggages_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('baggages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->decimal('weight', 8, 2); // poids en kg
            $table->decimal('price', 10, 2);  // prix du bagage
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('baggages');
    }
};

