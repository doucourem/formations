<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('transfers', function (Blueprint $table) {
        $table->id();

        $table->foreignId('sender_id')->constrained('senders')->cascadeOnDelete();
        $table->foreignId('receiver_id')->constrained('receivers')->cascadeOnDelete();

        $table->decimal('amount', 10, 2);
        $table->decimal('fees', 10, 2)->default(0);

        $table->string('withdraw_code')->unique();
        $table->enum('status', ['sent', 'withdrawn', 'cancelled'])
              ->default('sent');

        $table->timestamp('withdrawn_at')->nullable();
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
