<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->cascadeOnDelete();
            $table->string('client_name');        // obligatoire
            $table->string('client_nina')->nullable(); // facultatif
            $table->string('seat_number')->nullable();
            $table->decimal('price', 10, 2);
            $table->enum('status', ['booked', 'cancelled', 'paid'])->default('booked');
            $table->timestamps();
        });
        
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
