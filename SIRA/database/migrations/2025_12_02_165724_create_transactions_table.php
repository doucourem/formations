<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    Schema::create('transactions', function (Blueprint $table) {
        $table->id();

        $table->unsignedBigInteger('transfer_id');
        $table->unsignedBigInteger('user_id')->nullable();

        // IMPORTANT : SQLite ne supporte pas numeric()
        $table->float('amount')->default(0);

        // varchar limité = SQLite-friendly
        $table->string('method', 50)->nullable();

        // SQLite n’aime pas CHECK → on retire
        $table->string('status', 20)->default('success');

        // preuve image
        $table->string('proof')->nullable();

        $table->dateTime('paid_at')->nullable();

        $table->timestamps();

        // 🔹 Foreign keys compatibles SQLite
        $table->foreign('transfer_id')
              ->references('id')
              ->on('transfers')
              ->onDelete('cascade');

        $table->foreign('user_id')
              ->references('id')
              ->on('users')
              ->nullOnDelete();
    });
}


    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

