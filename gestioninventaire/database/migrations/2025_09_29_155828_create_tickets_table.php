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
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('client_name');     // ✅ ajouté
            $table->string('client_nina')->nullable(); // ✅ ajouté
            $table->string('seat_number', 10)->nullable();
            $table->decimal('price', 10, 2);
            $table->enum('status', ['booked', 'paid', 'cancelled'])->default('booked');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
