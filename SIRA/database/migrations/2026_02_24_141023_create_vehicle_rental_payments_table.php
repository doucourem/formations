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
        Schema::create('vehicle_rental_payments', function (Blueprint $table) {
    $table->id();

    // 🔹 Relations
    $table->foreignId('vehicle_rental_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

    // 🔹 Paiement
    $table->decimal('amount', 12, 2);
    $table->string('currency')->default('GNF');
    $table->string('payment_method'); // cash | wave | orange_money | bank
    $table->string('reference')->nullable();

    // 🔹 Statut
    $table->enum('status', ['pending','paid','failed','cancelled'])->default('paid');

    // 🔹 Infos complémentaires
    $table->text('note')->nullable();
    $table->timestamp('paid_at')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_rental_payments');
    }
};
